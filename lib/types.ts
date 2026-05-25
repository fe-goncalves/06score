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
  id?: string;
  full_name: string;
  short_name: string | null;
  abbreviation?: string | null;
  logo_url: string | null;
  primary_color?: string | null;
}

export interface Season {
  name: string;
}

export interface CompetitionEdition {
  id: string;
  status: string | null;
  is_current: boolean | null;
  custom_name?: string | null;
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

export interface Phase {
  id: string;
  edition_id: string;
  full_name: string;
  custom_label: string | null;
  phase_type: "round_robin" | "group_stage" | "knockout" | "conference";
  display_order: number;
  is_current: boolean | null;
}

export interface Round {
  id: string;
  phase_id: string;
  name: string;
  custom_label: string | null;
  display_order: number;
}

export interface Matchup {
  id: string;
  phase_id: string;
  conference_id?: string | null;
  round_label: string;
  display_order: number;
  is_completed: boolean | null;
  team_a_id: string | null;
  team_b_id: string | null;
  teams_a?: Team | null;
  teams_b?: Team | null;
}

export interface Venue {
  full_name: string;
  address?: string | null;
}

export interface MatchPhase {
  id?: string;
  edition_id: string;
  full_name?: string;
  custom_label?: string | null;
  phase_type?: string;
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
  phase_id?: string;
  round_id?: string | null;
  matchup_id?: string | null;
  team_a_id?: string;
  team_b_id?: string;
  match_date: string;
  match_time: string | null;
  status: string;
  score_a: number | null;
  score_b: number | null;
  teams_a: Team | null;
  teams_b: Team | null;
  phases: MatchPhase | null;
  rounds?: Round | null;
  venues?: Venue | null;
}

export interface NewsArticle {
  id: string;
  title: string;
  subtitle: string | null;
  cover_url: string | null;
  published_at: string | null;
}

export interface HomeNewsArticle extends NewsArticle {
  competition_ids: string[];
}

export interface HomeEditionData {
  editionId: string;
  competitionId: string;
  competitionName: string;
  standings: StandingRow[];
  teams: Team[];
  topScorer: AthleteStatLeader | null;
  topAssister: AthleteStatLeader | null;
  topMvp: AthleteStatLeader | null;
}

export interface Athlete {
  id?: string;
  full_name: string;
  surname: string | null;
  photo_url: string | null;
  nationality?: string | null;
  position_id?: string | null;
  player_positions?: PlayerPosition | PlayerPosition[] | null;
}

export interface PlayerPosition {
  full_name: string;
  abbreviation?: string | null;
}

export interface AthleteStatLeader {
  goals: number | null;
  assists: number | null;
  motm_count?: number | null;
  yellow_cards?: number | null;
  athletes: Athlete | null;
  teams: Team | null;
}

export interface HomeMatches {
  recent: Match[];
  upcoming: Match[];
}

export interface TeamEditionStats {
  edition_id: string;
  team_id: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_scored: number;
  goals_conceded: number;
  points: number;
  teams: Team | null;
}

export interface StandingRow {
  team_id: string;
  team: Team;
  position: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_scored: number;
  goals_conceded: number;
  goal_difference: number;
  points: number;
}

export interface EditionTeam {
  id: string;
  edition_id: string;
  team_id: string;
  is_free_agent_pool: boolean;
  teams: Team | null;
  athlete_count?: number;
}

export interface Group {
  id: string;
  phase_id: string;
  name: string;
  custom_label: string | null;
  display_order: number;
}

export interface GroupTeam {
  id: string;
  group_id: string;
  edition_team_id: string;
  edition_teams?: EditionTeam | null;
}

export interface AthleteCareerStats {
  total_matches: number;
  total_goals: number;
  total_assists: number;
  total_yellow_cards: number;
  total_red_cards: number;
  total_motm: number;
}

export interface AthleteTeamStint {
  id: string;
  athlete_id: string;
  team_id: string;
  started_at: string;
  ended_at: string | null;
  is_current: boolean;
  is_active: boolean;
  teams: Team | null;
}

export interface MatchLineup {
  match_id: string;
  athlete_id: string;
  edition_team_id: string;
  is_present: boolean;
  played_as_goalkeeper: boolean;
  is_captain: boolean;
  athletes: Athlete | null;
  edition_teams?: { teams: Team | null } | null;
}

export interface MatchAthleteRating {
  match_id: string;
  athlete_id: string;
  rating: number;
  is_public: boolean;
}

export interface MatchAction {
  id: string;
  match_id: string;
  team_id: string;
  action_type: string;
  minute: number | null;
  period: string | null;
  primary_athlete_id: string | null;
  goal_type?: string | null;
  is_own_goal?: boolean | null;
  athletes?: Athlete | null;
}

export interface TimelineEntry extends MatchAction {
  score_a: number;
  score_b: number;
}

export interface MatchTeamStatsRow {
  goals: number;
  yellow_cards: number;
  red_cards: number;
  fouls: number;
  possession?: number | null;
}

export interface MatchDetailData {
  match: Match;
  lineups: MatchLineup[];
  ratings: MatchAthleteRating[];
  actions: MatchAction[];
  teamAId: string;
  teamBId: string;
}

export interface CompetitionHubData {
  competition: Competition;
  editions: CompetitionEdition[];
  currentEdition: CompetitionEdition | null;
  phases: Phase[];
  teamEditionStats: TeamEditionStats[];
  matches: Match[];
  matchups: Matchup[];
  editionTeams: EditionTeam[];
  topScorers: AthleteStatLeader[];
  topAssisters: AthleteStatLeader[];
  topYellowCards: AthleteStatLeader[];
  groups: Group[];
  groupTeams: GroupTeam[];
}

export interface AthleteListItem {
  id: string;
  full_name: string;
  surname: string | null;
  photo_url: string | null;
  current_team: Team | null;
}

export interface AthleteProfileData {
  athlete: Athlete & { id: string; nationality: string | null };
  careerStats: AthleteCareerStats | null;
  stints: AthleteTeamStint[];
  recentMatches: Match[];
}

export interface TeamProfileData {
  team: Team & { id: string };
  squad: (Athlete & { id: string })[];
  editionStats: TeamEditionStats | null;
  recentMatches: Match[];
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

export interface RankingRow {
  team_id: string;
  team_name: string;
  logo_url: string | null;
  total_points: number;
}

// ─── Notícias ─────────────────────────────────────────────────────────────────

export interface NewsArticleListItem {
  id: string;
  title: string;
  subtitle: string | null;
  cover_url: string | null;
  published_at: string | null;
  competition_ids: string[];
}

export interface NewsArticleDetail {
  id: string;
  title: string;
  subtitle: string | null;
  cover_url: string | null;
  published_at: string | null;
  body: object | null;
  tags_teams: { id: string; full_name: string; short_name: string | null; logo_url: string | null }[];
  tags_competitions: { id: string; full_name: string; short_name: string | null }[];
}

// ─── Hall da Fama ─────────────────────────────────────────────────────────────

export interface HallEntry {
  id: string;
  name: string;
  photo_url: string | null;
  value: number;
  team_name?: string | null;
  team_logo?: string | null;
}

export interface HallCategory {
  key: string;
  label: string;
  section: "athletes" | "teams" | "staff";
  entries: HallEntry[];
}

export interface HallFilterOptions {
  competitions: { id: string; full_name: string; short_name: string | null; gender: string | null }[];
  editions: { id: string; competition_id: string; season_name: string }[];
  teams: { id: string; full_name: string }[];
}

export interface HallSectionData {
  athletes: HallCategory[];
  teams: HallCategory[];
  staff: HallCategory[];
}

export interface HallFilters {
  competitionId: string;
  editionId: string;
  teamId: string;
  gender: string;
}