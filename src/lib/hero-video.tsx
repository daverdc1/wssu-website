import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Pause, Play } from "lucide-react";
import { hero, photoDefaultSrc } from "@/components/wssu/photos";
import { OptimizedImage } from "@/components/wssu/OptimizedImage";
import { cn } from "@/lib/utils";

const HERO_VIDEO_DESKTOP_SRC = "/video/hero.mp4";
const HERO_VIDEO_MOBILE_SRC = "/video/hero-mobile.mp4";
const HERO_POSTER_SRC = photoDefaultSrc(hero);
const MAX_AUTOPLAY_ATTEMPTS = 6;

function getHeroVideoSrc() {
  if (typeof window === "undefined") return HERO_VIDEO_DESKTOP_SRC;
  return window.matchMedia("(pointer: coarse)").matches
    ? HERO_VIDEO_MOBILE_SRC
    : HERO_VIDEO_DESKTOP_SRC;
}

function prepareVideoElement(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("disablepictureinpicture", "");
}

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
  setVideoRef: (node: HTMLVideoElement | null) => void;
  showVideo: boolean;
  userPaused: boolean;
  hasRenderedFrame: boolean;
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

export function HeroVideoProvider({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const userPausedRef = useRef(false);
  const hasRenderedFrameRef = useRef(false);
  const autoplayAttemptsRef = useRef(0);
  const autoplayRetryTimerRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const [hasRenderedFrame, setHasRenderedFrame] = useState(false);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  const showVideo = videoEnabled && !prefersReducedMotion;

  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    setVideoEl(node);
  }, []);

  const markRenderedFrame = useCallback(() => {
    if (hasRenderedFrameRef.current) return;
    hasRenderedFrameRef.current = true;
    setHasRenderedFrame(true);
  }, []);

  const markAutoplayBlocked = useCallback(() => {
    userPausedRef.current = true;
    setUserPaused(true);
  }, []);

  const clearAutoplayRetry = useCallback(() => {
    if (autoplayRetryTimerRef.current !== null) {
      window.clearTimeout(autoplayRetryTimerRef.current);
      autoplayRetryTimerRef.current = null;
    }
  }, []);

  const playVideo = useCallback(
    (video: HTMLVideoElement, { fromUserGesture = false } = {}) => {
      prepareVideoElement(video);

      const playPromise = video.play();
      if (!playPromise) {
        if (!video.paused) {
          autoplayAttemptsRef.current = 0;
          clearAutoplayRetry();
          markRenderedFrame();
        }
        return;
      }

      playPromise
        .then(() => {
          autoplayAttemptsRef.current = 0;
          clearAutoplayRetry();
          markRenderedFrame();
        })
        .catch(() => {
          if (fromUserGesture || userPausedRef.current) {
            markAutoplayBlocked();
            return;
          }

          autoplayAttemptsRef.current += 1;
          if (autoplayAttemptsRef.current >= MAX_AUTOPLAY_ATTEMPTS) {
            markAutoplayBlocked();
            return;
          }

          clearAutoplayRetry();
          autoplayRetryTimerRef.current = window.setTimeout(() => {
            if (!userPausedRef.current && video.paused) {
              playVideo(video);
            }
          }, 250 * autoplayAttemptsRef.current);
        });
    },
    [clearAutoplayRetry, markAutoplayBlocked, markRenderedFrame],
  );

  const attemptAutoplay = useCallback(
    (video: HTMLVideoElement) => {
      if (userPausedRef.current || !video.paused) return;
      playVideo(video);
    },
    [playVideo],
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      setVideoEnabled(false);
      setUserPaused(false);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    const video = videoEl;
    if (!video || !showVideo) return;

    prepareVideoElement(video);
    autoplayAttemptsRef.current = 0;
    userPausedRef.current = false;
    setUserPaused(false);

    const tryAutoplay = () => {
      if (!userPausedRef.current && video.paused) {
        attemptAutoplay(video);
      }
    };

    const onPlaying = () => {
      markRenderedFrame();
    };

    const onVisible = () => {
      if (document.visibilityState !== "visible" || userPausedRef.current) return;
      tryAutoplay();
    };

    video.addEventListener("loadedmetadata", tryAutoplay);
    video.addEventListener("loadeddata", tryAutoplay);
    video.addEventListener("canplay", tryAutoplay);
    video.addEventListener("canplaythrough", tryAutoplay);
    video.addEventListener("playing", onPlaying);
    document.addEventListener("visibilitychange", onVisible);

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              if (!entry?.isIntersecting || userPausedRef.current) return;
              tryAutoplay();
            },
            { threshold: 0.1 },
          )
        : null;

    const heroSection = document.getElementById("hero");
    if (heroSection) observer?.observe(heroSection);

    tryAutoplay();

    return () => {
      clearAutoplayRetry();
      video.removeEventListener("loadedmetadata", tryAutoplay);
      video.removeEventListener("loadeddata", tryAutoplay);
      video.removeEventListener("canplay", tryAutoplay);
      video.removeEventListener("canplaythrough", tryAutoplay);
      video.removeEventListener("playing", onPlaying);
      document.removeEventListener("visibilitychange", onVisible);
      observer?.disconnect();
    };
  }, [
    attemptAutoplay,
    clearAutoplayRetry,
    markRenderedFrame,
    showVideo,
    videoEl,
  ]);

  useEffect(() => {
    if (showVideo) return;
    videoRef.current?.pause();
  }, [showVideo]);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!userPausedRef.current) {
      userPausedRef.current = true;
      setUserPaused(true);
      clearAutoplayRetry();
      video.pause();
      return;
    }

    userPausedRef.current = false;
    setUserPaused(false);
    autoplayAttemptsRef.current = 0;
    playVideo(video, { fromUserGesture: true });
  }, [clearAutoplayRetry, playVideo]);

  const enableVideo = useCallback(() => {
    setVideoEnabled(true);
  }, []);

  const value = useMemo(
    () => ({
      setVideoRef,
      showVideo,
      userPaused,
      hasRenderedFrame,
      togglePlayback,
      enableVideo,
    }),
    [enableVideo, hasRenderedFrame, setVideoRef, showVideo, togglePlayback, userPaused],
  );

  return <HeroVideoContext.Provider value={value}>{children}</HeroVideoContext.Provider>;
}

export function HeroVideoLayer() {
  const { setVideoRef, showVideo, hasRenderedFrame } = useHeroVideo();
  const [videoSrc, setVideoSrc] = useState(HERO_VIDEO_DESKTOP_SRC);

  useEffect(() => {
    setVideoSrc(getHeroVideoSrc());
  }, []);

  return (
    <>
      {showVideo ? (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <video
            key={videoSrc}
            ref={setVideoRef}
            src={videoSrc}
            className="size-full object-cover object-center"
            poster={HERO_POSTER_SRC}
            muted
            defaultMuted
            playsInline
            autoPlay
            loop
            preload="auto"
            aria-hidden="true"
          />
          {!hasRenderedFrame ? (
            <OptimizedImage
              src={hero}
              alt=""
              aria-hidden="true"
              priority
              sizes="100vw"
              className="absolute inset-0 z-[1] size-full object-cover"
            />
          ) : null}

          <div
            className="hero-video-overlay pointer-events-none absolute inset-0 z-[2]"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute inset-0 z-[3] bg-wssu-black/10 md:hidden"
            aria-hidden="true"
          />
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <OptimizedImage
            src={hero}
            alt=""
            aria-hidden="true"
            priority
            sizes="100vw"
            className="absolute inset-0 size-full object-cover opacity-65"
          />

          <div
            className="hero-video-overlay pointer-events-none absolute inset-0 z-[2]"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute inset-0 z-[3] bg-wssu-black/10 md:hidden"
            aria-hidden="true"
          />
        </div>
      )}

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
    "inline-flex items-center justify-center rounded-full border border-wssu-white/90 bg-wssu-white text-wssu-black shadow-[0_4px_16px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-colors",
    "p-3 md:gap-2 md:p-2 md:px-2.5 md:py-2",
    "hover:border-wssu-white hover:bg-wssu-white/90",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wssu-white",
  );

  const iconClass = "size-4 md:size-3";

  return showVideo ? (
    <button
      type="button"
      onClick={togglePlayback}
      aria-label={userPaused ? "Play background video" : "Pause background video"}
      className={cn(buttonClass, "pointer-events-auto")}
    >
      {userPaused ? (
        <Play className={iconClass} strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <Pause className={iconClass} strokeWidth={2.25} aria-hidden="true" />
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
      <Play className={iconClass} strokeWidth={2.25} aria-hidden="true" />
      <span className="sr-only">Play video</span>
    </button>
  );
}
