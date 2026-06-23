import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

type LogoProps = {
  className?: string;
  style?: CSSProperties;
  /** Light backgrounds use full color; sticky uses the compact lockup; on-dark inverts the nav logo; footer is full lockup; footer-mono is the white wordmark for dark backgrounds. */
  tone?: "default" | "on-dark" | "footer" | "footer-mono" | "sticky";
  "aria-hidden"?: boolean;
};

export function Logo({ className, style, tone = "default", "aria-hidden": ariaHidden }: LogoProps) {
  const src =
    tone === "footer"
      ? "/wssu-logo-footer.svg"
      : tone === "footer-mono"
        ? "/wssu-logo-footer-mono.svg"
        : tone === "sticky"
          ? "/wssu-logo-sticky.svg"
          : "/wssu-logo.svg";

  return (
    <img
      src={src}
      alt={ariaHidden ? "" : "Winston-Salem State University"}
      aria-hidden={ariaHidden}
      style={style}
      className={cn(
        "h-9 w-auto shrink-0",
        tone === "on-dark" && "brightness-0 invert",
        className,
      )}
    />
  );
}
