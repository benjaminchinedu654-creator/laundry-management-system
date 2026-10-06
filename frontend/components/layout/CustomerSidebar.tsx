'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { href: '/dashboard',     label: 'Dashboard' },
  { href: '/orders',        label: 'My orders' },
  { href: '/orders/new',    label: 'New order' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/profile',       label: 'Profile' },
];

export function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white md:block">
      <nav className="flex flex-col gap-1 p-4">
        {links.map((l) => {
          const active =
            pathname === l.href ||
            (l.href !== '/dashboard' && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
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
    </aside>
  );
}
