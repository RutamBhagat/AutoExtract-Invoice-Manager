import { createJSONStorage, persist } from "zustand/middleware";

import { create } from "zustand";

/**
 * Represents a single uploaded file's details.
 */
interface UploadResponse {
  fileUri: string;
  displayName: string;
}

/**
 * Defines the state for file management, including upload results and loading states.
 */
interface FileState {
  uploadResults: UploadResponse[];
  isUploading: boolean;
  isLoading: boolean;
}

/**
 * Provides actions for managing file uploads and interactions.
 */
interface FileActions {
  setUploadResults: (results: UploadResponse[]) => void;
  addUploadResult: (result: UploadResponse) => void;
  clearUploadResults: () => void;
  setUploading: (isUploading: boolean) => void;
  removeUploadResult: (fileUri: string) => void;
  fetchFiles: () => Promise<void>;
}

type FileStore = FileState & FileActions;

const createFileStore = () => {
  /**
   * Fetches the initial list of files from the server.
   * This function maps the fetched file data to the `UploadResponse` format.
   *
   * @returns {Promise<UploadResponse[]>} A promise resolving to the list of files.
   */
  const fetchInitialData = async () => {
    try {
      const response = await fetch("/api/files");
      const data = (await response.json()) as {
        error: string;
        files: { uri: string; displayName: string }[];
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch files");
      }

      return data.files.map((file) => ({
        fileUri: file.uri,
        displayName: file.displayName,
      }));
    } catch (error) {
      console.error("Failed to fetch initial files:", error);
      return [];
    }
  };

  return create<FileStore>()(
    persist(
      (set) => ({
        uploadResults: [],
        isUploading: false,
        isLoading: true,
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
        /**
         * Fetches the list of files from the server and updates the store state.
         * This function updates `uploadResults` with the fetched files and
         * toggles the `isLoading` flag accordingly.
         */
        fetchFiles: async () => {
          set({ isLoading: true });
          try {
            const response = await fetch("/api/files");
            const data = (await response.json()) as {
              error: string;
              files: { uri: string; displayName: string }[];
            };

            if (!response.ok) {
              throw new Error(data.error || "Failed to fetch files");
            }

            const files = data.files.map((file) => ({
              fileUri: file.uri,
              displayName: file.displayName,
            }));

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
        /**
         * Limits the persisted state to the `uploadResults` field.
         * This ensures only relevant data is saved to localStorage.
         *
         * @param {FileStore} state - The current state of the file store.
         * @returns {Partial<FileStore>} An object containing the fields to persist.
         */
        partialize: (state) => ({ uploadResults: state.uploadResults }),
        /**
         * Callback triggered when the store state is rehydrated from storage.
         * Fetches the latest file data and updates the state with the results.
         *
         * @returns {Function} A callback that accepts the rehydrated state.
         */
        onRehydrateStorage: () => (state) => {
          if (state) {
            void fetchInitialData().then((files) => {
              state.setUploadResults(files);
              state.isLoading = false;
            });
          }
        },
      },
    ),
  );
};

export const useFileStore = createFileStore();
