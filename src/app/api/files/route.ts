import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextRequest, NextResponse } from "next/server";

const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Determine MIME type
    const mimeType = file.type;
    
    // Upload to Google AI File Manager
    const uploadResponse = await fileManager.uploadFile(buffer, {
      mimeType,
      displayName: file.name,
    });

    return NextResponse.json({
      fileUri: uploadResponse.file.uri,
      displayName: uploadResponse.file.displayName,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 