import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { ctaImage } from "./photos";
import { OptimizedImage } from "./OptimizedImage";
import { CtaArrowIcon } from "./CtaArrowIcon";
import { DemoLink } from "./DemoLink";
import { ctaButtonLift } from "./navButtonStyles";
import { WipeButton } from "./WipeButton";

const headlineLines = [
  { text: "Ready to join the", tone: "light" as const, delay: 80 },
  { text: "Ramily?", tone: "bold" as const, delay: 220 },
];

export function RamilyCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="apply"
      className={cn("cta-split overflow-hidden", inView && "cta-in-view")}
    >
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:min-h-[min(85vh,920px)]">
        <div className="relative min-h-[55vh] overflow-hidden lg:min-h-full">
          <OptimizedImage
            src={ctaImage}
            alt="WSSU students"
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="cta-photo absolute inset-0 block size-full object-cover object-center"
          />
        </div>

        <div className="@container -mt-px flex min-h-[55vh] min-w-0 flex-col justify-center bg-wssu-red px-8 py-14 text-wssu-black md:px-12 md:py-20 lg:mt-0 lg:min-h-full lg:px-14 lg:py-24">
          <div className="min-w-0">
            <h2 className="font-display flex w-full max-w-full flex-col uppercase tracking-[-0.04em]">
              {headlineLines.map((line) => (
                <span
                  key={line.text}
                  className={cn(
                    "cta-reveal block w-full",
                    line.tone === "light" &&
                      "cta-headline-light whitespace-nowrap text-5xl leading-[0.95] tracking-[-0.04em] md:text-7xl",
                    line.tone === "bold" &&
                      "cta-headline-bold cta-ramily-headline font-extrabold -mt-1 w-full max-w-full md:-mt-0.5",
                  )}
                  style={{ "--cta-delay": `${line.delay}ms` } as CSSProperties}
                >
                  {line.text}
                </span>
              ))}
            </h2>
            <p
              className="cta-reveal section-intro section-intro--dark mt-8"
              style={{ "--cta-delay": "400ms" } as CSSProperties}
            >
              Take the next step toward your future at WSSU.
            </p>

            <div
              className="cta-reveal mt-10 flex flex-wrap gap-3 md:mt-12"
              style={{ "--cta-delay": "500ms" } as CSSProperties}
            >
              <WipeButton
                lift
                wipeFill="red"
                className="group font-display inline-flex items-center gap-3 border border-wssu-black bg-wssu-black px-8 py-4 text-lg uppercase tracking-[0.02em] text-wssu-white transition-colors hover:text-wssu-black md:text-xl"
              >
                Apply
                <CtaArrowIcon />
              </WipeButton>
              <DemoLink
                className={cn(
                  "group font-display inline-flex items-center gap-3 border border-wssu-white/90 px-8 py-4 text-lg uppercase tracking-[0.02em] text-wssu-white transition-colors hover:bg-wssu-white hover:text-wssu-red md:text-xl",
                  ctaButtonLift,
                )}
              >
                Visit
                <CtaArrowIcon />
              </DemoLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
