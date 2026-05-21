'use client';

import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

async function fetchAnalytics() {
  const res = await fetch('/api/v1/university/analytics', { credentials: 'include' });
  return (await res.json()).data;
}

export default function UniversityAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['university-analytics'],
    queryFn: fetchAnalytics,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-surface-card border border-surface-border rounded animate-pulse w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface-card border border-surface-border rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  const stats = analytics ?? {};

  const statCards = [
    { label: 'Total Applications', value: stats.totalApplications ?? 0, color: 'text-text-primary' },
    { label: 'Enrolled Students', value: stats.enrolled ?? 0, color: 'text-status-success' },
    { label: 'Acceptance Rate', value: `${stats.acceptanceRate ?? 0}%`, color: 'text-brand-400' },
    { label: 'Avg Processing Days', value: stats.avgProcessingDays ?? 0, color: 'text-text-primary' },
  ];

  const stageBreakdown = stats.stageBreakdown ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="text-text-muted text-sm mt-1">Application performance and enrollment trends</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-surface-card border border-surface-border rounded-xl p-5">
            <p className="text-text-muted text-sm">{s.label}</p>
            <p className={cn('text-3xl font-bold mt-1', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Stage funnel */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-5">
        <h2 className="text-text-primary font-semibold mb-4">Application Stage Funnel</h2>
        <div className="space-y-3">
          {Object.entries(stageBreakdown).map(([stage, count]: [string, any]) => {
            const total = stats.totalApplications || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={stage} className="flex items-center gap-3">
                <span className="text-text-muted text-xs w-36 truncate">{stage.replace(/_/g, ' ')}</span>
                <div className="flex-1 bg-surface-card2 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-text-secondary text-xs w-16 text-right">{count} ({pct}%)</span>
              </div>
            );
          })}
          {Object.keys(stageBreakdown).length === 0 && (
            <p className="text-text-muted text-sm">No data available yet</p>
          )}
        </div>
      </div>

      {/* Top courses */}
      {(stats.topCourses ?? []).length > 0 && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h2 className="text-text-primary font-semibold mb-4">Top Courses by Applications</h2>
          <div className="space-y-2">
            {(stats.topCourses ?? []).map((c: any, i: number) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-surface-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-text-muted text-sm w-5">{i + 1}</span>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{c.name}</p>
                    <p className="text-text-muted text-xs">{c.level} · {c.durationMonths}mo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-text-primary font-semibold">{c._count?.applications ?? 0}</p>
                  <p className="text-text-muted text-xs">applications</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top agent sources */}
      {(stats.topAgents ?? []).length > 0 && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h2 className="text-text-primary font-semibold mb-4">Top Agent Sources</h2>
          <div className="space-y-2">
            {(stats.topAgents ?? []).map((a: any, i: number) => (
              <div key={a.tenantId} className="flex items-center justify-between py-2 border-b border-surface-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-text-muted text-sm w-5">{i + 1}</span>
                  <p className="text-text-primary text-sm">{a.agentName ?? a.tenantId}</p>
                </div>
                <span className="text-text-secondary text-sm">{a.count} students</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
