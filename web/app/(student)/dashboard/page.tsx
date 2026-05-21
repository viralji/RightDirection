'use client';

import { useQuery } from '@tanstack/react-query';
import { applications, proposals } from '@/lib/api';
import { APPLICATION_STAGE_LABELS, STAGE_COLORS, cn } from '@/lib/utils';

export default function StudentDashboard() {
  const { data: appData } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applications.list(),
  });

  const myApps = appData?.data ?? [];
  const latestStage = myApps[0]?.stage;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-500 mt-1">Track your study abroad journey</p>
      </div>

      {/* Progress Timeline */}
      {latestStage && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Application Progress</h2>
          <div className="flex items-center gap-0 overflow-x-auto">
            {['LEAD', 'DOCS_COLLECTION', 'SUBMITTED', 'OFFER_RECEIVED', 'VISA_PROCESSING', 'ENROLLED'].map((stage, i, arr) => {
              const stages = ['LEAD', 'DOCS_COLLECTION', 'UNDER_REVIEW', 'SUBMITTED', 'OFFER_RECEIVED', 'VISA_PROCESSING', 'FEES_PAID', 'ENROLLED'];
              const current = stages.indexOf(latestStage);
              const thisIdx = stages.indexOf(stage);
              const done = thisIdx <= current;
              return (
                <div key={stage} className="flex items-center">
                  <div className={cn('flex flex-col items-center gap-1', done ? 'text-brand-500' : 'text-gray-300')}>
                    <div className={cn('w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold',
                      done ? 'border-brand-500 bg-brand-50 text-brand-500' : 'border-gray-200 text-gray-300')}>
                      {i + 1}
                    </div>
                    <span className="text-xs whitespace-nowrap text-center w-20">{APPLICATION_STAGE_LABELS[stage]}</span>
                  </div>
                  {i < arr.length - 1 && <div className={cn('w-12 h-0.5 mb-5', done && stages.indexOf(arr[i + 1]) <= current ? 'bg-brand-500' : 'bg-gray-200')} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Applications */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">My Applications ({myApps.length})</h2>
        </div>
        {myApps.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">No applications yet. Your counselor will add them.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {myApps.map(app => (
              <div key={app.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{app.university.name}</p>
                  <p className="text-gray-400 text-sm">{app.course.name} · {app.intake ?? 'TBD'}</p>
                </div>
                <span className={cn('text-xs px-3 py-1 rounded-full', STAGE_COLORS[app.stage])}>
                  {APPLICATION_STAGE_LABELS[app.stage]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
