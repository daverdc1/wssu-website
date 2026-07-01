import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoLink } from "./DemoLink";
import { WipeButton } from "./WipeButton";
import { OptimizedImage } from "./OptimizedImage";
import { ProgramImageWipe, useProgramWipeSwapMs } from "./ProgramImageWipe";
import { SubnavArrow } from "./SubnavArrow";
import { SectionHeaderGrid } from "./SectionHeaderGrid";
import { programs } from "./photos";

type ProgramAccent = "gold" | "teal" | "lime" | "red";

type Program = {
  id: string;
  title: string;
  heading: string;
  body: string;
  image: string;
  accent: ProgramAccent;
  ctaLabel?: string;
};

const programAccentStyles: Record<
  ProgramAccent,
  { indicator: string; wipe: string; activeText: string; activeArrow: string }
> = {
  gold: {
    indicator: "bg-wssu-gold",
    wipe: "bg-wssu-gold",
    activeText: "text-wssu-black",
    activeArrow: "text-wssu-black",
  },
  teal: {
    indicator: "bg-wssu-teal",
    wipe: "bg-wssu-teal",
    activeText: "text-wssu-white",
    activeArrow: "text-wssu-white",
  },
  lime: {
    indicator: "bg-wssu-lime",
    wipe: "bg-wssu-lime",
    activeText: "text-wssu-black",
    activeArrow: "text-wssu-black",
  },
  red: {
    indicator: "bg-wssu-red",
    wipe: "bg-wssu-red",
    activeText: "text-wssu-white",
    activeArrow: "text-wssu-white",
  },
};

const PROGRAMS: Program[] = [
  {
    id: "arts",
    title: "Arts & Entertainment",
    heading: "Arts & Entertainment",
    body: "Your creativity is a career. WSSU's arts and entertainment programs give you the skills, the stage, and the space to turn your passion into a profession. Whether you're drawn to performance, design, or production, you'll learn from faculty who are practitioners—and graduate ready to make your mark on the cultural world.",
    image: programs.arts,
    accent: "gold",
  },
  {
    id: "business",
    title: "Business, Leadership, and Entrepreneurship",
    heading: "Business, Leadership & Entrepreneurship",
    body: "Build the skills to lead, the network to grow, and the mindset to start something of your own. WSSU's business programs pair AACSB-accredited rigor with hands-on experience—internships, case competitions, and real partnerships with regional employers who are hiring.",
    image: programs.business,
    accent: "teal",
  },
  {
    id: "comms",
    title: "Communications, Languages, and Media",
    heading: "Communications, Languages & Media",
    body: "Stories shape culture. Our communications programs train you to research, report, design, and persuade—across platforms, in multiple languages, with the editorial discipline that newsrooms, brands, and policy shops actually want.",
    image: programs.comms,
    accent: "lime",
  },
  {
    id: "education",
    title: "Education",
    heading: "Education",
    body: "Become the teacher you wish you'd had. WSSU prepares educators to lead classrooms with cultural responsiveness, evidence-based instruction, and the conviction that every student deserves a champion. Field placements start early and never let up.",
    image: programs.education,
    accent: "red",
  },
  {
    id: "justice",
    title: "Social Justice and Advocacy",
    heading: "Social Justice & Advocacy",
    body: "Study power, then change it. Our social justice programs combine the analytical tools of the social sciences with on-the-ground advocacy training—and a guaranteed law school pathway with Wake Forest University for qualified students.",
    image: programs.justice,
    accent: "gold",
  },
  {
    id: "health",
    title: "Health & Fitness",
    heading: "Health & Fitness",
    body: "Train for careers that keep communities well. WSSU's health and fitness programs blend clinical knowledge, movement science, and real-world practice—preparing you to work in athletics, wellness, rehabilitation, and the growing field of preventive care.",
    image: programs.health,
    accent: "teal",
  },
  {
    id: "stem",
    title: "Science, Technology, Engineering, and Mathematics",
    heading: "Science, Technology, Engineering & Mathematics",
    body: "Ask better questions—and build what's next. WSSU's STEM programs connect rigorous science and research with technology, engineering design, data, and mathematics—preparing you for graduate study, healthcare pathways, and the industries reshaping North Carolina, from advanced manufacturing and cybersecurity to software, analytics, and infrastructure.",
    image: programs.stem,
    accent: "lime",
    ctaLabel: "STEM",
  },
];

const CONTENT_DELAYS = ["0.06s", "0.14s", "0.24s"] as const;

export function Programs() {
  const wipeSwapMs = useProgramWipeSwapMs();
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [transitionId, setTransitionId] = useState(0);
  const [imageReveal, setImageReveal] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });

  const navRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const active = PROGRAMS[activeIndex];
  const displayed = PROGRAMS[displayIndex];
  const activeAccent = programAccentStyles[active.accent];

  const selectProgram = (index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setImageReveal(false);
    setActiveIndex(index);
    setTransitionId((id) => id + 1);
  };

  useEffect(() => {
    if (activeIndex === displayIndex) return;

    const swapTimer = window.setTimeout(() => {
      setDisplayIndex(activeIndex);
      setImageReveal(true);
    }, wipeSwapMs);

    return () => window.clearTimeout(swapTimer);
  }, [activeIndex, displayIndex, wipeSwapMs]);

  useEffect(() => {
    const updateIndicator = () => {
      const item = itemRefs.current[activeIndex];
      if (!item) return;

      setIndicatorStyle({
        top: item.offsetTop,
        height: item.offsetHeight,
      });
    };

    updateIndicator();

    const list = navRef.current;
    if (!list) return;

    const observer = new ResizeObserver(updateIndicator);
    observer.observe(list);
    window.addEventListener("resize", updateIndicator);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeIndex]);

  return (
    <section id="programs" className="bg-wssu-paper py-24 md:py-32">
      <div className="section-header-container">
        <SectionHeaderGrid
          label="(02) — Find Your Program"
          headline={
            <h2 className="font-display flex flex-col gap-y-[0.04em] text-5xl uppercase leading-[0.95] md:text-7xl">
              <span className="text-wssu-black">Find Your</span>
              <span className="text-wssu-black">Program.</span>
            </h2>
          }
          aside={
            <p className="section-intro section-intro--light">
              At WSSU, every program is a pathway—to a career, a calling, and a community. Find the one that fits who you are and where you want to go.
            </p>
          }
        />
      </div>

      <div className="section-container">
        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          <nav
            aria-label="Program categories"
            className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start"
          >
            <ul ref={navRef} className="relative divide-y divide-wssu-black/15">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 transition-[top,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[top,height]",
                  activeAccent.indicator,
                )}
                style={{
                  top: indicatorStyle.top,
                  height: indicatorStyle.height,
                }}
              />
              {PROGRAMS.map((p, i) => {
                const isActive = i === activeIndex;
                const accent = programAccentStyles[p.accent];

                return (
                  <li
                    key={p.id}
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    className="relative z-10"
                  >
                    <button
                      type="button"
                      onClick={() => selectProgram(i)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "group flex w-full items-center gap-3 px-3 py-2 text-left transition-colors duration-300 md:gap-3.5 md:px-4 md:py-2.5",
                        isActive
                          ? accent.activeText
                          : "text-wssu-black/80 hover:bg-wssu-white/45 hover:text-wssu-black",
                      )}
                    >
                      <div
                        className={cn(
                          "relative h-10 w-10 shrink-0 overflow-hidden bg-wssu-black/5 md:h-11 md:w-11",
                          isActive ? "ring-2 ring-wssu-white/70" : "ring-1 ring-wssu-black/10",
                        )}
                      >
          <OptimizedImage
                          src={p.image}
                          alt=""
                          aria-hidden="true"
                          sizes="3.5rem"
                          className={cn(
                            "size-full object-cover transition-all duration-500",
                            isActive
                              ? "scale-100 opacity-100 grayscale-0"
                              : "scale-105 opacity-50 grayscale group-hover:scale-100 group-hover:opacity-90 group-hover:grayscale-[35%]",
                          )}
                        />
                      </div>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block font-mono text-[10px] uppercase tracking-[0.25em]",
                            isActive ? "opacity-80" : "text-wssu-black/45",
                          )}
                        >
                          ({String(i + 1).padStart(2, "0")})
                        </span>
                        <span className="mt-0.5 block font-sans text-sm font-bold leading-snug md:text-base">
                          {p.title}
                        </span>
                      </span>
                      <SubnavArrow
                        active={isActive}
                        activeClassName={accent.activeArrow}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="lg:col-span-7">
            <div className="photo-corner-cut relative aspect-[2/1] w-full overflow-hidden bg-wssu-black/5">
              <OptimizedImage
                key={displayed.id}
                src={displayed.image}
                alt={displayed.heading}
                sizes="(min-width: 768px) 1024px, 100vw"
                className={cn(
                  "size-full object-cover",
                  imageReveal && "program-image-reveal",
                )}
              />
              <ProgramImageWipe
                transitionId={transitionId}
                direction={direction}
                wipeClassName={activeAccent.wipe}
              />
              <div
                key={`badge-${active.id}`}
                className={cn(
                  "absolute left-4 top-4 z-20 bg-wssu-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-wssu-black",
                  direction === 1 ? "program-badge-next" : "program-badge-prev",
                )}
              >
                {String(activeIndex + 1).padStart(2, "0")} / {String(PROGRAMS.length).padStart(2, "0")}
              </div>
            </div>

            <div
              key={active.id}
              className={cn(
                "mt-8 max-w-2xl",
                direction === 1 ? "program-content-next" : "program-content-prev",
              )}
            >
              <h3
                className="program-content-child font-display text-3xl uppercase leading-tight text-wssu-black md:text-4xl"
                style={{ animationDelay: CONTENT_DELAYS[0] }}
              >
                {active.heading}
              </h3>
              <p
                className="program-content-child mt-4 text-base leading-relaxed text-wssu-black/75 md:text-lg"
                style={{ animationDelay: CONTENT_DELAYS[1] }}
              >
                {active.body}
              </p>
              <div
                className="program-content-child mt-8 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center"
                style={{ animationDelay: CONTENT_DELAYS[2] }}
              >
                <WipeButton
                  wipeFill="red"
                  className="inline-flex w-full items-center justify-center bg-wssu-black px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-wssu-white sm:w-auto sm:justify-start sm:text-left [&_.btn-wipe__content]:w-full [&_.btn-wipe__content]:justify-center sm:[&_.btn-wipe__content]:justify-start"
                >
                  Explore {active.ctaLabel ?? active.title.split(",")[0].split(" and ")[0]} Programs
                </WipeButton>
                <DemoLink className="inline-flex w-full items-center justify-center gap-2 border border-wssu-black px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-wssu-black transition-colors hover:bg-wssu-black hover:text-wssu-white sm:w-auto">
                  All majors
                  <ArrowRight className="size-4" strokeWidth={2.5} />
                </DemoLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
