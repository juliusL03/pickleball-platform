import Link from 'next/link';
import { Container } from '@juls/pickleball-kit/ui';
import { AuthNav } from '@/components/auth-nav';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="border-b">
        <Container>
          <nav className="flex h-16 items-center justify-between">
            <Link href="/" className="font-semibold text-primary-700">
              Pickleball Court
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/">Home</Link>
              <Link href="/courts">Courts</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <AuthNav />
            </div>
          </nav>
        </Container>
      </header>
      <main>{children}</main>
      <footer className="border-t mt-10">
        <Container>
          <div className="py-6 text-sm text-gray-600">
            © 2026 Pickleball Court
          </div>
        </Container>
      </footer>
    </div>
  );
}
