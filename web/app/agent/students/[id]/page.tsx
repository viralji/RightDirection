'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { students } from '@/lib/api';
import { PageHeader, PageBody, StatChip } from '@/components/ui/portal-ui';
import { StudentExpandPanel } from '@/components/student/student-expand-panel';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => students.findOne(id),
  });

  const { data: journey } = useQuery({
    queryKey: ['student-journey', id],
    queryFn: () => students.journey(id),
    enabled: !!id,
  });

  if (isLoading) return <p className="text-text-muted text-sm p-2">Loading…</p>;
  if (!student) return <p className="text-status-error text-sm p-2">Student not found</p>;

  return (
    <PageBody>
      <div className="flex items-start gap-2">
        <Link href="/agent/students" className="text-text-muted hover:text-text-primary mt-0.5">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title={student.user.name}
          subtitle={[student.user.email, student.user.phone].filter(Boolean).join(' · ')}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <StatChip tone="blue">Profile {student.profileScore ?? 0}%</StatChip>
        <StatChip tone="mint">{student.applications?.length ?? 0} applications</StatChip>
        <StatChip tone="lilac">{student.documents?.length ?? 0} documents</StatChip>
        {journey?.stats && (
          <StatChip tone="sand">{journey.stats.daysWithAgency}d with agency</StatChip>
        )}
      </div>

      <StudentExpandPanel studentId={id} fullPage />
    </PageBody>
  );
}
