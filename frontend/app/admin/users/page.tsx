"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Users } from "lucide-react";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { AlertBanner } from "@/components/common/AlertBanner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { userService, UsersResult } from "@/services/user.service";
import { FrontendError } from "@/services/api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AppShell>
        <AdminUsersContent />
      </AppShell>
    </ProtectedRoute>
  );
}

function AdminUsersContent() {
  const [result, setResult] = useState<UsersResult>({ data: [], meta: { page: 1, limit: DEFAULT_PAGE_SIZE, total: 0, totalPages: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FrontendError | null>(null);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getUsers({ page, limit: DEFAULT_PAGE_SIZE });
      setResult(res);
    } catch (err) {
      setError(err as FrontendError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      <PageHeader
        title="User Management"
        description="View all registered users"
        actions={
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
        }
      />

      {error && (
        <AlertBanner
          variant="error"
          title="Failed to load users"
          description={error.message}
          action={<Button size="sm" variant="outline" onClick={load}>Retry</Button>}
        />
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-1 p-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : result.data.length === 0 ? (
            <EmptyState icon={Users} title="No users found" className="border-0 min-h-[200px]" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Name</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Email</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Role</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {result.data.map((u) => (
                      <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-xs text-muted-foreground sm:hidden">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant={u.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {result.meta && result.meta.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {result.meta.page} of {result.meta.totalPages} · {result.meta.total} total users
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= result.meta.totalPages} onClick={() => setPage((p) => p + 1)}>
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
