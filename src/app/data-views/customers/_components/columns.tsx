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
        className="text-right"
      />
    ),
    cell: ({ row, getValue }) => {
      const columnId = "phoneNumber";
      const phoneNumber = parseFloat(row.getValue(columnId));

      return (
        <EditableCell
          value={phoneNumber}
          row={row.index}
          column={columnId}
          updateData={(rowIndex, columnId, value) => {
            const customerId = row.original.customerId;
            if (customerId) {
              updateCustomer(customerId, { [columnId]: value });
            }
          }}
          className="text-right"
          type="text"
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
      const amount = parseFloat(row.getValue(columnId));
      const currency = row.original.currency || "USD";
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={() => {
          const customerId = row.original.customerId;
          if (customerId) {
            removeCustomer(customerId);
          }
        }}
      >
        <Trash className="h-4 w-4" />
      </Button>
    ),
  },
];
