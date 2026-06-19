import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SubnavArrowProps = {
  active?: boolean;
  className?: string;
  activeClassName?: string;
};

export function SubnavArrow({ active, className, activeClassName }: SubnavArrowProps) {
  if (active) {
    return (
      <ArrowRight
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1",
          activeClassName,
          className,
        )}
        strokeWidth={2.5}
      />
    );
  }

  return (
    <span
      className={cn(
        "relative inline-flex size-4 shrink-0 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100",
        className,
      )}
      aria-hidden="true"
    >
      <span className="flex size-full items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-full">
        <ArrowRight className="size-4" strokeWidth={2.5} />
      </span>
      <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] -translate-x-full group-hover:translate-x-0">
        <ArrowRight className="size-4" strokeWidth={2.5} />
      </span>
    </span>
  );
}
