"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
  RefreshCwIcon,
  XCircleIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useDataStore } from "@/stores/use-data-store";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useUploadStore } from "@/stores/use-upload-store";

/**
 * Displays a list of uploaded files with actions for generation and deletion
 * Includes loading states, file type icons, and tooltips for actions
 */
export default function FileList() {
  const { files, removeFile, fetchFiles } = useUploadStore(
    useShallow((state) => ({
      files: state.files,
      removeFile: state.removeFile,
      fetchFiles: state.fetchFiles,
    })),
  );
  const { processFile } = useDataStore(
    useShallow((state) => ({
      processFile: state.processFile,
    })),
  );

  useEffect(() => {
    fetchFiles();
  }, []);

  /**
   * Handles file deletion with optimistic updates and error handling
   * @param fileUri - URI of the file to delete
   */
  const handleDelete = async (fileUri: string) => {
    const fileName =
      files.find((f) => f.fileUri === fileUri)?.displayName || fileUri;
    const deleteToastId = toast.loading("Deleting file...", {
      description: `Removing ${fileName}`,
    });

    try {
      const response = await fetch("/api/files/delete-files", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUri }),
      });

      const data = await response.json();

      // Remove from store if delete was successful OR if file wasn't found
      if (response.ok || (response.status === 404 && data.fileNotFound)) {
        removeFile(fileUri);
        toast.success("File removed", {
          id: deleteToastId,
          description: response.ok
            ? `${fileName} has been deleted successfully`
            : `${fileName} has been removed from your list`,
        });
        return;
      }

      throw new Error(data.error || "Failed to delete file");
    } catch (error: unknown) {
      console.error("Failed to delete file", error);
      toast.error("Failed to delete file", {
        id: deleteToastId,
        description:
          error instanceof Error
            ? `Error: ${error.message}`
            : "There was a problem deleting the file. Please try again.",
      });
    }
  };

  /**
   * Initiates file processing for data extraction
   * @param fileUri - URI of the file to process
   * @param mimeType - MIME type of the file
   */
  const handleGenerate = async (fileUri: string, mimeType: string) => {
    try {
      await processFile(fileUri, mimeType);
    } catch (error: unknown) {
      console.log("error", error);
    }
  };

  /**
   * Returns appropriate icon component based on file extension
   * @param fileUri - URI of the file to get icon for
   */
  const getFileIcon = (fileUri: string) => {
    const imageRegex = /\.(jpg|jpeg|png)$/i;
    const pdfRegex = /\.pdf$/i;
    const spreadsheetRegex = /\.(xlsx|xls|csv)$/i;

    if (imageRegex.test(fileUri))
      return <ImageIcon className="h-6 w-6 text-blue-400" />;
    if (pdfRegex.test(fileUri))
      return <FileTextIcon className="h-6 w-6 text-orange-400" />;
    if (spreadsheetRegex.test(fileUri))
      return <FileSpreadsheetIcon className="h-6 w-6 text-green-400" />;
    return <FileIcon className="h-6 w-6 text-slate-400" />;
  };

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">Files</span>
            <Badge variant="outline" className="rounded-full px-3">
              {files.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="w-full rounded-md">
          {files.length === 0 ? (
            // Skeleton Placeholder for No Files
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg bg-slate-100" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="mb-2 h-4 w-3/4 bg-slate-100" />
                      <Skeleton className="h-3 w-1/2 bg-slate-200" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            // Files List
            <div className="flex flex-col gap-4">
              {files.map((file) => {
                return (
                  <Card
                    key={file.fileUri}
                    className="group relative border bg-white transition-all duration-300 hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                          {getFileIcon(file.fileUri)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="text-left">
                                <div className="max-w-full">
                                  <p className="truncate font-medium">
                                    {file.displayName}
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{file.displayName}</p>
                                <p className="text-xs text-white">
                                  {file.fileUri}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() =>
                                    handleGenerate(file.fileUri, file.mimeType)
                                  }
                                >
                                  <RefreshCwIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Generate</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-600"
                                  onClick={() => handleDelete(file.fileUri)}
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete File</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
