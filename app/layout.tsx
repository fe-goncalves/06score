import type { Metadata } from "next";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getActiveCompetitions, getOrgTeams } from "@/lib/data/home";
import { getOrgSlug, getOrganization } from "@/lib/org";
import "./globals.css";

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Space+Mono:wght@400;700&family=Barlow:wght@400;500&display=swap";

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);

  if (!org) {
    return { title: "06.score" };
  }

  return {
    title: org.name,
    description: org.description ?? `${org.name} — estatísticas, jogos e notícias`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);

  if (!org) {
    return (
      <html lang="pt-BR">
        <head>
          <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
        </head>
        <body className="flex min-h-screen items-center justify-center bg-[#080808] font-body text-white/70">
          <p className="font-mono-label text-sm">Organização não encontrada.</p>
        </body>
      </html>
    );
  }

  const brandColor = org.primary_color ?? "#FF6B00";
  const secondaryColor = org.secondary_color ?? "#888888";

  const [teams, competitions] = await Promise.all([
    getOrgTeams(org.id),
    getActiveCompetitions(org.id),
  ]);

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
      <body className="flex min-h-screen flex-col bg-[#080808] font-body text-[#ededed] antialiased">
        <div className="relative z-[1] flex min-h-screen flex-col">
          <Navbar org={org} />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer org={org} teams={teams} competitions={competitions} />
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
