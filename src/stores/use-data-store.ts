import { createStore, useStore } from "zustand";

import { EXTRACTION_PROMPT } from "../lib/constants/extraction-prompt";
import { generateId } from "@/lib/ids/ids";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { z } from "zod";

export type Invoice = {
  invoiceId: string;
  serialNumber?: number; // Added serialNumber field
  customerId: string;
  productId: string;
  quantity: number | undefined; // Changed from optional to union with undefined
  tax: number | undefined; // Changed from optional to union with undefined
  productName: string;
  totalAmount: number | undefined; // Changed from optional to union with undefined
  date: string | undefined; // Changed from optional to union with undefined
  invoiceNumber: string | undefined;
  dueDate: string | undefined;
  currency: string | undefined;
  missingFields?: string[];
  customerName: string;
};

export type Product = {
  productId: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  tax?: number;
  priceWithTax?: number;
  discount?: number;
  currency?: string;
  missingFields?: string[];
};

export type Customer = {
  customerId: string;
  customerName?: string;
  phoneNumber?: string;
  totalPurchaseAmount?: number;
  currency?: string;
  missingFields?: string[];
};

export interface ProcessedFile {
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

export interface FileMetadata {
  fileUri: string;
  status: "success" | "error";
  error?: {
    message: string;
    details?: string;
    code?: string;
  };
  data?: {
    invoices: string[];
    products: string[];
    customers: string[];
  };
}

export interface DataStore {
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
  processedFiles: ProcessedFile[];
  fileMetadata: Record<string, FileMetadata>;

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

  getProductById: (productId: string) => Product | undefined;
  getCustomerById: (customerId: string) => Customer | undefined;
}

// Create the store instance
const store = createStore<DataStore>()(
  persist(
    (set, get) => ({
      invoices: [],
      products: [],
      customers: [],
      processedFiles: [],
      fileMetadata: {},

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
              ? { ...product, ...updates }
              : product,
          );
          const updatedInvoices = state.invoices.map((invoice) =>
            invoice.productId === productId
              ? {
                  ...invoice,
                  productName: updates.productName ?? invoice.productName,
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

        const toastId = toast.loading("Processing file...");

        try {
          const response = await fetch("/api/generate", {
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
            result.invoices?.map((i: { invoiceId: any }) => i.invoiceId) ?? [];
          const createdProductIds =
            result.products?.map((p: { productId: any }) => p.productId) ?? [];
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

          const metadata: FileMetadata = {
            fileUri,
            status: "success",
            data: {
              invoices: processedResult.invoices.map(
                (i: { invoiceId: any }) => i.invoiceId,
              ),
              products: processedResult.products.map(
                (p: { productId: any }) => p.productId,
              ),
              customers: processedResult.customers.map(
                (c: { customerId: any }) => c.customerId,
              ),
            },
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
            fileMetadata: {
              ...state.fileMetadata,
              [fileUri]: metadata,
            },
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
          const metadata = state.fileMetadata[fileUri];
          if (!metadata?.data) return state;

          return {
            invoices: state.invoices.filter(
              (i) => !metadata.data!.invoices.includes(i.invoiceId),
            ),
            products: state.products.filter(
              (p) => !metadata.data!.products.includes(p.productId),
            ),
            customers: state.customers.filter(
              (c) => !metadata.data!.customers.includes(c.customerId),
            ),
            fileMetadata: Object.fromEntries(
              Object.entries(state.fileMetadata).filter(
                ([key]) => key !== fileUri,
              ),
            ),
          };
        }),

      getProductById: (productId) => {
        return get().products.find(
          (product) => product.productId === productId,
        );
      },

      getCustomerById: (customerId) => {
        return get().customers.find(
          (customer) => customer.customerId === customerId,
        );
      },
    }),
    {
      name: "data-store",
      partialize: (state) => ({
        invoices: state.invoices,
        products: state.products,
        customers: state.customers,
        fileMetadata: state.fileMetadata,
      }),
    },
  ),
);

// Create and export the hook
export const useDataStore = <T>(selector: (state: DataStore) => T): T =>
  useStore(store, selector);

// Export vanilla store methods for usage outside of React
export const dataStore = {
  getState: store.getState,
  setState: store.setState,
  subscribe: store.subscribe,
};
