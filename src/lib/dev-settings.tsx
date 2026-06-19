import {
  createContext,
  useCallback,
  useContext,
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
  enabled: true,
  id: "fall-2026-deadline",
  priority: "normal",
  message: "Fall 2026 priority application deadline is March 15.",
  ctaLabel: "Apply now",
};

export function announcementStorageKey(id: string) {
  return `wssu-announcement-dismissed:${id}`;
}

type DevSettingsContextValue = {
  announcement: AnnouncementSettings;
  updateAnnouncement: (patch: Partial<AnnouncementSettings>) => void;
  resetAnnouncementDismiss: () => void;
  dismissNonce: number;
};

const DevSettingsContext = createContext<DevSettingsContextValue | null>(null);

export function DevSettingsProvider({ children }: { children: ReactNode }) {
  const [announcement, setAnnouncement] = useState<AnnouncementSettings>(
    defaultAnnouncementSettings,
  );
  const [dismissNonce, setDismissNonce] = useState(0);

  const updateAnnouncement = useCallback((patch: Partial<AnnouncementSettings>) => {
    setAnnouncement((current) => ({ ...current, ...patch }));
  }, []);

  const resetAnnouncementDismiss = useCallback(() => {
    setDismissNonce((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({
      announcement,
      updateAnnouncement,
      resetAnnouncementDismiss,
      dismissNonce,
    }),
    [announcement, dismissNonce, resetAnnouncementDismiss, updateAnnouncement],
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
