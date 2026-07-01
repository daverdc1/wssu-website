import { useEffect, useRef, useState, type RefObject } from "react";

const DRAG_THRESHOLD_PX = 5;

function isInteractiveDragTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;

  return Boolean(
    target.closest(
      'button, a, input, textarea, select, label, summary, [role="button"], [role="tab"], [contenteditable="true"]',
    ),
  );
}

type AxisLock = "none" | "horizontal" | "vertical";

type DragState = {
  active: boolean;
  dragging: boolean;
  axis: AxisLock;
  suppressClick: boolean;
  startX: number;
  startY: number;
  startScrollLeft: number;
  pointerId: number;
};

export function useHorizontalDragScroll(
  containerRef: RefObject<HTMLElement | null>,
  onDragEnd?: () => void,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<DragState>({
    active: false,
    dragging: false,
    axis: "none",
    suppressClick: false,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    pointerId: -1,
  });

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const resetDragStyles = () => {
      container.style.scrollSnapType = "";
      container.style.scrollBehavior = "";
    };

    const resetDrag = () => {
      dragStateRef.current.active = false;
      dragStateRef.current.dragging = false;
      dragStateRef.current.axis = "none";
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
      if (event.pointerType !== "mouse") return;
      if (isInteractiveDragTarget(event.target)) return;

      dragStateRef.current = {
        active: true,
        dragging: false,
        axis: "none",
        suppressClick: false,
        startX: event.clientX,
        startY: event.clientY,
        startScrollLeft: container.scrollLeft,
        pointerId: event.pointerId,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag.active || event.pointerId !== drag.pointerId) return;

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;

      if (drag.axis === "none") {
        if (Math.abs(deltaX) < DRAG_THRESHOLD_PX && Math.abs(deltaY) < DRAG_THRESHOLD_PX) {
          return;
        }

        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          resetDrag();
          return;
        }

        drag.axis = "horizontal";
        drag.dragging = true;
        container.setPointerCapture(event.pointerId);
        setIsDragging(true);
        container.style.scrollSnapType = "none";
        container.style.scrollBehavior = "auto";
      }

      if (drag.axis !== "horizontal") return;

      event.preventDefault();
      container.scrollLeft = drag.startScrollLeft - deltaX;
    };

    const finishDrag = (event: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag.active || event.pointerId !== drag.pointerId) return;

      if (drag.dragging && drag.axis === "horizontal") {
        drag.suppressClick = true;
        resetDragStyles();
        onDragEnd?.();
      }

      releaseCapture(event);
      resetDrag();
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!dragStateRef.current.suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      dragStateRef.current.suppressClick = false;
    };

    container.addEventListener("dragstart", onDragStart);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
    container.addEventListener("click", onClickCapture, true);

    return () => {
      container.removeEventListener("dragstart", onDragStart);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
      container.removeEventListener("click", onClickCapture, true);
      resetDragStyles();
    };
  }, [containerRef, enabled, onDragEnd]);

  return { isDragging };
}
