import { createJSONStorage, persist } from "zustand/middleware";

import { create } from "zustand";

/**
 * Interface representing the response from a file upload.
 */
interface UploadResponse {
  fileUri: string;
  displayName: string;
}

/**
 * Interface representing the state of the file store.
 */
interface FileState {
  uploadResults: UploadResponse[];
  isUploading: boolean;
}

/**
 * Interface representing the actions available in the file store.
 */
interface FileActions {
  setUploadResults: (results: UploadResponse[]) => void;
  addUploadResult: (result: UploadResponse) => void;
  clearUploadResults: () => void;
  setUploading: (isUploading: boolean) => void;
  removeUploadResult: (fileUri: string) => void;
}

/**
 * Type representing the combined state and actions of the file store.
 */
type FileStore = FileState & FileActions;

/**
 * Creates the file store with persistence using Zustand.
 * @returns A hook to access the file store.
 */
const createFileStore = () =>
  create<FileStore>()(
    persist(
      (set) => ({
        uploadResults: [],
        isUploading: false,
        setUploadResults: (results) => set({ uploadResults: results }),
        addUploadResult: (result) =>
          set((state) => ({
            uploadResults: [...state.uploadResults, result],
          })),
        clearUploadResults: () => set({ uploadResults: [] }),
        setUploading: (isUploading) => set({ isUploading }),
        removeUploadResult: (fileUri) =>
          set((state) => ({
            uploadResults: state.uploadResults.filter(
              (result) => result.fileUri !== fileUri,
            ),
          })),
      }),
      {
        name: "file-store",
        storage: createJSONStorage(() =>
          typeof window !== "undefined" ? localStorage : undefined!,
        ),
        partialize: (state) => ({ uploadResults: state.uploadResults }),
      },
    ),
  );

/**
 * Hook to access the file store.
 */
export const useFileStore = createFileStore();
