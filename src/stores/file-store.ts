import { createJSONStorage, persist } from "zustand/middleware";

import { create } from "zustand";

export interface UploadResponse {
  fileUri: string;
  displayName: string;
}

export interface FileState {
  uploadResults: UploadResponse[];
  isUploading: boolean;
}

export interface FileActions {
  setUploadResults: (results: UploadResponse[]) => void;
  addUploadResult: (result: UploadResponse) => void;
  clearUploadResults: () => void;
  setUploading: (isUploading: boolean) => void;
}

export type FileStore = FileState & FileActions;

export const useFileStore = create<FileStore>()(
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
    }),
    {
      name: "file-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ uploadResults: state.uploadResults }),
    },
  ),
);
