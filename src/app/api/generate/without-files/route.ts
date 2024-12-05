import path from "path";
import { env } from "@/env";
import { consola } from "consola";
import { mkdir } from "fs/promises";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { GEMINI_PROMPTS } from "@/lib/constants/prompts_and_schema";
import { z } from "zod";

/**
 * Custom error class for content generation errors
 */
class ContentGenerationError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
    public status?: number,
  ) {
    super(message);
    this.name = "ContentGenerationError";
  }
}

/**
 * Creates a standardized error response
 */
function createErrorResponse(
  message: string,
  status: number = 500,
): NextResponse {
  consola.error(`Content generation error: ${message}`);
  return NextResponse.json(
    {
      error: message,
    },
    { status },
  );
}

const textInputSchema = z.object({
  extractedData: z.string().min(1, "Extracted data cannot be empty"),
  prompt: z.enum(["CLASSIFY"]),
});

/**
 * Handles POST requests to generate structured content from text.
 * @param request - The incoming HTTP request.
 * @returns A JSON response with structured content or an error message.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  consola.info(`Processing content generation request ${requestId}`);

  const UPLOAD_DIR = "/tmp";

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    consola.error(`Failed to create upload directory: ${error}`);
    return createErrorResponse("Failed to initialize storage", 500);
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

  try {
    const body: unknown = await request.json();
    const validation = textInputSchema.safeParse(body);

    if (!validation.success) {
      const validationError =
        validation.error.errors[0]?.message || "Invalid request format";
      consola.warn(
        `Validation failed for request ${requestId}: ${validationError}`,
      );
      return createErrorResponse(validationError, 400);
    }

    const { extractedData, prompt } = validation.data;
    const combinedText = `${extractedData}\n\n${GEMINI_PROMPTS[prompt].prompt}`;
    consola.info(`Combined Text: ${combinedText}`);

    const model = genAI.getGenerativeModel({
      model: env.MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: GEMINI_PROMPTS[prompt].gemini_schema,
      },
    });

    try {
      const generateContentResult = await model.generateContent(combinedText);

      const response = generateContentResult.response.text();

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `response-${requestId}-${timestamp}.json`;
      const filepath = path.join(UPLOAD_DIR, filename);

      try {
        const responseJson = JSON.parse(response.trim());
        const validationResult =
          GEMINI_PROMPTS[prompt].zod_schema.safeParse(responseJson);

        if (!validationResult.success) {
          consola.warn(
            `Schema validation failed for ${requestId}:`,
            validationResult.error,
          );
          return createErrorResponse(
            "Response did not match expected schema",
            400,
          );
        }

        consola.success(`Content generated and saved to ${filepath}`);
        return NextResponse.json({
          result: validationResult.data,
          savedTo: `/uploads/${filename}`,
        });
      } catch (jsonError) {
        throw new ContentGenerationError(
          "Response exceeded Gemini's token limit or is not valid JSON. Please try again.",
          jsonError,
          413,
        );
      }
    } catch (generationError) {
      consola.error(
        `Error during content generation in request ${requestId}:`,
        generationError,
      );
      throw new ContentGenerationError(
        "Failed to generate content with Gemini",
        generationError,
      );
    }
  } catch (error: any) {
    if (error instanceof ContentGenerationError) {
      consola.error(`Content generation error in request ${requestId}:`, {
        message: error.message,
        cause: error.cause,
      });
      return createErrorResponse(error.message, error.status || 500);
    }

    consola.error(`Unexpected error in request ${requestId}:`, error);
    return createErrorResponse(
      "An unexpected error occurred while generating content",
      500,
    );
  }
}
