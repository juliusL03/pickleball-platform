"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LOGIN_MUTATION } from "@juls/pickleball-kit/graphql";
import { createGraphQLClient } from "@juls/pickleball-kit/sdk";
import { setToken } from "@/lib/auth";

const client = createGraphQLClient({
  url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/graphql",
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await client.request<{
        login: {
          accessToken: string;
          user: { role: string };
        };
      }>(LOGIN_MUTATION, { input: { email, password } });

      if (data.login.user.role !== "staff" && data.login.user.role !== "owner") {
        setError("Access denied. This portal is for staff and owners only.");
        setLoading(false);
        return;
      }

      setToken(data.login.accessToken);
      router.push("/overview");
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || "Invalid email or password");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-[var(--pb-color-border)] bg-[var(--pb-color-surface)] p-6 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Admin Login</h1>
          <p className="text-sm text-[var(--pb-color-muted-foreground)]">
            Staff and owner access only
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-[var(--pb-color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-[var(--pb-color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </div>
          {error && (
            <div className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[var(--pb-color-primary)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
