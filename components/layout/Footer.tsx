import Link from "next/link";
import { FooterSocial } from "@/components/layout/FooterSocial";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Organization } from "@/lib/types";

interface FooterProps {
  org: Organization;
}

export function Footer({ org }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer mt-auto border-t border-[var(--card-border)] bg-[#0D0D0D]">
      <div className="site-footer-brand py-8 md:py-10">
        <div className="page-container flex flex-col items-center gap-5">
          <OrgImage
            src={org.logo_url}
            alt={org.name}
            width={96}
            height={96}
            className="h-11 w-11 object-contain md:h-12 md:w-12"
          />

          <FooterSocial org={org} />

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link
              href="/competicoes"
              className="text-[12px] font-medium text-white/40 transition-colors hover:text-white/70"
            >
              Competições
            </Link>
            <Link
              href="/bid"
              className="text-[12px] font-medium text-white/40 transition-colors hover:text-white/70"
            >
              BID
            </Link>
            <Link
              href="/times"
              className="text-[12px] font-medium text-white/40 transition-colors hover:text-white/70"
            >
              Equipes
            </Link>
            <Link
              href="/news"
              className="text-[12px] font-medium text-white/40 transition-colors hover:text-white/70"
            >
              Notícias
            </Link>
            <Link
              href="/pesquisa"
              className="text-[12px] font-medium text-white/40 transition-colors hover:text-white/70"
            >
              Pesquisar
            </Link>
            <Link
              href="/hall-da-fama"
              className="text-[12px] font-medium text-white/40 transition-colors hover:text-white/70"
            >
              Hall
            </Link>
          </nav>

          <p className="text-center text-[12px] text-white/30">
            © {year} {org.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
