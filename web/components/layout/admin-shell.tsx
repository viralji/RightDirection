'use client';

import { useEffect } from 'react';
import {
  LayoutDashboard, Users, Building2, Wallet, Shield, Settings, ScrollText,
} from 'lucide-react';
import { PortalSidebar } from './portal-sidebar';
import { DemoPersonaSwitcher } from './demo-persona-switcher';
import { useAuthStore } from '@/lib/auth';

const ADMIN_NAV = [
  { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Agents', href: '/admin/agents', icon: Users },
  { label: 'Universities', href: '/admin/universities', icon: Building2 },
  { label: 'Commissions', href: '/admin/commissions', icon: Wallet },
  { label: 'Fraud', href: '/admin/fraud', icon: Shield },
  { label: 'Activity', href: '/admin/activity', icon: ScrollText },
  { label: 'Config', href: '/admin/config', icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <PortalSidebar
        title="RightDirection"
        subtitle="Platform Console"
        badge={{ label: 'Super Admin', className: 'bg-pastel-rose text-rose-700' }}
        nav={ADMIN_NAV}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between gap-4 px-6 py-3 border-b border-surface-border bg-white shrink-0">
          <p className="text-sm text-text-muted hidden sm:block">
            Product demo — switch persona without separate logins
          </p>
          <DemoPersonaSwitcher />
        </header>
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 bg-surface">{children}</main>
      </div>
    </div>
  );
}
