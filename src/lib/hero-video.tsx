import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Pause, Play } from "lucide-react";
import { hero } from "@/components/wssu/photos";
import { cn } from "@/lib/utils";

const HERO_VIDEO_ID = "g-VSShk-0h8";

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
};

type YouTubePlayerConstructor = new (
  elementId: string,
  options: {
    host?: string;
    videoId: string;
    playerVars?: Record<string, number | string>;
    events?: {
      onReady?: (event: { target: YouTubePlayer }) => void;
      onStateChange?: (event: { data: number }) => void;
    };
  },
) => YouTubePlayer;

declare global {
  interface Window {
    YT?: {
      Player: YouTubePlayerConstructor;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const finish = () => resolve();

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      finish();
    };

    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const interval = window.setInterval(() => {
        if (window.YT?.Player) {
          window.clearInterval(interval);
          finish();
        }
      }, 50);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
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
  playerHostId: string;
  showVideo: boolean;
  isPlaying: boolean;
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

export function HeroVideoProvider({ children }: { children: ReactNode }) {
  const playerHostId = useId().replace(/:/g, "");
  const playerRef = useRef<YouTubePlayer | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);

  const showVideo = videoEnabled && !prefersReducedMotion;

  useEffect(() => {
    if (prefersReducedMotion) {
      setVideoEnabled(false);
      setIsPlaying(false);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!videoEnabled) return;

    let cancelled = false;

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !window.YT?.Player) return;

      const player = new window.YT.Player(playerHostId, {
        host: "https://www.youtube-nocookie.com",
        videoId: HERO_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          playsinline: 1,
          loop: 1,
          playlist: HERO_VIDEO_ID,
          rel: 0,
          modestbranding: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          autohide: 1,
          showinfo: 0,
          enablejsapi: 1,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        },
        events: {
          onReady: ({ target }) => {
            playerRef.current = target;
            setPlayerReady(true);
            setIsPlaying(true);
            target.playVideo();
          },
          onStateChange: ({ data }) => {
            if (!window.YT) return;
            if (data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (data === window.YT.PlayerState.PAUSED || data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          },
        },
      });

      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      setPlayerReady(false);
    };
  }, [videoEnabled, playerHostId]);

  const togglePlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player || !playerReady) return;

    if (isPlaying) {
      player.pauseVideo();
      return;
    }

    player.playVideo();
  }, [isPlaying, playerReady]);

  const enableVideo = useCallback(() => {
    setVideoEnabled(true);
  }, []);

  const value = useMemo(
    () => ({
      playerHostId,
      showVideo,
      isPlaying,
      playerReady,
      togglePlayback,
      enableVideo,
    }),
    [enableVideo, isPlaying, playerHostId, playerReady, showVideo, togglePlayback],
  );

  return <HeroVideoContext.Provider value={value}>{children}</HeroVideoContext.Provider>;
}

export function HeroVideoLayer() {
  const { playerHostId, showVideo, isPlaying, playerReady } = useHeroVideo();

  return (
    <>
      {showVideo ? (
        <div
          className={cn(
            "absolute inset-0 overflow-hidden transition-opacity duration-700",
            playerReady ? "opacity-65" : "opacity-0",
          )}
          aria-hidden="true"
        >
          <div className="hero-video-frame pointer-events-none absolute">
            <div
              id={playerHostId}
              className="size-full [&_iframe]:size-full [&_iframe]:pointer-events-none"
            />
          </div>
          {playerReady ? (
            <div
              className="hero-video-controls-mask pointer-events-none absolute inset-0 z-[4]"
              aria-hidden="true"
            />
          ) : null}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-32 bg-gradient-to-b from-wssu-black via-wssu-black/90 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-32 bg-gradient-to-t from-wssu-black via-wssu-black/90 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(9,9,11,0.55)_100%)]"
            aria-hidden="true"
          />
        </div>
      ) : (
        <img
          src={hero}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-65"
          loading="eager"
        />
      )}

      <div
        className="absolute inset-0 bg-gradient-to-t from-wssu-black via-wssu-black/55 to-wssu-black/20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-wssu-black to-transparent"
        aria-hidden="true"
      />
    </>
  );
}

export function HeroVideoControls() {
  const { showVideo, isPlaying, playerReady, togglePlayback, enableVideo } = useHeroVideo();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  const showAsPlaying = !playerReady || isPlaying;

  const buttonClass = cn(
    "inline-flex items-center gap-2 border border-wssu-white/25 bg-wssu-black/50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-wssu-white backdrop-blur-sm transition-colors",
    "hover:border-wssu-white/45",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wssu-white",
  );

  return showVideo ? (
    <button
      type="button"
      onClick={togglePlayback}
      disabled={!playerReady}
      aria-label={showAsPlaying ? "Pause background video" : "Play background video"}
      className={cn(buttonClass, !playerReady && "cursor-wait opacity-70")}
    >
      {showAsPlaying ? (
        <Pause className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <Play className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
      )}
      <span>{showAsPlaying ? "Pause video" : "Play video"}</span>
    </button>
  ) : (
    <button
      type="button"
      onClick={enableVideo}
      aria-label="Play background video"
      className={buttonClass}
    >
      <Play className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
      <span>Play video</span>
    </button>
  );
}
