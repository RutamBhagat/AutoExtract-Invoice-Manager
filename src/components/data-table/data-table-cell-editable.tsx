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
  const inputRef = useRef<HTMLInputElement | null>(null); // Ref for the input

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
    const inputValue = e.target.value; // Always a string
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

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus(); // Ensure focus is set to the input
      setIsEditing(true); // Explicitly set editing mode
    }
  };

  return (
    <>
      {isMissing && !isEditing ? (
        <Tooltip>
          <TooltipTrigger
            asChild
            onClick={(e) => {
              e.stopPropagation(); // Prevent the click from propagating
              focusInput(); // Programmatically focus the input
            }}
          >
            <div className="relative flex items-center">
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
          ref={inputRef} // Attach ref to the input
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          type={type === "currency" ? "number" : type}
          step={type === "currency" ? "0.01" : undefined}
          className={cn(
            "m-0 h-full w-full appearance-none rounded-none border-0 bg-transparent font-medium shadow-none focus-visible:ring-0",
            type !== "text" ? "text-right" : "text-left",
            className,
          )}
        />
      ) : (
        // Read-Only Input Field
        <Input
          ref={inputRef} // Attach ref to the input
          value={formattedValue ?? value}
          onFocus={() => {
            setIsEditing(true); // Track that the user clicked to edit
            if (isMissing) {
              toast.error("This field is missing. Please update it.");
            }
          }}
          type="text"
          readOnly
          className={cn(
            "m-0 h-full w-full appearance-none rounded-none border-0 bg-transparent font-medium shadow-none focus-visible:ring-0",
            type !== "text" ? "text-right" : "text-left",
            className,
          )}
        />
      )}
    </>
  );
}
