import { NextRequest, NextResponse } from "next/server";

import { ALLOWED_EMAIL_MIME_TYPES } from "@/lib/files/consts";
import { consola } from "consola";
import { emailThreadSchema } from "@/lib/validations/purchase-order-generate";

function extractEmailData(emailThread: any[]): string {
  /**
   * Extracts information from an array of email messages in a thread
   * Returns a formatted string containing details from all emails
   */
  const threadData: string[] = [];

  for (const email of emailThread) {
    const emailData: string[] = [];
    emailData.push(`Email ID: ${email.id}`);

    const extractHeaderValue = (name: string) => {
      const header = email.payload.headers.find(
        (h: { name: string }) => h.name === name,
      );
      return header ? header.value : "";
    };

    emailData.push(`Subject: ${extractHeaderValue("Subject")}`);
    emailData.push(`Snippet: ${email.snippet}`);
    emailData.push(`From: ${extractHeaderValue("From")}`);
    emailData.push(`Date: ${extractHeaderValue("Date")}`);
    emailData.push(`To: ${extractHeaderValue("To")}`);

    const attachments: string[] = [];
    const processAttachments = (part: any) => {
      if (ALLOWED_EMAIL_MIME_TYPES.includes(part.mimeType)) {
        attachments.push(`Attachment: ${part.mimeType}, ${part.filename}`);
      }
      if (part.parts) {
        part.parts.forEach(processAttachments);
      }
    };

    if (email.payload.parts) {
      email.payload.parts.forEach(processAttachments);
    }
    emailData.push(...attachments);

    threadData.push(emailData.join("\n"));
  }

  return threadData.join("\n\n");
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

    return NextResponse.json({ extractedData });
  } catch (error: any) {
    consola.error("Error in /api/purchase-orders/route.ts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
