import { NextRequest, NextResponse } from "next/server";
import { getHallData } from "@/lib/data/hall";
import type { HallFilters } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const orgId = searchParams.get("orgId") ?? "";
  const filters: HallFilters = {
    competitionId: searchParams.get("competitionId") ?? "",
    editionId: searchParams.get("editionId") ?? "",
    teamId: searchParams.get("teamId") ?? "",
    gender: searchParams.get("gender") ?? "",
  };

  if (!orgId) {
    return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
  }

  try {
    const data = await getHallData(orgId, filters);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/hall]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}