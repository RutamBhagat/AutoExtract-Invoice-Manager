import { z } from "zod";

/**
 * Schema for validating file uploads.
 * Ensures the file is a valid File instance and its size is less than 2GB.
 */
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File, {
      message: "Must be a valid file",
    })
    .refine((file) => file.size <= 2 * 1024 * 1024 * 1024, {
      message: "File size must be less than 2GB",
    }),
});

/**
 * Schema for validating file deletion requests.
 * Ensures the fileUri is a non-empty string.
 */
export const fileDeleteSchema = z.object({
  fileUri: z.string().min(1, "File URI is required"),
});

/**
 * Schema for validating file uploads in the API route.
 * Ensures the file metadata is valid.
 */
export const fileUploadApiSchema = z.object({
  file: z.object({
    name: z.string(),
    type: z.string(),
    size: z.number().max(2 * 1024 * 1024 * 1024, "File size must be less than 2GB"),
  }),
});

/**
 * Type for the input of file uploads, inferred from fileUploadSchema.
 */
export type FileUploadInput = z.infer<typeof fileUploadSchema>;

/**
 * Type for the input of file deletions, inferred from fileDeleteSchema.
 */
export type FileDeleteInput = z.infer<typeof fileDeleteSchema>;
