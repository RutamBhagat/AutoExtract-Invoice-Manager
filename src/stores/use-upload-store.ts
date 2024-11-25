import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";

export interface UploadedFile {
  fileUri: string;
  displayName: string;
  mimeType: string;
  name: string;
}

export interface UploadStore {
  files: UploadedFile[];
  isUploading: boolean;
  isLoading: boolean;

  setFiles: (files: UploadedFile[]) => void;
  addFile: (file: UploadedFile) => void;
  clearFiles: () => void;
  setUploading: (isUploading: boolean) => void;
  removeFile: (fileUri: string) => void;
  fetchFiles: () => Promise<void>;
}

export const createUploadStore = (initState: Partial<UploadStore> = {}) => {
  return createStore<UploadStore>()(
    persist(
      (set) => ({
        files: [],
        isUploading: false,
        isLoading: true,
        setFiles: (files) => set({ files }),
        addFile: (file) => set((state) => ({ files: [...state.files, file] })),
        clearFiles: () => set({ files: [] }),
        setUploading: (isUploading) => set({ isUploading }),
        removeFile: (fileUri) =>
          set((state) => ({
            files: state.files.filter((file) => file.fileUri !== fileUri),
          })),
        fetchFiles: async () => {
          set({ isLoading: true });
          try {
            const files = await fetchInitialData();
            set({ files });
          } catch (error) {
            console.error("Failed to fetch files:", error);
          } finally {
            set({ isLoading: false });
          }
        },
        ...initState,
      }),
      {
        name: "upload-store",
        partialize: (state) => ({
          files: state.files,
          isUploading: state.isUploading,
          isLoading: state.isLoading,
        }),
      },
    ),
  );
};

const fetchInitialData = async (): Promise<UploadedFile[]> => {
  try {
    const response = await fetch("/api/files/get-files");
    const data = (await response.json()) as {
      error: string;
      files: {
        uri: string;
        displayName: string;
        mimeType: string;
        name: string;
      }[];
    };

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch files");
    }

    return data.files.map((file) => ({
      fileUri: file.uri,
      displayName: file.displayName,
      mimeType: file.mimeType,
      name: file.name,
    }));
  } catch (error) {
    console.error("Failed to fetch initial files:", error);
    return [];
  }
};
