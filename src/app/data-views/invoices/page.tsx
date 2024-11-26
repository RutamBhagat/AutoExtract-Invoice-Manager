"use client";

import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./_components/columns";
import { useDataStore } from "@/stores/use-data-store";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

export default function InvoicesPage() {
  const invoices = useDataStore(useShallow((state) => state.invoices));
  const updateInvoice = useDataStore(
    useShallow((state) => state.updateInvoice),
  );
  const removeInvoice = useDataStore(
    useShallow((state) => state.removeInvoice),
  );
  const columns = useMemo(
    () => getColumns({ updateInvoice, removeInvoice }),
    [updateInvoice, removeInvoice],
  ); // Pass updateInvoice and removeInvoice

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={invoices}
        filterColumn="serialNumber"
      />
    </div>
  );
}
