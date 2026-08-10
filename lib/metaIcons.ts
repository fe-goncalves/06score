import type { Metadata } from "next";

function iconMime(url: string): string | undefined {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".ico")) return "image/x-icon";
  return undefined;
}

/**
 * Favicon da aba: logo da entidade quando houver;
 * senão fallback (logo da organização).
 */
export function metaIcons(
  entityLogo?: string | null,
  orgLogo?: string | null,
): Metadata["icons"] | undefined {
  const url = entityLogo?.trim() || orgLogo?.trim() || null;
  if (!url) return undefined;

  const type = iconMime(url);
  return {
    icon: type ? [{ url, type }] : [{ url }],
    shortcut: [{ url }],
    apple: [{ url }],
  };
}
