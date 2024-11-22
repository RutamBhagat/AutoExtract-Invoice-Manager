import { GoogleAIFileManager } from "@google/generative-ai/server";
import { type NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import { promises as fs } from "fs";
import path from "path";
import { IncomingMessage } from "http";
import { fileDeleteSchema, fileUploadSchema } from "@/lib/validations/file";
import { z } from "zod";
import { supportedTypes } from "@/lib/types/supported-files";

/**
 * Configuration for the API endpoint.
 * Disables the built-in body parser to handle file uploads with formidable.
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY!);
const uploadDir = path.join(process.cwd(), "public", "uploads");

/**
 * Handles file upload requests.
 *
 * This function parses the incoming multipart form data, validates the uploaded file,
 * saves it to a temporary directory, uploads it to Google AI File Manager,
 * and responds with the upload metadata.
 *
 * @param {NextRequest} request - The incoming HTTP request.
 * @returns {Promise<NextResponse>} - The response containing upload status and metadata.
 */
export async function POST(request: NextRequest) {
  const form = formidable({
    multiples: true,
    maxFileSize: 10 * 1024 * 1024, // Maximum file size: 10MB
    filter: ({ mimetype }) => {
      return mimetype ? Object.keys(supportedTypes).includes(mimetype) : false;
    },
  });

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

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile?.filepath) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validateResult = fileUploadSchema.safeParse({
      file: {
        name: uploadedFile.originalFilename || "",
        type: uploadedFile.mimetype || "",
        size: uploadedFile.size || 0,
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

    const newFileName = `${Date.now()}-${uploadedFile.originalFilename}`;
    const newFilePath = path.join(uploadDir, newFileName);

    await fs.rename(uploadedFile.filepath, newFilePath);

    const uploadResponse = await fileManager.uploadFile(newFilePath, {
      mimeType: uploadedFile.mimetype || "application/octet-stream",
      displayName: uploadedFile.originalFilename || "unknown",
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
