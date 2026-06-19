import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const wipeFillColors = {
  black: "bg-wssu-black",
  red: "bg-wssu-red",
  white: "bg-wssu-white",
  gold: "bg-wssu-gold",
} as const;

export type WipeFill = keyof typeof wipeFillColors;

type WipeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  wipeFill: WipeFill;
};

export function WipeButtonFill({ fill }: { fill: WipeFill }) {
  return (
    <span aria-hidden="true" className="btn-wipe__fill pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <span className={cn("btn-wipe__fill-inner", wipeFillColors[fill])} />
    </span>
  );
}

export function WipeButtonContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("btn-wipe__content relative z-10 inline-flex items-center gap-[inherit]", className)}>
      {children}
    </span>
  );
}

/** Solid button with an angled color wipe on hover/focus. */
export function WipeButton({
  children,
  className,
  wipeFill,
  type = "button",
  ...props
}: WipeButtonProps) {
  return (
    <button
      type={type}
      className={cn("btn-wipe relative isolate cursor-pointer overflow-hidden", className)}
      {...props}
    >
      <WipeButtonFill fill={wipeFill} />
      <WipeButtonContent>{children}</WipeButtonContent>
    </button>
  );
}
