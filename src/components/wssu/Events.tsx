import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoLink } from "./DemoLink";
import { HoverAccentLine } from "./HoverAccentLine";
import { SubnavArrow } from "./SubnavArrow";
import { SectionHeaderLabelRow } from "./SectionHeaderGrid";

type EventCategory = "Admissions" | "Campus" | "Virtual" | "Athletics";

type EventItem = {
  id: string;
  category: EventCategory;
  month: string;
  day: string;
  sortKey: number;
  title: string;
  tag?: string;
  time?: string;
  location: string;
  description: string;
};

const filterSegments = [
  { value: "All", label: "All" },
  { value: "Admissions", label: "Admissions" },
  { value: "Campus", label: "Campus" },
  { value: "Virtual", label: "Virtual" },
  { value: "Athletics", label: "Athletics" },
] as const;

type Filter = (typeof filterSegments)[number]["value"];

const events: EventItem[] = [
  {
    id: "campus-visit",
    category: "Admissions",
    month: "Jun",
    day: "22",
    sortKey: 20260622,
    title: "Campus visit day",
    tag: "Open to all",
    time: "8:00 AM",
    location: "Winston-Salem Campus",
    description: "Walk the campus, tour residence halls, and talk with current students.",
  },
  {
    id: "open-house",
    category: "Campus",
    month: "Jun",
    day: "27",
    sortKey: 20260627,
    title: "Spring open house",
    time: "10:00 AM",
    location: "Winston-Salem Campus",
    description: "Meet faculty, explore programs, and learn what makes WSSU different.",
  },
  {
    id: "virtual-info",
    category: "Virtual",
    month: "Jul",
    day: "11",
    sortKey: 20260711,
    title: "Virtual information session",
    location: "Online",
    description: "Can't make it to campus? Join us online to ask questions and learn more.",
  },
];

const eventCategoryStyles: Record<
  EventCategory,
  {
    lineColor: "gold" | "teal" | "lime" | "violet" | "red";
  }
> = {
  Admissions: { lineColor: "gold" },
  Campus: { lineColor: "teal" },
  Virtual: { lineColor: "lime" },
  Athletics: { lineColor: "red" },
};

function EventDate({ event }: { event: EventItem }) {
  return (
    <div
      className={cn(
        "photo-corner-cut relative flex size-[3.75rem] shrink-0 flex-col bg-wssu-red text-wssu-white transition-colors duration-300 [--photo-cut:0.9rem] md:size-[4.25rem] md:[--photo-cut:1rem]",
        "group-hover:brightness-95",
      )}
    >
      <p className="px-1.5 pt-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] md:px-2 md:pt-2">
        {event.month}
      </p>
      <div className="flex flex-1 items-center justify-center pb-1 md:pb-1.5">
        <p className="font-display text-2xl leading-none tracking-[-0.02em] md:text-[1.75rem]">
          {event.day}
        </p>
      </div>
    </div>
  );
}

function EventMeta({ event }: { event: EventItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-sm text-wssu-black/60">
      {event.time ? (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
          {event.time}
        </span>
      ) : null}
      {event.time ? (
        <span className="text-wssu-black/25" aria-hidden="true">
          |
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1.5">
        <MapPin className="size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
        {event.location}
      </span>
    </div>
  );
}

export function Events() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [listKey, setListKey] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });

  const navRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const activeFilterIndex = filterSegments.findIndex((segment) => segment.value === activeFilter);

  const visibleEvents = useMemo(() => {
    const filtered =
      activeFilter === "All"
        ? events
        : events.filter((event) => event.category === activeFilter);

    return [...filtered].sort((a, b) => a.sortKey - b.sortKey);
  }, [activeFilter]);

  const handleFilterChange = (value: Filter) => {
    if (value === activeFilter) return;
    setActiveFilter(value);
    setListKey((key) => key + 1);
  };

  useEffect(() => {
    const updateIndicator = () => {
      const item = itemRefs.current[activeFilterIndex];
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
  }, [activeFilterIndex]);

  return (
    <section id="events" className="bg-wssu-paper py-24 md:py-32">
      <div className="section-header-container">
        <SectionHeaderLabelRow label="(08) — Events" />
      </div>

      <div className="section-container mt-12 md:mt-16">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <h2 className="font-display flex flex-col gap-y-[0.04em] text-5xl uppercase leading-[0.95] md:text-7xl">
              <span className="text-wssu-black">Upcoming</span>
              <span className="text-wssu-black">Events.</span>
            </h2>

            <nav aria-label="Event categories" className="mt-10">
              <ul ref={navRef} className="relative divide-y divide-wssu-black/15">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bg-wssu-black transition-[top,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[top,height]"
                  style={{
                    top: indicatorStyle.top,
                    height: indicatorStyle.height,
                  }}
                />
                {filterSegments.map((segment, index) => {
                  const isActive = segment.value === activeFilter;

                  return (
                    <li
                      key={segment.value}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      className="relative z-10"
                    >
                      <button
                        type="button"
                        onClick={() => handleFilterChange(segment.value)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "group flex w-full items-center justify-between px-4 py-3 text-left transition-colors duration-300 md:px-5 md:py-4",
                          isActive
                            ? "text-wssu-white"
                            : "text-wssu-black/80 hover:bg-wssu-white/45 hover:text-wssu-black",
                        )}
                      >
                        <span className="font-sans text-base font-bold leading-snug md:text-lg">
                          {segment.label}
                        </span>
                        <SubnavArrow active={isActive} activeClassName="text-wssu-white" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <DemoLink className="mt-6 inline-flex items-center gap-2 border border-wssu-black px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-wssu-black transition-colors hover:bg-wssu-black hover:text-wssu-white">
              <Calendar className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
              Full calendar
            </DemoLink>
          </div>

          <div className="lg:col-span-8">
            <div key={listKey} className="events-list-enter space-y-4">
              {visibleEvents.length === 0 ? (
                <p className="border border-wssu-black/10 bg-wssu-white/60 px-6 py-12 font-sans text-lg italic leading-relaxed text-wssu-black/60 md:px-8 md:text-xl">
                  No events in this category right now. Check back soon.
                </p>
              ) : (
                visibleEvents.map((event, index) => {
                  const accent = eventCategoryStyles[event.category];

                  return (
                    <article
                      key={event.id}
                      className={cn(
                        "photo-corner-cut group flex flex-col gap-5 overflow-hidden bg-wssu-white/60 p-6 transition-[background-color] duration-300 [--photo-cut:2rem] hover:bg-wssu-white/90 md:flex-row md:items-start md:gap-6 md:p-8 md:[--photo-cut:2.75rem]",
                      )}
                      style={{ "--event-delay": `${index * 70}ms` } as CSSProperties}
                    >
                      <EventDate event={event} />

                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="space-y-2">
                          <h3 className="font-display text-2xl uppercase leading-tight text-wssu-black">
                            <DemoLink className="block cursor-pointer text-left underline-offset-2 decoration-wssu-black transition-[text-decoration-color] duration-300 group-hover:underline">
                              {event.title}
                            </DemoLink>
                          </h3>
                          {event.tag ? (
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-wssu-red">
                              {event.tag}
                            </p>
                          ) : null}
                          <EventMeta event={event} />
                        </div>

                        <p className="max-w-2xl text-sm leading-relaxed text-wssu-black/70 md:text-base">
                          {event.description}
                        </p>

                        <DemoLink className="group/link relative inline-flex text-xs font-bold uppercase tracking-[0.15em] text-wssu-black/60 transition-colors group-hover:text-wssu-black hover:text-wssu-black">
                          <span className="inline-flex items-center gap-2">
                            Save my spot
                            <ArrowRight
                              className="size-4 transition-transform group-hover:translate-x-1 group-hover/link:translate-x-1"
                              strokeWidth={2.5}
                            />
                          </span>
                          <HoverAccentLine
                            floating
                            color={accent.lineColor}
                            expandOn="group-hover:w-12 group-hover/link:w-12"
                          />
                        </DemoLink>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
