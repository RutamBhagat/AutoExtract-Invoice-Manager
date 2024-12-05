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

export const fileUploadApiSchema = z.object({
  file: z.object({
    name: z.string(),
    type: z.string(),
    size: z
      .number()
      .max(2 * 1024 * 1024 * 1024, "File size must be less than 2GB"),
  }),
});

export const fileDeleteSchema = z.object({
  fileUri: z.string().min(1, "File URI is required"),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type FileUploadAPIInput = z.infer<typeof fileUploadApiSchema>;
export type FileDeleteInput = z.infer<typeof fileDeleteSchema>;

/**
 * Schema for validating file item structure.
 */
export const fileItemSchema = z.object({
  fileUri: z.string().url(),
  mimeType: z.string(),
});

/**
 * Schema for validating the overall request body for content generation.
 */
export const generateContentSchema = z.object({
  files: z.array(fileItemSchema),
  prompt: z.enum(["EXTRACTION_PROMPT", "PROCESSING_ORDER", "CLASSIFY"]),
});
