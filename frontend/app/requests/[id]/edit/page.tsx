"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { AlertBanner } from "@/components/common/AlertBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { requestService } from "@/services/request.service";
import { ServiceRequest } from "@/types/request";
import { FrontendError } from "@/services/api";
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "@/lib/constants";

const editSchema = z.object({
  title: z.string().min(1, "Title is required").min(3, "Too short").max(200, "Too long"),
  description: z.string().min(1, "Description is required").min(10, "Too short").max(2000, "Too long"),
  category: z.enum(["TECHNICAL", "BILLING", "ACCOUNT", "OTHER"], { error: "Select a category" }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"], { error: "Select a priority" }),
});

type EditForm = z.infer<typeof editSchema>;

export default function EditRequestPage() {
  return (
    <ProtectedRoute requireUser>
      <AppShell>
        <EditRequestContent />
      </AppShell>
    </ProtectedRoute>
  );
}

function EditRequestContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loadingReq, setLoadingReq] = useState(true);
  const [loadError, setLoadError] = useState<FrontendError | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  const category = watch("category");
  const priority = watch("priority");

  useEffect(() => {
    const load = async () => {
      setLoadingReq(true);
      setLoadError(null);
      try {
        const data = await requestService.getRequestById(id);
        setRequest(data);
        if (data.status !== "PENDING") {
          toast.error("This request cannot be edited");
          router.replace(`/requests/${id}`);
          return;
        }
        reset({
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
        });
      } catch (err) {
        setLoadError(err as FrontendError);
      } finally {
        setLoadingReq(false);
      }
    };
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: EditForm) => {
    setServerError(null);
    try {
      await requestService.updateRequest(id, {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
      });
      toast.success("Request updated!");
      router.push(`/requests/${id}`);
    } catch (err) {
      const fe = err as FrontendError;
      // If backend rejected due to status change between load and submit
      if (fe.code === "REQUEST_NOT_EDITABLE" || fe.status === 409 || fe.status === 400) {
        toast.error("This request can no longer be edited");
        router.replace(`/requests/${id}`);
        return;
      }
      setServerError(fe.message || "Failed to update request");
    }
  };

  if (loadingReq) return <LoadingState text="Loading request..." className="min-h-[300px]" />;

  if (loadError) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        <AlertBanner variant="error" title="Failed to load request" description={loadError.message} />
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Edit Request"
        description="Update your request details"
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />Back
          </Button>
        }
      />

      {serverError && (
        <AlertBanner variant="error" title="Update failed" description={serverError} onClose={() => setServerError(null)} />
      )}

      <Card className="max-w-7xl mx-auto">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea id="description" rows={5} aria-invalid={!!errors.description} {...register("description")} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label>Category <span className="text-destructive">*</span></Label>
                <Select value={category} onValueChange={(v) => setValue("category", v as EditForm["category"], { shouldValidate: true })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Priority <span className="text-destructive">*</span></Label>
                <Select value={priority} onValueChange={(v) => setValue("priority", v as EditForm["priority"], { shouldValidate: true })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-xs text-destructive">{errors.priority.message}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push(`/requests/${id}`)}>
                Discard
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
