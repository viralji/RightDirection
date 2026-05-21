'use client';

import { useQuery } from '@tanstack/react-query';
import { students } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { formatCurrency, formatDate, PROFILE_SECTION_THEMES, cn } from '@/lib/utils';
import { PanelHeader, StatChip, st } from '@/components/student/student-ui';

type Field = { label: string; value?: string | null };

export default function StudentProfilePage() {
  const { user } = useAuthStore();
  const { data: student, isLoading } = useQuery({
    queryKey: ['student-me-profile'],
    queryFn: () => students.meProfile(),
  });

  if (isLoading) {
    return <p className={cn(st.meta, 'py-2')}>Loading…</p>;
  }

  const profile = (student?.profileDetails ?? {}) as Record<string, unknown>;
  const score = student?.profileScore ?? 0;

  const sections: { title: string; fields: Field[] }[] = [
    {
      title: 'Academic',
      fields: [
        { label: 'Education', value: student?.educationLevel },
        { label: 'Aggregate', value: student?.aggregatePct != null ? `${student.aggregatePct}%` : undefined },
        { label: 'Stream', value: student?.stream },
        { label: 'IELTS', value: student?.ieltsScore?.toString() },
        { label: 'PTE', value: student?.pteScore?.toString() },
        { label: 'GRE', value: student?.greScore?.toString() },
        { label: 'Current', value: profile.currentEducation as string },
        { label: 'Backlogs', value: profile.backlogs != null ? String(profile.backlogs) : undefined },
        { label: 'Gap years', value: profile.gapYears != null ? String(profile.gapYears) : undefined },
      ],
    },
    {
      title: 'Goals',
      fields: [
        { label: 'Countries', value: student?.preferredCountries?.join(', ') },
        { label: 'Fields', value: student?.preferredField?.join(', ') },
        { label: 'Intake', value: student?.preferredIntake },
        { label: 'Budget', value: student?.annualBudgetInr ? formatCurrency(student.annualBudgetInr) : undefined },
        { label: 'Lead source', value: student?.leadSource },
      ],
    },
    {
      title: 'Personal',
      fields: [
        { label: 'DOB', value: profile.dateOfBirth as string },
        { label: 'Gender', value: profile.gender as string },
        { label: 'Nationality', value: profile.nationality as string },
        { label: 'City', value: profile.city as string },
        { label: 'State', value: profile.state as string },
        { label: 'Passport', value: profile.passportNumber as string },
        { label: 'Passport exp.', value: profile.passportExpiry as string },
      ],
    },
    {
      title: 'Family & other',
      fields: [
        { label: 'Father', value: profile.fatherName as string },
        { label: 'Mother', value: profile.motherName as string },
        { label: 'Emergency', value: profile.emergencyContact as string },
        { label: 'Work exp.', value: profile.workExperience as string },
        { label: 'Languages', value: (profile.languages as string[])?.join(', ') },
        { label: 'Member since', value: student?.createdAt ? formatDate(student.createdAt) : undefined },
      ],
    },
  ];

  const ts = student?.trustScore;

  return (
    <div className={cn('space-y-2', st.page)}>
      <div className="flex flex-wrap items-center gap-2 bg-gradient-to-r from-pastel-lilac via-white to-pastel-mint border border-surface-border rounded-lg px-3 py-2 shadow-card">
        <div className="w-9 h-9 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-soft">
          {(user?.name ?? student?.user?.name)?.charAt(0) ?? 'S'}
        </div>
        <div className="min-w-0 flex-1">
          <span className={st.title}>{student?.user?.name ?? user?.name}</span>
          <span className={cn(st.meta, 'ml-2 text-brand-600')}>{student?.user?.email}</span>
          {student?.user?.phone && (
            <span className={cn(st.meta, 'ml-2 text-text-secondary')}>{student.user.phone}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="w-24 h-2 bg-pastel-blue rounded-full overflow-hidden border border-brand-100">
            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${score}%` }} />
          </div>
          <StatChip tone="blue">{score}% complete</StatChip>
          {ts && (
            <>
              <StatChip tone="mint">Trust {Math.round(ts.overallScore ?? 0)}</StatChip>
              <StatChip tone="peach">{ts.riskLevel} risk</StatChip>
              <span className={cn(st.meta, 'text-violet-700')}>Doc {Math.round(ts.documentScore ?? 0)}</span>
              <span className={cn(st.meta, 'text-brand-700')}>Acad {Math.round(ts.academicScore ?? 0)}</span>
              <span className={cn(st.meta, 'text-emerald-700')}>Fin {Math.round(ts.financialScore ?? 0)}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {sections.map((sec) => {
          const theme = PROFILE_SECTION_THEMES[sec.title];
          return (
            <div
              key={sec.title}
              className="bg-white border border-surface-border rounded-lg overflow-hidden shadow-card"
            >
              <PanelHeader title={sec.title} themeClass={theme?.header} />
              <table className="w-full text-sm">
                <tbody>
                  {sec.fields.map((f, i) => (
                    <tr
                      key={f.label}
                      className={cn(
                        'border-t border-surface-border/40 first:border-t-0',
                        theme?.rowHover,
                        i % 2 === 1 && 'bg-white/80',
                      )}
                    >
                      <td className={cn(st.label, 'px-2.5 py-1 whitespace-nowrap w-[40%]')}>{f.label}</td>
                      <td
                        className={cn(
                          st.value,
                          'px-2.5 py-1 text-right truncate',
                          f.value && f.value !== '—' ? 'text-brand-800' : 'text-text-muted font-normal',
                        )}
                      >
                        {f.value ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <p className={cn(st.meta, 'text-text-muted')}>Contact your counselor to update profile details.</p>
    </div>
  );
}
