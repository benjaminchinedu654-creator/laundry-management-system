'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { formatCurrency, formatDate } from '@/lib/format';
import { OrderStatus } from '@/types/order';

type Tab = 'orders' | 'revenue' | 'customers';

interface OrdersReport {
  range: { from: string; to: string };
  summary: { total_orders: number; total_value: string; paid_value: string };
  orders: {
    order_code: string;
    customer: string;
    phone: string;
    status: OrderStatus;
    payment_status: string;
    total: string;
    created_at: string;
  }[];
}

interface RevenueReport {
  range: { from: string; to: string };
  total_revenue: number;
  by_day: { day: string; revenue: string }[];
}

interface CustomersReport {
  customers: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    order_count: number;
    lifetime_value: string;
  }[];
}

export default function AdminReportsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('orders');

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 29 * 86400000);
  const toISO = (d: Date) => d.toISOString().slice(0, 10);

  const [from, setFrom] = useState(toISO(thirtyDaysAgo));
  const [to, setTo] = useState(toISO(today));

  const [ordersData, setOrdersData] = useState<OrdersReport | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueReport | null>(null);
  const [customersData, setCustomersData] = useState<CustomersReport | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'orders') {
        const res = await api.adminReportOrders({ from_date: from, to_date: to });
        setOrdersData(res as unknown as OrdersReport);
      } else if (tab === 'revenue') {
        const res = await api.adminReportRevenue({ from_date: from, to_date: to });
        setRevenueData(res);
      } else {
        const res = await api.adminReportCustomers();
        setCustomersData(res);
      }
    } catch {
      toast.push('Could not load report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-gray-600">
          Snapshot of orders, revenue, and customers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['orders', 'revenue', 'customers'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize transition ${
              tab === t
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Range picker */}
      {tab !== 'customers' && (
        <Card>
          <CardBody className="grid gap-3 sm:grid-cols-4">
            <Input
              label="From"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <Input
              label="To"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <div className="flex items-end sm:col-span-2">
              <Button onClick={load} loading={loading}>
                Apply filters
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {loading ? (
        <PageSpinner />
      ) : tab === 'orders' && ordersData ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardBody>
                <p className="text-xs uppercase text-gray-500">Total orders</p>
                <p className="mt-2 text-xl font-bold">
                  {ordersData.summary.total_orders}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs uppercase text-gray-500">Total value</p>
                <p className="mt-2 text-xl font-bold">
                  {formatCurrency(ordersData.summary.total_value)}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs uppercase text-gray-500">Paid value</p>
                <p className="mt-2 text-xl font-bold">
                  {formatCurrency(ordersData.summary.paid_value)}
                </p>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader title="Orders in range" />
            <CardBody className="overflow-x-auto p-0">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs uppercase text-gray-500">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData.orders.map((o) => (
                    <tr key={o.order_code} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {o.order_code}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {o.customer}
                        <span className="block text-xs text-gray-500">
                          {o.phone}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-700">
                        {o.payment_status}
                      </td>
                      <td className="px-4 py-3">{formatCurrency(o.total)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(o.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      ) : tab === 'revenue' && revenueData ? (
        <div className="space-y-6">
          <Card>
            <CardBody>
              <p className="text-xs uppercase text-gray-500">
                Total revenue in range
              </p>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(revenueData.total_revenue)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {revenueData.range.from} &rarr; {revenueData.range.to}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Revenue by day" />
            <CardBody className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs uppercase text-gray-500">
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.by_day.map((row) => (
                    <tr key={row.day} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">
                        {formatDate(row.day)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(row.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      ) : tab === 'customers' && customersData ? (
        <Card>
          <CardHeader title="Customers overview" />
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase text-gray-500">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3 text-right">Lifetime value</th>
                </tr>
              </thead>
              <tbody>
                {customersData.customers.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {c.full_name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div>{c.email}</div>
                      <div className="text-xs text-gray-500">{c.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{c.order_count}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(c.lifetime_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
