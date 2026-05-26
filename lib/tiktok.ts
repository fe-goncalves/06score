/** Extrai o ID numérico de URLs públicas do TikTok. */
export function parseTikTokVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const fromPath = parsed.pathname.match(/\/video\/(\d+)/);
    if (fromPath?.[1]) return fromPath[1];

    const fromQuery = parsed.searchParams.get("video_id");
    if (fromQuery && /^\d+$/.test(fromQuery)) return fromQuery;
  } catch {
    const fallback = trimmed.match(/\/video\/(\d+)/);
    if (fallback?.[1]) return fallback[1];
  }

  return null;
}

export function tikTokEmbedUrl(videoId: string): string {
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

export function extractTikTokUsername(profileUrl: string | null | undefined): string | null {
  if (!profileUrl?.trim()) return null;
  try {
    const parsed = new URL(profileUrl.trim());
    const match = parsed.pathname.match(/@([^/?#]+)/);
    return match?.[1] ?? null;
  } catch {
    const fallback = profileUrl.match(/@([a-zA-Z0-9._]+)/);
    return fallback?.[1] ?? null;
  }
}
