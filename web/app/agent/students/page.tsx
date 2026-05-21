'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { students } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  PageHeader,
  PageBody,
  SearchInput,
  DataTableShell,
  DataTableHead,
  Th,
  ExpandableRow,
} from '@/components/ui/portal-ui';
import { StudentExpandPanel } from '@/components/student/student-expand-panel';

function StudentRow({ student }: { student: any }) {
  const [expanded, setExpanded] = useState(false);
  const budget = student.annualBudgetInr
    ? `₹${(student.annualBudgetInr / 100000).toFixed(1)}L`
    : '—';

  return (
    <ExpandableRow
      expanded={expanded}
      onToggle={() => setExpanded((e) => !e)}
      colSpan={7}
      summaryCells={
        <>
          <td className="px-3 py-2">
            <p className="font-medium text-text-primary text-sm">{student.user.name}</p>
            <p className="text-text-muted text-xs">{student.user.email}</p>
          </td>
          <td className="px-3 py-2 text-text-secondary text-xs">
            {student.educationLevel ?? '—'}
            {student.aggregatePct != null && (
              <span className="text-text-muted"> · {student.aggregatePct}%</span>
            )}
          </td>
          <td className="px-3 py-2 text-text-secondary text-xs">
            {student.preferredCountries?.slice(0, 3).join(', ') || '—'}
          </td>
          <td className="px-3 py-2 text-text-secondary text-xs">{budget}</td>
          <td className="px-3 py-2">
            <div className="flex items-center gap-1.5">
              <div className="flex-1 bg-surface-border rounded-full h-1 w-14 max-w-[56px]">
                <div
                  className="bg-brand-500 h-1 rounded-full"
                  style={{ width: `${student.profileScore ?? 0}%` }}
                />
              </div>
              <span className="text-xs font-medium text-brand-700">{student.profileScore ?? 0}%</span>
            </div>
          </td>
          <td className="px-3 py-2 text-text-muted text-xs whitespace-nowrap">
            {formatDate(student.createdAt)}
          </td>
        </>
      }
      detail={<StudentExpandPanel studentId={student.id} />}
    />
  );
}

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['students', search, page],
    queryFn: () => students.list({ search, page: String(page), pageSize: '20' }),
  });

  return (
    <PageBody>
      <PageHeader
        title="Students"
        subtitle={`${data?.meta.total ?? 0} total — click a row to expand journey & profile`}
        action={
          <Link
            href="/agent/students/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Student
          </Link>
        }
      />

      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="Search by name or email..."
        className="max-w-md"
      />

      <DataTableShell>
        <DataTableHead>
          <Th className="w-8" />
          <Th>Name</Th>
          <Th>Education</Th>
          <Th>Countries</Th>
          <Th>Budget</Th>
          <Th>Profile</Th>
          <Th>Added</Th>
        </DataTableHead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={7} className="px-3 py-6 text-center text-text-muted text-xs">
                Loading…
              </td>
            </tr>
          )}
          {data?.data.map((student) => (
            <StudentRow key={student.id} student={student} />
          ))}
          {!isLoading && !data?.data.length && (
            <tr>
              <td colSpan={7} className="px-3 py-6 text-center text-text-muted text-xs">
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </DataTableShell>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>
            {((page - 1) * 20) + 1}–{Math.min(page * 20, data.meta.total)} of {data.meta.total}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-2.5 py-1 bg-white border border-surface-border rounded-md disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.meta.totalPages}
              className="px-2.5 py-1 bg-white border border-surface-border rounded-md disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </PageBody>
  );
}
