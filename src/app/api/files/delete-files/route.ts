import { FileOperationError, createErrorResponse } from "@/lib/files/utils";

import { NextResponse } from "next/server";
import { consola } from "consola";
import { fileDeleteSchema } from "@/lib/validations/file";
import { initializeFileManager } from "@/lib/files/google-file-manager";
import { z } from "zod";

/**
 * Handles errors from various sources and creates a standardized error response
 * @param error - The error object to handle
 * @param requestId - The ID of the current request for logging purposes
 */
function handleError(error: any, requestId: string): NextResponse {
  if (error instanceof z.ZodError) {
    const validationError = error.errors[0]?.message || "Validation failed";
    consola.warn(`Validation error in request ${requestId}:`, error);
    return createErrorResponse(
      new FileOperationError(validationError, error, 400),
    );
  }

  if (error instanceof FileOperationError) {
    return createErrorResponse(error);
  }

  return createErrorResponse(
    new FileOperationError(
      "An unexpected error occurred while processing your request",
      error,
    ),
  );
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  consola.info(`Processing delete request ${requestId}`);

  try {
    const fileManager = await initializeFileManager();
    const body = await request.json();

    const result = fileDeleteSchema.safeParse(body);
    if (!result.success) {
      return handleError(new z.ZodError(result.error.errors), requestId);
    }

    const { fileUri } = result.data;
    consola.info(`Attempting to delete file: ${fileUri}`);

    /**
     * File deletion process:
     * 1. List all files to find the target file
     * 2. Find the file by URI to get its name
     * 3. Delete the file using its name
     */
    const files = await fileManager.listFiles();
    const fileToDelete = files.files.find((file) => file.uri === fileUri);

    if (!fileToDelete) {
      return createErrorResponse(
        new FileOperationError("File not found", null, 404),
      );
    }

    try {
      await fileManager.deleteFile(fileToDelete.name);
      consola.success(`Successfully deleted file: ${fileUri}`);

      return NextResponse.json({
        success: true,
        message: "File deleted successfully",
        fileUri,
      });
    } catch (error: any) {
      if (error?.status === 404 || error?.statusText === "Not Found") {
        return createErrorResponse(
          new FileOperationError("File not found", error, 404),
        );
      }
      throw new FileOperationError(
        "Failed to delete file from Google AI service",
        error,
      );
    }
  } catch (error) {
    return handleError(error, requestId);
  }
}
