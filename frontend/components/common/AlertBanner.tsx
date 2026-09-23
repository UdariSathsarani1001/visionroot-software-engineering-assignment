"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const alertBannerVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200 [&>svg]:text-blue-600",
        success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200 [&>svg]:text-green-600",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-200 [&>svg]:text-yellow-600",
        error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200 [&>svg]:text-red-600",
      },
    },
    defaultVariants: { variant: "info" },
  }
);

const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: AlertCircle };

export interface AlertBannerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertBannerVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: () => void;
}

export function AlertBanner({ className, variant = "info", title, description, action, onClose, ...props }: AlertBannerProps) {
  const Icon = icons[variant ?? "info"];
  return (
    <div role="alert" className={cn(alertBannerVariants({ variant }), className)} {...props}>
      <Icon className="h-4 w-4" />
      <div className="flex flex-col gap-1">
        {title && <h5 className="font-medium leading-none">{title}</h5>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {(action || onClose) && (
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {action}
          {onClose && (
            <button onClick={onClose} className="rounded-md p-1 hover:bg-black/5 transition-colors" aria-label="Close alert">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
