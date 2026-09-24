"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, RefreshCw } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { AlertBanner } from "@/components/common/AlertBanner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge, PriorityBadge } from "@/components/requests/StatusBadge";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRequests } from "@/hooks/useRequests";
import { useDebounce } from "@/hooks/useDebounce";
import { requestService } from "@/services/request.service";
import {
  STATUS_OPTIONS,
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  REQUEST_CATEGORY_LABELS,
  ADMIN_STATUS_TRANSITIONS,
  DEFAULT_PAGE_SIZE,
  REQUEST_STATUS_LABELS,
} from "@/lib/constants";
import { RequestStatus, RequestCategory, RequestPriority, ServiceRequest } from "@/types/request";
import { FrontendError } from "@/services/api";

export default function AdminRequestsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AppShell>
        <AdminRequestsContent />
      </AppShell>
    </ProtectedRoute>
  );
}

function AdminRequestsContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RequestStatus | "">("");
  const [category, setCategory] = useState<RequestCategory | "">("");
  const [priority, setPriority] = useState<RequestPriority | "">("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  const { data, meta, loading, error, refetch } = useRequests({
    search: debouncedSearch || undefined,
    status: status || undefined,
    category: category || undefined,
    priority: priority || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
    page,
    limit: DEFAULT_PAGE_SIZE,
  });

  const [statusTarget, setStatusTarget] = useState<{
    request: ServiceRequest;
    nextStatus: RequestStatus;
  } | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    if (!statusTarget) return;
    setUpdating(true);
    try {
      await requestService.updateRequestStatus(statusTarget.request._id, statusTarget.nextStatus);
      toast.success(`Status updated to ${REQUEST_STATUS_LABELS[statusTarget.nextStatus]}`);
      refetch();
    } catch (err) {
      const fe = err as FrontendError;
      toast.error(fe.message || "Failed to update status");
    } finally {
      setUpdating(false);
      setStatusTarget(null);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setCategory("");
    setPriority("");
    setPage(1);
  };

  const hasFilters = !!search || !!status || !!category || !!priority;

  const columns: ColumnDef<ServiceRequest>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <p className="font-medium truncate max-w-[160px]">{row.original.title}</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-[160px]">
            #{row.original._id.slice(-6)}
          </p>
        </div>
      ),
    },
    {
      id: "user",
      header: "User",
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="font-medium text-foreground">{row.original.user?.name}</p>
          <p className="text-muted-foreground">{row.original.user?.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {REQUEST_CATEGORY_LABELS[row.original.category]}
        </span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const transitions = ADMIN_STATUS_TRANSITIONS[row.original.status];
        if (!transitions || transitions.length === 0) {
          return <Badge variant="secondary" className="text-xs">Final</Badge>;
        }
        return (
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {transitions.map((next) => (
              <Button
                key={next}
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2"
                onClick={() => setStatusTarget({ request: row.original, nextStatus: next })}
              >
                {REQUEST_STATUS_LABELS[next]}
              </Button>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Request Management" description="View and manage all service requests" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search title or description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as RequestStatus | ""); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => { setCategory(v as RequestCategory | ""); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All categories</SelectItem>
            {CATEGORY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => { setPriority(v as RequestPriority | ""); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All priorities</SelectItem>
            {PRIORITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>Clear filters</Button>
        )}
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </div>

      {error && (
        <AlertBanner
          variant="error"
          title="Failed to load requests"
          description={error.message}
          action={<Button size="sm" variant="outline" onClick={refetch}>Retry</Button>}
        />
      )}

      <DataTable columns={columns} data={data} loading={loading} />

      {/* Server-side pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {statusTarget && (
        <ConfirmDialog
          open={!!statusTarget}
          onOpenChange={(open) => { if (!open) setStatusTarget(null); }}
          onConfirm={handleStatusUpdate}
          loading={updating}
          title="Update request status?"
          description={`Change "${REQUEST_STATUS_LABELS[statusTarget.request.status]}" → "${REQUEST_STATUS_LABELS[statusTarget.nextStatus]}" for: "${statusTarget.request.title}"`}
          confirmText="Update Status"
        />
      )}
    </div>
  );
}
