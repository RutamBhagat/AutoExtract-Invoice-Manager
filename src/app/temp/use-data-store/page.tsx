import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useDataStore } from "@/stores/useDataStore";
import { useUploadStore } from "@/stores/useUploadStore";

export function StoreDebugger() {
  const store = useDataStore();
  const uploadStore = useUploadStore();

  return (
    <Tabs defaultValue="files" className="w-[800px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="data">Data</TabsTrigger>
      </TabsList>

      <TabsContent value="files">
        <Card>
          <CardHeader>
            <CardTitle>File Management</CardTitle>
            <CardDescription>
              View and manage your uploaded files here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[60vh] overflow-auto text-sm">
              {JSON.stringify(
                {
                  files: uploadStore.files,
                  isUploading: uploadStore.isUploading,
                  isLoading: uploadStore.isLoading,
                },
                null,
                2,
              )}
            </pre>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="data">
        <Card>
          <CardHeader>
            <CardTitle>Store Data</CardTitle>
            <CardDescription>
              Debug view of the current store state.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[60vh] overflow-auto text-sm">
              {JSON.stringify(
                {
                  invoices: store.invoices,
                  products: store.products,
                  customers: store.customers,
                  processedFiles: store.processedFiles,
                },
                null,
                2,
              )}
            </pre>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
