'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDate, cn } from '@/lib/utils';

async function fetchActivityLog(page: number, tenantId?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: '50' });
  if (tenantId) params.set('tenantId', tenantId);
  const res = await fetch(`/api/v1/admin/activity-log?${params}`, { credentials: 'include' });
  return (await res.json()).data;
}

const ACTION_ICONS: Record<string, string> = {
  CREATE: '➕',
  UPDATE: '✏️',
  DELETE: '🗑️',
  LOGIN: '🔑',
  LOGOUT: '👋',
  KYC_SUBMITTED: '📋',
  KYC_APPROVED: '✅',
  KYC_REJECTED: '❌',
  STAGE_CHANGED: '🔄',
  DOCUMENT_UPLOADED: '📤',
  COMMISSION_PAID: '💰',
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'text-status-success',
  UPDATE: 'text-brand-400',
  DELETE: 'text-status-error',
  LOGIN: 'text-status-info',
  KYC_APPROVED: 'text-status-success',
  KYC_REJECTED: 'text-status-error',
  COMMISSION_PAID: 'text-status-success',
};

interface ActivityLogProps {
  tenantId?: string;
  compact?: boolean;
  maxItems?: number;
}

export function ActivityLog({ tenantId, compact = false, maxItems }: ActivityLogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['activity-log', tenantId],
    queryFn: () => fetchActivityLog(1, tenantId),
  });

  const logs = (data?.items ?? data ?? []).slice(0, maxItems ?? 999) as any[];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-surface-card2 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!logs.length) {
    return <p className="text-text-muted text-sm">No activity yet</p>;
  }

  return (
    <div className="space-y-1">
      {logs.map((log: any) => (
        <div
          key={log.id}
          className={cn(
            'flex items-start gap-3 rounded-lg transition-colors',
            compact ? 'px-2 py-1.5 hover:bg-surface-card2/50' : 'px-3 py-2 hover:bg-surface-card2/50',
          )}
        >
          <span className="text-base flex-shrink-0 mt-0.5">
            {ACTION_ICONS[log.action] ?? '•'}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className={cn('text-sm font-medium', ACTION_COLORS[log.action] ?? 'text-text-primary')}>
                {log.action?.replace(/_/g, ' ')}
              </span>
              {log.entityType && (
                <span className="text-text-muted text-xs">{log.entityType}</span>
              )}
            </div>
            {!compact && log.description && (
              <p className="text-text-secondary text-xs truncate">{log.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
              {log.user?.name && <span>{log.user.name}</span>}
              {log.tenant?.name && <span>· {log.tenant.name}</span>}
              <span>· {formatDate(log.createdAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
