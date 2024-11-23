"use client";

import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  const validateValue = (value: string): T | null => {
    if (type === "number" || type === "currency") {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        toast.error("Please enter a valid positive number");
        return null;
      }
      return num as T;
    }
    return value as T;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validatedValue = validateValue(e.target.value);
    if (validatedValue !== null) {
      setValue(validatedValue);
      if (updateData) {
        updateData(row, column, validatedValue);
      }
    }
  };

  const onFocus = () => setIsEditing(true);
  const onBlur = () => setIsEditing(false);

  const containerClasses = cn("h-full cursor-pointer", className);
  const contentClasses = cn(type !== "text" ? "text-right" : "text-left");
  const sharedClasses = cn(
    "m-0 h-full rounded-none font-medium border-0 shadow-none focus-visible:ring-0",
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
