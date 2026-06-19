import { cn } from "@/lib/utils";

type IndicatorAccent = {
  active: string;
  hover: string;
};

type IndicatorProgress = {
  durationMs: number;
  playing: boolean;
  resetKey: number;
  onComplete?: () => void;
};

type SectionIndicatorsProps = {
  count: number;
  current: number;
  onSelect: (index: number) => void;
  accents?: readonly IndicatorAccent[];
  label?: string;
  progress?: IndicatorProgress;
};

const defaultAccent: IndicatorAccent = {
  active: "bg-wssu-red",
  hover: "hover:bg-wssu-red/55",
};

const blogAccents: readonly IndicatorAccent[] = [
  { active: "bg-wssu-gold", hover: "hover:bg-wssu-gold/55" },
  { active: "bg-wssu-teal", hover: "hover:bg-wssu-teal/55" },
  { active: "bg-wssu-lime", hover: "hover:bg-wssu-lime/55" },
  { active: "bg-wssu-coral", hover: "hover:bg-wssu-coral/55" },
  { active: "bg-wssu-violet", hover: "hover:bg-wssu-violet/55" },
  { active: "bg-wssu-blue", hover: "hover:bg-wssu-blue/55" },
  { active: "bg-wssu-red", hover: "hover:bg-wssu-red/55" },
];

export function SectionIndicators({
  count,
  current,
  onSelect,
  accents,
  label = "slide",
  progress,
}: SectionIndicatorsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {Array.from({ length: count }, (_, idx) => {
        const accent = accents?.[idx % accents.length] ?? defaultAccent;
        const isActive = idx === current;
        const showProgress = isActive && progress != null;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(idx)}
            aria-label={`Go to ${label} ${idx + 1}`}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "relative h-1.5 shrink-0 cursor-pointer overflow-hidden transition-[width,background-color] duration-300 ease-out",
              isActive
                ? showProgress
                  ? "w-8 bg-wssu-black/15"
                  : cn("w-8", accent.active)
                : cn("w-2.5 bg-wssu-black/15", accent.hover, "hover:w-6"),
            )}
          >
            {showProgress ? (
              <span
                key={progress.resetKey}
                aria-hidden="true"
                className={cn(
                  "section-indicator-progress absolute inset-y-0 left-0",
                  accent.active,
                )}
                style={{
                  animationDuration: `${progress.durationMs}ms`,
                  animationPlayState: progress.playing ? "running" : "paused",
                }}
                onAnimationEnd={(event) => {
                  if (event.animationName !== "section-indicator-progress") return;
                  if (progress.playing) progress.onComplete?.();
                }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export { blogAccents };
