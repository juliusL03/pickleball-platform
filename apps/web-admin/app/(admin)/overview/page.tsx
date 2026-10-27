export default function OverviewPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-[var(--pb-color-muted-foreground)]">
          Admin dashboard
        </p>
      </div>
      <div className="rounded-lg border border-[var(--pb-color-border)] bg-[var(--pb-color-surface)] p-4">
        <p className="text-sm text-[var(--pb-color-muted-foreground)]">
          Welcome to the admin portal.
        </p>
      </div>
    </div>
  );
}
