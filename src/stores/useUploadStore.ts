import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

/**
 * Represents a single uploaded file's metadata
 */
interface UploadedFile {
  fileUri: string;
  displayName: string;
  mimeType: string;
}

/**
 * Store interface for managing file uploads and their states
 * Handles file upload tracking and loading states
 */
interface UploadStore {
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

/**
 * Fetches the initial list of files from the server
 * Maps the fetched file data to the UploadedFile format
 */
const fetchInitialData = async (): Promise<UploadedFile[]> => {
  try {
    const response = await fetch("/api/files/get-files");
    const data = (await response.json()) as {
      error: string;
      files: { uri: string; displayName: string; mimeType: string }[];
    };

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch files");
    }

    return data.files.map((file) => ({
      fileUri: file.uri,
      displayName: file.displayName,
      mimeType: file.mimeType,
    }));
  } catch (error) {
    console.error("Failed to fetch initial files:", error);
    return [];
  }
};

export const useUploadStore = create<UploadStore>()(
  persist(
    (set) => ({
      files: [],
      isUploading: false,
      isLoading: true,

      setFiles: (files) => set({ files }),
      
      addFile: (file) =>
        set((state) => ({
          files: [...state.files, file],
        })),
      
      clearFiles: () => set({ files: [] }),
      
      setUploading: (isUploading) => set({ isUploading }),
      
      removeFile: (fileUri) =>
        set((state) => ({
          files: state.files.filter(
            (file) => file.fileUri !== fileUri,
          ),
        })),

      /**
       * Fetches the list of files from the server and updates the store
       * Handles loading states and error cases
       */
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
    }),
    {
      name: "upload-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : undefined!,
      ),
      partialize: (state) => ({ files: state.files }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          void fetchInitialData().then((files) => {
            state.setFiles(files);
            state.isLoading = false;
          });
        }
      },
    }
  )
); 