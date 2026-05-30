'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';

export type PortalNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type PortalSidebarProps = {
  title: string;
  subtitle?: string;
  badge?: { label: string; className?: string };
  nav: PortalNavItem[];
  footerExtra?: ReactNode;
};

export function PortalSidebar({ title, subtitle, badge, nav, footerExtra }: PortalSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="flex flex-col h-screen w-60 bg-white border-r border-surface-border shadow-card flex-shrink-0">
      <div className="flex items-center gap-3 p-4 border-b border-surface-border bg-gradient-to-r from-pastel-blue/80 to-white">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-soft">
          RD
        </div>
        <div className="min-w-0 flex-1">
          {badge && (
            <span
              className={cn(
                'inline-block text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md mb-0.5',
                badge.className ?? 'bg-pastel-lilac text-brand-700',
              )}
            >
              {badge.label}
            </span>
          )}
          <div className="font-semibold text-text-primary truncate text-sm">{title}</div>
          {subtitle && <div className="text-xs text-text-muted truncate">{subtitle}</div>}
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700 font-medium border border-brand-100'
                  : 'text-text-secondary hover:bg-surface-card2 hover:text-text-primary',
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-brand-600')} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-surface-border bg-surface-card2/40 space-y-2">
        {footerExtra}
        {user && (
          <div className="px-2.5 py-2 rounded-lg bg-white border border-surface-border">
            <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium">Signed in</p>
            <p className="text-xs text-text-primary truncate mt-0.5">{user.email}</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-status-error bg-white hover:bg-status-error-bg border border-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
