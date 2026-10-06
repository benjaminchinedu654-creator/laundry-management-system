'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Order } from '@/types/order';
import Button from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderCard } from '@/components/order/OrderCard';
import { Spinner } from '@/components/ui/Spinner';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .listMyOrders({ page: 1, per_page: 3 })
      .then((res) => { if (mounted) setOrders(res.orders); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.full_name?.split(' ')[0] || 'there'} &#x1F44B;
          </h1>
          <p className="mt-1 text-gray-600">
            Here&apos;s a quick overview of your laundry activity.
          </p>
        </div>
        <Link href="/orders/new">
          <Button>+ New order</Button>
        </Link>
      </div>

      <Card>
        <CardHeader
          title="Recent orders"
          subtitle="Your 3 most recent orders"
          action={
            <Link href="/orders">
              <Button variant="outline" size="sm">View all</Button>
            </Link>
          }
        />
        <CardBody>
          {loading ? (
            <div className="flex items-center gap-3 text-gray-500">
              <Spinner />
              <span className="text-sm">Loading orders&hellip;</span>
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Schedule your first pickup to get started."
              action={
                <Link href="/orders/new">
                  <Button size="sm">Create order</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
