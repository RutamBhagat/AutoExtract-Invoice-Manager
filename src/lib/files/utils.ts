import { NextResponse } from "next/server";
import consola from "consola";
import { promises as fs } from "fs";

export interface UploadResult {
  filePath: string;
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}

export class FileOperationError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
    public status: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = "FileOperationError";
  }
}

/**
 * Creates a standardized error response for file operations
 */
export function createErrorResponse(error: FileOperationError): NextResponse {
  consola.error({
    message: `File operation error: ${error.message}`,
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
