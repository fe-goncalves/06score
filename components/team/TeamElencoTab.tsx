"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AthletePhotoPlaceholder } from "@/components/ui/AthletePhotoPlaceholder";
import { NationalityFlag } from "@/components/ui/NationalityFlag";
import { OrgImage } from "@/components/ui/OrgImage";
import {
  calcAthleteAge,
  formatAthleteBirthLine,
  nationalityCode,
  nationalityIso2,
} from "@/lib/athlete/athleteHeaderFormat";
import {
  groupSquadByPosition,
  positionAbbreviation,
  squadHasBirthData,
  squadHasNationality,
} from "@/lib/team/squadDisplay";
import type { Athlete, TeamStaffMember } from "@/lib/types";
import { athleteSurnameLabel, getPositionName } from "@/lib/utils";

interface TeamElencoTabProps {
  squad: (Athlete & { id: string })[];
  staff?: TeamStaffMember[];
  showBirth?: boolean;
  showAge?: boolean;
}

function resolveElencoHeadClass(
  showNationality: boolean,
  showBirthDate: boolean,
  showAgeCol: boolean,
): string {
  if (showNationality && showBirthDate && showAgeCol) return "team-elenco-head--full";
  if (showNationality && showBirthDate) return "team-elenco-head--nat-birth";
  if (showNationality && showAgeCol) return "team-elenco-head--nat-age";
  if (showNationality) return "team-elenco-head--nat";
  if (showBirthDate && showAgeCol) return "team-elenco-head--birth";
  if (showAgeCol) return "team-elenco-head--age";
  return "";
}

export function TeamElencoTab({
  squad,
  staff = [],
  showBirth = true,
  showAge,
}: TeamElencoTabProps) {
  const groups = useMemo(() => groupSquadByPosition(squad), [squad]);
  const showNationality = squadHasNationality(squad);
  const hasBirthData = squadHasBirthData(squad);
  const showBirthDate = showBirth && hasBirthData;
  const showAgeCol = (showAge ?? showBirth) && hasBirthData;
  const headClass = resolveElencoHeadClass(
    showNationality,
    showBirthDate,
    showAgeCol,
  );

  if (!groups.length && !staff.length) {
    return (
      <div className="team-elenco-tab">
        <p className="athlete-historico-empty">Elenco não disponível.</p>
      </div>
    );
  }

  return (
    <div className="team-elenco-tab">
      {(showNationality || showBirthDate || showAgeCol) && groups.length > 0 && (
        <div className={`team-elenco-head ${headClass}`} aria-hidden>
          <span className="team-elenco-head-player" />
          {showNationality ? (
            <span className="team-elenco-head-cell">Nacionalidade</span>
          ) : null}
          {showBirthDate ? (
            <span className="team-elenco-head-cell">Data de nascimento</span>
          ) : null}
          {showAgeCol ? (
            <span className="team-elenco-head-cell">Idade</span>
          ) : null}
        </div>
      )}

      {groups.map((group) => (
        <section key={group.bucket} className="team-elenco-group">
          <h3 className="team-elenco-group-title">{group.label}</h3>
          <ul className="team-elenco-list">
            {group.players.map((player) => (
              <TeamElencoRow
                key={player.id}
                player={player}
                showNationality={showNationality}
                showBirthDate={showBirthDate}
                showAge={showAgeCol}
                headClass={headClass}
              />
            ))}
          </ul>
        </section>
      ))}

      {staff.length > 0 ? (
        <section className="team-elenco-group team-elenco-group--staff">
          <h3 className="team-elenco-group-title">Comissão técnica</h3>
          <ul className="team-elenco-list">
            {staff.map((member) => (
              <li key={member.id} className="team-elenco-item">
                <Link
                  href={`/comissao/${member.id}`}
                  className={`team-elenco-row ${headClass}`}
                >
                  <div className="team-elenco-player">
                    {member.photo_url ? (
                      <OrgImage
                        src={member.photo_url}
                        alt={member.full_name}
                        width={44}
                        height={44}
                        className="team-elenco-photo"
                      />
                    ) : (
                      <span className="team-elenco-photo team-elenco-photo-placeholder">
                        <AthletePhotoPlaceholder />
                      </span>
                    )}
                    <div className="team-elenco-player-text">
                      <span className="team-elenco-name">
                        {member.surname ?? member.full_name}
                      </span>
                      {member.role ? (
                        <span className="team-elenco-position team-elenco-position--desktop">
                          {member.role}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function TeamElencoRow({
  player,
  showNationality,
  showBirthDate,
  showAge,
  headClass,
}: {
  player: Athlete & { id: string };
  showNationality: boolean;
  showBirthDate: boolean;
  showAge: boolean;
  headClass: string;
}) {
  const surname = athleteSurnameLabel(player.full_name, player.surname);
  const position = getPositionName(player.player_positions);
  const positionAbbr = positionAbbreviation(player.player_positions);
  const showPosition = position !== "—";
  const hasFlag = nationalityIso2(player.nationality) != null;
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
          {player.photo_url ? (
            <OrgImage
              src={player.photo_url}
              alt={player.full_name}
              width={44}
              height={44}
              className="team-elenco-photo"
            />
          ) : (
            <span className="team-elenco-photo team-elenco-photo-placeholder">
              <AthletePhotoPlaceholder />
            </span>
          )}
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
              {showNationality && (hasFlag || natCode) ? (
                <span className="team-elenco-meta-mobile-nat">
                  {hasFlag ? (
                    <NationalityFlag
                      nationality={player.nationality}
                      className="team-elenco-nat-flag"
                    />
                  ) : null}
                  {natCode ? (
                    <span className="team-elenco-nat-code">{natCode}</span>
                  ) : null}
                </span>
              ) : null}
              {showBirthDate && birth ? (
                <span className="team-elenco-meta-mobile-birth">{birth}</span>
              ) : null}
              {showAge && age != null ? (
                <span className="team-elenco-meta-mobile-age">
                  {age} {age === 1 ? "ano" : "anos"}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {showNationality ? (
          <div className="team-elenco-cell team-elenco-nationality team-elenco-cell--desktop">
            {hasFlag || natCode ? (
              <>
                {hasFlag ? (
                  <NationalityFlag
                    nationality={player.nationality}
                    className="team-elenco-nat-flag"
                  />
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

        {showBirthDate ? (
          <div className="team-elenco-cell team-elenco-birth team-elenco-cell--desktop">
            {birth ?? <span className="team-elenco-empty">—</span>}
          </div>
        ) : null}

        {showAge ? (
          <div className="team-elenco-cell team-elenco-age team-elenco-cell--desktop">
            {age != null ? (
              <span>
                {age} {age === 1 ? "ano" : "anos"}
              </span>
            ) : (
              <span className="team-elenco-empty">—</span>
            )}
          </div>
        ) : null}
      </Link>
    </li>
  );
}
