'use client';

import { PortalHeader } from '@/components/layout/portal-header';
import { ImpersonationBanner } from '@/components/layout/impersonation-banner';

const NAV = [
  { label: 'Dashboard', href: '/student/dashboard' },
  { label: 'My Journey', href: '/student/journey' },
  { label: 'My Profile', href: '/student/profile' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <ImpersonationBanner />
      <PortalHeader title="RightDirection" accent="mint" links={NAV} compact />
      <main className="w-full px-3 sm:px-4 py-2">{children}</main>
    </div>
  );
}
