'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { applications } from '@/lib/api';
import { APPLICATION_STAGE_LABELS, STAGE_COLORS, formatDate, cn } from '@/lib/utils';
import {
  PageHeader,
  PageBody,
  FilterChips,
  DataTableShell,
  DataTableHead,
  Th,
  pt,
} from '@/components/ui/portal-ui';

const REVIEW_STAGES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'OFFER_RECEIVED',
  'VISA_PROCESSING',
  'ENROLLED',
  'REJECTED',
];

export default function UniversityApplicationsPage() {
  const qc = useQueryClient();
  const [stageFilter, setStageFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['university-apps', stageFilter],
    queryFn: () =>
      applications.list({ ...(stageFilter && { stage: stageFilter }), pageSize: '50' }),
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      applications.changeStage(id, stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['university-apps'] }),
  });

  const filterOptions = [
    { id: '', label: 'All' },
    ...REVIEW_STAGES.map((s) => ({
      id: s,
      label: APPLICATION_STAGE_LABELS[s] ?? s,
    })),
  ];

  return (
    <PageBody>
      <PageHeader
        title="Applications"
        subtitle={`${data?.meta?.total ?? data?.data?.length ?? 0} applications`}
      />

      <FilterChips options={filterOptions} value={stageFilter} onChange={setStageFilter} />

      <DataTableShell>
        <DataTableHead>
          <Th>Student</Th>
          <Th>Course</Th>
          <Th>Intake</Th>
          <Th>Status</Th>
          <Th>Date</Th>
          <Th>Actions</Th>
        </DataTableHead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-text-muted text-xs">
                Loading…
              </td>
            </tr>
          )}
          {data?.data.map((app) => (
            <tr
              key={app.id}
              className="border-b border-surface-border/50 hover:bg-pastel-blue/25 transition-colors"
            >
              <td className="px-3 py-2">
                <p className="font-medium text-text-primary text-sm">{app.student.user.name}</p>
                <p className="text-text-muted text-xs">{app.student.user.email}</p>
              </td>
              <td className="px-3 py-2 text-text-secondary text-xs">{app.course.name}</td>
              <td className="px-3 py-2 text-text-muted text-xs">{app.intake ?? '—'}</td>
              <td className="px-3 py-2">
                <span className={cn('text-xs px-2 py-0.5 rounded-full', STAGE_COLORS[app.stage])}>
                  {APPLICATION_STAGE_LABELS[app.stage]}
                </span>
              </td>
              <td className="px-3 py-2 text-text-muted text-xs">{formatDate(app.createdAt)}</td>
              <td className="px-3 py-2">
                {app.stage === 'SUBMITTED' && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        stageMutation.mutate({ id: app.id, stage: 'OFFER_RECEIVED' })
                      }
                      className="text-xs bg-pastel-mint text-emerald-800 px-2 py-0.5 rounded-md hover:opacity-90"
                    >
                      Offer
                    </button>
                    <button
                      type="button"
                      onClick={() => stageMutation.mutate({ id: app.id, stage: 'REJECTED' })}
                      className="text-xs bg-pastel-rose text-rose-800 px-2 py-0.5 rounded-md hover:opacity-90"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {app.stage === 'UNDER_REVIEW' && (
                  <button
                    type="button"
                    onClick={() => stageMutation.mutate({ id: app.id, stage: 'SUBMITTED' })}
                    className="text-xs bg-pastel-blue text-brand-700 px-2 py-0.5 rounded-md"
                  >
                    Mark submitted
                  </button>
                )}
              </td>
            </tr>
          ))}
          {!isLoading && !data?.data.length && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-text-muted text-xs">
                No applications
              </td>
            </tr>
          )}
        </tbody>
      </DataTableShell>
    </PageBody>
  );
}
