import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { athleteSurnameLabel } from "@/lib/utils";

const AWARD_SELECT = `
  id,
  award_type,
  athlete_id,
  staff_member_id,
  winning_team_id,
  edition_id,
  athletes ( id, full_name, surname, photo_url ),
  staff_members ( id, full_name, surname, photo_url ),
  teams!edition_awards_winning_team_id_fkey ( id, full_name, abbreviation, logo_url ),
  competition_editions!edition_awards_edition_id_fkey (
    id,
    custom_name,
    seasons ( name, years ( value ) ),
    competitions ( id, full_name, short_name, logo_url, gender, organization_id )
  )
`;

type GenderFilter = "all" | "male" | "female";

function parseGender(value: string | null): GenderFilter {
  const g = (value ?? "").trim().toLowerCase();
  if (g === "male" || g === "m") return "male";
  if (g === "female" || g === "f") return "female";
  return "all";
}

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function matchesGender(compGender: string | null | undefined, filter: GenderFilter): boolean {
  if (filter === "all") return true;
  const g = (compGender ?? "").toLowerCase();
  if (filter === "male") return g === "male" || g === "m";
  if (filter === "female") return g === "female" || g === "f";
  return true;
}

function personName(
  fullName: string | null | undefined,
  surname: string | null | undefined,
): string {
  if (!fullName?.trim()) return "—";
  return athleteSurnameLabel(fullName, surname ?? null);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orgId = searchParams.get("orgId") ?? "";
  const awardType = searchParams.get("awardType") ?? "";
  const gender = parseGender(searchParams.get("gender"));
  const competitionId = searchParams.get("competitionId") ?? "";

  if (!orgId || !awardType) {
    return NextResponse.json({ error: "Missing orgId or awardType" }, { status: 400 });
  }

  const supabase = getSupabase();

  let compQuery = supabase.from("competitions").select("id").eq("organization_id", orgId);
  if (competitionId) {
    compQuery = compQuery.eq("id", competitionId);
  }

  const { data: competitions, error: compError } = await compQuery;

  if (compError) {
    console.error("[/api/hall/titulos competitions]", compError.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  const compIds = (competitions ?? []).map((row) => row.id as string);
  if (!compIds.length) {
    return NextResponse.json({ items: [] });
  }

  const { data: editions, error: edError } = await supabase
    .from("competition_editions")
    .select("id")
    .in("competition_id", compIds);

  if (edError) {
    console.error("[/api/hall/titulos editions]", edError.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  const editionIds = (editions ?? []).map((row) => row.id as string);
  if (!editionIds.length) {
    return NextResponse.json({ items: [] });
  }

  let query = supabase
    .from("edition_awards")
    .select(AWARD_SELECT)
    .eq("award_type", awardType)
    .in("edition_id", editionIds);

  if (awardType === "champion") {
    query = query.is("athlete_id", null).is("staff_member_id", null);
  } else if (awardType === "best_coach") {
    query = query.not("staff_member_id", "is", null);
  } else {
    query = query.not("athlete_id", "is", null);
  }

  const { data: rows, error } = await query.order("edition_id", { ascending: false });

  if (error) {
    console.error("[/api/hall/titulos awards]", error.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  const items = (rows ?? [])
    .map((row) => {
      const edition = unwrap(
        row.competition_editions as
          | {
              id?: string;
              custom_name?: string | null;
              seasons?: { name?: string; years?: { value?: number } | { value?: number }[] } | { name?: string; years?: { value?: number } | { value?: number }[] }[];
              competitions?: {
                id?: string;
                full_name?: string;
                short_name?: string | null;
                logo_url?: string | null;
                gender?: string | null;
                organization_id?: string;
              } | {
                id?: string;
                full_name?: string;
                short_name?: string | null;
                logo_url?: string | null;
                gender?: string | null;
                organization_id?: string;
              }[];
            }
          | {
              id?: string;
              custom_name?: string | null;
              seasons?: { name?: string; years?: { value?: number } | { value?: number }[] } | { name?: string; years?: { value?: number } | { value?: number }[] }[];
              competitions?: {
                id?: string;
                full_name?: string;
                short_name?: string | null;
                logo_url?: string | null;
                gender?: string | null;
                organization_id?: string;
              } | {
                id?: string;
                full_name?: string;
                short_name?: string | null;
                logo_url?: string | null;
                gender?: string | null;
                organization_id?: string;
              }[];
            }[]
          | null,
      );

      const competition = unwrap(edition?.competitions ?? null);
      if (!competition || competition.organization_id !== orgId) return null;
      if (!matchesGender(competition.gender, gender)) return null;

      const season = unwrap(edition?.seasons ?? null);
      const yearRow = unwrap(season?.years ?? null);
      const year = yearRow?.value != null ? Number(yearRow.value) : null;
      const customName = edition?.custom_name?.trim() || null;
      const seasonName = customName || season?.name?.trim() || null;

      const athlete = unwrap(
        row.athletes as
          | { id?: string; full_name?: string; surname?: string | null; photo_url?: string | null }
          | { id?: string; full_name?: string; surname?: string | null; photo_url?: string | null }[]
          | null,
      );
      const staff = unwrap(
        row.staff_members as
          | { id?: string; full_name?: string; surname?: string | null; photo_url?: string | null }
          | { id?: string; full_name?: string; surname?: string | null; photo_url?: string | null }[]
          | null,
      );
      const team = unwrap(
        row.teams as
          | {
              id?: string;
              full_name?: string;
              abbreviation?: string | null;
              logo_url?: string | null;
            }
          | {
              id?: string;
              full_name?: string;
              abbreviation?: string | null;
              logo_url?: string | null;
            }[]
          | null,
      );

      const isChampion = awardType === "champion";
      const isCoach = awardType === "best_coach";

      let winnerType: "team" | "athlete" | "staff" = "athlete";
      let winnerId = "";
      let winnerName = "—";
      let winnerPhoto: string | null = null;

      if (isChampion && team) {
        winnerType = "team";
        winnerId = team.id ?? "";
        winnerName = team.full_name ?? "—";
        winnerPhoto = team.logo_url ?? null;
      } else if (isCoach && staff) {
        winnerType = "staff";
        winnerId = staff.id ?? "";
        winnerName = personName(staff.full_name, staff.surname);
        winnerPhoto = staff.photo_url ?? null;
      } else if (athlete) {
        winnerType = "athlete";
        winnerId = athlete.id ?? "";
        winnerName = personName(athlete.full_name, athlete.surname);
        winnerPhoto = athlete.photo_url ?? null;
      }

      if (!winnerId) return null;

      return {
        id: row.id as string,
        editionId: row.edition_id as string,
        year,
        seasonName,
        competition: {
          id: competition.id ?? "",
          name: competition.short_name?.trim() || competition.full_name || "—",
          fullName: competition.full_name ?? "—",
          logoUrl: competition.logo_url ?? null,
        },
        winner: {
          type: winnerType,
          id: winnerId,
          name: winnerName,
          photoUrl: winnerPhoto,
          teamName: !isChampion ? (team?.full_name ?? null) : null,
          teamLogo: !isChampion ? (team?.logo_url ?? null) : null,
          teamAbbrev: !isChampion ? (team?.abbreviation ?? null) : null,
        },
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const yearA = a!.year ?? 0;
      const yearB = b!.year ?? 0;
      if (yearA !== yearB) return yearB - yearA;
      return b!.editionId.localeCompare(a!.editionId);
    });

  return NextResponse.json({ items });
}
