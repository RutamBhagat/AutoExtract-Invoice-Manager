"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EditableCell } from "@/components/data-table/data-table-cell-editable";
import { Invoice } from "@/lib/validations/pdf-generate";
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
    cell: ({ row, getValue }) => {
      const columnId = "serialNumber";
      return (
        <EditableCell
          value={getValue() as string}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              updateInvoice(invoiceId, { [columnId]: value });
            }
          }}
          type="text"
        />
      );
    },
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer Name" />
    ),
    cell: ({ row, getValue }) => {
      const columnId = "customerName";
      return (
        <EditableCell
          value={getValue() as string}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              updateInvoice(invoiceId, { [columnId]: value });
            }
          }}
          type="text"
        />
      );
    },
  },
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
    cell: ({ row, getValue }) => {
      const columnId = "productName";
      return (
        <EditableCell
          value={getValue() as string}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              updateInvoice(invoiceId, { [columnId]: value });
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
      const value = getValue() as number | undefined;
      return (
        <EditableCell
          value={value ?? ""}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              updateInvoice(invoiceId, {
                [columnId]: value ? Number(value) : undefined,
              });
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
      const amount = parseFloat(row.getValue("tax"));
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
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              updateInvoice(invoiceId, { [columnId]: value });
            }
          }}
          type="number"
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
    cell: ({ row, getValue }) => {
      const columnId = "totalAmount";
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
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              updateInvoice(invoiceId, { [columnId]: value });
            }
          }}
          type="number"
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
    cell: ({ row, getValue }) => {
      const columnId = "date";
      return (
        <EditableCell
          value={getValue() as string}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const invoiceId = row.original.invoiceId;
            if (invoiceId) {
              updateInvoice(invoiceId, { [columnId]: value });
            }
          }}
          type="text"
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
