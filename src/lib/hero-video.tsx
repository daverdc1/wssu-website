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
const HERO_VIDEO_START_SECONDS = 9.25;
const HERO_VIDEO_END_SECONDS = 55;

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

function seekToLoopStart(video: HTMLVideoElement) {
  if (
    video.currentTime < HERO_VIDEO_START_SECONDS - 0.5 ||
    video.currentTime >= HERO_VIDEO_END_SECONDS
  ) {
    try {
      video.currentTime = HERO_VIDEO_START_SECONDS;
    } catch {
      // iOS can throw if metadata is not ready yet.
    }
  }
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
  const prefersReducedMotion = usePrefersReducedMotion();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const [hasRenderedFrame, setHasRenderedFrame] = useState(false);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState(HERO_VIDEO_DESKTOP_SRC);

  const showVideo = videoEnabled && !prefersReducedMotion;

  useEffect(() => {
    setVideoSrc(getHeroVideoSrc());
  }, []);

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

  const playFromGesture = useCallback((video: HTMLVideoElement) => {
    prepareVideoElement(video);

    if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
      video.load();
    }

    const playPromise = video.play();
    if (!playPromise) return;

    playPromise
      .then(() => {
        seekToLoopStart(video);
        markRenderedFrame();
      })
      .catch(() => {
        markAutoplayBlocked();
      });
  }, [markAutoplayBlocked, markRenderedFrame]);

  const attemptAutoplay = useCallback(
    (video: HTMLVideoElement) => {
      if (userPausedRef.current) return;

      prepareVideoElement(video);
      const playPromise = video.play();

      if (!playPromise) return;

      playPromise
        .then(() => {
          seekToLoopStart(video);
          markRenderedFrame();
        })
        .catch(() => {
          markAutoplayBlocked();
        });
    },
    [markAutoplayBlocked, markRenderedFrame],
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
    video.src = videoSrc;
    video.load();

    const onLoadedMetadata = () => {
      seekToLoopStart(video);
    };

    const onCanPlay = () => {
      if (!userPausedRef.current) {
        attemptAutoplay(video);
      }
    };

    const onPlaying = () => {
      markRenderedFrame();
    };

    const onTimeUpdate = () => {
      if (userPausedRef.current) return;
      if (video.currentTime >= HERO_VIDEO_END_SECONDS - 0.05) {
        video.currentTime = HERO_VIDEO_START_SECONDS;
      }
    };

    const onVisible = () => {
      if (document.visibilityState !== "visible" || userPausedRef.current) return;
      if (video.paused) attemptAutoplay(video);
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onTimeUpdate);
    document.addEventListener("visibilitychange", onVisible);

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              if (!entry?.isIntersecting || userPausedRef.current) return;
              if (video.paused) attemptAutoplay(video);
            },
            { threshold: 0.1 },
          )
        : null;

    const heroSection = document.getElementById("hero");
    if (heroSection) observer?.observe(heroSection);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTimeUpdate);
      document.removeEventListener("visibilitychange", onVisible);
      observer?.disconnect();
    };
  }, [attemptAutoplay, markRenderedFrame, showVideo, videoEl, videoSrc]);

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
      video.pause();
      return;
    }

    userPausedRef.current = false;
    setUserPaused(false);
    playFromGesture(video);
  }, [playFromGesture]);

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

  return (
    <>
      {showVideo ? (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {!hasRenderedFrame ? (
            <OptimizedImage
              src={hero}
              alt=""
              aria-hidden="true"
              priority
              sizes="100vw"
              className="absolute inset-0 size-full object-cover"
            />
          ) : null}
          <video
            ref={setVideoRef}
            className={cn(
              "size-full object-cover object-center",
              hasRenderedFrame ? "opacity-100" : "opacity-0",
            )}
            poster={HERO_POSTER_SRC}
            muted
            defaultMuted
            playsInline
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
