"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

const navItems = [
  { href: "/overview", label: "Overview" },
  { href: "/bookings", label: "Bookings" },
  { href: "/schedule", label: "Schedule" },
  { href: "/requests", label: "Requests" },
  { href: "/payments", label: "Payments" },
  { href: "/customers", label: "Customers" },
  { href: "/courts", label: "Courts" },
  { href: "/venue", label: "Venue" },
  { href: "/content", label: "Content" },
];

const ownerItems = [
  { href: "/staff", label: "Staff" },
  { href: "/audit", label: "Audit" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isOwner = user?.role === "owner";

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r border-[var(--pb-color-border)] bg-[var(--pb-color-surface)]">
        <div className="flex h-14 items-center border-b border-[var(--pb-color-border)] px-4">
          <span className="text-sm font-semibold">Admin</span>
        </div>
        <nav className="space-y-1 p-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-2 py-1.5 text-sm ${
                  active
                    ? "bg-[var(--pb-color-primary)]/10 text-[var(--pb-color-primary)]"
                    : "text-[var(--pb-color-muted-foreground)] hover:text-[var(--pb-color-foreground)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {isOwner && (
            <>
              <div className="mt-4 px-2 text-xs uppercase tracking-wide text-[var(--pb-color-muted-foreground)]">
                Owner
              </div>
              {ownerItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-md px-2 py-1.5 text-sm ${
                      active
                        ? "bg-[var(--pb-color-primary)]/10 text-[var(--pb-color-primary)]"
                        : "text-[var(--pb-color-muted-foreground)] hover:text-[var(--pb-color-foreground)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[var(--pb-color-border)] px-4">
          <div className="text-sm text-[var(--pb-color-muted-foreground)]">
            {user?.firstName} {user?.lastName} · {user?.role}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <a
              href={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--pb-color-muted-foreground)] hover:text-[var(--pb-color-foreground)]"
            >
              View site
            </a>
            <button
              onClick={logout}
              className="text-[var(--pb-color-muted-foreground)] hover:text-[var(--pb-color-foreground)]"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
