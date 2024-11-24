import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextResponse } from "next/server";
import { consola } from "consola";
import { env } from "@/env";

/**
 * Custom error class for file listing errors
 */
class FileListingError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
    public status?: number,
  ) {
    super(message);
    this.name = "FileListingError";
  }
}

/**
 * Creates a standardized error response
 */
function createErrorResponse(
  message: string,
  status: number = 500,
): NextResponse {
  consola.error(`File listing error: ${message}`);
  return NextResponse.json(
    {
      error: message,
    },
    { status },
  );
}

/**
 * Handles GET requests to list all uploaded files.
 * Returns a list of files with their names, URIs, and display names.
 *
 * @returns A NextResponse containing the list of files or an error message.
 */
export async function GET(): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  consola.info(`Processing list files request ${requestId}`);

  let fileManager: GoogleAIFileManager;

  try {
    fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY);
  } catch (error) {
    consola.error("Failed to initialize GoogleAIFileManager:", error);
    return createErrorResponse("Failed to initialize file manager");
  }

  try {
    const listFilesResponse = await fileManager.listFiles();

    if (!listFilesResponse?.files || !Array.isArray(listFilesResponse.files)) {
      consola.warn(
        `Invalid response structure in list files request ${requestId}`,
      );
      return NextResponse.json({ files: [] });
    }

    consola.info(
      `Successfully retrieved ${listFilesResponse.files.length} files in request ${requestId}`,
    );
    return NextResponse.json({ files: listFilesResponse.files });
  } catch (error: any) {
    // Handle specific API error statuses if available
    if (error?.status === 403 || error?.statusText === "Forbidden") {
      consola.warn(
        `Permission denied in list files request ${requestId}:`,
        error,
      );
      return createErrorResponse(
        "Access denied. Please check your API key and permissions.",
        403,
      );
    }

    if (error?.status === 401 || error?.statusText === "Unauthorized") {
      consola.warn(`Unauthorized access in request ${requestId}:`, error);
      return createErrorResponse(
        "Unauthorized. Please check your API key.",
        401,
      );
    }

    consola.error(
      `Unexpected error in list files request ${requestId}:`,
      error,
    );
    return createErrorResponse(
      "An unexpected error occurred while listing files.",
      500,
    );
  }
}
