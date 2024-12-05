import { SchemaType } from "@google/generative-ai";
import { validateId } from "../ids/ids";
import { z } from "zod";

/**
 * Schema for validating individual invoice data.
 */
export const invoiceSchema = z.object({
  invoiceId: z.string(),
  serialNumber: z.number().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  productId: z.string().optional(),
  productName: z.string().optional(),
  quantity: z.number().optional(),
  tax: z.number().optional(),
  totalAmount: z.number().optional(),
  date: z.string().optional(),
  currency: z.string().optional(),
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
  quantity: z.number().optional(),
  unitPrice: z.number().optional(),
  tax: z.number().optional(),
  priceWithTax: z.number().optional(),
  discount: z.number().optional(),
  currency: z.string().optional(),
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
  phoneNumber: z.string().optional(),
  totalPurchaseAmount: z.number().optional(),
  currency: z.string().optional(),
});

export type Customer = z.infer<typeof customerSchema>;

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
          currency: { type: SchemaType.STRING },
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
        },
        required: [
          "productId",
          "productName",
          "quantity",
          "unitPrice",
          "tax",
          "priceWithTax",
          "discount",
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
  required: ["invoices", "products", "customers"],
};
