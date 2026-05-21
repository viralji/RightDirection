'use client';

import {
  APPLICATION_STAGE_LABELS,
  JOURNEY_TYPE_COLORS,
  JOURNEY_EVENT_TYPE_TEXT,
  cn,
  formatDate,
  formatDateTime,
} from '@/lib/utils';
import type { JourneyEvent } from '@/lib/api';

type Props = {
  events: JourneyEvent[];
  showActor?: boolean;
  compact?: boolean;
};

export function StudentJourneyTimeline({ events, showActor = true, compact = false }: Props) {
  if (!events.length) {
    return (
      <p className={cn('text-text-muted text-center', compact ? 'text-xs py-3' : 'text-sm py-8')}>
        No journey events yet.
      </p>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  if (compact) {
    return (
      <table className="w-full text-sm">
        <tbody>
          {sorted.map((ev, i) => (
            <tr
              key={ev.id}
              className={cn(
                'border-t border-surface-border/40 first:border-t-0',
                i % 2 === 0 ? 'bg-white' : 'bg-pastel-lilac/20',
              )}
            >
              <td className="w-8 py-1.5 pr-1 align-middle">
                <span
                  className={cn(
                    'inline-flex w-6 h-6 rounded-md items-center justify-center text-xs font-bold uppercase border',
                    JOURNEY_TYPE_COLORS[ev.type] ?? 'bg-surface-card2 text-text-muted',
                  )}
                >
                  {ev.type.slice(0, 1)}
                </span>
              </td>
              <td className="py-1.5 pr-2 align-middle min-w-0">
                <div className={cn('font-semibold leading-snug', JOURNEY_EVENT_TYPE_TEXT[ev.type] ?? 'text-text-primary')}>
                  {ev.title}
                </div>
                {ev.description && (
                  <div className="text-xs text-text-secondary leading-snug line-clamp-2 mt-0.5">
                    {ev.description}
                  </div>
                )}
                {showActor && ev.actorName && (
                  <div className="text-xs text-violet-600 font-medium mt-0.5">{ev.actorName}</div>
                )}
              </td>
              <td className="py-1.5 align-middle text-right text-xs text-text-muted whitespace-nowrap w-24">
                {formatDate(ev.occurredAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-surface-border" />
      <ul className="space-y-0">
        {sorted.map((ev) => (
          <li key={ev.id} className="relative pl-10 pb-8 last:pb-0">
            <span
              className={cn(
                'absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold uppercase',
                JOURNEY_TYPE_COLORS[ev.type]?.split(' ')[0] ?? 'bg-surface-card2',
              )}
            >
              {ev.type.slice(0, 1)}
            </span>
            <div className="bg-white border border-surface-border rounded-xl p-4 shadow-card hover:border-brand-200 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border',
                      JOURNEY_TYPE_COLORS[ev.type] ?? 'bg-surface-card2 text-text-muted',
                    )}
                  >
                    {ev.type.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-text-primary font-semibold mt-2">{ev.title}</h3>
                </div>
                <time className="text-xs text-text-muted whitespace-nowrap" dateTime={ev.occurredAt}>
                  {formatDateTime(ev.occurredAt)}
                </time>
              </div>
              {ev.description && (
                <p className="text-text-secondary text-sm mt-2 leading-relaxed">{ev.description}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-muted">
                {showActor && ev.actorName && <span>By {ev.actorName}</span>}
                {ev.applicationId && (
                  <span className="font-mono text-brand-600">App · {ev.applicationId.slice(-8)}</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ApplicationPipelineMini({
  applications,
  compact = false,
}: {
  applications: any[];
  compact?: boolean;
}) {
  if (!applications?.length) return null;

  if (compact) {
    return (
      <ul className="divide-y divide-surface-border">
        {applications.map((app) => (
          <li key={app.id} className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{app.university?.name}</p>
              <p className="text-xs text-text-muted truncate">
                {app.course?.name} · {app.intake ?? 'TBD'}
              </p>
            </div>
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded shrink-0', 'bg-brand-50 text-brand-700')}>
              {APPLICATION_STAGE_LABELS[app.stage] ?? app.stage}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div
          key={app.id}
          className="bg-white border border-surface-border rounded-xl p-4 shadow-card"
        >
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="font-semibold text-text-primary">{app.university?.name}</p>
              <p className="text-sm text-text-muted">
                {app.course?.name} · {app.intake ?? 'TBD'}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
              {APPLICATION_STAGE_LABELS[app.stage] ?? app.stage}
            </span>
          </div>
          {app.stageHistory?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-surface-border/50 flex flex-wrap gap-2">
              {app.stageHistory.map((h: any) => (
                <span
                  key={h.id}
                  className="text-[10px] px-2 py-0.5 rounded bg-surface-card2 text-text-muted"
                  title={formatDate(h.createdAt)}
                >
                  {APPLICATION_STAGE_LABELS[h.toStage] ?? h.toStage}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
