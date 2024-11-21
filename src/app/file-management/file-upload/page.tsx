import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { HydrateClient, api } from "@/trpc/server";

import FileUploadDemo from "@/components/file-upload-demo";
import { auth } from "@/server/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <div className="flex-1 bg-gray-50 p-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Upload Documents
            </h1>
            <p className="mt-2 text-gray-600">
              Upload your invoice documents (PDF, Excel, or Images)
            </p>
          </div>

          {/* Upload Section */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
            </CardHeader>
            <FileUploadDemo />
          </Card>

          {/* Processing Status */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Supported formats: PDF, Excel (.xlsx, .xls), Images (.png, .jpg,
            .jpeg)
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
