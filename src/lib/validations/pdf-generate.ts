import { SchemaType } from "@google/generative-ai";
import { z } from "zod";

/**
 * Schema for validating individual invoice data.
 */
export const invoiceSchema = z.object({
  invoiceId: z.string(),
  serialNumber: z.number(),
  customerId: z.string(),
  customerName: z.string(),
  productId: z.string(),
  productName: z.string(),
  quantity: z.number(),
  tax: z.number(),
  totalAmount: z.number(),
  date: z.string(),
  invoiceNumber: z.string().optional(),
  dueDate: z.string().optional(),
});

export type Invoice = z.infer<typeof invoiceSchema>;

/**
 * Schema for validating individual product data.
 */
export const productSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  tax: z.number(),
  priceWithTax: z.number(),
  discount: z.number().optional(),
});

export type Product = z.infer<typeof productSchema>;

/**
 * Schema for validating individual customer data.
 */
export const customerSchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
  phoneNumber: z.string(),
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
        },
        required: [
          "invoiceId",
          "serialNumber",
          "customerId",
          "customerName",
          "productId",
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
          productId: { type: SchemaType.STRING },
          productName: { type: SchemaType.STRING },
          quantity: { type: SchemaType.NUMBER },
          unitPrice: { type: SchemaType.NUMBER },
          tax: { type: SchemaType.NUMBER },
          priceWithTax: { type: SchemaType.NUMBER },
          discount: { type: SchemaType.NUMBER },
        },
        required: [
          "productId",
          "productName",
          "quantity",
          "unitPrice",
          "tax",
          "priceWithTax",
        ],
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
        },
        required: [
          "customerId",
          "customerName",
          "phoneNumber",
          "totalPurchaseAmount",
        ],
      },
    },
  },
};
