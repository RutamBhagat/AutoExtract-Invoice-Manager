import { GoogleGenerativeAI, Part, SchemaType } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Zod schema for a single file object
const fileItemSchema = z.object({
  fileUri: z.string().url(),
  mimeType: z.string(),
});

// Zod schema for the request body
const generateContentSchema = z.object({
  files: z.array(fileItemSchema),
  prompt: z.string().min(1),
});

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

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

    // Schema for structured output (Invoices)
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
          invoiceNumber: { type: SchemaType.STRING }, // Optional
          dueDate: { type: SchemaType.STRING }, // Optional
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

    // Get the Gemini model with the appropriate generation config
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Or "gemini-1.5-pro"
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: invoiceSchema,
      },
    });

    const fileParts: Part[] = files.map((file) => ({
      fileData: { mimeType: file.mimeType, fileUri: file.fileUri },
    }));

    // Call generateContent *without* responseMimeType in the options
    const generateContentResult = await model.generateContent([
      { text: prompt },
      ...fileParts,
    ]); // No options here for responseMimeType or schema

    const responseText = generateContentResult.response.text(); // Get text from stream

    // Parse the string to JSON
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const responseJson = JSON.parse(responseText);

      // Now you have responseJson, a structured JSON object, validate it
      // with your Zod schema for Invoices before returning.
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
            invoiceNumber: z.string().optional(), // Optional fields
            dueDate: z.string().optional(), // Optional fields
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
