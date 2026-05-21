'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, LogOut } from 'lucide-react';
import { auth } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

export function ImpersonationBanner() {
  const router = useRouter();
  const { user, setUser, fetchMe, loading } = useAuthStore();

  useEffect(() => {
    if (!user && !loading) fetchMe();
  }, [user, loading, fetchMe]);

  if (!user?.impersonating) return null;

  const exitDemo = async () => {
    try {
      const result = await auth.stopImpersonation();
      setUser(result.user);
      router.push(result.redirectPath);
    } catch (e: any) {
      alert(e.message || 'Could not return to admin');
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1 bg-amber-50 border-b border-amber-200 text-amber-950 text-xs shrink-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <Eye className="w-3 h-3 shrink-0 text-amber-700" />
        <span className="truncate">
          Demo: <strong>{user.name || user.email}</strong>
          <span className="text-amber-800/80"> ({user.role.replace(/_/g, ' ')})</span>
        </span>
      </div>
      <button
        type="button"
        onClick={exitDemo}
        className="shrink-0 px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-900 font-medium hover:bg-amber-100 text-[10px]"
      >
        ← Admin
      </button>
    </div>
  );
}
