"use client";

import Link from "next/link";
import { useMemo } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import {
  calcAthleteAge,
  formatAthleteBirthLine,
  nationalityCode,
  nationalityFlagEmoji,
} from "@/lib/athlete/athleteHeaderFormat";
import {
  positionAbbreviation,
  sortSquadByPosition,
  squadHasBirthData,
  squadHasNationality,
} from "@/lib/team/squadDisplay";
import type { Athlete } from "@/lib/types";
import { athleteSurnameLabel, getPositionName } from "@/lib/utils";

interface TeamElencoTabProps {
  squad: (Athlete & { id: string })[];
}

export function TeamElencoTab({ squad }: TeamElencoTabProps) {
  const players = useMemo(() => sortSquadByPosition(squad), [squad]);
  const showNationality = squadHasNationality(squad);
  const showBirth = squadHasBirthData(squad);

  if (!players.length) {
    return (
      <div className="team-elenco-tab">
        <p className="athlete-historico-empty">Elenco não disponível.</p>
      </div>
    );
  }

  const headClass =
    showNationality && showBirth
      ? "team-elenco-head--full"
      : showNationality
        ? "team-elenco-head--nat"
        : showBirth
          ? "team-elenco-head--birth"
          : "";

  return (
    <div className="team-elenco-tab">
      {(showNationality || showBirth) && (
        <div className={`team-elenco-head ${headClass}`} aria-hidden>
          <span className="team-elenco-head-player" />
          {showNationality ? (
            <span className="team-elenco-head-cell">Nacionalidade</span>
          ) : null}
          {showBirth ? (
            <>
              <span className="team-elenco-head-cell">Data de nascimento</span>
              <span className="team-elenco-head-cell">Idade</span>
            </>
          ) : null}
        </div>
      )}

      <ul className="team-elenco-list">
        {players.map((player) => (
          <TeamElencoRow
            key={player.id}
            player={player}
            showNationality={showNationality}
            showBirth={showBirth}
            headClass={headClass}
          />
        ))}
      </ul>
    </div>
  );
}

function TeamElencoRow({
  player,
  showNationality,
  showBirth,
  headClass,
}: {
  player: Athlete & { id: string };
  showNationality: boolean;
  showBirth: boolean;
  headClass: string;
}) {
  const surname = athleteSurnameLabel(player.full_name, player.surname);
  const position = getPositionName(player.player_positions);
  const positionAbbr = positionAbbreviation(player.player_positions);
  const showPosition = position !== "—";
  const flag = nationalityFlagEmoji(player.nationality);
  const natCode = nationalityCode(player.nationality);
  const birth = formatAthleteBirthLine(player.birth_date, null);
  const age = calcAthleteAge(player.birth_date);

  return (
    <li className="team-elenco-item">
      <Link
        href={`/atletas/${player.id}`}
        className={`team-elenco-row ${headClass}`}
      >
        <div className="team-elenco-player">
          <OrgImage
            src={player.photo_url}
            alt={player.full_name}
            width={44}
            height={44}
            className="team-elenco-photo"
          />
          <div className="team-elenco-player-text">
            <span className="team-elenco-name">{surname}</span>
            {showPosition ? (
              <span className="team-elenco-position team-elenco-position--desktop">
                {position}
              </span>
            ) : null}
            <div className="team-elenco-meta-mobile">
              {showPosition && positionAbbr ? (
                <span className="team-elenco-position team-elenco-position--mobile">
                  {positionAbbr}
                </span>
              ) : null}
              {showNationality && (flag || natCode) ? (
                <span className="team-elenco-meta-mobile-nat">
                  {flag ? (
                    <span className="team-elenco-nat-flag" aria-hidden>
                      {flag}
                    </span>
                  ) : null}
                  {natCode ? (
                    <span className="team-elenco-nat-code">{natCode}</span>
                  ) : null}
                </span>
              ) : null}
              {showBirth && birth ? (
                <span className="team-elenco-meta-mobile-birth">{birth}</span>
              ) : null}
              {showBirth && age != null ? (
                <span className="team-elenco-meta-mobile-age">
                  {age} {age === 1 ? "ano" : "anos"}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {showNationality ? (
          <div className="team-elenco-cell team-elenco-nationality team-elenco-cell--desktop">
            {flag || natCode ? (
              <>
                {flag ? (
                  <span className="team-elenco-nat-flag" aria-hidden>
                    {flag}
                  </span>
                ) : null}
                {natCode ? (
                  <span className="team-elenco-nat-code">{natCode}</span>
                ) : (
                  <span className="team-elenco-empty">—</span>
                )}
              </>
            ) : (
              <span className="team-elenco-empty">—</span>
            )}
          </div>
        ) : null}

        {showBirth ? (
          <>
            <div className="team-elenco-cell team-elenco-birth team-elenco-cell--desktop">
              {birth ?? <span className="team-elenco-empty">—</span>}
            </div>
            <div className="team-elenco-cell team-elenco-age team-elenco-cell--desktop">
              {age != null ? (
                <span>
                  {age} {age === 1 ? "ano" : "anos"}
                </span>
              ) : (
                <span className="team-elenco-empty">—</span>
              )}
            </div>
          </>
        ) : null}
      </Link>
    </li>
  );
}
