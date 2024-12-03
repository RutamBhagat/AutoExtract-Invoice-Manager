import { NextRequest, NextResponse } from "next/server";
import {
  UploadResult,
  validateAndProcessFile,
} from "@/lib/files/validate-and-process-file";
import { gmail_v1, google } from "googleapis"; // Import gmail_v1 for type safety

import { consola } from "consola";
import { env } from "@/env";

interface GmailAttachment {
  filename: string;
  mimeType: string;
  body: {
    data: string; // Base64 encoded attachment data
    size: number;
  };
}

const getGmailService = async (): Promise<gmail_v1.Gmail> => {
  const auth = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
  );
  auth.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });
  return google.gmail({ version: "v1", auth });
};

export async function GET(req: NextRequest) {
  try {
    const gmail = await getGmailService();
    const historyId = req.nextUrl.searchParams.get("historyId");

    if (!historyId) {
      return new NextResponse("Missing HistoryId", { status: 400 });
    }

    const history = await gmail.users.history.list({
      userId: "me",
      startHistoryId: historyId,
      historyTypes: ["messageAdded"],
    });

    if (!history.data.history) {
      return new NextResponse("No history found", { status: 204 }); // 204 No Content if no new emails
    }

    for (const item of history.data.history) {
      if (item.messagesAdded) {
        for (const messageAdded of item.messagesAdded) {
          await processEmail(gmail, messageAdded.message.id!, req);
        }
      }
    }

    return new NextResponse("Email details processed successfully", {
      status: 200,
    });
  } catch (error) {
    consola.error("Error processing email:", error);
    return new NextResponse("Error processing email", { status: 500 });
  }
}

async function processEmail(
  gmail: gmail_v1.Gmail,
  messageId: string,
  req: NextRequest,
) {
  const fullMessage = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const subject = fullMessage.data.payload?.headers?.find(
    (header) => header.name === "Subject",
  )?.value;

  const body = fullMessage.data.snippet;
  const isProcessingOrder = true; // Placeholder - Implement your logic here

  const attachments: GmailAttachment[] | undefined =
    fullMessage.data.payload?.parts?.filter((part) => part.filename) as
      | GmailAttachment[]
      | undefined;

  if (isProcessingOrder && attachments && attachments.length > 0) {
    try {
      const uploadedFilesData = await processAttachments(attachments, req);

      if (uploadedFilesData) {
        const generateData = await callGenerateRoute(uploadedFilesData, req);
        console.log("Generate data:", generateData); // Log the generated data
      }
    } catch (error) {
      consola.error("Error processing PO email:", error);
      // Enhanced error handling -  more specific error messages.
      return new NextResponse(
        "Error processing PO attachments or generating data",
        {
          status: 500,
        },
      );
    }
  } else if (isProcessingOrder && (!attachments || attachments.length === 0)) {
    consola.warn("Email classified as PO, but no attachments found.");
  } else {
    consola.info("Email not classified as a PO. Skipping processing.");
  }
}

async function processAttachments(
  attachments: GmailAttachment[],
  req: NextRequest,
) {
  const formData = new FormData();
  const uploadedFilesData: any[] = [];

  for (const attachment of attachments) {
    const attachmentData = Buffer.from(attachment.body.data, "base64");
    const file: File = new File([attachmentData], attachment.filename, {
      type: attachment.mimeType,
    });

    try {
      const processedFile = await validateAndProcessFile(file);

      formData.append(
        "file",
        new Blob([processedFile.buffer], { type: processedFile.mimeType }),
        processedFile.fileName,
      );
    } catch (validationError) {
      console.error(
        `Failed to validate or process file ${attachment.filename}:`,
        validationError,
      );
      // Consider adding more robust error handling here (e.g., notifying the user, skipping the file)
    }
  }

  const postFilesResponse = await fetch(
    `${req.nextUrl.origin}/api/files/post-files`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!postFilesResponse.ok) {
    console.error(
      `post-files route failed: ${postFilesResponse.status} ${await postFilesResponse.text()}`,
    );

    throw new Error(
      `Failed to upload files: ${postFilesResponse.status} ${postFilesResponse.statusText}`,
    );
  }
  const responseData = await postFilesResponse.json();

  // Assuming your post-files route returns an array of uploaded file data
  if (Array.isArray(responseData)) {
    uploadedFilesData.push(...responseData);
  } else {
    uploadedFilesData.push(responseData);
  }
  return uploadedFilesData;
}

async function callGenerateRoute(uploadedFilesData: any[], req: NextRequest) {
  const generateResponse = await fetch(`${req.nextUrl.origin}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: uploadedFilesData,
      prompt: "Extract invoice data", // Or your desired prompt
    }),
  });

  if (!generateResponse.ok) {
    console.error(
      `generate route failed: ${generateResponse.status} ${await generateResponse.text()}`,
    );
    throw new Error(
      `generate route failed: ${generateResponse.status} ${generateResponse.statusText}`,
    );
  }

  return await generateResponse.json();
}
