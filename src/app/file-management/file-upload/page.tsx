"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import FileList from "../_components/file-list";
import FileUploadDemo from "@/app/file-management/_components/file-upload-demo";

export default function Home() {
  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="mt-2 text-gray-600">
            Upload your invoice documents (PDF, Excel, or Images)
          </p>
        </div>
        <Card className="bg-white pb-10 shadow-sm">
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
          </CardHeader>
          <FileUploadDemo />
        </Card>
        <div className="mt-6 text-center text-sm text-gray-500">
          Supported formats: PDF, Excel (.xlsx, .xls), Images (.png, .jpg,
          .jpeg)
        </div>
        <FileList />
      </div>
    </div>
  );
}
