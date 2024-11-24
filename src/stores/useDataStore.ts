import {
  customerSchema,
  invoiceSchema,
  productSchema,
} from "../lib/validations/pdf-generate";

import { EXTRACTION_PROMPT } from "../lib/constants/extraction-prompt";
import { create } from "zustand";
import { generateId } from "@/lib/ids/ids";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { z } from "zod";

type Invoice = z.infer<typeof invoiceSchema>;
type Product = z.infer<typeof productSchema>;
type Customer = z.infer<typeof customerSchema>;

interface ProcessedFile {
  fileUri: string;
  status: "success" | "error";
  error?: {
    message: string;
    details?: string;
    code?: string;
  };
  // Add tracking of created entities
  createdInvoiceIds?: string[];
  createdProductIds?: string[];
  createdCustomerIds?: string[];
}

/**
 * Store interface for managing invoices, products, customers and file processing
 * Handles CRUD operations and maintains relationships between entities
 */
interface Store {
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
  processedFiles: ProcessedFile[];

  addInvoice: (invoice: Invoice) => void;
  addProduct: (product: Product) => void;
  addCustomer: (customer: Customer) => void;

  removeInvoice: (invoiceId: string) => void;
  removeProduct: (productId: string) => void;
  removeCustomer: (customerId: string) => void;

  updateProduct: (productId: string, updates: Partial<Product>) => void;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;

  setInvoices: (invoices: Invoice[]) => void;
  setProducts: (products: Product[]) => void;
  setCustomers: (customers: Customer[]) => void;

  processFile: (
    fileUri: string,
    mimeType: string,
  ) => Promise<{
    success: boolean;
    error?: {
      message: string;
      details?: string;
      code?: string;
    };
  }>;
  removeProcessedFile: (fileUri: string) => void;

  // Add new method
  deleteFileAndData: (fileUri: string) => void;
}

export const useDataStore = create<Store>()(
  persist(
    (set, get) => ({
      invoices: [],
      products: [],
      customers: [],
      processedFiles: [],

      addInvoice: (invoice) =>
        set((state) => ({
          invoices: [
            ...state.invoices,
            {
              ...invoice,
              invoiceId: invoice.invoiceId || generateId("invoice"),
            },
          ],
        })),

      addProduct: (product) =>
        set((state) => ({
          products: [
            ...state.products,
            {
              ...product,
              productId: product.productId || generateId("product"),
            },
          ],
        })),

      addCustomer: (customer) =>
        set((state) => ({
          customers: [
            ...state.customers,
            {
              ...customer,
              customerId: customer.customerId || generateId("customer"),
            },
          ],
        })),

      removeInvoice: (invoiceId) =>
        set((state) => ({
          invoices: state.invoices.filter(
            (invoice) => invoice.invoiceId !== invoiceId,
          ),
        })),

      removeProduct: (productId) =>
        set((state) => ({
          products: state.products.filter(
            (product) => product.productId !== productId,
          ),
        })),

      removeCustomer: (customerId) =>
        set((state) => ({
          customers: state.customers.filter(
            (customer) => customer.customerId !== customerId,
          ),
        })),

      /**
       * Updates a product and cascades changes to related invoices
       */
      updateProduct: (productId, updates) =>
        set((state) => {
          const updatedProducts = state.products.map((product) =>
            product.productId === productId
              ? {
                  ...product,
                  ...updates,
                  // Calculate priceWithTax whenever relevant fields change
                  priceWithTax:
                    updates.unitPrice !== undefined || updates.tax !== undefined
                      ? (updates.unitPrice ?? product?.unitPrice ?? 0) +
                        (updates.tax ?? product.tax ?? 0)
                      : product.priceWithTax,
                }
              : product,
          );

          // Update related invoices
          const updatedInvoices = state.invoices.map((invoice) =>
            invoice.productId === productId
              ? {
                  ...invoice,
                  productName: updates.productName ?? invoice.productName,
                  quantity: updates.quantity ?? invoice.quantity,
                  tax: updates.tax ?? invoice.tax,
                  // Update total amount if price changes
                  totalAmount: updates.unitPrice
                    ? updates.unitPrice * (invoice.quantity ?? 0) +
                      (updates.tax ?? invoice.tax ?? 0)
                    : invoice.totalAmount,
                }
              : invoice,
          );

          return {
            products: updatedProducts,
            invoices: updatedInvoices,
          };
        }),

      /**
       * Updates a customer and cascades changes to related invoices
       */
      updateCustomer: (customerId, updates) =>
        set((state) => {
          const updatedCustomers = state.customers.map((customer) =>
            customer.customerId === customerId
              ? { ...customer, ...updates }
              : customer,
          );

          const updatedInvoices = state.invoices.map((invoice) =>
            invoice.customerId === customerId
              ? {
                  ...invoice,
                  customerName: updates.customerName ?? invoice.customerName,
                }
              : invoice,
          );

          return {
            customers: updatedCustomers,
            invoices: updatedInvoices,
          };
        }),

      updateInvoice: (invoiceId, updates) =>
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.invoiceId === invoiceId
              ? { ...invoice, ...updates }
              : invoice,
          ),
        })),

      setInvoices: (invoices) => set({ invoices }),
      setProducts: (products) => set({ products }),
      setCustomers: (customers) => set({ customers }),

      /**
       * Processes a file by sending it to the API and updating the store with extracted data
       * Shows toast notifications for success/failure states
       */
      processFile: async (fileUri: string, mimeType: string) => {
        const state = get();

        // Prevent processing if file is already processed
        if (
          state.processedFiles.some(
            (f) => f.fileUri === fileUri && f.status === "success",
          )
        ) {
          return {
            success: false,
            error: { message: "File already processed" },
          };
        }

        // Only process PDF files for now
        if (mimeType !== "application/pdf") {
          const error = {
            message: "Invalid file type",
            details: "Only PDF files can be processed at this time",
            code: "INVALID_FILE_TYPE",
          };
          return { success: false, error };
        }

        const toastId = toast.loading("Processing file...");

        try {
          const response = await fetch("/api/generate/pdf-generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              files: [{ fileUri, mimeType }],
              prompt: EXTRACTION_PROMPT,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            const error = {
              message: data.error || "Failed to process file",
              details: data.details || "An unexpected error occurred",
              code: data.code || "PROCESSING_ERROR",
            };

            set((state) => ({
              processedFiles: [
                ...state.processedFiles,
                {
                  fileUri,
                  status: "error",
                  error,
                },
              ],
            }));

            return { success: false, error };
          }

          const { result } = await response.json();

          // Track which entities were created from this file
          const createdInvoiceIds =
            result.invoices?.map((i: { invoiceId: any }) => i.invoiceId) ?? [];
          const createdProductIds =
            result.products?.map((p: { productId: any }) => p.productId) ?? [];
          const createdCustomerIds =
            result.customers?.map((c: { customerId: any }) => c.customerId) ??
            [];

          // Ensure all entities have valid IDs before saving
          const processedResult = {
            invoices:
              result.invoices?.map((invoice: { invoiceId: any }) => ({
                ...invoice,
                invoiceId: invoice.invoiceId || generateId("invoice"),
              })) ?? [],
            products:
              result.products?.map((product: { productId: any }) => ({
                ...product,
                productId: product.productId || generateId("product"),
              })) ?? [],
            customers:
              result.customers?.map((customer: { customerId: any }) => ({
                ...customer,
                customerId: customer.customerId || generateId("customer"),
              })) ?? [],
          };

          // Update state with processed results
          set((state) => ({
            invoices: [...state.invoices, ...processedResult.invoices],
            products: [...state.products, ...processedResult.products],
            customers: [...state.customers, ...processedResult.customers],
            processedFiles: [
              ...state.processedFiles,
              {
                fileUri,
                status: "success",
                createdInvoiceIds,
                createdProductIds,
                createdCustomerIds,
              },
            ],
          }));

          toast.success("File processed successfully", {
            id: toastId,
          });

          return { success: true };
        } catch (error) {
          const errorDetails = {
            message: error instanceof Error ? error.message : "Unknown error",
            details: "Failed to communicate with the server",
            code: "NETWORK_ERROR",
          };

          set((state) => ({
            processedFiles: [
              ...state.processedFiles,
              {
                fileUri,
                status: "error",
                error: errorDetails,
              },
            ],
          }));

          toast.error("Failed to process file", {
            id: toastId,
            description:
              error instanceof Error ? error.message : "Unknown error",
          });

          return { success: false, error: errorDetails };
        }
      },

      /**
       * Removes a processed file and all associated data
       * Currently implements a simple cleanup by clearing all data
       * TODO: Implement more precise tracking of which data came from which file
       */
      removeProcessedFile: (fileUri) =>
        set((state) => {
          const processedFile = state.processedFiles.find(
            (f) => f.fileUri === fileUri,
          );
          if (!processedFile) return state;

          return {
            processedFiles: state.processedFiles.filter(
              (f) => f.fileUri !== fileUri,
            ),
            invoices: [],
            products: [],
            customers: [],
          };
        }),

      deleteFileAndData: (fileUri: string) =>
        set((state) => {
          const processedFile = state.processedFiles.find(
            (f) => f.fileUri === fileUri,
          );
          if (!processedFile) return state;

          return {
            processedFiles: state.processedFiles.filter(
              (f) => f.fileUri !== fileUri,
            ),
            // Remove all entities created by this file
            invoices: state.invoices.filter(
              (i) => !processedFile.createdInvoiceIds?.includes(i.invoiceId),
            ),
            products: state.products.filter(
              (p) => !processedFile.createdProductIds?.includes(p.productId),
            ),
            customers: state.customers.filter(
              (c) => !processedFile.createdCustomerIds?.includes(c.customerId),
            ),
          };
        }),
    }),
    {
      name: "data-store",
      partialize: (state) => ({
        invoices: state.invoices,
        products: state.products,
        customers: state.customers,
        processedFiles: state.processedFiles,
      }),
    },
  ),
);
