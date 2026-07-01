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

type AxisLock = "none" | "horizontal" | "vertical";

type SwipeState = {
  active: boolean;
  dragging: boolean;
  axis: AxisLock;
  startX: number;
  startY: number;
  pointerId: number;
};

export function useHorizontalSwipe(
  containerRef: RefObject<HTMLElement | null>,
  {
    onSwipePrev,
    onSwipeNext,
    enabled = true,
  }: {
    onSwipePrev: () => void;
    onSwipeNext: () => void;
    enabled?: boolean;
  },
) {
  const [isDragging, setIsDragging] = useState(false);
  const swipeStateRef = useRef<SwipeState>({
    active: false,
    dragging: false,
    axis: "none",
    startX: 0,
    startY: 0,
    pointerId: -1,
  });

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const resetSwipe = () => {
      swipeStateRef.current.active = false;
      swipeStateRef.current.dragging = false;
      swipeStateRef.current.axis = "none";
      setIsDragging(false);
    };

    const releaseCapture = (event: PointerEvent) => {
      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }
    };

    const onDragStart = (event: DragEvent) => {
      event.preventDefault();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (isInteractiveSwipeTarget(event.target)) return;

      swipeStateRef.current = {
        active: true,
        dragging: false,
        axis: "none",
        startX: event.clientX,
        startY: event.clientY,
        pointerId: event.pointerId,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const swipe = swipeStateRef.current;
      if (!swipe.active || event.pointerId !== swipe.pointerId) return;

      const deltaX = event.clientX - swipe.startX;
      const deltaY = event.clientY - swipe.startY;

      if (swipe.axis === "none") {
        if (Math.abs(deltaX) < DRAG_THRESHOLD_PX && Math.abs(deltaY) < DRAG_THRESHOLD_PX) {
          return;
        }

        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          resetSwipe();
          return;
        }

        swipe.axis = "horizontal";
        swipe.dragging = true;
        container.setPointerCapture(event.pointerId);
        setIsDragging(true);
      }

      if (swipe.axis !== "horizontal") return;

      event.preventDefault();
    };

    const finishSwipe = (event: PointerEvent) => {
      const swipe = swipeStateRef.current;
      if (!swipe.active || event.pointerId !== swipe.pointerId) return;

      if (swipe.dragging && swipe.axis === "horizontal") {
        const deltaX = event.clientX - swipe.startX;
        if (deltaX <= -SWIPE_THRESHOLD_PX) onSwipeNext();
        else if (deltaX >= SWIPE_THRESHOLD_PX) onSwipePrev();
      }

      releaseCapture(event);
      resetSwipe();
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
  }, [containerRef, enabled, onSwipeNext, onSwipePrev]);

  return { isDragging };
}
