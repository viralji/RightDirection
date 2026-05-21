'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';

export type PortalHeaderLink = {
  label: string;
  href: string;
};

type PortalHeaderProps = {
  title: string;
  subtitle?: string;
  accent?: 'brand' | 'mint' | 'lilac';
  links: PortalHeaderLink[];
  compact?: boolean;
};

const ACCENT_STYLES = {
  brand: 'bg-gradient-to-r from-pastel-blue via-white to-pastel-mint border-surface-border',
  mint: 'bg-gradient-to-r from-pastel-mint via-white to-pastel-blue border-emerald-100',
  lilac: 'bg-gradient-to-r from-pastel-lilac via-white to-pastel-blue border-violet-100',
};

export function PortalHeader({ title, subtitle, accent = 'brand', links, compact = false }: PortalHeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b flex items-center justify-between gap-2 shadow-card',
        compact
          ? 'px-3 py-2 border-b border-surface-border bg-gradient-to-r from-pastel-mint via-white to-pastel-blue'
          : cn('px-4 sm:px-6 py-3 gap-4', ACCENT_STYLES[accent]),
      )}
    >
      <div className={cn('flex items-center min-w-0', compact ? 'gap-3' : 'gap-6')}>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className={cn(
              'rounded-md bg-brand-500 text-white font-bold flex items-center justify-center',
              compact ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs shadow-soft rounded-lg',
            )}
          >
            RD
          </div>
          {!compact && (
            <div>
              <div className="font-semibold text-text-primary text-sm leading-tight">{title}</div>
              {subtitle && <div className="text-xs text-text-muted">{subtitle}</div>}
            </div>
          )}
        </div>
        <nav className={cn('flex items-center', compact ? 'gap-0.5' : 'gap-1')}>
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded transition-colors',
                  compact ? 'px-2.5 py-1 text-sm' : 'px-3 py-1.5 rounded-lg text-sm',
                  active
                    ? 'bg-pastel-blue text-brand-700 font-semibold shadow-sm'
                    : 'text-text-secondary hover:bg-pastel-mint/50 hover:text-brand-700',
                )}
              >
                {compact ? link.label.replace('My ', '') : link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {user && !compact && (
          <span className="hidden sm:block text-xs text-text-muted max-w-[160px] truncate px-2">
            {user.email}
          </span>
        )}
        <button
          type="button"
          onClick={() => logout()}
          className={cn(
            'inline-flex items-center text-status-error bg-status-error-bg hover:bg-red-100 border border-red-100 transition-colors',
            compact ? 'p-1.5 rounded' : 'gap-2 px-3 py-2 rounded-lg text-sm font-medium',
          )}
          title="Logout"
        >
          <LogOut className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          {!compact && <span className="hidden sm:inline">Logout</span>}
        </button>
      </div>
    </header>
  );
}
