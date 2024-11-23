"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
  MoreVertical,
  RefreshCwIcon,
  Trash2Icon,
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
import { toast } from "sonner";
import { useDataStore } from "@/stores/useDataStore";
import { useShallow } from "zustand/react/shallow";
import { useUploadStore } from "@/stores/useUploadStore";

export default function FileList() {
  const { files, removeFile } = useUploadStore(
    useShallow((state) => ({
      files: state.files,
      removeFile: state.removeFile,
    })),
  );

  const { processedFiles, processFile } = useDataStore(
    useShallow((state) => ({
      processedFiles: state.processedFiles,
      processFile: state.processFile,
    })),
  );

  const handleDelete = async (fileUri: string) => {
    const deleteToastId = toast.loading("Deleting file...");
    try {
      const response = await fetch("/api/files/delete-files", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUri }),
      });

      if (!response.ok) throw new Error("Failed to delete file");

      removeFile(fileUri);
      toast.success("File deleted successfully", {
        id: deleteToastId,
        description: `The file ${fileUri} has been deleted.`,
        action: {
          label: "Undo",
          onClick: () => {
            toast("Undo not implemented yet", {
              description: "This feature is not yet available.",
            });
          },
        },
      });
    } catch (error: unknown) {
      console.error("Failed to delete file", error);
      toast.error("Failed to delete file", {
        id: deleteToastId,
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const handleGenerate = async (fileUri: string, mimeType: string) => {
    await processFile(fileUri, mimeType);
  };

  const getFileIcon = (fileUri: string) => {
    const imageRegex = /\.(jpg|jpeg|png)$/i;
    const pdfRegex = /\.pdf$/i;
    const spreadsheetRegex = /\.(xlsx|xls)$/i;

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
            <Badge variant="secondary" className="rounded-full px-3">
              {files.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="w-full rounded-md">
          {files.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8">
              <FileIcon className="h-12 w-12 text-slate-300" />
              <div className="text-center">
                <p className="text-lg font-medium">No files uploaded</p>
                <p className="text-sm text-slate-500">
                  Upload files to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {files.map((file) => {
                const isProcessed = processedFiles.some(
                  (f) => f.fileUri === file.fileUri && f.status === "success",
                );

                return (
                  <Card
                    key={file.fileUri}
                    className={`group relative border transition-all duration-300 hover:shadow-md ${
                      isProcessed ? "bg-slate-50" : "bg-white"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
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
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {isProcessed ? "Processed" : "Unprocessed"}
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{file.displayName}</p>
                                <p className="text-xs text-slate-500">
                                  {file.fileUri}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() =>
                                handleGenerate(file.fileUri, file.mimeType)
                              }
                              disabled={isProcessed}
                            >
                              <RefreshCwIcon className="h-4 w-4" />
                              <span>Generate</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-red-600 focus:text-red-600"
                              onClick={() => handleDelete(file.fileUri)}
                            >
                              <Trash2Icon className="h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
