import type { ReactNode } from 'react';

export interface TemplateLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function DefaultLink({ href, children, className }: TemplateLinkProps) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
