import { GoogleAIFileManager } from "@google/generative-ai/server";
import { type NextRequest, NextResponse } from "next/server";
import { fileDeleteSchema, fileUploadSchema } from "@/lib/validations/file";
import { z } from "zod";

/**
 * Configuration for the API route.
 * Specifies that the body should not be parsed automatically.
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Initializes a new GoogleAIFileManager with the API key from environment variables.
 */
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY!);

/**
 * Handles POST requests to upload a file.
 * Validates the file, converts it to base64, and uploads it using GoogleAIFileManager.
 *
 * @param request - The incoming NextRequest object containing the file to upload.
 * @returns A NextResponse with the file URI and display name if successful, or an error message.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = fileUploadSchema.safeParse({ file });
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;
    const base64String = buffer.toString("base64");

    const uploadResponse = await fileManager.uploadFile(base64String, {
      mimeType,
      displayName: file.name,
    });

    return NextResponse.json({
      fileUri: uploadResponse.file.uri,
      displayName: uploadResponse.file.displayName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

/**
 * Handles DELETE requests to delete a file.
 * Validates the request body and deletes the file using GoogleAIFileManager.
 *
 * @param request - The incoming Request object containing the file URI to delete.
 * @returns A NextResponse indicating success or an error message.
 */
export async function DELETE(request: Request): Promise<NextResponse> {
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

/**
 * Handles GET requests to list all uploaded files.
 * Returns a list of files with their names, URIs, and display names.
 *
 * @returns A NextResponse containing the list of files or an error message.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const listFilesResponse = await fileManager.listFiles();

    const files = listFilesResponse.files.map(file => ({
      name: file.name,
      uri: file.uri,
      displayName: file.displayName,
      mimeType: file.mimeType,
      createTime: file.createTime,
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("List files error:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 },
    );
  }
}
