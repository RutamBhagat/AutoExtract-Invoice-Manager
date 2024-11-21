"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FileIcon, FileSpreadsheetIcon, FileTextIcon } from "lucide-react";
import { type FileWithPath, useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { useCallback } from "react";

export default function FileUploadDemo() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Handle the uploaded files here
    console.log(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
          ".xlsx",
        ],
        "application/vnd.ms-excel": [".xls"],
        "image/*": [".png", ".jpg", ".jpeg"],
      },
      multiple: false,
    });

  const getFileIcon = (file: FileWithPath | null) => {
    if (!file) return <FileIcon className="h-12 w-12" />;

    if (file.type.includes("image")) return <FileIcon className="h-12 w-12" />;
    if (file.type.includes("pdf"))
      return <FileTextIcon className="h-12 w-12" />;
    if (file.type.includes("sheet"))
      return <FileSpreadsheetIcon className="h-12 w-12" />;
    return <FileIcon className="h-12 w-12" />;
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed p-6 transition-colors ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200"} ${acceptedFiles.length > 0 ? "border-green-500 bg-green-50" : ""} `}
        >
          <input {...getInputProps()} />
          {acceptedFiles.length > 0 && acceptedFiles[0] ? (
            <div className="flex flex-col items-center">
              {getFileIcon(acceptedFiles[0])}
              <span className="mt-2 text-sm font-medium text-gray-700">
                {acceptedFiles[0].name}
              </span>
            </div>
          ) : (
            <>
              <FileIcon className="h-12 w-12" />
              <span className="text-sm font-medium text-gray-500">
                {isDragActive
                  ? "Drop the file here"
                  : "Drag and drop a file or click to browse"}
              </span>
              <span className="text-xs text-gray-500">
                PDF, Excel files (.xlsx, .xls), or images
              </span>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          size="lg"
          disabled={acceptedFiles.length === 0}
          onClick={() => {
            // Handle upload here
            if (acceptedFiles.length > 0) {
              console.log("Uploading:", acceptedFiles[0]);
            }
          }}
        >
          Upload
        </Button>
      </CardFooter>
    </Card>
  );
}
