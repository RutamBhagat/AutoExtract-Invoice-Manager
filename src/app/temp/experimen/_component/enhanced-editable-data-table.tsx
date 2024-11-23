"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, Plus, Trash2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"; // New import
import { useForm } from "react-hook-form";

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
];

const EnhancedEditableDataTable = () => {
  interface RowData {
    id: string;
    amount: number | null;
    status: string;
    email: string;
  }

  const [data, setData] = useState<RowData[]>([
    {
      id: "m5gr84i9",
      amount: 316,
      status: "success",
      email: "john@example.com",
    },
    {
      id: "3u1reuv4",
      amount: null,
      status: "pending",
      email: "jane@example.com",
    },
    {
      id: "5tr7tu1q",
      amount: 754,
      status: "processing",
      email: "bob@example.com",
    },
    {
      id: "9y2x1z8w",
      status: "failed",
      email: "alice@example.com",
      amount: null,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState<RowData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingRow, setDeletingRow] = useState(null);

  const form = useForm({
    defaultValues: {
      email: "",
      amount: "",
      status: "",
    },
  });

  const columns = [
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: Row<any> }) => {
        const status = row.getValue("status");
        return loading ? (
          <Skeleton className="h-6 w-20" />
        ) : (
          <div
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
              status === "success"
                ? "bg-green-100 text-green-800"
                : status === "failed"
                  ? "bg-red-100 text-red-800"
                  : status === "processing"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {String(status) || "Not set"}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: { row: Row<any> }) => {
        return loading ? (
          <Skeleton className="h-6 w-[250px]" />
        ) : (
          <div className="lowercase">{row.getValue("email") || "No email"}</div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: { row: Row<any> }) => {
        const amount = row.getValue("amount");
        if (loading) {
          return <Skeleton className="h-6 w-[100px]" />;
        }
        if (amount === null || amount === undefined) {
          return <div className="text-muted-foreground">Not set</div>;
        }
        return (
          <div className="text-right font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(Number(amount))}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: { row: Row<any> }) => {
        return loading ? (
          <Skeleton className="h-10 w-20" />
        ) : (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 transition-colors duration-200 hover:bg-slate-200"
              onClick={() => handleEdit(row.original)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 transition-colors duration-200 hover:bg-red-100"
                  onClick={() => setDeletingRow(row.original)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the record.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleDelete(row.original.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleEdit = (row: any) => {
    setEditingRow(row);
    form.reset({
      email: row.email || "",
      amount: row.amount || "",
      status: row.status || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData(data.filter((item) => item.id !== id));
      setLoading(false);
      toast("Record deleted", {
        description: "The record has been successfully deleted.",
      });
    }, 1000);
  };

  const onSubmit = async (formData: { amount: string }) => {
    setLoading(true);
    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!editingRow) return;
      setData(
        data.map((item) =>
          item.id === editingRow.id
            ? {
                ...item,
                ...formData,
                amount: formData.amount ? parseFloat(formData.amount) : null,
              }
            : item,
        ),
      );

      toast("Changes saved", {
        description: "Your changes have been successfully saved.",
      });

      setIsDialogOpen(false);
      setEditingRow(null);
    } catch (error) {
      toast("Error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add New</span>
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-100">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-bold text-slate-700"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Row</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedEditableDataTable;
