"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  XIcon,
} from "lucide-react";
import { type FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useFileStore } from "@/providers/file-store-provider";

export default function FileUploadDemo() {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const { uploadResults, isUploading, setUploadResults, setUploading } =
    useFileStore((state) => ({
      uploadResults: state.uploadResults,
      isUploading: state.isUploading,
      setUploadResults: state.setUploadResults,
      setUploading: state.setUploading,
    }));

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const removeFile = (fileToRemove: FileWithPath) => {
    setFiles((files) => files.filter((file) => file !== fileToRemove));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: true,
  });

  const getFileIcon = (file: FileWithPath | null) => {
    if (!file) return <FileIcon className="h-6 w-6" />;

    if (file.type.includes("image")) return <FileIcon className="h-6 w-6" />;
    if (file.type.includes("pdf")) return <FileTextIcon className="h-6 w-6" />;
    if (file.type.includes("sheet"))
      return <FileSpreadsheetIcon className="h-6 w-6" />;
    return <FileIcon className="h-6 w-6" />;
  };

  const uploadFiles = async () => {
    setUploading(true);

    // Show loading toast
    toast.loading("Uploading files...", {
      id: "upload-toast",
    });

    try {
      const uploads = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        // Add file size validation
        if (file.size > 2 * 1024 * 1024 * 1024) {
          // 2GB limit
          throw new Error(`${file.name} exceeds the 2GB size limit`);
        }

        const response = await fetch("/api/files", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await response.json();
      });

      const results = await Promise.all(uploads);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setUploadResults(results);
      setFiles([]); // Clear files after successful upload

      // Show success toast
      toast.success(`Successfully uploaded ${results.length} files`, {
        id: "upload-toast",
      });
    } catch (error) {
      console.error("Upload failed:", error);
      // Show error toast
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
          className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed p-6 transition-colors ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200"} ${files.length > 0 ? "border-green-500 bg-green-50" : ""}`}
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
