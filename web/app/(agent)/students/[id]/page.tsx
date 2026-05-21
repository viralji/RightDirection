'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { students, applications } from '@/lib/api';
import { APPLICATION_STAGE_LABELS, STAGE_COLORS, formatDate, cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

const TABS = ['Profile', 'Applications', 'Documents', 'Proposals'] as const;

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<typeof TABS[number]>('Profile');

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => students.findOne(id),
  });

  const { data: appData } = useQuery({
    queryKey: ['student-applications', id],
    queryFn: () => applications.list({ studentId: id }),
    enabled: tab === 'Applications',
  });

  if (isLoading) return <div className="text-text-muted p-6">Loading...</div>;
  if (!student) return <div className="text-status-error p-6">Student not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/students" className="text-text-muted hover:text-text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{student.user.name}</h1>
          <p className="text-text-muted text-sm">{student.user.email} · {student.user.phone}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 bg-surface-card border border-surface-border rounded-lg px-3 py-1.5">
            <div className="w-16 bg-surface-border rounded-full h-1.5">
              <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${student.profileScore}%` }} />
            </div>
            <span className="text-text-muted text-xs">{student.profileScore}% complete</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card border border-surface-border rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-colors', tab === t ? 'bg-brand-500 text-white' : 'text-text-secondary hover:text-text-primary')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Profile' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-text-primary">Academic Profile</h2>
            <Field label="Education Level" value={student.educationLevel} />
            <Field label="Aggregate %" value={student.aggregatePct ? `${student.aggregatePct}%` : undefined} />
            <Field label="Stream" value={student.stream} />
            <Field label="IELTS" value={student.ieltsScore ? `${student.ieltsScore}` : undefined} />
            <Field label="PTE" value={student.pteScore ? `${student.pteScore}` : undefined} />
          </div>
          <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-text-primary">Preferences</h2>
            <Field label="Countries" value={student.preferredCountries.join(', ')} />
            <Field label="Fields" value={student.preferredField.join(', ')} />
            <Field label="Intake" value={student.preferredIntake} />
            <Field label="Budget" value={student.annualBudgetInr ? `₹${(student.annualBudgetInr / 100000).toFixed(1)}L/year` : undefined} />
            <Field label="Lead Source" value={student.leadSource} />
          </div>
        </div>
      )}

      {tab === 'Applications' && (
        <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-surface-border">
            <h2 className="font-semibold text-text-primary">Applications ({appData?.meta.total ?? 0})</h2>
            <Link href={`/applications/new?studentId=${id}`} className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300">
              <Plus className="w-4 h-4" /> New Application
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left px-4 py-3 text-text-muted font-medium">University</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Course</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Intake</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Stage</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {appData?.data.map(app => (
                <tr key={app.id} className="border-b border-surface-border/50 hover:bg-surface-card2/50">
                  <td className="px-4 py-3 text-text-primary font-medium">{app.university.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{app.course.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{app.intake ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', STAGE_COLORS[app.stage])}>
                      {APPLICATION_STAGE_LABELS[app.stage]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(app.updatedAt)}</td>
                </tr>
              ))}
              {!appData?.data.length && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-text-muted">No applications yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Documents' && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-6 text-text-muted text-sm">
          Document management — upload and track documents here.
        </div>
      )}

      {tab === 'Proposals' && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-6 text-text-muted text-sm">
          AI-generated proposals for this student.
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted text-sm">{label}</span>
      <span className="text-text-primary text-sm font-medium">{value ?? <span className="text-text-muted">—</span>}</span>
    </div>
  );
}
