import {
  customerSchema,
  invoiceSchema,
  productSchema,
} from "../lib/validations/pdf-generate";

import { EXTRACTION_PROMPT } from "../lib/constants/extraction-prompt";
import { createStore } from "zustand/vanilla";
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
  createdInvoiceIds?: string[];
  createdProductIds?: string[];
  createdCustomerIds?: string[];
}

export interface DataStore {
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
  deleteFileAndData: (fileUri: string) => void;
}

export const createDataStore = (initState: Partial<DataStore> = {}) => {
  return createStore<DataStore>()(
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

        updateProduct: (productId, updates) =>
          set((state) => {
            const updatedProducts = state.products.map((product) =>
              product.productId === productId
                ? {
                    ...product,
                    ...updates,
                    priceWithTax:
                      updates.unitPrice !== undefined ||
                      updates.tax !== undefined
                        ? (updates.unitPrice ?? product?.unitPrice ?? 0) +
                          (updates.tax ?? product.tax ?? 0)
                        : product.priceWithTax,
                  }
                : product,
            );

            const updatedInvoices = state.invoices.map((invoice) =>
              invoice.productId === productId
                ? {
                    ...invoice,
                    productName: updates.productName ?? invoice.productName,
                    quantity: updates.quantity ?? invoice.quantity,
                    tax: updates.tax ?? invoice.tax,
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

        processFile: async (fileUri: string, mimeType: string) => {
          const state = get();

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

              toast.error("Failed to process file", {
                id: toastId,
                description: error.message,
              });

              return { success: false, error };
            }

            const { result } = data;

            const createdInvoiceIds =
              result.invoices?.map((i: { invoiceId: any }) => i.invoiceId) ??
              [];
            const createdProductIds =
              result.products?.map((p: { productId: any }) => p.productId) ??
              [];
            const createdCustomerIds =
              result.customers?.map((c: { customerId: any }) => c.customerId) ??
              [];

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

            console.log("Before deletion:");
            console.log("Invoices:", state.invoices.length);
            console.log("Products:", state.products.length);
            console.log("Customers:", state.customers.length);

            const filteredInvoices = state.invoices.filter(
              (i) =>
                !processedFile.createdInvoiceIds?.some((baseId) =>
                  i.invoiceId.startsWith(baseId + "-"),
                ),
            );

            const filteredProducts = state.products.filter(
              (p) => !processedFile.createdProductIds?.includes(p.productId),
            );

            const filteredCustomers = state.customers.filter(
              (c) => !processedFile.createdCustomerIds?.includes(c.customerId),
            );

            console.log("After deletion:");
            console.log("Invoices:", filteredInvoices.length);
            console.log("Products:", filteredProducts.length);
            console.log("Customers:", filteredCustomers.length);

            return {
              processedFiles: state.processedFiles.filter(
                (f) => f.fileUri !== fileUri,
              ),
              invoices: filteredInvoices,
              products: filteredProducts,
              customers: filteredCustomers,
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
};
