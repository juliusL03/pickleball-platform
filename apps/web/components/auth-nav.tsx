'use client';

import Link from 'next/link';
import { useAuth } from './auth-provider';

export function AuthNav() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <span className="text-sm text-gray-400">Loading…</span>;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </div>
    );
  }

  const isStaff = user.role === 'staff' || user.role === 'owner';

  return (
    <div className="flex items-center gap-4">
      <Link href="/bookings">My bookings</Link>
      {isStaff ? <Link href="/dashboard/bookings">Dashboard</Link> : null}
      <span className="text-sm text-gray-600">{user.firstName}</span>
      <button
        type="button"
        onClick={logout}
        className="text-sm text-gray-600 underline"
      >
        Logout
      </button>
    </div>
  );
}
