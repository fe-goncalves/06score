"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Home",
    match: (p: string) => p === "/",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 10.5L12 4l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
      />
    ),
  },
  {
    href: "/competicoes",
    label: "Jogos",
    match: (p: string) => p.startsWith("/competicoes") || p.startsWith("/jogos"),
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M6 4h12v3H6V4zm0 6h12v3H6v-3zm0 6h12v3H6v-3z"
      />
    ),
  },
  {
    href: "/ranking",
    label: "Liga",
    match: (p: string) => p.startsWith("/ranking"),
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 18V8m6 10V4m6 14v-6"
      />
    ),
  },
  {
    href: "/atletas",
    label: "Atletas",
    match: (p: string) => p.startsWith("/atletas"),
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 12a4 4 0 100-8 4 4 0 000 8zm-8 8c0-3.314 3.582-6 8-6s8 2.686 8 6"
      />
    ),
  },
  {
    href: "/hall-da-fama",
    label: "Hall",
    match: (p: string) => p.startsWith("/hall-da-fama"),
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 3l2.4 5.4L20 9.3l-4 4.1.9 5.6L12 16.9 7.1 19l.9-5.6-4-4.1 5.6-.9L12 3z"
      />
    ),
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bottom-nav fixed bottom-0 left-0 right-0 z-50 md:hidden"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href} className="flex flex-1">
              <Link
                href={tab.href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? "text-[var(--color-brand)]" : "text-white/45"
                }`}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden
                >
                  {tab.icon}
                </svg>
                <span className="font-mono-label text-[9px] font-bold uppercase tracking-wide">
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
