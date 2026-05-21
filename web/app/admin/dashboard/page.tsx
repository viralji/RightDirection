'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchAdminStats() {
  const res = await fetch('/api/v1/admin/stats', { credentials: 'include' });
  const json = await res.json();
  return json.data;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchAdminStats });

  const cards = stats ? [
    { label: 'Agent Tenants', value: stats.totalTenants },
    { label: 'Total Students', value: stats.totalStudents },
    { label: 'Total Applications', value: stats.totalApplications },
    { label: 'Enrolled Students', value: stats.enrolled },
    { label: 'KYC Pending', value: stats.pendingKyc },
    { label: 'Universities', value: stats.totalUniversities },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Platform Overview</h1>
        <p className="text-text-muted text-sm mt-1">Real-time platform metrics</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {isLoading && [...Array(6)].map((_, i) => (
          <div key={i} className="bg-surface-card border border-surface-border rounded-xl p-5 animate-pulse h-20" />
        ))}
        {cards.map(c => (
          <div key={c.label} className="bg-white border border-surface-border rounded-xl p-5 shadow-card">
            <p className="text-text-muted text-sm">{c.label}</p>
            <p className="text-3xl font-bold text-text-primary mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
