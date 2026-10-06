import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="border-t border-[#E6DFD5] bg-[#12161A] text-[#FAF8F5]">
      {/* Editorial Quotation Banner */}
      <div className="border-b border-[#262D35] px-6 py-12 text-center lg:px-12">
        <p className="font-serif-luxury text-xl italic text-[#D1C7BA] md:text-2xl lg:text-3xl">
          &ldquo;Garments are the architecture of our daily lives. Treat them with curatorial reverence.&rdquo;
        </p>
        <p className="mt-3 text-xs tracking-[0.25em] text-[#8C7A6B] uppercase font-semibold">
          — The Textile Preservation Society, Issue 26
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-4 lg:gap-16">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <span className="font-serif-luxury text-2xl font-bold tracking-tight text-[#FAF8F5]">
              LAUNDRY <span className="font-light italic text-[#C8963E]">&amp;</span> VALET
            </span>
            <p className="mt-4 text-xs leading-relaxed text-[#A0988E]">
              A bespoke textile care studio offering artisanal steam pressing, organic eco-clean dry cleaning, and seamless valet delivery.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 border border-[#2E3740] px-3 py-1.5 text-[11px] font-medium tracking-wider text-[#C8963E] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
              Atelier Open for Collection
            </div>
          </div>

          {/* Pillars of Care */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] text-[#C8963E] uppercase">
              The Services
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#C5BDB2]">
              <li><Link href="/services" className="transition hover:text-white">Artisanal Steam Pressing</Link></li>
              <li><Link href="/services" className="transition hover:text-white">Eco Dry Cleaning Atelier</Link></li>
              <li><Link href="/services" className="transition hover:text-white">Fine Egyptian Linen Care</Link></li>
              <li><Link href="/services" className="transition hover:text-white">Curtain &amp; Drape Restoration</Link></li>
              <li><Link href="/services" className="transition hover:text-white">Tailored Corporate Valet</Link></li>
            </ul>
          </div>

          {/* Valet Concierge */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] text-[#C8963E] uppercase">
              Concierge
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#C5BDB2]">
              <li><Link href="/about" className="transition hover:text-white">The Atelier Story</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Collection Schedule</Link></li>
              <li><Link href="/dashboard" className="transition hover:text-white">Track Your Wardrobe</Link></li>
              <li><Link href="/login" className="transition hover:text-white">Client Portal Sign In</Link></li>
            </ul>
          </div>

          {/* Contact Dispatch */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] text-[#C8963E] uppercase">
              Atelier Dispatch
            </h4>
            <div className="mt-4 space-y-2 text-xs text-[#A0988E]">
              <p className="text-white font-medium">Lagos Metropolitan Valet</p>
              <p>Daily Pickups: 7:00 AM — 9:00 PM</p>
              <p className="text-[#C8963E]">concierge@laundryapp.com</p>
              <p className="font-mono text-[11px]">+234 (0) 800-LAUNDRY</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between border-t border-[#262D35] pt-8 text-[11px] tracking-wider text-[#736A5E] sm:flex-row">
          <p>© {new Date().getFullYear()} LAUNDRY &amp; VALET ATELIER. ALL RIGHTS RESERVED.</p>
          <p className="mt-3 sm:mt-0 uppercase font-medium">DESIGNED IN AN EDITORIAL MAGAZINE AESTHETIC</p>
        </div>
      </div>
    </footer>
  );
}
