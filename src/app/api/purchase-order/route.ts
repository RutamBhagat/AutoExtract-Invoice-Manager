import { NextRequest, NextResponse } from "next/server";

import { consola } from "consola";
// Define Zod schema for input validation
import { z } from "zod";

const emailPayloadPartSchema: z.ZodSchema = z.object({
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
    attachmentId: z.string().optional(), // Make attachmentId optional
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

const emailPayloadSchema = z.object({
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

const emailSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  labelIds: z.array(z.string()),
  snippet: z.string(),
  payload: emailPayloadSchema,
  sizeEstimate: z.number(),
  historyId: z.string(),
  internalDate: z.string(),
});

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  try {
    const body = await request.json();

    const validationResult = emailSchema.safeParse(body);
    if (!validationResult.success) {
      return new NextResponse("Invalid request body", { status: 400 });
    }
  } catch (error: any) {
    consola.error("Error in /api/purchase-orders/route.ts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
