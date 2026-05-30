'use client';

import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { PortalTopBar } from '@/components/layout/portal-top-bar';
import { useAuthStore } from '@/lib/auth';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PortalTopBar />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4">{children}</main>
      </div>
    </div>
  );
}
