'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/orders',    label: 'Orders' },
  { href: '/admin/users',     label: 'Customers' },
  { href: '/admin/services',  label: 'Services' },
  { href: '/admin/payments',  label: 'Payments' },
  { href: '/admin/reports',   label: 'Reports' },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4">
      {links.map((l) => {
        const active =
          pathname === l.href || pathname.startsWith(l.href + '/');
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={clsx(
              'rounded-lg px-3 py-2 text-sm font-medium transition',
              active
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
