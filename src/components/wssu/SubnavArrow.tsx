import { ArrowDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SubnavArrowProps = {
  active?: boolean;
  className?: string;
  activeClassName?: string;
};

const arrowMotion =
  "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

export function SubnavArrow({ active, className, activeClassName }: SubnavArrowProps) {
  if (active) {
    return (
      <>
        <ArrowDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 md:hidden",
            arrowMotion,
            "group-hover:translate-y-0.5",
            activeClassName,
            className,
          )}
          strokeWidth={2.5}
        />
        <ArrowRight
          aria-hidden="true"
          className={cn(
            "hidden size-4 shrink-0 md:block",
            arrowMotion,
            "group-hover:translate-x-1",
            activeClassName,
            className,
          )}
          strokeWidth={2.5}
        />
      </>
    );
  }

  return (
    <>
      <span
        className={cn(
          "relative inline-flex size-4 shrink-0 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:hidden",
          className,
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "flex size-full items-center justify-center",
            arrowMotion,
            "group-hover:translate-y-full",
          )}
        >
          <ArrowDown className="size-4" strokeWidth={2.5} />
        </span>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            arrowMotion,
            "-translate-y-full group-hover:translate-y-0",
          )}
        >
          <ArrowDown className="size-4" strokeWidth={2.5} />
        </span>
      </span>
      <span
        className={cn(
          "relative hidden size-4 shrink-0 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:inline-flex",
          className,
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "flex size-full items-center justify-center",
            arrowMotion,
            "group-hover:translate-x-full",
          )}
        >
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </span>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            arrowMotion,
            "-translate-x-full group-hover:translate-x-0",
          )}
        >
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </span>
      </span>
    </>
  );
}
