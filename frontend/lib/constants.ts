import { OrderStatus, PaymentStatus } from '@/types/order';

/** Order status flow */
export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending',          label: 'Pending' },
  { value: 'picked_up',        label: 'Picked up' },
  { value: 'washing',          label: 'Washing' },
  { value: 'ready',            label: 'Ready' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered',        label: 'Delivered' },
  { value: 'cancelled',        label: 'Cancelled' },
];

/** Colors for status pills (Tailwind class strings) */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending:          'bg-yellow-100 text-yellow-800 border-yellow-200',
  picked_up:        'bg-blue-100 text-blue-800 border-blue-200',
  washing:          'bg-indigo-100 text-indigo-800 border-indigo-200',
  ready:            'bg-purple-100 text-purple-800 border-purple-200',
  out_for_delivery: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  delivered:        'bg-green-100 text-green-800 border-green-200',
  cancelled:        'bg-red-100 text-red-800 border-red-200',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  unpaid:   'bg-amber-100 text-amber-800 border-amber-200',
  paid:     'bg-green-100 text-green-800 border-green-200',
  refunded: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const PAYMENT_METHODS = ['cash', 'card', 'transfer'] as const;
export const PAYMENT_STATES  = ['pending', 'success', 'failed', 'refunded'] as const;

/** Default currency symbol (mirrors env var) */
export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || '₦';

/** Storage keys — single source of truth */
export const STORAGE_KEYS = {
  customerToken: 'customer_token',
  customerUser:  'customer_user',
  adminToken:    'admin_token',
  adminUser:     'admin_user',
} as const;
