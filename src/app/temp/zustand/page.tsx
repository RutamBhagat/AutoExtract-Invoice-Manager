"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { JsonDisplay } from "@/components/json-display";
import { useDataStoreContext } from "@/providers/data-store-provider";
import { useShallow } from "zustand/react/shallow";
import { useUploadStoreContext } from "@/providers/upload-store-provider";

export default function StoreDebugger() {
  const { invoices, products, customers, processedFiles } = useDataStoreContext(
    useShallow((state) => ({
      invoices: state.invoices,
      products: state.products,
      customers: state.customers,
      processedFiles: state.processedFiles,
    })),
  );

  const { files, isUploading, isLoading } = useUploadStoreContext(
    useShallow((state) => ({
      files: state.files,
      isUploading: state.isUploading,
      isLoading: state.isLoading,
    })),
  );

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
            files,
            isUploading,
            isLoading,
          }}
        />
      </TabsContent>

      <TabsContent value="data">
        <JsonDisplay
          title="Store Data"
          description="Debug view of the current store state."
          data={{
            invoices,
            products,
            customers,
            processedFiles,
          }}
        />
      </TabsContent>
    </Tabs>
  );
}
