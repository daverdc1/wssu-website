import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type DemoLinkProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

/** Demo-only control that preserves link styling without scrolling or navigation. */
export function DemoLink({ className, children, type = "button", ...props }: DemoLinkProps) {
  return (
    <button type={type} className={cn("cursor-pointer", className)} {...props}>
      {children}
    </button>
  );
}
