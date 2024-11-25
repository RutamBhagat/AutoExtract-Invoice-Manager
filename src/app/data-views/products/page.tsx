"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { EditProductDialog } from "./_components/edit-product-dialog";
import { Product } from "@/lib/validations/pdf-generate";
import { getColumns } from "./_components/columns";
import { useDataStore } from "@/stores/use-data-store";

export default function ProductsPage() {
  const products = useDataStore((state) => state.products);
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
