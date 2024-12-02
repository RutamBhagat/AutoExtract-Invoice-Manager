import { consola } from "consola";
import { promises as fs } from "fs";
import { type NextRequest, NextResponse } from "next/server";
import {
  cleanupFile,
  createErrorResponse,
  FileOperationError,
  UploadResult,
} from "@/lib/files/utils";
import { UPLOAD_DIR } from "@/lib/files/consts";
import { initializeFileManager } from "@/lib/files/google-file-manager";
import { validateAndProcessFile } from "@/lib/files/validate-and-process-file";

/**
 * Handles POST requests for file uploads
 * Processes files, validates them, and uploads to Google AI
 * Includes performance monitoring and cleanup
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  consola.info(`Starting file upload request ${requestId}`);

  let processedFile: UploadResult | null = null;

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const fileManager = await initializeFileManager();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new FileOperationError("No file uploaded", null, 400, "NO_FILE");
    }

    processedFile = await validateAndProcessFile(file);

    const uploadResponse = await fileManager.uploadFile(
      processedFile.filePath,
      {
        mimeType: processedFile.mimeType,
        displayName: processedFile.fileName,
      },
    );

    consola.success(`File upload successful for request ${requestId}`);

    return NextResponse.json({
      message: "File uploaded successfully",
      fileUri: uploadResponse.file.uri,
      displayName: uploadResponse.file.displayName,
      mimeType: uploadResponse.file.mimeType,
      requestId,
    });
  } catch (error) {
    const fileError =
      error instanceof FileOperationError
        ? error
        : new FileOperationError(
            "Failed to upload file to Google AI",
            error,
            500,
            "UPLOAD_FAILED",
          );

    return createErrorResponse(fileError);
  } finally {
    if (processedFile?.filePath) {
      await cleanupFile(processedFile.filePath);
    }
  }
}
