export interface Organization {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  description: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
}

export interface Team {
  full_name: string;
  short_name: string | null;
  logo_url: string | null;
}

export interface Season {
  name: string;
}

export interface CompetitionEdition {
  id: string;
  status: string | null;
  is_current: boolean | null;
  seasons: Season | Season[] | null;
}

export interface Competition {
  id: string;
  full_name: string;
  short_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  sport_slug: string | null;
  gender: string | null;
  competition_editions?: CompetitionEdition[];
}

export interface MatchPhase {
  edition_id: string;
  competition_editions?: {
    id: string;
    competitions?: {
      id: string;
      full_name: string;
      short_name: string | null;
      logo_url: string | null;
      organization_id: string;
    } | null;
  } | null;
}

export interface Match {
  id: string;
  match_date: string;
  match_time: string | null;
  status: string;
  score_a: number | null;
  score_b: number | null;
  teams_a: Team | null;
  teams_b: Team | null;
  phases: MatchPhase | null;
}

export interface NewsArticle {
  id: string;
  title: string;
  subtitle: string | null;
  cover_url: string | null;
  published_at: string | null;
}

export interface Athlete {
  full_name: string;
  surname: string | null;
  photo_url: string | null;
}

export interface AthleteStatLeader {
  goals: number | null;
  assists: number | null;
  athletes: Athlete | null;
  teams: Team | null;
}

export interface HomeMatches {
  recent: Match[];
  upcoming: Match[];
}
