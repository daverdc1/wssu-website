import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CtaArrowIconProps = {
  className?: string;
};

export function CtaArrowIcon({ className }: CtaArrowIconProps) {
  return (
    <span
      className={cn("relative inline-flex size-5 shrink-0 overflow-hidden md:size-6", className)}
      aria-hidden="true"
    >
      <span className="flex size-full items-center justify-center transition-transform duration-300 ease-out group-hover:translate-x-full group-hover:-translate-y-full">
        <ArrowUpRight className="size-5 md:size-6" strokeWidth={2.5} />
      </span>
      <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out -translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0">
        <ArrowUpRight className="size-5 md:size-6" strokeWidth={2.5} />
      </span>
    </span>
  );
}
