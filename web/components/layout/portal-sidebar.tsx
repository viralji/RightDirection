'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
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
};

export function PortalSidebar({ title, subtitle, badge, nav }: PortalSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-white border-r border-surface-border shadow-card transition-all duration-200',
        collapsed ? 'w-[4.25rem]' : 'w-60',
      )}
    >
      <div className="flex items-center gap-3 p-4 border-b border-surface-border bg-gradient-to-r from-pastel-blue to-white">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-soft">
          RD
        </div>
        {!collapsed && (
          <div className="min-w-0">
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
        )}
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700 font-medium border border-brand-100'
                  : 'text-text-secondary hover:bg-surface-card2 hover:text-text-primary',
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-brand-600')} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-surface-border bg-surface-card2/50 space-y-1">
        {!collapsed && user && (
          <div className="px-3 py-2 text-xs text-text-muted truncate rounded-lg bg-white border border-surface-border">
            {user.email}
          </div>
        )}
        <button
          type="button"
          onClick={() => logout()}
          title="Sign out"
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
            'text-status-error bg-status-error-bg/60 hover:bg-status-error-bg border border-red-100 transition-colors',
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-text-muted hover:bg-white hover:text-text-primary border border-transparent hover:border-surface-border transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
