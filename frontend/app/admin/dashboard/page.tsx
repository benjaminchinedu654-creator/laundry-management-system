'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardResponse } from '@/types/admin';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatRelative, humanStatus } from '@/lib/format';
import { PAYMENT_STATUS_COLORS } from '@/lib/constants';

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .adminDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner label="Loading dashboard&hellip;" />;
  if (!data)
    return (
      <p className="text-sm text-red-600">Failed to load dashboard.</p>
    );

  const { metrics, recent_orders, by_status } = data;

  const stats = [
    { label: 'Total orders',       value: metrics.total_orders },
    { label: 'Today',              value: metrics.today_orders },
    { label: 'In progress',        value: metrics.pending_orders },
    { label: 'Delivered',          value: metrics.delivered_orders },
    { label: 'Customers',          value: metrics.total_customers },
    { label: 'Revenue (all time)', value: formatCurrency(metrics.revenue_total) },
    { label: 'Revenue today',      value: formatCurrency(metrics.revenue_today) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Overview of your laundry operations.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {s.label}
              </p>
              <p className="mt-2 text-xl font-bold text-gray-900">{s.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent orders"
            action={
              <Link
                href="/admin/orders"
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                View all
              </Link>
            }
          />
          <CardBody>
            {recent_orders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                      <th className="py-2 pr-4">Order</th>
                      <th className="py-2 pr-4">Customer</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Payment</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 text-right">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_orders.map((o) => (
                      <tr key={o.id} className="border-b border-gray-50">
                        <td className="py-2 pr-4">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="font-medium text-blue-700 hover:underline"
                          >
                            {o.order_code}
                          </Link>
                        </td>
                        <td className="py-2 pr-4 text-gray-700">
                          {o.user_name}
                          <span className="block text-xs text-gray-400">
                            {o.user_phone}
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          <OrderStatusBadge status={o.status} />
                        </td>
                        <td className="py-2 pr-4">
                          <Badge
                            className={PAYMENT_STATUS_COLORS[o.payment_status]}
                          >
                            {o.payment_status}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4 text-gray-800">
                          {formatCurrency(o.total)}
                        </td>
                        <td className="py-2 text-right text-xs text-gray-500">
                          {formatRelative(o.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Status breakdown */}
        <Card>
          <CardHeader title="Orders by status" />
          <CardBody>
            {by_status.length === 0 ? (
              <p className="text-sm text-gray-500">No data.</p>
            ) : (
              <ul className="space-y-2">
                {by_status.map((row) => (
                  <li
                    key={row.status}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">
                      {humanStatus(row.status)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
