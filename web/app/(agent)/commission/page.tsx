'use client';

import { useQuery } from '@tanstack/react-query';
import { commissions } from '@/lib/api';
import { Wallet, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-status-warning/20 text-status-warning',
  UNIVERSITY_PAID: 'bg-status-info/20 text-status-info',
  APPROVED: 'bg-brand-500/20 text-brand-400',
  PAID_TO_AGENT: 'bg-status-success/20 text-status-success',
  DISPUTED: 'bg-status-error/20 text-status-error',
};

export default function CommissionPage() {
  const { data: wallet } = useQuery({ queryKey: ['wallet'], queryFn: () => commissions.wallet() });
  const { data: list, isLoading } = useQuery({
    queryKey: ['commissions'],
    queryFn: () => commissions.list(),
  });

  const fmt = (n: number) => `₹${(n / 100000).toFixed(2)}L`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Commission & Wallet</h1>
        <p className="text-text-muted text-sm mt-1">Track your earnings and payouts</p>
      </div>

      {/* Wallet Cards */}
      {wallet && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Wallet Balance', value: fmt(Number(wallet.walletBalance)), icon: Wallet, color: 'bg-brand-500/20 text-brand-400' },
            { label: 'Total Earned', value: fmt(Number(wallet.totalEarned)), icon: TrendingUp, color: 'bg-status-success/20 text-status-success' },
            { label: 'Pending Commission', value: fmt(Number(wallet.pendingCommission)), icon: Clock, color: 'bg-status-warning/20 text-status-warning' },
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

      {/* Commission Ledger */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-semibold text-text-primary">Commission Ledger</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Student</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">University</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Gross</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">TDS</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Net Payable</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>}
            {(list as any)?.data?.map((c: any) => (
              <tr key={c.id} className="border-b border-surface-border/50 hover:bg-surface-card2/50">
                <td className="px-4 py-3 text-text-primary">{c.application?.student?.user?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{c.university?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-primary">₹{Number(c.grossAmountInr).toLocaleString()}</td>
                <td className="px-4 py-3 text-status-warning">₹{Number(c.tdsAmount).toLocaleString()}</td>
                <td className="px-4 py-3 text-status-success font-medium">₹{Number(c.netPayableInr).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', STATUS_COLORS[c.status] || '')}>
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {!(list as any)?.data?.length && !isLoading && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">No commissions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
