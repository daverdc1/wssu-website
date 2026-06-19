import { cn } from "@/lib/utils";

const lineColors = {
  red: "bg-wssu-red",
  gold: "bg-wssu-gold",
  teal: "bg-wssu-teal",
  lime: "bg-wssu-lime",
  white: "bg-wssu-white",
} as const;

type HoverAccentLineProps = {
  className?: string;
  color?: keyof typeof lineColors;
  expandOn?: string;
  /** Match the width of the label text instead of a fixed length */
  variant?: "fixed" | "text";
  thick?: boolean;
  /** Position below the label without affecting vertical alignment */
  floating?: boolean;
  /** Grow from the center outward instead of from the left */
  fromCenter?: boolean;
};

export function HoverAccentLine({
  className,
  color = "red",
  expandOn,
  variant = "fixed",
  thick = false,
  floating = false,
  fromCenter = false,
}: HoverAccentLineProps) {
  const widthOnHover = expandOn ?? (variant === "text" ? "group-hover:w-full" : "group-hover:w-12");

  return (
    <span
      aria-hidden="true"
      className={cn(
        "block w-0 transition-all duration-500 ease-out",
        floating ? "absolute top-full mt-1" : "mt-1.5",
        fromCenter ? "left-1/2 -translate-x-1/2" : floating && "left-0",
        thick ? "h-[2px]" : "h-px",
        widthOnHover,
        lineColors[color],
        className,
      )}
    />
  );
}
