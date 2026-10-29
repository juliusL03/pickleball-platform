"use client";

import { useEffect, useState } from "react";
import { PAYMENTS_PAGE_QUERY, VERIFY_BANK_TRANSFER_MUTATION } from "@juls/pickleball-kit/graphql";
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
      const data = await client.request<any>(PAYMENTS_PAGE_QUERY, { limit: 50, offset: 0 });
      setItems(data.paymentsPage?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function verify(id: string, approved: boolean) {
    try {
      await client.request(VERIFY_BANK_TRANSFER_MUTATION, {
        input: { paymentId: id, approved, notes: approved ? "Verified" : "Rejected" },
      });
      await load();
    } catch (e) {
      console.error(e);
      alert("Failed");
    }
  }

  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--color-chalk))]">Payments</h1>
        <p className="text-sm text-[rgb(var(--color-muted))]">Verify payments</p>
      </Stack>
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>Bank transfers and gateway payments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[rgb(var(--color-muted))]">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[rgb(var(--color-muted))]">No payments</p>
          ) : (
            <div className="space-y-3">
              {items.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-[rgb(var(--color-line))] p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[rgb(var(--color-chalk))]">₱{p.amount}</span>
                      <Badge>{p.method}</Badge>
                      <Badge variant={p.status === "paid" ? "secondary" : p.status === "pending" ? "default" : "destructive"}>{p.status}</Badge>
                    </div>
                    <p className="text-xs text-[rgb(var(--color-muted))]">Booking: {p.bookingId}</p>
                  </div>
                  {p.method === "bank_transfer" && p.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => verify(p.id, true)}>Verify</Button>
                      <Button size="sm" variant="outline" onClick={() => verify(p.id, false)}>Reject</Button>
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
