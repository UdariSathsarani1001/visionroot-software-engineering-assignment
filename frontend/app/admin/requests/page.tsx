"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, ArrowUpDown, ChevronUp, ChevronDown, RefreshCw } from "lucide-react";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { AlertBanner } from "@/components/common/AlertBanner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge, PriorityBadge } from "@/components/requests/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  const { data, meta, loading, error, refetch } = useRequests({
    search: debouncedSearch || undefined,
    status: status || undefined,
    category: category || undefined,
    priority: priority || undefined,
    sortBy,
    sortOrder,
    page,
    limit: DEFAULT_PAGE_SIZE,
  });

  // Status update state
  const [statusTarget, setStatusTarget] = useState<{ request: ServiceRequest; nextStatus: RequestStatus } | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (field !== sortBy) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-3 w-3 ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1" />
    );
  };

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

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-1 p-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              title={hasFilters ? "No matching requests" : "No requests found"}
              description={hasFilters ? "Try adjusting your filters" : "No service requests have been submitted yet"}
              className="border-0 min-h-[250px]"
              action={hasFilters ? <Button variant="outline" size="sm" onClick={resetFilters}>Clear filters</Button> : undefined}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">
                        <button onClick={() => handleSort("title")} className="flex items-center hover:text-foreground">
                          Title <SortIcon field="title" />
                        </button>
                      </th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">User</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Category</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                        <button onClick={() => handleSort("priority")} className="flex items-center hover:text-foreground">
                          Priority <SortIcon field="priority" />
                        </button>
                      </th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">
                        <button onClick={() => handleSort("createdAt")} className="flex items-center hover:text-foreground">
                          Created <SortIcon field="createdAt" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.map((req) => {
                      const transitions = ADMIN_STATUS_TRANSITIONS[req.status];
                      return (
                        <tr key={req._id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium truncate max-w-[160px]">{req.title}</p>
                              <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-[160px]">
                                #{req._id.slice(-6)}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                            <p className="font-medium text-foreground">{req.user?.name}</p>
                            <p>{req.user?.email}</p>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                            {REQUEST_CATEGORY_LABELS[req.category]}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <PriorityBadge priority={req.priority} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {transitions.length > 0 ? (
                              <div className="flex items-center justify-end gap-1 flex-wrap">
                                {transitions.map((next) => (
                                  <Button
                                    key={next}
                                    size="xs"
                                    variant="outline"
                                    onClick={() => setStatusTarget({ request: req, nextStatus: next })}
                                  >
                                    {REQUEST_STATUS_LABELS[next]}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Final</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {meta.page} of {meta.totalPages} · {meta.total} total
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Status update confirmation dialog */}
      {statusTarget && (
        <ConfirmDialog
          open={!!statusTarget}
          onOpenChange={(open) => { if (!open) setStatusTarget(null); }}
          onConfirm={handleStatusUpdate}
          loading={updating}
          title="Update request status?"
          description={`Change status from "${REQUEST_STATUS_LABELS[statusTarget.request.status]}" to "${REQUEST_STATUS_LABELS[statusTarget.nextStatus]}" for: "${statusTarget.request.title}"`}
          confirmText="Update Status"
        />
      )}
    </div>
  );
}
