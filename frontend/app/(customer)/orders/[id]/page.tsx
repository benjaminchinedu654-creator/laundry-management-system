'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Order } from '@/types/order';
import { ApiException } from '@/types/api';
import { useToast } from '@/hooks/useToast';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { OrderTimeline } from '@/components/order/OrderTimeline';
import { OrderItemsTable } from '@/components/order/OrderItemsTable';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/format';
import { PAYMENT_STATUS_COLORS } from '@/lib/constants';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    api
      .getMyOrder(params.id)
      .then((res) => setOrder(res.order))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params?.id]);

  async function onCancel() {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await api.cancelMyOrder(order.id);
      setOrder(res.order);
      toast.push('Order cancelled', 'success');
      setCancelOpen(false);
    } catch (err) {
      if (err instanceof ApiException) toast.push(err.message, 'error');
      else toast.push('Could not cancel order', 'error');
    } finally {
      setCancelling(false);
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            onClick={() => router.push('/orders')}
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
        {order.status === 'pending' && (
          <Button variant="danger" onClick={() => setCancelOpen(true)}>
            Cancel order
          </Button>
        )}
      </div>

      <Card>
        <CardHeader title="Progress" />
        <CardBody>
          <OrderTimeline status={order.status} />
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Items" />
          <CardBody>
            <OrderItemsTable items={order.items ?? []} />
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-base font-semibold text-gray-900">
                {formatCurrency(order.total)}
              </span>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Pickup" />
            <CardBody className="space-y-1 text-sm text-gray-700">
              <p>{formatDate(order.pickup_date)}</p>
              <p>{order.pickup_time}</p>
              <p className="text-gray-500">{order.pickup_address}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Delivery" />
            <CardBody className="space-y-1 text-sm text-gray-700">
              <p>{formatDate(order.delivery_date)}</p>
              <p>{order.delivery_time}</p>
              <p className="text-gray-500">{order.delivery_address}</p>
            </CardBody>
          </Card>

          {order.special_notes && (
            <Card>
              <CardHeader title="Special notes" />
              <CardBody className="text-sm text-gray-700">
                {order.special_notes}
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this order?"
      >
        <p className="text-sm text-gray-600">
          This can&apos;t be undone. The order will be marked as cancelled.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCancelOpen(false)}>
            Keep order
          </Button>
          <Button variant="danger" loading={cancelling} onClick={onCancel}>
            Yes, cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
