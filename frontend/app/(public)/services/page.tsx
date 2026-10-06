'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ServiceListResponse } from '@/types/service';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/format';

export default function ServicesPage() {
  const [data, setData] = useState<ServiceListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .listServices()
      .then((res) => { if (mounted) setData(res); })
      .catch((e: Error) => { if (mounted) setError(e.message); });
    return () => { mounted = false; };
  }, []);

  const categoryImages: Record<string, string> = {
    'Wash & Iron': '/images/steam-pressing.jpg',
    'Dry Clean': '/images/dry-cleaning.jpg',
    'Iron Only': '/images/hero-editorial.jpg',
    'Specialty': '/images/linen-care.jpg',
  };

  const categoryDescriptions: Record<string, string> = {
    'Wash & Iron': 'Precision steam gliding over hand-washed garments. Crisp cuffs, collar restoration, and zero scorching.',
    'Dry Clean': 'Eco-solvent non-toxic cleansing designed specifically for bespoke suiting, fine cashmere, silks, and heavy woolens.',
    'Iron Only': 'Heated artisanal press for freshly laundered garments requiring sharp creases and immaculate drape.',
    'Specialty': 'Deep hygiene thermal treatment for organic linens, duvet covers, and heavy curtain panels.',
  };

  if (error)
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <EmptyState title="Couldn't load services catalog" description={error} />
      </div>
    );

  if (!data) return <PageSpinner />;

  const categories = Object.keys(data.grouped);

  return (
    <div className="bg-[#FAF8F5] text-[#1A1A1A]">
      {/* Editorial Header */}
      <section className="border-b border-[#E6DFD5] px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-6 border-b border-[#E6DFD5] pb-8 md:flex-row md:items-end">
            <div>
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#8C6D46] uppercase">
                THE ATELIER TARIFF · ALL-INCLUSIVE RATES
              </span>
              <h1 className="mt-2 font-serif-luxury text-4xl font-extrabold text-[#111827] sm:text-5xl">
                Curated Garment &amp; Textile Services
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6B5E51]">
                Every piece is inspected upon collection, matched with its ideal cleaning technique, hand-pressed, and returned in pristine condition. Zero hidden fees.
              </p>
            </div>
            <Link
              href="/register"
              className="border border-[#1A1A1A] bg-[#1A1A1A] px-6 py-3.5 text-xs font-bold tracking-[0.2em] text-[#FAF8F5] uppercase transition hover:bg-[#8C6D46] hover:border-[#8C6D46]"
            >
              Book Valet Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Main Services Categories */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        {categories.length === 0 ? (
          <EmptyState title="No services currently listed" />
        ) : (
          <div className="space-y-20">
            {categories.map((cat) => {
              const catImage = categoryImages[cat] || '/images/hero-editorial.jpg';
              const catDesc = categoryDescriptions[cat] || 'Artisanal care tailored to delicate wardrobe fibers.';

              return (
                <section key={cat} className="border border-[#E6DFD5] bg-[#FFFFFF] p-6 lg:p-10">
                  {/* Category Header with Editorial Photo Banner */}
                  <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F4EFEB] lg:col-span-4">
                      <Image
                        src={catImage}
                        alt={cat}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-[#1A1A1A]/85 px-3 py-1 text-[10px] font-bold tracking-widest text-[#FAF8F5] uppercase">
                        ATELIER DEPT.
                      </div>
                    </div>

                    <div className="lg:col-span-8">
                      <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C6D46] uppercase">
                        CATEGORY OVERVIEW
                      </span>
                      <h2 className="mt-1 font-serif-luxury text-2xl font-bold text-[#111827] sm:text-3xl">
                        {cat}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-[#6B5E51]">
                        {catDesc}
                      </p>
                    </div>
                  </div>

                  {/* Garment Price Cards Grid */}
                  <div className="mt-8 grid gap-4 border-t border-[#E6DFD5] pt-8 sm:grid-cols-2 lg:grid-cols-3">
                    {data.grouped[cat].map((s) => (
                      <div
                        key={s.id}
                        className="flex flex-col justify-between border border-[#EAE3D9] bg-[#FAF8F5] p-5 transition duration-200 hover:border-[#8C6D46]"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-serif-luxury text-lg font-bold text-[#111827]">
                              {s.name}
                            </h3>
                            <span className="font-serif-luxury text-xl font-black text-[#1A1A1A]">
                              {formatCurrency(s.unit_price)}
                            </span>
                          </div>
                          {s.description && (
                            <p className="mt-2 text-xs leading-relaxed text-[#6B5E51]">
                              {s.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-5 border-t border-[#E6DFD5] pt-3">
                          <Link
                            href="/register"
                            className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider text-[#8C6D46] uppercase hover:text-[#111827]"
                          >
                            <span>Add to Collection</span>
                            <span>&rarr;</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Fabric Guarantee Banner */}
      <section className="border-t border-[#E6DFD5] bg-[#F4EFEB] px-6 py-16 text-center lg:px-12">
        <div className="mx-auto max-w-3xl">
          <span className="text-[11px] font-bold tracking-[0.3em] text-[#8C6D46] uppercase">
            THE ATELIER PROMISE
          </span>
          <h3 className="mt-2 font-serif-luxury text-2xl font-bold text-[#111827] sm:text-3xl">
            100% Fiber Wellness Guarantee
          </h3>
          <p className="mt-3 text-xs leading-relaxed text-[#6B5E51] sm:text-sm">
            Should any garment not meet your exacting standards of cleanliness and pressing, our concierge valet will collect and re-press the item with our compliments.
          </p>
          <div className="mt-6">
            <Link
              href="/register"
              className="inline-block border border-[#1A1A1A] bg-[#1A1A1A] px-8 py-3.5 text-xs font-bold tracking-[0.2em] text-[#FAF8F5] uppercase transition hover:bg-[#8C6D46] hover:border-[#8C6D46]"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
