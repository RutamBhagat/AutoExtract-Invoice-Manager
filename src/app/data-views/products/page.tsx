"use client"

import { useState } from "react"
import { useDataStore } from "@/stores/useDataStore"
import { DataTable } from "@/components/data-table/data-table"
import { columns } from "./columns"
import { EditProductDialog } from "./edit-product-dialog"
import { Product } from "@/lib/validations/pdf-generate"

export default function ProductsPage() {
  const products = useDataStore((state) => state.products)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  return (
    <div className="container mx-auto py-10">
      <DataTable 
        columns={columns} 
        data={products} 
        filterColumn="productName"
      />
      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => {
            if (!open) setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}

