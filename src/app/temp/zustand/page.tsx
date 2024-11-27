"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import dynamic from "next/dynamic";
import { useDataStore } from "@/stores/use-data-store";
import { useShallow } from "zustand/react/shallow";
import { useUploadStore } from "@/stores/use-upload-store";

// Type the dynamic import
const DynamicJsonDisplay = dynamic(
  () => import("@/components/json-display").then((mod) => mod.JsonDisplay),
  {
    ssr: false,
  },
);

export default function StoreDebugger() {
  const { invoices, products, customers } = useDataStore(
    useShallow((state) => ({
      invoices: state.invoices,
      products: state.products,
      customers: state.customers,
    })),
  );

  const { files, isUploading, isLoading } = useUploadStore(
    useShallow((state) => ({
      files: state.files,
      isUploading: state.isUploading,
      isLoading: state.isLoading,
    })),
  );

  return (
    <Tabs defaultValue="files" className="mx-auto w-full max-w-7xl py-10">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="data">Data</TabsTrigger>
      </TabsList>

      <TabsContent value="files">
        <DynamicJsonDisplay
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
        {invoices || products || customers ? (
          <DynamicJsonDisplay
            title="Store Data"
            description="Debug view of the current store state."
            data={{
              invoices,
              products,
              customers,
            }}
          />
        ) : (
          <p>No store data available yet.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}
