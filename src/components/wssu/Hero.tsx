import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { DemoLink } from "./DemoLink";
import { CtaArrowIcon } from "./CtaArrowIcon";
import { WipeButton } from "./WipeButton";
import { HeroVideoControls, HeroVideoLayer } from "@/lib/hero-video";
import { MarkerCircle } from "./MarkerCircle";

export function Hero() {
  const [scrollHintOpacity, setScrollHintOpacity] = useState(1);

  useEffect(() => {
    const fadeDistance = 88;

    const onScroll = () => {
      const progress = Math.min(1, window.scrollY / fadeDistance);
      const eased = 1 - (1 - progress) ** 3;
      setScrollHintOpacity(1 - eased);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="hero" className="relative bg-wssu-black">
      <div className="absolute inset-0 min-h-[100svh] overflow-hidden">
        <HeroVideoLayer />
        <div className="absolute inset-x-0 top-0 h-px bg-wssu-red/60" />
      </div>

      <div className="relative isolate z-10 flex min-h-[100svh] flex-col">
        <div className="absolute right-6 top-6 z-30 font-mono text-[10px] uppercase tracking-[0.3em] text-wssu-white/60 md:right-10 md:top-10">
          (00) — Winston-Salem · NC
        </div>

        <div className="relative z-30 flex flex-1 flex-col">
          <div className="pointer-events-none h-20 shrink-0 md:h-24 lg:h-28" aria-hidden="true" />

          <div className="section-container mt-auto w-full pb-28 md:pb-32">
            <h1 className="font-display flex flex-col uppercase text-wssu-white">
              <span className="text-[clamp(1.875rem,4vw,4rem)] leading-[0.95] tracking-[-0.025em]">
                <span className="block">Future Focused</span>
                <span className="block">Programs.</span>
              </span>
              <span className="mt-4 text-[clamp(3rem,10vw,9rem)] leading-[0.9] tracking-[-0.025em] md:mt-6">
                Real-World
              </span>
              <span className="relative inline-block w-fit text-[clamp(3rem,10vw,9rem)] leading-[0.9] tracking-[-0.025em]">
                Results.
                <MarkerCircle rotate={-3} size="hero" strokeWidth={4} />
              </span>
            </h1>

            <div className="relative z-30 mt-14 flex flex-wrap items-center gap-3 md:mt-20">
            <WipeButton
              wipeFill="black"
              className="group font-display inline-flex items-center gap-3 border border-transparent bg-wssu-red px-8 py-4 text-lg uppercase tracking-[0.01em] text-wssu-white shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5 md:text-xl"
            >
              Apply
              <CtaArrowIcon />
            </WipeButton>
            <DemoLink className="group font-display inline-flex items-center gap-3 border border-wssu-white/80 bg-wssu-black/35 px-8 py-4 text-lg uppercase tracking-[0.01em] text-wssu-white shadow-[0_8px_28px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-colors hover:bg-wssu-white hover:text-wssu-black md:text-xl">
              Explore Programs
              <CtaArrowIcon />
            </DemoLink>
            </div>

            <div className="relative z-30 mt-10 flex gap-6 md:mt-14 md:gap-8">
              <div className="w-px shrink-0 self-stretch bg-wssu-white/20" aria-hidden="true" />
              <p className="section-intro section-intro--dark">
                At WSSU, your education is built for where the world is going. From nursing and bio-manufacturing to business and the arts, our programs are aligned with what employers need—and what you deserve: a career that matters.
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-40 px-6 md:px-10">
          <div className="section-container relative">
            <div className="pointer-events-auto flex justify-end">
              <HeroVideoControls />
            </div>

            <div
              className="pointer-events-none absolute bottom-0 left-1/2 transition-[opacity,transform] duration-300 ease-out"
              style={{
                opacity: scrollHintOpacity,
                transform: `translate(-50%, ${(1 - scrollHintOpacity) * 10}px)`,
              }}
              aria-hidden={scrollHintOpacity < 0.05}
            >
              <div className="hero-scroll-indicator flex flex-col items-center gap-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.38em] text-wssu-white/70">
                  Scroll
                </span>
                <span className="relative flex h-6 w-px items-start justify-center bg-wssu-white/30">
                  <span className="hero-scroll-line size-1.5 rounded-full bg-wssu-white" />
                </span>
                <ChevronDown
                  className="hero-scroll-chevron size-3.5 text-wssu-white/65"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
