"use client";

import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./_components/columns";
import { useDataStore } from "@/stores/useDataStore";
import { useMemo } from "react";

export default function CustomersPage() {
  const customers = useDataStore((state) => state.customers);
  const columns = useMemo(() => getColumns(), []);

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={customers}
        filterColumn="customerName"
      />
    </div>
  );
}
