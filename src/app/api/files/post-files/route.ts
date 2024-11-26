import { GoogleAIFileManager } from "@google/generative-ai/server";
import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { consola } from "consola";
import { fileUploadApiSchema } from "@/lib/validations/file";
import { env } from "@/env";
import * as XLSX from "xlsx";

// File size constants (in bytes)
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

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

function createErrorResponse(
  message: string,
  status: number = 500,
): NextResponse {
  consola.error(`File upload error: ${message}`);
  return NextResponse.json({ error: message }, { status });
}

async function convertExcelToJson(
  file: Buffer,
  fileName: string,
  uploadDir: string,
): Promise<{ filePath: string; buffer: Buffer }> {
  // Load Excel data
  const workbook = XLSX.read(file);

  // Convert each sheet to JSON
  const result = workbook.SheetNames.reduce(
    (acc, sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      if (sheet) {
        acc[sheetName] = XLSX.utils.sheet_to_json(sheet);
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  // Convert to formatted JSON string
  const jsonContent = JSON.stringify(result, null, 2);

  // Create text file
  const textFilePath = path.join(uploadDir, `${Date.now()}-${fileName}.txt`);
  await fs.writeFile(textFilePath, jsonContent, "utf8");

  // Add validation for generated text file size
  const buffer = Buffer.from(jsonContent);
  if (buffer.length > MAX_FILE_SIZE) {
    throw new FileUploadError(
      "Converted text file exceeds size limit",
      null,
      400,
    );
  }

  return {
    filePath: textFilePath,
    buffer: buffer,
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  consola.info(`Processing file upload request ${requestId}`);

  const uploadDir = "/tmp";

  let fileManager: GoogleAIFileManager;
  try {
    fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY);
  } catch (error) {
    return createErrorResponse("Failed to initialize file manager");
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return createErrorResponse("No file uploaded", 400);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse("File size exceeds 2GB limit", 400);
    }

    const validateResult = fileUploadApiSchema.safeParse({
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
    });

    if (!validateResult.success) {
      return createErrorResponse(
        validateResult.error.errors[0]?.message || "Invalid file format",
        400,
      );
    }

    await fs.mkdir(uploadDir, { recursive: true });

    const isExcelFile =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let uploadFilePath: string;
    let uploadFileType: string;
    let uploadFileName = file.name;

    if (isExcelFile) {
      try {
        uploadFileName = file.name.replace(/\.[^.]+$/, ".txt");
        const { filePath, buffer: textBuffer } = await convertExcelToJson(
          buffer,
          file.name,
          uploadDir,
        );

        // Add extra validation before upload
        const stats = {
          size: textBuffer.length,
          type: "text/plain",
          name: uploadFileName,
        };

        if (!fileUploadApiSchema.safeParse({ file: stats }).success) {
          return createErrorResponse(
            "Converted text file validation failed",
            400,
          );
        }

        uploadFilePath = filePath;
        uploadFileType = "text/plain";
      } catch (error) {
        consola.error(
          `Failed to convert Excel to JSON in request ${requestId}:`,
          error,
        );
        return createErrorResponse("Failed to convert Excel to JSON", 500);
      }
    } else {
      uploadFileName = `${Date.now()}-${file.name}`;
      uploadFilePath = path.join(uploadDir, uploadFileName);
      uploadFileType = file.type;
      await fs.writeFile(uploadFilePath, buffer);
    }

    try {
      const uploadResponse = await fileManager.uploadFile(uploadFilePath, {
        mimeType: uploadFileType,
        displayName: uploadFileName,
      });

      consola.info(
        "File uploaded successfully to Google AI:",
        uploadResponse.file,
      );

      return NextResponse.json({
        message: "File uploaded successfully",
        fileUri: uploadResponse.file.uri,
        displayName: uploadResponse.file.displayName,
        mimeType: uploadResponse.file.mimeType,
      });
    } catch (error: any) {
      throw new FileUploadError(
        `Failed to upload file to Google AI. File: ${uploadFileName} (${uploadFileType}) at ${uploadFilePath}`,
        error,
      );
    } finally {
      // Clean up temporary files
      try {
        await fs.unlink(uploadFilePath);
      } catch (cleanupError) {
        consola.warn(`Failed to clean up temporary file:`, cleanupError);
      }
    }
  } catch (error: any) {
    if (error instanceof FileUploadError) {
      return createErrorResponse(error.message, error.status || 500);
    }
    return createErrorResponse(
      "An unexpected error occurred while processing the file upload",
      500,
    );
  }
}
