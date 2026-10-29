"use client";

import { useEffect, useState } from "react";
import { BOOKINGS_PAGE_QUERY, UPDATE_BOOKING_STATUS_MUTATION } from "@juls/pickleball-kit/graphql";
import { createGraphQLClient } from "@juls/pickleball-kit/sdk";
import { getToken } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/recipes/card";
import { Stack } from "@/components/recipes/stack";
import { Button } from "@/components/recipes/button";
import { Badge } from "@/components/recipes/badge";

const client = createGraphQLClient({
  url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/graphql",
  getToken,
});

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await client.request<any>(BOOKINGS_PAGE_QUERY, { limit: 50, offset: 0 });
      setItems(data.bookingsPage?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    try {
      await client.request(UPDATE_BOOKING_STATUS_MUTATION, { id, input: { status } });
      await load();
    } catch (e) {
      console.error(e);
      alert("Failed");
    }
  }

  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--color-chalk))]">Bookings</h1>
        <p className="text-sm text-[rgb(var(--color-muted))]">Manage bookings</p>
      </Stack>
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>View and update bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[rgb(var(--color-muted))]">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[rgb(var(--color-muted))]">No bookings</p>
          ) : (
            <div className="space-y-3">
              {items.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border border-[rgb(var(--color-line))] p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[rgb(var(--color-chalk))]">{b.bookingNumber}</span>
                      <Badge>{b.status}</Badge>
                    </div>
                    <p className="text-xs text-[rgb(var(--color-muted))]">{new Date(b.startTime).toLocaleString()} · {b.duration} min</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "confirmed")}>Confirm</Button>
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, "cancelled")}>Cancel</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
