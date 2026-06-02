"use client";

import { useSyncExternalStore } from "react";

function subscribeMedia(query: string, onChange: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMediaSnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string, serverFallback = false): boolean {
  return useSyncExternalStore(
    (onChange) => subscribeMedia(query, onChange),
    () => getMediaSnapshot(query),
    () => serverFallback,
  );
}

/** Desktop: duas colunas e aba Partidas oculta no header */
export function useAthleteDesktopLayout(): boolean {
  return useMediaQuery("(min-width: 1024px)", false);
}
