import { FileUploadError, createErrorResponse } from "@/lib/files/utils";

import { NextResponse } from "next/server";
import { consola } from "consola";
import { initializeFileManager } from "@/lib/files/google-file-manager";

/**
 * Handles GET requests to list all uploaded files.
 * Returns a list of files with their names, URIs, and display names.
 *
 * @returns A NextResponse containing the list of files or an error message.
 */
export async function GET(): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  consola.info(`Processing list files request ${requestId}`);

  const fileManager = await initializeFileManager();

  try {
    const listFilesResponse = await fileManager.listFiles();

    if (!listFilesResponse?.files || !Array.isArray(listFilesResponse.files)) {
      consola.warn(
        `Invalid response structure in list files request ${requestId}`,
      );
      return NextResponse.json({ files: [] });
    }

    const files = listFilesResponse.files.map((file) => file);
    consola.info(
      `Successfully retrieved ${files.length} files in request ${requestId}`,
    );
    return NextResponse.json({ files });
  } catch (error: any) {
    if (error?.status === 403 || error?.statusText === "Forbidden") {
      consola.warn(
        `Permission denied in list files request ${requestId}:`,
        error,
      );
      return createErrorResponse(
        new FileUploadError(
          "Access denied. Please check your API key and permissions.",
          error,
          403,
        ),
      );
    }

    if (error?.status === 401 || error?.statusText === "Unauthorized") {
      consola.warn(`Unauthorized access in request ${requestId}:`, error);
      return createErrorResponse(
        new FileUploadError(
          "Unauthorized. Please check your API key.",
          error,
          401,
        ),
      );
    }

    consola.error(
      `Unexpected error in list files request ${requestId}:`,
      error,
    );
    return createErrorResponse(
      new FileUploadError(
        "An unexpected error occurred while listing files.",
        error,
        500,
      ),
    );
  }
}
