"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/recipes/button";

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
  const { theme, toggleTheme } = useTheme();

  const isOwner = user?.role === "owner";

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface))]">
        <div className="flex h-14 items-center border-b border-[rgb(var(--color-line))] px-4">
          <span className="text-sm font-semibold text-[rgb(var(--color-chalk))]">Admin</span>
        </div>
        <nav className="space-y-1 p-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-[rgb(var(--color-primary-600))]/10 text-[rgb(var(--color-primary-400))]"
                    : "text-[rgb(var(--color-muted))] hover:bg-[rgb(var(--color-surface-raised))] hover:text-[rgb(var(--color-chalk))]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {isOwner && (
            <>
              <div className="mt-4 px-2 text-xs uppercase tracking-wide text-[rgb(var(--color-muted))]">
                Owner
              </div>
              {ownerItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-[rgb(var(--color-primary-600))]/10 text-[rgb(var(--color-primary-400))]"
                        : "text-[rgb(var(--color-muted))] hover:bg-[rgb(var(--color-surface-raised))] hover:text-[rgb(var(--color-chalk))]"
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
        <header className="flex h-14 items-center justify-between border-b border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface))]/80 px-4 backdrop-blur">
          <div className="text-sm text-[rgb(var(--color-muted))]">
            {user?.firstName} {user?.lastName} · {user?.role}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}
                target="_blank"
                rel="noreferrer"
              >
                View site
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
