'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Order } from '@/types/order';
import { ApiException } from '@/types/api';
import { useToast } from '@/hooks/useToast';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { OrderItemsTable } from '@/components/order/OrderItemsTable';
import { formatCurrency, formatDate } from '@/lib/format';
import { ORDER_STATUSES, PAYMENT_STATUS_COLORS } from '@/lib/constants';

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState('');
  const [paymentDraft, setPaymentDraft] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    api
      .adminGetOrder(params.id)
      .then((res) => {
        setOrder(res.order);
        setStatusDraft(res.order.status);
        setPaymentDraft(res.order.payment_status);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params?.id]);

  async function saveStatus() {
    if (!order || statusDraft === order.status) return;
    setSavingStatus(true);
    try {
      const res = await api.adminUpdateOrderStatus(order.id, statusDraft);
      setOrder(res.order);
      toast.push('Status updated', 'success');
    } catch (err) {
      if (err instanceof ApiException) toast.push(err.message, 'error');
      else toast.push('Could not update status', 'error');
      setStatusDraft(order.status);
    } finally {
      setSavingStatus(false);
    }
  }

  async function savePayment() {
    if (!order || paymentDraft === order.payment_status) return;
    setSavingPayment(true);
    try {
      const res = await api.adminUpdateOrderPayment(order.id, paymentDraft);
      setOrder(res.order);
      toast.push('Payment status updated', 'success');
    } catch (err) {
      if (err instanceof ApiException) toast.push(err.message, 'error');
      else toast.push('Could not update payment status', 'error');
      setPaymentDraft(order.payment_status);
    } finally {
      setSavingPayment(false);
    }
  }

  if (loading) return <PageSpinner />;
  if (error)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  if (!order) return null;

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.push('/admin/orders')}
          className="text-xs text-gray-500 hover:text-gray-800"
        >
          &larr; Back to orders
        </button>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          {order.order_code}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <Badge className={PAYMENT_STATUS_COLORS[order.payment_status]}>
            Payment: {order.payment_status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: items + notes + addresses */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Items" />
            <CardBody>
              <OrderItemsTable items={order.items ?? []} />
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-base font-semibold text-gray-900">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </CardBody>
          </Card>

          {order.special_notes && (
            <Card>
              <CardHeader title="Special notes from customer" />
              <CardBody className="text-sm text-gray-700">
                {order.special_notes}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Addresses &amp; schedule" />
            <CardBody className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-medium text-gray-800">Pickup</p>
                <p className="text-gray-600">
                  {formatDate(order.pickup_date)} at {order.pickup_time}
                </p>
                <p className="text-gray-500">{order.pickup_address}</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">Delivery</p>
                <p className="text-gray-600">
                  {formatDate(order.delivery_date)} at {order.delivery_time}
                </p>
                <p className="text-gray-500">{order.delivery_address}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right: customer + actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" />
            <CardBody className="text-sm text-gray-700">
              <p className="font-medium text-gray-900">{order.user_name}</p>
              <p className="text-gray-500">{order.user_email}</p>
              <p className="text-gray-500">{order.user_phone}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Update order status" />
            <CardBody className="space-y-3">
              <Select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                options={ORDER_STATUSES.map((s) => ({
                  value: s.value,
                  label: s.label,
                }))}
              />
              <Button
                fullWidth
                loading={savingStatus}
                disabled={statusDraft === order.status}
                onClick={saveStatus}
              >
                Save status
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Update payment status" />
            <CardBody className="space-y-3">
              <Select
                value={paymentDraft}
                onChange={(e) => setPaymentDraft(e.target.value)}
                options={[
                  { value: 'unpaid',   label: 'Unpaid' },
                  { value: 'paid',     label: 'Paid' },
                  { value: 'refunded', label: 'Refunded' },
                ]}
              />
              <Button
                fullWidth
                loading={savingPayment}
                disabled={paymentDraft === order.payment_status}
                onClick={savePayment}
              >
                Save payment status
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
