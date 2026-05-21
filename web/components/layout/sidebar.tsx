'use client';

import {
  LayoutDashboard, Users, FileText, Building2, BookOpen,
  Wallet, UserCog, Target, Settings, CreditCard,
} from 'lucide-react';
import { PortalSidebar } from './portal-sidebar';

const AGENT_NAV = [
  { label: 'Dashboard', href: '/agent/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/agent/students', icon: Users },
  { label: 'Applications', href: '/agent/applications', icon: FileText },
  { label: 'Universities', href: '/agent/universities', icon: Building2 },
  { label: 'Proposals', href: '/agent/proposals', icon: BookOpen },
  { label: 'Documents', href: '/agent/documents', icon: FileText },
  { label: 'Commission', href: '/agent/commission', icon: Wallet },
  { label: 'Leads', href: '/agent/leads', icon: Target },
  { label: 'Team', href: '/agent/team', icon: UserCog },
  { label: 'Billing', href: '/agent/billing', icon: CreditCard },
  { label: 'Settings', href: '/agent/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <PortalSidebar
      title="RightDirection"
      subtitle="Agent Portal"
      badge={{ label: 'Agent', className: 'bg-pastel-blue text-brand-700' }}
      nav={AGENT_NAV}
    />
  );
}
