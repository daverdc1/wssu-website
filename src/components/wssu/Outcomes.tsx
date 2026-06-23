import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoLink } from "./DemoLink";
import { HoverAccentLine } from "./HoverAccentLine";
import { MarkerCircle } from "./MarkerCircle";
import { OptimizedImage } from "./OptimizedImage";
import { SectionHeaderGrid } from "./SectionHeaderGrid";
import { photos } from "./photos";

const accentLabels = ["text-wssu-gold", "text-wssu-teal", "text-wssu-lime"] as const;
const accentHovers = ["hover:text-wssu-gold", "hover:text-wssu-teal", "hover:text-wssu-lime"] as const;
const accentLineColors = ["gold", "teal", "lime"] as const;

const items = [
  {
    n: "01",
    titleLines: ["You Launch a Career", "That Matters."],
    body: "WSSU programs are built around the fields North Carolina needs most — nursing, education, bio-manufacturing, technology, and beyond. That alignment means our graduates are sought after before they even walk across the stage. You won't spend months searching for a fit. You'll graduate into one.",
    cta: "See How We Prepare You",
  },
  {
    n: "02",
    titleLines: ["You Stay. You Lead.", "You Lift."],
    body: "More than 9,000 WSSU alumni remain in the Piedmont Triad after graduation — not because they had to, but because they're invested in the community that invested in them. WSSU graduates fuel the regional economy, strengthen local institutions, and rise into leadership roles that create opportunity for the next generation.",
    cta: "See Where Rams Land",
  },
  {
    n: "03",
    titleLines: ["You Move Up —", "Not Just Forward."],
    body: "WSSU is ranked a top university in North Carolina for social mobility — meaning our graduates consistently move into higher income brackets and better opportunities than where they started. A WSSU degree isn't just a credential. It's a proven pathway to a life that is bigger, bolder, and more financially secure than before.",
    cta: "Meet Rams Who Are Rising",
  },
];

export function Outcomes() {
  return (
    <section className="relative overflow-hidden bg-wssu-black py-24 text-wssu-white md:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <OptimizedImage
          src={photos[6]}
          alt=""
          aria-hidden="true"
          sizes="60vw"
          className="absolute -bottom-[18%] -left-[8%] h-[72%] w-[58%] max-w-none object-cover opacity-[0.14] mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-wssu-black via-wssu-black/96 to-wssu-black/88" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_15%_85%,rgba(200,16,46,0.08),transparent_55%)]" />
      </div>

      <div className="relative z-10">
      <div className="section-header-container">
        <SectionHeaderGrid
          tone="dark"
          label="(03) — Outcomes"
          headline={
            <h2 className="font-display flex flex-col gap-y-[0.04em] text-5xl uppercase leading-[0.95] md:text-7xl">
              <span>Life after</span>
              <span>
                WSSU is the{" "}
                <span className="relative inline-block text-wssu-red">
                  beginning
                  <MarkerCircle
                    rotate={-4}
                    color="var(--wssu-gold)"
                    size="sm"
                    className="-left-7 -top-5 w-[calc(100%+3rem)] md:hidden"
                  />
                  <MarkerCircle
                    rotate={-4}
                    color="var(--wssu-gold)"
                    className="-left-16 -top-8 -right-3 hidden w-[calc(100%+7rem)] md:block"
                  />
                </span>
              </span>
              <span className="text-wssu-white">— not the</span>
              <span className="text-wssu-white">finish line.</span>
            </h2>
          }
          aside={
            <p className="section-intro section-intro--dark">
              WSSU graduates don't just find jobs—they build careers. Our alumni work at Fortune 500 companies, lead nonprofits, start their own businesses, and transform their communities. See where the RAMILY goes from here.
            </p>
          }
        />
      </div>

      <div className="section-container">
        <div className="mt-20 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
          {items.map((it, idx) => (
            <div key={it.n} className="flex flex-col border-t border-wssu-white/20 pt-8">
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.35em] ${accentLabels[idx]}`}
              >
                ({it.n})
              </span>
              <h3 className="mt-6 font-display text-2xl uppercase leading-[1.05] md:text-[1.7rem]">
                {it.titleLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h3>
              <p className="mt-5 flex-1 text-sm leading-relaxed text-wssu-white/75 md:text-base">
                {it.body}
              </p>
              <DemoLink
                className={cn(
                  "group relative mt-8 inline-flex text-xs font-bold uppercase tracking-[0.15em] text-wssu-white transition-colors",
                  accentHovers[idx],
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {it.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                </span>
                <HoverAccentLine floating color={accentLineColors[idx]} />
              </DemoLink>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
