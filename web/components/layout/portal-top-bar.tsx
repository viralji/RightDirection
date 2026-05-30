'use client';

import type { ReactNode } from 'react';
import { ReturnToAdminButton } from './return-to-admin-button';
import { cn } from '@/lib/utils';

type PortalTopBarProps = {
  /** Optional left side — page title or breadcrumbs */
  leading?: ReactNode;
  /** Right side before Admin / Demo controls — e.g. extra actions */
  trailing?: ReactNode;
  /** Super-admin demo role switcher (admin console only) */
  demoSwitcher?: ReactNode;
  className?: string;
};

export function PortalTopBar({ leading, trailing, demoSwitcher, className }: PortalTopBarProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 border-b border-surface-border bg-white shrink-0',
        className,
      )}
    >
      <div className="min-w-0 flex-1">{leading}</div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {trailing}
        <ReturnToAdminButton />
        {demoSwitcher}
      </div>
    </header>
  );
}
