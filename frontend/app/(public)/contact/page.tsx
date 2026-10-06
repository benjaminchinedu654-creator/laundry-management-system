import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="bg-[#FAF8F5] text-[#1A1A1A]">
      <section className="border-b border-[#E6DFD5] px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-[11px] font-bold tracking-[0.3em] text-[#8C6D46] uppercase">
            ATELIER VALET CONCIERGE · METROPOLITAN DISPATCH
          </span>
          <h1 className="mt-4 font-serif-luxury text-4xl font-extrabold text-[#111827] sm:text-5xl">
            Inquiries &amp; Bespoke Collections
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#6B5E51]">
            Our concierge team coordinates door-to-door garment pickup, commercial accounts, and specialized wardrobe care.
          </p>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          {/* Dispatch Cards */}
          <div className="border border-[#E6DFD5] bg-[#FFFFFF] p-8">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C6D46] uppercase">
              CLIENT SERVICES
            </span>
            <h2 className="mt-2 font-serif-luxury text-2xl font-bold text-[#111827]">
              Concierge Desk
            </h2>
            <div className="mt-6 space-y-4 text-xs text-[#4A4036]">
              <div>
                <p className="font-bold text-[#111827] uppercase tracking-wider text-[11px]">Direct Electronic Mail</p>
                <p className="mt-1 text-sm text-[#8C6D46] font-mono">concierge@laundryapp.com</p>
              </div>
              <div className="border-t border-[#EAE3D9] pt-4">
                <p className="font-bold text-[#111827] uppercase tracking-wider text-[11px]">Direct Valet Line</p>
                <p className="mt-1 text-sm text-[#111827] font-mono">+234 (0) 800-LAUNDRY</p>
              </div>
              <div className="border-t border-[#EAE3D9] pt-4">
                <p className="font-bold text-[#111827] uppercase tracking-wider text-[11px]">Operating Hours</p>
                <p className="mt-1">Monday through Saturday: 7:00 AM — 9:00 PM</p>
                <p>Sunday: 10:00 AM — 6:00 PM (Express Valet Only)</p>
              </div>
            </div>
          </div>

          {/* Service Area Card */}
          <div className="border border-[#E6DFD5] bg-[#F4EFEB] p-8">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C6D46] uppercase">
              COVERAGE ZONES
            </span>
            <h2 className="mt-2 font-serif-luxury text-2xl font-bold text-[#111827]">
              Metropolitan Delivery Area
            </h2>
            <p className="mt-4 text-xs leading-relaxed text-[#4A4036]">
              Our valets operate daily scheduled collection routes across major residential and corporate sectors.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-[#111827]">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
                <span className="font-semibold">Zone 1:</span> Victoria Island, Ikoyi, Lekki Phase 1
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
                <span className="font-semibold">Zone 2:</span> Ikeja GRA, Maryland, Magodo
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
                <span className="font-semibold">Zone 3:</span> Surulere, Yaba, Gbagada
              </li>
            </ul>

            <div className="mt-8 border-t border-[#D6CCC0] pt-6">
              <Link
                href="/register"
                className="inline-block border border-[#1A1A1A] bg-[#1A1A1A] px-6 py-3 text-xs font-bold tracking-[0.2em] text-[#FAF8F5] uppercase transition hover:bg-[#8C6D46] hover:border-[#8C6D46]"
              >
                Schedule Doorstep Collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
