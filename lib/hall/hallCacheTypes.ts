export interface HallCacheAthlete {
  id: string;
  full_name: string;
  surname?: string | null;
  photo_url?: string | null;
  team_logo?: string | null;
  team_name?: string | null;
}

export interface HallCacheTeam {
  id: string;
  full_name: string;
  logo_url?: string | null;
  abbreviation?: string | null;
}

export interface HallCacheContext {
  match_date?: string | null;
  team_a?: string | null;
  team_b?: string | null;
  score?: string | null;
  competition?: string | null;
}

export interface HallCacheItem {
  rank: number;
  athlete?: HallCacheAthlete;
  team?: HallCacheTeam;
  value: number;
  label: string;
  value_display?: string | null;
  context?: HallCacheContext | null;
}
