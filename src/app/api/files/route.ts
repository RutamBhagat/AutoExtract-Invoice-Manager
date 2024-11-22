import { GoogleAIFileManager } from "@google/generative-ai/server";
import { type NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import { promises as fs } from "fs";
import path from "path";
import { IncomingMessage } from "http";
import { fileDeleteSchema } from "@/lib/validations/file";
import { z } from "zod";

/**
 * Handles file uploads, saves them temporarily, and uploads to Google AI
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY!);
const uploadDir = path.join(process.cwd(), "public", "uploads");

export default async function POST(request: NextRequest) {
  const form = formidable({ multiples: true });

  try {
    const [fields, files] = await new Promise<
      [formidable.Fields, formidable.Files]
    >((resolve, reject) => {
      form.parse(
        request as unknown as IncomingMessage,
        (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        },
      );
    });

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!imageFile?.filepath) {
      return NextResponse.json(
        { message: "No image file uploaded" },
        { status: 400 },
      );
    }

    await fs.mkdir(uploadDir, { recursive: true });

    const newFileName = `${Date.now()}-${imageFile.originalFilename}`;
    const newFilePath = path.join(uploadDir, newFileName);

    await fs.rename(imageFile.filepath, newFilePath);

    const uploadResponse = await fileManager.uploadFile(newFilePath, {
      mimeType: imageFile.mimetype || "application/octet-stream",
      displayName: imageFile.originalFilename || "unknown",
    });

    await fs.unlink(newFilePath);

    return NextResponse.json({
      message: "Image uploaded successfully",
      fileUri: uploadResponse.file.uri,
      displayName: uploadResponse.file.displayName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Failed to upload image" },
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

    const files = listFilesResponse.files.map((file) => ({
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
