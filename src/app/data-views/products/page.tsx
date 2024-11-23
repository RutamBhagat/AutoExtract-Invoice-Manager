"use client";

import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { EditProductDialog } from "./edit-product-dialog";
import { Product } from "@/lib/validations/pdf-generate";
import { getColumns } from "./columns";
import { useDataStore } from "@/stores/useDataStore";

// Dummy data
const dummyProducts: Product[] = [
  {
    productId: "1",
    productName: "Laptop Pro X",
    quantity: 50,
    unitPrice: 1299.99,
    tax: 10,
    priceWithTax: 0,
  },
  {
    productId: "2",
    productName: "Wireless Mouse",
    quantity: 100,
    unitPrice: 49.99,
    tax: 5,
    priceWithTax: 0,
  },
  {
    productId: "3",
    productName: "4K Monitor",
    quantity: 30,
    unitPrice: 599.99,
    tax: 8,
    priceWithTax: 0,
  },
  {
    productId: "4",
    productName: "Mechanical Keyboard",
    quantity: 75,
    unitPrice: 159.99,
    tax: 7,
    priceWithTax: 0,
  },
  {
    productId: "5",
    productName: "USB-C Hub",
    quantity: 120,
    unitPrice: 79.99,
    tax: 5,
    priceWithTax: 0,
  },
  {
    productId: "6",
    productName: "Gaming Headset",
    quantity: 60,
    unitPrice: 89.99,
    tax: 6,
    priceWithTax: 0,
  },
  {
    productId: "7",
    productName: "External Hard Drive",
    quantity: 40,
    unitPrice: 119.99,
    tax: 7,
    priceWithTax: 0,
  },
  {
    productId: "8",
    productName: "Smartwatch",
    quantity: 80,
    unitPrice: 249.99,
    tax: 8,
    priceWithTax: 0,
  },
  {
    productId: "9",
    productName: "Bluetooth Speaker",
    quantity: 90,
    unitPrice: 59.99,
    tax: 5,
    priceWithTax: 0,
  },
  {
    productId: "10",
    productName: "HD Webcam",
    quantity: 55,
    unitPrice: 39.99,
    tax: 6,
    priceWithTax: 0,
  },
  {
    productId: "11",
    productName: "Portable Charger",
    quantity: 110,
    unitPrice: 29.99,
    tax: 5,
    priceWithTax: 0,
  },
  {
    productId: "12",
    productName: "Gaming Controller",
    quantity: 70,
    unitPrice: 59.99,
    tax: 6,
    priceWithTax: 0,
  },
  {
    productId: "13",
    productName: "VR Headset",
    quantity: 20,
    unitPrice: 399.99,
    tax: 8,
    priceWithTax: 0,
  },
  {
    productId: "14",
    productName: "Wireless Charger",
    quantity: 105,
    unitPrice: 24.99,
    tax: 5,
    priceWithTax: 0,
  },
  {
    productId: "15",
    productName: "Laptop Stand",
    quantity: 45,
    unitPrice: 34.99,
    tax: 6,
    priceWithTax: 0,
  },
  {
    productId: "16",
    productName: "Cable Organizer",
    quantity: 130,
    unitPrice: 19.99,
    tax: 5,
    priceWithTax: 0,
  },
  {
    productId: "17",
    productName: "Desk Lamp",
    quantity: 65,
    unitPrice: 29.99,
    tax: 6,
    priceWithTax: 0,
  },
  {
    productId: "18",
    productName: "Office Chair",
    quantity: 35,
    unitPrice: 149.99,
    tax: 7,
    priceWithTax: 0,
  },
  {
    productId: "19",
    productName: "Ergonomic Mouse",
    quantity: 85,
    unitPrice: 39.99,
    tax: 5,
    priceWithTax: 0,
  },
  {
    productId: "20",
    productName: "Laptop Cooling Pad",
    quantity: 50,
    unitPrice: 24.99,
    tax: 6,
    priceWithTax: 0,
  },
  {
    productId: "21",
    productName: "Portable SSD",
    quantity: 40,
    unitPrice: 99.99,
    tax: 7,
    priceWithTax: 0,
  },
  {
    productId: "22",
    productName: "Noise-Cancelling Headphones",
    quantity: 60,
    unitPrice: 199.99,
    tax: 8,
    priceWithTax: 0,
  },
  {
    productId: "23",
    productName: "Fitness Tracker",
    quantity: 90,
    unitPrice: 79.99,
    tax: 6,
    priceWithTax: 0,
  },
  {
    productId: "24",
    productName: "Wireless Earbuds",
    quantity: 110,
    unitPrice: 49.99,
    tax: 5,
    priceWithTax: 0,
  },
  {
    productId: "25",
    productName: "Gaming Mouse",
    quantity: 70,
    unitPrice: 69.99,
    tax: 6,
    priceWithTax: 0,
  },
  {
    productId: "26",
    productName: "External SSD",
    quantity: 30,
    unitPrice: 129.99,
    tax: 7,
    priceWithTax: 0,
  },
  {
    productId: "27",
    productName: "Smart Home Hub",
    quantity: 45,
    unitPrice: 89.99,
    tax: 6,
    priceWithTax: 0,
  },
  {
    productId: "28",
    productName: "Wireless Router",
    quantity: 55,
    unitPrice: 99.99,
    tax: 7,
    priceWithTax: 0,
  },
  {
    productId: "29",
    productName: "Portable Projector",
    quantity: 25,
    unitPrice: 299.99,
    tax: 8,
    priceWithTax: 0,
  },
  {
    productId: "30",
    productName: "Bluetooth Keyboard",
    quantity: 65,
    unitPrice: 49.99,
    tax: 5,
    priceWithTax: 0,
  },
  {
    productId: "31",
    productName: "Laptop Bag",
    quantity: 80,
    unitPrice: 39.99,
    tax: 6,
    priceWithTax: 0,
  },
  {
    productId: "32",
    productName: "Desk Organizer",
    quantity: 75,
    unitPrice: 24.99,
    tax: 5,
    priceWithTax: 0,
  },
  {
    productId: "33",
    productName: "Ergonomic Keyboard",
    quantity: 50,
    unitPrice: 59.99,
    tax: 6,
    priceWithTax: 0,
  },
  {
    productId: "34",
    productName: "Portable Speaker",
    quantity: 95,
    unitPrice: 34.99,
    tax: 5,
    priceWithTax: 0,
  },
  {
    productId: "35",
    productName: "Laptop Docking Station",
    quantity: 40,
    unitPrice: 119.99,
    tax: 7,
    priceWithTax: 0,
  },
  {
    productId: "36",
    productName: "Wireless Printer",
    quantity: 30,
    unitPrice: 199.99,
    tax: 8,
    priceWithTax: 0,
  },
  {
    productId: "37",
    productName: "Smart Thermostat",
    quantity: 20,
    unitPrice: 149.99,
    tax: 7,
    priceWithTax: 0,
  },
  {
    productId: "38",
    productName: "Portable Hard Drive",
    quantity: 50,
    unitPrice: 79.99,
    tax: 6,
    priceWithTax: 0,
  },
  {
    productId: "39",
    productName: "Gaming Chair",
    quantity: 25,
    unitPrice: 249.99,
    tax: 8,
    priceWithTax: 0,
  },
];

export default function ProductsPage() {
  const products = useDataStore((state) => state.products);
  const setProducts = useDataStore((state) => state.setProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (products.length === 0) {
      setProducts(dummyProducts);
    }
  }, [products.length, setProducts]);

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
