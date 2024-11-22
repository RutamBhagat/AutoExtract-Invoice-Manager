import { GoogleAIFileManager } from "@google/generative-ai/server";
import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { fileUploadApiSchema } from "@/lib/validations/file";
import { env } from "@/env";

/**
 * Handles file upload requests.
 *
 * This function processes the incoming FormData, validates the uploaded file,
 * saves it to a temporary directory, uploads it to Google AI File Manager,
 * and responds with the upload metadata.
 *
 * @param {NextRequest} request - The incoming HTTP request.
 * @returns {Promise<NextResponse>} - The response containing upload status and metadata.
 */
export async function POST(request: NextRequest) {
  const fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY);
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validateResult = fileUploadApiSchema.safeParse({
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
    });

    if (!validateResult.success) {
      return NextResponse.json(
        {
          error:
            validateResult.error.errors[0]?.message ?? "Invalid file format",
        },
        { status: 400 },
      );
    }

    await fs.mkdir(uploadDir, { recursive: true });

    const newFileName = `${Date.now()}-${file.name}`;
    const newFilePath = path.join(uploadDir, newFileName);

    // Convert File to Buffer and save it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(newFilePath, buffer);

    const uploadResponse = await fileManager.uploadFile(newFilePath, {
      mimeType: file.type || "application/octet-stream",
      displayName: file.name,
    });

    await fs.unlink(newFilePath);

    return NextResponse.json({
      message: "File uploaded successfully",
      fileUri: uploadResponse.file.uri,
      displayName: uploadResponse.file.displayName,
    });
  } catch (error) {
    console.error("Upload error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload file";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
