'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

async function fetchConfig() {
  const res = await fetch('/api/v1/admin/config', { credentials: 'include' });
  return (await res.json()).data;
}

async function updateConfig(data: any) {
  const res = await fetch('/api/v1/admin/config', {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export default function AdminConfigPage() {
  const qc = useQueryClient();
  const { data: config, isLoading } = useQuery({ queryKey: ['admin-config'], queryFn: fetchConfig });
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  const mutation = useMutation({
    mutationFn: updateConfig,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-config'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const cfg = { ...config, ...form };

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => mutation.mutate(form);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-card border border-surface-border rounded-xl p-5 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Platform Configuration</h1>
          <p className="text-text-muted text-sm mt-1">Global settings for the RightDirection platform</p>
        </div>
        <button
          onClick={handleSave}
          disabled={mutation.isPending || Object.keys(form).length === 0}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            saved ? 'bg-status-success text-white' : 'bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50',
          )}
        >
          {mutation.isPending ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Commission Settings */}
      <section className="bg-surface-card border border-surface-border rounded-xl p-5">
        <h2 className="text-text-primary font-semibold mb-4">Commission Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-text-muted text-xs mb-1 block">Platform Share (%)</label>
            <input
              type="number"
              value={cfg.platformSharePct ?? 30}
              onChange={(e) => set('platformSharePct', Number(e.target.value))}
              min={0} max={100}
              className="w-full bg-surface-card2 border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-text-muted text-xs mb-1 block">TDS Rate (%)</label>
            <input
              type="number"
              value={cfg.tdsRatePct ?? 10}
              onChange={(e) => set('tdsRatePct', Number(e.target.value))}
              min={0} max={50}
              className="w-full bg-surface-card2 border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-text-muted text-xs mb-1 block">Min Payout Threshold (₹)</label>
            <input
              type="number"
              value={cfg.minPayoutThreshold ?? 5000}
              onChange={(e) => set('minPayoutThreshold', Number(e.target.value))}
              className="w-full bg-surface-card2 border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-text-muted text-xs mb-1 block">Payout Cycle (days)</label>
            <select
              value={cfg.payoutCycleDays ?? 30}
              onChange={(e) => set('payoutCycleDays', Number(e.target.value))}
              className="w-full bg-surface-card2 border border-surface-border rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-brand-500"
            >
              <option value={7}>Weekly (7 days)</option>
              <option value={15}>Bi-monthly (15 days)</option>
              <option value={30}>Monthly (30 days)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Lead Marketplace Settings */}
      <section className="bg-surface-card border border-surface-border rounded-xl p-5">
        <h2 className="text-text-primary font-semibold mb-4">Lead Marketplace</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-text-muted text-xs mb-1 block">Default Lead Price (₹)</label>
            <input
              type="number"
              value={cfg.defaultLeadPrice ?? 999}
              onChange={(e) => set('defaultLeadPrice', Number(e.target.value))}
              className="w-full bg-surface-card2 border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-text-muted text-xs mb-1 block">Lead Expiry (days)</label>
            <input
              type="number"
              value={cfg.leadExpiryDays ?? 30}
              onChange={(e) => set('leadExpiryDays', Number(e.target.value))}
              className="w-full bg-surface-card2 border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set('marketplaceEnabled', !cfg.marketplaceEnabled)}
                className={cn(
                  'w-10 h-5 rounded-full transition-colors relative',
                  cfg.marketplaceEnabled ? 'bg-brand-500' : 'bg-surface-card2 border border-surface-border',
                )}
              >
                <div className={cn(
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  cfg.marketplaceEnabled ? 'translate-x-5' : 'translate-x-0.5',
                )} />
              </div>
              <span className="text-text-secondary text-sm">Marketplace enabled</span>
            </label>
          </div>
        </div>
      </section>

      {/* AI Settings */}
      <section className="bg-surface-card border border-surface-border rounded-xl p-5">
        <h2 className="text-text-primary font-semibold mb-4">AI Service</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-text-muted text-xs mb-1 block">Free AI Credits (Trial)</label>
            <input
              type="number"
              value={cfg.trialAiCredits ?? 5}
              onChange={(e) => set('trialAiCredits', Number(e.target.value))}
              className="w-full bg-surface-card2 border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-text-muted text-xs mb-1 block">Fraud Score Alert Threshold</label>
            <input
              type="number"
              step="0.05"
              min="0" max="1"
              value={cfg.fraudAlertThreshold ?? 0.6}
              onChange={(e) => set('fraudAlertThreshold', parseFloat(e.target.value))}
              className="w-full bg-surface-card2 border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set('autoFraudFlagEnabled', !cfg.autoFraudFlagEnabled)}
                className={cn(
                  'w-10 h-5 rounded-full transition-colors relative',
                  cfg.autoFraudFlagEnabled ? 'bg-brand-500' : 'bg-surface-card2 border border-surface-border',
                )}
              >
                <div className={cn(
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  cfg.autoFraudFlagEnabled ? 'translate-x-5' : 'translate-x-0.5',
                )} />
              </div>
              <span className="text-text-secondary text-sm">Auto-flag documents above threshold</span>
            </label>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="bg-surface-card border border-surface-border rounded-xl p-5">
        <h2 className="text-text-primary font-semibold mb-4">Subscription Plans (₹/month)</h2>
        <div className="grid grid-cols-3 gap-4">
          {['STARTER', 'PRO', 'ENTERPRISE'].map((plan) => (
            <div key={plan}>
              <label className="text-text-muted text-xs mb-1 block">{plan}</label>
              <input
                type="number"
                value={cfg[`plan${plan}Price`] ?? ({ STARTER: 2999, PRO: 5999, ENTERPRISE: 9999 }[plan])}
                onChange={(e) => set(`plan${plan}Price`, Number(e.target.value))}
                className="w-full bg-surface-card2 border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
