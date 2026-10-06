'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { User } from '@/types/user';
import { Order } from '@/types/order';
import { ApiException } from '@/types/api';
import { useToast } from '@/hooks/useToast';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { formatCurrency, formatDate } from '@/lib/format';
import { PAYMENT_STATUS_COLORS } from '@/lib/constants';

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    api
      .adminGetUser(params.id)
      .then((res) => {
        setUser(res.user);
        setOrders(res.orders);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params?.id]);

  async function toggleActive() {
    if (!user) return;
    setUpdating(true);
    try {
      const next: 0 | 1 = user.is_active ? 0 : 1;
      const res = await api.adminSetUserActive(user.id, next);
      setUser(res.user);
      toast.push(next ? 'Customer activated' : 'Customer deactivated', 'success');
    } catch (err) {
      if (err instanceof ApiException) toast.push(err.message, 'error');
      else toast.push('Could not update', 'error');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <PageSpinner />;
  if (error)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.push('/admin/users')}
          className="text-xs text-gray-500 hover:text-gray-800"
        >
          &larr; Back to customers
        </button>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.full_name}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <span>{user.email}</span>
              <span className="text-gray-300">&middot;</span>
              <span>{user.phone}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.is_active ? (
              <Badge className="border-green-200 bg-green-100 text-green-800">
                Active
              </Badge>
            ) : (
              <Badge className="border-red-200 bg-red-100 text-red-800">
                Inactive
              </Badge>
            )}
            <Button
              size="sm"
              variant={user.is_active ? 'danger' : 'primary'}
              loading={updating}
              onClick={toggleActive}
            >
              {user.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Account details" />
          <CardBody className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Joined</span>
              <span className="text-gray-800">{formatDate(user.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Address</span>
              <span className="max-w-[60%] text-right text-gray-800">
                {user.address || '&mdash;'}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title={`Orders (${orders.length})`} />
          <CardBody>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-500">
                This customer has no orders yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-gray-500">
                      <th className="py-2 pr-4">Order</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Payment</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 text-right">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t border-gray-50">
                        <td className="py-2 pr-4">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="font-medium text-blue-700 hover:underline"
                          >
                            {o.order_code}
                          </Link>
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
                        <td className="py-2 pr-4">
                          {formatCurrency(o.total)}
                        </td>
                        <td className="py-2 text-right text-xs text-gray-500">
                          {formatDate(o.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
