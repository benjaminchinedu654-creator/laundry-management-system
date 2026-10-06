'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/notification/NotificationBell';
import Button from '@/components/ui/Button';

export function TopBar({ onMobileMenu }: { onMobileMenu?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        {onMobileMenu && (
          <button
            className="rounded p-1 text-gray-600 hover:bg-gray-100 md:hidden"
            onClick={onMobileMenu}
            aria-label="Open menu"
          >
            &#9776;
          </button>
        )}
        <Link href="/dashboard" className="text-base font-bold text-blue-700">
          LaundryApp
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="hidden text-right sm:block">
          <p className="text-xs font-medium text-gray-900">{user?.full_name}</p>
          <p className="text-[11px] text-gray-500">{user?.email}</p>
        </div>
        <Button size="sm" variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
