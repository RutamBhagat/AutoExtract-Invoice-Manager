"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/lib/validations/pdf-generate";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EditableCell } from "@/components/data-table/data-table-cell-editable";
import { TableType } from "@/types/table";
import { useDataStoreContext } from "@/providers/data-store-provider";

export const getColumns = (): ColumnDef<Customer, string | number>[] => [
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
        updateData={(table.options.meta as TableType<Customer>).updateData}
        type="text"
      />
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone Number" />
    ),
    cell: ({ row, getValue, table }) => (
      <EditableCell
        value={getValue() as string}
        row={row.index}
        column="phoneNumber"
        updateData={(table.options.meta as TableType<Customer>).updateData}
        type="text"
        className="text-right"
      />
    ),
  },
  {
    accessorKey: "totalPurchaseAmount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Total Purchase Amount"
        className="text-right"
      />
    ),
    cell: ({ row, getValue, table }) => {
      const amount = parseFloat(row.getValue("totalPurchaseAmount"));
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
          column="totalPurchaseAmount"
          updateData={(table.options.meta as TableType<Customer>).updateData}
          type="currency"
        />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;
      const removeCustomer = useDataStoreContext(
        (state) => state.removeCustomer,
      );

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
                removeCustomer(customer.customerId);
              }}
              className="text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
