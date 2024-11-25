"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import { createDataStore, type DataStore } from "@/stores/use-data-store";

export type DataStoreApi = ReturnType<typeof createDataStore>;

export const DataStoreContext = createContext<DataStoreApi | undefined>(
  undefined,
);

export interface DataStoreProviderProps {
  children: ReactNode;
}

export const DataStoreProvider = ({ children }: DataStoreProviderProps) => {
  const storeRef = useRef<DataStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createDataStore();
  }

  return (
    <DataStoreContext.Provider value={storeRef.current}>
      {children}
    </DataStoreContext.Provider>
  );
};

export const useDataStoreContext = <T,>(
  selector: (store: DataStore) => T,
): T => {
  const dataStoreContext = useContext(DataStoreContext);

  if (!dataStoreContext) {
    throw new Error(
      `useDataStoreContext must be used within DataStoreProvider`,
    );
  }

  return useStore(dataStoreContext, selector);
};
