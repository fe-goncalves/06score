import type { Metadata } from "next";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getCachedOrganization } from "@/lib/data/cached";
import { metaIcons } from "@/lib/metaIcons";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug } from "@/lib/org";
import "./globals.css";

/** Inter + Space Mono + Poppins (abas do match hub). */
const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap";

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getOrgSlug();
  const org = await getCachedOrganization(slug);

  if (!org) {
    return { title: metaTitle("06.score") };
  }

  return {
    title: {
      default: metaTitle(org.name),
      template: "%s",
    },
    description: org.description ?? `${org.name} — estatísticas, jogos e notícias`,
    icons: metaIcons(),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const slug = await getOrgSlug();
  const org = await getCachedOrganization(slug);

  if (!org) {
    return (
      <html lang="pt-BR">
        <head>
          <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
        </head>
        <body className="flex min-h-screen items-center justify-center bg-[#0D0D0D] font-sans text-white/70">
          <p className="font-mono-label text-sm">Organização não encontrada.</p>
        </body>
      </html>
    );
  }

  const brandColor = org.primary_color ?? "#FF6B00";
  const secondaryColor = org.secondary_color ?? "#888888";

  return (
    <html
      lang="pt-BR"
      style={
        {
          "--color-brand": brandColor,
          "--color-secondary": secondaryColor,
        } as React.CSSProperties
      }
    >
      <head>
        <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
      </head>
      <body className="flex min-h-screen flex-col bg-[#0D0D0D] font-sans text-white antialiased">
        <div className="relative z-[1] flex min-h-screen flex-col">
          <Navbar org={org} />
          <main className="min-w-0 flex-1 pb-[5.5rem] md:pb-0">{children}</main>
          <Footer org={org} />
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
