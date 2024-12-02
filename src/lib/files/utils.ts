import { NextResponse } from "next/server";
import consola from "consola";
import { promises as fs } from "fs";

export interface UploadResult {
  filePath: string;
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}

export class FileUploadError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
    public status: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = "FileUploadError";
  }
}

/**
 * Creates a standardized error response for file upload failures
 */
export function createErrorResponse(error: FileUploadError): NextResponse {
  consola.error({
    message: `File upload error: ${error.message}`,
    code: error.code,
    cause: error.cause,
  });

  return NextResponse.json(
    {
      error: error.message,
      code: error.code,
    },
    { status: error.status },
  );
}

/**
 * Removes temporary files from the filesystem
 */
export async function cleanupFile(filePath: string): Promise<void> {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
  } catch (error) {
    consola.warn(`Failed to cleanup file ${filePath}:`, error);
  }
}
