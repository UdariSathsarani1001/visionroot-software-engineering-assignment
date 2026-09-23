"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, FileText } from "lucide-react";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { AlertBanner } from "@/components/common/AlertBanner";
import { LinkButton } from "@/components/common/LinkButton";
import { StatusBadge, PriorityBadge } from "@/components/requests/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useRequests } from "@/hooks/useRequests";
import { useDebounce } from "@/hooks/useDebounce";
import {
  STATUS_OPTIONS,
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  REQUEST_CATEGORY_LABELS,
  DEFAULT_PAGE_SIZE,
} from "@/lib/constants";
import { RequestStatus, RequestCategory, RequestPriority } from "@/types/request";

export default function RequestsPage() {
  return (
    <ProtectedRoute requireUser>
      <AppShell>
        <RequestsContent />
      </AppShell>
    </ProtectedRoute>
  );
}

function RequestsContent() {
  const router = useRouter();
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
    page,
    limit: DEFAULT_PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

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
      <PageHeader
        title="My Requests"
        description="View and manage all your service requests"
        actions={
          <LinkButton href="/requests/new" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </LinkButton>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
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
      </div>

      {error && (
        <AlertBanner
          variant="error"
          title="Failed to load requests"
          description={error.message}
          action={<Button size="sm" variant="outline" onClick={refetch}>Retry</Button>}
        />
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-1 p-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={hasFilters ? "No matching requests" : "No requests yet"}
              description={hasFilters ? "Try adjusting your filters" : "Submit a new request to get started"}
              className="border-0 min-h-[250px]"
              action={
                hasFilters ? (
                  <Button variant="outline" size="sm" onClick={resetFilters}>Clear filters</Button>
                ) : (
                  <LinkButton href="/requests/new" size="sm">
                    <Plus className="mr-2 h-4 w-4" />New Request
                  </LinkButton>
                )
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Title</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Category</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Priority</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Created</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.map((req) => (
                      <tr key={req._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium truncate max-w-[180px]">{req.title}</p>
                          <p className="text-xs text-muted-foreground sm:hidden mt-0.5">{REQUEST_CATEGORY_LABELS[req.category]}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
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
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/requests/${req._id}`)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
