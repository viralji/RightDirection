'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { UserCircle2, ChevronDown, Loader2 } from 'lucide-react';
import { admin } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function DemoPersonaSwitcher() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const { data: personas = [], isLoading } = useQuery({
    queryKey: ['admin-demo-personas'],
    queryFn: () => admin.demoPersonas(),
    enabled: user?.role === 'SUPER_ADMIN' && !user?.impersonating,
  });

  if (user?.role !== 'SUPER_ADMIN' || user?.impersonating) return null;

  const handleSelect = async (email: string) => {
    setLoadingEmail(email);
    setOpen(false);
    try {
      const result = await admin.impersonate(email);
      setUser({ ...result.user, impersonating: true });
      router.push(result.redirectPath);
    } catch (e: any) {
      alert(e.message || 'Could not switch persona');
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
          'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100',
        )}
      >
        <UserCircle2 className="w-4 h-4" />
        <span>Demo as…</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white border border-surface-border rounded-xl shadow-soft py-1 max-h-80 overflow-y-auto">
            <p className="px-3 py-2 text-xs text-text-muted border-b border-surface-border">
              View the product as another role (demo only)
            </p>
            {isLoading && (
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
