import clsx from 'clsx';
import { ReactNode } from 'react';

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        className || 'border-gray-200 bg-gray-100 text-gray-800'
      )}
    >
      {children}
    </span>
  );
}
