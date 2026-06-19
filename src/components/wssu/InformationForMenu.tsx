import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoLink } from "./DemoLink";
import { navActionButtonSize, navActionButtonTypography } from "./navButtonStyles";

const audienceItems = [
  "Prospective Students",
  "Current Students",
  "Alumni & Friends",
  "Parents & Families",
  "Faculty & Staff",
];

type InformationForMenuProps = {
  scrolled?: boolean;
};

export function InformationForMenu({ scrolled = false }: InformationForMenuProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = "information-for-menu";

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleEnter = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          handleLeave();
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          navActionButtonTypography,
          navActionButtonSize(scrolled),
          "box-border border outline-none",
          open
            ? "border-wssu-red bg-transparent text-wssu-red"
            : "border-wssu-black/20 bg-transparent text-wssu-black/80 hover:border-wssu-red hover:bg-wssu-black/[0.035] hover:text-wssu-red",
        )}
        onClick={() => setOpen((value) => !value)}
      >
        Information For
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-300",
            open && "rotate-180",
          )}
          strokeWidth={2.5}
        />
      </button>

      <div
        id={panelId}
        role="menu"
        aria-hidden={!open}
        className={cn(
          "absolute -left-2 top-[calc(100%+0.35rem)] z-50 w-[18.5rem] pt-2 transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        <div className="overflow-hidden border border-wssu-black/10 bg-wssu-white shadow-[0_18px_40px_-24px_rgba(9,9,11,0.45)]">
          <ul className="py-0.5">
            {audienceItems.map((item) => (
              <li key={item}>
                <DemoLink
                  role="menuitem"
                  tabIndex={open ? 0 : -1}
                  className="group/item flex w-full items-center justify-between gap-4 px-5 py-2 font-sans text-sm font-semibold tracking-[0.01em] text-wssu-black/75 transition-colors duration-200 hover:bg-wssu-paper hover:text-wssu-red"
                >
                  <span className="relative inline-block transition-transform duration-200 group-hover/item:translate-x-0.5">
                    {item}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 top-full mt-0.5 hidden h-px w-full bg-wssu-red group-hover/item:block"
                    />
                  </span>
                  <ArrowRight
                    className="size-3.5 shrink-0 text-wssu-red opacity-0 transition-all duration-200 -translate-x-2 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                    strokeWidth={2.5}
                  />
                </DemoLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
