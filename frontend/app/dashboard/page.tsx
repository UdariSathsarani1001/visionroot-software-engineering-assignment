"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, FileText, Clock, CheckCircle2, XCircle, Loader } from "lucide-react";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { AlertBanner } from "@/components/common/AlertBanner";
import { LinkButton } from "@/components/common/LinkButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge } from "@/components/requests/StatusBadge";
import { requestService } from "@/services/request.service";
import { useAuth } from "@/hooks/useAuth";
import { ServiceRequest } from "@/types/request";
import { FrontendError } from "@/services/api";
import { REQUEST_CATEGORY_LABELS } from "@/lib/constants";

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  cancelled: number;
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requireUser>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FrontendError | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recentResult, allResult] = await Promise.all([
        requestService.getRequests({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }),
        requestService.getRequests({ limit: 1000 }),
      ]);
      setRecent(recentResult.data);
      const s: Stats = { total: allResult.meta.total, pending: 0, inProgress: 0, resolved: 0, cancelled: 0 };
      allResult.data.forEach((r) => {
        if (r.status === "PENDING") s.pending++;
        else if (r.status === "IN_PROGRESS") s.inProgress++;
        else if (r.status === "RESOLVED") s.resolved++;
        else if (r.status === "CANCELLED") s.cancelled++;
      });
      setStats(s);
    } catch (err) {
      setError(err as FrontendError);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? ""}!`}
        description="Here's an overview of your service requests"
        actions={
          <LinkButton href="/requests/new" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </LinkButton>
        }
      />

      {error && (
        <AlertBanner
          variant="error"
          title="Failed to load dashboard"
          description={error.message}
          action={<Button size="sm" variant="outline" onClick={load}>Retry</Button>}
        />
      )}

      {/* Stats */}
      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard title="Total" value={stats.total} icon={FileText} />
          <MetricCard title="Pending" value={stats.pending} icon={Clock} />
          <MetricCard title="In Progress" value={stats.inProgress} icon={Loader} />
          <MetricCard title="Resolved" value={stats.resolved} icon={CheckCircle2} />
          <MetricCard title="Cancelled" value={stats.cancelled} icon={XCircle} />
        </div>
      ) : null}

      {/* Recent requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Requests</CardTitle>
          <LinkButton href="/requests" variant="ghost" size="sm">View all</LinkButton>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No requests yet"
              description="Submit your first service request to get started"
              className="border-0 min-h-[180px]"
              action={
                <LinkButton href="/requests/new" size="sm">
                  <Plus className="mr-2 h-4 w-4" />Create Request
                </LinkButton>
              }
            />
          ) : (
            <div className="divide-y">
              {recent.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center gap-3 py-3 cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2 transition-colors"
                  onClick={() => router.push(`/requests/${req._id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{req.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {REQUEST_CATEGORY_LABELS[req.category]} · {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={req.priority} />
                    <StatusBadge status={req.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
