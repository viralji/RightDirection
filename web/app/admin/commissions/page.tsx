'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate, cn } from '@/lib/utils';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ─── API ─────────────────────────────────────────────────────────────────────

const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`/api/v1${path}`, { credentials: 'include', ...opts }).then(r => r.json());

// ─── Colors ──────────────────────────────────────────────────────────────────

const PIE_COLORS = ['#2b7cff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400',
  UNIVERSITY_PAID: 'bg-status-info/20 text-status-info',
  APPROVED: 'bg-brand-500/20 text-brand-400',
  PAID_TO_AGENT: 'bg-status-success/20 text-status-success',
  DISPUTED: 'bg-status-error/20 text-status-error',
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-xs shadow-lg">
      {label && <p className="text-text-muted mb-1">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color || p.fill }}>
          {p.name || p.dataKey}: ₹{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-text-primary font-medium">{d.name}</p>
      <p style={{ color: d.payload.fill }}>₹{Number(d.value).toLocaleString()}</p>
      <p className="text-text-muted">{d.payload.percent ? `${(d.payload.percent * 100).toFixed(1)}%` : ''}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCommissionsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState(''); // for drill-down

  const { data: analyticsData } = useQuery({
    queryKey: ['admin-commission-analytics'],
    queryFn: () => apiFetch('/admin/commissions/analytics').then(r => r.data),
  });

  const { data: commissionsData, isLoading } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: () => apiFetch('/admin/commissions/pending').then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/commissions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-commissions'] }),
  });

  const analytics = analyticsData;
  const summary = analytics?.summary;
  const allCommissions = (commissionsData ?? []) as any[];

  // Apply filters for drill-down
  const filtered = allCommissions.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (agentFilter && c.agent?.tenant?.name !== agentFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Commission Management</h1>

      {/* ── Summary Cards ────────────────────────────────────────────── */}
      {summary && (
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total Gross', value: `₹${(summary.totalGross / 100000).toFixed(2)}L`, color: 'text-text-primary' },
            { label: 'Total Net', value: `₹${(summary.totalNet / 100000).toFixed(2)}L`, color: 'text-brand-400' },
            { label: 'Pending Payout', value: `₹${(summary.totalPending / 100000).toFixed(2)}L`, color: 'text-amber-400' },
            { label: 'Paid Out', value: `₹${(summary.totalPaid / 100000).toFixed(2)}L`, color: 'text-status-success' },
            { label: 'Transactions', value: summary.totalTransactions, color: 'text-text-secondary' },
          ].map(s => (
            <div key={s.label} className="bg-surface-card border border-surface-border rounded-xl p-4 text-center">
              <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts ───────────────────────────────────────────────────── */}
      {analytics && (
        <div className="grid grid-cols-2 gap-4">

          {/* Monthly Bar Chart */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5">
            <h3 className="font-semibold text-text-primary text-sm mb-4">Monthly Commission (Net, ₹)</h3>
            {analytics.byMonth?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.byMonth} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={m => m.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} width={50} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Net Commission" fill="#2b7cff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-text-muted text-sm">No data yet</div>
            )}
          </div>

          {/* By Agent Pie Chart */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary text-sm">Commission by Agent</h3>
              {agentFilter && (
                <button onClick={() => setAgentFilter('')}
                  className="text-xs text-brand-400 hover:underline">Clear filter</button>
              )}
            </div>
            {analytics.byAgent?.length > 0 ? (
              <div className="flex gap-4">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie
                      data={analytics.byAgent}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      onClick={(d) => setAgentFilter(agentFilter === d.name ? '' : d.name)}
                      style={{ cursor: 'pointer' }}
                    >
                      {analytics.byAgent.map((_: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}
                          opacity={agentFilter && analytics.byAgent[i]?.name !== agentFilter ? 0.4 : 1} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[200px]">
                  {analytics.byAgent.map((d: any, i: number) => (
                    <button
                      key={d.name}
                      onClick={() => setAgentFilter(agentFilter === d.name ? '' : d.name)}
                      className={cn('flex items-center gap-2 w-full text-left rounded px-1 py-0.5 hover:bg-surface-card2',
                        agentFilter === d.name ? 'bg-surface-card2' : '')}
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-text-secondary truncate flex-1">{d.name}</span>
                      <span className="text-xs text-text-muted flex-shrink-0">₹{(d.value / 1000).toFixed(0)}k</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">No data yet</div>
            )}
          </div>

          {/* By University Bar */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5">
            <h3 className="font-semibold text-text-primary text-sm mb-4">Commission by University (₹)</h3>
            {analytics.byUniversity?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.byUniversity} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} width={120} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Commission" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">No data yet</div>
            )}
          </div>

          {/* By Status */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary text-sm">Status Breakdown</h3>
              {statusFilter && (
                <button onClick={() => setStatusFilter('')} className="text-xs text-brand-400 hover:underline">Clear</button>
              )}
            </div>
            {analytics.byStatus?.length > 0 ? (
              <div className="space-y-3">
                {analytics.byStatus.map((s: any, i: number) => (
                  <button
                    key={s.status}
                    onClick={() => setStatusFilter(statusFilter === s.status ? '' : s.status)}
                    className={cn('flex items-center gap-3 w-full text-left rounded-lg px-3 py-2 hover:bg-surface-card2 transition-colors',
                      statusFilter === s.status ? 'bg-surface-card2 ring-1 ring-brand-500/30' : '')}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">{s.status.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-semibold text-text-primary">{s.count}</span>
                      </div>
                      <div className="mt-1 bg-surface-card2 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{
                          width: `${(s.count / (summary?.totalTransactions || 1)) * 100}%`,
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">No data yet</div>
            )}
          </div>
        </div>
      )}

      {/* ── Ledger Table ─────────────────────────────────────────────── */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-text-primary">Commission Ledger</h2>
            {(statusFilter || agentFilter) && (
              <p className="text-xs text-text-muted mt-0.5">
                Filtered: {[statusFilter, agentFilter].filter(Boolean).join(' · ')} — {filtered.length} records
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {['', 'PENDING', 'UNIVERSITY_PAID', 'APPROVED', 'PAID_TO_AGENT'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
                className={cn('text-xs px-2.5 py-1 rounded-lg border transition-colors',
                  statusFilter === s ? 'bg-brand-500 border-brand-500 text-white' : 'border-surface-border text-text-secondary hover:bg-surface-card2')}>
                {s ? s.replace(/_/g, ' ') : 'All'}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Student</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Agent</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">University</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Gross</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Platform</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Net Payable</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Date</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={9} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>}
            {filtered.map((c: any) => (
              <tr key={c.id} className="border-b border-surface-border/50 hover:bg-surface-card2/30">
                <td className="px-4 py-3 text-text-primary">{c.application?.student?.user?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setAgentFilter(agentFilter === c.agent?.tenant?.name ? '' : c.agent?.tenant?.name)}
                    className="text-text-secondary hover:text-brand-400 text-sm"
                  >
                    {c.agent?.tenant?.name ?? '—'}
                  </button>
                </td>
                <td className="px-4 py-3 text-text-secondary">{c.university?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-primary">₹{Number(c.grossAmountInr).toLocaleString()}</td>
                <td className="px-4 py-3 text-text-muted">₹{Number(c.platformShare ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-status-success font-medium">₹{Number(c.netPayableInr).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[c.status] ?? '')}>
                    {c.status?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted text-xs">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {c.status === 'PENDING' && (
                      <button onClick={() => mutation.mutate({ id: c.id, status: 'UNIVERSITY_PAID' })}
                        className="text-xs bg-status-info/20 text-status-info px-2 py-0.5 rounded">Mark Paid</button>
                    )}
                    {c.status === 'UNIVERSITY_PAID' && (
                      <button onClick={() => mutation.mutate({ id: c.id, status: 'APPROVED' })}
                        className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded">Approve</button>
                    )}
                    {c.status === 'APPROVED' && (
                      <button onClick={() => mutation.mutate({ id: c.id, status: 'PAID_TO_AGENT' })}
                        className="text-xs bg-status-success/20 text-status-success px-2 py-0.5 rounded">Pay Agent</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && !isLoading && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-text-muted">No commissions match the current filter</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
