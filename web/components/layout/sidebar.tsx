'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, Building2, BookOpen,
  Wallet, UserCog, Target, Settings, LogOut, ChevronLeft, ChevronRight, CreditCard,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';

const AGENT_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/students', icon: Users },
  { label: 'Applications', href: '/applications', icon: FileText },
  { label: 'Universities', href: '/universities', icon: Building2 },
  { label: 'Proposals', href: '/proposals', icon: BookOpen },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Commission', href: '/commission', icon: Wallet },
  { label: 'Leads', href: '/leads', icon: Target },
  { label: 'Team', href: '/team', icon: UserCog },
  { label: 'Billing', href: '/billing', icon: CreditCard },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-surface-card border-r border-surface-border transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-surface-border">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          RD
        </div>
        {!collapsed && <span className="font-semibold text-text-primary truncate">RightDirection</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {AGENT_NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'text-text-secondary hover:bg-surface-card2 hover:text-text-primary',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + collapse */}
      <div className="p-2 border-t border-surface-border space-y-1">
        {!collapsed && user && (
          <div className="px-3 py-2 text-xs text-text-muted truncate">{user.email}</div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-card2 hover:text-status-error transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-text-muted hover:bg-surface-card2 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
