"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/lib/validations/pdf-generate";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EditableCell } from "@/components/data-table/data-table-cell-editable";
import { Trash } from "lucide-react";

interface CustomersColumnProps {
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  removeCustomer: (customerId: string) => void;
}

export const getColumns = ({
  updateCustomer,
  removeCustomer,
}: CustomersColumnProps): ColumnDef<Customer, string | number>[] => [
  {
    accessorKey: "customerName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer Name" />
    ),
    cell: ({ row, getValue }) => {
      const columnId = "customerName";
      const isMissing = row.original.missingFields?.includes(columnId);
      return (
        <EditableCell
          value={getValue() as string}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const customerId = row.original.customerId;
            if (customerId) {
              updateCustomer(customerId, { [columnId]: value });
            }
          }}
          type="text"
          isMissing={isMissing}
        />
      );
    },
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Phone Number"
        className="text-right" // Ensure header aligns right
      />
    ),
    cell: ({ row, getValue }) => {
      const columnId = "phoneNumber";
      const isMissing = row.original.missingFields?.includes(columnId);
      return (
        <EditableCell
          value={getValue() as string}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const customerId = row.original.customerId;
            if (customerId) {
              updateCustomer(customerId, { [columnId]: value });
            }
          }}
          type="text"
          className="text-right" // Add this to align text to the right
          isMissing={isMissing}
        />
      );
    },
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
    cell: ({ row, getValue }) => {
      const columnId = "totalPurchaseAmount";
      const isMissing = row.original.missingFields?.includes(columnId);
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
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const customerId = row.original.customerId;
            if (customerId) {
              updateCustomer(customerId, { [columnId]: value });
            }
          }}
          type="number"
          isMissing={isMissing}
        />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;

      return (
        <div className="flex h-full w-full items-center justify-center">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-red-500 hover:text-white"
            onClick={() => {
              removeCustomer(customer.customerId);
            }}
          >
            <span className="sr-only">Delete Customer</span>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
