export function TrustStrip() {
  const logos = [
    { name: "Scale", font: "font-mono font-bold tracking-tight text-xl" },
    { name: "coinbase", font: "font-sans font-bold tracking-tighter text-xl" },
    { name: "storyblok", font: "font-sans font-extrabold tracking-tight text-lg" },
    { name: "AngelList", font: "font-serif font-bold text-lg" },
    { name: "Raycast", font: "font-mono font-semibold tracking-wide text-base" },
    { name: "▲ Vercel", font: "font-sans font-black tracking-tight text-lg" },
    { name: "flexport", font: "font-sans font-extrabold tracking-tighter text-xl lowercase" },
    { name: "BREX", font: "font-sans font-black tracking-widest text-base" },
    { name: "ramp", font: "font-serif font-bold italic text-lg" },
    { name: "supabase", font: "font-mono font-bold text-base" },
  ];

  return (
    <section className="relative border-y border-[#E5E7EB] bg-white py-12 overflow-hidden">
      {/* Subtle Cal.com corner crosshairs */}
      <div className="absolute top-[-9px] left-8 text-[#9CA3AF] text-sm font-light select-none">+</div>
      <div className="absolute top-[-9px] right-8 text-[#9CA3AF] text-sm font-light select-none">+</div>
      <div className="absolute bottom-[-9px] left-8 text-[#9CA3AF] text-sm font-light select-none">+</div>
      <div className="absolute bottom-[-9px] right-8 text-[#9CA3AF] text-sm font-light select-none">+</div>

      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Label */}
          <div className="text-xs font-semibold text-[#6B7280] shrink-0 text-center lg:text-left leading-relaxed max-w-[240px]">
            Trusted by fast-growing enterprise operations around the world
          </div>

          {/* Sliding Infinite Marquee Track (Left-to-Right) */}
          <div className="relative w-full overflow-hidden mask-fade-x">
            <div className="animate-slide-left-to-right flex items-center gap-12 sm:gap-16 text-[#111827] opacity-80 select-none">
              {/* First Set of Logos */}
              {logos.map((logo, i) => (
                <span
                  key={`logo-1-${i}`}
                  className={`${logo.font} whitespace-nowrap hover:opacity-100 transition-opacity cursor-default`}
                >
                  {logo.name}
                </span>
              ))}

              {/* Duplicate Set for Seamless Continuous Infinite Loop */}
              {logos.map((logo, i) => (
                <span
                  key={`logo-2-${i}`}
                  className={`${logo.font} whitespace-nowrap hover:opacity-100 transition-opacity cursor-default`}
                >
                  {logo.name}
                </span>
              ))}

              {/* Triplicate Set for ultra-wide screen coverage */}
              {logos.map((logo, i) => (
                <span
                  key={`logo-3-${i}`}
                  className={`${logo.font} whitespace-nowrap hover:opacity-100 transition-opacity cursor-default`}
                >
                  {logo.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
