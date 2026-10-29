import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/recipes/card";
import { Stack } from "@/components/recipes/stack";

export default function OverviewPage() {
  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--color-chalk))]">Overview</h1>
        <p className="text-sm text-[rgb(var(--color-muted))]">
          Admin dashboard
        </p>
      </Stack>
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Quick snapshot of your pickleball venue</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            Use the navigation to manage bookings, courts, customers, and more.
          </p>
        </CardContent>
      </Card>
    </Stack>
  );
}
