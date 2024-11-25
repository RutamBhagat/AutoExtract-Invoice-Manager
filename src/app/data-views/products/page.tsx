"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { EditProductDialog } from "./_components/edit-product-dialog";
import { Product } from "@/lib/validations/pdf-generate";
import { getColumns } from "./_components/columns";
import { useDataStoreContext } from "@/providers/data-store-provider";
import { useShallow } from "zustand/react/shallow";

export default function ProductsPage() {
  const products = useDataStoreContext(useShallow((state) => state.products));
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const columns = useMemo(
    () => getColumns({ setEditingProduct }),
    [setEditingProduct],
  );

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={products} filterColumn="productName" />
      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => {
            if (!open) setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}
