import { SchemaType } from "@google/generative-ai";
import { validateId } from "../ids/ids";
import { z } from "zod";

/**
 * Schema for validating individual invoice data.
 */
export const invoiceSchema = z.object({
  invoiceId: z.string(),
  customerId: z.string(),
  productId: z.string(),
  quantity: z.number().optional(), // Changed from nullable() to optional()
  tax: z.number().optional(), // Changed from nullable() to optional()
  productName: z.string(),
  totalAmount: z.number().optional(), // Changed from nullable() to optional()
  date: z.string().optional(), // Changed from nullable() to optional()
  invoiceNumber: z.string().optional(),
  dueDate: z.string().optional(),
  currency: z.string().optional(),
  missingFields: z.array(z.string()).optional(),
  customerName: z.string(),
});

export type Invoice = z.infer<typeof invoiceSchema>;

/**
 * Schema for validating individual product data.
 */
export const productSchema = z.object({
  productId: z.string().refine(validateId, {
    message: "Invalid product ID format",
  }),
  productName: z.string().optional(),
  quantity: z.number().nullable().optional(),
  unitPrice: z.number().nullable().optional(),
  tax: z.number().nullable().optional(),
  priceWithTax: z.number().nullable().optional(),
  discount: z.number().nullable().optional(),
  currency: z.string().optional(),
  missingFields: z.array(z.string()).optional(),
});

export type Product = z.infer<typeof productSchema>;

/**
 * Schema for validating individual customer data.
 */
export const customerSchema = z.object({
  customerId: z.string().refine(validateId, {
    message: "Invalid customer ID format",
  }),
  customerName: z.string().optional(),
  phoneNumber: z.string().nullable().optional(),
  totalPurchaseAmount: z.number().nullable().optional(),
  currency: z.string().optional(),
  missingFields: z.array(z.string()).optional(),
});

export type Customer = z.infer<typeof customerSchema>;

/**
 * Schema for validating file item structure.
 */
export const fileItemSchema = z.object({
  fileUri: z.string().url(),
  mimeType: z.string(),
});

/**
 * Schema for validating the overall request body for content generation.
 */
export const generateContentSchema = z.object({
  files: z.array(fileItemSchema),
  prompt: z.string().min(1),
});

/**
 * Combined schema for validating the response content.
 */
export const combinedZodSchema = z.object({
  invoices: z.array(invoiceSchema).optional(),
  products: z.array(productSchema).optional(),
  customers: z.array(customerSchema).optional(),
});

/**
 * Combined schema describing the expected structured output format for Gemini AI.
 */
export const combinedGeminiSchema = {
  type: SchemaType.OBJECT,
  properties: {
    invoices: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          invoiceId: { type: SchemaType.STRING },
          serialNumber: { type: SchemaType.NUMBER },
          customerId: { type: SchemaType.STRING },
          customerName: { type: SchemaType.STRING },
          productId: { type: SchemaType.STRING },
          productName: { type: SchemaType.STRING },
          quantity: { type: SchemaType.NUMBER },
          tax: { type: SchemaType.NUMBER },
          totalAmount: { type: SchemaType.NUMBER },
          date: { type: SchemaType.STRING },
          invoiceNumber: { type: SchemaType.STRING },
          dueDate: { type: SchemaType.STRING },
          currency: { type: SchemaType.STRING },
          missingFields: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: [
          "invoiceId",
          "serialNumber",
          "customerName",
          "productName",
          "quantity",
          "tax",
          "totalAmount",
          "date",
          "currency",
        ],
      },
    },
    products: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          productId: { type: SchemaType.STRING },
          productName: { type: SchemaType.STRING },
          quantity: { type: SchemaType.NUMBER },
          unitPrice: { type: SchemaType.NUMBER },
          tax: { type: SchemaType.NUMBER },
          priceWithTax: { type: SchemaType.NUMBER },
          discount: { type: SchemaType.NUMBER },
          currency: { type: SchemaType.STRING },
          missingFields: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: [
          "productId",
          "productName",
          "quantity",
          "unitPrice",
          "tax",
          "priceWithTax",
          "currency",
        ],
      },
    },
    customers: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          customerId: { type: SchemaType.STRING },
          customerName: { type: SchemaType.STRING },
          phoneNumber: { type: SchemaType.STRING },
          totalPurchaseAmount: { type: SchemaType.NUMBER },
          currency: { type: SchemaType.STRING },
          missingFields: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: [
          "customerId",
          "customerName",
          "phoneNumber",
          "totalPurchaseAmount",
          "currency",
        ],
      },
    },
  },
};
