import { createStore } from "zustand/vanilla";

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

export const defaultInitState: FileState = {
  uploadResults: [],
  isUploading: false,
};

export const createFileStore = (initState: FileState = defaultInitState) => {
  return createStore<FileStore>()((set) => ({
    ...initState,
    setUploadResults: (results) => set({ uploadResults: results }),
    addUploadResult: (result) =>
      set((state) => ({
        uploadResults: [...state.uploadResults, result],
      })),
    clearUploadResults: () => set({ uploadResults: [] }),
    setUploading: (isUploading) => set({ isUploading }),
  }));
};
