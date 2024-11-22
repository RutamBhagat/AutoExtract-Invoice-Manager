import {
  GoogleGenerativeAI,
  SchemaType,
  type Part,
} from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/env";

/**
 * Schema definition for file items with URI and MIME type
 */
const fileItemSchema = z.object({
  fileUri: z.string().url(),
  mimeType: z.string(),
});

/**
 * Schema definition for content generation request body
 */
const generateContentSchema = z.object({
  files: z.array(fileItemSchema),
  prompt: z.string().min(1),
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * Invoice schema definition for structured output validation
 */
const invoiceSchema = {
  description: "List of invoice data",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      serialNumber: { type: SchemaType.NUMBER },
      customerName: { type: SchemaType.STRING },
      productName: { type: SchemaType.STRING },
      quantity: { type: SchemaType.NUMBER },
      tax: { type: SchemaType.NUMBER },
      totalAmount: { type: SchemaType.NUMBER },
      date: { type: SchemaType.STRING },
      invoiceNumber: { type: SchemaType.STRING },
      dueDate: { type: SchemaType.STRING },
    },
    required: [
      "serialNumber",
      "customerName",
      "productName",
      "quantity",
      "tax",
      "totalAmount",
      "date",
    ],
  },
};

/**
 * Handles POST requests to generate content using Google's Generative AI
 * @param request The incoming Next.js request object
 * @returns NextResponse with either the generated content or error message
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const result = generateContentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message },
        { status: 400 },
      );
    }

    const { files, prompt } = result.data;
    const model = genAI.getGenerativeModel({
      model: env.MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: invoiceSchema,
      },
    });

    const fileParts: Part[] = files.map((file) => ({
      fileData: { mimeType: file.mimeType, fileUri: file.fileUri },
    }));

    const generateContentResult = await model.generateContent([
      { text: prompt },
      ...fileParts,
    ]);

    const responseText = generateContentResult.response.text();

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const responseJson = JSON.parse(responseText);
      const validationResult = z
        .array(
          z.object({
            serialNumber: z.number(),
            customerName: z.string(),
            productName: z.string(),
            quantity: z.number(),
            tax: z.number(),
            totalAmount: z.number(),
            date: z.string(),
            invoiceNumber: z.string().optional(),
            dueDate: z.string().optional(),
          }),
        )
        .safeParse(responseJson);

      if (!validationResult.success) {
        return NextResponse.json(
          { error: validationResult.error },
          { status: 400 },
        );
      }

      return NextResponse.json({ result: validationResult.data });
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON response from Gemini" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Generate content error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 },
    );
  }
}
