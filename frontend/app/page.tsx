"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/common/LoadingState";

export default function HomePage() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (isAdmin) {
      router.replace("/admin");
    } else {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState text="Redirecting..." />
    </div>
  );
}
