'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PageSpinner } from '@/components/ui/Spinner';
import { TopBar } from '@/components/layout/TopBar';
import { CustomerSidebar } from '@/components/layout/CustomerSidebar';
import clsx from 'clsx';

const links = [
  { href: '/dashboard',     label: 'Dashboard' },
  { href: '/orders',        label: 'My orders' },
  { href: '/orders/new',    label: 'New order' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/profile',       label: 'Profile' },
];

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading) return <PageSpinner />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar onMobileMenu={() => setMobileOpen(true)} />

      <div className="mx-auto flex max-w-7xl">
        <CustomerSidebar />

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <span className="font-semibold text-blue-700">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100"
                >
                  &#x2715;
                </button>
              </div>
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
                        'rounded-lg px-3 py-2 text-sm font-medium',
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
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
