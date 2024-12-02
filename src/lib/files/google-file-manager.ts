import { FileUploadError } from "./utils";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { env } from "@/env";

/**
 * Initializes Google AI file manager with API key
 */
export async function initializeFileManager(): Promise<GoogleAIFileManager> {
  try {
    return new GoogleAIFileManager(env.GEMINI_API_KEY);
  } catch (error) {
    throw new FileUploadError(
      "Failed to initialize Google AI file manager",
      error,
      500,
      "INIT_FAILED",
    );
  }
}
