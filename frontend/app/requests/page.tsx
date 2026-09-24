"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, FileText } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { AlertBanner } from "@/components/common/AlertBanner";
import { EmptyState } from "@/components/common/EmptyState";
import { LinkButton } from "@/components/common/LinkButton";
import { StatusBadge, PriorityBadge } from "@/components/requests/StatusBadge";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRequests } from "@/hooks/useRequests";
import { useDebounce } from "@/hooks/useDebounce";
import {
  STATUS_OPTIONS,
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  REQUEST_CATEGORY_LABELS,
  DEFAULT_PAGE_SIZE,
} from "@/lib/constants";
import { RequestStatus, RequestCategory, RequestPriority, ServiceRequest } from "@/types/request";

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

  const columns: ColumnDef<ServiceRequest, unknown>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <div>
          <p className="font-medium truncate max-w-[200px]">{row.original.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 sm:hidden">
            {REQUEST_CATEGORY_LABELS[row.original.category]}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <span className="text-muted-foreground">
          {REQUEST_CATEGORY_LABELS[row.original.category]}
        </span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: { row: { original: ServiceRequest } }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: ServiceRequest } }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/requests/${row.original._id}`)}
        >
          View
        </Button>
      ),
    },
  ];

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

      {!loading && !error && data.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={hasFilters ? "No matching requests" : "No requests yet"}
          description={hasFilters ? "Try adjusting your filters" : "Submit a new request to get started"}
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
        </>
      )}
    </div>
  );
}
