'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { students } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { APPLICATION_STAGE_LABELS, STAGE_COLORS, formatCurrency, formatDate, cn } from '@/lib/utils';
import { PanelHeader, StatChip, st } from '@/components/student/student-ui';

export default function StudentDashboard() {
  const { fetchMe, user } = useAuthStore();

  useEffect(() => {
    if (!user) fetchMe();
  }, [user, fetchMe]);

  const { data: dash, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => students.meDashboard(),
  });

  const { data: journey } = useQuery({
    queryKey: ['student-journey-me'],
    queryFn: () => students.meJourney(),
  });

  if (isLoading) {
    return <p className={cn(st.meta, 'py-2')}>Loading…</p>;
  }

  const s = dash?.student;
  const summary = dash?.summary;
  const apps = s?.applications ?? journey?.applications ?? [];
  const events = journey?.events?.slice(0, 5) ?? [];
  const name = s?.user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className={cn('space-y-2', st.page)}>
      <div className="flex flex-wrap items-center gap-2 bg-gradient-to-r from-pastel-mint via-white to-pastel-blue border border-surface-border rounded-lg px-3 py-2">
        <span className={st.title}>Hi {name}</span>
        <StatChip tone="blue">{summary?.profileScore ?? 0}% profile</StatChip>
        <StatChip tone="mint">{summary?.applicationsCount ?? 0} apps</StatChip>
        <StatChip tone="lilac">{summary?.documentsCount ?? 0} docs</StatChip>
        <StatChip tone="peach">
          trust {summary?.trustOverall != null ? Math.round(summary.trustOverall) : '—'}
        </StatChip>
        {summary?.preferredCountries?.length ? (
          <span className={cn(st.meta, 'truncate max-w-md text-text-secondary')}>
            {summary.preferredCountries.join(', ')}
            {summary.preferredIntake ? ` · ${summary.preferredIntake}` : ''}
            {s?.annualBudgetInr ? ` · ${formatCurrency(s.annualBudgetInr)}` : ''}
          </span>
        ) : null}
        <div className="ml-auto flex gap-3 shrink-0">
          <Link href="/student/documents" className={st.link}>
            Documents →
          </Link>
          <Link href="/student/journey" className={st.link}>
            Journey →
          </Link>
        </div>
      </div>

      <div className="bg-white border border-surface-border rounded-lg overflow-hidden shadow-card text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-surface-border">
          <div>
            <PanelHeader title="Applications" count={apps.length} themeClass="bg-pastel-blue text-brand-700" />
            <div className="p-2">
              {apps.length === 0 ? (
                <p className={st.meta}>None yet</p>
              ) : (
                <table className="w-full">
                  <tbody>
                    {apps.map((app, i) => (
                      <tr
                        key={app.id}
                        className={cn(
                          'border-t border-surface-border/50 first:border-t-0',
                          i % 2 === 0 ? 'bg-white' : 'bg-pastel-blue/20',
                        )}
                      >
                        <td className="py-1.5 pr-2 align-middle">
                          <div className={cn(st.value, 'truncate max-w-[200px]')}>
                            {app.university?.name}
                          </div>
                          <div className={cn(st.meta, 'truncate')}>
                            {app.course?.name} · {app.intake ?? 'TBD'}
                          </div>
                        </td>
                        <td className="py-1.5 align-middle text-right whitespace-nowrap">
                          <span className={cn(st.chip, STAGE_COLORS[app.stage])}>
                            {APPLICATION_STAGE_LABELS[app.stage]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div>
            <PanelHeader
              title="Recent activity"
              count={`${journey?.stats.totalEvents ?? 0} · ${journey?.stats.daysWithAgency ?? 0}d`}
              themeClass="bg-pastel-lilac text-violet-800"
            />
            <div className="p-2">
              {events.length === 0 ? (
                <p className={st.meta}>No events yet</p>
              ) : (
                <table className="w-full">
                  <tbody>
                    {events.map((ev, i) => (
                      <tr
                        key={ev.id}
                        className={cn(
                          'border-t border-surface-border/50 first:border-t-0',
                          i % 2 === 0 ? 'bg-white' : 'bg-pastel-lilac/25',
                        )}
                      >
                        <td className="py-1.5 pr-2 align-middle">
                          <div className={st.value}>{ev.title}</div>
                          {ev.description && (
                            <div className={cn(st.meta, 'truncate')}>{ev.description}</div>
                          )}
                        </td>
                        <td className={cn(st.meta, 'py-1.5 align-middle text-right whitespace-nowrap')}>
                          {formatDate(ev.occurredAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
