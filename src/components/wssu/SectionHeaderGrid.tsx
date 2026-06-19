import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

type SectionHeaderGridProps = {
  headline: ReactNode;
  label: string;
  aside: ReactNode;
  tone?: Tone;
  headlineClassName?: string;
  asideClassName?: string;
  introWave?: boolean;
};

const labelText: Record<Tone, string> = {
  light: "text-wssu-black/60",
  dark: "text-wssu-white/60",
};

export function SectionLabelMarker({
  label,
  tone = "light",
  className,
  style,
}: {
  label: string;
  tone?: Tone;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={cn("section-label-marker", className)} style={style}>
      <span className={cn("font-mono text-[10px] uppercase tracking-[0.35em]", labelText[tone])}>
        {label}
      </span>
    </div>
  );
}

export function SectionIntroRule({
  tone = "light",
  className,
  style,
}: {
  tone?: Tone;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "section-intro-rule",
        tone === "dark" ? "section-intro-rule--dark" : "section-intro-rule--light",
        className,
      )}
      style={style}
    />
  );
}

/** Full-width rule + right-column section label, grouped tightly. */
export function SectionHeaderLabelRow({
  label,
  tone = "light",
  split = "header",
  className,
  labelClassName,
  ruleClassName,
  style,
  ruleStyle,
}: {
  label: string;
  tone?: Tone;
  /** `header` = cols 8–12 (default sections). `wide` = cols 6–12 (testimonial). */
  split?: "header" | "wide";
  className?: string;
  labelClassName?: string;
  ruleClassName?: string;
  style?: CSSProperties;
  ruleStyle?: CSSProperties;
}) {
  const splitClasses =
    split === "wide"
      ? {
          spacer: "hidden lg:block lg:col-span-5",
          label: "section-label-marker--end lg:col-span-7 lg:col-start-6",
        }
      : {
          spacer: "hidden md:block md:col-span-7",
          label: "section-label-marker--end md:col-span-5 md:col-start-8",
        };

  return (
    <div className={cn("section-header-label-row col-span-full", className)}>
      <SectionIntroRule tone={tone} className={ruleClassName} style={ruleStyle} />
      <div
        className={cn(
          "section-header-label-row__grid grid grid-cols-1 md:grid-cols-12",
          split === "wide" ? "pt-2 lg:pt-2.5" : "pt-2 md:pt-2.5",
        )}
      >
        <div className={splitClasses.spacer} aria-hidden="true" />
        <SectionLabelMarker
          label={label}
          tone={tone}
          style={style}
          className={cn(splitClasses.label, labelClassName)}
        />
      </div>
    </div>
  );
}

export function SectionHeaderGrid({
  headline,
  label,
  aside,
  tone = "light",
  headlineClassName,
  asideClassName,
  introWave = true,
}: SectionHeaderGridProps) {
  return (
    <div className="grid grid-cols-1 gap-y-8 md:grid-cols-12 md:items-center md:gap-x-0 md:gap-y-8">
      <SectionHeaderLabelRow label={label} tone={tone} />
      <div className={cn("md:col-span-5", headlineClassName)}>{headline}</div>
      <div className={cn("section-intro-grid flex min-h-0 flex-col justify-center", asideClassName)}>
        {introWave ? (
          <div
            className={cn(
              "section-intro-wave-wrap w-full",
              tone === "dark" && "section-intro-wave-wrap--dark",
            )}
          >
            {aside}
          </div>
        ) : (
          <div className="w-full">{aside}</div>
        )}
      </div>
    </div>
  );
}
