"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Product } from "@/lib/validations/pdf-generate";
import { getColumns } from "./_components/columns";
import { useDataStoreContext } from "@/providers/data-store-provider";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

export default function ProductsPage() {
  const products = useDataStoreContext(useShallow((state) => state.products));
  const updateProduct = useDataStoreContext(
    useShallow((state) => state.updateProduct),
  );
  const removeProduct = useDataStoreContext(
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
