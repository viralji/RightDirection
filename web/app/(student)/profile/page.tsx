'use client';

import { useAuthStore } from '@/lib/auth';

export default function StudentProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0) ?? 'S'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm">Complete your profile to get better university recommendations from your counselor.</p>
      </div>
    </div>
  );
}
