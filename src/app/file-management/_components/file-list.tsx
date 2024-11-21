"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFileStore } from "@/providers/file-store-provider";

export default function FileList() {
  // Add client-side only state
  const uploadResults = useFileStore((state) => state.uploadResults);

  const getFileIcon = (fileUri: string) => {
    const imageRegex = /\.(jpg|jpeg|png|gif)$/i;
    const pdfRegex = /\.pdf$/i;
    const spreadsheetRegex = /\.(xlsx|xls)$/i;

    if (imageRegex.exec(fileUri)) return <ImageIcon className="h-4 w-4" />;
    if (pdfRegex.exec(fileUri)) return <FileTextIcon className="h-4 w-4" />;
    if (spreadsheetRegex.exec(fileUri))
      return <FileSpreadsheetIcon className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Uploaded Files</span>
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
            <div className="space-y-4">
              {uploadResults.map((file, index) => (
                <div
                  key={`${file.fileUri}-${index}`}
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
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
