import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export const connectedControlShell =
  "relative inline-flex shrink-0 rounded-[1px] border border-wssu-black/20";

export const connectedControlItem =
  "relative z-10 flex min-h-11 shrink-0 items-center justify-center text-wssu-black transition-colors duration-300";

export const connectedControlDivider = "border-r border-wssu-black/20";

type ConnectedArrowControlsProps = {
  onPrev: () => void;
  onNext: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  playLabel?: string;
  pauseLabel?: string;
};

const arrowBtn = cn(
  connectedControlItem,
  "size-11 hover:bg-wssu-black hover:text-wssu-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-wssu-black",
);

type Segment<T extends string> = {
  value: T;
  label: string;
};

type ConnectedSegmentedControlProps<T extends string> = {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
  animateIndicator?: boolean;
  orientation?: "horizontal" | "vertical";
};

export function ConnectedSegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  className,
  ariaLabel,
  animateIndicator = false,
  orientation = "horizontal",
}: ConnectedSegmentedControlProps<T>) {
  const shellRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const isVertical = orientation === "vertical";

  useEffect(() => {
    if (!animateIndicator) return;

    const updateIndicator = () => {
      const activeIndex = segments.findIndex((segment) => segment.value === value);
      const button = buttonRefs.current[activeIndex];
      const shell = shellRef.current;
      if (!button || !shell) return;

      if (isVertical) {
        setIndicatorStyle({
          top: button.offsetTop,
          left: button.offsetLeft,
          width: button.offsetWidth,
          height: button.offsetHeight,
        });
        return;
      }

      setIndicatorStyle({
        top: button.offsetTop,
        left: button.offsetLeft,
        width: button.offsetWidth,
        height: button.offsetHeight,
      });
    };

    updateIndicator();

    const shell = shellRef.current;
    if (!shell) return;

    const observer = new ResizeObserver(updateIndicator);
    observer.observe(shell);
    window.addEventListener("resize", updateIndicator);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [animateIndicator, isVertical, segments, value]);

  return (
    <div className={cn(isVertical ? "overflow-visible" : "overflow-x-auto", className)}>
      <div
        ref={shellRef}
        className={cn(
          connectedControlShell,
          isVertical && "w-full flex-col",
          animateIndicator && "segmented-control-shell",
        )}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={orientation}
      >
        {animateIndicator ? (
          <span
            aria-hidden="true"
            className={cn(
              "segmented-control-indicator pointer-events-none absolute bg-wssu-black",
              isVertical
                ? "inset-x-0 transition-[top,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                : "inset-y-0 transition-[left,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            )}
            style={{
              top: indicatorStyle.top,
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              height: indicatorStyle.height,
            }}
          />
        ) : null}
        {segments.map((segment, index) => {
          const isActive = value === segment.value;

          return (
            <button
              key={segment.value}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(segment.value)}
              className={cn(
                connectedControlItem,
                "px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em]",
                isVertical
                  ? cn("w-full justify-start", index < segments.length - 1 && "border-b border-wssu-black/20 border-r-0")
                  : cn(index < segments.length - 1 && connectedControlDivider),
                animateIndicator
                  ? isActive
                    ? "text-wssu-white"
                    : "text-wssu-black/70"
                  : cn(
                      isActive ? "bg-wssu-black text-wssu-white" : "text-wssu-black/70",
                      "hover:bg-wssu-black hover:text-wssu-white",
                    ),
              )}
            >
              {segment.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ConnectedArrowControls({
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  prevLabel = "Previous",
  nextLabel = "Next",
  className,
  isPlaying,
  onTogglePlay,
  playLabel = "Play",
  pauseLabel = "Pause",
}: ConnectedArrowControlsProps) {
  return (
    <div className={cn(connectedControlShell, className)}>
      {onTogglePlay ? (
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? pauseLabel : playLabel}
          className={cn(arrowBtn, connectedControlDivider)}
        >
          {isPlaying ? (
            <Pause className="size-4" strokeWidth={2.5} />
          ) : (
            <Play className="size-4" strokeWidth={2.5} />
          )}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label={prevLabel}
        className={cn(arrowBtn, connectedControlDivider)}
      >
        <ArrowLeft className="size-4" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label={nextLabel}
        className={arrowBtn}
      >
        <ArrowRight className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
