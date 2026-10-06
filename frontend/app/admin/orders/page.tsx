'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Order } from '@/types/order';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, humanStatus } from '@/lib/format';
import { ORDER_STATUSES, PAYMENT_STATUS_COLORS } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState({ page: 1, per_page: 15, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const load = (page = 1) => {
    setLoading(true);
    api
      .adminListOrders({
        page,
        per_page: 15,
        search: debouncedSearch || undefined,
        status: status || undefined,
        payment_status: paymentStatus || undefined,
      })
      .then((res) => {
        setOrders(res.orders);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status, paymentStatus]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-gray-600">
          All customer orders. Filter to find what you need.
        </p>
      </div>

      <Card>
        <CardBody className="grid gap-3 sm:grid-cols-3">
          <Input
            placeholder="Search order code, name, or phone&hellip;"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="All statuses"
            options={ORDER_STATUSES.map((s) => ({
              value: s.value,
              label: s.label,
            }))}
          />
          <Select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            placeholder="All payments"
            options={[
              { value: 'unpaid',   label: 'Unpaid' },
              { value: 'paid',     label: 'Paid' },
              { value: 'refunded', label: 'Refunded' },
            ]}
          />
        </CardBody>
      </Card>

      {loading ? (
        <PageSpinner />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Try different filters."
        />
      ) : (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Pickup</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {o.order_code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{o.user_name}</div>
                      <div className="text-xs text-gray-500">{o.user_phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={PAYMENT_STATUS_COLORS[o.payment_status]}>
                        {o.payment_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {formatDate(o.pickup_date)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-xs font-medium text-blue-700 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      <Pagination
        page={meta.page}
        lastPage={meta.last_page}
        onChange={(p) => load(p)}
      />

      <p className="text-xs text-gray-500">
        {meta.total} order{meta.total === 1 ? '' : 's'} total
        {status && ` &middot; filtered by ${humanStatus(status)}`}
      </p>
    </div>
  );
}
