import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  announcementStorageKey,
  defaultAnnouncementSettings,
  useDevSettingsOptional,
} from "@/lib/dev-settings";
import { DemoLink } from "./DemoLink";

function readDismissed(id: string) {
  if (typeof window === "undefined") return false;
  if (import.meta.env.DEV) return false;
  return localStorage.getItem(announcementStorageKey(id)) === "true";
}

export function AnnouncementsBanner() {
  const devSettings = useDevSettingsOptional();
  const announcement = devSettings?.announcement ?? defaultAnnouncementSettings;
  const dismissNonce = devSettings?.dismissNonce ?? 0;
  const { enabled, id, priority, message, ctaLabel } = announcement;
  const isHighPriority = priority === "high";

  const [dismissed, setDismissed] = useState(() => readDismissed(id));

  useEffect(() => {
    if (!enabled) return;
    if (import.meta.env.DEV) {
      setDismissed(false);
      return;
    }
    setDismissed(readDismissed(id));
  }, [enabled, id, dismissNonce]);

  const dismiss = () => {
    setDismissed(true);
    if (!import.meta.env.DEV) {
      localStorage.setItem(announcementStorageKey(id), "true");
    }
  };

  if (!enabled || dismissed) return null;

  return (
    <div
      role="region"
      aria-label={isHighPriority ? "Important site announcement" : "Site announcement"}
      className={cn(
        "relative z-[60] border-b border-wssu-black/10 text-wssu-white",
        isHighPriority ? "bg-wssu-red" : "bg-wssu-black",
      )}
    >
      <div className="flex h-1 w-full" aria-hidden="true">
        {isHighPriority ? (
          <span className="flex-1 bg-transparent" />
        ) : (
          <>
            <span className="flex-1 bg-wssu-gold" />
            <span className="flex-1 bg-wssu-teal" />
            <span className="flex-1 bg-wssu-lime" />
          </>
        )}
      </div>

      <div className="section-container flex h-11 items-center justify-between gap-4 md:h-12">
        <div className="flex min-w-0 flex-1 items-center gap-3 font-sans text-sm leading-none md:text-[0.9375rem]">
          <span
            className={cn(
              "inline-flex h-5 shrink-0 items-center font-mono text-[10px] font-medium uppercase leading-none tracking-[0.28em]",
              isHighPriority
                ? "rounded-full bg-wssu-black px-2.5 text-wssu-white"
                : "text-wssu-gold",
            )}
          >
            Announcement
          </span>
          <span className="min-w-0 leading-snug text-wssu-white/90">
            {message}{" "}
            <DemoLink className="font-semibold text-wssu-white underline underline-offset-[3px] decoration-wssu-white/70 transition-colors hover:text-wssu-gold hover:decoration-wssu-gold">
              {ctaLabel}
            </DemoLink>
          </span>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="shrink-0 rounded-sm p-1 text-wssu-white/70 transition-colors hover:bg-wssu-white/10 hover:text-wssu-white"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
