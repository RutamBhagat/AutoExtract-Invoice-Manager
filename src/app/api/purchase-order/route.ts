import { NextRequest, NextResponse } from "next/server";

import { ALLOWED_EMAIL_MIME_TYPES } from "@/lib/files/consts";
import axios from "axios";
import { consola } from "consola";
import { emailThreadSchema } from "@/lib/validations/purchase-order-generate";
import { env } from "@/env";

function extractEmailData(emailThread: any[]): string {
  let extractedData = "";

  for (const email of emailThread) {
    extractedData += `Email Subject: ${email.payload.headers.find((h: { name: string }) => h.name === "Subject")?.value || "N/A"}\n`;
    extractedData += `From: ${email.payload.headers.find((h: { name: string }) => h.name === "From")?.value || "N/A"}\n`;
    extractedData += `To: ${email.payload.headers.find((h: { name: string }) => h.name === "To")?.value || "N/A"}\n`;
    extractedData += `Date: ${email.payload.headers.find((h: { name: string }) => h.name === "Date")?.value || "N/A"}\n`;
    extractedData += `Snippet:\n${email.snippet}\n`;

    const attachments: string[] = [];
    const processAttachments = (part: any) => {
      if (ALLOWED_EMAIL_MIME_TYPES.includes(part.mimeType)) {
        attachments.push(`- ${part.filename} (${part.mimeType})\n`);
      }
      if (part.parts) {
        part.parts.forEach(processAttachments);
      }
    };

    if (email.payload.parts) {
      email.payload.parts.forEach(processAttachments);
    }

    if (attachments.length > 0) {
      extractedData += `Attachments:\n${attachments.join("")}`;
    }
    extractedData += "\n";
    extractedData += `----------------------------------------\n`; // Separator between emails
  }

  return extractedData;
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  try {
    const body = await request.json();

    const validationResult = emailThreadSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((e) => e.message)
        .join(",");
      return new NextResponse(`Invalid request body: ${errors}`, {
        status: 400,
      });
    }

    const emailThread = validationResult.data.messages;
    const extractedData = extractEmailData(emailThread);

    const { data } = await axios.post(
      `${env.SERVER_BASE_URL}/api/generate/without-files`,
      {
        extractedData,
        prompt: "CLASSIFY",
      },
    );

    const { result } = data;

    return NextResponse.json({ result });
  } catch (error: any) {
    consola.error(
      `Error in /api/purchase-orders/route.ts: ${requestId}`,
      error,
    ); // Include requestId
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
