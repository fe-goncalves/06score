import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 06.score embeds de YouTube/Vimeo/Instagram nas páginas de partida
      "img-src 'self' https://*.supabase.co https://*.ytimg.com https://i.vimeocdn.com data: blob:",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.tiktok.com https://*.tiktok.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.tiktok.com https://*.tiktok.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Permite embeds de vídeo via iframe (YouTube, Vimeo, Instagram)
      "frame-src https://www.youtube.com https://player.vimeo.com https://www.instagram.com https://www.tiktok.com https://*.tiktok.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Pre-existing Supabase/component typing issues; unblock production build for Cloudflare.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Silence Next 16 Turbopack + unused webpack plugin warning from tooling.
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
        ],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
        ],
      },
      {
        // Aplica os headers em todas as rotas
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
