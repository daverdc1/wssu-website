import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { DemoLink } from "./DemoLink";
import { HoverAccentLine } from "./HoverAccentLine";
import { InformationForMenu } from "./InformationForMenu";
import { MenuIcon } from "./MenuIcon";
import { WipeButton } from "./WipeButton";
import { navActionButtonSize, navActionButtonTypography } from "./navButtonStyles";
import { SiteMenu } from "./SiteMenu";

const navLinks = ["Apply", "Visit", "Give"];

const SCROLL_SHRINK = 72;
const SCROLL_EXPAND = 4;

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  useLayoutEffect(() => {
    const next = window.scrollY > SCROLL_SHRINK;
    scrolledRef.current = next;
    setScrolled(next);
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const y = window.scrollY;
        const prev = scrolledRef.current;
        let next = prev;

        if (!prev && y > SCROLL_SHRINK) next = true;
        if (prev && y <= SCROLL_EXPAND) next = false;

        if (next !== prev) {
          scrolledRef.current = next;
          setScrolled(next);
        }

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="sticky top-0 z-50 h-20 md:h-[5.5rem]" data-site-nav>
        <div
          className={cn(
            "h-full",
            !scrolled &&
              "border-b border-wssu-black/10 bg-wssu-white/95 shadow-[0_1px_0_rgba(9,9,11,0.05)] backdrop-blur-md",
          )}
        >
          <div className="section-header-container h-full">
            <div className={cn("h-full", scrolled ? "px-0 pt-3 md:pt-4" : "px-0 pt-0")}>
              <nav
                className={cn(
                  "flex items-center justify-between overflow-visible",
                  scrolled
                    ? "h-16 w-[calc(100%+1.25rem)] -mx-2.5 rounded-xl border border-wssu-black/15 bg-wssu-white px-5 shadow-[0_0_0_1px_rgba(9,9,11,0.06),0_16px_48px_-14px_rgba(9,9,11,0.42)] md:w-[calc(100%+2rem)] md:-mx-4 md:px-8"
                    : "w-full h-full",
                )}
              >
            <a
              href="/"
              onClick={scrollToTop}
              className="relative flex shrink-0 items-center"
              aria-label="Winston-Salem State University home"
            >
              <span
                className={cn(
                  "relative inline-block",
                  scrolled ? "h-9 md:h-10" : "h-12 md:h-14",
                )}
              >
                <Logo
                  tone={scrolled ? "sticky" : "default"}
                  aria-hidden
                  className="invisible h-full w-auto"
                />
                <Logo
                  tone="default"
                  aria-hidden={scrolled}
                  className={cn(
                    "absolute left-0 top-0 h-full w-auto transition-opacity duration-150",
                    scrolled ? "pointer-events-none opacity-0" : "opacity-100",
                  )}
                />
                <Logo
                  tone="sticky"
                  aria-hidden={!scrolled}
                  className={cn(
                    "absolute left-0 top-0 h-full w-auto transition-opacity duration-150",
                    scrolled ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                />
              </span>
            </a>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-5 lg:flex xl:gap-6">
                {navLinks.map((label) => (
                  <DemoLink
                    key={label}
                    className="group relative inline-flex items-center px-0.5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-wssu-black/80 outline-none transition-colors hover:text-wssu-red"
                  >
                    <span className="relative inline-block">
                      {label}
                      <HoverAccentLine floating variant="text" thick fromCenter expandOn="group-hover:w-full" />
                    </span>
                  </DemoLink>
                ))}
                <InformationForMenu scrolled={scrolled} />
              </div>

              <WipeButton
                type="button"
                onClick={() => setMenuOpen(true)}
                wipeFill="red"
                lift={false}
                className={cn(
                  "group",
                  navActionButtonTypography,
                  navActionButtonSize(scrolled),
                  "bg-wssu-black text-wssu-white",
                )}
              >
                <MenuIcon open={menuOpen} /> Menu
              </WipeButton>
            </div>
            </nav>
            </div>
          </div>
        </div>
      </div>

      <SiteMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
