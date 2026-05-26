"use client";

import { useEffect, useRef } from "react";

const EMBED_SCRIPT_ID = "tiktok-embed-js";
const EMBED_SCRIPT_SRC = "https://www.tiktok.com/embed.js";

function loadTikTokEmbedScript(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();

  const existing = document.getElementById(EMBED_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing?.dataset.loaded === "true") {
    return Promise.resolve();
  }

  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = EMBED_SCRIPT_ID;
    script.src = EMBED_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("Falha ao carregar TikTok embed.js"));
    document.body.appendChild(script);
  });
}

interface TikTokCreatorEmbedProps {
  html: string;
}

export function TikTokCreatorEmbed({ html }: TikTokCreatorEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = html;

    loadTikTokEmbedScript()
      .then(() => {
        const tiktok = (window as Window & { tiktok?: { embed?: { lib?: { render: () => void } } } }).tiktok;
        tiktok?.embed?.lib?.render?.();
      })
      .catch((err) => console.error("[TikTokCreatorEmbed]", err));
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="tiktok-creator-embed"
      suppressHydrationWarning
    />
  );
}
