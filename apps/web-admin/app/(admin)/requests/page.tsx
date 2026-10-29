"use client";

import { useEffect, useState } from "react";
import { CHANGE_REQUESTS_QUERY, REVIEW_CHANGE_REQUEST_MUTATION } from "@juls/pickleball-kit/graphql";
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

type ChangeRequest = {
  id: string;
  bookingId: string;
  userId: string;
  type: string;
  status: string;
  reason: string;
  staffResponse?: string;
  createdAt: string;
};

export default function Page() {
  const [items, setItems] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await client.request<{ changeRequests: ChangeRequest[] }>(CHANGE_REQUESTS_QUERY);
      setItems(data.changeRequests || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function review(id: string, approved: boolean) {
    try {
      await client.request(REVIEW_CHANGE_REQUEST_MUTATION, {
        id,
        input: { approved, staffResponse: approved ? "Approved" : "Rejected" },
      });
      await load();
    } catch (e) {
      console.error(e);
      alert("Failed to review");
    }
  }

  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--color-chalk))]">Requests</h1>
        <p className="text-sm text-[rgb(var(--color-muted))]">Change and cancellation requests</p>
      </Stack>
      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>Review pending requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[rgb(var(--color-muted))]">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[rgb(var(--color-muted))]">No requests</p>
          ) : (
            <div className="space-y-3">
              {items.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-[rgb(var(--color-line))] p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[rgb(var(--color-chalk))]">{r.type}</span>
                      <Badge variant={r.status === "pending" ? "default" : r.status === "approved" ? "secondary" : "destructive"}>{r.status}</Badge>
                    </div>
                    <p className="text-xs text-[rgb(var(--color-muted))]">Booking: {r.bookingId} · Reason: {r.reason}</p>
                  </div>
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => review(r.id, true)}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => review(r.id, false)}>Reject</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
