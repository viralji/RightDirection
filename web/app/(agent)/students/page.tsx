'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { students } from '@/lib/api';
import { Plus, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['students', search, page],
    queryFn: () => students.list({ search, page: String(page), pageSize: '20' }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Students</h1>
          <p className="text-text-muted text-sm mt-1">{data?.meta.total ?? 0} total students</p>
        </div>
        <Link
          href="/students/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Table */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Name</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Education</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Countries</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Budget (₹)</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Profile</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Added</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>
            )}
            {data?.data.map((student) => (
              <tr key={student.id} className="border-b border-surface-border/50 hover:bg-surface-card2/50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/students/${student.id}`} className="text-text-primary hover:text-brand-400 font-medium">
                    {student.user.name}
                  </Link>
                  <div className="text-text-muted text-xs">{student.user.email}</div>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {student.educationLevel ?? '—'}
                  {student.aggregatePct && <span className="text-text-muted"> · {student.aggregatePct}%</span>}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {student.preferredCountries.slice(0, 3).join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {student.annualBudgetInr ? `₹${(student.annualBudgetInr / 100000).toFixed(1)}L` : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-surface-border rounded-full h-1.5 w-16">
                      <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${student.profileScore}%` }} />
                    </div>
                    <span className="text-text-muted text-xs">{student.profileScore}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted">{formatDate(student.createdAt)}</td>
              </tr>
            ))}
            {!isLoading && !data?.data.length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">No students found</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
            <span className="text-text-muted text-xs">
              {((page - 1) * 20) + 1}–{Math.min(page * 20, data.meta.total)} of {data.meta.total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className="px-3 py-1 text-xs bg-surface-card2 text-text-secondary rounded disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.meta.totalPages}
                className="px-3 py-1 text-xs bg-surface-card2 text-text-secondary rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
