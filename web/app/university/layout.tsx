'use client';

import { useEffect } from 'react';
import { PortalHeader } from '@/components/layout/portal-header';
import { useAuthStore } from '@/lib/auth';

const NAV = [
  { label: 'Dashboard', href: '/university/dashboard' },
  { label: 'Applications', href: '/university/applications' },
  { label: 'Agents', href: '/university/agents' },
  { label: 'Analytics', href: '/university/analytics' },
  { label: 'Offers', href: '/university/offers' },
];

export default function UniversityLayout({ children }: { children: React.ReactNode }) {
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <div className="min-h-screen bg-surface">
      <PortalHeader
        title="RightDirection"
        subtitle="University Portal"
        accent="lilac"
        links={NAV}
      />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4">{children}</main>
    </div>
  );
}
