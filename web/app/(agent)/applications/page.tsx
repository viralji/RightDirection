'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applications } from '@/lib/api';
import { APPLICATION_STAGE_LABELS, STAGE_COLORS, cn } from '@/lib/utils';

const KANBAN_STAGES = [
  'LEAD', 'DOCS_COLLECTION', 'UNDER_REVIEW', 'SUBMITTED',
  'OFFER_RECEIVED', 'VISA_PROCESSING', 'FEES_PAID', 'ENROLLED',
];

export default function ApplicationsPage() {
  const qc = useQueryClient();
  const { data: kanban, isLoading } = useQuery({
    queryKey: ['applications-kanban'],
    queryFn: () => applications.kanban(),
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      applications.changeStage(id, stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications-kanban'] }),
  });

  if (isLoading) return <div className="text-text-muted">Loading pipeline...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Applications</h1>
        <p className="text-text-muted text-sm mt-1">Kanban pipeline view</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_STAGES.map((stage) => {
          const apps = (kanban?.[stage] ?? []) as any[];
          return (
            <div key={stage} className="flex-shrink-0 w-64">
              <div className="flex items-center justify-between mb-3">
                <span className={cn('text-xs px-2 py-1 rounded-full font-medium', STAGE_COLORS[stage])}>
                  {APPLICATION_STAGE_LABELS[stage]}
                </span>
                <span className="text-text-muted text-xs">{apps.length}</span>
              </div>
              <div className="space-y-2">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    className="bg-surface-card border border-surface-border rounded-lg p-3 cursor-pointer hover:border-brand-500/50 transition-colors"
                  >
                    <p className="text-text-primary text-sm font-medium truncate">
                      {app.student?.user?.name ?? 'Unknown'}
                    </p>
                    <p className="text-text-muted text-xs truncate mt-0.5">
                      {app.university?.name ?? '—'}
                    </p>
                    <p className="text-text-muted text-xs truncate">
                      {app.course?.name ?? '—'}
                    </p>
                    {app.intake && (
                      <p className="text-brand-400 text-xs mt-1">{app.intake}</p>
                    )}
                  </div>
                ))}
                {apps.length === 0 && (
                  <div className="text-text-muted text-xs text-center py-6 border border-dashed border-surface-border rounded-lg">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
