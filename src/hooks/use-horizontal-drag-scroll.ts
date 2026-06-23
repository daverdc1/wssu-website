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

type DragState = {
  active: boolean;
  dragging: boolean;
  suppressClick: boolean;
  startX: number;
  startScrollLeft: number;
  pointerId: number;
};

export function useHorizontalDragScroll(
  containerRef: RefObject<HTMLElement | null>,
  onDragEnd?: () => void,
) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<DragState>({
    active: false,
    dragging: false,
    suppressClick: false,
    startX: 0,
    startScrollLeft: 0,
    pointerId: -1,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resetDragStyles = () => {
      container.style.scrollSnapType = "";
      container.style.scrollBehavior = "";
    };

    const onDragStart = (event: DragEvent) => {
      event.preventDefault();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (isInteractiveDragTarget(event.target)) return;

      if (event.target instanceof HTMLImageElement) {
        event.preventDefault();
      }

      container.setPointerCapture(event.pointerId);

      dragStateRef.current = {
        active: true,
        dragging: false,
        suppressClick: false,
        startX: event.clientX,
        startScrollLeft: container.scrollLeft,
        pointerId: event.pointerId,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag.active || event.pointerId !== drag.pointerId) return;

      const deltaX = event.clientX - drag.startX;
      if (!drag.dragging && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;

      if (!drag.dragging) {
        drag.dragging = true;
        setIsDragging(true);
        container.style.scrollSnapType = "none";
        container.style.scrollBehavior = "auto";
      }

      event.preventDefault();
      container.scrollLeft = drag.startScrollLeft - deltaX;
    };

    const finishDrag = (event: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag.active || event.pointerId !== drag.pointerId) return;

      if (drag.dragging) {
        drag.suppressClick = true;
        resetDragStyles();
        setIsDragging(false);
        onDragEnd?.();
      }

      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }

      dragStateRef.current.active = false;
      dragStateRef.current.dragging = false;
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
  }, [containerRef, onDragEnd]);

  return { isDragging };
}
