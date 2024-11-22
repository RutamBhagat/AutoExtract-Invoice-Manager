import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import {
  generateContentSchema,
  combinedZodSchema,
  combinedGeminiSchema,
} from "@/lib/validations/pdf-generate";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/**
 * Handles POST requests to process files and generate structured content.
 * @param request - The incoming HTTP request.
 * @returns A JSON response with structured content or an error message.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const result = generateContentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message },
        { status: 400 },
      );
    }

    const { files, prompt } = result.data;

    const model = genAI.getGenerativeModel({
      model: env.MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: combinedGeminiSchema,
      },
    });

    const fileParts: Part[] = files.map((file) => ({
      fileData: { mimeType: file.mimeType, fileUri: file.fileUri },
    }));

    const generateContentResult = await model.generateContent([
      { text: prompt },
      ...fileParts,
    ]);

    const responseText = generateContentResult.response.text();
    try {
      const responseJson = JSON.parse(responseText);

      const validationResult = combinedZodSchema.safeParse(responseJson);
      if (!validationResult.success) {
        console.log(validationResult.error);
        return NextResponse.json(
          { error: validationResult.error },
          { status: 400 },
        );
      }

      return NextResponse.json({ result: validationResult.data });
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON response from Gemini" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Generate content error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 },
    );
  }
}
