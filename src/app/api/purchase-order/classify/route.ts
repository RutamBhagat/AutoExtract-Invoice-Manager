import { NextRequest, NextResponse } from "next/server";

import axios from "axios";
import { consola } from "consola";
import { env } from "@/env";
import { z } from "zod";

const routeBodySchema = z.object({
  extractedData: z.string(),
});

const validateRequestBody = (body: unknown) => {
  const validationResult = routeBodySchema.safeParse(body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors
      .map((e) => e.message)
      .join(",");
    throw new Error(`Invalid request body: ${errors}`);
  }
  return validationResult.data;
};

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  try {
    const body = await request.json();
    const { extractedData } = validateRequestBody(body);

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
    if (error.message.startsWith("Invalid request body:")) {
      return new NextResponse(error.message, { status: 400 });
    }
    consola.error(
      `Error in /api/purchase-orders/classify/route.ts: ${requestId}`,
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
