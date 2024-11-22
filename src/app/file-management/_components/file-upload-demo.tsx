"use client";

interface UploadResponse {
  fileUri: string;
  displayName: string;
}

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
  XIcon,
} from "lucide-react";
import { type FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useFileStore } from "@/stores/file-store";
import { useShallow } from "zustand/react/shallow";
import { fileUploadSchema } from "@/lib/validations/file";
import { supportedTypes } from "@/lib/types/supported-files";

/**
 * Component for uploading files via drag-and-drop or browser selection.
 * Supports PDF, Excel, and image files.
 */
export default function FileUploadDemo() {
  const [files, setFiles] = useState<FileWithPath[]>([]);

  const { isUploading, setUploading, addUploadResult, uploadResults } =
    useFileStore(
      useShallow((state) => ({
        isUploading: state.isUploading,
        setUploading: state.setUploading,
        addUploadResult: state.addUploadResult,
        uploadResults: state.uploadResults,
      })),
    );

  /**
   * Callback function for handling dropped files.
   * Appends accepted files to the current file list.
   */
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  /**
   * Removes a specific file from the current file list.
   * @param fileToRemove The file to be removed.
   */
  const removeFile = (fileToRemove: FileWithPath) => {
    setFiles((files) => files.filter((file) => file !== fileToRemove));
  };

  /**
   * Configures the dropzone with accepted file types and multiple file selection.
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: supportedTypes,
    multiple: true,
  });

  /**
   * Returns the appropriate icon for a given file based on its type.
   * @param file The file for which to get the icon.
   * @returns The icon component corresponding to the file type.
   */
  const getFileIcon = (file: FileWithPath | null) => {
    if (!file) return <FileIcon className="h-6 w-6" />;
    const fileType = file.type.toLowerCase();
    if (fileType.startsWith("image/")) return <ImageIcon className="h-6 w-6" />;
    if (fileType === "application/pdf")
      return <FileTextIcon className="h-6 w-6" />;
    if (
      fileType.startsWith("application/vnd.ms-excel") ||
      fileType.startsWith(
        "application/vnd.openxmlformats-officedocument.spreadsheetml",
      )
    )
      return <FileSpreadsheetIcon className="h-6 w-6" />;

    return <FileIcon className="h-6 w-6" />;
  };

  /**
   * Uploads the selected files to the server.
   * Validates each file before uploading and displays toast notifications for progress and status.
   */
  const uploadFiles = async () => {
    setUploading(true);
    toast.loading("Uploading files...", { id: "upload-toast" });

    try {
      for (const file of files) {
        const validateResult = fileUploadSchema.safeParse({ file });
        if (!validateResult.success) {
          throw new Error(
            validateResult.error.errors[0]?.message ?? "Invalid file format",
          );
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/files", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error ?? `Failed to upload ${file.name}`);
        }

        const result = (await response.json()) as UploadResponse;
        addUploadResult(result);
        toast.success(`${file.name} uploaded!`);
      }
      setFiles([]);
      toast.success("All files uploaded!", { id: "upload-toast" });
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed", {
        id: "upload-toast",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed p-6 transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200"
          } ${files.length > 0 ? "border-green-500 bg-green-50" : ""}`}
        >
          <input {...getInputProps()} />
          <FileIcon className="h-12 w-12" />
          <span className="text-sm font-medium text-gray-500">
            {isDragActive
              ? "Drop the files here"
              : "Drag and drop files or click to browse"}
          </span>
          <span className="text-xs text-gray-500">
            PDF, Excel files (.xlsx, .xls), or images
          </span>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-gray-700">
              Selected files:
            </div>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-2"
                >
                  <div className="flex items-center space-x-2">
                    {getFileIcon(file)}
                    <span className="text-sm text-gray-700">{file.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file);
                    }}
                    className="rounded-full p-1 hover:bg-gray-100"
                  >
                    <XIcon className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          size="lg"
          disabled={files.length === 0 || isUploading}
          onClick={uploadFiles}
        >
          {isUploading
            ? "Uploading..."
            : `Upload ${files.length > 0 ? `(${files.length} files)` : ""}`}
        </Button>
      </CardFooter>
      {uploadResults.length > 0 && (
        <div className="border-t p-4">
          <h3 className="mb-2 text-sm font-medium">Uploaded Files:</h3>
          <div className="space-y-2">
            {uploadResults.map((result, index) => (
              <div key={index} className="text-sm">
                {result.displayName} - {result.fileUri}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
