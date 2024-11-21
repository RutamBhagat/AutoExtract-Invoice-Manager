import { z } from "zod";

export const fileUploadSchema = z.object({
  file: z
    .instanceof(File, {
      message: "Must be a valid file",
    })
    .refine((file) => file.size <= 2 * 1024 * 1024 * 1024, {
      message: "File size must be less than 2GB",
    }),
});

export const fileDeleteSchema = z.object({
  fileUri: z.string().min(1, "File URI is required"),
  displayName: z.string().min(1, "Display name is required"),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type FileDeleteInput = z.infer<typeof fileDeleteSchema>;
