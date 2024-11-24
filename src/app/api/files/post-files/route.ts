import { GoogleAIFileManager } from "@google/generative-ai/server";
import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { consola } from "consola";
import { fileUploadApiSchema } from "@/lib/validations/file";
import { env } from "@/env";

/**
 * Custom error class for file upload errors
 */
class FileUploadError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
    public status?: number,
  ) {
    super(message);
    this.name = "FileUploadError";
  }
}

/**
 * Creates a standardized error response
 */
function createErrorResponse(
  message: string,
  status: number = 500,
): NextResponse {
  consola.error(`File upload error: ${message}`);
  return NextResponse.json(
    {
      error: message,
    },
    { status },
  );
}

/**
 * Handles file upload requests.
 *
 * Processes FormData, validates the uploaded file, saves it temporarily,
 * uploads it to Google AI File Manager, and responds with the metadata.
 *
 * @param {NextRequest} request - The incoming HTTP request.
 * @returns {Promise<NextResponse>} - Response with upload status and metadata.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  consola.info(`Processing file upload request ${requestId}`);

  const uploadDir = "/tmp"; // Temporary directory for Vercel compatibility
  let fileManager: GoogleAIFileManager;

  try {
    fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY);
  } catch (error) {
    consola.error("Failed to initialize GoogleAIFileManager:", error);
    return createErrorResponse("Failed to initialize file manager");
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      consola.warn(`No file provided in request ${requestId}`);
      return createErrorResponse("No file uploaded", 400);
    }

    const validateResult = fileUploadApiSchema.safeParse({
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
    });

    if (!validateResult.success) {
      const validationError =
        validateResult.error.errors[0]?.message || "Invalid file format";
      consola.warn(
        `Validation failed for request ${requestId}: ${validationError}`,
      );
      return createErrorResponse(validationError, 400);
    }

    // Ensure the temporary directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const newFileName = `${Date.now()}-${file.name}`;
    const newFilePath = path.join(uploadDir, newFileName);

    // Convert File to Buffer and save it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(newFilePath, buffer);

    try {
      const uploadResponse = await fileManager.uploadFile(newFilePath, {
        mimeType: file.type || "application/octet-stream",
        displayName: file.name,
      });

      // Clean up the temporary file
      await fs.unlink(newFilePath);

      consola.success(`File uploaded successfully in request ${requestId}`);
      return NextResponse.json({
        message: "File uploaded successfully",
        fileUri: uploadResponse.file.uri,
        displayName: uploadResponse.file.displayName,
        mimeType: file.type,
      });
    } catch (error: any) {
      consola.error(
        `Failed to upload file to Google AI in request ${requestId}:`,
        error,
      );
      throw new FileUploadError("Failed to upload file to Google AI", error);
    }
  } catch (error: any) {
    if (error instanceof FileUploadError) {
      consola.error(`File upload error in request ${requestId}:`, {
        message: error.message,
        cause: error.cause,
      });
      return createErrorResponse(error.message, error.status || 500);
    }

    consola.error(
      `Unexpected error in file upload request ${requestId}:`,
      error,
    );
    return createErrorResponse(
      "An unexpected error occurred while processing the file upload",
      500,
    );
  }
}
