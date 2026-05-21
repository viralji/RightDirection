'use client';

import { useQuery } from '@tanstack/react-query';
import { students } from '@/lib/api';
import { APPLICATION_STAGE_LABELS, STAGE_COLORS, cn } from '@/lib/utils';
import { StudentJourneyTimeline } from '@/components/student/student-journey-timeline';
import { PanelHeader, StatChip, st } from '@/components/student/student-ui';

export default function StudentJourneyPage() {
  const { data: journey, isLoading } = useQuery({
    queryKey: ['student-journey-me'],
    queryFn: () => students.meJourney(),
  });

  if (isLoading) {
    return <p className={cn(st.meta, 'py-2')}>Loading…</p>;
  }

  if (!journey) {
    return <p className="text-sm text-status-error py-2">Could not load journey</p>;
  }

  const apps = journey.applications ?? [];

  return (
    <div className={cn('space-y-2', st.page)}>
      <div className="flex flex-wrap items-center gap-2 bg-gradient-to-r from-pastel-blue via-white to-pastel-lilac border border-surface-border rounded-lg px-3 py-2">
        <span className={st.title}>My journey</span>
        <StatChip tone="lilac">{journey.stats.totalEvents} events</StatChip>
        <StatChip tone="blue">{journey.stats.applications} apps</StatChip>
        <StatChip tone="mint">{journey.stats.daysWithAgency}d with agency</StatChip>
        <StatChip tone="peach">
          Latest: {journey.stats.activeStage?.replace(/_/g, ' ') ?? '—'}
        </StatChip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        <div className="lg:col-span-4 bg-white border border-surface-border rounded-lg overflow-hidden shadow-card">
          <PanelHeader title="Applications" count={apps.length} themeClass="bg-pastel-mint text-emerald-800" />
          {apps.length === 0 ? (
            <p className={cn(st.meta, 'p-3')}>None</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {apps.map((app, i) => (
                  <tr
                    key={app.id}
                    className={cn(
                      'border-t border-surface-border/50',
                      i % 2 === 0 ? 'bg-pastel-mint/15' : 'bg-white',
                    )}
                  >
                    <td className="px-2.5 py-1.5 align-top">
                      <div className="font-semibold text-text-primary leading-snug">
                        {app.university?.name}
                      </div>
                      <div className={cn(st.meta, 'text-text-secondary')}>
                        {app.course?.name} · {app.intake ?? 'TBD'}
                      </div>
                      {app.stageHistory?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {app.stageHistory.map((h: any) => (
                            <span
                              key={h.id}
                              className="text-xs px-1.5 py-0.5 rounded bg-pastel-sand text-amber-800"
                            >
                              {APPLICATION_STAGE_LABELS[h.toStage] ?? h.toStage}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-1.5 align-top text-right whitespace-nowrap">
                      <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', STAGE_COLORS[app.stage])}>
                        {APPLICATION_STAGE_LABELS[app.stage]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="lg:col-span-8 bg-white border border-surface-border rounded-lg overflow-hidden shadow-card">
          <PanelHeader title="Timeline" themeClass="bg-pastel-lilac text-violet-800" />
          <div className="p-2 max-h-[min(70vh,520px)] overflow-y-auto bg-gradient-to-b from-pastel-lilac/10 to-white">
            <StudentJourneyTimeline events={journey.events} showActor compact />
          </div>
        </div>
      </div>
    </div>
  );
}
