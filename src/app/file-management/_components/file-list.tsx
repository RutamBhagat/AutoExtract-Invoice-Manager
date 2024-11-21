"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
  Trash2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useFileStore } from "@/stores/file-store";
import { useShallow } from "zustand/react/shallow";

/**
 * Component that displays a list of uploaded files with options to delete them.
 */
export default function FileList() {
  const { uploadResults, removeUploadResult } = useFileStore(
    useShallow((state) => ({
      uploadResults: state.uploadResults,
      removeUploadResult: state.removeUploadResult,
    })),
  );

  /**
   * Handles the deletion of a file.
   * @param fileUri The URI of the file to delete.
   */
  const handleDelete = async (fileUri: string) => {
    const deleteToastId = toast.loading("Deleting file...");
    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUri }),
      });

      if (!response.ok) throw new Error("Failed to delete file");

      removeUploadResult(fileUri);
      toast.success("File deleted successfully", {
        id: deleteToastId,
      });
    } catch (error: unknown) {
      console.error("Failed to delete file", error);
      toast.error("Failed to delete file", {
        id: deleteToastId,
      });
    }
  };

  /**
   * Returns the appropriate icon for a given file URI based on its extension.
   * @param fileUri The URI of the file.
   * @returns The icon component corresponding to the file type.
   */
  const getFileIcon = (fileUri: string) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
    const pdfRegex = /\.pdf$/i;
    const spreadsheetRegex = /\.(xlsx|xls|csv)$/i;

    if (imageRegex.test(fileUri)) return <ImageIcon className="h-4 w-4" />;
    if (pdfRegex.test(fileUri)) return <FileTextIcon className="h-4 w-4" />;
    if (spreadsheetRegex.test(fileUri))
      return <FileSpreadsheetIcon className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Uploaded Files
          <Badge variant="secondary">{uploadResults.length} files</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {uploadResults.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No files uploaded yet
            </div>
          ) : (
            <ul className="space-y-4">
              {uploadResults.map((file) => (
                <li
                  key={file.fileUri}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.fileUri)}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {file.displayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {file.fileUri}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(file.fileUri)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
