import { memo, useCallback, useState, useMemo } from "react";
import { type FileWithPath, useDropzone } from "react-dropzone";
import { useShallow } from "zustand/shallow";
import { toast } from "sonner";
import axios from "axios";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
  XIcon,
  Loader2,
} from "lucide-react";

import { fileUploadSchema } from "@/lib/validations/gemini-file";
import { supportedTypes } from "@/lib/types/supported-files";
import { useUploadStore } from "@/stores/use-upload-store";

/**
 * Response structure from the file upload API
 */
interface UploadResponse {
  message: string;
  fileUri: string;
  displayName: string;
  mimeType: string;
  requestId?: string;
}

/**
 * Props for the FileTypeIcon component
 */
interface FileIconProps {
  file: FileWithPath | null;
  className?: string;
}

/**
 * Renders an appropriate icon based on file type
 */
const FileTypeIcon = memo(({ file, className = "h-6 w-6" }: FileIconProps) => {
  if (!file) return <FileIcon className={className} />;

  const fileType = file.type.toLowerCase();

  if (fileType.startsWith("image/")) return <ImageIcon className={className} />;
  if (fileType === "application/pdf")
    return <FileTextIcon className={className} />;
  if (
    fileType === "text/csv" ||
    fileType.startsWith("application/vnd.ms-excel") ||
    fileType.startsWith(
      "application/vnd.openxmlformats-officedocument.spreadsheetml",
    )
  )
    return <FileSpreadsheetIcon className={className} />;

  return <FileIcon className={className} />;
});

FileTypeIcon.displayName = "FileTypeIcon";

/**
 * Displays a single file item with removal capability
 */
const FileItem = memo(
  ({
    file,
    onRemove,
  }: {
    file: FileWithPath;
    onRemove: (file: FileWithPath) => void;
  }) => (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-2">
      <div className="flex items-center space-x-2">
        <FileTypeIcon file={file} />
        <span className="max-w-[200px] truncate text-sm text-gray-700">
          {file.name}
        </span>
        <span className="text-xs text-gray-500">
          ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(file);
        }}
        className="rounded-full p-1 transition-colors hover:bg-gray-100"
        aria-label="Remove file"
      >
        <XIcon className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  ),
);

FileItem.displayName = "FileItem";

/**
 * Main file upload component with drag and drop functionality
 * Handles file selection, validation, and upload to server
 */
const FileUploadDemo = () => {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [isUploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  const { addFile } = useUploadStore(
    useShallow((state) => ({ addFile: state.addFile })),
  );

  /**
   * Handles files dropped into the upload zone
   * Prevents duplicate files based on name and size
   */
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles((prev) => {
      // Filter out duplicates based on name and size
      const newFiles = acceptedFiles.filter(
        (newFile) =>
          !prev.some(
            (existingFile) =>
              existingFile.name === newFile.name &&
              existingFile.size === newFile.size,
          ),
      );
      return [...prev, ...newFiles];
    });
  }, []);

  /**
   * Removes a file from the upload queue and cleans up its progress state
   */
  const removeFile = useCallback((fileToRemove: FileWithPath) => {
    setFiles((prev) => prev.filter((file) => file !== fileToRemove));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileToRemove.name];
      return newProgress;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: supportedTypes,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB max size
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ file, errors }) => {
        toast.error(`${file.name}: ${errors[0]?.message}`);
      });
    },
  });

  /**
   * Handles the upload process for all selected files
   * Manages upload state, progress, and error handling
   */
  const uploadFiles = async () => {
    setUploading(true);
    const toastId = toast.loading(
      `Uploading ${files.length} file${files.length > 1 ? "s" : ""}...`,
    );

    try {
      const results = await Promise.allSettled(
        files.map(async (file) => {
          try {
            const validateResult = fileUploadSchema.safeParse({ file });
            if (!validateResult.success) {
              throw new Error(
                validateResult.error.errors[0]?.message ??
                  "Invalid file format",
              );
            }

            const formData = new FormData();
            formData.append("file", file);

            const { data: result } = await axios.post<UploadResponse>(
              "/api/files/post-files",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              },
            );

            addFile({
              ...result,
              name: result.displayName,
            });

            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: 100,
            }));

            return { file, success: true };
          } catch (error) {
            return {
              file,
              success: false,
              error: axios.isAxiosError(error)
                ? (error.response?.data?.error ??
                  `Failed to upload ${file.name}`)
                : error,
            };
          }
        }),
      );

      const failures = results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      );

      if (failures.length > 0) {
        toast.error(
          `Failed to upload ${failures.length} file${failures.length > 1 ? "s" : ""}`,
          { id: toastId },
        );
      } else {
        toast.success("All files uploaded successfully!", { id: toastId });
        setFiles([]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed", {
        id: toastId,
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  /**
   * Computes the dynamic class names for the dropzone based on its state
   */
  const dropzoneClass = useMemo(() => {
    const baseClass =
      "flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed p-6 transition-colors";
    if (isDragActive) return `${baseClass} border-blue-500 bg-blue-50`;
    if (files.length > 0) return `${baseClass} border-green-500 bg-green-50`;
    return `${baseClass} border-gray-200`;
  }, [isDragActive, files.length]);

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardContent className="space-y-4 p-6">
        <div {...getRootProps()} className={dropzoneClass}>
          <input {...getInputProps()} />
          <FileIcon className="h-12 w-12" />
          <span className="text-sm font-medium text-gray-500">
            {isDragActive
              ? "Drop the files here"
              : "Drag and drop files or click to browse"}
          </span>
          <span className="text-xs text-gray-500">
            PDF, Excel files (.xlsx, .xls), or images (max 100MB)
          </span>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-gray-700">
              Selected files ({files.length}):
            </div>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {files.map((file, index) => (
                <FileItem
                  key={`${file.name}-${index}`}
                  file={file}
                  onRemove={removeFile}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          size="lg"
          className="w-full hover:bg-gray-200 hover:text-black"
          disabled={files.length === 0 || isUploading}
          onClick={uploadFiles}
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </span>
          ) : (
            `Upload ${files.length > 0 ? `(${files.length} files)` : ""}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default memo(FileUploadDemo);
