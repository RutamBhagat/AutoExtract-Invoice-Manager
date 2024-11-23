"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { JsonDisplay } from "@/components/json-display";
import { useDataStore } from "@/stores/useDataStore";
import { useUploadStore } from "@/stores/useUploadStore";

export default function StoreDebugger() {
  const store = useDataStore();
  const uploadStore = useUploadStore();

  return (
    <Tabs defaultValue="files" className="mx-auto w-full max-w-7xl">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="data">Data</TabsTrigger>
      </TabsList>

      <TabsContent value="files">
        <JsonDisplay
          title="File Management"
          description="View and manage your uploaded files here."
          data={{
            files: uploadStore.files,
            isUploading: uploadStore.isUploading,
            isLoading: uploadStore.isLoading,
          }}
        />
      </TabsContent>

      <TabsContent value="data">
        <JsonDisplay
          title="Store Data"
          description="Debug view of the current store state."
          data={{
            invoices: store.invoices,
            products: store.products,
            customers: store.customers,
            processedFiles: store.processedFiles,
          }}
        />
      </TabsContent>
    </Tabs>
  );
}
