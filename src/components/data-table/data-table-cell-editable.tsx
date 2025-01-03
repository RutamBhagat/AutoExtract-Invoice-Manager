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
  type?: "text" | "number";
  className?: string;
}

const isEmpty = <T extends string | number>(
  value: T,
  type: "text" | "number",
): boolean => {
  if (type === "number") {
    return value === null || value === undefined || Number.isNaN(value);
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
}: EditableCellProps<T>) {
  const [value, setValue] = useState<T>(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isMissing, setIsMissing] = useState<boolean>(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue(initialValue);
    setIsMissing(isEmpty(initialValue, type));
  }, [initialValue, type]);

  const validateValue = (input: string): T | null => {
    if (type === "number") {
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
      const newIsMissing = isEmpty(validatedValue, type);
      setIsMissing(newIsMissing);
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
    const newIsMissing = isEmpty(value, type);
    setIsMissing(newIsMissing);
    if (updateData && isMissing !== newIsMissing) {
      updateData(row, column, value);
    }
  };

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
              className="flex h-full min-h-6 w-full cursor-pointer items-center justify-center"
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
        <Input
          type={type}
          step={type === "number" ? "0.01" : undefined}
          value={value as string}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          className={cn(
            "m-0 h-full w-full appearance-none rounded-none border-0 bg-transparent font-medium shadow-none focus-visible:ring-0",
            type !== "text" ? "text-right" : "text-left",
            className,
          )}
          autoFocus
        />
      ) : (
        <Input
          value={formattedValue ?? (value as string)}
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
