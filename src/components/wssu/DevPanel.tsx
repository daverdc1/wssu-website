import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  announcementStorageKey,
  useDevSettings,
  type AnnouncementPriority,
} from "@/lib/dev-settings";

const priorities: { value: AnnouncementPriority; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const { announcement, updateAnnouncement, resetAnnouncementDismiss } = useDevSettings();

  if (!import.meta.env.DEV) return null;

  return (
    <div className="pointer-events-none fixed right-0 top-28 z-[200] font-sans text-xs text-wssu-black">
      <div
        className={cn(
          "pointer-events-auto flex flex-row-reverse items-start overflow-hidden border border-r-0 border-wssu-black/12 bg-wssu-white shadow-[-8px_0_28px_-12px_rgba(9,9,11,0.28)] transition-shadow",
          open && "rounded-l-sm",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="wssu-dev-panel"
          aria-label={open ? "Close announcement controls" : "Open announcement controls"}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center text-wssu-black/65 transition-colors",
            "hover:bg-wssu-paper hover:text-wssu-teal",
            open && "border-l border-wssu-black/12",
            open && "text-wssu-teal",
          )}
        >
          {open ? (
            <ChevronRight className="size-3.5" strokeWidth={2.25} />
          ) : (
            <ChevronLeft className="size-3.5" strokeWidth={2.25} />
          )}
        </button>

        <aside
          id="wssu-dev-panel"
          aria-hidden={!open}
          className={cn(
            "overflow-hidden transition-[width,max-height] duration-300 ease-out",
            open ? "w-40 max-h-96" : "h-0 w-0 max-h-0",
          )}
        >
          {open ? (
            <div className="w-40 px-3 py-3">
            <p className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-wssu-black/80">
              Banner
            </p>

            <label className="mb-4 flex cursor-pointer items-center gap-2.5 text-xs">
              <input
                type="checkbox"
                checked={announcement.enabled}
                onChange={(event) => {
                  const enabled = event.target.checked;
                  if (enabled) {
                    localStorage.removeItem(announcementStorageKey(announcement.id));
                    resetAnnouncementDismiss();
                  }
                  updateAnnouncement({ enabled });
                }}
                className="size-3.5 accent-wssu-teal"
              />
              Show banner
            </label>

            <fieldset className="space-y-2" disabled={!announcement.enabled}>
              <legend className="mb-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-wssu-black/50">
                Type
              </legend>
              <div className="flex gap-1">
                {priorities.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={!announcement.enabled}
                    onClick={() => updateAnnouncement({ priority: value })}
                    className={cn(
                      "flex-1 rounded border px-2 py-1.5 text-[11px] font-medium transition-colors",
                      announcement.priority === value
                        ? "border-wssu-teal bg-wssu-teal/10 text-wssu-teal"
                        : "border-wssu-black/12 text-wssu-black/70 hover:border-wssu-teal/35 hover:bg-wssu-paper",
                      !announcement.enabled && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
