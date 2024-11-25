import React, { useEffect, useState } from "react";

import { Input } from "../ui/input";
import { toast } from "sonner";

interface EditableCellProps<T> {
  value: T;
  formattedValue?: string;
  row: number;
  column: string;
  updateData?: (row: number, column: string, value: T) => void;
  type?: "text" | "number" | "currency";
  className?: string;
  isMissing?: boolean;
}

export function EditableCell<T extends string | number>({
  value: initialValue,
  formattedValue,
  row,
  column,
  updateData,
  type = "text",
  className,
  isMissing = false,
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

  const onBlur = () => {
    setIsEditing(false);
  };

  const onFocus = () => {
    setIsEditing(true);
  };

  const inputClasses = `${className} ${isMissing ? "border-red-500" : ""}`;

  if (isEditing) {
    return (
      <Input
        value={isMissing ? "" : value}
        onChange={onChange}
        onBlur={onBlur}
        type={type === "currency" ? "number" : type}
        step={type === "currency" ? "0.01" : undefined}
        className={inputClasses}
        autoFocus
      />
    );
  }

  return (
    <Input
      value={isMissing ? "" : (formattedValue ?? value)}
      onFocus={onFocus}
      type="text"
      readOnly
      className={inputClasses}
    />
  );
}
