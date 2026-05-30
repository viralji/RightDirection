'use client';

import { useState } from 'react';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import { auth } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';

type ReturnToAdminButtonProps = {
  className?: string;
};

/** Shown top-right when super admin is viewing another portal in demo mode. */
export function ReturnToAdminButton({ className }: ReturnToAdminButtonProps) {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  if (!user?.impersonating) return null;

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await auth.stopImpersonation();
      setUser(result.user);
      window.location.href = result.redirectPath;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not return to admin';
      alert(`${msg}\n\nTry signing out and logging in as admin again.`);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title="Return to Super Admin console"
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold',
        'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100',
        'disabled:opacity-60 transition-colors shadow-sm',
        className,
      )}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LayoutDashboard className="w-3.5 h-3.5" />
      )}
      <span>Admin</span>
    </button>
  );
}
