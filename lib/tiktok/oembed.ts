import { extractTikTokUsername } from "@/lib/tiktok";

export interface TikTokCreatorOEmbed {
  html: string;
  author_name?: string;
  title?: string;
}

export function normalizeTikTokProfileUrl(
  profileUrl: string | null | undefined,
): string | null {
  if (!profileUrl?.trim()) return null;

  const username = extractTikTokUsername(profileUrl);
  if (username) {
    return `https://www.tiktok.com/@${username}`;
  }

  try {
    const parsed = new URL(profileUrl.trim());
    if (parsed.hostname.replace(/^www\./, "").endsWith("tiktok.com")) {
      return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, "");
    }
  } catch {
    return null;
  }

  return null;
}

/** Remove tags <script> — o script oficial é carregado pelo componente React. */
export function stripEmbedScripts(html: string): string {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}

/**
 * oEmbed oficial do TikTok para perfil de criador (até ~10 vídeos recentes).
 * @see https://developers.tiktok.com/doc/embed-creator-profiles
 */
export async function fetchTikTokCreatorOEmbed(
  profileUrl: string,
): Promise<TikTokCreatorOEmbed | null> {
  const normalized = normalizeTikTokProfileUrl(profileUrl);
  if (!normalized) return null;

  const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(normalized)}`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        "User-Agent": "06score/1.0 (+https://06.score)",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error("[fetchTikTokCreatorOEmbed]", res.status, normalized);
      return null;
    }

    const data = (await res.json()) as TikTokCreatorOEmbed;
    if (!data.html?.includes("tiktok-embed")) return null;

    return {
      ...data,
      html: stripEmbedScripts(data.html),
    };
  } catch (err) {
    console.error("[fetchTikTokCreatorOEmbed]", err);
    return null;
  }
}
