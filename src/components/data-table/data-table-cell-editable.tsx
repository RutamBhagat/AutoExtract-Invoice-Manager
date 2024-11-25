"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { InfoIcon } from "lucide-react";
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
  isMissing?: boolean;
}

const isEmpty = <T extends string | number>(
  value: T,
  type: "text" | "number" | "currency",
): boolean => {
  if (type === "number" || type === "currency") {
    return value === null || value === undefined || value === 0;
  } else {
    return !value || value === "";
  }
};

export function EditableCell<T extends string | number>({
  value: initialValue,
  formattedValue,
  row,
  column,
  updateData,
  type = "text",
  className,
  isMissing: initialIsMissing = false,
}: EditableCellProps<T>) {
  const [value, setValue] = useState<T>(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isMissing, setIsMissing] = useState<boolean>(initialIsMissing);
  const wrapperRef = useRef<HTMLDivElement>(null); // Ref for the cell wrapper

  // Update state when props change
  useEffect(() => {
    setValue(initialValue);
    setIsMissing(isEmpty(initialValue, type));
  }, [initialValue, type]);

  const validateValue = (input: string): T | null => {
    if (type === "number" || type === "currency") {
      const num = Number(input);
      if (isNaN(num) || num < 0) {
        toast.error("Please enter a valid positive number");
        return null;
      }
      return num as T;
    }
    return input as T;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const validatedValue = validateValue(inputValue);

    if (validatedValue !== null) {
      setValue(validatedValue);
      setIsMissing(initialIsMissing && isEmpty(validatedValue, type));
      if (updateData) {
        updateData(row, column, validatedValue);
      }
    }
  };

  const onFocus = () => {
    setIsEditing(true);
    if (isMissing) {
      toast.error("This field is missing. Please update it.");
    }
  };

  const onBlur = () => {
    setIsEditing(false);
    setIsMissing(initialIsMissing && isEmpty(value, type));
  };

  // Handle click outside to stop editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing]);

  return (
    <div ref={wrapperRef} className="relative">
      {isMissing && !isEditing ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center"
              onClick={() => setIsEditing(true)}
            >
              <InfoIcon className="ml-2 h-4 w-4 align-middle text-red-500" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Missing Field - Please update</p>
          </TooltipContent>
        </Tooltip>
      ) : isEditing ? (
        // Editable Input Field
        <Input
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          type={type === "currency" ? "number" : type}
          step={type === "currency" ? "0.01" : undefined}
          className={cn(
            "m-0 h-full w-full appearance-none rounded-none border-0 bg-transparent font-medium shadow-none focus-visible:ring-0",
            type !== "text" ? "text-right" : "text-left",
            className,
          )}
          autoFocus
        />
      ) : (
        // Read-Only Input Field
        <Input
          value={formattedValue ?? value}
          onFocus={onFocus}
          type="text"
          readOnly
          className={cn(
            "m-0 h-full w-full appearance-none rounded-none border-0 bg-transparent font-medium shadow-none focus-visible:ring-0",
            type !== "text" ? "text-right" : "text-left",
            className,
          )}
        />
      )}
    </div>
  );
}
