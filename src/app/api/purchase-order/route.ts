import { NextRequest, NextResponse } from "next/server";

import { ALLOWED_EMAIL_MIME_TYPES } from "@/lib/files/consts";
import { consola } from "consola";
import { emailSchema } from "@/lib/validations/purchase-order-generate";

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
    if (ALLOWED_EMAIL_MIME_TYPES.includes(part.mimeType)) {
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
