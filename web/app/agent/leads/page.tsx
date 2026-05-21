'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate, cn } from '@/lib/utils';

async function fetchLeads(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/v1/marketplace/leads?${qs}`, { credentials: 'include' });
  return (await res.json()).data;
}

async function unlockLead(leadId: string) {
  const res = await fetch(`/api/v1/marketplace/leads/${leadId}/unlock`, {
    method: 'POST', credentials: 'include',
  });
  return res.json();
}

const INTENT_COLORS: Record<string, string> = {
  HOT: 'bg-status-error/20 text-status-error',
  WARM: 'bg-status-warning/20 text-status-warning',
  COLD: 'bg-status-info/20 text-status-info',
};

const DESTINATION_FLAGS: Record<string, string> = {
  UK: '🇬🇧', Canada: '🇨🇦', Australia: '🇦🇺', Germany: '🇩🇪',
  USA: '🇺🇸', Ireland: '🇮🇪', NZ: '🇳🇿', Singapore: '🇸🇬',
};

export default function LeadsPage() {
  const qc = useQueryClient();
  const [intent, setIntent] = useState('ALL');
  const [destination, setDestination] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['marketplace-leads', intent, destination, page],
    queryFn: () => fetchLeads({
      ...(intent !== 'ALL' ? { intent } : {}),
      ...(destination ? { destination } : {}),
      page: String(page),
      pageSize: '20',
    }),
  });

  const unlockMutation = useMutation({
    mutationFn: (leadId: string) => unlockLead(leadId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketplace-leads'] }),
  });

  const leads = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Lead Marketplace</h1>
        <p className="text-text-muted text-sm mt-1">
          Verified B2C student leads — unlock to get contact details
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          {['ALL', 'HOT', 'WARM', 'COLD'].map((i) => (
            <button
              key={i}
              onClick={() => { setIntent(i); setPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                intent === i
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary',
              )}
            >
              {i}
            </button>
          ))}
        </div>
        <select
          value={destination}
          onChange={(e) => { setDestination(e.target.value); setPage(1); }}
          className="bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-brand-500"
        >
          <option value="">All Destinations</option>
          {Object.keys(DESTINATION_FLAGS).map((c) => (
            <option key={c} value={c}>{DESTINATION_FLAGS[c]} {c}</option>
          ))}
        </select>
        <span className="ml-auto text-text-muted text-sm">{total} leads found</span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface-card border border-surface-border rounded-xl p-5 animate-pulse h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leads.map((lead: any) => (
            <div key={lead.id} className="bg-surface-card border border-surface-border rounded-xl p-5 hover:border-brand-500/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', INTENT_COLORS[lead.intent] || '')}>
                      {lead.intent}
                    </span>
                    {lead.isUnlocked && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-status-success/20 text-status-success">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-text-primary font-medium">
                    {lead.isUnlocked ? lead.name : maskName(lead.maskedName)}
                  </p>
                  <p className="text-text-muted text-xs mt-0.5">{lead.city}, {lead.state}</p>
                </div>
                <div className="text-2xl">
                  {DESTINATION_FLAGS[lead.preferredDestinations?.[0]] ?? '🌍'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <span className="text-text-muted">Field: </span>
                  <span className="text-text-secondary">{lead.fieldOfStudy ?? '—'}</span>
                </div>
                <div>
                  <span className="text-text-muted">Budget: </span>
                  <span className="text-text-secondary">{lead.budgetRange ?? '—'}</span>
                </div>
                <div>
                  <span className="text-text-muted">Intake: </span>
                  <span className="text-text-secondary">{lead.targetIntake ?? '—'}</span>
                </div>
                <div>
                  <span className="text-text-muted">Score: </span>
                  <span className="text-brand-400 font-medium">{lead.profileScore ?? 0}/100</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted text-xs">{formatDate(lead.createdAt)}</span>
                {!lead.isUnlocked ? (
                  <button
                    onClick={() => unlockMutation.mutate(lead.id)}
                    disabled={unlockMutation.isPending}
                    className="text-sm bg-brand-500 text-white px-3 py-1.5 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
                  >
                    Unlock ₹{lead.unlockPrice ?? 999}
                  </button>
                ) : (
                  <div className="text-xs text-text-secondary">
                    📞 {lead.phone} · ✉️ {lead.email}
                  </div>
                )}
              </div>
            </div>
          ))}
          {leads.length === 0 && (
            <div className="col-span-2 text-center py-16 text-text-muted">
              No leads match your filters
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-surface-card border border-surface-border rounded-lg text-sm text-text-secondary disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-3 py-1.5 text-sm text-text-muted">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={leads.length < 20}
            className="px-3 py-1.5 bg-surface-card border border-surface-border rounded-lg text-sm text-text-secondary disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function maskName(name: string) {
  if (!name) return '●●●●● ●●●●●';
  const parts = name.split(' ');
  return parts.map((p) => p[0] + '●'.repeat(Math.max(2, p.length - 1))).join(' ');
}
