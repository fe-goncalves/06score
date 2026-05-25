import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Competition, Organization, Team } from "@/lib/types";

interface FooterProps {
  org: Organization;
  teams: Team[];
  competitions?: Competition[];
}

export function Footer({ org, teams, competitions = [] }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer mt-auto border-t border-white/[0.06] bg-[#080808]">
      {teams.length > 0 && (
        <div className="site-footer-teams border-b border-white/[0.06] py-8">
          <div className="page-container">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              {teams.map((team, i) => (
                <Link
                  key={team.id ?? i}
                  href={team.id ? `/times/${team.id}` : "#"}
                  className="opacity-80 transition-opacity hover:opacity-100"
                >
                  <TeamLogo team={team} index={i} size={36} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {competitions.length > 0 && (
        <div className="site-footer-partners border-b border-white/[0.06] py-10">
          <div className="page-container flex flex-col items-center gap-6">
            <p className="font-mono-label text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
              Competições
            </p>
            <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
              {competitions.map((comp) => (
                <Link
                  key={comp.id}
                  href={`/competicoes/${comp.id}`}
                  className="opacity-70 transition-opacity hover:opacity-100"
                >
                  <OrgImage
                    src={comp.logo_url}
                    alt={comp.full_name}
                    width={80}
                    height={40}
                    className="h-8 max-w-[100px] object-contain md:h-10"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="site-footer-brand py-12 md:py-16">
        <div className="page-container flex flex-col items-center gap-8">
          <h2 className="font-display text-center text-3xl font-black uppercase tracking-wide text-white md:text-5xl">
            {org.name}
          </h2>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link
              href="/competicoes"
              className="font-mono-label text-[9px] uppercase text-white/35 transition-colors hover:text-white/60"
            >
              Competições
            </Link>
            <Link
              href="/times"
              className="font-mono-label text-[9px] uppercase text-white/35 transition-colors hover:text-white/60"
            >
              Equipes
            </Link>
            <Link
              href="/news"
              className="font-mono-label text-[9px] uppercase text-white/35 transition-colors hover:text-white/60"
            >
              Notícias
            </Link>
            <Link
              href="/hall-da-fama"
              className="font-mono-label text-[9px] uppercase text-white/35 transition-colors hover:text-white/60"
            >
              Hall da Fama
            </Link>
          </nav>

          <p className="font-mono-label text-center text-[9px] uppercase text-white/30">
            © {year} {org.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
