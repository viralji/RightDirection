'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDate, cn } from '@/lib/utils';

async function fetchPartnerAgents() {
  const res = await fetch('/api/v1/university/agents', { credentials: 'include' });
  return (await res.json()).data;
}

const KYC_COLORS: Record<string, string> = {
  APPROVED: 'bg-status-success/20 text-status-success',
  PENDING: 'bg-status-warning/20 text-status-warning',
  UNDER_REVIEW: 'bg-status-info/20 text-status-info',
  REJECTED: 'bg-status-error/20 text-status-error',
};

export default function UniversityAgentsPage() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['university-agents'],
    queryFn: fetchPartnerAgents,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Partner Agents</h1>
        <p className="text-text-muted text-sm mt-1">Agents sending students to your programs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading && [...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-card border border-surface-border rounded-xl p-5 animate-pulse h-36" />
        ))}
        {(agents ?? []).map((agent: any) => (
          <div key={agent.id} className="bg-surface-card border border-surface-border rounded-xl p-5 hover:border-brand-500/40 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-text-primary font-semibold">{agent.tenant?.name ?? '—'}</p>
                <p className="text-text-muted text-xs">{agent.city}, {agent.state}</p>
              </div>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', KYC_COLORS[agent.kycStatus] || 'bg-surface-card2 text-text-muted')}>
                {agent.kycStatus}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-surface-card2 rounded-lg p-2 text-center">
                <p className="text-text-muted">Students</p>
                <p className="text-text-primary font-bold text-lg">{agent._count?.students ?? 0}</p>
              </div>
              <div className="bg-surface-card2 rounded-lg p-2 text-center">
                <p className="text-text-muted">Applications</p>
                <p className="text-text-primary font-bold text-lg">{agent._count?.applications ?? 0}</p>
              </div>
              <div className="bg-surface-card2 rounded-lg p-2 text-center">
                <p className="text-text-muted">Enrolled</p>
                <p className="text-status-success font-bold text-lg">{agent.enrolledCount ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
              <span>Plan: <span className="text-brand-400">{agent.tenant?.subscriptionPlan ?? 'TRIAL'}</span></span>
              <span>Since {formatDate(agent.createdAt)}</span>
            </div>
          </div>
        ))}
        {!isLoading && !(agents ?? []).length && (
          <div className="col-span-2 text-center py-16 text-text-muted">
            No partner agents yet
          </div>
        )}
      </div>
    </div>
  );
}
