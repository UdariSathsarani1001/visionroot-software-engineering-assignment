"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Edit2, XCircle, Clock, RefreshCw } from "lucide-react";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { AlertBanner } from "@/components/common/AlertBanner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LinkButton } from "@/components/common/LinkButton";
import { StatusBadge, PriorityBadge } from "@/components/requests/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requestService } from "@/services/request.service";
import { ServiceRequest } from "@/types/request";
import { FrontendError } from "@/services/api";
import { REQUEST_CATEGORY_LABELS } from "@/lib/constants";

export default function RequestDetailPage() {
  return (
    <ProtectedRoute requireUser>
      <AppShell>
        <RequestDetailContent />
      </AppShell>
    </ProtectedRoute>
  );
}

function RequestDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FrontendError | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestService.getRequestById(id);
      setRequest(data);
    } catch (err) {
      setError(err as FrontendError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async () => {
    try {
      const updated = await requestService.cancelRequest(id);
      setRequest(updated);
      toast.success("Request cancelled");
    } catch (err) {
      const fe = err as FrontendError;
      toast.error(fe.message || "Failed to cancel request");
      // Refresh to get latest state in case backend rejected
      load();
    }
  };

  if (loading) {
    return <LoadingState text="Loading request..." className="min-h-75" />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
        <AlertBanner
          variant="error"
          title="Failed to load request"
          description={error.message}
          action={<Button size="sm" variant="outline" onClick={load}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>}
        />
      </div>
    );
  }

  if (!request) return null;

  const canEdit = request.status === "PENDING";
  const canCancel = request.status === "PENDING" || request.status === "IN_PROGRESS";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Request Details"
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />Back
          </Button>
        }
      />

      <Card className="max-w-5xl mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg leading-snug">{request.title}</CardTitle>
            <StatusBadge status={request.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {request.description}
          </p>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Category</p>
              <p className="font-medium">{REQUEST_CATEGORY_LABELS[request.category]}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Priority</p>
              <PriorityBadge priority={request.priority} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Created</p>
              <p className="font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Last updated</p>
              <p className="font-medium flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                {new Date(request.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {(canEdit || canCancel) && (
            <>
              <Separator />
              <div className="flex gap-3">
                {canEdit && (
                  <LinkButton href={`/requests/${request._id}/edit`} size="sm">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </LinkButton>
                )}
                {canCancel && (
                  <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Request
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancel}
        title="Cancel this request?"
        description="This will mark the request as cancelled. You won't be able to edit it afterwards."
        confirmText="Yes, cancel it"
        cancelText="Keep request"
        variant="destructive"
      />
    </div>
  );
}
