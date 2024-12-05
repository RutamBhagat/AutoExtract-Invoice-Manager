import {
  combinedGeminiInvoiceSchema,
  combinedZodInvoiceSchema,
} from "../validations/invoice-generate";
import {
  geminiPurchaseOrderSchema,
  zodPurchaseOrderSchema,
} from "../validations/purchase-order-generate";

export const GEMINI_PROMPTS = {
  EXTRACTION_PROMPT: {
    prompt: `
      You are a specialized data extraction assistant. Your task is to analyze invoice documents and extract structured information into a JSON format strictly adhering to the provided schema.  Output ONLY valid JSON. No explanatory text, markdown, or any other content is permitted.
      Key Instructions:
      1. Customer Details: Prioritize "Buyer". If unavailable, use "Consignee". If both are unavailable, use an empty string "".
      2. Line Items: Each line item represents a unique product on the invoice. Extract product details, quantity, price, and tax. Use column headers ("Sl", "Description", "Rate/Item", "Quantity", "Taxable Value", "GST Amount", "Amount", "Per", "Tax") as guides. If the tax is included in the price, set \`tax\` to \`null\`. If the tax is indeterminable, also set it to \`null\`.
      3. Tax Calculation: If both CGST and SGST are present, sum them. If only IGST is present, use its value. For individual products, calculate tax proportionally based on the total tax and the product's price. If the tax is uncalculable, set \`tax\` to \`null\`.
      4. Discounts: If discount information is available, attempt to calculate missing amounts or percentages. If discounts are unavailable or ambiguous, set \`discount\` to \`null\`.
      5. Total Amount: Use the value from "Amount Payable" as the \`totalAmount\`.
      6. Currency: If "₹" or "Rupees" are present, use "INR". If no currency is specified, use "USD".  Do not infer currency from other clues (e.g., addresses).
      7. Missing Data:  For numeric fields, use \`null\`. For text fields, use "".
      8. Multiple Products/Invoice: Generate separate invoice entries for each unique product on the invoice, distributing quantities, prices, and taxes accordingly.
      9. IDs: If IDs are missing, generate unique ones using these prefixes: "INV-" for invoices, "CUST-" for customers, and "PROD-" for products.
      10. Date Format: Use the format YYYY-MM-DD. If the date is invalid or unavailable, use \`null\`.
      11. Phone Number: If available, extract the phone number from the "Buyer" or "Consignee" fields. If unavailable, use "".
      12. Output:  Valid JSON only, matching the provided schema. Disregard "Place of Supply", "Total amount (in words)", and "Beneficiary Name". No other output allowed.  All missing or ambiguous fields should be represented by their respective null values as described above.
      Example Output:
      {
        "invoices": [
          {
            "invoiceId": "INV-1",
            "serialNumber": null,
            "customerId": "CUST-1",
            "customerName": "Test Assam",
            "productId": "PROD-1",
            "productName": "gertgerg rfreferf",
            "quantity": 1,
            "tax": null,
            "totalAmount": 0,
            "date": "2024-11-04",
            "currency": "INR"
          }
        ],
        "products": [
          {
            "productId": "PROD-1",
            "productName": "gertgerg rfreferf",
            "quantity": 1,
            "unitPrice": 0,
            "tax": null,
            "priceWithTax": 0,
            "currency": "INR",
            "discount": null
          }
        ],
        "customers": [
          {
            "customerId": "CUST-1",
            "customerName": "Test Assam",
            "phoneNumber": "",
            "totalPurchaseAmount": 3061814.98,
            "currency": "INR"
          }
        ]
      }
    `,
    zod_schema: combinedZodInvoiceSchema,
    gemini_schema: combinedGeminiInvoiceSchema,
  },
  PROCESSING_ORDER: {
    prompt: `PROCESSING_ORDER`,
    zod_schema: zodPurchaseOrderSchema,
    gemini_schema: geminiPurchaseOrderSchema,
  },
  CLASSIFY: {
    prompt: `
      You are a Purchase Order (PO) classifier. Your task is to analyze the provided "extractedData" from an email and determine if it likely represents a Purchase Order. While the following criteria are designed to guide you, use your best judgment and understanding of language to make the final determination. Favor accuracy, but avoid being overly strict. If the email appears to be related to a purchase order, even if not perfectly explicit, lean towards classifying it as True.
      Positive Indicators for a Purchase Order (Lean towards True):
      The email exhibits one or more of the following:
        Explicit Mentions: The "extractedData," especially the Snippet, contains clear mentions of "Purchase Order," "PO," "P.O.," or "Our PO," ideally followed by a number, identifier, or other contextual information suggesting a specific PO. A clearly stated "PO Number" with an associated value is a strong positive indicator.
        Related Terminology and Actions: The email uses language strongly suggesting the placement or confirmation of a purchase order. Examples include: "arrange the material," "confirm the order," "delivery date," "please find attached our order," requests for acknowledgment, acceptance, or processing of an order. Consider the overall context and intent.
        Relevant Attachment Names:  Attachments with filenames specifically suggesting a Purchase Order (e.g., "PurchaseOrder.pdf," "PO12345.xlsx") are positive indicators. However, generic attachment names alone are not sufficient.
        Overall Context: Consider the overall context of the email. Even if explicit PO mentions are absent, does the communication clearly suggest a transaction related to purchasing or ordering goods or services?
      Factors that Weaken the Likelihood of a PO (Lean towards False):
        Requests for Information:  Emails primarily focused on requesting pricing, availability, quotes, or other pre-order information.
        Discussions of Past Orders or Issues: Emails discussing past orders, invoices, shipping issues, quality control, or other post-purchase topics.
        Generic Ordering Language: While mentioning "order" or "ordering" can be relevant, consider if it's used in a general sense or specifically refers to a formal Purchase Order.
      Important: These are guidelines, not strict rules. Use your judgment and understanding of language to make the final classification. If unsure, but the email seems related to a purchase process, lean towards True.
      Example Output:
      {
        "isPurchaseOrder": true or false
      }
    `,
    zod_schema: zodPurchaseOrderSchema,
    gemini_schema: geminiPurchaseOrderSchema,
  },
};
