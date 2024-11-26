import { GoogleAIFileManager } from "@google/generative-ai/server";
import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { consola } from "consola";
import { fileUploadApiSchema } from "@/lib/validations/file";
import { env } from "@/env";
import puppeteer from "puppeteer";
import * as XLSX from "xlsx";

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
 * Handles file upload requests.
 *
 * Processes FormData, validates the uploaded file, saves it temporarily,
 * converts Excel files to PDF using Puppeteer, uploads it to Google AI File Manager,
 * and responds with the metadata.
 *
 * @param {NextRequest} request - The incoming HTTP request.
 * @returns {Promise<NextResponse>} - Response with upload status and metadata.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  consola.info(`Processing file upload request ${requestId}`);

  const uploadDir = path.join(process.cwd(), "public", "uploads");

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

    await fs.mkdir(uploadDir, { recursive: true });

    let uploadFilePath: string;
    let uploadFileType: string;
    let uploadFileName: string;
    let pdfBuffer: Buffer;

    if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel"
    ) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Load Excel data using xlsx
        const workbook = XLSX.read(buffer);

        // Ensure sheetName is not undefined
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          return createErrorResponse(
            "Excel file does not contain any sheets",
            400,
          );
        }
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
          return createErrorResponse("Excel sheet not found", 400);
        }
        const htmlData = XLSX.utils.sheet_to_html(sheet);

        // Save HTML for Puppeteer
        const htmlFilePath = path.join(uploadDir, `${Date.now()}-output.html`);
        await fs.writeFile(htmlFilePath, htmlData);

        // Launch Puppeteer and create PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`file://${htmlFilePath}`, {
          waitUntil: "networkidle2",
        });

        pdfBuffer = (await page.pdf({
          format: "A4",
          printBackground: true,
        })) as Buffer; // Type cast here

        await browser.close();

        // Clean up the temporary HTML file
        await fs.unlink(htmlFilePath);

        uploadFileName = file.name.replace(/\.[^.]+$/, ".pdf");
        uploadFilePath = path.join(uploadDir, uploadFileName);
        uploadFileType = "application/pdf";

        await fs.writeFile(uploadFilePath, pdfBuffer);
      } catch (error) {
        consola.error(
          `Failed to convert Excel to PDF in request ${requestId}:`,
          error,
        );
        return createErrorResponse("Failed to convert Excel to PDF", 500);
      }
    } else {
      const originalFileName = `${Date.now()}-${file.name}`;
      uploadFilePath = path.join(uploadDir, originalFileName);
      uploadFileType = file.type;
      uploadFileName = file.name;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await fs.writeFile(uploadFilePath, buffer);
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
      try {
        // await fs.unlink(uploadFilePath);
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
