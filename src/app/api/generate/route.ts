import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const generateContentSchema = z.object({
  fileUri: z.string().url(),
  mimeType: z.string(),
  prompt: z.string().min(1),
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * Handles POST requests to generate content based on a file URI and prompt.
 *
 * @param request - The incoming NextRequest object containing the file URI,
 * MIME type, and prompt.
 * @returns A NextResponse with the generated content if successful, or an
 * error message.
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

    const { fileUri, mimeType, prompt } = result.data;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const generateContentResult = await model.generateContent([
      {
        fileData: {
          mimeType,
          fileUri,
        },
      },
      { text: prompt },
    ]);

    const responseText = generateContentResult.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message },
        { status: 400 },
      );
    }

    console.error("Generate content error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 },
    );
  }
}