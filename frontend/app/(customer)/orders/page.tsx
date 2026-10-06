'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/types/order';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderCard } from '@/components/order/OrderCard';
import { Pagination } from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState({ page: 1, per_page: 10, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);

  const load = (page: number) => {
    setLoading(true);
    api
      .listMyOrders({ page, per_page: 10 })
      .then((res) => {
        setOrders(res.orders);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My orders</h1>
          <p className="mt-1 text-gray-600">
            Track all your laundry orders in one place.
          </p>
        </div>
        <Link href="/orders/new">
          <Button>+ New order</Button>
        </Link>
      </div>

      {loading ? (
        <PageSpinner />
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
        <>
          <div className="space-y-3">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
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
