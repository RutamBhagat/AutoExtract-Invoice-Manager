"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EditableCell } from "@/components/data-table/data-table-cell-editable";
import type { Invoice } from "@/stores/use-data-store"; // Change import to use store type
import { Trash } from "lucide-react";

interface InvoicesColumnProps {
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;
  removeInvoice: (invoiceId: string) => void;
}

export const getColumns = ({
  updateInvoice,
  removeInvoice,
}: InvoicesColumnProps): ColumnDef<Invoice, string | number>[] => [
  {
    accessorKey: "serialNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial Number" />
    ),
    cell: ({ row, getValue, table }) => {
      const columnId = "serialNumber";
      const isMissing = row.original.missingFields?.includes(columnId);
      return (
        <EditableCell
          value={getValue() as string}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value, isMissing) => {
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              const updates: Partial<Invoice> = { [columnId]: value };
              if (isMissing) {
                updates.missingFields = [
                  ...(row.original.missingFields || []),
                  columnId,
                ];
              } else {
                updates.missingFields = (
                  row.original.missingFields || []
                ).filter((field) => field !== columnId);
              }
              updateInvoice(invoiceId, updates);
            }
          }}
          type="text"
          isMissing={isMissing}
        />
      );
    },
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer Name" />
    ),
    cell: ({ row, getValue, table }) => {
      const columnId = "customerName";
      const isMissing = row.original.missingFields?.includes(columnId);
      return (
        <EditableCell
          value={getValue() as string}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value, isMissing) => {
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              const updates: Partial<Invoice> = { [columnId]: value };
              if (isMissing) {
                updates.missingFields = [
                  ...(row.original.missingFields || []),
                  columnId,
                ];
              } else {
                updates.missingFields = (
                  row.original.missingFields || []
                ).filter((field) => field !== columnId);
              }
              updateInvoice(invoiceId, updates);
            }
          }}
          type="text"
          isMissing={isMissing}
        />
      );
    },
  },
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
    cell: ({ row, getValue, table }) => {
      const columnId = "productName";
      const isMissing = row.original.missingFields?.includes(columnId);
      return (
        <EditableCell
          value={getValue() as string}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value, isMissing) => {
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              const updates: Partial<Invoice> = { [columnId]: value };
              if (isMissing) {
                updates.missingFields = [
                  ...(row.original.missingFields || []),
                  columnId,
                ];
              } else {
                updates.missingFields = (
                  row.original.missingFields || []
                ).filter((field) => field !== columnId);
              }
              updateInvoice(invoiceId, updates);
            }
          }}
          type="text"
          isMissing={isMissing}
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
    cell: ({ row, getValue, table }) => {
      const columnId = "quantity";
      const value = getValue() as number | undefined;
      const isMissing = row.original.missingFields?.includes(columnId);
      return (
        <EditableCell
          value={value ?? ""} // Handle undefined case
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value, isMissing) => {
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              const updates: Partial<Invoice> = {
                [columnId]: value ? Number(value) : undefined,
              };
              if (isMissing) {
                updates.missingFields = [
                  ...(row.original.missingFields || []),
                  columnId,
                ];
              } else {
                updates.missingFields = (
                  row.original.missingFields || []
                ).filter((field) => field !== columnId);
              }
              updateInvoice(invoiceId, updates);
            }
          }}
          type="number"
          isMissing={isMissing}
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
    cell: ({ row, getValue, table }) => {
      const columnId = "tax";
      const amount = parseFloat(row.getValue("tax"));
      const currency = row.original.currency || "USD";
      const isMissing = row.original.missingFields?.includes(columnId);
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
          updateData={(rowIndex, columnId, value, isMissing) => {
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              const updates: Partial<Invoice> = { [columnId]: value };
              if (isMissing) {
                updates.missingFields = [
                  ...(row.original.missingFields || []),
                  columnId,
                ];
              } else {
                updates.missingFields = (
                  row.original.missingFields || []
                ).filter((field) => field !== columnId);
              }
              updateInvoice(invoiceId, updates);
            }
          }}
          type="number"
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
      const columnId = "totalAmount";
      const amount = parseFloat(row.getValue("totalAmount"));
      const currency = row.original.currency || "USD";
      const isMissing = row.original.missingFields?.includes(columnId);
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
          updateData={(rowIndex, columnId, value, isMissing) => {
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              const updates: Partial<Invoice> = { [columnId]: value };
              if (isMissing) {
                updates.missingFields = [
                  ...(row.original.missingFields || []),
                  columnId,
                ];
              } else {
                updates.missingFields = (
                  row.original.missingFields || []
                ).filter((field) => field !== columnId);
              }
              updateInvoice(invoiceId, updates);
            }
          }}
          type="number"
          isMissing={isMissing}
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
    cell: ({ row, getValue, table }) => {
      const columnId = "date";
      const isMissing = row.original.missingFields?.includes(columnId);
      return (
        <EditableCell
          value={getValue() as string}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value, isMissing) => {
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              const updates: Partial<Invoice> = { [columnId]: value };
              if (isMissing) {
                updates.missingFields = [
                  ...(row.original.missingFields || []),
                  columnId,
                ];
              } else {
                updates.missingFields = (
                  row.original.missingFields || []
                ).filter((field) => field !== columnId);
              }
              updateInvoice(invoiceId, updates);
            }
          }}
          type="text"
          isMissing={isMissing}
        />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original;

      return (
        <div className="flex h-full w-full items-center justify-center">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-red-500 hover:text-white"
            onClick={() => {
              removeInvoice(invoice.invoiceId);
            }}
          >
            <span className="sr-only">Delete Invoice</span>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
