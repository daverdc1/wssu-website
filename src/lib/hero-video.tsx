import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Pause, Play } from "lucide-react";
import { hero } from "@/components/wssu/photos";
import { OptimizedImage } from "@/components/wssu/OptimizedImage";
import { cn } from "@/lib/utils";

const HERO_VIDEO_SRC = "/video/hero.mp4";
const HERO_VIDEO_START_SECONDS = 9.25;
const HERO_VIDEO_END_SECONDS = 55;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

type HeroVideoContextValue = {
  videoRef: RefObject<HTMLVideoElement | null>;
  showVideo: boolean;
  userPaused: boolean;
  playerReady: boolean;
  togglePlayback: () => void;
  enableVideo: () => void;
};

const HeroVideoContext = createContext<HeroVideoContextValue | null>(null);

function useHeroVideo() {
  const context = useContext(HeroVideoContext);
  if (!context) {
    throw new Error("useHeroVideo must be used within HeroVideoProvider");
  }
  return context;
}

function startHeroPlayback(video: HTMLVideoElement) {
  if (video.currentTime < HERO_VIDEO_START_SECONDS - 0.5 || video.currentTime >= HERO_VIDEO_END_SECONDS) {
    video.currentTime = HERO_VIDEO_START_SECONDS;
  }
  void video.play();
}

export function HeroVideoProvider({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPausedRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const showVideo = videoEnabled && !prefersReducedMotion;

  useEffect(() => {
    if (prefersReducedMotion) {
      setVideoEnabled(false);
      setUserPaused(false);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showVideo) return;

    const onCanPlay = () => {
      setPlayerReady(true);
      if (!userPausedRef.current) {
        startHeroPlayback(video);
      }
    };

    const onTimeUpdate = () => {
      if (userPausedRef.current) return;
      if (video.currentTime >= HERO_VIDEO_END_SECONDS - 0.05) {
        video.currentTime = HERO_VIDEO_START_SECONDS;
      }
    };

    const onVisible = () => {
      if (document.visibilityState !== "visible" || userPausedRef.current) return;
      if (video.paused) startHeroPlayback(video);
    };

    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("timeupdate", onTimeUpdate);
    document.addEventListener("visibilitychange", onVisible);

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      onCanPlay();
    }

    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("timeupdate", onTimeUpdate);
      document.removeEventListener("visibilitychange", onVisible);
      video.pause();
      setPlayerReady(false);
    };
  }, [showVideo]);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || !playerReady) return;

    if (!userPausedRef.current) {
      userPausedRef.current = true;
      setUserPaused(true);
      video.pause();
      return;
    }

    userPausedRef.current = false;
    setUserPaused(false);
    void video.play();
  }, [playerReady]);

  const enableVideo = useCallback(() => {
    setVideoEnabled(true);
  }, []);

  const value = useMemo(
    () => ({
      videoRef,
      showVideo,
      userPaused,
      playerReady,
      togglePlayback,
      enableVideo,
    }),
    [enableVideo, playerReady, showVideo, togglePlayback, userPaused],
  );

  return <HeroVideoContext.Provider value={value}>{children}</HeroVideoContext.Provider>;
}

export function HeroVideoLayer() {
  const { videoRef, showVideo } = useHeroVideo();

  return (
    <>
      {showVideo ? (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <video
            ref={videoRef}
            src={HERO_VIDEO_SRC}
            className="size-full object-cover object-center"
            muted
            playsInline
            autoPlay
            preload="auto"
            aria-hidden="true"
          />
        </div>
      ) : (
        <OptimizedImage
          src={hero}
          alt=""
          aria-hidden="true"
          priority
          sizes="100vw"
          className="absolute inset-0 size-full object-cover opacity-65"
        />
      )}

      <div
        className="hero-video-bottom-left-diagonal-mask pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-wssu-black via-wssu-black/55 to-transparent md:h-96"
        aria-hidden="true"
      />
    </>
  );
}

export function HeroVideoControls() {
  const { showVideo, userPaused, togglePlayback, enableVideo } = useHeroVideo();

  const buttonClass = cn(
    "inline-flex items-center justify-center border border-wssu-white/40 bg-wssu-black/65 text-wssu-white shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-colors",
    "p-2 md:gap-2 md:px-2.5 md:py-2",
    "hover:border-wssu-white/60 hover:bg-wssu-black/80",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wssu-white",
  );

  return showVideo ? (
    <button
      type="button"
      onClick={togglePlayback}
      aria-label={userPaused ? "Play background video" : "Pause background video"}
      className={cn(buttonClass, "pointer-events-auto")}
    >
      {userPaused ? (
        <Play className="size-3" strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <Pause className="size-3" strokeWidth={2.25} aria-hidden="true" />
      )}
      <span className="sr-only">{userPaused ? "Play video" : "Pause video"}</span>
      <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] md:inline">
        {userPaused ? "Play video" : "Pause video"}
      </span>
    </button>
  ) : (
    <button
      type="button"
      onClick={enableVideo}
      aria-label="Play background video"
      className={cn(buttonClass, "pointer-events-auto")}
    >
      <Play className="size-3" strokeWidth={2.25} aria-hidden="true" />
      <span className="sr-only">Play video</span>
    </button>
  );
}
