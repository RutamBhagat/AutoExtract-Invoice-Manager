import {
  GoogleGenerativeAI,
  SchemaType,
  type Part,
} from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/env";

// Zod schemas for individual data types
const invoiceSchema = z.object({
  serialNumber: z.number(),
  customerName: z.string(),
  productName: z.string(),
  quantity: z.number(),
  tax: z.number(),
  totalAmount: z.number(),
  date: z.string(),
  invoiceNumber: z.string().optional(),
  dueDate: z.string().optional(),
});

const productSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  tax: z.number(),
  priceWithTax: z.number(),
  discount: z.number().optional(),
});

const customerSchema = z.object({
  customerName: z.string(),
  phoneNumber: z.string(),
  totalPurchaseAmount: z.number(),
  // Add other optional customer fields here
});

// Schema for the overall structured output
const combinedSchema = {
  description: "Extracted data for Invoices, Products, and Customers",
  type: SchemaType.OBJECT,
  properties: {
    invoices: {
      type: SchemaType.ARRAY,
      description: "Invoice data",
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
    },
    products: {
      type: SchemaType.ARRAY,
      description: "Product data",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          quantity: { type: SchemaType.NUMBER },
          unitPrice: { type: SchemaType.NUMBER },
          tax: { type: SchemaType.NUMBER },
          priceWithTax: { type: SchemaType.NUMBER },
          discount: { type: SchemaType.NUMBER },
        },
        required: ["name", "quantity", "unitPrice", "tax", "priceWithTax"],
      },
    },
    customers: {
      type: SchemaType.ARRAY,
      description: "Customer data",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          customerName: { type: SchemaType.STRING },
          phoneNumber: { type: SchemaType.STRING },
          totalPurchaseAmount: { type: SchemaType.NUMBER },
          // Add other optional customer fields here
        },
        required: ["customerName", "phoneNumber", "totalPurchaseAmount"],
      },
    },
  },
};

const fileItemSchema = z.object({
  fileUri: z.string().url(),
  mimeType: z.string(),
});

const generateContentSchema = z.object({
  files: z.array(fileItemSchema),
  prompt: z.string().min(1),
});

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

    const model = genAI.getGenerativeModel({
      model: env.MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: combinedSchema,
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

      const combinedZodSchema = z.object({
        invoices: z.array(invoiceSchema).optional(),
        products: z.array(productSchema).optional(),
        customers: z.array(customerSchema).optional(),
      });

      const validationResult = combinedZodSchema.safeParse(responseJson);
      if (!validationResult.success) {
        console.log(validationResult.error);
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
