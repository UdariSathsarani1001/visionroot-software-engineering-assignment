"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/common/LoadingState";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Only admins may access this route — non-admins are sent to /dashboard */
  requireAdmin?: boolean;
  /** Only regular users may access this route — admins are sent to /admin */
  requireUser?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireUser = false,
}: ProtectedRouteProps) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Admin trying to reach a user-only page → send to admin dashboard
    if (requireUser && isAdmin) {
      router.replace("/admin");
      return;
    }

    // Regular user trying to reach an admin-only page → send to user dashboard
    if (requireAdmin && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, isAdmin, requireAdmin, requireUser, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState text="Loading session..." />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (requireAdmin && !isAdmin) return null;
  if (requireUser && isAdmin) return null;

  return <>{children}</>;
}
