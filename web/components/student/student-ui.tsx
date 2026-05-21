import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export { pt as st, StatChip } from '@/components/ui/portal-ui';

export function PanelHeader({
  title,
  count,
  themeClass,
}: {
  title: string;
  count?: string | number;
  themeClass?: string;
}) {
  return (
    <div
      className={cn(
        'px-3 py-1.5 border-b border-surface-border/80 flex justify-between items-center',
        themeClass ?? 'bg-gradient-to-r from-pastel-blue to-white text-brand-700',
      )}
    >
      <span className="text-xs font-bold uppercase tracking-wide">{title}</span>
      {count != null && <span className="text-xs opacity-80">{count}</span>}
    </div>
  );
}
