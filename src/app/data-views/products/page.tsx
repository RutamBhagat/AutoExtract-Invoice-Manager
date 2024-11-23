"use client"

import { useDataStore } from "@/stores/useDataStore"
import { DataTable } from "@/components/data-table/data-table"
import { columns } from "./columns"

export default function ProductsPage() {
  const products = useDataStore((state) => state.products)

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={products} />
    </div>
  )
}

