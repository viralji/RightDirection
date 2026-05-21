'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { universities } from '@/lib/api';
import { ArrowLeft, Globe, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: uni, isLoading } = useQuery({
    queryKey: ['university', id],
    queryFn: () => universities.findOne(id),
  });

  if (isLoading) return <div className="text-text-muted p-6">Loading...</div>;
  if (!uni) return <div className="text-status-error p-6">University not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/universities" className="text-text-muted hover:text-text-primary"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">{uni.name}</h1>
            {uni.isPartner && <span className="text-xs px-2 py-0.5 rounded-full bg-status-success/20 text-status-success">Partner</span>}
          </div>
          <p className="text-text-muted text-sm">{uni.city}, {uni.country}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Commission', value: `${uni.defaultCommissionPct}%`, icon: DollarSign, color: 'text-status-success' },
          { label: 'Visa Rate', value: uni.visaSuccessRate ? `${(uni.visaSuccessRate * 100).toFixed(0)}%` : 'N/A', icon: TrendingUp, color: 'text-brand-400' },
          { label: 'QS Rank', value: uni.qsWorldRank ? `#${uni.qsWorldRank}` : 'N/A', icon: Globe, color: 'text-text-secondary' },
          { label: 'Active Courses', value: uni.courses?.length ?? 0, icon: Globe, color: 'text-text-secondary' },
        ].map(s => (
          <div key={s.label} className="bg-surface-card border border-surface-border rounded-xl p-4">
            <p className="text-text-muted text-xs">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Courses */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-semibold text-text-primary">Available Courses</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Course</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Level</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Duration</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Intakes</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Tuition</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Min IELTS</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Commission</th>
            </tr>
          </thead>
          <tbody>
            {uni.courses?.map(course => (
              <tr key={course.id} className="border-b border-surface-border/50 hover:bg-surface-card2/50">
                <td className="px-4 py-3 font-medium text-text-primary">{course.name}</td>
                <td className="px-4 py-3 text-text-secondary capitalize">{course.level.toLowerCase()}</td>
                <td className="px-4 py-3 text-text-secondary">{course.durationMonths}mo</td>
                <td className="px-4 py-3 text-text-secondary">{course.intakes.join(', ')}</td>
                <td className="px-4 py-3 text-text-primary">${course.tuitionFeeUsd.toLocaleString()}/yr</td>
                <td className="px-4 py-3 text-text-secondary">{course.minIelts ?? '—'}</td>
                <td className="px-4 py-3 text-status-success">{course.commissionPct}%</td>
              </tr>
            ))}
            {!uni.courses?.length && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">No courses listed</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
