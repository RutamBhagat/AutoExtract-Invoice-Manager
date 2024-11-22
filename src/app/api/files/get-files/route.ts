import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextResponse } from "next/server";
import { env } from "@/env";


/**
 * Handles GET requests to list all uploaded files.
 * Returns a list of files with their names, URIs, and display names.
*
* @returns A NextResponse containing the list of files or an error message.
*/
export async function GET(): Promise<NextResponse> {
  const fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY);

  try {
    const listFilesResponse = await fileManager.listFiles();

    // Return empty array if no files exist or if response structure is invalid
    if (!listFilesResponse?.files || !Array.isArray(listFilesResponse.files)) {
      return NextResponse.json({ files: [] });
    }

    return NextResponse.json({ files: listFilesResponse.files });
  } catch (error) {
    console.error("List files error:", error);
    return NextResponse.json(
      { error: "Failed to list files. Please check API key and permissions." },
      { status: 500 },
    );
  }
}