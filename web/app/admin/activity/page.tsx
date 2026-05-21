'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDate, cn } from '@/lib/utils';

async function fetchActivityLog(page: number, tenantId?: string, action?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: '50' });
  if (tenantId) params.set('tenantId', tenantId);
  if (action) params.set('action', action);
  const res = await fetch(`/api/v1/admin/activity-log?${params}`, { credentials: 'include' });
  return (await res.json());
}

const ACTION_ICONS: Record<string, string> = {
  CREATE: '➕', UPDATE: '✏️', DELETE: '🗑️', LOGIN: '🔑', LOGOUT: '👋',
  KYC_SUBMITTED: '📋', KYC_APPROVED: '✅', KYC_REJECTED: '❌',
  STAGE_CHANGED: '🔄', DOCUMENT_UPLOADED: '📤', COMMISSION_PAID: '💰',
};

export default function ActivityLogPage() {
  const [page, setPage] = useState(1);
  const [tenantFilter, setTenantFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['activity-log-admin', page, tenantFilter, actionFilter],
    queryFn: () => fetchActivityLog(page, tenantFilter || undefined, actionFilter || undefined),
  });

  const logs = data?.data?.data ?? data?.data ?? [];
  const meta = data?.data?.meta ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Activity Log</h1>
        <p className="text-text-muted text-sm mt-1">Full audit trail of platform events</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Filter by tenant ID..."
          value={tenantFilter}
          onChange={(e) => { setTenantFilter(e.target.value); setPage(1); }}
          className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-500 w-64"
        />
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-brand-500"
        >
          <option value="">All Actions</option>
          {Object.keys(ACTION_ICONS).map((a) => (
            <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {meta.total && <span className="ml-auto text-text-muted text-sm self-center">{meta.total} events</span>}
      </div>

      {/* Log table */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Action</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">User</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Tenant</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Entity</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Description</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">Loading...</td>
              </tr>
            )}
            {(Array.isArray(logs) ? logs : []).map((log: any) => (
              <tr key={log.id} className="border-b border-surface-border/50 hover:bg-surface-card2/50">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <span>{ACTION_ICONS[log.action] ?? '•'}</span>
                    <span className="text-text-primary">{log.action?.replace(/_/g, ' ')}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{log.user?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{log.tenant?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-muted">{log.entityType ?? '—'}</td>
                <td className="px-4 py-3 text-text-muted truncate max-w-xs">{log.description ?? '—'}</td>
                <td className="px-4 py-3 text-text-muted">{formatDate(log.createdAt)}</td>
              </tr>
            ))}
            {!isLoading && !logs.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">No activity found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.total > 50 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-surface-card border border-surface-border rounded-lg text-sm text-text-secondary disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-3 py-1.5 text-sm text-text-muted">Page {page} of {Math.ceil(meta.total / 50)}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={(Array.isArray(logs) ? logs : []).length < 50}
            className="px-3 py-1.5 bg-surface-card border border-surface-border rounded-lg text-sm text-text-secondary disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
