'use client';

import { useQuery } from '@tanstack/react-query';
import { students, applications } from '@/lib/api';
import { Users, FileText, TrendingUp, Wallet } from 'lucide-react';
import { APPLICATION_STAGE_LABELS, STAGE_COLORS, cn } from '@/lib/utils';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-muted text-sm">{label}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        </div>
        <div className={cn('p-3 rounded-lg', color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: studentData } = useQuery({ queryKey: ['students'], queryFn: () => students.list() });
  const { data: kanbanData } = useQuery({ queryKey: ['applications-kanban'], queryFn: () => applications.kanban() });

  const totalStudents = studentData?.meta?.total ?? 0;
  const enrolled = kanbanData?.ENROLLED?.length ?? 0;
  const active = Object.entries(kanbanData ?? {})
    .filter(([stage]) => !['ENROLLED', 'REJECTED', 'WITHDRAWN'].includes(stage))
    .reduce((sum, [, apps]) => sum + (apps as any[]).length, 0);
  const totalApps = Object.values(kanbanData ?? {}).reduce((sum, apps) => sum + (apps as any[]).length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Overview of your agency</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={totalStudents} icon={Users} color="bg-brand-500/20 text-brand-400" />
        <StatCard label="Active Applications" value={active} icon={FileText} color="bg-status-info/20 text-status-info" />
        <StatCard label="Total Applications" value={totalApps} icon={TrendingUp} color="bg-status-warning/20 text-status-warning" />
        <StatCard label="Enrolled" value={enrolled} icon={Wallet} color="bg-status-success/20 text-status-success" />
      </div>

      {/* Application Funnel */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-5">
        <h2 className="text-text-primary font-semibold mb-4">Application Pipeline</h2>
        <div className="space-y-2">
          {kanbanData && Object.entries(kanbanData).map(([stage, apps]) => {
            const count = (apps as any[]).length;
            const pct = totalApps > 0 ? (count / totalApps) * 100 : 0;
            return (
              <div key={stage} className="flex items-center gap-3">
                <span className={cn('text-xs px-2 py-0.5 rounded-full w-36 text-center', STAGE_COLORS[stage])}>
                  {APPLICATION_STAGE_LABELS[stage]}
                </span>
                <div className="flex-1 bg-surface-card2 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-text-muted text-xs w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
