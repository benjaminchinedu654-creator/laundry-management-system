'use client';

import Link from 'next/link';
import { Order } from '@/types/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatRelative } from '@/lib/format';
import { PAYMENT_STATUS_COLORS } from '@/lib/constants';

export function OrderCard({ order }: { order: Order }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {order.order_code}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Placed {formatRelative(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <Badge className={PAYMENT_STATUS_COLORS[order.payment_status]}>
            {order.payment_status}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-xs text-gray-600 sm:grid-cols-2">
        <div>
          <p className="font-medium text-gray-800">Pickup</p>
          <p>
            {formatDate(order.pickup_date)} at {order.pickup_time}
          </p>
          <p className="truncate">{order.pickup_address}</p>
        </div>
        <div>
          <p className="font-medium text-gray-800">Delivery</p>
          <p>
            {formatDate(order.delivery_date)} at {order.delivery_time}
          </p>
          <p className="truncate">{order.delivery_address}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-500">
          {order.items?.length ?? 0} item
          {order.items?.length === 1 ? '' : 's'}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {formatCurrency(order.total)}
        </span>
      </div>
    </Link>
  );
}
