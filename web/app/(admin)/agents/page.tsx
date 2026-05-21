'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { formatDate, cn } from '@/lib/utils';

const KYC_COLORS: Record<string, string> = {
  PENDING: 'bg-text-muted/20 text-text-muted',
  UNDER_REVIEW: 'bg-status-warning/20 text-status-warning',
  APPROVED: 'bg-status-success/20 text-status-success',
  REJECTED: 'bg-status-error/20 text-status-error',
  RE_UPLOAD_REQUIRED: 'bg-status-warning/20 text-status-warning',
};

async function fetchAgents(params: any) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/v1/admin/agents?${qs}`, { credentials: 'include' });
  return (await res.json());
}

async function reviewKyc(tenantId: string, status: string, reason?: string) {
  const res = await fetch(`/api/v1/admin/agents/${tenantId}/kyc`, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reason }),
  });
  return res.json();
}

export default function AdminAgentsPage() {
  const qc = useQueryClient();
  const [kycFilter, setKycFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-agents', kycFilter],
    queryFn: () => fetchAgents({ ...(kycFilter && { kycStatus: kycFilter }) }),
  });

  const kycMutation = useMutation({
    mutationFn: ({ tenantId, status }: { tenantId: string; status: string }) => reviewKyc(tenantId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-agents'] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Agent Management</h1>

      <div className="flex gap-2">
        {['', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setKycFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-sm border transition-colors',
              kycFilter === s ? 'bg-brand-500 border-brand-500 text-white' : 'border-surface-border text-text-secondary hover:bg-surface-card')}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Agency</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Subdomain</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">City</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Plan</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Students</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">KYC</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Joined</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={8} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>}
            {data?.data?.map((a: any) => (
              <tr key={a.id} className="border-b border-surface-border/50 hover:bg-surface-card2/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary">{a.businessName}</p>
                  <p className="text-text-muted text-xs">{a.tenant?.email}</p>
                </td>
                <td className="px-4 py-3 text-text-secondary">{a.tenant?.subdomain}</td>
                <td className="px-4 py-3 text-text-secondary">{a.city}</td>
                <td className="px-4 py-3 text-text-secondary capitalize">{a.tenant?.subscriptionPlan?.toLowerCase()}</td>
                <td className="px-4 py-3 text-text-secondary">{a._count?.students ?? 0}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', KYC_COLORS[a.kycStatus] || '')}>
                    {a.kycStatus?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted">{formatDate(a.createdAt)}</td>
                <td className="px-4 py-3">
                  {a.kycStatus === 'UNDER_REVIEW' && (
                    <div className="flex gap-1.5">
                      <button onClick={() => kycMutation.mutate({ tenantId: a.tenantId, status: 'APPROVED' })}
                        className="text-xs bg-status-success/20 text-status-success px-2 py-0.5 rounded hover:bg-status-success/30">Approve</button>
                      <button onClick={() => kycMutation.mutate({ tenantId: a.tenantId, status: 'REJECTED' })}
                        className="text-xs bg-status-error/20 text-status-error px-2 py-0.5 rounded hover:bg-status-error/30">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
