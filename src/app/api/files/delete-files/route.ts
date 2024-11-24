import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextResponse } from "next/server";
import { consola } from "consola";
import { env } from "@/env";
import { fileDeleteSchema } from "@/lib/validations/file";
import { z } from "zod";

// Custom error class for file deletion errors
class FileDeletionError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
    public status?: number,
  ) {
    super(message);
    this.name = "FileDeletionError";
  }
}

/**
 * Creates a standardized error response
 */
function createErrorResponse(
  message: string,
  status: number = 500,
  fileNotFound: boolean = false,
) {
  consola.error(`File deletion error: ${message}`);
  return NextResponse.json(
    {
      error: message,
      fileNotFound, // Include flag to indicate if file was not found
    },
    { status },
  );
}

/**
 * Safely parses JSON from the request body
 */
async function parseRequestBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch (error) {
    consola.error("Failed to parse request body:", error);
    throw new FileDeletionError("Invalid JSON in request body", error, 400);
  }
}

/**
 * Handles DELETE requests to delete a file.
 */
export async function DELETE(request: Request): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  consola.info(`Processing delete request ${requestId}`);

  let fileManager: GoogleAIFileManager;

  try {
    fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY);
  } catch (error) {
    consola.error("Failed to initialize GoogleAIFileManager:", error);
    return createErrorResponse("Failed to initialize file manager");
  }

  try {
    const body = await parseRequestBody(request);

    const result = fileDeleteSchema.safeParse(body);
    if (!result.success) {
      const validationError =
        result.error.errors[0]?.message || "Invalid request data";
      consola.warn(
        `Validation failed for request ${requestId}: ${validationError}`,
      );
      return createErrorResponse(validationError, 400);
    }

    const { fileUri } = result.data;

    consola.info(`Attempting to delete file: ${fileUri}`);

    try {
      await fileManager.deleteFile(fileUri);
      consola.success(`Successfully deleted file: ${fileUri}`);

      return NextResponse.json({
        success: true,
        message: "File deleted successfully",
        fileUri,
      });
    } catch (error: any) {
      // Check if error is a 404
      if (error?.status === 404 || error?.statusText === "Not Found") {
        consola.warn(`File not found: ${fileUri}`);
        return createErrorResponse("File not found", 404, true);
      }

      throw new FileDeletionError(
        "Failed to delete file from Google AI service",
        error,
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = error.errors[0]?.message || "Validation failed";
      consola.warn(`Validation error in request ${requestId}:`, error);
      return createErrorResponse(validationError, 400);
    }

    if (error instanceof FileDeletionError) {
      consola.error(`File deletion error in request ${requestId}:`, {
        message: error.message,
        cause: error.cause,
      });
      return createErrorResponse(error.message, error.status || 500);
    }

    consola.error(`Unexpected error in request ${requestId}:`, error);
    return createErrorResponse(
      "An unexpected error occurred while processing your request",
    );
  }
}
