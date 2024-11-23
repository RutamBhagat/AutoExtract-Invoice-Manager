"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/lib/validations/pdf-generate"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number
      return <div className="text-right font-medium">{quantity}</div>
    },
  },
  {
    accessorKey: "unitPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unit Price" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("unitPrice"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "tax",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tax" />
    ),
    cell: ({ row }) => {
      const tax = row.getValue("tax") as number
      return <div className="text-right font-medium">{tax}%</div>
    },
  },
  {
    id: "priceWithTax",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price with Tax" />
    ),
    cell: ({ row }) => {
      const unitPrice = parseFloat(row.getValue("unitPrice"))
      const tax = row.getValue("tax") as number
      const priceWithTax = unitPrice * (1 + tax / 100)
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(priceWithTax)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
] 