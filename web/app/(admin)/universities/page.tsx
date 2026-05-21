'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDate, cn } from '@/lib/utils';

async function fetchAdminUniversities() {
  const res = await fetch('/api/v1/admin/universities', { credentials: 'include' });
  return (await res.json());
}

export default function AdminUniversitiesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-universities'], queryFn: fetchAdminUniversities });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Universities</h1>
        <button className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium">
          + Add University
        </button>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-4 py-3 text-text-muted font-medium">University</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Country</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Courses</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Applications</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Commission %</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Partner</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>}
            {data?.data?.map((u: any) => (
              <tr key={u.id} className="border-b border-surface-border/50 hover:bg-surface-card2/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary">{u.name}</p>
                  <p className="text-text-muted text-xs">{u.city}</p>
                </td>
                <td className="px-4 py-3 text-text-secondary">{u.country}</td>
                <td className="px-4 py-3 text-text-secondary">{u._count?.courses ?? 0}</td>
                <td className="px-4 py-3 text-text-secondary">{u._count?.applications ?? 0}</td>
                <td className="px-4 py-3 text-status-success">{u.defaultCommissionPct}%</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full',
                    u.isPartner ? 'bg-status-success/20 text-status-success' : 'bg-surface-card2 text-text-muted')}>
                    {u.isPartner ? 'Partner' : 'Listed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
