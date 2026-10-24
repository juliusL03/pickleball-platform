'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '@juls/pickleball-kit/ui';
import { useAuth } from '@/components/auth-provider';

const LINKS = [
  { href: '/dashboard/bookings', label: 'Bookings' },
  { href: '/dashboard/courts', label: 'Courts' },
  { href: '/dashboard/venue', label: 'Venue' },
  { href: '/dashboard/content', label: 'Content' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <Container>
        <p className="py-8">Loading…</p>
      </Container>
    );
  }

  if (!user || (user.role !== 'staff' && user.role !== 'owner')) {
    return (
      <Container>
        <div className="py-12">
          <p className="mb-4">Staff access required.</p>
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div>
      <header className="border-b">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard/bookings" className="font-semibold">
              Venue Dashboard
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={pathname === link.href ? 'font-semibold' : ''}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/" className="text-gray-600">
                Public site
              </Link>
            </nav>
          </div>
        </Container>
      </header>
      <main>{children}</main>
    </div>
  );
}
