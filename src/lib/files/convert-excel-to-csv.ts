import * as XLSX from "xlsx";

import { FileOperationError, UploadResult } from "./utils";
import { MAX_FILE_SIZE, UPLOAD_DIR } from "./consts";

import { promises as fs } from "fs";
import path from "path";

/**
 * Converts Excel files to CSV format for processing
 * Handles various Excel-specific errors and validates sheet contents
 */
export async function convertExcelToCSV(
  file: Buffer,
  fileName: string,
): Promise<UploadResult> {
  try {
    const workbook: XLSX.WorkBook = XLSX.read(file);
    if (!workbook.SheetNames.length) {
      throw new FileOperationError(
        "Excel file is empty",
        null,
        400,
        "EMPTY_EXCEL_FILE",
      );
    }

    const firstSheetName: string | undefined = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new FileOperationError(
        "No sheet found in Excel file",
        null,
        400,
        "NO_SHEET_FOUND",
      );
    }

    const worksheet: XLSX.WorkSheet | undefined =
      workbook.Sheets[firstSheetName];
    if (!worksheet) {
      throw new FileOperationError(
        "Failed to read Excel worksheet",
        null,
        500,
        "WORKSHEET_READ_ERROR",
      );
    }

    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const buffer = Buffer.from(csvContent);

    if (buffer.length > MAX_FILE_SIZE) {
      throw new FileOperationError(
        "Converted CSV file exceeds size limit",
        null,
        400,
        "CONVERTED_FILE_TOO_LARGE",
      );
    }

    const csvFileName = fileName.replace(/\.[^.]+$/, ".csv");
    const filePath = path.join(UPLOAD_DIR, `${Date.now()}-${csvFileName}`);
    await fs.writeFile(filePath, csvContent, "utf8");

    return {
      filePath,
      buffer,
      mimeType: "text/csv",
      fileName: csvFileName,
    };
  } catch (error) {
    if (error instanceof FileOperationError) throw error;
    throw new FileOperationError(
      "Failed to convert Excel to CSV",
      error,
      500,
      "EXCEL_CONVERSION_FAILED",
    );
  }
}
