import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Stroke width in SVG units */
  strokeWidth?: number;
  /** When true, animates draw-in once visible */
  animateOnView?: boolean;
  /** Color */
  color?: string;
  /** Slight rotation in deg */
  rotate?: number;
  /** Tighter ellipse for shorter words */
  size?: "default" | "sm" | "lg" | "hero" | "cta";
  /** Contrast stroke when circling red text — dark on light bg, white on dark bg */
  tone?: "default" | "on-red" | "on-dark";
};

/** Smooth marker oval — two full passes plus a quick accent stroke. */
const circlePaths = {
  main: "M 30 60 Q 20 25 90 18 Q 170 8 240 22 Q 290 32 285 65 Q 280 95 200 100 Q 110 105 50 92 Q 18 82 28 55",
  pass: "M 26 58 Q 18 28 95 16 Q 175 6 245 24 Q 288 38 282 68 Q 275 92 205 98 Q 115 104 48 90 Q 22 80 26 58",
  accent: "M 36 64 Q 30 32 100 24 Q 180 14 246 28",
} as const;

const underlinePaths = {
  main: "M 4 18 Q 60 6 150 14 T 296 12",
  pass: "M 6 20 Q 65 8 155 16 T 294 14",
} as const;

/** Soft ink bleed — brushed edges without warping the stroke shape. */
function MarkerBrushFilter({ id }: { id: string }) {
  return (
    <defs>
      <filter
        id={id}
        x="-30%"
        y="-30%"
        width="160%"
        height="160%"
        colorInterpolationFilters="sRGB"
      >
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.1" result="bleed" />
        <feColorMatrix
          in="bleed"
          type="matrix"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.42 0"
          result="soft"
        />
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.25" result="edge" />
        <feMerge>
          <feMergeNode in="soft" />
          <feMergeNode in="edge" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

type BrushPathProps = {
  d: string;
  color: string;
  strokeWidth: number;
  opacity?: number;
  filter?: string;
};

function BrushPath({ d, color, strokeWidth, opacity = 1, filter }: BrushPathProps) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      filter={filter}
    />
  );
}

/**
 * Hand-drawn red marker oval, scribbled around a word.
 * Renders absolutely positioned over its parent.
 */
const sizeStyles = {
  default:
    "-top-7 -left-9 right-0 -bottom-1 h-[calc(100%+3rem)] w-[calc(100%+3.75rem)] [--dash:760]",
  sm: "-top-5 -left-7 right-0 -bottom-0.5 h-[calc(100%+2.5rem)] w-[calc(100%+3rem)] [--dash:620]",
  lg: "-top-9 -left-11 right-0 -bottom-2 h-[calc(100%+3.75rem)] w-[calc(100%+4.75rem)] [--dash:820]",
  hero: "-top-[0.34em] -left-[0.5em] right-[0.06em] -bottom-[0.05em] h-[calc(100%+0.62em)] w-[calc(100%+0.9em)] [--dash:900]",
  cta: "-top-[0.3em] -left-[0.56em] right-[0.14em] -bottom-[0.02em] h-[calc(100%+0.54em)] w-[calc(100%+0.82em)] [--dash:980]",
} as const;

export function MarkerCircle({
  className = "",
  strokeWidth = 4.5,
  animateOnView = true,
  color = "var(--wssu-red)",
  rotate = -3,
  size = "default",
  tone = "default",
}: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const [seen, setSeen] = useState(!animateOnView);
  const filterId = useId().replace(/:/g, "");
  const strokeColor =
    tone === "on-red"
      ? "var(--wssu-black)"
      : tone === "on-dark"
        ? "var(--wssu-white)"
        : color;
  const weight = tone !== "default" ? strokeWidth * 1.15 : strokeWidth;

  useEffect(() => {
    if (!animateOnView || seen) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSeen(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animateOnView, seen]);

  const brush = `url(#${filterId})`;

  return (
    <svg
      ref={ref}
      viewBox="0 0 300 110"
      preserveAspectRatio={size === "hero" || size === "cta" ? "xMidYMid meet" : "none"}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute overflow-visible",
        sizeStyles[size],
        seen && "animate-marker",
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` } as CSSProperties}
    >
      <MarkerBrushFilter id={filterId} />
      <BrushPath d={circlePaths.main} color={strokeColor} strokeWidth={weight} filter={brush} />
      <BrushPath
        d={circlePaths.pass}
        color={strokeColor}
        strokeWidth={weight * 0.85}
        opacity={0.72}
        filter={brush}
      />
      <BrushPath
        d={circlePaths.accent}
        color={strokeColor}
        strokeWidth={weight * 0.6}
        opacity={0.55}
        filter={brush}
      />
    </svg>
  );
}

type UnderlineProps = Omit<Props, "rotate" | "size"> & {
  /** Draw in on scroll (default) or on parent group hover */
  trigger?: "view" | "hover";
  /** Tighter placement for nav links */
  variant?: "default" | "nav";
};

const underlinePosition = {
  default: "-bottom-3 left-0 h-4 w-full",
  nav: "-bottom-1.5 left-0 h-3 w-full",
} as const;

/** Marker underline — a brushed red stroke under a word. */
export function MarkerUnderline({
  className = "",
  color = "var(--wssu-red)",
  strokeWidth = 7,
  animateOnView = true,
  trigger = "view",
  variant = "default",
}: UnderlineProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [seen, setSeen] = useState(trigger === "hover" || !animateOnView);
  const filterId = useId().replace(/:/g, "");

  useEffect(() => {
    if (trigger === "hover" || !animateOnView || seen) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSeen(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animateOnView, seen, trigger]);

  const animationClass =
    trigger === "hover"
      ? "marker-underline-hover"
      : seen
        ? "animate-marker"
        : "";

  const brush = `url(#${filterId})`;

  return (
    <svg
      ref={ref}
      viewBox="0 0 300 30"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute overflow-visible ${underlinePosition[variant]} ${animationClass} ${className}`}
      style={{ "--dash": 340 } as CSSProperties}
    >
      <MarkerBrushFilter id={filterId} />
      <BrushPath d={underlinePaths.main} color={color} strokeWidth={strokeWidth} filter={brush} />
      <BrushPath
        d={underlinePaths.pass}
        color={color}
        strokeWidth={strokeWidth * 0.8}
        opacity={0.7}
        filter={brush}
      />
    </svg>
  );
}
