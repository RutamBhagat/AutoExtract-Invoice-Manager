"use client";

import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./_components/columns";
import { useDataStore } from "@/stores/use-data-store";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

export default function ProductsPage() {
  const products = useDataStore(useShallow((state) => state.products));
  const updateProduct = useDataStore(
    useShallow((state) => state.updateProduct),
  );
  const removeProduct = useDataStore(
    useShallow((state) => state.removeProduct),
  );

  const columns = useMemo(
    () => getColumns({ updateProduct, removeProduct }),
    [updateProduct, removeProduct],
  );

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={products} filterColumn="productName" />
    </div>
  );
}
