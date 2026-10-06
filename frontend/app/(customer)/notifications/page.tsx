'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { api } from '@/lib/api';
import { Notification } from '@/types/notification';
import { useToast } from '@/hooks/useToast';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { formatRelative } from '@/lib/format';

export default function NotificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [meta, setMeta] = useState({ page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);

  const load = (page = 1) => {
    setLoading(true);
    api
      .listNotifications({ page, per_page: 15 })
      .then((res) => {
        setItems(res.notifications);
        setUnread(res.unread);
        setMeta((m) => ({ ...m, page }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  async function markRead(id: number) {
    try {
      await api.markNotificationRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 as const } : n))
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      toast.push('Could not mark as read', 'error');
    }
  }

  async function markAll() {
    try {
      await api.markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: 1 as const })));
      setUnread(0);
      toast.push('All marked as read', 'success');
    } catch {
      toast.push('Could not mark all as read', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-gray-600">
            {unread > 0 ? `${unread} unread` : "You're all caught up."}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAll}>
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <PageSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="You'll get updates here as your orders move along."
        />
      ) : (
        <>
          <div className="space-y-2">
            {items.map((n) => (
              <Card
                key={n.id}
                className={clsx(!n.is_read && 'border-blue-200 bg-blue-50/40')}
              >
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-600">{n.message}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatRelative(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="whitespace-nowrap rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          <Pagination
            page={meta.page}
            lastPage={meta.last_page}
            onChange={(p) => load(p)}
          />
        </>
      )}
    </div>
  );
}
