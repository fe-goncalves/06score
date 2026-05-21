"use client";

import { useEffect, useState } from "react";
import { fetchRanking } from "@/app/ranking/actions";
import { RankingTable } from "@/components/ranking/RankingTable";
import type { RankingRow } from "@/lib/types";

interface RankingClientProps {
  orgId: string;
}

type Gender = "male" | "female";

export function RankingClient({ orgId }: RankingClientProps) {
  const [gender, setGender] = useState<Gender>("male");
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchRanking(orgId, gender, "football7")
      .then(setRows)
      .finally(() => setLoading(false));
  }, [orgId, gender]);

  return (
    <div>
      <div className="mb-8 flex gap-2">
        {(["male", "female"] as Gender[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGender(g)}
            className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              gender === g
                ? "bg-[var(--color-brand)] text-black"
                : "border border-white/20 text-white/60 hover:border-white/40 hover:text-white/90"
            }`}
          >
            {g === "male" ? "Masculino" : "Feminino"}
          </button>
        ))}
      </div>

      <RankingTable rows={rows} loading={loading} />
    </div>
  );
}