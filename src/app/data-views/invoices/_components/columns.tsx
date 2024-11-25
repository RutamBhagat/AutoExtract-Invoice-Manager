"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EditableCell } from "@/components/data-table/data-table-cell-editable";
import { Invoice } from "@/lib/validations/pdf-generate";
import { TableType } from "@/types/table";
import { useDataStore } from "@/stores/useDataStore";

export const getColumns = (): ColumnDef<Invoice, string | number>[] => [
  {
    accessorKey: "serialNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial Number" />
    ),
    cell: ({ row, getValue, table }) => (
      <EditableCell
        value={getValue() as string}
        row={row.index}
        column="serialNumber"
        updateData={(table.options.meta as TableType<Invoice>).updateData}
        type="text"
      />
    ),
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer Name" />
    ),
    cell: ({ row, getValue, table }) => (
      <EditableCell
        value={getValue() as string}
        row={row.index}
        column="customerName"
        updateData={(table.options.meta as TableType<Invoice>).updateData}
        type="text"
      />
    ),
  },
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
    cell: ({ row, getValue, table }) => (
      <EditableCell
        value={getValue() as string}
        row={row.index}
        column="productName"
        updateData={(table.options.meta as TableType<Invoice>).updateData}
        type="text"
      />
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
      <EditableCell
        value={getValue() as number}
        row={row.index}
        column="quantity"
        updateData={(table.options.meta as TableType<Invoice>).updateData}
        type="number"
      />
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
    cell: ({ row, getValue, table }) => {
      const amount = parseFloat(row.getValue("tax"));
      const currency = row.original.currency || "USD";
      const isMissing = row.original.missingFields?.includes("tax");
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(amount);

      return (
        <EditableCell
          value={amount}
          formattedValue={formatted}
          row={row.index}
          column="tax"
          updateData={(table.options.meta as TableType<Invoice>).updateData}
          type="currency"
          isMissing={isMissing}
        />
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Total Amount"
        className="text-right"
      />
    ),
    cell: ({ row, getValue, table }) => {
      const amount = parseFloat(row.getValue("totalAmount"));
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
          column="totalAmount"
          updateData={(table.options.meta as TableType<Invoice>).updateData}
          type="currency"
        />
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Date"
        className="text-right"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {new Date(row.getValue("date")).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original;
      const removeInvoice = useDataStore((state) => state.removeInvoice);

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
            <DropdownMenuItem
              onClick={() => {
                removeInvoice(invoice.invoiceId);
              }}
              className="text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
