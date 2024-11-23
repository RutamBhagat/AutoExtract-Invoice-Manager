"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EditableCell } from "@/components/data-table/data-table-cell-editable";
import { Product } from "@/lib/validations/pdf-generate";
import { useDataStore } from "@/stores/useDataStore";
import { TableType } from "@/types/table";

interface ProductsColumnProps {
  setEditingProduct: (product: Product) => void;
}

export const getColumns = ({
  setEditingProduct,
}: ProductsColumnProps): ColumnDef<Product, string | number>[] => [
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row, getValue, table }) => (
      <div className="w-[200px]">
        <EditableCell
          value={getValue() as string}
          row={row.index}
          column="productName"
          updateData={(table.options.meta as TableType<Product>).updateData}
          type="text"
        />
      </div>
    ),
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
    cell: ({ row, getValue, table }) => (
      <div className="w-[100px]">
        <EditableCell
          value={getValue() as number}
          row={row.index}
          column="quantity"
          updateData={(table.options.meta as TableType<Product>).updateData}
          type="number"
        />
      </div>
    ),
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
    cell: ({ row, getValue, table }) => (
      <div className="w-[120px]">
        <EditableCell
          value={getValue() as number}
          row={row.index}
          column="unitPrice"
          updateData={(table.options.meta as TableType<Product>).updateData}
          type="currency"
        />
      </div>
    ),
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
    cell: ({ row, getValue, table }) => (
      <div className="w-[80px]">
        <EditableCell
          value={getValue() as number}
          row={row.index}
          column="tax"
          updateData={(table.options.meta as TableType<Product>).updateData}
          type="number"
        />
      </div>
    ),
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
      const tax = row.getValue("tax") as number;
      const priceWithTax = unitPrice * (1 + tax / 100);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(priceWithTax);
      return (
        <div className="w-[120px] text-right">
          {formatted}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      const removeProduct = useDataStore((state) => state.removeProduct);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setEditingProduct(product)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit product
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                removeProduct(product.productId);
              }}
              className="text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];