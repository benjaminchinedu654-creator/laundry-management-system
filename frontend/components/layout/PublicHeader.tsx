'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function PublicHeader() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[#E6DFD5] bg-[#FAF8F5]/90 backdrop-blur-md">
      {/* Top Editorial Ticker Bar */}
      <div className="border-b border-[#EAE3D9] bg-[#F4EFEB] px-4 py-1.5 text-center text-[11px] font-medium tracking-[0.2em] text-[#6B5E51] uppercase">
        <span>Artisanal Valet &amp; Textile Care · Same-Day Doorstep Collection · Organic Fabric Wellness</span>
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Brand Logo */}
        <Link href="/" className="group flex flex-col">
          <span className="font-serif-luxury text-2xl font-bold tracking-tight text-[#1A1A1A] transition group-hover:text-[#8C6D46]">
            LAUNDRY <span className="font-light italic">&amp;</span> VALET
          </span>
          <span className="text-[9px] font-semibold tracking-[0.3em] text-[#8C7A6B] uppercase">
            Curated Garment Care
          </span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-xs font-semibold tracking-[0.15em] text-[#4A4036] uppercase transition hover:text-[#8C6D46]">
            Atelier
          </Link>
          <Link href="/services" className="text-xs font-semibold tracking-[0.15em] text-[#4A4036] uppercase transition hover:text-[#8C6D46]">
            Services &amp; Rates
          </Link>
          <Link href="/about" className="text-xs font-semibold tracking-[0.15em] text-[#4A4036] uppercase transition hover:text-[#8C6D46]">
            Our Craft
          </Link>
          <Link href="/contact" className="text-xs font-semibold tracking-[0.15em] text-[#4A4036] uppercase transition hover:text-[#8C6D46]">
            Concierge
          </Link>
        </nav>

        {/* User Account Controls */}
        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-none border border-[#1A1A1A] bg-[#1A1A1A] px-5 py-2 text-xs font-semibold tracking-[0.12em] text-[#FAF8F5] uppercase transition hover:bg-[#8C6D46] hover:border-[#8C6D46]"
              >
                Client Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-3 py-2 text-xs font-semibold tracking-[0.12em] text-[#6B5E51] uppercase hover:text-[#1A1A1A]"
              >
                Exit
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden px-4 py-2 text-xs font-semibold tracking-[0.15em] text-[#4A4036] uppercase transition hover:text-[#8C6D46] sm:inline-block"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center border border-[#1A1A1A] bg-[#1A1A1A] px-5 py-2.5 text-xs font-semibold tracking-[0.15em] text-[#FAF8F5] uppercase shadow-sm transition hover:bg-[#8C6D46] hover:border-[#8C6D46]"
              >
                Book Valet
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
