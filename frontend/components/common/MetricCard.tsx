import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
  iconClassName?: string;
}

export function MetricCard({ title, value, icon: Icon, className, iconClassName }: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          </div>
          {Icon && (
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0", iconClassName)}>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
