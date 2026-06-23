import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoLink } from "./DemoLink";
import { CtaArrowIcon } from "./CtaArrowIcon";
import { ctaButtonLift } from "./navButtonStyles";
import { WipeButton } from "./WipeButton";
import { HeroVideoControls, HeroVideoLayer } from "@/lib/hero-video";
import { MarkerCircle } from "./MarkerCircle";

export function Hero() {
  const [scrollHintOpacity, setScrollHintOpacity] = useState(1);
  const [heroInView, setHeroInView] = useState(true);

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

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const showScrollHint = heroInView && scrollHintOpacity > 0.05;

  return (
    <section id="hero" className="relative -mt-20 bg-wssu-black md:-mt-[5.5rem]">
      <div className="absolute inset-0 min-h-[100svh] overflow-hidden">
        <HeroVideoLayer />
        <div className="absolute inset-x-0 top-0 h-px bg-wssu-red/60" />
      </div>

      <div className="relative isolate z-10 flex min-h-[100svh] flex-col">
        <div className="pointer-events-none absolute right-6 top-24 z-40 flex flex-col items-end gap-4 md:right-10 md:top-28 md:gap-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-wssu-white/60">
            (00) — Winston-Salem · NC
          </span>
          <HeroVideoControls />
        </div>

        <div className="relative z-30 flex min-h-0 flex-1 flex-col">
          <div
            className="pointer-events-none shrink-0 h-[calc(5rem+2.5rem)] md:h-[calc(5.5rem+3rem)] lg:h-[calc(5.5rem+3.5rem)]"
            aria-hidden="true"
          />
          <div className="min-h-6 flex-1 shrink md:min-h-8" aria-hidden="true" />

          <div className="w-full shrink-0 pb-5 pl-5 pr-3 sm:pl-6 sm:pr-4 md:pb-6 md:pl-10 md:pr-5 lg:pl-12">
            <h1 className="font-display flex flex-col uppercase tracking-[-0.04em] text-wssu-white">
              <span className="cta-headline-light mb-2 text-5xl leading-[0.95] tracking-[-0.04em] md:mb-3 md:text-7xl">
                Future Focused Programs.
              </span>
              <span className="cta-headline-bold font-extrabold mt-0 text-[clamp(3.25rem,10.5vw,9.5rem)] leading-[0.85] md:mt-1">
                Real-World
              </span>
              <span className="cta-headline-bold font-extrabold relative inline-block w-fit text-[clamp(3.25rem,10.5vw,9.5rem)] leading-[0.9]">
                Results.
                <MarkerCircle rotate={-3} size="hero" strokeWidth={4} />
              </span>
            </h1>

            <div className="relative z-30 mt-10 flex flex-wrap items-center gap-3 md:mt-14 lg:mt-16">
              <WipeButton
                lift
                wipeFill="black"
                className="group font-display inline-flex items-center gap-3 border border-transparent bg-wssu-red px-8 py-4 text-lg uppercase tracking-[0.02em] text-wssu-white shadow-[0_8px_28px_rgba(0,0,0,0.35)] md:text-xl"
              >
                Apply
                <CtaArrowIcon />
              </WipeButton>
              <DemoLink className={cn("group font-display inline-flex items-center gap-3 border border-wssu-white/80 bg-wssu-black/35 px-8 py-4 text-lg uppercase tracking-[0.02em] text-wssu-white shadow-[0_8px_28px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-colors hover:bg-wssu-white hover:text-wssu-black md:text-xl", ctaButtonLift)}>
                Explore Programs
                <CtaArrowIcon />
              </DemoLink>
            </div>

            <div className="relative z-30 mt-10 md:mt-14">
              <p className="section-intro section-intro--dark hero-intro">
                At WSSU, your education is built for where the world is going. From nursing and bio-manufacturing to business and the arts, our programs are aligned with what employers need—and what you deserve: a career that matters.
              </p>
            </div>
          </div>
        </div>

        {showScrollHint ? (
          <div
            className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transition-[opacity,transform] duration-300 ease-out"
            style={{
              opacity: scrollHintOpacity,
              transform: `translate(-50%, ${(1 - scrollHintOpacity) * 10}px)`,
            }}
            aria-hidden={!showScrollHint}
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
        ) : null}
      </div>
    </section>
  );
}
