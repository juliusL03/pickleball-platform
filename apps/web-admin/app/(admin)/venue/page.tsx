"use client";

import { useEffect, useState } from "react";
import { VENUE_QUERY } from "@juls/pickleball-kit/graphql";
import { createGraphQLClient } from "@juls/pickleball-kit/sdk";
import { getToken } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/recipes/card";
import { Stack } from "@/components/recipes/stack";

const client = createGraphQLClient({
  url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/graphql",
  getToken,
});

export default function Page() {
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await client.request<any>(VENUE_QUERY);
        setVenue(data.venue);
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
        <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--color-chalk))]">Venue</h1>
        <p className="text-sm text-[rgb(var(--color-muted))]">Venue information</p>
      </Stack>
      <Card>
        <CardHeader>
          <CardTitle>Venue</CardTitle>
          <CardDescription>Details</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[rgb(var(--color-muted))]">Loading...</p>
          ) : venue ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[rgb(var(--color-chalk))]">{venue.name}</p>
              <p className="text-sm text-[rgb(var(--color-muted))]">{venue.description}</p>
            </div>
          ) : (
            <p className="text-sm text-[rgb(var(--color-muted))]">No venue</p>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
