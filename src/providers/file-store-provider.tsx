"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import { type FileStore, createFileStore } from "@/stores/file-store";

export type FileStoreApi = ReturnType<typeof createFileStore>;

export const FileStoreContext = createContext<FileStoreApi | undefined>(
  undefined,
);

export interface FileStoreProviderProps {
  children: ReactNode;
}

export const FileStoreProvider = ({ children }: FileStoreProviderProps) => {
  const storeRef = useRef<FileStoreApi>(); // Use useRef to store the instance

  if (!storeRef.current) {
    storeRef.current = createFileStore(); // Create the store only if it doesn't exist
  }

  return (
    <FileStoreContext.Provider value={storeRef.current}>
      {children}
    </FileStoreContext.Provider>
  );
};

export const useFileStore = <T,>(selector: (store: FileStore) => T): T => {
  const fileStoreContext = useContext(FileStoreContext);

  if (!fileStoreContext) {
    throw new Error(`useFileStore must be used within FileStoreProvider`);
  }

  return useStore(fileStoreContext, selector);
};
