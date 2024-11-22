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
  isLoading: boolean;
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
  fetchFiles: () => Promise<void>;
}

/**
 * Type representing the combined state and actions of the file store.
 */
type FileStore = FileState & FileActions;

/**
 * Creates the file store with persistence using Zustand.
 * @returns A hook to access the file store.
 */
const createFileStore = () => {
  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      const response = await fetch("/api/files");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await response.json();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      if (!response.ok) throw new Error(data.error || "Failed to fetch files");

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return data.files.map((file: unknown) => {
        const typedFile = file as { uri: string; displayName: string };
        return {
          fileUri: typedFile.uri,
          displayName: typedFile.displayName,
        };
      });
    } catch (error) {
      console.error("Failed to fetch initial files:", error);
      return [];
    }
  };

  return create<FileStore>()(
    persist(
      (set) => ({
        uploadResults: [], // Will be populated after initialization
        isUploading: false,
        isLoading: true, // Start with loading true
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
        fetchFiles: async () => {
          set({ isLoading: true });
          try {
            const response = await fetch("/api/files");
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const data = await response.json();

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            if (!response.ok)
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
              throw new Error(data.error || "Failed to fetch files");

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const files = data.files.map((file: unknown) => {
              const typedFile = file as { uri: string; displayName: string };
              return {
                fileUri: typedFile.uri,
                displayName: typedFile.displayName,
              };
            });

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            set({ uploadResults: files });
          } catch (error) {
            console.error("Failed to fetch files:", error);
          } finally {
            set({ isLoading: false });
          }
        },
      }),
      {
        name: "file-store",
        storage: createJSONStorage(() =>
          typeof window !== "undefined" ? localStorage : undefined!,
        ),
        partialize: (state) => ({ uploadResults: state.uploadResults }),
        onRehydrateStorage: () => (state) => {
          // After rehydration, fetch fresh data
          if (state) {
            void fetchInitialData().then((files) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              state.setUploadResults(files);
              state.isLoading = false;
            });
          }
        },
      },
    ),
  );
};

/**
 * Hook to access the file store.
 */
export const useFileStore = createFileStore();
