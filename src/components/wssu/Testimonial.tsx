import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useHorizontalSwipe } from "@/hooks/use-horizontal-swipe";
import { OptimizedImage } from "./OptimizedImage";
import { ConnectedArrowControls } from "./ConnectedArrowControls";
import { SectionIndicators } from "./SectionIndicators";
import { SectionHeaderLabelRow } from "./SectionHeaderGrid";
import { testimonialSlides } from "./photos";

const AUTO_MS = 6000;

const slides = [
  {
    image: testimonialSlides[0],
    objectPosition: "center",
    quote:
      "WSSU prepared me to step into nursing with real confidence — ready to advocate for myself and my patients. The values I learned here will guide every shift I work.",
    name: "Jade Green BSN, RN",
    role: "2026 Graduate",
  },
  {
    image: testimonialSlides[1],
    objectPosition: "center",
    quote:
      "WSSU gave me more than a degree. It gave me a community of educators who believed I could lead a classroom — and the training to actually do it from day one.",
    name: "Marcus Hill, M.Ed.",
    role: "2026 Graduate · Education",
  },
  {
    image: testimonialSlides[2],
    objectPosition: "center top",
    quote:
      "I came to WSSU for the business program and left with a network. Internships, mentors, the whole Ramily. That's what made the difference.",
    name: "Sade Owens",
    role: "2026 Graduate · Business",
  },
];

export function Testimonial() {
  const swipeRef = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (media.matches) setPlaying(false);
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setI((p) => (p + dir + slides.length) % slides.length);
  }, []);

  const goNext = useCallback(() => go(1), [go]);

  const { isDragging } = useHorizontalSwipe(swipeRef, {
    onSwipePrev: () => go(-1),
    onSwipeNext: goNext,
  });

  const jumpTo = (idx: number) => {
    if (idx === i) return;
    setDirection(idx > i ? 1 : -1);
    setI(idx);
  };

  const indicatorAccents = [
    { active: "bg-wssu-gold", hover: "hover:bg-wssu-gold/55" },
    { active: "bg-wssu-teal", hover: "hover:bg-wssu-teal/55" },
    { active: "bg-wssu-lime", hover: "hover:bg-wssu-lime/55" },
  ] as const;

  const quoteAccents = ["text-wssu-gold", "text-wssu-teal", "text-wssu-lime"] as const;

  return (
    <section className="bg-wssu-paper py-24 md:py-32">
      <div className="section-header-container">
        <SectionHeaderLabelRow label="(05) — Real Rams" split="wide" />
      </div>

      <div className="section-container mt-12 md:mt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-stretch lg:gap-20">
          <div
            ref={swipeRef}
            className={cn(
              "relative lg:col-span-5",
              isDragging ? "cursor-grabbing select-none" : "cursor-grab lg:cursor-auto",
            )}
          >
            <div className="photo-corner-cut relative aspect-square w-full overflow-hidden bg-wssu-black/5 lg:aspect-[4/5]">
              {slides.map((slide, idx) => (
                <OptimizedImage
                  key={slide.image}
                  src={slide.image}
                  alt={slide.name}
                  sizes="(min-width: 1024px) 36rem, 100vw"
                  style={{
                    ["--slide-object-position" as string]: slide.objectPosition,
                    transform: slide.imageScale ? `scale(${slide.imageScale})` : undefined,
                  }}
                  className={cn(
                    "absolute inset-0 size-full object-cover object-top transition-opacity duration-500 ease-out lg:[object-position:var(--slide-object-position)]",
                    slide.imageScale && "origin-top lg:origin-center",
                    idx === i ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col lg:col-span-7 lg:h-full">
            <div className="flex flex-1 flex-col lg:min-h-0">
              <div className="flex flex-1 items-center lg:min-h-0">
                <div className="grid w-full [&>*]:col-start-1 [&>*]:row-start-1">
                  {slides.map((slide, idx) => (
                    <div
                      key={slide.name}
                      className={cn(
                        "testimonial-quote__body w-full transition-opacity duration-500",
                        idx === i ? "opacity-100" : "pointer-events-none opacity-0",
                      )}
                      aria-hidden={idx !== i}
                    >
                      <blockquote
                        className={cn(
                          "testimonial-quote",
                          idx === i &&
                            (direction === 1 ? "testimonial-content-next" : "testimonial-content-prev"),
                        )}
                      >
                        <span
                          className={cn(
                            "testimonial-quote__open transition-colors duration-500",
                            quoteAccents[idx],
                          )}
                          aria-hidden="true"
                        >
                          “
                        </span>
                        <p className="testimonial-quote__text">{slide.quote}</p>
                      </blockquote>

                      <div className="testimonial-quote__meta mt-10 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6">
                        <div
                          className={cn(
                            idx === i &&
                              (direction === 1 ? "testimonial-content-next" : "testimonial-content-prev"),
                          )}
                        >
                          <p className="font-display text-xl uppercase tracking-[-0.02em]">{slide.name}</p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-wssu-black/60">
                            {slide.role}
                          </p>
                        </div>
                        <div
                          className={cn(
                            idx === i &&
                              (direction === 1 ? "testimonial-content-next" : "testimonial-content-prev"),
                          )}
                        >
                          <span
                            className={cn(
                              "testimonial-quote__close transition-colors duration-500",
                              quoteAccents[idx],
                            )}
                            aria-hidden="true"
                          >
                            ”
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10 flex shrink-0 items-center justify-between gap-4 lg:mt-0">
                <SectionIndicators
                  count={slides.length}
                  current={i}
                  onSelect={jumpTo}
                  accents={indicatorAccents}
                  label="testimonial"
                  progress={{
                    durationMs: AUTO_MS,
                    playing,
                    resetKey: i,
                    onComplete: goNext,
                  }}
                />
                <ConnectedArrowControls
                  isPlaying={playing}
                  onTogglePlay={() => setPlaying((value) => !value)}
                  playLabel="Play testimonials"
                  pauseLabel="Pause testimonials"
                  onPrev={() => go(-1)}
                  onNext={() => go(1)}
                  prevLabel="Previous testimonial"
                  nextLabel="Next testimonial"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
