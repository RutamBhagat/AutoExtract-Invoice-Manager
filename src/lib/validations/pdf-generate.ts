import { SchemaType } from "@google/generative-ai";
import { validateId } from "../ids/ids";
import { z } from "zod";

/**
 * Schema for validating individual invoice data.
 */
export const invoiceSchema = z.object({
  invoiceId: z.string().refine(validateId, {
    message: "Invalid invoice ID format",
  }),
  serialNumber: z.number().nullable().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  productId: z.string().optional(),
  productName: z.string().optional(),
  quantity: z.number().nullable().optional(),
  tax: z.number().nullable().optional(),
  totalAmount: z.number().nullable().optional(),
  date: z.string().nullable().optional(),
  invoiceNumber: z.string().optional(),
  dueDate: z.string().optional(),
  missingFields: z.array(z.string()).optional(),
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
          // Only ID fields are required, everything else is optional
          invoiceId: { type: SchemaType.STRING },
          serialNumber: { type: SchemaType.NUMBER, optional: true },
          customerId: { type: SchemaType.STRING, optional: true },
          customerName: { type: SchemaType.STRING, optional: true },
          productId: { type: SchemaType.STRING, optional: true },
          productName: { type: SchemaType.STRING, optional: true },
          quantity: { type: SchemaType.NUMBER, optional: true },
          tax: { type: SchemaType.NUMBER, optional: true },
          totalAmount: { type: SchemaType.NUMBER, optional: true },
          date: { type: SchemaType.STRING, optional: true },
          invoiceNumber: { type: SchemaType.STRING, optional: true },
          dueDate: { type: SchemaType.STRING, optional: true },
          missingFields: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "List of missing required fields",
            optional: true,
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
          productName: { type: SchemaType.STRING, optional: true },
          quantity: { type: SchemaType.NUMBER, optional: true },
          unitPrice: { type: SchemaType.NUMBER, optional: true },
          tax: { type: SchemaType.NUMBER, optional: true },
          priceWithTax: { type: SchemaType.NUMBER, optional: true },
          discount: { type: SchemaType.NUMBER, optional: true },
          missingFields: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "List of missing required fields",
            optional: true,
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
          customerName: { type: SchemaType.STRING, optional: true },
          phoneNumber: { type: SchemaType.STRING, optional: true },
          totalPurchaseAmount: { type: SchemaType.NUMBER, optional: true },
          missingFields: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "List of missing required fields",
            optional: true,
          },
        },
        required: ["customerId"],
      },
    },
  },
};
