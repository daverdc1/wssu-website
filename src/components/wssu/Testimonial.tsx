import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ConnectedArrowControls } from "./ConnectedArrowControls";
import { SectionIndicators } from "./SectionIndicators";
import { SectionHeaderLabelRow } from "./SectionHeaderGrid";
import { testimonialImage, photos } from "./photos";

const AUTO_MS = 8000;

const slides = [
  {
    image: testimonialImage,
    quote:
      "This experience has prepared me to step into the nursing profession with the confidence and readiness to advocate for myself and my patients. As I move forward, I carry with me the knowledge, values, and passion that will guide me in making a meaningful impact in healthcare.",
    name: "Jade Green BSN, RN",
    role: "2026 Graduate",
  },
  {
    image: photos[4],
    quote:
      "WSSU gave me more than a degree. It gave me a community of educators who believed I could lead a classroom — and the training to actually do it from day one.",
    name: "Marcus Hill, M.Ed.",
    role: "2026 Graduate · Education",
  },
  {
    image: photos[1],
    quote:
      "I came to WSSU for the business program and left with a network. Internships, mentors, the whole Ramily. That's what made the difference.",
    name: "Sade Owens",
    role: "2026 Graduate · Business",
  },
];

export function Testimonial() {
  const [i, setI] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [playing, setPlaying] = useState(true);
  const s = slides[i];

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

  const badgeAccents = [
    { bg: "bg-wssu-gold", text: "text-wssu-black" },
    { bg: "bg-wssu-teal", text: "text-wssu-white" },
    { bg: "bg-wssu-lime", text: "text-wssu-black" },
  ] as const;

  const quoteAccents = ["text-wssu-gold", "text-wssu-teal", "text-wssu-lime"] as const;

  const badgeAccent = badgeAccents[i];
  const quoteAccent = quoteAccents[i];

  return (
    <section className="bg-wssu-paper py-24 md:py-32">
      <div className="section-header-container">
        <SectionHeaderLabelRow label="(05) — Real Rams" split="wide" />
      </div>

      <div className="section-container mt-12 md:mt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-stretch lg:gap-20">
          <div className="relative lg:col-span-5">
            <div className="photo-corner-cut relative aspect-[4/5] w-full overflow-hidden bg-wssu-black/5">
              {slides.map((slide, idx) => (
                <img
                  key={slide.image}
                  src={slide.image}
                  alt={slide.name}
                  className={cn(
                    "absolute inset-0 size-full object-cover transition-opacity duration-500 ease-out",
                    idx === i ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}
            </div>
            <div
              className={cn(
                "absolute -bottom-4 -left-4 flex size-28 -rotate-6 items-center justify-center rounded-full px-3 text-center transition-colors duration-500 md:size-32",
                badgeAccent.bg,
                badgeAccent.text,
              )}
            >
              <span className={cn("font-marker text-lg leading-tight md:text-xl", badgeAccent.text)}>
                {s.role}
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-col lg:col-span-7 lg:h-full">
            <div className="flex flex-1 flex-col lg:min-h-0">
              <div className="flex flex-1 items-center lg:min-h-0">
                <div className="w-full">
                  <div className="testimonial-quote__body">
                    <blockquote
                      key={`quote-${i}`}
                      className={cn(
                        "testimonial-quote",
                        direction === 1 ? "testimonial-content-next" : "testimonial-content-prev",
                      )}
                    >
                      <span
                        className={cn("testimonial-quote__open transition-colors duration-500", quoteAccent)}
                        aria-hidden="true"
                      >
                        “
                      </span>
                      <p className="testimonial-quote__text">{s.quote}</p>
                    </blockquote>

                    <div className="testimonial-quote__meta mt-10 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6">
                      <div
                        key={`meta-${i}`}
                        className={cn(
                          direction === 1 ? "testimonial-content-next" : "testimonial-content-prev",
                        )}
                      >
                        <p className="font-display text-xl uppercase">{s.name}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-wssu-black/60">
                          {s.role}
                        </p>
                      </div>
                      <div
                        key={`quote-close-${i}`}
                        className={cn(
                          direction === 1 ? "testimonial-content-next" : "testimonial-content-prev",
                        )}
                      >
                        <span
                          className={cn("testimonial-quote__close transition-colors duration-500", quoteAccent)}
                          aria-hidden="true"
                        >
                          ”
                        </span>
                      </div>
                    </div>
                  </div>
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
