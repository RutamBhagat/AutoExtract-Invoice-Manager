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
  
  updateProduct: (productId: string, updates: Partial<Product>) => void
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void
}

export const useStore = create<Store>((set) => ({
  invoices: [],
  products: [],
  customers: [],
  
  updateProduct: (productId, updates) => 
    set((state) => {
      // Update product
      const updatedProducts = state.products.map(product =>
        product.productId === productId ? { ...product, ...updates } : product
      )
      
      // Update related invoices if productName changed
      const updatedInvoices = state.invoices.map(invoice =>
        invoice.productId === productId && updates.productName
          ? { ...invoice, productName: updates.productName }
          : invoice
      )
      
      return {
        products: updatedProducts,
        invoices: updatedInvoices,
      }
    }),

  updateCustomer: (customerId, updates) =>
    set((state) => {
      // Update customer
      const updatedCustomers = state.customers.map(customer =>
        customer.customerId === customerId ? { ...customer, ...updates } : customer
      )
      
      // Update related invoices if customerName changed
      const updatedInvoices = state.invoices.map(invoice =>
        invoice.customerId === customerId && updates.customerName
          ? { ...invoice, customerName: updates.customerName }
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
})) 