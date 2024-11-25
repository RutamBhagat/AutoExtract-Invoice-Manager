import { GoogleAIFileManager } from "@google/generative-ai/server";
import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { consola } from "consola";
import { fileUploadApiSchema } from "@/lib/validations/file";
import { env } from "@/env";
import libreofficeConvert from "libreoffice-convert";
import util from "util";

const asyncConvert = util.promisify(libreofficeConvert.convert);

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
 * Converts an Excel file to PDF using LibreOffice.
 */
async function convertExcelToPdf(
  inputBuffer: Buffer,
  outputPath: string,
): Promise<void> {
  const ext = ".pdf";
  const pdfPath = outputPath.replace(/\.[^.]+$/, ext);

  try {
    const pdfBuffer = await asyncConvert(inputBuffer, pdfPath, undefined);
    consola.info(`Successfully converted to ${pdfPath}`);
    await fs.writeFile(pdfPath, pdfBuffer);
  } catch (error) {
    consola.error(`Error converting Excel to PDF for : ${error}`);
    throw new FileUploadError(`Error converting Excel to PDF`, error);
  }
}

/**
 * Handles file upload requests.
 *
 * Processes FormData, validates the uploaded file, saves it temporarily,
 * converts Excel files to PDF if necessary, uploads it to Google AI File Manager,
 * and responds with the metadata.
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

    const originalFileName = `${Date.now()}-${file.name}`;
    const originalFilePath = path.join(uploadDir, originalFileName);

    // Convert File to Buffer and save it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(originalFilePath, buffer);

    let uploadFilePath = originalFilePath;
    let uploadFileType = file.type;
    let uploadFileName = file.name;
    let isConverted = false;

    // Convert Excel to PDF if necessary
    if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel"
    ) {
      const pdfFileName = originalFileName.replace(/\.[^.]+$/, ".pdf");
      const pdfFilePath = path.join(uploadDir, pdfFileName);
      try {
        await convertExcelToPdf(buffer, pdfFilePath);
        uploadFilePath = pdfFilePath;
        uploadFileType = "application/pdf";
        uploadFileName = file.name.replace(/\.[^.]+$/, ".pdf");
        isConverted = true;
      } catch (error) {
        consola.error(
          `Failed to convert Excel to PDF in request ${requestId}:`,
          error,
        );
        try {
          await fs.unlink(originalFilePath);
        } catch (cleanupError) {
          consola.warn(
            `Failed to clean up original file after conversion failure:`,
            cleanupError,
          );
        }
        return createErrorResponse("Failed to convert Excel to PDF", 500);
      }
    }

    try {
      const uploadResponse = await fileManager.uploadFile(uploadFilePath, {
        mimeType: uploadFileType,
        displayName: uploadFileName,
      });
      consola.success(`File uploaded successfully in request ${requestId}`);

      return NextResponse.json({
        message: "File uploaded successfully",
        fileUri: uploadResponse.file.uri,
        displayName: uploadResponse.file.displayName,
        mimeType: uploadFileType,
      });
    } catch (error: any) {
      consola.error(
        `Failed to upload file to Google AI in request ${requestId}:`,
        error,
      );
      throw new FileUploadError("Failed to upload file to Google AI", error);
    } finally {
      // Always clean up the temporary files
      try {
        await fs.unlink(uploadFilePath);
        if (isConverted) {
          await fs.unlink(originalFilePath);
        }
      } catch (cleanupError) {
        consola.warn(`Failed to clean up temporary files:`, cleanupError);
      }
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
