import { create } from 'zustand'
import { z } from "zod"
import { customerSchema, invoiceSchema, productSchema } from '../lib/validations/pdf-generate'

// Define types based on Zod schemas
type Invoice = z.infer<typeof invoiceSchema>
type Product = z.infer<typeof productSchema>
type Customer = z.infer<typeof customerSchema>

interface Store {
  invoices: Invoice[]
  products: Product[]
  customers: Customer[]
  
  // Add actions
  addInvoice: (invoice: Invoice) => void
  addProduct: (product: Product) => void
  addCustomer: (customer: Customer) => void
  
  removeInvoice: (invoiceId: string) => void
  removeProduct: (productId: string) => void
  removeCustomer: (customerId: string) => void
  
  // Existing update actions
  updateProduct: (productId: string, updates: Partial<Product>) => void
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void
  
  // Bulk update actions
  setInvoices: (invoices: Invoice[]) => void
  setProducts: (products: Product[]) => void
  setCustomers: (customers: Customer[]) => void
}

export const useStore = create<Store>((set) => ({
  invoices: [],
  products: [],
  customers: [],
  
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
  
  // Remove items
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
      
      // Update all related invoices if product name changes
      const updatedInvoices = state.invoices.map(invoice =>
        invoice.productId === productId 
          ? { 
              ...invoice,
              productName: updates.productName ?? invoice.productName,
              // Also update other relevant fields if they change
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
      
      // Update all related invoices if customer details change
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
})) 