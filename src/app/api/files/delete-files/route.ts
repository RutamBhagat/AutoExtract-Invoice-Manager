import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { fileDeleteSchema } from "@/lib/validations/file";
import { z } from "zod";


/**
 * Handles DELETE requests to delete a file.
 * Validates the request body and deletes the file using GoogleAIFileManager.
*
* @param request - The incoming Request object containing the file URI to delete.
* @returns A NextResponse indicating success or an error message.
*/
export async function DELETE(request: Request): Promise<NextResponse> {
  const fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY);
  
  try {
    const body: unknown = await request.json();

    const result = fileDeleteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message },
        { status: 400 },
      );
    }

    const { fileUri } = result.data;
    await fileManager.deleteFile(fileUri);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
