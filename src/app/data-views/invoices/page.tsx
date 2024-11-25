"use client";

import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./_components/columns";
import { useDataStoreContext } from "@/providers/data-store-provider";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

export default function InvoicesPage() {
  const invoices = useDataStoreContext(useShallow((state) => state.invoices));
  const columns = useMemo(() => getColumns(), []);

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
