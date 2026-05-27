'use client';

import { useQuery } from '@tanstack/react-query';
import { applications } from '@/lib/api';
import { APPLICATION_STAGE_LABELS, STAGE_COLORS, cn } from '@/lib/utils';
import {
  PageHeader,
  PageBody,
  DataTableShell,
  DataTableHead,
  Th,
  StatBox,
} from '@/components/ui/portal-ui';

export default function UniversityDashboard() {
  const { data: appData, isLoading } = useQuery({
    queryKey: ['university-applications'],
    queryFn: () => applications.list({ pageSize: '20' }),
  });

  const total = appData?.meta.total ?? 0;
  const submitted =
    appData?.data.filter((a) => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.stage)).length ?? 0;
  const offers = appData?.data.filter((a) => a.stage === 'OFFER_RECEIVED').length ?? 0;
  const enrolled = appData?.data.filter((a) => a.stage === 'ENROLLED').length ?? 0;

  return (
    <PageBody>
      <PageHeader title="University Dashboard" subtitle="Application pipeline overview" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Total Applications" value={total} tone="blue" />
        <StatBox label="Under Review" value={submitted} tone="sand" />
        <StatBox label="Offers Issued" value={offers} tone="mint" />
        <StatBox label="Enrolled" value={enrolled} tone="lilac" />
      </div>

      <DataTableShell>
        <DataTableHead>
          <Th>Student</Th>
          <Th>Course</Th>
          <Th>Intake</Th>
          <Th>Status</Th>
          <Th>Actions</Th>
        </DataTableHead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-text-muted text-xs">
                Loading…
              </td>
            </tr>
          )}
          {appData?.data.map((app) => (
            <tr
              key={app.id}
              className="border-b border-surface-border/50 hover:bg-pastel-blue/25"
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
              <td className="px-3 py-2">
                <div className="flex gap-1.5 text-xs">
                  <button type="button" className="text-emerald-700 font-medium hover:underline">
                    Approve
                  </button>
                  <button type="button" className="text-rose-700 font-medium hover:underline">
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTableShell>
    </PageBody>
  );
}
