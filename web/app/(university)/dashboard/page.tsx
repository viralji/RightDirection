'use client';

import { useQuery } from '@tanstack/react-query';
import { applications } from '@/lib/api';
import { APPLICATION_STAGE_LABELS, STAGE_COLORS, formatDate, cn } from '@/lib/utils';

export default function UniversityDashboard() {
  const { data: appData, isLoading } = useQuery({
    queryKey: ['university-applications'],
    queryFn: () => applications.list({ pageSize: '20' }),
  });

  const total = appData?.meta.total ?? 0;
  const submitted = appData?.data.filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.stage)).length ?? 0;
  const offers = appData?.data.filter(a => a.stage === 'OFFER_RECEIVED').length ?? 0;
  const enrolled = appData?.data.filter(a => a.stage === 'ENROLLED').length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">University Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: total, color: 'text-gray-800' },
          { label: 'Under Review', value: submitted, color: 'text-yellow-600' },
          { label: 'Offers Issued', value: offers, color: 'text-blue-600' },
          { label: 'Enrolled', value: enrolled, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-gray-400 text-sm">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recent Applications</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Student</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Course</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Intake</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>}
            {appData?.data.map(app => (
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
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-xs text-green-600 hover:underline">Approve</button>
                    <button className="text-xs text-red-500 hover:underline">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
