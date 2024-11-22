import { GoogleAIFileManager } from "@google/generative-ai/server";
import { type NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import { promises as fs } from "fs";
import path from "path";
import { IncomingMessage } from "http";
import { fileDeleteSchema, fileUploadSchema } from "@/lib/validations/file";
import { z } from "zod";
import { supportedTypes } from "@/lib/types/supported-files";
import { env } from "@/env";

/**
 * Configuration for the API endpoint.
 * Disables the built-in body parser to handle file uploads with formidable.
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

const fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY);
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
