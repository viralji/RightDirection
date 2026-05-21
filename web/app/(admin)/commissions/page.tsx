'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate, cn } from '@/lib/utils';

async function fetchPending() {
  const res = await fetch('/api/v1/admin/commissions/pending', { credentials: 'include' });
  return (await res.json()).data;
}

async function updateStatus(id: string, status: string) {
  const res = await fetch(`/api/v1/commissions/${id}/status`, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-status-warning/20 text-status-warning',
  UNIVERSITY_PAID: 'bg-status-info/20 text-status-info',
  APPROVED: 'bg-brand-500/20 text-brand-400',
  PAID_TO_AGENT: 'bg-status-success/20 text-status-success',
};

export default function AdminCommissionsPage() {
  const qc = useQueryClient();
  const { data: commissions, isLoading } = useQuery({ queryKey: ['admin-commissions'], queryFn: fetchPending });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-commissions'] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Commission Management</h1>

      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Student</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Agent</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">University</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Gross</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Net Payable</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>}
            {commissions?.map((c: any) => (
              <tr key={c.id} className="border-b border-surface-border/50 hover:bg-surface-card2/50">
                <td className="px-4 py-3 text-text-primary">{c.application?.student?.user?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{c.agent?.tenant?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{c.university?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-primary">₹{Number(c.grossAmountInr).toLocaleString()}</td>
                <td className="px-4 py-3 text-status-success font-medium">₹{Number(c.netPayableInr).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', STATUS_COLORS[c.status] || '')}>
                    {c.status?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {c.status === 'PENDING' && (
                      <button onClick={() => mutation.mutate({ id: c.id, status: 'UNIVERSITY_PAID' })}
                        className="text-xs bg-status-info/20 text-status-info px-2 py-0.5 rounded hover:bg-status-info/30">Mark Univ Paid</button>
                    )}
                    {c.status === 'UNIVERSITY_PAID' && (
                      <button onClick={() => mutation.mutate({ id: c.id, status: 'APPROVED' })}
                        className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded hover:bg-brand-500/30">Approve</button>
                    )}
                    {c.status === 'APPROVED' && (
                      <button onClick={() => mutation.mutate({ id: c.id, status: 'PAID_TO_AGENT' })}
                        className="text-xs bg-status-success/20 text-status-success px-2 py-0.5 rounded hover:bg-status-success/30">Pay Agent</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!commissions?.length && !isLoading && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">No pending commissions</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
