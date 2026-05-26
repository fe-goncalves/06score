"use client";

import { tikTokEmbedUrl } from "@/lib/tiktok";

interface TikTokEmbedProps {
  videoId: string;
  title?: string | null;
}

export function TikTokEmbed({ videoId, title }: TikTokEmbedProps) {
  return (
    <div className="tiktok-embed-shell">
      <iframe
        src={tikTokEmbedUrl(videoId)}
        title={title ?? "Vídeo no TikTok"}
        className="tiktok-embed-iframe"
        allow="encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
