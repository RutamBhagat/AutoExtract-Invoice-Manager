import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { consola } from "consola";
import { env } from "@/env";
import {
  generateContentSchema,
  combinedZodSchema,
  combinedGeminiSchema,
} from "@/lib/validations/pdf-generate";

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

/**
 * Handles POST requests to process files and generate structured content.
 * @param request - The incoming HTTP request.
 * @returns A JSON response with structured content or an error message.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  consola.info(`Processing content generation request ${requestId}`);

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

  try {
    // Parse and validate the request body
    const body: unknown = await request.json();
    const validation = generateContentSchema.safeParse(body);

    if (!validation.success) {
      const validationError =
        validation.error.errors[0]?.message || "Invalid request format";
      consola.warn(
        `Validation failed for request ${requestId}: ${validationError}`,
      );
      return createErrorResponse(validationError, 400);
    }

    const { files, prompt } = validation.data;

    const fileParts: Part[] = files.map((file) => {
      // Validate each file before processing
      if (!file.fileUri || !file.fileUri.startsWith("https://")) {
        throw new ContentGenerationError("Invalid file URI format", null, 400);
      }

      // Validate MIME type
      if (
        !file.mimeType ||
        !file.mimeType.match(/^application\/pdf$|^image\/(jpeg|jpg|png)$/)
      ) {
        consola.log(`Unsupported MIME type: ${file.mimeType}`);
        throw new ContentGenerationError("Unsupported MIME type", null, 400);
      }

      return {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.fileUri,
        },
      };
    });

    // Use a more specific model configuration
    const model = genAI.getGenerativeModel({
      model: env.MODEL_NAME,
      generationConfig: {
        temperature: 0.7,
        topP: 1,
        topK: 32,
        maxOutputTokens: 2048,
      },
    });

    try {
      // Generate content with explicit JSON formatting instruction
      const generateContentResult = await model.generateContent([
        {
          text: prompt,
        },
        ...fileParts,
      ]);

      // Get response as structured data
      const response = generateContentResult.response.text();
      consola.debug(`Raw Gemini response for ${requestId}:`, response);

      try {
        // Attempt to parse and validate JSON
        const responseJson = JSON.parse(response.trim());
        const validationResult = combinedZodSchema.safeParse(responseJson);

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

        consola.success(`Content generated successfully for ${requestId}`);
        return NextResponse.json({ result: validationResult.data });
      } catch (jsonError) {
        consola.error(`JSON parsing failed for ${requestId}:`, {
          error: jsonError,
          response,
        });
        throw new ContentGenerationError(
          "Failed to parse Gemini response as JSON",
          jsonError,
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
