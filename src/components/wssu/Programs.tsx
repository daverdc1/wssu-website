import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoLink } from "./DemoLink";
import { WipeButton } from "./WipeButton";
import { OptimizedImage } from "./OptimizedImage";
import { HoverAccentLine } from "./HoverAccentLine";
import { SubnavArrow } from "./SubnavArrow";
import { SectionHeaderGrid } from "./SectionHeaderGrid";
import { programs } from "./photos";

type ProgramAccent = "gold" | "teal" | "lime" | "coral" | "violet";

type Program = {
  id: string;
  title: string;
  heading: string;
  body: string;
  image: string;
  accent: ProgramAccent;
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
  coral: {
    indicator: "bg-wssu-coral",
    wipe: "bg-wssu-coral",
    activeText: "text-wssu-white",
    activeArrow: "text-wssu-white",
  },
  violet: {
    indicator: "bg-wssu-violet",
    wipe: "bg-wssu-violet",
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
    accent: "coral",
  },
  {
    id: "justice",
    title: "Social Justice and Advocacy",
    heading: "Social Justice & Advocacy",
    body: "Study power, then change it. Our social justice programs combine the analytical tools of the social sciences with on-the-ground advocacy training—and a guaranteed law school pathway with Wake Forest University for qualified students.",
    image: programs.justice,
    accent: "violet",
  },
];

const CONTENT_DELAYS = ["0.06s", "0.14s", "0.24s"] as const;
const WIPE_SWAP_MS = 380;

export function Programs() {
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
    }, WIPE_SWAP_MS);

    return () => window.clearTimeout(swapTimer);
  }, [activeIndex, displayIndex]);

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
                        "group flex w-full items-center gap-4 px-4 py-3 text-left transition-colors duration-300 md:gap-5 md:px-5 md:py-4",
                        isActive
                          ? accent.activeText
                          : "text-wssu-black/80 hover:bg-wssu-white/45 hover:text-wssu-black",
                      )}
                    >
                      <div
                        className={cn(
                          "relative h-14 w-14 shrink-0 overflow-hidden bg-wssu-black/5 md:h-16 md:w-16",
                          isActive ? "ring-2 ring-wssu-white/70" : "ring-1 ring-wssu-black/10",
                        )}
                      >
          <OptimizedImage
                          src={p.image}
                          alt=""
                          aria-hidden="true"
                          sizes="4rem"
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
                        <span className="mt-1 block font-sans text-base font-bold leading-snug md:text-lg">
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
                sizes="(min-width: 1024px) 58vw, 100vw"
                className={cn(
                  "size-full object-cover",
                  imageReveal && "program-image-reveal",
                )}
              />
              <span
                key={`wipe-${transitionId}`}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
              >
                <span
                  className={cn(
                    "program-wipe-layer",
                    activeAccent.wipe,
                    direction === 1 ? "program-wipe-next" : "program-wipe-prev",
                  )}
                />
              </span>
              <div
                key={`badge-${active.id}`}
                className={cn(
                  "absolute left-4 top-4 z-20 bg-wssu-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-wssu-black",
                  direction === 1 ? "program-badge-next" : "program-badge-prev",
                )}
              >
                {String(activeIndex + 1).padStart(2, "0")} / 05
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
                className="program-content-child mt-8 flex flex-wrap items-center gap-6 md:gap-8"
                style={{ animationDelay: CONTENT_DELAYS[2] }}
              >
                <WipeButton
                  wipeFill="red"
                  className="inline-flex items-center bg-wssu-black px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-wssu-white"
                >
                  Explore {active.title.split(",")[0].split(" and ")[0]} Programs
                </WipeButton>
                <DemoLink className="group/link inline-flex flex-col items-start text-xs font-bold uppercase tracking-[0.15em] text-wssu-black transition-colors hover:text-wssu-red">
                  <span className="inline-flex items-center gap-2">
                    <span>All majors</span>
                    <ArrowRight
                      className="size-4 transition-transform group-hover/link:translate-x-1"
                      strokeWidth={2.5}
                    />
                  </span>
                  <HoverAccentLine expandOn="group-hover/link:w-12" />
                </DemoLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
