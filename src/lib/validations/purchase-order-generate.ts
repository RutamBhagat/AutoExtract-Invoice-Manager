import { SchemaType } from "@google/generative-ai";
import { z } from "zod";

export const zodPurchaseOrderSchema = z.object({
  isPurchaseOrder: z.boolean(),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

export const geminiPurchaseOrderSchema = {
  type: SchemaType.OBJECT,
  properties: {
    isPurchaseOrder: { type: SchemaType.BOOLEAN },
    confidence: {
      type: SchemaType.STRING,
      enum: ["HIGH", "MEDIUM", "LOW"],
    },
  },
  required: ["isPurchaseOrder", "confidence"],
};
