import { NextRequest, NextResponse } from "next/server";
import { getHallData } from "@/lib/data/hall";
import type { HallEntityTab, HallFilters, HallGender } from "@/lib/types";

function parseGender(value: string | null): HallGender | "" {
  const g = (value ?? "").trim().toLowerCase();
  if (g === "male" || g === "m") return "male";
  if (g === "female" || g === "f") return "female";
  if (g === "all") return "all";
  return "";
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const orgId = searchParams.get("orgId") ?? "";
  const tab = (searchParams.get("tab") ?? "all") as HallEntityTab | "all";

  const filters: HallFilters = {
    competitionId: searchParams.get("competitionId") ?? "",
    editionId: searchParams.get("editionId") ?? "",
    year: searchParams.get("year") ?? "",
    gender: parseGender(searchParams.get("gender")) || "all",
  };

  if (!orgId) {
    return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
  }

  try {
    const data = await getHallData(orgId, filters, tab);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/hall]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
