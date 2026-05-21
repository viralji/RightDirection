'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ExternalLink, FileText, Sparkles } from 'lucide-react';
import { students } from '@/lib/api';
import {
  APPLICATION_STAGE_LABELS,
  STAGE_COLORS,
  formatCurrency,
  formatDate,
  cn,
} from '@/lib/utils';
import {
  DetailSection,
  ProfileField,
  StatChip,
  TabPills,
  pt,
} from '@/components/ui/portal-ui';
import {
  StudentJourneyTimeline,
  ApplicationPipelineMini,
} from '@/components/student/student-journey-timeline';

const COMPACT_TABS = ['Journey', 'Profile', 'Applications'] as const;
const FULL_TABS = [...COMPACT_TABS, 'Documents', 'Proposals'] as const;

export function StudentExpandPanel({
  studentId,
  fullPage = false,
}: {
  studentId: string;
  fullPage?: boolean;
}) {
  const tabs = fullPage ? FULL_TABS : COMPACT_TABS;
  const [tab, setTab] = useState<(typeof FULL_TABS)[number]>('Journey');

  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => students.findOne(studentId),
    enabled: !!studentId,
  });

  const { data: journey, isLoading: loadingJourney } = useQuery({
    queryKey: ['student-journey', studentId],
    queryFn: () => students.journey(studentId),
    enabled: !!studentId,
  });

  if (loadingStudent) {
    return <p className={cn(pt.meta, 'py-4 text-center')}>Loading student details…</p>;
  }
  if (!student) {
    return <p className="text-xs text-status-error py-2">Student not found</p>;
  }

  const profile = (student.profileDetails ?? {}) as Record<string, unknown>;
  const apps = student.applications ?? [];
  const docs = student.documents ?? [];
  const proposals = student.proposals ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <StatChip tone="blue">Profile {student.profileScore ?? 0}%</StatChip>
          <StatChip tone="mint">{apps.length} applications</StatChip>
          <StatChip tone="lilac">{docs.length} documents</StatChip>
          {journey?.stats && (
            <StatChip tone="sand">{journey.stats.daysWithAgency}d with agency</StatChip>
          )}
        </div>
        {!fullPage && (
          <Link
            href={`/agent/students/${studentId}`}
            className={cn(pt.link, 'inline-flex items-center gap-1 text-xs')}
            onClick={(e) => e.stopPropagation()}
          >
            Full page <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>

      {student.counselorNotes && (
        <div className="bg-pastel-peach border border-orange-200/80 rounded-lg px-3 py-2 text-xs text-orange-900">
          <span className="font-semibold">Counselor notes: </span>
          {student.counselorNotes}
        </div>
      )}

      <TabPills
        tabs={tabs}
        active={tab}
        onChange={setTab}
        counts={{
          Journey: journey?.stats?.totalEvents,
          Documents: docs.length,
          Proposals: proposals.length,
        }}
      />

      {tab === 'Journey' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <DetailSection title="Timeline" theme="lilac" className="lg:col-span-2">
            {loadingJourney ? (
              <p className={pt.meta}>Loading journey…</p>
            ) : journey?.events?.length ? (
              <StudentJourneyTimeline events={journey.events} compact />
            ) : (
              <p className={cn(pt.meta, 'text-center py-3')}>No journey events yet</p>
            )}
          </DetailSection>
          <DetailSection title="Active pipelines" theme="mint">
            {journey?.applications?.length ? (
              <ApplicationPipelineMini applications={journey.applications} />
            ) : (
              <p className={pt.meta}>No active applications</p>
            )}
          </DetailSection>
        </div>
      )}

      {tab === 'Profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <DetailSection title="Academic" theme="blue">
            <ProfileField label="Education" value={student.educationLevel} />
            <ProfileField
              label="Aggregate"
              value={student.aggregatePct != null ? `${student.aggregatePct}%` : undefined}
            />
            <ProfileField label="Stream" value={student.stream} />
            <ProfileField label="IELTS" value={student.ieltsScore?.toString()} />
            <ProfileField label="PTE" value={student.pteScore?.toString()} />
          </DetailSection>
          <DetailSection title="Goals & budget" theme="mint">
            <ProfileField label="Countries" value={student.preferredCountries?.join(', ')} />
            <ProfileField label="Fields" value={student.preferredField?.join(', ')} />
            <ProfileField label="Intake" value={student.preferredIntake} />
            <ProfileField
              label="Budget"
              value={
                student.annualBudgetInr ? formatCurrency(student.annualBudgetInr) : undefined
              }
            />
          </DetailSection>
          <DetailSection title="Personal" theme="lilac">
            <ProfileField label="City" value={profile.city as string} />
            <ProfileField label="State" value={profile.state as string} />
            <ProfileField label="DOB" value={profile.dateOfBirth as string} />
            <ProfileField label="Passport" value={profile.passportNumber as string} />
            <ProfileField label="Joined" value={formatDate(student.createdAt)} />
          </DetailSection>
        </div>
      )}

      {tab === 'Applications' && (
        <DetailSection title={`Applications (${apps.length})`} theme="sand">
          {apps.length ? (
            <div className="space-y-1">
              {apps.slice(0, 6).map((app: any) => (
                <div
                  key={app.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-1 border-b border-surface-border/40 last:border-0 text-xs"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/agent/applications/${app.id}`}
                      className="font-medium text-brand-700 hover:text-brand-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {app.university?.name}
                    </Link>
                    <span className="text-text-muted ml-1">· {app.course?.name}</span>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-full', STAGE_COLORS[app.stage])}>
                    {APPLICATION_STAGE_LABELS[app.stage]}
                  </span>
                </div>
              ))}
              {apps.length > 6 && (
                <p className={pt.meta}>+{apps.length - 6} more — open full page</p>
              )}
            </div>
          ) : (
            <p className={pt.meta}>No applications yet</p>
          )}
        </DetailSection>
      )}

      {tab === 'Documents' && fullPage && (
        <DetailSection title={`Documents (${docs.length})`} theme="peach">
          <ul className="divide-y divide-surface-border/60">
            {docs.map((doc: any) => (
              <li key={doc.id} className="py-1.5 flex justify-between gap-2 text-xs">
                <span className="font-medium text-text-primary">{doc.fileName}</span>
                <span className="text-text-muted shrink-0">
                  {doc.category} · {doc.status}
                </span>
              </li>
            ))}
            {!docs.length && <p className={pt.meta}>No documents uploaded</p>}
          </ul>
          <Link
            href="/agent/documents"
            className={cn(pt.link, 'inline-block mt-2 text-xs')}
          >
            Open document vault →
          </Link>
        </DetailSection>
      )}

      {tab === 'Proposals' && fullPage && (
        <DetailSection title={`AI Proposals (${proposals.length})`} theme="lilac">
          {proposals.map((p: any) => (
            <div key={p.id} className="py-2 border-b border-surface-border/40 last:border-0 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-violet-800">
                <Sparkles className="w-3.5 h-3.5" />
                {formatDate(p.createdAt)}
              </div>
              <p className="text-text-secondary mt-0.5">
                {Array.isArray(p.targetCountries) ? p.targetCountries.join(', ') : ''} ·{' '}
                {p.targetIntake}
              </p>
              <Link
                href={`/agent/proposals/${p.id}/sop`}
                className={cn(pt.link, 'text-xs mt-1 inline-block')}
              >
                Open SOP editor →
              </Link>
            </div>
          ))}
          {!proposals.length && <p className={pt.meta}>No AI proposals yet</p>}
        </DetailSection>
      )}
    </div>
  );
}

/** Compact stat strip for table row header area */
export function StudentRowStats({
  profileScore,
  appCount,
}: {
  profileScore?: number;
  appCount?: number;
}) {
  return (
    <div className="flex gap-1 mt-0.5">
      <StatChip tone="blue">{profileScore ?? 0}%</StatChip>
      {appCount != null && appCount > 0 && <StatChip tone="mint">{appCount} apps</StatChip>}
    </div>
  );
}
