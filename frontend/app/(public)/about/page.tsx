import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-[#FAF8F5] text-[#1A1A1A]">
      {/* Editorial Header */}
      <section className="border-b border-[#E6DFD5] px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-5xl text-center">
          <span className="text-[11px] font-bold tracking-[0.3em] text-[#8C6D46] uppercase">
            THE ATELIER MANIFESTO · PHILOSOPHY &amp; CRAFT
          </span>
          <h1 className="mt-4 font-serif-luxury text-4xl font-extrabold tracking-tight text-[#111827] sm:text-5xl md:text-6xl">
            Preserving the Narrative of What You Wear.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#6B5E51]">
            We started with a quiet rebellion against harsh industrial laundries, plastic wrap, and burned shirt collars. We created an atelier centered on textile wellness, artisanal steam, and effortless valet convenience.
          </p>
        </div>
      </section>

      {/* Editorial Story Spread */}
      <section className="border-b border-[#E6DFD5] px-6 py-20 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C6D46] uppercase">
              CHAPTER I — THE RITUAL
            </span>
            <h2 className="mt-2 font-serif-luxury text-3xl font-bold text-[#111827] sm:text-4xl">
              More Than Clean Clothes. A Wardrobe Reborn.
            </h2>
            <p className="editorial-lead mt-6 text-sm leading-relaxed text-[#4A4036] sm:text-base">
              The feeling of slipping into a crisp, fragrant cotton shirt with a perfectly rolled collar changes the posture of your entire morning. Modern garments endure intense wear, pollution, and hasty washing. Our mission is to reverse that wear and extend each garment’s lifespan by years.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#4A4036]">
              Every garment arriving at our facility undergoes a preliminary fiber diagnosis. Delicate silks, high-twist worsted wools, and organic linens each receive bespoke bath temperatures and pH-balanced plant-derived detergents.
            </p>

            <div className="mt-8 border-l-2 border-[#8C6D46] pl-4 italic font-serif-luxury text-base text-[#6B5E51]">
              &ldquo;We don’t treat laundry as an unavoidable chore. We treat it as textile conservation.&rdquo;
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative border border-[#E6DFD5] bg-[#FFFFFF] p-3 shadow-xl">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4EFEB]">
                <Image
                  src="/images/steam-pressing.jpg"
                  alt="Artisanal pressing craft"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="mt-2 text-center text-[10px] tracking-wider text-[#8C7A6B] uppercase">
                FIG. 02 — HEATED ARTISANAL PRESSING &amp; HAND COLLAR ALIGNMENT
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Core Tenets */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-[11px] font-bold tracking-[0.3em] text-[#8C6D46] uppercase">
              OUR FOUNDATIONAL CODE
            </span>
            <h2 className="mt-2 font-serif-luxury text-3xl font-bold text-[#111827] sm:text-4xl">
              Three Non-Negotiable Standards
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="border border-[#E6DFD5] bg-[#FFFFFF] p-8">
              <span className="font-serif-luxury text-3xl font-bold text-[#8C6D46]">01</span>
              <h3 className="mt-3 font-serif-luxury text-xl font-bold text-[#111827]">Zero Harsh Petro-Solvents</h3>
              <p className="mt-3 text-xs leading-relaxed text-[#4A4036]">
                Traditional perchloroethylene dry-cleaning degrades cloth fibers and leaves noxious chemical residues. We exclusively use biodegradable, organic fluid processes.
              </p>
            </div>

            <div className="border border-[#E6DFD5] bg-[#FFFFFF] p-8">
              <span className="font-serif-luxury text-3xl font-bold text-[#8C6D46]">02</span>
              <h3 className="mt-3 font-serif-luxury text-xl font-bold text-[#111827]">Hand-Button &amp; Seam Care</h3>
              <p className="mt-3 text-xs leading-relaxed text-[#4A4036]">
                Every button is inspected. Loose threads are trimmed, buttons gently reinforced, and pocket linings thoroughly smoothed before any garment leaves our care.
              </p>
            </div>

            <div className="border border-[#E6DFD5] bg-[#FFFFFF] p-8">
              <span className="font-serif-luxury text-3xl font-bold text-[#8C6D46]">03</span>
              <h3 className="mt-3 font-serif-luxury text-xl font-bold text-[#111827]">Breathable Sustainable Valet</h3>
              <p className="mt-3 text-xs leading-relaxed text-[#4A4036]">
                Never trapped in moisture-trapping single-use plastic. We package in breathable linen garment covers and recyclable cedar kraft boxes.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/register"
              className="inline-block border border-[#1A1A1A] bg-[#1A1A1A] px-8 py-4 text-xs font-bold tracking-[0.2em] text-[#FAF8F5] uppercase transition hover:bg-[#8C6D46] hover:border-[#8C6D46]"
            >
              Experience The Atelier Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
