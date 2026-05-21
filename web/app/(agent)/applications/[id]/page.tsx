'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { applications } from '@/lib/api';
import { APPLICATION_STAGE_LABELS, STAGE_COLORS, formatDate, cn } from '@/lib/utils';
import type { ApplicationStage } from '@/lib/types';

const STAGE_ORDER: ApplicationStage[] = [
  'LEAD', 'DOCS_COLLECTION', 'UNDER_REVIEW', 'SUBMITTED',
  'OFFER_RECEIVED', 'VISA_PROCESSING', 'FEES_PAID', 'ENROLLED',
];

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const [showStageModal, setShowStageModal] = useState(false);
  const [targetStage, setTargetStage] = useState('');

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applications.findOne(id),
  });

  const stageMutation = useMutation({
    mutationFn: ({ stage, stageNote }: { stage: string; stageNote?: string }) =>
      applications.changeStage(id, stage, stageNote),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['application', id] });
      setShowStageModal(false);
      setNote('');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface-card border border-surface-border rounded-xl p-5 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  if (!app) return <div className="text-text-muted">Application not found</div>;

  const currentStageIndex = STAGE_ORDER.indexOf(app.stage as ApplicationStage);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-text-muted text-sm hover:text-text-primary mb-2 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-text-primary">
            {app.student?.user?.name ?? 'Student'}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {app.university?.name} · {app.course?.name}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={cn('text-sm px-3 py-1 rounded-full font-medium', STAGE_COLORS[app.stage] || '')}>
            {APPLICATION_STAGE_LABELS[app.stage] || app.stage}
          </span>
          <button
            onClick={() => setShowStageModal(true)}
            className="text-sm bg-brand-500 text-white px-3 py-1.5 rounded-lg hover:bg-brand-600"
          >
            Move Stage
          </button>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-5">
        <h2 className="text-text-primary font-semibold mb-4">Application Pipeline</h2>
        <div className="flex items-center gap-0">
          {STAGE_ORDER.map((stage, i) => {
            const isCompleted = i < currentStageIndex;
            const isCurrent = i === currentStageIndex;
            const isLast = i === STAGE_ORDER.length - 1;
            return (
              <div key={stage} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                    isCompleted ? 'bg-status-success text-white' :
                    isCurrent ? 'bg-brand-500 text-white' :
                    'bg-surface-card2 border border-surface-border text-text-muted',
                  )}>
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  <span className={cn(
                    'text-xs text-center leading-tight hidden md:block',
                    isCurrent ? 'text-brand-400 font-medium' : 'text-text-muted',
                  )} style={{ maxWidth: 72 }}>
                    {APPLICATION_STAGE_LABELS[stage]}
                  </span>
                </div>
                {!isLast && (
                  <div className={cn('flex-1 h-0.5 mx-1', isCompleted ? 'bg-status-success' : 'bg-surface-border')} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Student info */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h2 className="text-text-primary font-semibold mb-3">Student</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Name</span>
              <span className="text-text-primary">{app.student?.user?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Email</span>
              <span className="text-text-secondary">{app.student?.user?.email ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Phone</span>
              <span className="text-text-secondary">{app.student?.user?.phone ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Profile Score</span>
              <span className="text-brand-400 font-medium">{app.student?.profileScore ?? 0}/100</span>
            </div>
          </div>
        </div>

        {/* University + Course */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h2 className="text-text-primary font-semibold mb-3">Program</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">University</span>
              <span className="text-text-primary">{app.university?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Course</span>
              <span className="text-text-secondary">{app.course?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Intake</span>
              <span className="text-text-secondary">{app.intake ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Annual Fee</span>
              <span className="text-text-primary">{app.course?.annualFeeUsd ? `$${app.course.annualFeeUsd.toLocaleString()}` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Commission</span>
              <span className="text-status-success font-medium">
                {app.course?.commissionPct ? `${app.course.commissionPct}%` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage History */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-5">
        <h2 className="text-text-primary font-semibold mb-4">Activity History</h2>
        {(app.stageHistory ?? []).length === 0 ? (
          <p className="text-text-muted text-sm">No history yet</p>
        ) : (
          <div className="space-y-3">
            {[...(app.stageHistory ?? [])].reverse().map((h: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-text-primary text-sm">
                    Moved to{' '}
                    <span className={cn('font-medium', STAGE_COLORS[h.stage]?.includes('text-') ? '' : 'text-brand-400')}>
                      {APPLICATION_STAGE_LABELS[h.stage] || h.stage}
                    </span>
                  </p>
                  {h.note && <p className="text-text-muted text-xs mt-0.5">{h.note}</p>}
                  <p className="text-text-muted text-xs">{formatDate(h.createdAt)} · {h.changedBy?.name ?? 'System'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stage Move Modal */}
      {showStageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface-card border border-surface-border rounded-xl p-6 w-full max-w-md">
            <h3 className="text-text-primary font-semibold mb-4">Move to Stage</h3>
            <div className="space-y-2 mb-4">
              {STAGE_ORDER.map((stage) => (
                <button
                  key={stage}
                  onClick={() => setTargetStage(stage)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    targetStage === stage
                      ? 'bg-brand-500/20 border border-brand-500/50 text-brand-400'
                      : 'bg-surface-card2 text-text-secondary hover:text-text-primary',
                    stage === app.stage && 'opacity-40 cursor-not-allowed',
                  )}
                  disabled={stage === app.stage}
                >
                  {APPLICATION_STAGE_LABELS[stage]}
                  {stage === app.stage && ' (current)'}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Add a note (optional)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-surface-card2 border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-500 resize-none"
              rows={2}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowStageModal(false)}
                className="flex-1 px-4 py-2 bg-surface-card2 border border-surface-border text-text-secondary rounded-lg text-sm hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => stageMutation.mutate({ stage: targetStage, stageNote: note })}
                disabled={!targetStage || stageMutation.isPending}
                className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50"
              >
                {stageMutation.isPending ? 'Moving...' : 'Move Stage'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
