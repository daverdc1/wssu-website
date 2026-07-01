import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MarkerCircle } from "./MarkerCircle";
import { OptimizedImage } from "./OptimizedImage";
import { SectionHeaderGrid } from "./SectionHeaderGrid";
import { ProgramImageWipe, useProgramWipeSwapMs } from "./ProgramImageWipe";
import { whyBelongImage, whyCareerImage, whyImage } from "./photos";

type WhyAccent = "gold" | "teal" | "lime";

const accentStyles: Record<WhyAccent, { wipe: string }> = {
  gold: { wipe: "bg-wssu-gold" },
  teal: { wipe: "bg-wssu-teal" },
  lime: { wipe: "bg-wssu-lime" },
};

const highlights: {
  image: string;
  title: string;
  body: string;
  accent: WhyAccent;
}[] = [
  {
    image: whyImage,
    accent: "gold",
    title: "We turn potential into opportunity.",
    body: "WSSU is North Carolina's only Carnegie-designated Opportunity College — and ranked the #1 HBCU in the state for value. We're formally recognized for doing what others only promise: changing the trajectory of students' lives. With over 9,000 alumni rooted in the Piedmont Triad and $600M in annual regional economic impact, a WSSU degree doesn't just open doors — it proves they were opened.",
  },
  {
    image: whyCareerImage,
    accent: "teal",
    title: "Your career starts on Day One.",
    body: "Our programs are built around what North Carolina's workforce actually needs — from nursing and bio-manufacturing to business and tech. Partnerships with regional employers and a guaranteed law school pathway with Wake Forest University mean real opportunities are already in place before you graduate.",
  },
  {
    image: whyBelongImage,
    accent: "lime",
    title: "You belong here. All of you.",
    body: "WSSU supports the whole student: holistic well-being, personalized advising, and faculty who genuinely invest in your success. Our Ramily of alumni and students is united by more than a degree — it's a shared purpose that lasts long after graduation day.",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function computeArticleProgress(articles: HTMLElement[]): number[] {
  const vh = window.innerHeight;
  const centerLine = vh / 2;

  return articles.map((article) => {
    const rect = article.getBoundingClientRect();
    const articleCenter = rect.top + rect.height / 2;

    if (articleCenter <= centerLine) return 1;
    if (articleCenter >= vh) return 0;

    return clamp((vh - articleCenter) / (vh - centerLine), 0, 1);
  });
}

function WhyPhotoMobile({ index }: { index: number }) {
  const item = highlights[index];

  return (
    <div className="photo-corner-cut relative mb-8 aspect-square w-full overflow-hidden bg-wssu-black/5 lg:hidden">
      <OptimizedImage
        src={item.image}
        alt={item.title}
        sizes="(min-width: 768px) 1600px, 100vw"
        className="size-full object-cover object-top"
      />
      <div className="absolute inset-0 ring-1 ring-inset ring-wssu-black/10" />
    </div>
  );
}

function WhyPhotoPanel({
  displayIndex,
  activeIndex,
  direction,
  transitionId,
  imageReveal,
}: {
  displayIndex: number;
  activeIndex: number;
  direction: 1 | -1;
  transitionId: number;
  imageReveal: boolean;
}) {
  const displayed = highlights[displayIndex];
  const active = highlights[activeIndex];
  const accent = accentStyles[active.accent];

  return (
    <div className="photo-corner-cut relative w-full max-h-[820px] overflow-hidden bg-wssu-black/5 aspect-[4/5] lg:aspect-auto lg:h-[min(820px,calc(100vh-8rem))]">
      <OptimizedImage
        key={displayed.image}
        src={displayed.image}
        alt={displayed.title}
        sizes="(min-width: 768px) 1600px, 100vw"
        className={cn("size-full object-cover", imageReveal && "program-image-reveal")}
      />
      <ProgramImageWipe
        transitionId={transitionId}
        direction={direction}
        wipeClassName={accent.wipe}
      />
      <div className="absolute inset-0 z-[1] ring-1 ring-inset ring-wssu-black/10" />
      <div
        key={`badge-${activeIndex}`}
        className={cn(
          "absolute left-4 top-4 z-20 bg-wssu-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-wssu-black",
          direction === 1 ? "program-badge-next" : "program-badge-prev",
        )}
      >
        {String(activeIndex + 1).padStart(2, "0")} / {String(highlights.length).padStart(2, "0")}
      </div>
    </div>
  );
}

export function WhyWSSU() {
  const wipeSwapMs = useProgramWipeSwapMs();
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [transitionId, setTransitionId] = useState(0);
  const [imageReveal, setImageReveal] = useState(true);
  const [fillProgress, setFillProgress] = useState<number[]>(() =>
    highlights.map(() => 0),
  );
  const [centerVisibility, setCenterVisibility] = useState<number[]>(() =>
    highlights.map(() => 0),
  );
  const articleRefs = useRef<(HTMLElement | null)[]>([]);
  const activeIndexRef = useRef(0);

  const jumpToHighlight = useCallback((index: number) => {
    const article = articleRefs.current[index];
    if (!article) return;

    article.scrollIntoView({ behavior: "smooth", block: "center" });

    if (index === activeIndexRef.current) return;

    setDirection(index > activeIndexRef.current ? 1 : -1);
    setImageReveal(false);
    setTransitionId((id) => id + 1);
    setActiveIndex(index);
    activeIndexRef.current = index;
  }, []);

  useEffect(() => {
    if (activeIndex === displayIndex) return;

    const swapTimer = window.setTimeout(() => {
      setDisplayIndex(activeIndex);
      setImageReveal(true);
    }, wipeSwapMs);

    return () => window.clearTimeout(swapTimer);
  }, [activeIndex, displayIndex, wipeSwapMs]);

  useEffect(() => {
    const articles = articleRefs.current.filter((el): el is HTMLElement => el != null);
    if (!articles.length) return;

    const ratios = new Map<number, number>();

    const updateFillProgress = () => {
      setFillProgress(computeArticleProgress(articles));
    };

    const syncActive = () => {
      let next = 0;
      let best = -1;

      for (const [index, ratio] of ratios) {
        if (ratio > best) {
          best = ratio;
          next = index;
        }
      }

      if (best <= 0 || next === activeIndexRef.current) return;

      const prev = activeIndexRef.current;
      setDirection(next > prev ? 1 : -1);
      setImageReveal(false);
      setTransitionId((id) => id + 1);
      setActiveIndex(next);
      activeIndexRef.current = next;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.index);
          ratios.set(index, entry.intersectionRatio);
        }
        setCenterVisibility(
          highlights.map((_, index) => ratios.get(index) ?? 0),
        );
        syncActive();
        updateFillProgress();
      },
      {
        threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
        rootMargin: "-25% 0px -25% 0px",
      },
    );

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        updateFillProgress();
        ticking = false;
      });
    };

    for (const article of articles) observer.observe(article);
    updateFillProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="bg-wssu-white py-24 md:py-32">
      <div className="section-header-container">
        <SectionHeaderGrid
          label="(04) — Why WSSU?"
          headline={
            <h2 className="font-display flex flex-col gap-y-[0.04em] text-5xl uppercase leading-[0.95] md:text-6xl lg:text-[5rem]">
              <span>There are</span>
              <span>hundreds of</span>
              <span>universities.</span>
              <span className="flex flex-col text-wssu-red">
                <span>There&apos;s only</span>
                <span className="relative inline-block w-fit">
                  one WSSU.
                  <MarkerCircle
                    rotate={-3}
                    tone="on-red"
                    className="-left-10 -right-1.5 w-[calc(100%+5rem)]"
                  />
                </span>
              </span>
            </h2>
          }
          aside={
            <p className="section-intro section-intro--light">
              Choosing a university is one of the biggest decisions you'll make. Here's why thousands of students choose Winston-Salem State University — and why it pays off.
            </p>
          }
        />
      </div>

      <div className="section-container">
        <div className="mt-16 grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12 lg:pt-4">
          <div className="flex flex-col lg:col-span-7 lg:pb-8">
            {highlights.map((item, index) => (
              <div
                key={item.title}
                role="button"
                tabIndex={0}
                aria-current={activeIndex === index ? "true" : undefined}
                aria-label={`Jump to ${item.title}`}
                onClick={() => jumpToHighlight(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    jumpToHighlight(index);
                  }
                }}
                className="relative cursor-pointer py-12 outline-none focus-visible:ring-2 focus-visible:ring-wssu-red/70 focus-visible:ring-offset-4 md:py-16 lg:py-20"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 overflow-hidden bg-wssu-black/10"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 transition-[height] duration-150 ease-out will-change-[height]",
                      accentStyles[item.accent].wipe,
                    )}
                    style={{ height: `${(fillProgress[index] ?? 0) * 100}%` }}
                  />
                </div>

                <div className="relative w-full pl-5 md:pl-6">
                  <article
                    ref={(el) => {
                      articleRefs.current[index] = el;
                    }}
                    data-index={index}
                    className={cn(
                      "relative transition-opacity duration-500 ease-out",
                      (centerVisibility[index] ?? 0) > 0 ? "opacity-100" : "opacity-35",
                      activeIndex === index ? "opacity-100" : "hover:opacity-80",
                    )}
                  >
                    <WhyPhotoMobile index={index} />
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-wssu-black/50">
                      ({String(index + 1).padStart(2, "0")})
                    </p>
                    <h3 className="mt-4 font-display text-2xl uppercase leading-[1.05] tracking-[-0.02em] text-wssu-black md:text-[1.7rem]">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-wssu-black/75 md:text-base lg:text-lg">
                      {item.body}
                    </p>
                  </article>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:sticky lg:top-28 lg:col-span-5 lg:col-start-8 lg:block lg:self-start">
            <WhyPhotoPanel
              displayIndex={displayIndex}
              activeIndex={activeIndex}
              direction={direction}
              transitionId={transitionId}
              imageReveal={imageReveal}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
