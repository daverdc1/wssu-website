import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const PROGRAM_WIPE_SWAP_MS = 380;
export const PROGRAM_WIPE_DURATION_MS = 800;

type ProgramImageWipeProps = {
  transitionId: number;
  direction: 1 | -1;
  wipeClassName: string;
};

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

export function useProgramWipeSwapMs() {
  const reducedMotion = usePrefersReducedMotion();
  return reducedMotion ? 0 : PROGRAM_WIPE_SWAP_MS;
}

export function ProgramImageWipe({
  transitionId,
  direction,
  wipeClassName,
}: ProgramImageWipeProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(false);
      setAnimating(false);
      return;
    }

    setVisible(true);
    setAnimating(false);

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setAnimating(true));
    });

    const timeout = window.setTimeout(() => {
      setVisible(false);
      setAnimating(false);
    }, PROGRAM_WIPE_DURATION_MS);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(timeout);
    };
  }, [transitionId, reducedMotion]);

  if (reducedMotion || !visible) return null;

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      <span
        className={cn(
          "program-wipe-layer",
          wipeClassName,
          animating && (direction === 1 ? "program-wipe-next" : "program-wipe-prev"),
        )}
        onAnimationEnd={() => {
          setVisible(false);
          setAnimating(false);
        }}
      />
    </span>
  );
}
