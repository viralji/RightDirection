'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserCircle2, ChevronDown, Loader2 } from 'lucide-react';
import { admin } from '@/lib/api';
import { DEMO_PERSONAS } from '@/lib/demo-personas';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function DemoPersonaSwitcher() {
  const { user, loading, setUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const canSwitch = isSuperAdmin && !user?.impersonating;

  const { data: personasFromApi = [], isLoading } = useQuery({
    queryKey: ['admin-demo-personas'],
    queryFn: () => admin.demoPersonas(),
    enabled: canSwitch,
    retry: 1,
  });

  const personas = personasFromApi.length > 0 ? personasFromApi : DEMO_PERSONAS;

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-text-muted border border-surface-border bg-surface-card2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="hidden sm:inline">Loading…</span>
      </div>
    );
  }

  if (!canSwitch) return null;

  const handleSelect = async (email: string) => {
    setLoadingEmail(email);
    setOpen(false);
    try {
      const result = await admin.impersonate(email);
      setUser({ ...result.user, impersonating: true });
      window.location.href = result.redirectPath;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not switch persona';
      alert(`${msg}\n\nTip: sign out, then log in again as admin@rightdirection.com / Admin@123`);
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="Switch demo role"
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
          'bg-brand-500 text-white border-brand-600 hover:bg-brand-600 shadow-sm',
        )}
      >
        <UserCircle2 className="w-4 h-4 flex-shrink-0" />
        <span>Demo as…</span>
        <ChevronDown className={cn('w-4 h-4 flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white border border-surface-border rounded-xl shadow-lg py-1 max-h-80 overflow-y-auto">
            <p className="px-3 py-2 text-xs text-text-muted border-b border-surface-border">
              Preview another portal (demo)
            </p>
            {isLoading && personas.length === 0 && (
              <p className="px-3 py-4 text-sm text-text-muted flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </p>
            )}
            {personas.map((p) => (
              <button
                key={p.email}
                type="button"
                disabled={!!loadingEmail}
                onClick={() => handleSelect(p.email)}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-pastel-blue/50 disabled:opacity-50 transition-colors"
              >
                <span className="font-medium text-text-primary block">{p.label}</span>
                <span className="text-xs text-text-muted">{p.email}</span>
                {loadingEmail === p.email && (
                  <Loader2 className="w-3 h-3 animate-spin inline ml-2" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
