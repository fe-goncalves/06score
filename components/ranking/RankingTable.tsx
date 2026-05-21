import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import type { RankingRow } from "@/lib/types";

interface RankingTableProps {
  rows: RankingRow[];
  loading?: boolean;
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const POSITION_STYLES: Record<number, string> = {
  1: "border-yellow-500/30 bg-yellow-500/5",
  2: "border-white/20 bg-white/5",
  3: "border-amber-700/30 bg-amber-700/5",
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-[#141414] px-4 py-3 animate-pulse">
      <div className="h-4 w-6 rounded bg-white/10" />
      <div className="h-8 w-8 rounded bg-white/10" />
      <div className="h-4 flex-1 rounded bg-white/10" />
      <div className="h-6 w-10 rounded bg-white/10" />
    </div>
  );
}

export function RankingTable({ rows, loading = false }: RankingTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <p className="text-sm text-white/40">
        Nenhum dado de ranking disponível.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row, index) => {
        const position = index + 1;
        const medal = MEDAL[position];
        const positionStyle =
          POSITION_STYLES[position] ??
          "border-white/[0.06] bg-[#141414]";

        return (
          <div
            key={row.team_id}
            className={`flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors hover:border-[var(--color-brand)]/40 ${positionStyle}`}
          >
            <span className="w-8 shrink-0 text-center text-sm font-bold tabular-nums text-white/40">
              {medal ?? position}
            </span>

            <OrgImage
              src={row.logo_url}
              alt={row.team_name}
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded object-contain"
            />

            <Link
              href={`/times/${row.team_id}`}
              className="min-w-0 flex-1 truncate font-semibold hover:text-[var(--color-brand)]"
            >
              {row.team_name}
            </Link>

            <span className="shrink-0 text-xl font-bold tabular-nums text-[var(--color-brand)]">
              {row.total_points}
            </span>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-white/30">
              pts
            </span>
          </div>
        );
      })}
    </div>
  );
}