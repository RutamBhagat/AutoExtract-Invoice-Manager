"use client"

import React, { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface EditableCellProps {
  value: string | number
  row: number
  column: string
  updateData?: (rowIndex: number, columnId: string, value: any) => void
  type?: "text" | "number" | "currency"
}

export function EditableCell({
  value: initialValue,
  row: rowIndex,
  column: columnId,
  updateData,
  type = "text",
}: EditableCellProps) {
  const [value, setValue] = useState(initialValue)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === "number" ? Number(e.target.value) : e.target.value
    setValue(newValue)
  }

  const onBlur = () => {
    setIsEditing(false)
    updateData?.(rowIndex, columnId, value)
  }

  const formatValue = (val: string | number) => {
    if (type === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(val))
    }
    return val
  }

  return isEditing ? (
    <Input
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      type={type === "currency" ? "number" : type}
      step={type === "currency" ? "0.01" : undefined}
      className="h-8 w-full"
      autoFocus
    />
  ) : (
    <div
      className={cn(
        "h-8 cursor-pointer px-2 py-1",
        type !== "text" && "text-right"
      )}
      onClick={() => setIsEditing(true)}
    >
      {formatValue(value)}
    </div>
  )
} 