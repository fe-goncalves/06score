"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchRanking } from "@/app/ranking/actions";
import { SiteListHero } from "@/components/layout/SiteListHero";
import { RankingTable } from "@/components/ranking/RankingTable";
import { matchesQuery } from "@/lib/search/normalizeQuery";
import type { RankingRow } from "@/lib/types";

interface RankingClientProps {
  orgId: string;
}

type Gender = "male" | "female";

export function RankingClient({ orgId }: RankingClientProps) {
  const [gender, setGender] = useState<Gender>("male");
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchRanking(orgId, gender, "football7")
      .then(setRows)
      .finally(() => setLoading(false));
  }, [orgId, gender]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    return rows.filter((row) => matchesQuery(row.team_name, searchTerm));
  }, [rows, searchTerm]);

  return (
    <>
      <SiteListHero
        title="RANKING"
        searchId="ranking-search"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <div className="page-container pb-14 pt-2">
        <div className="ranking-gender-toggle" role="group" aria-label="Gênero">
          {(["male", "female"] as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`ranking-gender-btn${gender === g ? " ranking-gender-btn--active" : ""}`}
            >
              {g === "male" ? "Masculino" : "Feminino"}
            </button>
          ))}
        </div>

        <RankingTable rows={filteredRows} loading={loading} />
      </div>
    </>
  );
}
