"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { AlertBanner } from "@/components/common/AlertBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { requestService } from "@/services/request.service";
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "@/lib/constants";
import { RequestCategory, RequestPriority } from "@/types/request";
import { FrontendError } from "@/services/api";
import { useState } from "react";

const createSchema = z.object({
  title: z.string().min(1, "Title is required").min(3, "Title must be at least 3 characters").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters").max(2000, "Description is too long"),
  category: z.enum(["TECHNICAL", "BILLING", "ACCOUNT", "OTHER"], { error: "Select a category" }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"], { error: "Select a priority" }),
});

type CreateForm = z.infer<typeof createSchema>;

export default function NewRequestPage() {
  return (
    <ProtectedRoute requireUser>
      <AppShell>
        <NewRequestContent />
      </AppShell>
    </ProtectedRoute>
  );
}

function NewRequestContent() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });

  const category = watch("category");
  const priority = watch("priority");

  const onSubmit = async (data: CreateForm) => {
    setServerError(null);
    try {
      const req = await requestService.createRequest({
        title: data.title,
        description: data.description,
        category: data.category as RequestCategory,
        priority: data.priority as RequestPriority,
      });
      toast.success("Request submitted successfully!");
      router.push(`/requests/${req._id}`);
    } catch (err) {
      const fe = err as FrontendError;
      setServerError(fe.message || "Failed to create request");
    }
  };

  return (
    <div className="space-y-5 mx-auto">
      <PageHeader
        title="New Service Request"
        description="Describe your issue or request in detail"
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {serverError && (
        <AlertBanner variant="error" title="Submission failed" description={serverError} onClose={() => setServerError(null)} />
      )}

      <Card className="max-w-7xl mx-auto">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="Brief summary of the issue"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the issue..."
                rows={5}
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select
                  value={category}
                  onValueChange={(v) => setValue("category", v as CreateForm["category"], { shouldValidate: true })}
                >
                  <SelectTrigger id="category" className="w-full" aria-invalid={!!errors.category}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority <span className="text-destructive">*</span></Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setValue("priority", v as CreateForm["priority"], { shouldValidate: true })}
                >
                  <SelectTrigger id="priority" className="w-full" aria-invalid={!!errors.priority}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-xs text-destructive">{errors.priority.message}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
