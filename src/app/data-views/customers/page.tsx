"use client";

import { Customer } from "@/lib/validations/pdf-generate"; // Import Customer type
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./_components/columns";
import { useDataStoreContext } from "@/providers/data-store-provider";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

export default function CustomersPage() {
  const customers = useDataStoreContext(useShallow((state) => state.customers));
  const updateCustomer = useDataStoreContext(
    useShallow((state) => state.updateCustomer),
  );
  const removeCustomer = useDataStoreContext(
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
