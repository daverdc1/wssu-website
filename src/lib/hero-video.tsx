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
import { OptimizedImage } from "@/components/wssu/OptimizedImage";
import { cn } from "@/lib/utils";

const HERO_VIDEO_ID = "g-VSShk-0h8";
const HERO_VIDEO_START_SECONDS = 6.5;
const HERO_VIDEO_END_SECONDS = 55;
const COVER_SCALE = 1.12;

const QUALITY_PREF = ["highres", "hd2160", "hd1440", "hd1080"] as const;
const QUALITY_FALLBACK = ["hd720", "large", "medium"] as const;

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setPlaybackQuality: (quality: string) => void;
  getAvailableQualityLevels: () => string[];
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  setSize: (width: number, height: number) => void;
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
      onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
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

function getCoverPlayerDimensions() {
  const vw = window.innerWidth * COVER_SCALE;
  const vh = window.innerHeight * COVER_SCALE;
  return {
    width: Math.ceil(Math.max(vw, (vh * 16) / 9)),
    height: Math.ceil(Math.max(vh, (vw * 9) / 16)),
  };
}

function syncPlayerSize(player: YouTubePlayer) {
  const { width, height } = getCoverPlayerDimensions();
  player.setSize(width, height);
}

function restartHeroVideo(player: YouTubePlayer) {
  player.seekTo(HERO_VIDEO_START_SECONDS, true);
  player.playVideo();
  window.setTimeout(() => applyMaxPlaybackQuality(player), 250);
}

function applyMaxPlaybackQuality(player: YouTubePlayer) {
  const levels = player.getAvailableQualityLevels?.() ?? [];

  for (const quality of QUALITY_PREF) {
    if (levels.includes(quality)) {
      player.setPlaybackQuality(quality);
      return;
    }
  }

  for (const quality of QUALITY_FALLBACK) {
    if (levels.includes(quality)) {
      player.setPlaybackQuality(quality);
      return;
    }
  }

  // YouTube sometimes omits levels until after playback starts.
  player.setPlaybackQuality("hd1080");
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
          start: HERO_VIDEO_START_SECONDS,
          end: HERO_VIDEO_END_SECONDS,
          rel: 0,
          modestbranding: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          autohide: 1,
          showinfo: 0,
          enablejsapi: 1,
          hd: 1,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        },
        events: {
          onReady: ({ target }) => {
            playerRef.current = target;
            syncPlayerSize(target);
            setPlayerReady(true);
            setIsPlaying(true);
            target.seekTo(HERO_VIDEO_START_SECONDS, true);
            target.playVideo();
            window.setTimeout(() => applyMaxPlaybackQuality(target), 250);
            window.setTimeout(() => applyMaxPlaybackQuality(target), 1500);
          },
          onStateChange: ({ data, target }) => {
            if (!window.YT) return;
            if (data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              applyMaxPlaybackQuality(target);
              return;
            }
            if (data === window.YT.PlayerState.ENDED) {
              restartHeroVideo(target);
              setIsPlaying(true);
              return;
            }
            if (data === window.YT.PlayerState.PAUSED) {
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

  useEffect(() => {
    if (!playerReady || !playerRef.current) return;

    const onResize = () => {
      if (!playerRef.current) return;
      syncPlayerSize(playerRef.current);
      applyMaxPlaybackQuality(playerRef.current);
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [playerReady]);

  useEffect(() => {
    if (!playerReady || !isPlaying || !playerRef.current || !window.YT) return;

    const guardLoop = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || !window.YT) return;

      const state = player.getPlayerState?.();
      if (state === window.YT.PlayerState.ENDED) {
        restartHeroVideo(player);
        return;
      }

      const current = player.getCurrentTime?.() ?? 0;
      if (current >= HERO_VIDEO_END_SECONDS - 0.35 || current < HERO_VIDEO_START_SECONDS - 0.5) {
        restartHeroVideo(player);
      }
    }, 400);

    return () => window.clearInterval(guardLoop);
  }, [isPlaying, playerReady]);

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
            playerReady ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        >
          <div className="hero-video-frame pointer-events-none absolute">
            <div
              id={playerHostId}
              className="size-full [&_iframe]:size-full [&_iframe]:border-0 [&_iframe]:pointer-events-none [&_iframe]:transform-gpu"
            />
          </div>
          {playerReady ? (
            <div
              className="hero-video-controls-mask pointer-events-none absolute inset-0 z-[4]"
              aria-hidden="true"
            />
          ) : null}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-56 bg-gradient-to-t from-wssu-black via-wssu-black/45 to-transparent md:h-72"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_22%_50%,transparent_45%,rgba(9,9,11,0.22)_100%)]"
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
        className="absolute inset-0 bg-gradient-to-r from-wssu-black/70 via-wssu-black/20 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-32 bg-gradient-to-b from-wssu-black via-wssu-black/35 to-transparent md:h-40"
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
  const { showVideo, isPlaying, playerReady, togglePlayback, enableVideo } = useHeroVideo();

  const showAsPlaying = !playerReady || isPlaying;

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
      disabled={!playerReady}
      aria-label={showAsPlaying ? "Pause background video" : "Play background video"}
      className={cn(
        buttonClass,
        "pointer-events-auto",
        !playerReady && "cursor-wait opacity-70",
      )}
    >
      {showAsPlaying ? (
        <Pause className="size-3" strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <Play className="size-3" strokeWidth={2.25} aria-hidden="true" />
      )}
      <span className="sr-only">{showAsPlaying ? "Pause video" : "Play video"}</span>
      <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] md:inline">
        {showAsPlaying ? "Pause video" : "Play video"}
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
