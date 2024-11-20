"use client";

import { Button, type ButtonProps } from "@/components/ui/button";

import { toast } from "sonner";

interface SonnerDemoProps extends ButtonProps {
  buttonText?: string;
  toastMessage?: string;
  toastDescription?: string;
  buttonVariant?: ButtonProps["variant"];
  actionLabel?: string;
  onActionClick?: () => void;
}

export function SonnerDemo({
  buttonText = "Show Toast",
  toastMessage = "Notification",
  toastDescription,
  buttonVariant = "outline",
  actionLabel,
  onActionClick,
  ...buttonProps
}: SonnerDemoProps) {
  return (
    <Button
      variant={buttonVariant}
      onClick={() =>
        toast(toastMessage, {
          description: toastDescription,
          ...(actionLabel &&
            onActionClick && {
              action: {
                label: actionLabel,
                onClick: onActionClick,
              },
            }),
        })
      }
      {...buttonProps}
    >
      {buttonText}
    </Button>
  );
}
