"use client";

import { useEffect, useState } from "react";
import { COURTS_QUERY } from "@juls/pickleball-kit/graphql";
import { createGraphQLClient } from "@juls/pickleball-kit/sdk";
import { getToken } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/recipes/card";
import { Stack } from "@/components/recipes/stack";
import { Badge } from "@/components/recipes/badge";

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
        const data = await client.request<any>(COURTS_QUERY);
        setItems(data.courts || []);
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
        <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--color-chalk))]">Courts</h1>
        <p className="text-sm text-[rgb(var(--color-muted))]">Manage courts</p>
      </Stack>
      <Card>
        <CardHeader>
          <CardTitle>Courts</CardTitle>
          <CardDescription>Venue courts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[rgb(var(--color-muted))]">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[rgb(var(--color-muted))]">No courts</p>
          ) : (
            <div className="space-y-2">
              {items.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-[rgb(var(--color-line))] p-3">
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--color-chalk))]">{c.name}</p>
                    <p className="text-xs text-[rgb(var(--color-muted))]">{c.slug}</p>
                  </div>
                  <Badge variant={c.isActive ? "secondary" : "outline"}>{c.isActive ? "active" : "inactive"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
