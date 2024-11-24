import { SchemaType } from "@google/generative-ai";
import { z } from "zod";

/**
 * Schema for validating individual invoice data.
 */
export const invoiceSchema = z.object({
  invoiceId: z.string(),
  serialNumber: z.number().nullable(),
  customerId: z.string(),
  customerName: z.string(),
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().nullable(),
  tax: z.number().nullable(),
  totalAmount: z.number().nullable(),
  date: z.string().nullable(),
  invoiceNumber: z.string().optional(),
  dueDate: z.string().optional(),
  missingFields: z.array(z.string()).optional(),
});

export type Invoice = z.infer<typeof invoiceSchema>;

/**
 * Schema for validating individual product data.
 */
export const productSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().nullable(),
  unitPrice: z.number().nullable(),
  tax: z.number().nullable(),
  priceWithTax: z.number().nullable(),
  discount: z.number().nullable(),
  missingFields: z.array(z.string()).optional(),
});

export type Product = z.infer<typeof productSchema>;

/**
 * Schema for validating individual customer data.
 */
export const customerSchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
  phoneNumber: z.string().nullable(),
  totalPurchaseAmount: z.number().nullable(),
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
  description: "Extracted data for Invoices, Products, and Customers",
  type: SchemaType.OBJECT,
  properties: {
    invoices: {
      type: SchemaType.ARRAY,
      description: "Invoice data",
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
          missingFields: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "List of missing required fields",
          },
        },
        required: ["invoiceId"],
      },
    },
    products: {
      type: SchemaType.ARRAY,
      description: "Product data",
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
          missingFields: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "List of missing required fields",
          },
        },
        required: ["productId"],
      },
    },
    customers: {
      type: SchemaType.ARRAY,
      description: "Customer data",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          customerId: { type: SchemaType.STRING },
          customerName: { type: SchemaType.STRING },
          phoneNumber: { type: SchemaType.STRING },
          totalPurchaseAmount: { type: SchemaType.NUMBER },
          missingFields: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "List of missing required fields",
          },
        },
        required: ["customerId"],
      },
    },
  },
};
