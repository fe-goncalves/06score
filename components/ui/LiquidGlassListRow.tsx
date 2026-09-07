"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

interface LiquidGlassListRowProps {
  href: string;
  accentColor?: string | null;
  /** Traçado animado no hover — só listas de times. */
  dashHover?: boolean;
  children: ReactNode;
}

/** Row canônica de lista — flat Sofascore (sem card / glow). */
export function LiquidGlassListRow({
  href,
  accentColor,
  dashHover = false,
  children,
}: LiquidGlassListRowProps) {
  return (
    <Link
      href={href}
      className={`liquid-glass-list-row${dashHover ? " liquid-glass-list-row--dash" : ""}`}
      style={
        {
          "--row-accent": accentColor ?? "var(--color-brand)",
        } as CSSProperties
      }
    >
      {dashHover ? (
        <span className="liquid-glass-list-row-accent" aria-hidden />
      ) : null}
      <span className="liquid-glass-list-row-content">{children}</span>
    </Link>
  );
}
