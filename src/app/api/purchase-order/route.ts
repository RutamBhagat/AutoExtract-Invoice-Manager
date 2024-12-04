import { NextRequest, NextResponse } from "next/server";

import { consola } from "consola";
import { z } from "zod";

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

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
      const errors = validationResult.error.errors
        .map((e) => e.message)
        .join(",");
      return new NextResponse(`Invalid request body: ${errors}`, {
        status: 400,
      });
    }

    const email = validationResult.data;
    let extractedData = "";

    const extractHeaderValue = (name: string) => {
      const header = email.payload.headers.find((h) => h.name === name);
      return header ? header.value : "";
    };

    extractedData += `Subject: ${extractHeaderValue("Subject")}\n`;
    extractedData += `Snippet: ${email.snippet}\n`;
    extractedData += `From: ${extractHeaderValue("From")}\n`;
    extractedData += `Date: ${extractHeaderValue("Date")}\n`;
    extractedData += `To: ${extractHeaderValue("To")}\n`;

    const processAttachments = (part: any) => {
      if (allowedMimeTypes.includes(part.mimeType)) {
        extractedData += `Attachment: ${part.mimeType}, ${part.filename}\n`;
      }

      if (part.parts) {
        part.parts.forEach(processAttachments);
      }
    };

    email.payload.parts.forEach(processAttachments);

    return NextResponse.json({ extractedData });
  } catch (error: any) {
    consola.error("Error in /api/purchase-orders/route.ts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
