"use client";

import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type UpdateDataFn<T> = (rowIndex: number, columnId: string, value: T) => void;

interface EditableCellProps<T> {
  value: T;
  row: number;
  column: string;
  updateData?: UpdateDataFn<T>;
  type?: "text" | "number" | "currency";
  className?: string;
}

export function EditableCell<T extends string | number>({
  value: initialValue,
  type = "text",
  className,
}: EditableCellProps<T>) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      type === "number" ? (Number(e.target.value) as T) : (e.target.value as T);
    setValue(newValue);
  };

  // Base container classes without padding
  const containerClasses = cn("h-full cursor-pointer", className);

  // Text alignment based on type
  const contentClasses = cn(type !== "text" ? "text-right" : "text-left");

  return (
    <Input
      value={value as string | number}
      onChange={onChange}
      type={type === "currency" ? "number" : type}
      className={cn(
        "m-0 h-full rounded-none border-0 shadow-none focus-visible:ring-0",
        contentClasses,
        containerClasses,
      )}
      autoFocus
    />
  );
}
