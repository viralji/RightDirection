'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PortalHeader } from '@/components/layout/portal-header';
import { notifications } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

const NAV = [
  { label: 'Dashboard', href: '/student/dashboard' },
  { label: 'Documents', href: '/student/documents' },
  { label: 'Journey', href: '/student/journey' },
  { label: 'Alerts', href: '/student/notifications' },
  { label: 'Profile', href: '/student/profile' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const { data: unread } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => notifications.unreadCount(),
    refetchInterval: 60_000,
  });

  const nav = NAV.map((link) =>
    link.href === '/student/notifications' && (unread?.count ?? 0) > 0
      ? { ...link, label: `Alerts (${unread!.count})` }
      : link,
  );

  return (
    <div className="min-h-screen bg-surface">
      <PortalHeader title="RightDirection" accent="mint" links={nav} compact />
      <main className="w-full px-3 sm:px-4 py-2">{children}</main>
    </div>
  );
}
