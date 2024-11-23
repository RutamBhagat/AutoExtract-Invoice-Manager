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

  // Base container classes without padding
  const containerClasses = cn(
    "h-full cursor-pointer",
    className
  );

  // Text alignment based on type
  const contentClasses = cn(
    type !== "text" ? "text-right" : "text-left"
  );

  return (
    <div className={containerClasses}>
      {isEditing ? (
        <Input
          value={value as string | number}
          onChange={onChange}
          onBlur={onBlur}
          type={type === "currency" ? "number" : type}
          className={cn(
            "h-full m-0 border-0 rounded-none shadow-none focus-visible:ring-0",
            contentClasses
          )}
          autoFocus
        />
      ) : (
        <div
          className={cn("h-full flex items-center", contentClasses)}
          onClick={() => setIsEditing(true)}
        >
          {formatValue(value)}
        </div>
      )}
    </div>
  );
}