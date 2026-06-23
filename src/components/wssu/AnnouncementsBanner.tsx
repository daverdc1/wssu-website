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

  const ctaClassName = cn(
    "announcement-banner-cta shrink-0 whitespace-nowrap text-sm font-semibold leading-none text-wssu-white underline decoration-wssu-white underline-offset-[3px] md:text-[0.9375rem]",
    "transition-colors hover:text-wssu-gold hover:decoration-wssu-gold",
  );

  return (
    <div
      role="region"
      aria-label={isHighPriority ? "Important site announcement" : "Site announcement"}
      className={cn(
        "relative z-[60] border-b border-wssu-black/10 text-wssu-white",
        isHighPriority ? "bg-wssu-red" : "bg-wssu-black",
      )}
      data-announcement-banner
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

      <div className="announcement-banner-inner flex min-h-11 items-center gap-2 py-2 md:h-12 md:gap-4 md:py-0">
        <div className="flex min-w-0 flex-1 items-center gap-2 font-sans text-sm leading-none md:gap-3 md:text-[0.9375rem]">
          <span
            className={cn(
              "hidden h-5 shrink-0 items-center font-mono text-[10px] font-medium uppercase leading-none tracking-[0.28em] sm:inline-flex",
              isHighPriority
                ? "rounded-full bg-wssu-black px-2.5 text-wssu-white"
                : "text-wssu-gold",
            )}
          >
            Announcement
          </span>
          <div className="flex min-w-0 flex-1 items-baseline">
            <p className="min-w-0 truncate leading-none text-wssu-white/90">{message}</p>
            <DemoLink className={ctaClassName}>{ctaLabel}</DemoLink>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="-mr-0.5 shrink-0 rounded-sm p-0.5 text-wssu-white/70 transition-colors hover:bg-wssu-white/10 hover:text-wssu-white md:mr-0 md:p-1"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
