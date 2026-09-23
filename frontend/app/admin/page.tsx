"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FileText, Clock, Loader, CheckCircle2, XCircle, Users, Settings } from "lucide-react";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { AlertBanner } from "@/components/common/AlertBanner";
import { LinkButton } from "@/components/common/LinkButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { requestService } from "@/services/request.service";
import { userService } from "@/services/user.service";
import { FrontendError } from "@/services/api";

interface AdminStats {
  totalRequests: number;
  pending: number;
  inProgress: number;
  resolved: number;
  cancelled: number;
  totalUsers: number;
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AppShell>
        <AdminDashboardContent />
      </AppShell>
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FrontendError | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqResult, userResult] = await Promise.all([
        requestService.getRequests({ limit: 1000 }),
        userService.getUsers({ limit: 1 }),
      ]);
      const s: AdminStats = {
        totalRequests: reqResult.meta.total,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        cancelled: 0,
        totalUsers: userResult.meta.total,
      };
      reqResult.data.forEach((r) => {
        if (r.status === "PENDING") s.pending++;
        else if (r.status === "IN_PROGRESS") s.inProgress++;
        else if (r.status === "RESOLVED") s.resolved++;
        else if (r.status === "CANCELLED") s.cancelled++;
      });
      setStats(s);
    } catch (err) {
      setError(err as FrontendError);
      toast.error("Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="System-wide overview"
        actions={
          <div className="flex gap-2">
            <LinkButton href="/admin/requests" size="sm" variant="outline">
              <Settings className="mr-2 h-4 w-4" />Manage Requests
            </LinkButton>
            <LinkButton href="/admin/users" size="sm" variant="outline">
              <Users className="mr-2 h-4 w-4" />Manage Users
            </LinkButton>
          </div>
        }
      />

      {error && (
        <AlertBanner
          variant="error"
          title="Failed to load stats"
          description={error.message}
          action={<Button size="sm" variant="outline" onClick={load}>Retry</Button>}
        />
      )}

      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : stats && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCard title="Total Requests" value={stats.totalRequests} icon={FileText} />
          <MetricCard title="Pending" value={stats.pending} icon={Clock} />
          <MetricCard title="In Progress" value={stats.inProgress} icon={Loader} />
          <MetricCard title="Resolved" value={stats.resolved} icon={CheckCircle2} />
          <MetricCard title="Cancelled" value={stats.cancelled} icon={XCircle} />
          <MetricCard title="Total Users" value={stats.totalUsers} icon={Users} />
        </div>
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="hover:border-primary/40 transition-colors cursor-pointer">
          <CardContent className="p-5">
            <Link href="/admin/requests" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Request Management</p>
                <p className="text-sm text-muted-foreground">Search, filter and update request statuses</p>
              </div>
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/40 transition-colors cursor-pointer">
          <CardContent className="p-5">
            <Link href="/admin/users" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">User Management</p>
                <p className="text-sm text-muted-foreground">View all registered users and their roles</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
