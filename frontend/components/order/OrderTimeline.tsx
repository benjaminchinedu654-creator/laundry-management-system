'use client';

import clsx from 'clsx';
import { OrderStatus } from '@/types/order';
import { humanStatus } from '@/lib/format';

const FLOW: OrderStatus[] = [
  'pending',
  'picked_up',
  'washing',
  'ready',
  'out_for_delivery',
  'delivered',
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(status);

  return (
    <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
      {FLOW.map((s, i) => {
        const done = i <= currentIndex;
        return (
          <li key={s} className="flex items-center gap-2">
            <span
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold',
                done ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              )}
            >
              {i + 1}
            </span>
            <span
              className={clsx(
                'text-xs',
                done ? 'font-medium text-gray-900' : 'text-gray-500'
              )}
            >
              {humanStatus(s)}
            </span>
            {i < FLOW.length - 1 && (
              <span className="mx-1 h-px w-4 bg-gray-300 sm:w-6" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
