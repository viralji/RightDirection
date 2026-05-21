'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { formatDate, cn } from '@/lib/utils';

async function fetchPlan() {
  const res = await fetch('/api/v1/billing/plan', { credentials: 'include' });
  return (await res.json()).data;
}

async function fetchHistory() {
  const res = await fetch('/api/v1/billing/history', { credentials: 'include' });
  return (await res.json()).data;
}

async function subscribeToPlan(plan: string) {
  const res = await fetch('/api/v1/billing/subscribe', {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });
  return (await res.json()).data;
}

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: '₹2,999',
    period: '/month',
    students: 50,
    team: 3,
    ai: 30,
    features: ['Up to 50 students', '3 team members', '30 AI credits/month', 'Basic analytics', 'Email support'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '₹5,999',
    period: '/month',
    students: 200,
    team: 10,
    ai: 100,
    features: ['Up to 200 students', '10 team members', '100 AI credits/month', 'Advanced analytics', 'Priority support', 'White-label branding', 'API access'],
    highlighted: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: '₹9,999',
    period: '/month',
    students: -1,
    team: -1,
    ai: 500,
    features: ['Unlimited students', 'Unlimited team', '500 AI credits/month', 'Custom integrations', 'Dedicated support', 'Custom SLA'],
  },
];

export default function BillingPage() {
  const [subscribing, setSubscribing] = useState('');

  const { data: plan, isLoading: planLoading } = useQuery({ queryKey: ['billing-plan'], queryFn: fetchPlan });
  const { data: history } = useQuery({ queryKey: ['billing-history'], queryFn: fetchHistory });

  const subscribeMutation = useMutation({
    mutationFn: subscribeToPlan,
    onSuccess: (data) => {
      if (data?.shortUrl) window.open(data.shortUrl, '_blank');
    },
    onSettled: () => setSubscribing(''),
  });

  const currentPlan = plan?.plan ?? 'TRIAL';
  const isExpired = plan?.status === 'EXPIRED' || plan?.status === 'CANCELLED';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Billing & Subscription</h1>
        <p className="text-text-muted text-sm mt-1">Manage your plan and payment history</p>
      </div>

      {/* Current Plan Banner */}
      {!planLoading && (
        <div className={cn(
          'border rounded-xl p-5 flex items-center justify-between',
          isExpired ? 'border-status-error/40 bg-status-error/5' : 'border-brand-500/30 bg-brand-500/5',
        )}>
          <div>
            <p className="text-text-muted text-sm">Current Plan</p>
            <p className="text-text-primary text-xl font-bold mt-0.5">{currentPlan}</p>
            {plan?.expiresAt && (
              <p className={cn('text-xs mt-1', isExpired ? 'text-status-error' : 'text-text-muted')}>
                {isExpired ? 'Expired' : 'Renews'} {formatDate(plan.expiresAt)}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-text-muted text-xs">Limits</p>
            <p className="text-text-secondary text-sm">
              {plan?.limits?.students === -1 ? 'Unlimited' : plan?.limits?.students} students ·{' '}
              {plan?.limits?.teamMembers === -1 ? 'Unlimited' : plan?.limits?.teamMembers} team ·{' '}
              {plan?.limits?.aiCredits} AI credits
            </p>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div>
        <h2 className="text-text-primary font-semibold mb-4">Upgrade Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={cn(
                'border rounded-xl p-5 flex flex-col',
                p.highlighted
                  ? 'border-brand-500/60 bg-brand-500/5'
                  : 'border-surface-border bg-surface-card',
              )}
            >
              {p.highlighted && (
                <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full w-fit mb-3">
                  Most Popular
                </span>
              )}
              <h3 className="text-text-primary font-semibold text-lg">{p.name}</h3>
              <div className="mt-1 mb-4">
                <span className="text-3xl font-bold text-text-primary">{p.price}</span>
                <span className="text-text-muted text-sm">{p.period}</span>
              </div>
              <ul className="space-y-2 flex-1 mb-5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="text-status-success">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setSubscribing(p.id);
                  subscribeMutation.mutate(p.id);
                }}
                disabled={currentPlan === p.id || subscribeMutation.isPending}
                className={cn(
                  'w-full py-2 rounded-lg text-sm font-medium transition-colors',
                  currentPlan === p.id
                    ? 'bg-surface-card2 text-text-muted cursor-default border border-surface-border'
                    : p.highlighted
                    ? 'bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50'
                    : 'bg-surface-card2 border border-surface-border text-text-secondary hover:text-text-primary disabled:opacity-50',
                )}
              >
                {currentPlan === p.id ? 'Current Plan' :
                 subscribing === p.id ? 'Redirecting...' : 'Upgrade to ' + p.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div>
        <h2 className="text-text-primary font-semibold mb-4">Payment History</h2>
        <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Date</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Description</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Amount</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(history ?? []).map((h: any) => (
                <tr key={h.id} className="border-b border-surface-border/50">
                  <td className="px-4 py-3 text-text-muted">{formatDate(h.createdAt)}</td>
                  <td className="px-4 py-3 text-text-secondary">{h.description ?? 'Subscription payment'}</td>
                  <td className="px-4 py-3 text-text-primary">₹{Number(h.amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      h.status === 'PAID' ? 'bg-status-success/20 text-status-success' : 'bg-status-warning/20 text-status-warning',
                    )}>
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!(history ?? []).length && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-muted">No payment history</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
