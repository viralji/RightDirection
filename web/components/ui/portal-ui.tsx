'use client';

import type { ReactNode } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Compact typography tokens — use across all portals */
export const pt = {
  page: 'text-sm text-text-secondary',
  title: 'text-base font-semibold text-text-primary',
  subtitle: 'text-xs text-text-muted',
  label: 'text-xs text-text-muted',
  value: 'text-sm font-medium text-text-primary',
  meta: 'text-xs text-text-muted',
  link: 'text-sm font-semibold text-brand-600 hover:text-brand-700',
  chip: 'text-xs font-medium px-2 py-0.5 rounded-md',
  section: 'text-xs font-bold uppercase tracking-wide',
};

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h1 className={pt.title}>{title}</h1>
        {subtitle && <p className={cn(pt.subtitle, 'mt-0.5')}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            pt.chip,
            'rounded-lg border transition-colors px-2.5 py-1',
            value === o.id
              ? 'bg-brand-500 border-brand-500 text-white'
              : 'border-surface-border text-text-secondary bg-white hover:bg-pastel-blue/40',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500"
      />
    </div>
  );
}

export function ExpandChevron({ expanded }: { expanded: boolean }) {
  return expanded ? (
    <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
  ) : (
    <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
  );
}

export function DataTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white border border-surface-border rounded-xl overflow-hidden shadow-card">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-surface-border bg-pastel-sand/50">{children}</tr>
    </thead>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th className={cn('text-left px-3 py-2 text-text-muted font-medium text-xs', className)}>
      {children}
    </th>
  );
}

export function ExpandableRow({
  expanded,
  onToggle,
  colSpan,
  summaryCells,
  detail,
  className,
}: {
  expanded: boolean;
  onToggle: () => void;
  colSpan: number;
  summaryCells: ReactNode;
  detail: ReactNode;
  className?: string;
}) {
  return (
    <>
      <tr
        className={cn(
          'border-b border-surface-border/50 hover:bg-pastel-blue/25 cursor-pointer transition-colors',
          className,
        )}
        onClick={onToggle}
      >
        <td className="px-3 py-2 w-8" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={onToggle} className="p-0.5 -m-0.5" aria-expanded={expanded}>
            <ExpandChevron expanded={expanded} />
          </button>
        </td>
        {summaryCells}
      </tr>
      {expanded && (
        <tr className="bg-pastel-blue/15 border-b border-surface-border/50">
          <td colSpan={colSpan} className="px-4 py-3">
            {detail}
          </td>
        </tr>
      )}
    </>
  );
}

export function DetailSection({
  title,
  theme = 'blue',
  children,
  className,
}: {
  title: string;
  theme?: 'blue' | 'mint' | 'lilac' | 'peach' | 'sand' | 'rose';
  children: ReactNode;
  className?: string;
}) {
  const headers = {
    blue: 'bg-pastel-blue text-brand-700',
    mint: 'bg-pastel-mint text-emerald-800',
    lilac: 'bg-pastel-lilac text-violet-800',
    peach: 'bg-pastel-peach text-orange-800',
    sand: 'bg-pastel-sand text-amber-800',
    rose: 'bg-pastel-rose text-rose-800',
  };
  return (
    <div className={cn('bg-white border border-surface-border rounded-lg overflow-hidden', className)}>
      <div className={cn('px-3 py-1.5 border-b border-surface-border/80', headers[theme])}>
        <span className={pt.section}>{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

export function InfoGrid({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
      {rows.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <span className="text-text-muted">{k}: </span>
          <span className="text-text-primary font-medium">{v ?? '—'}</span>
        </div>
      ))}
    </div>
  );
}

export function StatChip({
  children,
  tone = 'blue',
}: {
  children: ReactNode;
  tone?: 'blue' | 'mint' | 'lilac' | 'peach' | 'rose' | 'sand';
}) {
  const tones = {
    blue: 'bg-pastel-blue text-brand-700',
    mint: 'bg-pastel-mint text-emerald-800',
    lilac: 'bg-pastel-lilac text-violet-800',
    peach: 'bg-pastel-peach text-orange-800',
    rose: 'bg-pastel-rose text-rose-800',
    sand: 'bg-pastel-sand text-amber-800',
  };
  return <span className={cn(pt.chip, tones[tone])}>{children}</span>;
}

export function StatBox({
  label,
  value,
  tone = 'blue',
}: {
  label: string;
  value: string | number;
  tone?: 'blue' | 'mint' | 'lilac' | 'peach' | 'rose' | 'sand';
}) {
  const bg = {
    blue: 'bg-pastel-blue/60',
    mint: 'bg-pastel-mint/60',
    lilac: 'bg-pastel-lilac/60',
    peach: 'bg-pastel-peach/60',
    rose: 'bg-pastel-rose/60',
    sand: 'bg-pastel-sand/60',
  };
  return (
    <div className={cn('rounded-lg px-2.5 py-1.5 text-center border border-surface-border/60', bg[tone])}>
      <p className="text-[10px] text-text-muted uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}

export function TabPills<T extends string>({
  tabs,
  active,
  onChange,
  counts,
}: {
  tabs: readonly T[];
  active: T;
  onChange: (t: T) => void;
  counts?: Partial<Record<T, number>>;
}) {
  return (
    <div className="flex gap-1 bg-white border border-surface-border rounded-lg p-0.5 w-fit flex-wrap">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
            active === t ? 'bg-brand-500 text-white' : 'text-text-secondary hover:bg-pastel-blue/50',
          )}
        >
          {t}
          {counts?.[t] != null ? ` (${counts[t]})` : ''}
        </button>
      ))}
    </div>
  );
}

export function ProfileField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-2 text-xs py-0.5">
      <span className="text-text-muted shrink-0">{label}</span>
      <span className="text-text-primary font-medium text-right truncate">
        {value ?? <span className="text-text-muted font-normal">—</span>}
      </span>
    </div>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
