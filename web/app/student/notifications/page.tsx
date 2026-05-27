'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@/lib/api';
import { formatDateTime, cn } from '@/lib/utils';
import { PageBody, PageHeader, pt } from '@/components/ui/portal-ui';
import { Bell, CheckCheck } from 'lucide-react';

export default function StudentNotificationsPage() {
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notifications.list(),
  });

  const { data: unread } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => notifications.unreadCount(),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notifications.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
      qc.invalidateQueries({ queryKey: ['student-dashboard'] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => notifications.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  return (
    <PageBody>
      <PageHeader
        title="Notifications"
        subtitle={
          unread?.count != null
            ? `${unread.count} unread`
            : 'Updates from your counselor and applications'
        }
        action={
          (unread?.count ?? 0) > 0 ? (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 bg-pastel-blue px-2.5 py-1.5 rounded-lg"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          ) : undefined
        }
      />

      {isLoading && <p className={pt.meta}>Loading…</p>}

      <ul className="space-y-2">
        {items.map((n) => (
          <li
            key={n.id}
            className={cn(
              'border rounded-lg px-3 py-2.5 text-sm transition-colors',
              n.isRead
                ? 'bg-white border-surface-border'
                : 'bg-pastel-blue/40 border-brand-200/80',
            )}
          >
            <div className="flex items-start gap-2">
              <Bell
                className={cn(
                  'w-4 h-4 mt-0.5 shrink-0',
                  n.isRead ? 'text-text-muted' : 'text-brand-600',
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <p className="font-semibold text-text-primary">{n.title}</p>
                  <time className="text-xs text-text-muted whitespace-nowrap">
                    {formatDateTime(n.createdAt)}
                  </time>
                </div>
                <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">{n.body}</p>
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => markRead.mutate(n.id)}
                    className="text-xs text-brand-700 font-medium mt-1.5 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
        {!isLoading && !items.length && (
          <li className="text-center py-8 text-text-muted text-sm">No notifications yet</li>
        )}
      </ul>
    </PageBody>
  );
}
