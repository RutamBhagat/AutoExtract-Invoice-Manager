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
  row: rowIndex,
  column: columnId,
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
      type === "number" ? (Number(e.target.value) as T) : (e.target.value as T);
    setValue(newValue);
  };

  const onBlur = () => {
    setIsEditing(false);
    updateData?.(rowIndex, columnId, value);
  };

  const formatValue = (val: string | number) => {
    if (type === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(val));
    }
    return val;
  };

  const commonContainerClasses = cn(
    "cursor-pointer w-full h-full", // Make container full width and height
    className
  );

  const inputClasses = cn(
    type !== "text" ? "text-right" : "text-left",
    "w-full h-full" // Make input full width and height
  );

  const displayValueClasses = cn(
      commonContainerClasses,
      "flex items-center px-2",
      type !== "text" ? "justify-end" : "justify-start"
  )
  return isEditing ? (
    <Input
      value={value as string | number}
      onChange={onChange}
      onBlur={onBlur}
      type={type === "currency" ? "number" : type}
      className={inputClasses}
      autoFocus
    />
  ) : (
    <div
      className={displayValueClasses}
      onClick={() => setIsEditing(true)}
    >
      {formatValue(value)}
    </div>
  );
}