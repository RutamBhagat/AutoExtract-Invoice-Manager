import { z } from "zod";

export const emailPayloadPartSchema: z.ZodSchema = z.object({
  partId: z.string(),
  mimeType: z.string(),
  filename: z.string(),
  headers: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    }),
  ),
  body: z.object({
    size: z.number(),
    attachmentId: z.string().optional(),
    data: z.string().optional(),
  }),
  parts: z
    .array(
      z.object({
        partId: z.string(),
        mimeType: z.string(),
        filename: z.string(),
        headers: z.array(
          z.object({
            name: z.string(),
            value: z.string(),
          }),
        ),
        body: z.object({
          size: z.number(),
          attachmentId: z.string().optional(),
          data: z.string().optional(),
        }),
        parts: z.lazy(() => emailPayloadPartSchema.array()).optional(),
      }),
    )
    .optional(),
});

export const emailPayloadSchema = z.object({
  partId: z.string(),
  mimeType: z.string(),
  filename: z.string(),
  headers: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    }),
  ),
  body: z.object({
    size: z.number(),
  }),
  parts: emailPayloadPartSchema.array(),
});

export const emailSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  labelIds: z.array(z.string()),
  snippet: z.string(),
  payload: emailPayloadSchema,
  sizeEstimate: z.number(),
  historyId: z.string(),
  internalDate: z.string(),
});

export const emailThreadSchema = z.object({
  id: z.string(),
  historyId: z.string(),
  messages: z.array(emailSchema),
});
