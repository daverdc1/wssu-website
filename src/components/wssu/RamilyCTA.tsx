import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { ctaImage } from "./photos";
import { CtaArrowIcon } from "./CtaArrowIcon";
import { DemoLink } from "./DemoLink";
import { WipeButton } from "./WipeButton";

const headlineLines = ["Ready to", "join the", "Ramily?"];

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
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[min(85vh,920px)]">
        <div className="relative min-h-[55vh] overflow-hidden lg:min-h-full">
          <img
            src={ctaImage}
            alt="WSSU students"
            className="cta-photo absolute inset-0 size-full object-cover"
          />
        </div>

        <div className="@container flex min-w-0 flex-col justify-between bg-wssu-red px-8 py-14 text-wssu-black md:px-12 md:py-20 lg:px-14 lg:py-24">
          <div className="min-w-0">
            <h2 className="font-display flex w-full max-w-full flex-col gap-y-[0.02em] text-[clamp(3.25rem,24cqw,9rem)] uppercase leading-[0.9] tracking-[-0.03em]">
              {headlineLines.map((line, index) => (
                <span
                  key={line}
                  className="cta-reveal block w-full"
                  style={{ "--cta-delay": `${80 + index * 70}ms` } as CSSProperties}
                >
                  {line}
                </span>
              ))}
            </h2>
            <p
              className="cta-reveal section-intro section-intro--dark mt-8"
              style={{ "--cta-delay": "400ms" } as CSSProperties}
            >
              Take the next step toward your future at WSSU.
            </p>
          </div>

          <div
            className="cta-reveal mt-12 flex flex-wrap gap-3 lg:mt-16"
            style={{ "--cta-delay": "500ms" } as CSSProperties}
          >
            <WipeButton
              wipeFill="red"
              className="group font-display inline-flex items-center gap-3 border border-wssu-black bg-wssu-black px-8 py-4 text-lg uppercase tracking-[0.01em] text-wssu-white transition-colors hover:text-wssu-black md:text-xl"
            >
              Apply
              <CtaArrowIcon />
            </WipeButton>
            <DemoLink className="group font-display inline-flex items-center gap-3 border border-wssu-white/90 px-8 py-4 text-lg uppercase tracking-[0.01em] text-wssu-white transition-colors hover:bg-wssu-white hover:text-wssu-red md:text-xl">
              Visit
              <CtaArrowIcon />
            </DemoLink>
          </div>
        </div>
      </div>
    </section>
  );
}
