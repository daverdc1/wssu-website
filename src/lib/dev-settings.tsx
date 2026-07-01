import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AnnouncementPriority = "normal" | "high";

export type AnnouncementSettings = {
  enabled: boolean;
  id: string;
  priority: AnnouncementPriority;
  message: string;
  ctaLabel: string;
};

export const defaultAnnouncementSettings: AnnouncementSettings = {
  enabled: false,
  id: "fall-2026-deadline",
  priority: "normal",
  message: "Fall 2026 priority application deadline is March 15.",
  ctaLabel: "Apply now",
};

const DEV_UNLOCK_STORAGE_KEY = "wssu-dev-unlocked";
const DEV_CHEAT_CODE = "idkfa";

export function announcementStorageKey(id: string) {
  return `wssu-announcement-dismissed:${id}`;
}

type DevSettingsContextValue = {
  devModeUnlocked: boolean;
  announcement: AnnouncementSettings;
  updateAnnouncement: (patch: Partial<AnnouncementSettings>) => void;
  resetAnnouncementDismiss: () => void;
  dismissNonce: number;
};

const DevSettingsContext = createContext<DevSettingsContextValue | null>(null);

export function DevSettingsProvider({ children }: { children: ReactNode }) {
  const [devModeUnlocked, setDevModeUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(DEV_UNLOCK_STORAGE_KEY) === "true";
  });
  const [announcement, setAnnouncement] = useState<AnnouncementSettings>(
    defaultAnnouncementSettings,
  );
  const [dismissNonce, setDismissNonce] = useState(0);

  useEffect(() => {
    if (devModeUnlocked) return;

    let buffer = "";

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      if (event.key.length !== 1) return;

      buffer = (buffer + event.key.toLowerCase()).slice(-DEV_CHEAT_CODE.length);
      if (buffer !== DEV_CHEAT_CODE) return;

      setDevModeUnlocked(true);
      sessionStorage.setItem(DEV_UNLOCK_STORAGE_KEY, "true");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [devModeUnlocked]);

  const updateAnnouncement = useCallback((patch: Partial<AnnouncementSettings>) => {
    setAnnouncement((current) => ({ ...current, ...patch }));
  }, []);

  const resetAnnouncementDismiss = useCallback(() => {
    setDismissNonce((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({
      devModeUnlocked,
      announcement,
      updateAnnouncement,
      resetAnnouncementDismiss,
      dismissNonce,
    }),
    [announcement, devModeUnlocked, dismissNonce, resetAnnouncementDismiss, updateAnnouncement],
  );

  return <DevSettingsContext.Provider value={value}>{children}</DevSettingsContext.Provider>;
}

export function useDevSettings() {
  const context = useContext(DevSettingsContext);
  if (!context) {
    throw new Error("useDevSettings must be used within DevSettingsProvider");
  }
  return context;
}

export function useDevSettingsOptional() {
  return useContext(DevSettingsContext);
}
