import { useEffect, useRef, useState, type RefObject } from "react";

const SWIPE_THRESHOLD_PX = 48;
const DRAG_THRESHOLD_PX = 8;

function isInteractiveSwipeTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;

  return Boolean(
    target.closest(
      'button, a, input, textarea, select, label, summary, [role="button"], [role="tab"], [contenteditable="true"]',
    ),
  );
}

type SwipeState = {
  active: boolean;
  dragging: boolean;
  startX: number;
  pointerId: number;
};

export function useHorizontalSwipe(
  containerRef: RefObject<HTMLElement | null>,
  {
    onSwipePrev,
    onSwipeNext,
  }: {
    onSwipePrev: () => void;
    onSwipeNext: () => void;
  },
) {
  const [isDragging, setIsDragging] = useState(false);
  const swipeStateRef = useRef<SwipeState>({
    active: false,
    dragging: false,
    startX: 0,
    pointerId: -1,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onDragStart = (event: DragEvent) => {
      event.preventDefault();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (isInteractiveSwipeTarget(event.target)) return;

      if (event.target instanceof HTMLImageElement) {
        event.preventDefault();
      }

      container.setPointerCapture(event.pointerId);

      swipeStateRef.current = {
        active: true,
        dragging: false,
        startX: event.clientX,
        pointerId: event.pointerId,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const swipe = swipeStateRef.current;
      if (!swipe.active || event.pointerId !== swipe.pointerId) return;

      const deltaX = event.clientX - swipe.startX;
      if (!swipe.dragging && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;

      if (!swipe.dragging) {
        swipe.dragging = true;
        setIsDragging(true);
      }

      if (Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
        event.preventDefault();
      }
    };

    const finishSwipe = (event: PointerEvent) => {
      const swipe = swipeStateRef.current;
      if (!swipe.active || event.pointerId !== swipe.pointerId) return;

      if (swipe.dragging) {
        const deltaX = event.clientX - swipe.startX;
        if (deltaX <= -SWIPE_THRESHOLD_PX) onSwipeNext();
        else if (deltaX >= SWIPE_THRESHOLD_PX) onSwipePrev();
      }

      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }

      swipeStateRef.current.active = false;
      swipeStateRef.current.dragging = false;
      setIsDragging(false);
    };

    container.addEventListener("dragstart", onDragStart);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", finishSwipe);
    window.addEventListener("pointercancel", finishSwipe);

    return () => {
      container.removeEventListener("dragstart", onDragStart);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", finishSwipe);
      window.removeEventListener("pointercancel", finishSwipe);
    };
  }, [containerRef, onSwipeNext, onSwipePrev]);

  return { isDragging };
}
