'use client';

import Link from 'next/link';
import { useAuth } from './auth-provider';

const linkClass =
  'transition-colors hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball focus-visible:ring-offset-2 focus-visible:ring-offset-ink';

export function AuthNav() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        Loading…
      </span>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/login" className={linkClass}>
          Login
        </Link>
        <Link href="/register" className={linkClass}>
          Register
        </Link>
      </div>
    );
  }

  const isStaff = user.role === 'staff' || user.role === 'owner';

  return (
    <div className="flex items-center gap-4">
      <Link href="/bookings" className={linkClass}>
        My bookings
      </Link>
      {isStaff ? (
        <Link href="/dashboard/bookings" className={`hidden sm:inline ${linkClass}`}>
          Dashboard
        </Link>
      ) : null}
      <span className="hidden text-[13px] text-muted sm:inline">
        {user.firstName}
      </span>
      <button
        type="button"
        onClick={logout}
        className={`underline underline-offset-4 ${linkClass}`}
      >
        Logout
      </button>
    </div>
  );
}
