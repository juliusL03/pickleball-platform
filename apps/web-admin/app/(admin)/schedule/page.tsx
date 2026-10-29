import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/recipes/card";
import { Stack } from "@/components/recipes/stack";

export default function Page() {
  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--color-chalk))]">Schedule</h1>
        <p className="text-sm text-[rgb(var(--color-muted))]">Manage schedule</p>
      </Stack>
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>Configuration and management</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[rgb(var(--color-muted))]">Coming soon</p>
        </CardContent>
      </Card>
    </Stack>
  );
}
