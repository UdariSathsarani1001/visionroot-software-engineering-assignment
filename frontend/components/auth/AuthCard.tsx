import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AuthCard({ className, title, description, children, ...props }: AuthCardProps) {
  return (
    <div
      className={cn("flex min-h-screen flex-col items-center justify-center py-12 px-4", className)}
      {...props}
    >
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">VisionRoot</h1>
          <p className="text-xs text-muted-foreground mt-1">Service Request Management</p>
        </div>
        <Card className="border-t-4 border-t-primary">
          <CardContent className="pt-6 pb-6 px-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">{title}</h2>
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
