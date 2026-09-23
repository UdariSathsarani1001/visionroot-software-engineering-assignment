"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "spinner" | "skeleton";
  text?: string;
  lines?: number;
}

export function LoadingState({ className, variant = "spinner", text = "Loading...", lines = 4, ...props }: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3 w-full", className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-3/5" : "w-full")} />
        ))}
      </div>
    );
  }
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 p-8", className)} {...props}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
