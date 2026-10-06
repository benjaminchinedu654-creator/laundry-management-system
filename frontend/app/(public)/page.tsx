import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const pillars = [
    {
      figure: '01',
      tag: 'Craftsmanship',
      title: 'Artisanal Steam Pressing',
      subtitle: 'Precision Creasing & Collar Restoration',
      desc: 'Heated brass steam plates glide effortlessly across fine Egyptian cotton, restoring natural drape and eliminating every microscopic crease without scorching fibers.',
      image: '/images/steam-pressing.jpg',
      aspect: 'Fine Egyptian Cotton, Silks & Poplin',
    },
    {
      figure: '02',
      tag: 'Tailoring',
      title: 'Bespoke Dry Cleaning',
      subtitle: 'Cashmere, Heavy Woolens & Suiting',
      desc: 'Zero harsh solvents or harsh petro-chemicals. Gentle fluid restoration that protects fabric structure, preserves lapel roll, and restores rich textile tones.',
      image: '/images/dry-cleaning.jpg',
      aspect: 'Full Suits, Overcoats & Blazers',
    },
    {
      figure: '03',
      tag: 'Sanctuary',
      title: 'Organic Linen & Bedding',
      subtitle: 'Duvets, Waffle Blankets & Pillows',
      desc: 'Thermal hypoallergenic laundering at tailored temperatures, naturally softened with botanical mineral rinses for that crisp, sun-dried boutique hotel freshness.',
      image: '/images/linen-care.jpg',
      aspect: 'Sheets, Duvets & Quilted Throws',
    },
    {
      figure: '04',
      tag: 'Concierge',
      title: 'White-Glove Doorstep Valet',
      subtitle: 'Packaged in Reusable Canvas Totes',
      desc: 'No flimsy wire hangers or single-use plastics. Your garments arrive neatly folded or hung inside breathable canvas totes with cedar protective chips.',
      image: '/images/valet-delivery.jpg',
      aspect: 'Doorstep Pickup & Hand Delivery',
    },
  ];

  const services = [
    { name: 'Classic Shirt', category: 'Wash & Iron', price: '₦500', desc: 'Hand-inspected, steam-pressed cuffs & collar' },
    { name: 'Tailored Trouser', category: 'Wash & Iron', price: '₦600', desc: 'Razor-sharp crease with gentle steam finish' },
    { name: 'Two-Piece Suit', category: 'Dry Clean', price: '₦3,000', desc: 'Delicate solvent-free refresh & structure care' },
    { name: 'Double Bedsheet', category: 'Wash & Iron', price: '₦1,500', desc: 'Deep hygienic wash with botanical crisp press' },
    { name: 'Fine Silk / Dress', category: 'Dry Clean', price: '₦2,500', desc: 'Specialized low-heat fiber conditioning' },
    { name: 'Heavy Curtain Panel', category: 'Dry Clean', price: '₦2,500', desc: 'Dust extraction, sanitization & pleated drape' },
  ];

  const steps = [
    {
      num: 'I',
      title: 'The Doorstep Rendezvous',
      tagline: 'Scheduled at Your Convenience',
      text: 'Select your preferred pickup window. Our uniformed valet concierge arrives at your residence with our signature garment collection bag.',
    },
    {
      num: 'II',
      title: 'The Atelier Inspection & Clean',
      tagline: 'Individual Textile Assessment',
      text: 'Garments are categorized by fiber density and weave, stain-treated by hand, washed in pH-balanced eco formulations, and artisanal steam pressed.',
    },
    {
      num: 'III',
      title: 'Wardrobe-Ready Return',
      tagline: 'Delivered Fresh & Fragrant',
      text: 'Returned on contoured wooden hangers or precision folded in eco-packaging, ready to immediately step back into your wardrobe rotation.',
    },
  ];

  return (
    <div className="bg-[#FAF8F5] text-[#1A1A1A]">
      {/* 1. HERO MAGAZINE COVER SPREAD */}
      <section className="border-b border-[#E6DFD5] px-6 py-12 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-7xl">
          {/* Masthead Header */}
          <div className="flex flex-col items-start justify-between gap-4 border-b border-[#E6DFD5] pb-6 md:flex-row md:items-end">
            <div>
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#8C6D46] uppercase">
                THE ATELIER DISPATCH · EDITION N° 26
              </span>
              <p className="mt-1 font-serif-luxury text-sm italic text-[#6B5E51]">
                A journal on garment longevity, artisanal steam care, and fine living.
              </p>
            </div>
            <div className="text-right text-[11px] font-semibold tracking-widest text-[#8C7A6B] uppercase">
              METROPOLITAN VALET SERVICE · EST. 2026
            </div>
          </div>

          {/* Main Hero Headline Grid */}
          <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h1 className="font-serif-luxury text-4xl font-extrabold leading-[1.08] tracking-tight text-[#111827] sm:text-5xl md:text-6xl lg:text-[68px]">
                The Architecture of <span className="font-light italic text-[#8C6D46]">Pristine Living</span> &amp; Textile Care.
              </h1>
              <p className="editorial-lead mt-6 text-base leading-relaxed text-[#4A4036] md:text-lg">
                We believe what touches your skin each morning should feel restorative. Our master laundry and dry cleaning atelier combines traditional steam pressing with modern organic garment care, delivered directly to your doorstep.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center border border-[#1A1A1A] bg-[#1A1A1A] px-8 py-4 text-xs font-bold tracking-[0.2em] text-[#FAF8F5] uppercase shadow-lg transition duration-200 hover:bg-[#8C6D46] hover:border-[#8C6D46]"
                >
                  Schedule First Pickup
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center border border-[#B8AC9C] bg-transparent px-8 py-4 text-xs font-bold tracking-[0.2em] text-[#1A1A1A] uppercase transition duration-200 hover:bg-[#F4EFEB] hover:border-[#1A1A1A]"
                >
                  Explore Garment Menu
                </Link>
              </div>

              {/* Editorial Badges */}
              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-[#E6DFD5] pt-6 text-[11px] font-semibold tracking-wider text-[#6B5E51] uppercase">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#10B981]"></span>
                  <span>100% Organic Solvent Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#8C6D46]"></span>
                  <span>Same-Day Valet Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#3B82F6]"></span>
                  <span>Live Wardrobe Tracking</span>
                </div>
              </div>
            </div>

            {/* Hero Cover Photography */}
            <div className="lg:col-span-5">
              <div className="relative border border-[#E6DFD5] bg-[#F4EFEB] p-3 shadow-2xl">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E6DFD5] sm:aspect-[16/11]">
                  <Image
                    src="/images/hero-editorial.jpg"
                    alt="Pristine folded linens in a sunlit modern laundry studio"
                    fill
                    priority
                    className="object-cover transition duration-700 hover:scale-105"
                  />
                </div>
                {/* Image Caption & Stamp */}
                <div className="mt-3 flex items-center justify-between px-1 text-[10px] tracking-wider text-[#6B5E51] uppercase">
                  <span>FIG. 01 — THE SUNLIT CARE ATELIER</span>
                  <span className="font-mono font-bold text-[#8C6D46]">LAGOS VALET</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL STORIES: THE FOUR PILLARS */}
      <section className="border-b border-[#E6DFD5] px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-[11px] font-bold tracking-[0.3em] text-[#8C6D46] uppercase">
              CURATED METHODS · ARCHITECTURAL FINISH
            </span>
            <h2 className="mt-2 font-serif-luxury text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
              The Four Pillars of Garment Care
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#6B5E51]">
              Every textile possesses a distinct memory. Our artisanal processes restore elasticity, softness, and vibrancy to every thread.
            </p>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((item) => (
              <article
                key={item.figure}
                className="group flex flex-col border border-[#E6DFD5] bg-[#FFFFFF] p-4 transition duration-300 hover:border-[#8C6D46] hover:shadow-xl"
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4EFEB]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 bg-[#1A1A1A]/85 px-2.5 py-1 text-[9px] font-bold tracking-widest text-[#FAF8F5] uppercase">
                    FIG. {item.figure}
                  </div>
                </div>

                {/* Content */}
                <div className="mt-5 flex flex-1 flex-col">
                  <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-[#8C6D46] uppercase">
                    <span>{item.tag}</span>
                    <span className="text-[#A0988E]">{item.aspect}</span>
                  </div>

                  <h3 className="mt-2 font-serif-luxury text-xl font-bold text-[#111827] group-hover:text-[#8C6D46]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-[#8C7A6B]">
                    {item.subtitle}
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-[#4A4036]">
                    {item.desc}
                  </p>

                  <div className="mt-auto pt-6">
                    <Link
                      href="/services"
                      className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#1A1A1A] uppercase hover:text-[#8C6D46]"
                    >
                      <span>Explore Rates</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE LIVE PRICE MENU (MAGAZINE STYLE SPREAD) */}
      <section className="border-b border-[#E6DFD5] bg-[#F4EFEB] px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-[#D6CCC0] pb-6 sm:flex-row sm:items-end">
            <div>
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#8C6D46] uppercase">
                TRANSPARENT TARIFF · AUTUMN 2026
              </span>
              <h2 className="mt-2 font-serif-luxury text-3xl font-bold text-[#111827] sm:text-4xl">
                The Curated Textile Care Menu
              </h2>
            </div>
            <Link
              href="/services"
              className="border border-[#1A1A1A] bg-[#1A1A1A] px-5 py-2.5 text-xs font-bold tracking-[0.15em] text-[#FAF8F5] uppercase transition hover:bg-[#8C6D46] hover:border-[#8C6D46]"
            >
              View Full Atelier Catalog
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between border border-[#D6CCC0] bg-[#FAF8F5] p-6 transition duration-200 hover:border-[#1A1A1A]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest text-[#8C7A6B] uppercase">
                      {s.category}
                    </span>
                    <span className="font-serif-luxury text-2xl font-black text-[#1A1A1A]">
                      {s.price}
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif-luxury text-lg font-bold text-[#111827]">
                    {s.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#6B5E51]">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 border-t border-[#E6DFD5] pt-4">
                  <Link
                    href="/register"
                    className="flex w-full items-center justify-between text-xs font-bold tracking-wider text-[#8C6D46] uppercase transition hover:text-[#111827]"
                  >
                    <span>Schedule For This Item</span>
                    <span>&plus;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE 3-STEP RITUAL OF VALET CARE */}
      <section className="border-b border-[#E6DFD5] px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-[11px] font-bold tracking-[0.3em] text-[#8C6D46] uppercase">
              EFFORTLESS LIVING · DOORSTEP VALET
            </span>
            <h2 className="mt-2 font-serif-luxury text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
              How the Valet Operates
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((st) => (
              <div
                key={st.num}
                className="relative flex flex-col border border-[#E6DFD5] bg-[#FFFFFF] p-8"
              >
                <div className="font-serif-luxury text-4xl font-black text-[#D6CCC0]">
                  {st.num}
                </div>
                <h3 className="mt-4 font-serif-luxury text-xl font-bold text-[#111827]">
                  {st.title}
                </h3>
                <p className="mt-1 text-[11px] font-bold tracking-wider text-[#8C6D46] uppercase">
                  {st.tagline}
                </p>
                <p className="mt-4 text-xs leading-relaxed text-[#4A4036]">
                  {st.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL PULL-QUOTE / PRESS HIGHLIGHT */}
      <section className="bg-[#12161A] px-6 py-20 text-[#FAF8F5] lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-[11px] font-bold tracking-[0.3em] text-[#C8963E] uppercase">
            THE METROPOLITAN JOURNAL · REVIEW
          </span>
          <blockquote className="mt-6 font-serif-luxury text-2xl font-light italic leading-snug sm:text-3xl md:text-4xl">
            &ldquo;A revelation for busy professionals. Every cuff, lapel, and duvet returns looking as though it just stepped out of a private bespoke workshop.&rdquo;
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-[#333D47]"></span>
            <span className="text-xs font-semibold tracking-widest text-[#A0988E] uppercase">
              THE STYLE &amp; LIVING COMPILATION
            </span>
            <span className="h-px w-12 bg-[#333D47]"></span>
          </div>
        </div>
      </section>

      {/* 6. GRAND CLOSING CALL TO ACTION */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-5xl border border-[#1A1A1A] bg-[#1A1A1A] p-10 text-center text-[#FAF8F5] shadow-2xl sm:p-16">
          <span className="text-[11px] font-bold tracking-[0.3em] text-[#C8963E] uppercase">
            BEGIN YOUR WARDROBE RITUAL
          </span>
          <h2 className="mt-3 font-serif-luxury text-3xl font-bold sm:text-4xl md:text-5xl">
            Elevate How You Wear &amp; Live.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-[#C5BDB2] sm:text-sm">
            Create your account today. Your first collection includes a complimentary reusable canvas tote and cedar garment sachet.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="border border-[#C8963E] bg-[#C8963E] px-8 py-4 text-xs font-bold tracking-[0.2em] text-[#12161A] uppercase transition hover:bg-[#FAF8F5] hover:border-[#FAF8F5]"
            >
              Book Complimentary Valet
            </Link>
            <Link
              href="/services"
              className="border border-[#4A5568] bg-transparent px-8 py-4 text-xs font-bold tracking-[0.2em] text-[#FAF8F5] uppercase transition hover:bg-[#2D3748]"
            >
              Browse Full Tariff
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
