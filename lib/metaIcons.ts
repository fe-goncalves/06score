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

const DEFAULT_ICON: NonNullable<Metadata["icons"]> = {
  icon: [{ url: "/icon", type: "image/png" }],
  shortcut: [{ url: "/icon" }],
  apple: [{ url: "/icon" }],
};

/**
 * Favicon da aba:
 * - com logo da entidade → usa essa URL
 * - senão → `/icon` (logo da organização via app/icon.tsx)
 */
export function metaIcons(
  entityLogo?: string | null,
  _orgLogo?: string | null,
): Metadata["icons"] {
  const url = entityLogo?.trim() || null;
  if (!url) return DEFAULT_ICON;

  const type = iconMime(url);
  return {
    icon: type ? [{ url, type }] : [{ url }],
    shortcut: [{ url }],
    apple: [{ url }],
  };
}
