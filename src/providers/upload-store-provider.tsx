"use client";

import {
  type ReactNode,
  createContext,
  useRef,
  useContext,
  useEffect,
} from "react";
import { useStore } from "zustand";

import { createUploadStore, type UploadStore } from "@/stores/use-upload-store";

export type UploadStoreApi = ReturnType<typeof createUploadStore>;

export const UploadStoreContext = createContext<UploadStoreApi | undefined>(
  undefined,
);

export interface UploadStoreProviderProps {
  children: ReactNode;
}

export const UploadStoreProvider = ({ children }: UploadStoreProviderProps) => {
  const storeRef = useRef<UploadStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createUploadStore();
  }

  return (
    <UploadStoreContext.Provider value={storeRef.current}>
      {children}
    </UploadStoreContext.Provider>
  );
};

export const useUploadStoreContext = <T,>(
  selector: (store: UploadStore) => T,
): T => {
  const uploadStoreContext = useContext(UploadStoreContext);

  if (!uploadStoreContext) {
    throw new Error(
      `useUploadStoreContext must be used within UploadStoreProvider`,
    );
  }

  return useStore(uploadStoreContext, selector);
};
