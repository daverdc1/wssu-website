import { cn } from "@/lib/utils";

type MenuIconProps = {
  className?: string;
  open?: boolean;
};

export function MenuIcon({ className, open = false }: MenuIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-4 shrink-0", className)}
      aria-hidden="true"
    >
      <g
        className={cn(
          "menu-icon-line transition-transform duration-300 ease-out",
          open ? "-translate-y-[3px]" : "group-hover:-translate-y-[3px]",
        )}
      >
        <path
          d="M4 5H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <path
        d="M4 12H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g
        className={cn(
          "menu-icon-line transition-transform duration-300 ease-out",
          open ? "translate-y-[3px]" : "group-hover:translate-y-[3px]",
        )}
      >
        <path
          d="M4 19H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
