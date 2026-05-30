'use client';

import { useQuery } from '@tanstack/react-query';
import { Shield, AlertTriangle } from 'lucide-react';
import { admin } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';

export default function FraudPage() {
  const { data: docs, isLoading } = useQuery({
    queryKey: ['fraud-docs'],
    queryFn: () => admin.fraudHighRisk(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-status-error" />
        <h1 className="text-2xl font-bold text-text-primary">Fraud Intelligence</h1>
      </div>

      <div className="bg-status-error/10 border border-status-error/30 rounded-xl p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-status-error flex-shrink-0" />
        <p className="text-text-primary text-sm">
          High-risk documents require manual review before applications proceed to offer stage.
        </p>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-semibold text-text-primary">High-Risk Documents ({docs?.length ?? 0})</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Student</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Document</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Category</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Fraud Score</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Flags</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>}
            {docs?.map((doc: any) => (
              <tr key={doc.id} className="border-b border-surface-border/50 hover:bg-surface-card2/50">
                <td className="px-4 py-3 text-text-primary">{doc.student?.user?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{doc.fileName}</td>
                <td className="px-4 py-3 text-text-secondary">{doc.category}</td>
                <td className="px-4 py-3">
                  <span className="text-status-error font-semibold">{doc.fraudScore?.toFixed(0) ?? '—'}/100</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {(doc.fraudFlags as string[])?.slice(0, 2).map((flag, i) => (
                      <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-status-error/20 text-status-error">{flag}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted">{formatDate(doc.createdAt)}</td>
              </tr>
            ))}
            {!docs?.length && !isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">No high-risk documents</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
