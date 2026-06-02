"use client";

import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 639px)";

export const MATCH_STAT_BAR_SEGMENTS_DESKTOP = 10;
export const MATCH_STAT_BAR_SEGMENTS_MOBILE = 5;

function getSegmentCount(): number {
  if (typeof window === "undefined") {
    return MATCH_STAT_BAR_SEGMENTS_DESKTOP;
  }
  return window.matchMedia(MOBILE_QUERY).matches
    ? MATCH_STAT_BAR_SEGMENTS_MOBILE
    : MATCH_STAT_BAR_SEGMENTS_DESKTOP;
}

export function useMatchStatBarSegmentCount(): number {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(MOBILE_QUERY);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    getSegmentCount,
    () => MATCH_STAT_BAR_SEGMENTS_DESKTOP,
  );
}

export function statBarSegmentsFilled(
  value: number,
  segmentCount: number,
): number {
  return Math.min(segmentCount, Math.max(0, Math.round(value)));
}
