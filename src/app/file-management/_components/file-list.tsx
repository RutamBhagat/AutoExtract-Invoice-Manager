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
import { useFileStore } from "@/stores/file-store"; // Import directly from the store

export default function FileList() {
  const uploadResults = useFileStore((state) => state.uploadResults);

  const getFileIcon = (fileUri: string) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|webp)$/i; // Added webp
    const pdfRegex = /\.pdf$/i;
    const spreadsheetRegex = /\.(xlsx|xls|csv)$/i; // Added csv

    if (imageRegex.test(fileUri)) return <ImageIcon className="h-4 w-4" />;
    if (pdfRegex.test(fileUri)) return <FileTextIcon className="h-4 w-4" />;
    if (spreadsheetRegex.test(fileUri))
      return <FileSpreadsheetIcon className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />; // Default file icon
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
              {/* Use a list for better semantics */}
              {uploadResults.map((file) => (
                <li //removed index from key, key should be unique enough
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
                  {/* Add more actions here if needed (e.g., delete, download) */}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
