import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getOrgSlug, getOrganization } from "@/lib/org";
import "./globals.css";

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

  const brandColor = org?.primary_color ?? "#FF6B00";
  const secondaryColor = org?.secondary_color ?? "#888888";

  if (!org) {
    return (
      <html lang="pt-BR">
        <body className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white/70">
          <p>Organização não encontrada.</p>
        </body>
      </html>
    );
  }

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
      <body className="flex min-h-screen flex-col bg-[#0A0A0A] text-[#ededed] antialiased">
        <Navbar org={org} />
        <main className="flex-1">{children}</main>
        <Footer org={org} />
      </body>
    </html>
  );
}
