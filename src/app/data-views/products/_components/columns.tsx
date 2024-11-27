"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EditableCell } from "@/components/data-table/data-table-cell-editable";
import { Product } from "@/lib/validations/pdf-generate";
import { Trash } from "lucide-react";

interface ProductsColumnProps {
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  removeProduct: (productId: string) => void;
}

export const getColumns = ({
  updateProduct,
  removeProduct,
}: ProductsColumnProps): ColumnDef<Product, string | number>[] => [
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row, getValue }) => {
      const columnId = "productName";
      return (
        <EditableCell
          value={getValue() as string}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const productId = row.original.productId;
            if (productId) {
              updateProduct(productId, { [columnId]: value });
            }
          }}
          type="text"
        />
      );
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Quantity"
        className="text-right"
      />
    ),
    cell: ({ row, getValue }) => {
      const columnId = "quantity";
      return (
        <EditableCell
          value={getValue() as number}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const productId = row.original.productId;
            if (productId) {
              updateProduct(productId, { [columnId]: value });
            }
          }}
          type="number"
        />
      );
    },
  },
  {
    accessorKey: "unitPrice",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Unit Price"
        className="text-right"
      />
    ),
    cell: ({ row, getValue }) => {
      const columnId = "unitPrice";
      const amount = parseFloat(row.getValue(columnId));
      const currency = row.original.currency || "USD";
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(amount);

      return (
        <EditableCell
          value={amount}
          formattedValue={formatted}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const productId = row.original.productId;
            if (productId) {
              updateProduct(productId, { [columnId]: value });
            }
          }}
          type="number"
        />
      );
    },
  },
  {
    accessorKey: "tax",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Tax"
        className="text-right"
      />
    ),
    cell: ({ row, getValue }) => {
      const columnId = "tax";
      const amount = parseFloat(row.getValue(columnId));
      const currency = row.original.currency || "USD";
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(amount);

      return (
        <EditableCell
          value={amount}
          formattedValue={formatted}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const productId = row.original.productId;
            if (productId) {
              updateProduct(productId, { [columnId]: value });
            }
          }}
          type="number"
        />
      );
    },
  },
  {
    id: "priceWithTax",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Price with Tax"
        className="text-right"
      />
    ),
    cell: ({ row }) => {
      const unitPrice = parseFloat(row.getValue("unitPrice"));
      const tax = parseFloat(row.getValue("tax"));
      const quantity = parseFloat(row.getValue("quantity"));
      const priceWithTaxFromGemini = parseFloat(row.getValue("priceWithTax"));
      const priceWithTax = quantity * unitPrice + tax;
      const currency = row.original.currency || "USD";
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(priceWithTax);
      return (
        <div className="text-right font-medium">
          {priceWithTaxFromGemini ? priceWithTaxFromGemini : formatted}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-red-500 hover:text-white"
            onClick={() => {
              removeProduct(product.productId);
            }}
          >
            <span className="sr-only">Delete Product</span>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
