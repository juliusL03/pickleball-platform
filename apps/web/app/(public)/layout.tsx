import Link from 'next/link';
import { Container } from '@juls/pickleball-kit/ui';
import { AuthNav } from '@/components/auth-nav';

const navLink =
  'transition-colors hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball focus-visible:ring-offset-2 focus-visible:ring-offset-ink';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ink text-chalk">
      <header className="border-b border-line">
        <Container size="xl">
          <nav className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
            <Link
              href="/"
              className={`font-display text-sm font-extrabold uppercase tracking-[0.02em] text-chalk ${navLink}`}
            >
              Pickleball Court
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted sm:gap-6">
              <Link href="/" className={`hidden md:inline ${navLink}`}>
                Home
              </Link>
              <Link href="/courts" className={navLink}>
                Courts
              </Link>
              <Link href="/about" className={`hidden sm:inline ${navLink}`}>
                About
              </Link>
              <Link href="/contact" className={`hidden sm:inline ${navLink}`}>
                Contact
              </Link>
              <AuthNav />
            </div>
          </nav>
        </Container>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line">
        <Container size="xl">
          <div className="flex flex-col gap-2 py-6 font-mono text-[9px] uppercase tracking-[0.18em] text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Pickleball Court</span>
            <span>Manila · Open daily</span>
          </div>
        </Container>
      </footer>
    </div>
  );
}
