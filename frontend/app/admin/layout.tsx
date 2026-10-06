'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PageSpinner } from '@/components/ui/Spinner';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import Button from '@/components/ui/Button';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { admin, loading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;
    if (!loading && !admin) router.replace('/admin/login');
  }, [loading, admin, isLoginPage, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Login page: bare layout, no shell
  if (isLoginPage) return <>{children}</>;

  if (loading) return <PageSpinner />;
  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            className="rounded p-1 text-gray-600 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            &#9776;
          </button>
          <Link
            href="/admin/dashboard"
            className="text-base font-bold text-blue-700"
          >
            LaundryApp &middot; Admin
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-gray-900">
              {admin.full_name}
            </p>
            <p className="text-[11px] text-gray-500">{admin.email}</p>
          </div>
          <Button size="sm" variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white md:block">
          <AdminSidebar />
        </aside>

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
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
