"use client";

import { useCallback, useRef, type MouseEvent } from "react";

export function useEntityCardGlow() {
  const cardRef = useRef<HTMLElement>(null);

  const onMouseMove = useCallback((event: MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
  }, []);

  const onMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.removeProperty("--mouse-x");
    card.style.removeProperty("--mouse-y");
  }, []);

  return { cardRef, onMouseMove, onMouseLeave };
}
