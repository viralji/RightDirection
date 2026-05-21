'use client';

import { useQuery } from '@tanstack/react-query';
import { agent } from '@/lib/api';
import { Users, Crown, UserCheck, Phone } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
  AGENT_OWNER: 'Owner',
  AGENT_MANAGER: 'Manager',
  AGENT_COUNSELOR: 'Counselor',
  AGENT_TELECALLER: 'Telecaller',
};

const ROLE_ICONS: Record<string, any> = {
  AGENT_OWNER: Crown,
  AGENT_MANAGER: UserCheck,
  AGENT_COUNSELOR: Users,
  AGENT_TELECALLER: Phone,
};

export default function TeamPage() {
  const { data: team, isLoading } = useQuery({ queryKey: ['team'], queryFn: () => agent.team() });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Team</h1>
          <p className="text-text-muted text-sm mt-1">{team?.length ?? 0} team members</p>
        </div>
        <button className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium">
          + Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading && <div className="text-text-muted col-span-2">Loading...</div>}
        {team?.map((member: any) => {
          const Icon = ROLE_ICONS[member.role] ?? Users;
          return (
            <div key={member.id} className="bg-surface-card border border-surface-border rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm flex-shrink-0">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">{member.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-card2 text-text-muted">
                    {ROLE_LABELS[member.role] ?? member.role}
                  </span>
                </div>
                <p className="text-text-muted text-xs truncate">{member.email}</p>
                {member.phone && <p className="text-text-muted text-xs">{member.phone}</p>}
              </div>
              <div className="text-right text-xs text-text-muted">
                <p>Last login</p>
                <p>{member.lastLoginAt ? formatDate(member.lastLoginAt) : 'Never'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
