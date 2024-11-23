"use client";

import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type UpdateDataFn<T> = (rowIndex: number, columnId: string, value: T) => void;

interface EditableCellProps<T> {
  value: T;
  formattedValue?: string;
  row: number;
  column: string;
  updateData?: UpdateDataFn<T>;
  type?: "text" | "number" | "currency";
  className?: string;
}

export function EditableCell<T extends string | number>({
  value: initialValue,
  formattedValue,
  row,
  column,
  updateData,
  type = "text",
  className,
}: EditableCellProps<T>) {
  const [value, setValue] = useState<T>(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      type === "number" || type === "currency"
        ? (Number(e.target.value) as T)
        : (e.target.value as T);
    setValue(newValue);
    if (updateData) {
      updateData(row, column, newValue);
    }
  };

  const onFocus = () => setIsEditing(true);
  const onBlur = () => setIsEditing(false);

  const containerClasses = cn("h-full cursor-pointer", className);
  const contentClasses = cn(type !== "text" ? "text-right" : "text-left");
  const sharedClasses = cn(
    "m-0 h-full rounded-none border-0 shadow-none focus-visible:ring-0",
    contentClasses,
    containerClasses,
  );

  if (isEditing) {
    return (
      <Input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        type={type === "currency" ? "number" : type}
        step={type === "currency" ? "0.01" : undefined}
        className={sharedClasses}
        autoFocus
      />
    );
  }

  return (
    <Input
      value={formattedValue ?? value}
      onFocus={onFocus}
      type="text"
      readOnly
      className={sharedClasses}
    />
  );
}
