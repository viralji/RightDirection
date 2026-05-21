'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate, cn } from '@/lib/utils';

async function fetchApplicationsForUniversity(stage?: string) {
  const qs = stage ? `?stage=${stage}` : '';
  const res = await fetch(`/api/v1/university/applications${qs}`, { credentials: 'include' });
  return (await res.json()).data;
}

async function updateApplicationStage(id: string, stage: string, note?: string) {
  const res = await fetch(`/api/v1/applications/${id}/stage`, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage, note }),
  });
  return res.json();
}

export default function UniversityOffersPage() {
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [action, setAction] = useState<'offer' | 'reject' | null>(null);

  const { data: apps, isLoading } = useQuery({
    queryKey: ['university-under-review'],
    queryFn: () => fetchApplicationsForUniversity('UNDER_REVIEW'),
  });

  const mutation = useMutation({
    mutationFn: ({ id, stage, note }: { id: string; stage: string; note?: string }) =>
      updateApplicationStage(id, stage, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['university-under-review'] });
      setSelectedApp(null);
      setAction(null);
      setNote('');
    },
  });

  const pendingApps = apps?.items ?? apps ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Offer Management</h1>
        <p className="text-text-muted text-sm mt-1">Applications under review — issue offers or flag rejections</p>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Student</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Course</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Agent</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Intake</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Applied</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">Loading...</td>
              </tr>
            )}
            {pendingApps.map((app: any) => (
              <tr key={app.id} className="border-b border-surface-border/50 hover:bg-surface-card2/50">
                <td className="px-4 py-3">
                  <p className="text-text-primary font-medium">{app.student?.user?.name ?? '—'}</p>
                  <p className="text-text-muted text-xs">{app.student?.user?.email ?? ''}</p>
                </td>
                <td className="px-4 py-3 text-text-secondary">{app.course?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{app.tenant?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-muted">{app.intake ?? '—'}</td>
                <td className="px-4 py-3 text-text-muted">{formatDate(app.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => { setSelectedApp(app); setAction('offer'); }}
                      className="text-xs bg-status-success/20 text-status-success px-2 py-1 rounded hover:bg-status-success/30"
                    >
                      Issue Offer
                    </button>
                    <button
                      onClick={() => { setSelectedApp(app); setAction('reject'); }}
                      className="text-xs bg-status-error/20 text-status-error px-2 py-1 rounded hover:bg-status-error/30"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && pendingApps.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No applications pending review
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Modal */}
      {selectedApp && action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface-card border border-surface-border rounded-xl p-6 w-full max-w-md">
            <h3 className="text-text-primary font-semibold mb-1">
              {action === 'offer' ? 'Issue Offer Letter' : 'Reject Application'}
            </h3>
            <p className="text-text-muted text-sm mb-4">
              {selectedApp.student?.user?.name} → {selectedApp.course?.name}
            </p>
            <textarea
              placeholder={action === 'offer' ? 'Offer conditions or notes (optional)...' : 'Reason for rejection (required for agent)...'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-surface-card2 border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-500 resize-none mb-4"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setSelectedApp(null); setAction(null); setNote(''); }}
                className="flex-1 px-4 py-2 bg-surface-card2 border border-surface-border text-text-secondary rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => mutation.mutate({
                  id: selectedApp.id,
                  stage: action === 'offer' ? 'OFFER_RECEIVED' : 'REJECTED',
                  note,
                })}
                disabled={mutation.isPending}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50',
                  action === 'offer' ? 'bg-status-success hover:bg-green-600' : 'bg-status-error hover:bg-red-700',
                )}
              >
                {mutation.isPending ? 'Saving...' : action === 'offer' ? 'Confirm Offer' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
