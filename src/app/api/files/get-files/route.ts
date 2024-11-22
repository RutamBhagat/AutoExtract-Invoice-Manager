import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextResponse } from "next/server";
import { env } from "@/env";

const fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY);

/**
 * Handles GET requests to list all uploaded files.
 * Returns a list of files with their names, URIs, and display names.
 *
 * @returns A NextResponse containing the list of files or an error message.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const listFilesResponse = await fileManager.listFiles();

    const files = listFilesResponse.files.map((file) => ({
      name: file.name,
      uri: file.uri,
      displayName: file.displayName,
      mimeType: file.mimeType,
      createTime: file.createTime,
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("List files error:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 },
    );
  }
}
