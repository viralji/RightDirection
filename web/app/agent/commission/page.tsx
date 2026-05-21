'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { commissions } from '@/lib/api';
import { Wallet, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400',
  UNIVERSITY_PAID: 'bg-status-info/20 text-status-info',
  APPROVED: 'bg-brand-500/20 text-brand-400',
  PAID_TO_AGENT: 'bg-status-success/20 text-status-success',
  DISPUTED: 'bg-status-error/20 text-status-error',
};

const PIE_COLORS = ['#2b7cff', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316'];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-xs shadow-lg">
      {label && <p className="text-text-muted mb-1">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} className="text-text-primary">₹{Number(p.value).toLocaleString()}</p>
      ))}
    </div>
  );
}

export default function CommissionPage() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: wallet } = useQuery({ queryKey: ['wallet'], queryFn: () => commissions.wallet() });
  const { data: list, isLoading } = useQuery({
    queryKey: ['commissions'],
    queryFn: () => commissions.list(),
  });
  const { data: analytics } = useQuery({
    queryKey: ['commission-analytics'],
    queryFn: () => fetch('/api/v1/commissions/analytics', { credentials: 'include' }).then(r => r.json()).then(r => r.data),
  });

  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
    return `₹${n.toFixed(0)}`;
  };

  const ledger = ((list as any)?.data ?? []) as any[];
  const filtered = statusFilter ? ledger.filter(c => c.status === statusFilter) : ledger;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Commission & Wallet</h1>
        <p className="text-text-muted text-sm mt-1">Track your earnings and payouts</p>
      </div>

      {/* Wallet Cards */}
      {wallet && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Wallet Balance', value: fmt(Number(wallet.walletBalance)), icon: Wallet, color: 'bg-brand-500/20 text-brand-400' },
            { label: 'Total Earned', value: fmt(Number(wallet.totalEarned)), icon: TrendingUp, color: 'bg-status-success/20 text-status-success' },
            { label: 'Pending Commission', value: fmt(Number(wallet.pendingCommission)), icon: Clock, color: 'bg-amber-500/20 text-amber-400' },
            { label: 'Approved & Payable', value: fmt(Number(wallet.approvedAndPayable)), icon: CheckCircle, color: 'bg-status-info/20 text-status-info' },
          ].map(card => (
            <div key={card.label} className="bg-surface-card border border-surface-border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-xs">{card.label}</p>
                  <p className="text-xl font-bold text-text-primary mt-1">{card.value}</p>
                </div>
                <div className={cn('p-2.5 rounded-lg', card.color)}><card.icon className="w-4 h-4" /></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-2 gap-4">

          {/* Monthly Earnings */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5">
            <h3 className="font-semibold text-text-primary text-sm mb-4">Monthly Earnings (₹ Net)</h3>
            {analytics.byMonth?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.byMonth} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={m => m.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} width={48} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" fill="#2b7cff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">
                No commission data yet. Enroll your first student to start earning!
              </div>
            )}
          </div>

          {/* By University Pie */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5">
            <h3 className="font-semibold text-text-primary text-sm mb-4">Earnings by University</h3>
            {analytics.byUniversity?.length > 0 ? (
              <div className="flex gap-4">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie data={analytics.byUniversity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}>
                      {analytics.byUniversity.map((_: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[200px]">
                  {analytics.byUniversity.map((d: any, i: number) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-text-secondary truncate flex-1">{d.name}</span>
                      <span className="text-xs text-text-muted">₹{(d.value / 1000).toFixed(0)}k</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">No data yet</div>
            )}
          </div>
        </div>
      )}

      {/* Commission Ledger */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Commission Ledger ({filtered.length})</h2>
          <div className="flex gap-1.5">
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
              <th className="text-left px-4 py-3 text-text-muted font-medium">University</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Gross</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">TDS (10%)</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Net Payable</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>}
            {filtered.map((c: any) => (
              <tr key={c.id} className="border-b border-surface-border/50 hover:bg-surface-card2/50">
                <td className="px-4 py-3 text-text-primary">{c.application?.student?.user?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{c.university?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-primary">₹{Number(c.grossAmountInr).toLocaleString()}</td>
                <td className="px-4 py-3 text-amber-400">₹{Number(c.tdsAmount).toLocaleString()}</td>
                <td className="px-4 py-3 text-status-success font-medium">₹{Number(c.netPayableInr).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[c.status] ?? '')}>
                    {c.status?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {!filtered.length && !isLoading && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                {statusFilter ? 'No commissions with this status' : 'No commissions yet'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
