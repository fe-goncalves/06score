"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconTrophy() {
  return (
    <svg viewBox="0 0 512 512" className="bottom-nav-icon" aria-hidden>
      <path
        fill="currentColor"
        d="M464 80h-66.3a80.1 80.1 0 00-5.7-24.6C381.8 32.1 355.4 16 320 16H192c-35.4 0-61.8 16.1-72 39.4A80.1 80.1 0 00114.3 80H48a16 16 0 00-16 16v58.8c0 58.2 40.3 108.9 96.3 122.3a127.8 127.8 0 00103.7 95.7V400H176a16 16 0 000 32h160a16 16 0 000-32h-56v-27.2a127.8 127.8 0 00103.7-95.7c56-13.4 96.3-64.1 96.3-122.3V96a16 16 0 00-16-16zM80 154.8V112h28.9c-1.8 7.4-2.9 15.1-2.9 23.2v54.5C84.5 180.7 80 168.3 80 154.8zM192 48h128c20.1 0 33.3 7.3 40.1 21.9 3.2 6.9 4.9 14.6 4.9 22.1v80c0 53-43 96-96 96h-26c-53 0-96-43-96-96v-80c0-7.5 1.7-15.2 4.9-22.1C158.7 55.3 171.9 48 192 48zm240 106.8c0 13.5-4.5 25.9-12 35.9V135.2c0-8.1-1.1-15.8-2.9-23.2H432z"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 512 512" className="bottom-nav-icon" aria-hidden>
      <path
        fill="currentColor"
        d="M80.5 80.9C121.4 63.4 174.4 48 256 48s134.6 15.4 175.5 32.9c23.4 10 40.5 31.6 40.5 57.1v80c0 146.4-117.5 218.4-186.7 249.1a55.3 55.3 0 01-58.6 0C157.5 436.4 40 364.4 40 218v-80c0-25.5 17.1-47.1 40.5-57.1z"
      />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg viewBox="0 0 512 512" className="bottom-nav-icon" aria-hidden>
      <path
        fill="currentColor"
        d="M256 256a112 112 0 10-112-112 112.1 112.1 0 00112 112zm0 32c-69.4 0-208 34.9-208 104.2V432a16 16 0 0016 16h384a16 16 0 0016-16v-39.8C464 322.9 325.4 288 256 288z"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 512 512" className="bottom-nav-icon" aria-hidden>
      <path
        fill="currentColor"
        d="M456.69 421.39l-95.2-95.2a184.1 184.1 0 10-35.3 35.3l95.2 95.2a25 25 0 0035.3-35.3zM208 352a144 144 0 11144-144 144.16 144.16 0 01-144 144z"
      />
    </svg>
  );
}

const TABS = [
  {
    href: "/competicoes",
    label: "Competições",
    match: (p: string) => p.startsWith("/competicoes") || p.startsWith("/jogos"),
    Icon: IconTrophy,
  },
  {
    href: "/times",
    label: "Equipes",
    match: (p: string) => p.startsWith("/times"),
    Icon: IconShield,
  },
  {
    href: "/atletas",
    label: "Atletas",
    match: (p: string) => p.startsWith("/atletas"),
    Icon: IconPerson,
  },
  {
    href: "/pesquisa",
    label: "Pesquisar",
    match: (p: string) => p.startsWith("/pesquisa"),
    Icon: IconSearch,
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav-float md:hidden" aria-label="Navegação principal">
      <ul className="bottom-nav-float-track">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const { Icon } = tab;
          return (
            <li key={tab.href} className="bottom-nav-float-item">
              <Link
                href={tab.href}
                className={`bottom-nav-float-link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="bottom-nav-float-orb" aria-hidden />
                <Icon />
                <span className="bottom-nav-float-label">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
