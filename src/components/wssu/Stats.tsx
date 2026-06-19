import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { HoverAccentLine } from "./HoverAccentLine";
import { SectionHeaderGrid } from "./SectionHeaderGrid";

type AccentColor = "gold" | "teal" | "lime";

type Stat = {
  value: string;
  labelLines: string[];
  accent?: boolean;
  accentColor?: AccentColor;
};

const stats: Stat[] = [
  { value: "87%", labelLines: ["Graduate in", "six years"], accent: true, accentColor: "gold" },
  { value: "$28K", labelLines: ["Average cost", "per year"], accent: true, accentColor: "teal" },
  { value: "#1", labelLines: ["Social", "mobility in state"], accent: true, accentColor: "lime" },
];

const accentStroke: Record<AccentColor, string> = {
  gold: "[-webkit-text-stroke:2px_#ffcd00]",
  teal: "[-webkit-text-stroke:2px_#00a3ad]",
  lime: "[-webkit-text-stroke:2px_#c4d600]",
};

const accentText: Record<AccentColor, string> = {
  gold: "text-wssu-gold",
  teal: "text-wssu-teal",
  lime: "text-wssu-lime",
};

type ParsedStat =
  | { kind: "count"; target: number; format: (current: number) => string }
  | { kind: "fixed"; format: () => string };

function parseStat(value: string): ParsedStat {
  if (value.endsWith("%")) {
    const target = Number.parseInt(value, 10);
    return { kind: "count", target, format: (current) => `${current}%` };
  }

  if (value.startsWith("$") && value.endsWith("K")) {
    const target = Number.parseInt(value.slice(1), 10);
    return { kind: "count", target, format: (current) => `$${current}K` };
  }

  return { kind: "fixed", format: () => value };
}

function useCountUp(target: number, active: boolean, duration = 800) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) {
      setCurrent(0);
      return;
    }

    let frame = 0;
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCurrent(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, duration, target]);

  return current;
}

function StatCard({ value, labelLines, accent, accentColor = "gold" }: Stat) {
  const [hovered, setHovered] = useState(false);
  const parsed = useMemo(() => parseStat(value), [value]);
  const count = useCountUp(parsed.kind === "count" ? parsed.target : 0, hovered);

  const displayValue =
    hovered && parsed.kind === "count" ? parsed.format(count) : value;

  const strokeColor = accent ? accentStroke[accentColor] : "[-webkit-text-stroke:2px_#fafafa]";

  return (
    <div
      className="group flex flex-col py-10 md:px-10 md:py-0 md:first:pl-0 md:last:pr-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className={cn(
          "inline-block origin-left font-display leading-[0.85] tracking-[-0.02em] text-[clamp(5rem,12vw,11rem)] text-transparent transition-all duration-500 ease-out",
          strokeColor,
          hovered && [
            accentText[accentColor],
            accentStroke[accentColor],
            parsed.kind === "fixed" ? "scale-[1.08]" : "scale-[1.04]",
            "-translate-y-2",
          ],
        )}
      >
        {displayValue}
      </span>
      <p
        className={cn(
          "mt-3 text-xs font-semibold uppercase leading-[1.35] tracking-[0.18em] text-wssu-white/75 transition-all duration-300",
          hovered && "translate-x-1 text-wssu-white",
        )}
      >
        {labelLines.map((line) => (
          <span key={line} className="block whitespace-nowrap">
            {line}
          </span>
        ))}
      </p>
      <HoverAccentLine color={accentColor} className="mt-2" />
    </div>
  );
}

export function Stats() {
  return (
    <section className="bg-wssu-black py-24 text-wssu-white md:py-32">
      <div className="section-header-container">
        <SectionHeaderGrid
          tone="dark"
          label="(01) — The Numbers Don't Lie"
          headline={
            <h2 className="font-display flex flex-col gap-y-[0.04em] text-5xl uppercase leading-[0.95] md:text-7xl">
              <span>The</span>
              <span>Numbers</span>
              <span>Don't Lie.</span>
            </h2>
          }
          aside={
            <p className="section-intro section-intro--dark">
              WSSU is ranked the #1 HBCU in North Carolina for value, a top university in the state for social mobility, and North Carolina's only Carnegie-designated Opportunity College. This is what excellence looks like.
            </p>
          }
        />
      </div>

      <div className="section-container">
        <div className="mt-20 grid grid-cols-1 divide-y divide-wssu-white/15 md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map((stat) => (
            <StatCard key={stat.value} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
