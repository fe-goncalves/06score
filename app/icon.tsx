import { ImageResponse } from "next/og";
import { getCachedOrganization } from "@/lib/data/cached";
import { getOrgSlug } from "@/lib/org";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const runtime = "nodejs";

/** Favicon padrão do site = logo da organização (substitui o favicon Next). */
export default async function Icon() {
  const slug = await getOrgSlug();
  const org = await getCachedOrganization(slug);
  const logoUrl = org?.logo_url?.trim() || null;

  if (logoUrl) {
    try {
      const response = await fetch(logoUrl, { next: { revalidate: 300 } });
      if (response.ok) {
        const contentTypeHeader = response.headers.get("content-type") ?? "";
        if (
          contentTypeHeader.includes("png") ||
          contentTypeHeader.includes("jpeg") ||
          contentTypeHeader.includes("jpg") ||
          contentTypeHeader.includes("webp") ||
          contentTypeHeader.includes("gif") ||
          contentTypeHeader.includes("svg")
        ) {
          const bytes = await response.arrayBuffer();
          return new Response(bytes, {
            headers: {
              "Content-Type": contentTypeHeader.split(";")[0] || "image/png",
              "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
            },
          });
        }
      }
    } catch {
      // cai no fallback visual
    }
  }

  const initial = (org?.name?.trim()?.[0] ?? "0").toLocaleUpperCase("pt-BR");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d0d",
          color: "#fff",
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        {initial}
      </div>
    ),
    { ...size },
  );
}
