'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { applications } from '@/lib/api';
import { APPLICATION_STAGE_LABELS, STAGE_COLORS, formatDate, cn } from '@/lib/utils';
import { ApplicationStage } from '@/lib/types';

export default function UniversityApplicationsPage() {
  const qc = useQueryClient();
  const [stageFilter, setStageFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['university-apps', stageFilter],
    queryFn: () => applications.list({ ...(stageFilter && { stage: stageFilter }), pageSize: '50' }),
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => applications.changeStage(id, stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['university-apps'] }),
  });

  const REVIEW_STAGES = ['SUBMITTED', 'UNDER_REVIEW', 'OFFER_RECEIVED', 'VISA_PROCESSING', 'ENROLLED', 'REJECTED'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Applications</h1>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStageFilter('')}
          className={cn('px-3 py-1.5 rounded-lg text-sm border', !stageFilter ? 'bg-brand-700 text-white border-brand-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
          All
        </button>
        {REVIEW_STAGES.map(s => (
          <button key={s} onClick={() => setStageFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-sm border', stageFilter === s ? 'bg-brand-700 text-white border-brand-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
            {APPLICATION_STAGE_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Student</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Course</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Intake</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>}
            {data?.data.map(app => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{app.student.user.name}</p>
                  <p className="text-gray-400 text-xs">{app.student.user.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{app.course.name}</td>
                <td className="px-4 py-3 text-gray-500">{app.intake ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-1 rounded-full', STAGE_COLORS[app.stage])}>
                    {APPLICATION_STAGE_LABELS[app.stage]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(app.createdAt)}</td>
                <td className="px-4 py-3">
                  {app.stage === 'SUBMITTED' && (
                    <div className="flex gap-2">
                      <button onClick={() => stageMutation.mutate({ id: app.id, stage: 'OFFER_RECEIVED' })}
                        className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">Issue Offer</button>
                      <button onClick={() => stageMutation.mutate({ id: app.id, stage: 'REJECTED' })}
                        className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Reject</button>
                    </div>
                  )}
                  {app.stage === 'UNDER_REVIEW' && (
                    <button onClick={() => stageMutation.mutate({ id: app.id, stage: 'SUBMITTED' })}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100">Mark Submitted</button>
                  )}
                </td>
              </tr>
            ))}
            {!data?.data.length && !isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No applications found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
