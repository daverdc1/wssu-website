import { useState } from "react";
import { Settings } from "lucide-react";
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

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const { announcement, updateAnnouncement, resetAnnouncementDismiss } = useDevSettings();

  if (!import.meta.env.DEV) return null;

  const handleAnnouncementChange = (patch: Parameters<typeof updateAnnouncement>[0]) => {
    updateAnnouncement(patch);
    scrollToTop();
  };

  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-[200] font-sans text-xs text-wssu-black">
      <div className="pointer-events-auto flex items-end gap-0">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="wssu-dev-panel"
          aria-label={open ? "Close announcement controls" : "Open announcement controls"}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full border border-wssu-black/12 bg-wssu-white text-wssu-black/65 shadow-[0_8px_28px_-12px_rgba(9,9,11,0.35)] transition-[color,background-color,transform,border-color] duration-300 ease-out",
            "hover:border-wssu-teal/35 hover:bg-wssu-paper hover:text-wssu-teal",
            open && "border-wssu-teal/35 text-wssu-teal",
          )}
        >
          <Settings className="size-4" strokeWidth={2.25} />
        </button>

        <aside
          id="wssu-dev-panel"
          aria-hidden={!open}
          className={cn(
            "origin-bottom-left overflow-hidden rounded-sm border border-wssu-black/12 bg-wssu-white shadow-[0_12px_40px_-16px_rgba(9,9,11,0.45)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform]",
            open
              ? "pointer-events-auto w-40 translate-x-0 scale-100 opacity-100"
              : "pointer-events-none w-40 -translate-x-4 scale-[0.98] opacity-0",
          )}
        >
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
                  handleAnnouncementChange({ enabled });
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
                    onClick={() => handleAnnouncementChange({ priority: value })}
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
        </aside>
      </div>
    </div>
  );
}
