"use client";

import { DataStoreProvider } from "./data-store-provider";
import { UploadStoreProvider } from "./upload-store-provider";

export default function ZustandProviders({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <UploadStoreProvider>
      <DataStoreProvider>{children}</DataStoreProvider>;
    </UploadStoreProvider>
  );
}
