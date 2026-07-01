import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Minus, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoLink } from "./DemoLink";

type MenuSection = {
  title: string;
  links: string[];
};

const menuSections: MenuSection[] = [
  {
    title: "Programs & Degrees",
    links: [
      "Undergraduate Majors",
      "Graduate Programs",
      "Online Learning",
      "Honors College",
      "Academic Catalog",
    ],
  },
  {
    title: "Admissions & Costs",
    links: [
      "Apply Now",
      "Visit Campus",
      "Tuition & Fees",
      "Financial Aid",
      "Scholarships",
    ],
  },
  {
    title: "Student Life",
    links: [
      "Housing & Dining",
      "Clubs & Organizations",
      "Athletics — Rams",
      "Campus Events",
      "Health & Wellness",
    ],
  },
  {
    title: "Research",
    links: [
      "Research Centers",
      "Faculty Research",
      "Student Research",
      "Library",
    ],
  },
  {
    title: "Careers & Outcomes",
    links: [
      "Career Services",
      "Internships",
      "Alumni Network",
      "Graduate Outcomes",
    ],
  },
  {
    title: "About WSSU",
    links: [
      "Our History",
      "Leadership",
      "Campus Map",
      "News & Media",
      "Contact",
    ],
  },
];

const popularLinks = [
  "Academic Calendar",
  "Banner Rams",
  "Campus Directory",
  "MyWSSU",
  "MyWSSU Info",
  "RamALERT",
];

type SiteMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function SiteMenu({ open, onClose }: SiteMenuProps) {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const titleId = useId();
  const searchInputId = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    searchRef.current?.focus({ preventScroll: true });
  };

  const clearSearch = () => {
    setQuery("");
    searchRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setOpenSection(null);
      setQuery("");
    }
  }, [open]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[100] transition-opacity duration-300",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-wssu-black/35 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-wssu-paper shadow-[-24px_0_60px_-30px_rgba(9,9,11,0.35)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-wssu-black/10 px-5 py-3.5 md:px-8">
          <p id={titleId} className="font-mono text-[10px] uppercase tracking-[0.35em] text-wssu-black/55">
            Site Menu
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-9 items-center justify-center bg-wssu-black/[0.035] text-wssu-black transition-colors duration-200 hover:bg-wssu-red hover:text-wssu-white"
          >
            <X className="size-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-6">
          <form
            onSubmit={handleSearch}
            className="group/search flex overflow-hidden border border-wssu-black/12 bg-wssu-white transition-all duration-200 hover:border-wssu-red/45 focus-within:border-wssu-red focus-within:shadow-[0_0_0_3px_rgba(200,16,46,0.18),0_0_18px_rgba(200,16,46,0.22)]"
          >
            <div className="relative min-w-0 flex-1">
              <label htmlFor={searchInputId} className="sr-only">
                Search the site
              </label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-[1.125rem] -translate-y-1/2 text-wssu-black/45 transition-colors group-hover/search:text-wssu-red/70 group-focus-within/search:text-wssu-red md:size-4"
                strokeWidth={2.25}
              />
              <input
                ref={searchRef}
                id={searchInputId}
                type="search"
                role="searchbox"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the site"
                className={cn(
                  "w-full border-0 bg-transparent py-4 pl-12 font-sans text-base leading-none text-wssu-black shadow-none outline-none placeholder:font-marker placeholder:text-base placeholder:text-wssu-black/45 md:py-3 md:pl-11 md:text-sm md:placeholder:text-sm",
                  query.length > 0 ? "pr-10" : "pr-4",
                )}
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center text-wssu-black/35 transition-colors hover:text-wssu-red"
                >
                  <X className="size-4" strokeWidth={2.25} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!query.trim()}
              aria-label="Submit search"
              className="flex w-14 shrink-0 items-center justify-center self-stretch bg-wssu-red text-wssu-white transition-colors enabled:hover:bg-wssu-black disabled:cursor-not-allowed disabled:pointer-events-none disabled:bg-transparent disabled:text-transparent md:w-12"
            >
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </button>
          </form>

          <div className="mt-6 divide-y divide-wssu-black/10 border-y border-wssu-black/10">
            {menuSections.map((section, index) => {
              const expanded = openSection === index;
              const panelId = `site-menu-section-${index}`;

              return (
                <div
                  key={section.title}
                  className={cn(
                    "transition-colors duration-200",
                    expanded ? "bg-wssu-white/45" : "hover:bg-wssu-white/45",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpenSection(expanded ? null : index)}
                    className={cn(
                      "group/section flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-all duration-200 md:px-5 md:py-4",
                      !expanded && "hover:pl-5",
                    )}
                  >
                    <span
                      className={cn(
                        "translate-y-px font-display text-lg font-bold uppercase leading-none tracking-[-0.02em] transition-colors md:text-xl",
                        expanded
                          ? "text-wssu-red group-hover/section:text-wssu-red-hover"
                          : "text-wssu-black group-hover/section:text-wssu-red",
                      )}
                    >
                      {section.title}
                    </span>
                    <span
                      className={cn(
                        "flex size-7 shrink-0 translate-y-px items-center justify-center rounded-full border transition-colors duration-200",
                        expanded
                          ? "border-wssu-red bg-wssu-red text-wssu-white group-hover/section:border-wssu-red-hover group-hover/section:bg-wssu-red-hover"
                          : "border-transparent bg-transparent text-wssu-black group-hover/section:border-wssu-red group-hover/section:bg-wssu-red group-hover/section:text-wssu-white",
                      )}
                    >
                      {expanded ? (
                        <Minus className="size-4" strokeWidth={2.5} />
                      ) : (
                        <Plus className="size-4" strokeWidth={2.5} />
                      )}
                    </span>
                  </button>

                  <div
                    id={panelId}
                    className={cn(
                      "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                      expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="min-h-0 overflow-x-hidden overflow-y-visible pb-1">
                      <ul className="divide-y divide-wssu-black/10 px-4 pb-2 md:px-5">
                        {section.links.map((link) => (
                          <li key={link}>
                            <DemoLink
                              onClick={onClose}
                              className="group/link flex w-full items-center justify-between gap-4 py-2 pl-0 pr-2 font-sans text-sm font-semibold tracking-[0.01em] text-wssu-black/75 transition-colors duration-200 hover:text-wssu-red"
                            >
                              <span className="relative inline-block transition-transform duration-200 group-hover/link:translate-x-0.5">
                                {link}
                                <span
                                  aria-hidden="true"
                                  className="pointer-events-none absolute left-0 top-full mt-0.5 hidden h-px w-full bg-wssu-red group-hover/link:block"
                                />
                              </span>
                              <ArrowRight
                                className="size-3.5 shrink-0 text-wssu-red opacity-0 transition-all duration-200 -translate-x-2 group-hover/link:translate-x-0 group-hover/link:opacity-100"
                                strokeWidth={2.5}
                              />
                            </DemoLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <p className="font-marker text-base text-wssu-black/80">Popular Links</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {popularLinks.map((link) => (
                <DemoLink
                  key={link}
                  onClick={onClose}
                  className="rounded-full border border-wssu-black/20 bg-wssu-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-wssu-black transition-colors hover:border-wssu-red hover:text-wssu-red"
                >
                  {link}
                </DemoLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
