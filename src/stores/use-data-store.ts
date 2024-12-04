import { createStore, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import {
  type Invoice,
  type Product,
  type Customer,
} from "@/lib/validations/pdf-generate";

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
interface DataStore {
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];

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

  processFile: (fileUri: string, mimeType: string) => void;
  getProductById: (productId: string) => Product | undefined;
  getCustomerById: (customerId: string) => Customer | undefined;
}

/**
 * Main data store that manages invoices, products, and customers.
 * Provides methods for CRUD operations and file processing.
 */
const store = createStore<DataStore>()(
  persist(
    (set, get) => ({
      invoices: [],
      products: [],
      customers: [],
      processedFiles: [],
      fileMetadata: {},

      addInvoice: (invoice) =>
        set((state) => ({ invoices: [...state.invoices, { ...invoice }] })),

      addProduct: (product) =>
        set((state) => ({ products: [...state.products, { ...product }] })),

      addCustomer: (customer) =>
        set((state) => ({ customers: [...state.customers, { ...customer }] })),

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
       * Updates a product and cascades changes to related invoices.
       * When a product is updated, all invoices referencing this product
       * will have their product name updated accordingly.
       */
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

      /**
       * Updates a customer and cascades changes to related invoices.
       * When a customer is updated, all invoices referencing this customer
       * will have their customer name updated accordingly.
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
       * Processes a file by sending it to the API and updating the store with extracted data.
       * Handles success and error cases with toast notifications.
       * @param fileUri - The URI of the file to process
       * @param mimeType - The MIME type of the file
       * @returns Promise with success status and error details if applicable
       */
      processFile: async (fileUri: string, mimeType: string) => {
        const toastId = toast.loading("Processing file...");

        try {
          const response = await fetch("/api/generate/structured-data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              files: [{ fileUri, mimeType }],
              prompt: "EXTRACTION_PROMPT",
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            const error = {
              message: data.error || "Failed to process file",
              details: data.details || "An unexpected error occurred",
              code: data.code || "PROCESSING_ERROR",
            };

            toast.error("Failed to process file", {
              id: toastId,
              description: error.message,
            });

            return { success: false, error };
          }

          const { result } = data;

          set((state) => ({
            invoices: [...state.invoices, ...result.invoices],
            products: [...state.products, ...result.products],
            customers: [...state.customers, ...result.customers],
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

          toast.error("Failed to process file", {
            id: toastId,
            description:
              error instanceof Error ? error.message : "Unknown error",
          });

          return { success: false, error: errorDetails };
        }
      },

      /**
       * Retrieves a product by its ID from the store
       * @param productId - The ID of the product to find
       * @returns The found product or undefined
       */
      getProductById: (productId) => {
        return get().products.find(
          (product) => product.productId === productId,
        );
      },

      /**
       * Retrieves a customer by its ID from the store
       * @param customerId - The ID of the customer to find
       * @returns The found customer or undefined
       */
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
      }),
    },
  ),
);

/**
 * Custom hook to access the data store with type-safe selectors
 * @param selector - Function to select specific state from the store
 * @returns The selected state portion
 */
export const useDataStore = <T>(selector: (state: DataStore) => T): T =>
  useStore(store, selector);

export const dataStore = {
  getState: store.getState,
  setState: store.setState,
  subscribe: store.subscribe,
};
