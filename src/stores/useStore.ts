import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from "zod"
import { customerSchema, invoiceSchema, productSchema } from '../lib/validations/pdf-generate'
import { toast } from 'sonner'
import { EXTRACTION_PROMPT } from '../lib/constants/extraction-prompt'

// Define types based on Zod schemas
type Invoice = z.infer<typeof invoiceSchema>
type Product = z.infer<typeof productSchema>
type Customer = z.infer<typeof customerSchema>

interface ProcessedFile {
  fileUri: string;
  status: 'success' | 'error';
  error?: string;
}

interface Store {
  // Data arrays
  invoices: Invoice[]
  products: Product[]
  customers: Customer[]
  
  // Processed files tracking
  processedFiles: ProcessedFile[]
  
  // Actions for data management
  addInvoice: (invoice: Invoice) => void
  addProduct: (product: Product) => void
  addCustomer: (customer: Customer) => void
  
  removeInvoice: (invoiceId: string) => void
  removeProduct: (productId: string) => void
  removeCustomer: (customerId: string) => void
  
  updateProduct: (productId: string, updates: Partial<Product>) => void
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void
  
  // Bulk update actions
  setInvoices: (invoices: Invoice[]) => void
  setProducts: (products: Product[]) => void
  setCustomers: (customers: Customer[]) => void
  
  // File processing actions
  processFile: (fileUri: string, mimeType: string) => Promise<void>
  removeProcessedFile: (fileUri: string) => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      invoices: [],
      products: [],
      customers: [],
      processedFiles: [],

      // Add items
      addInvoice: (invoice) => set((state) => ({ 
        invoices: [...state.invoices, invoice] 
      })),
      
      addProduct: (product) => set((state) => ({ 
        products: [...state.products, product] 
      })),
      
      addCustomer: (customer) => set((state) => ({ 
        customers: [...state.customers, customer] 
      })),
      
      // Remove items with cascading cleanup
      removeInvoice: (invoiceId) => set((state) => ({
        invoices: state.invoices.filter(invoice => invoice.invoiceId !== invoiceId)
      })),
      
      removeProduct: (productId) => set((state) => ({
        products: state.products.filter(product => product.productId !== productId)
      })),
      
      removeCustomer: (customerId) => set((state) => ({
        customers: state.customers.filter(customer => customer.customerId !== customerId)
      })),
      
      // Update items with cascading changes
      updateProduct: (productId, updates) => 
        set((state) => {
          const updatedProducts = state.products.map(product =>
            product.productId === productId ? { ...product, ...updates } : product
          )
          
          const updatedInvoices = state.invoices.map(invoice =>
            invoice.productId === productId 
              ? { 
                  ...invoice,
                  productName: updates.productName ?? invoice.productName,
                  quantity: updates.quantity ?? invoice.quantity,
                  tax: updates.tax ?? invoice.tax
                }
              : invoice
          )
          
          return {
            products: updatedProducts,
            invoices: updatedInvoices,
          }
        }),

      updateCustomer: (customerId, updates) =>
        set((state) => {
          const updatedCustomers = state.customers.map(customer =>
            customer.customerId === customerId ? { ...customer, ...updates } : customer
          )
          
          const updatedInvoices = state.invoices.map(invoice =>
            invoice.customerId === customerId
              ? {
                  ...invoice,
                  customerName: updates.customerName ?? invoice.customerName,
                }
              : invoice
          )
          
          return {
            customers: updatedCustomers,
            invoices: updatedInvoices,
          }
        }),

      updateInvoice: (invoiceId, updates) =>
        set((state) => ({
          invoices: state.invoices.map(invoice =>
            invoice.invoiceId === invoiceId ? { ...invoice, ...updates } : invoice
          )
        })),
        
      // Bulk update actions
      setInvoices: (invoices) => set({ invoices }),
      setProducts: (products) => set({ products }),
      setCustomers: (customers) => set({ customers }),

      // File processing
      processFile: async (fileUri: string, mimeType: string) => {
        const state = get()
        
        // Check if file was already processed
        if (state.processedFiles.some(f => f.fileUri === fileUri)) {
          return
        }

        const toastId = toast.loading('Processing file...')

        try {
          const response = await fetch('/api/generate/pdf-generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              files: [{ fileUri, mimeType }],
              prompt: EXTRACTION_PROMPT,
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to process file')
          }

          const { result } = await response.json()

          // Update state with new data
          set((state) => ({
            invoices: [...state.invoices, ...(result.invoices ?? [])],
            products: [...state.products, ...(result.products ?? [])],
            customers: [...state.customers, ...(result.customers ?? [])],
            processedFiles: [...state.processedFiles, { fileUri, status: 'success' }]
          }))

          toast.success('File processed successfully', {
            id: toastId,
          })
        } catch (error) {
          console.error('File processing error:', error)
          
          set((state) => ({
            processedFiles: [...state.processedFiles, { 
              fileUri, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            }]
          }))

          toast.error('Failed to process file', {
            id: toastId,
            description: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      },

      removeProcessedFile: (fileUri) => set((state) => {
        // Remove the processed file record
        const processedFile = state.processedFiles.find(f => f.fileUri === fileUri)
        if (!processedFile) return state

        // Remove all data associated with this file
        // Note: This is a simplified approach - in a real app you might want to track
        // which data came from which file more precisely
        return {
          processedFiles: state.processedFiles.filter(f => f.fileUri !== fileUri),
          // Clear all data when removing files - you might want a more sophisticated approach
          invoices: [],
          products: [],
          customers: []
        }
      }),
    }),
    {
      name: 'data-store',
      // Only persist the data and processed files
      partialize: (state) => ({
        invoices: state.invoices,
        products: state.products,
        customers: state.customers,
        processedFiles: state.processedFiles,
      }),
    }
  )
) 