'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { dashboardPath } from '@/lib/portal';

/** Legacy /dashboard URL — redirects to the correct portal dashboard. */
export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, loading, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    router.replace(dashboardPath(user.role));
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center text-text-muted text-sm">
      Redirecting…
    </div>
  );
}
