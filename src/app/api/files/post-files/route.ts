import { GoogleAIFileManager } from "@google/generative-ai/server";
import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { consola } from "consola";
import { fileUploadApiSchema } from "@/lib/validations/file";
import { env } from "@/env";
import puppeteer from "puppeteer";
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

async function convertExcelToPdf(
  file: Buffer,
  fileName: string,
  uploadDir: string,
): Promise<{ filePath: string; buffer: Buffer }> {
  // Load Excel data
  const workbook = XLSX.read(file);

  // Generate enhanced HTML with proper styling
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; padding: 20px; }
          table { border-collapse: collapse; width: 100%; max-width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          @page { size: A4; margin: 20px; }
        </style>
      </head>
      <body>
        ${workbook.SheetNames.map((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          return sheet
            ? `
              <div style="page-break-after: always;">
                <h2>${sheetName}</h2>
                ${XLSX.utils.sheet_to_html(sheet)}
              </div>
            `
            : "";
        }).join("")}
      </body>
    </html>
  `;

  const htmlFilePath = path.join(uploadDir, `${Date.now()}-${fileName}.html`);
  await fs.writeFile(htmlFilePath, htmlContent, "utf8");

  // Launch browser with optimal settings
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set viewport to match recommended scaling
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2, // For better quality
    });

    await page.goto(`file://${htmlFilePath}`, {
      waitUntil: ["networkidle0", "load", "domcontentloaded"],
      timeout: 30000,
    });

    // Generate PDF with optimal settings
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      scale: 1,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `
        <div style="font-size: 10px; padding: 5px 5px 0; text-align: center; width: 100%;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
      landscape: false, // Change based on content analysis if needed
    });

    // Add validation for generated PDF size
    if (pdfBuffer.length > MAX_FILE_SIZE) {
      throw new FileUploadError("Converted PDF exceeds size limit", null, 400);
    }

    // Verify PDF is valid
    if (!Buffer.from(pdfBuffer).toString().startsWith("%PDF-")) {
      throw new FileUploadError("Generated PDF is invalid", null, 400);
    }

    return {
      filePath: htmlFilePath,
      buffer: pdfBuffer as Buffer,
    };
  } finally {
    await browser.close();
  }
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
        uploadFileName = file.name.replace(/\.[^.]+$/, ".pdf");
        const { buffer: pdfBuffer } = await convertExcelToPdf(
          buffer,
          file.name,
          uploadDir,
        );

        // Add extra validation before upload
        const stats = {
          size: pdfBuffer.length,
          type: "application/pdf",
          name: uploadFileName,
        };

        if (!fileUploadApiSchema.safeParse({ file: stats }).success) {
          return createErrorResponse("Converted PDF validation failed", 400);
        }

        uploadFileName = file.name.replace(/\.[^.]+$/, ".pdf");
        uploadFilePath = path.join(
          uploadDir,
          `${Date.now()}-${uploadFileName}`,
        );
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
