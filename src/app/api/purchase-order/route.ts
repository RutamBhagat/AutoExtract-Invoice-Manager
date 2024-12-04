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

function extractEmailData(email: any): string {
  const extractedData: string[] = [];

  const extractHeaderValue = (name: string) => {
    const header = email.payload.headers.find(
      (h: { name: string }) => h.name === name,
    );
    return header ? header.value : "";
  };

  extractedData.push(`Subject: ${extractHeaderValue("Subject")}`);
  extractedData.push(`Snippet: ${email.snippet}`);
  extractedData.push(`From: ${extractHeaderValue("From")}`);
  extractedData.push(`Date: ${extractHeaderValue("Date")}`);
  extractedData.push(`To: ${extractHeaderValue("To")}`);

  const processAttachments = (part: any) => {
    if (allowedMimeTypes.includes(part.mimeType)) {
      extractedData.push(`Attachment: ${part.mimeType}, ${part.filename}`);
    }

    if (part.parts) {
      part.parts.forEach(processAttachments);
    }
  };

  email.payload.parts.forEach(processAttachments);

  return extractedData.join("\n");
}

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
    const extractedData = extractEmailData(email);

    return NextResponse.json({ extractedData });
  } catch (error: any) {
    consola.error("Error in /api/purchase-orders/route.ts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
