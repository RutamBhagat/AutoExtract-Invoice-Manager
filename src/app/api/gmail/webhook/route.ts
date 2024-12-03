import { NextRequest, NextResponse } from "next/server";

import { consola } from "consola";
import { env } from "@/env";
import { google } from "googleapis";

const getGmailService = async () => {
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
    const response = await gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName: `projects/${env.GOOGLE_PROJECT_ID}/topics/${env.GOOGLE_PUBSUB_TOPIC}`,
        labelIds: ["INBOX"],
      },
    });
    return new NextResponse(JSON.stringify(response.data), {
      status: response.status,
    });
  } catch (error) {
    consola.error("Error setting up Gmail watch:", error);
    return new NextResponse("Error setting up Gmail watch", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const historyId = body.historyId;

    if (!historyId) {
      consola.warn("historyId is missing, ignoring notification.");
      return new NextResponse(null, { status: 204 });
    }

    const processUrl = `${req.nextUrl.origin}/api/gmail/process?historyId=${historyId}`;
    const processResponse = await fetch(processUrl);

    if (!processResponse.ok) {
      const errorBody = await processResponse.text();
      throw new Error(
        `Failed to trigger email processing: ${processResponse.status} ${processResponse.statusText} ${errorBody}`,
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    consola.error("Error in Gmail webhook:", error);
    return new NextResponse("Error in Gmail Webhook", { status: 500 });
  }
}
