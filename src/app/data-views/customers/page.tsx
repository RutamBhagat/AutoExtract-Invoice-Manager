"use client";

import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./_components/columns";
import { useDataStore } from "@/stores/use-data-store";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

export default function CustomersPage() {
  const customers = useDataStore(useShallow((state) => state.customers));
  const updateCustomer = useDataStore(
    useShallow((state) => state.updateCustomer),
  );
  const removeCustomer = useDataStore(
    useShallow((state) => state.removeCustomer),
  );
  const columns = useMemo(
    () => getColumns({ updateCustomer, removeCustomer }),
    [updateCustomer, removeCustomer],
  );

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
