import { createJSONStorage, persist } from "zustand/middleware";

import { create } from "zustand";

interface UploadResponse {
  fileUri: string;
  displayName: string;
}

interface FileState {
  uploadResults: UploadResponse[];
  isUploading: boolean;
}

interface FileActions {
  setUploadResults: (results: UploadResponse[]) => void;
  addUploadResult: (result: UploadResponse) => void;
  clearUploadResults: () => void;
  setUploading: (isUploading: boolean) => void;
  removeUploadResult: (fileUri: string) => void;
}

type FileStore = FileState & FileActions;

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
        // Only use localStorage on the client
        storage: createJSONStorage(() =>
          typeof window !== "undefined" ? localStorage : undefined!,
        ), // Provide a fallback for server-side
        partialize: (state) => ({ uploadResults: state.uploadResults }), // Persist only uploadResults
      },
    ),
  );

// Create the store outside of the component
// but let useFileStore be a hook
export const useFileStore = createFileStore();
