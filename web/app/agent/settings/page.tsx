'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { agent, tenants } from '@/lib/api';

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({ queryKey: ['agent-profile'], queryFn: () => agent.profile() });
  const [color, setColor] = useState(profile?.tenant?.primaryColor ?? '#2b7cff');
  const [saved, setSaved] = useState(false);

  const updateBranding = useMutation({
    mutationFn: (data: any) => tenants.updateBranding(data),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); qc.invalidateQueries({ queryKey: ['agent-profile'] }); },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

      {/* White-label Branding */}
      <section className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-text-primary">White-Label Branding</h2>
        <p className="text-text-muted text-sm">Customise your portal's appearance for your brand.</p>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Agency Name</label>
          <input defaultValue={profile?.tenant?.name} readOnly
            className="w-full px-3 py-2.5 bg-surface border border-surface-border rounded-lg text-text-primary text-sm opacity-60 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Portal URL</label>
          <div className="flex items-center gap-0 bg-surface border border-surface-border rounded-lg overflow-hidden">
            <input defaultValue={profile?.tenant?.subdomain} readOnly
              className="flex-1 px-3 py-2.5 bg-transparent text-text-primary text-sm opacity-60 cursor-not-allowed focus:outline-none" />
            <span className="px-3 py-2.5 bg-surface-card2 text-text-muted text-sm">.rightdirection.com</span>
          </div>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">Primary Brand Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              className="w-12 h-10 rounded-lg border border-surface-border cursor-pointer bg-transparent" />
            <input value={color} onChange={e => setColor(e.target.value)}
              className="px-3 py-2.5 bg-surface border border-surface-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-brand-500 w-32" />
            <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: color }} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Agency Logo</label>
          <p className="text-text-muted text-xs mb-2">Upload a PNG or SVG logo (recommended: 200×60px)</p>
          <button className="px-4 py-2 border border-surface-border text-text-secondary rounded-lg text-sm hover:bg-surface-card2">
            Upload Logo
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => updateBranding.mutate({ primaryColor: color })}
            disabled={updateBranding.isPending}
            className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-60">
            {updateBranding.isPending ? 'Saving...' : 'Save Branding'}
          </button>
          {saved && <span className="text-status-success text-sm">Saved!</span>}
        </div>
      </section>

      {/* Subscription */}
      <section className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-text-primary">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-primary font-medium capitalize">{profile?.tenant?.subscriptionPlan?.toLowerCase() ?? '—'} Plan</p>
            {profile?.tenant?.subscriptionPlanExpiresAt && (
              <p className="text-text-muted text-xs">Expires: {new Date(profile.tenant.planExpiresAt).toLocaleDateString('en-IN')}</p>
            )}
          </div>
          <button className="px-4 py-2 bg-brand-500/20 text-brand-400 rounded-lg text-sm hover:bg-brand-500/30">
            Upgrade Plan
          </button>
        </div>
      </section>
    </div>
  );
}
