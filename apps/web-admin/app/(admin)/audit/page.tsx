"use client";

import { useEffect, useState } from "react";
import { AUDIT_LOGS_QUERY } from "@juls/pickleball-kit/graphql";
import { createGraphQLClient } from "@juls/pickleball-kit/sdk";
import { getToken } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/recipes/card";
import { Stack } from "@/components/recipes/stack";

const client = createGraphQLClient({
  url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/graphql",
  getToken,
});

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await client.request<any>(AUDIT_LOGS_QUERY, { limit: 50, offset: 0 });
        setItems(data.auditLogs?.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--color-chalk))]">Audit</h1>
        <p className="text-sm text-[rgb(var(--color-muted))]">Audit logs</p>
      </Stack>
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>Recent actions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[rgb(var(--color-muted))]">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[rgb(var(--color-muted))]">No logs</p>
          ) : (
            <div className="space-y-2">
              {items.map((a) => (
                <div key={a.id} className="rounded-lg border border-[rgb(var(--color-line))] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[rgb(var(--color-chalk))]">{a.action}</p>
                    <p className="text-xs text-[rgb(var(--color-muted))]">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}</p>
                  </div>
                  <p className="text-xs text-[rgb(var(--color-muted))]">{a.resourceType} {a.resourceId ? `· ${a.resourceId}` : ""}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
