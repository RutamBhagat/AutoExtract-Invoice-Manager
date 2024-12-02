import { FileOperationError, createErrorResponse } from "@/lib/files/utils";

import { NextResponse } from "next/server";
import { consola } from "consola";
import { fileDeleteSchema } from "@/lib/validations/file";
import { initializeFileManager } from "@/lib/files/google-file-manager";
import { z } from "zod";

/**
 * Handles DELETE requests to delete a file.
 */
export async function DELETE(request: Request): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  consola.info(`Processing delete request ${requestId}`);

  const fileManager = await initializeFileManager();

  try {
    const body = await request.json();

    const result = fileDeleteSchema.safeParse(body);
    if (!result.success) {
      const validationError =
        result.error.errors[0]?.message || "Invalid request data";
      consola.warn(
        `Validation failed for request ${requestId}: ${validationError}`,
      );
      return createErrorResponse(
        new FileOperationError(validationError, null, 400),
      );
    }

    const { fileUri } = result.data;

    consola.info(`Attempting to delete file: ${fileUri}`);

    try {
      const files = await fileManager.listFiles();
      const fileToDelete = files.files.find((file) => file.uri === fileUri);

      if (!fileToDelete) {
        consola.warn(`File not found: ${fileUri}`);
        return createErrorResponse(
          new FileOperationError("File not found", null, 404),
        );
      }

      try {
        await fileManager.deleteFile(fileToDelete.name); // Use name instead of URI
        consola.success(`Successfully deleted file: ${fileUri}`);

        return NextResponse.json({
          success: true,
          message: "File deleted successfully",
          fileUri,
        });
      } catch (error: any) {
        // Check if error is a 404
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
  } catch (error) {
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
}
