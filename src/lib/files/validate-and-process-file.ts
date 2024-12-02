import { EXCEL_MIME_TYPES, MAX_FILE_SIZE, UPLOAD_DIR } from "./consts";
import { FileOperationError, UploadResult } from "./utils";

import { convertExcelToCSV } from "./convert-excel-to-csv";
import { fileUploadApiSchema } from "../validations/file";
import { promises as fs } from "fs";
import path from "path";

/**
 * Validates file size and format, then processes it based on type
 * Converts Excel files to CSV and saves other files directly
 */
export async function validateAndProcessFile(
  file: File,
): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new FileOperationError(
      "File size exceeds 2GB limit",
      null,
      400,
      "FILE_TOO_LARGE",
    );
  }

  const validateResult = fileUploadApiSchema.safeParse({
    file: {
      name: file.name,
      type: file.type,
      size: file.size,
    },
  });

  if (!validateResult.success) {
    throw new FileOperationError(
      validateResult.error.errors[0]?.message || "Invalid file format",
      null,
      400,
      "INVALID_FILE_FORMAT",
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const isExcelFile = EXCEL_MIME_TYPES.includes(file.type);

  if (isExcelFile) {
    return await convertExcelToCSV(buffer, file.name);
  }

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  await fs.writeFile(filePath, buffer);

  return {
    filePath,
    buffer,
    mimeType: file.type,
    fileName,
  };
}
