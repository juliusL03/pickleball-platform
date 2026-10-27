"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { getToken } from "@/lib/auth";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const token = typeof window !== "undefined" ? getToken() : null;

  useEffect(() => {
    if (!loading) {
      if (!token || !user) {
        router.push("/login");
        return;
      }
      if (user.role !== "staff" && user.role !== "owner") {
        router.push("/login");
      }
    }
  }, [loading, token, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--pb-color-muted-foreground)]">
        Loading...
      </div>
    );
  }

  if (!user || !token) {
    return null;
  }

  return <>{children}</>;
}
