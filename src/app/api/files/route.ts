import { GoogleAIFileManager } from "@google/generative-ai/server";
import { type NextRequest, NextResponse } from "next/server";
import formidable, { File } from "formidable";
import { promises as fs } from "fs";
import path from "path";
import { IncomingMessage } from "http";
import { fileDeleteSchema } from "@/lib/validations/file";
import { z } from "zod";

export const config = {
  api: {
    bodyParser: false,
  },
};

const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY!);

export default async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 },
    );
  }

  const form = formidable({ multiples: true });
  let fields: formidable.Fields;
  let files: formidable.Files;

  try {
    // Parse the incoming form data
    [fields, files] = await new Promise((resolve, reject) => {
      form.parse(
        req.body as unknown as IncomingMessage,
        (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        },
      );
    });

    console.log("files:", files);
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    console.log("imageFile:", imageFile);

    if (!imageFile || !imageFile.filepath) {
      return NextResponse.json(
        { message: "No image file uploaded" },
        { status: 400 },
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Create the upload directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const newFileName = `${uniqueSuffix}-${imageFile.originalFilename}`;
    const newFilePath = path.join(uploadDir, newFileName);

    // Move the uploaded file to the target directory
    await fs.rename(imageFile.filepath, newFilePath);

    console.log("Uploaded image:", newFilePath);

    // Upload to Google AI
    const uploadResponse = await fileManager.uploadFile(newFilePath, {
      mimeType: imageFile.mimetype || "application/octet-stream",
      displayName: imageFile.originalFilename || "unknown",
    });

    // Delete the file after upload
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
