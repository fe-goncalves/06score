import type {
  MatchTeamPeriodStat,
  PeriodFoulCounts,
} from "@/lib/match/periodFouls";

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
  created_at?: string | null;
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
  id?: string;
  full_name: string;
  address?: string | null;
}

export interface OrgVenue {
  id: string;
  full_name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  image_url?: string | null;
  organization_id?: string;
  upcoming_matches?: number;
  recent_matches?: number;
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
      primary_color?: string | null;
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
  motm_athlete_id?: string | null;
  motm_team_id?: string | null;
  motm_athlete?: Athlete | null;
  motm_team?: Team | null;
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

export interface HomeMotw {
  athlete_id: string;
  team_id: string | null;
  round_label: string | null;
  athlete_name: string;
  athlete_surname: string | null;
  athlete_photo_url: string | null;
  team_name: string | null;
  team_logo_url: string | null;
}

export interface HomeTotwMember {
  athlete_id: string | null;
  staff_member_id: string | null;
  name: string;
  photo_url: string | null;
  team_abbreviation: string | null;
  team_logo_url: string | null;
  team_primary_color: string | null;
  role: string | null;
  is_staff: boolean;
}

export interface HomeTotw {
  id: string;
  formation: string;
  round_label: string | null;
  created_at: string;
  slots: (HomeTotwMember | null)[];
  coach: HomeTotwMember | null;
  motw_athlete_id: string | null;
}

export interface TotwGalleryEntry {
  id: string;
  phaseId: string | null;
  phaseLabel: string;
  phaseOrder: number;
  roundId: string | null;
  roundLabel: string;
  roundOrder: number;
  totw: HomeTotw;
}

export interface StaffStatLeader {
  totw_count: number;
  staff_members: {
    id: string;
    full_name: string;
    surname: string | null;
    photo_url: string | null;
  } | null;
  teams: Team | null;
}

export interface HomeEditionData {
  editionId: string;
  competitionId: string;
  competitionName: string;
  editionName: string | null;
  standings: StandingRow[];
  currentPhaseType: Phase["phase_type"] | null;
  currentPhaseId: string | null;
  currentPhaseName: string | null;
  phaseMatches: Match[];
  phaseMatchups: Matchup[];
  teams: Team[];
  latestMotw: HomeMotw | null;
  latestTotw: HomeTotw | null;
}

export interface HomeHighlights {
  topScorer: AthleteStatLeader | null;
  topAssister: AthleteStatLeader | null;
  topTeamByTitles: TeamStatLeader | null;
}

export interface HomeHighlightsBundle {
  organization: HomeHighlights;
  byCompetition: Record<string, HomeHighlights>;
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
  red_cards?: number | null;
  totw_count?: number | null;
  athletes: Athlete | null;
  teams: Team | null;
}

export type TeamTitlesLeaderMode = "titles" | "wins";

export interface TeamStatLeader {
  titles: number | null;
  wins: number | null;
  points: number | null;
  teams: Team | null;
  /** Escopo competição: origem do destaque (títulos reais vs. fallback vitórias). */
  mode?: TeamTitlesLeaderMode;
  label?: string;
}

export interface HomeMatches {
  recent: Match[];
  upcoming: Match[];
}

export interface HomeSponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url?: string | null;
  display_order?: number | null;
}

export interface HomeTikTokVideo {
  id: string;
  video_url: string;
  video_id: string;
  title: string | null;
  thumbnail_url: string | null;
  display_order?: number | null;
  published_at?: string | null;
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
  yellow_cards?: number;
  red_cards?: number;
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
  yellow_cards?: number;
  red_cards?: number;
  points_pct?: number;
  /** Últimos jogos na fase (V/E/D), antigo → recente. */
  form?: ("V" | "E" | "D")[];
}

export interface EditionTeam {
  id: string;
  edition_id: string;
  team_id: string;
  is_free_agent_pool: boolean;
  is_active?: boolean;
  display_order?: number;
  teams: Team | null;
  athlete_count?: number;
  /** Edições distintas nesta competição */
  competition_participations?: number;
  /** Títulos (campeão) nesta competição */
  competition_titles?: number;
  /** Vitórias acumuladas nesta competição */
  competition_wins?: number;
}

export interface Group {
  id: string;
  phase_id: string;
  name: string;
  custom_label: string | null;
  display_order: number;
}

export interface TableMarker {
  id: string;
  phase_id: string;
  description: string;
  color_hex: string;
  show_background: boolean;
  position_from: number;
  position_to: number;
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
  match_rating?: number | null;
  athletes: Athlete | null;
  edition_teams?: { team_id?: string; teams: Team | null } | null;
}

export interface MatchStaffLineup {
  staff_member_id: string;
  edition_team_id: string;
  is_present: boolean;
  staff_members: {
    id: string;
    full_name: string;
    surname: string | null;
    photo_url: string | null;
  } | null;
  edition_teams?: {
    team_id?: string;
    teams: Pick<Team, "id" | "full_name" | "logo_url"> | null;
  } | null;
}

export interface MatchAthleteRating {
  athlete_id: string;
  rating: number;
  edition_team_id?: string | null;
}

export interface MatchAction {
  id: string;
  match_id: string;
  team_id: string;
  action_type: string;
  minute: number | null;
  period: string | null;
  primary_athlete_id: string | null;
  secondary_athlete_id?: string | null;
  goal_type?: string | null;
  is_own_goal?: boolean | null;
  miss_result?: string | null;
  athletes?: Athlete | null;
  secondary_athletes?: Athlete | null;
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
  staffLineups: MatchStaffLineup[];
  ratings: MatchAthleteRating[];
  actions: MatchAction[];
  teamAId: string;
  teamBId: string;
  /** Totais de faltas por período (`match_team_stats`). */
  periodFoulCounts: PeriodFoulCounts;
  /** Linhas brutas de `match_team_stats` (faltas, média de nota, etc.). */
  teamStats: MatchTeamPeriodStat[];
  /** Confrontos finalizados entre as duas equipes (todas as competições). */
  h2hMatches: Match[];
  nextGameA: Match | null;
  nextGameB: Match | null;
}

export type MatchPageData = MatchDetailData;

export interface EditionPhaseLeader {
  phaseId: string;
  phaseName: string;
  isCurrent: boolean;
  team: Team | null;
  points: number;
}

export interface EditionAwardPerson {
  id: string;
  full_name: string;
  surname: string | null;
  photo_url: string | null;
}

export interface EditionAward {
  award_type: string;
  athlete_id: string | null;
  staff_member_id: string | null;
  winning_team_id: string | null;
  athletes: EditionAwardPerson | EditionAwardPerson[] | null;
  staff_members: EditionAwardPerson | EditionAwardPerson[] | null;
  teams: Team | Team[] | null;
}

export interface EditionTotsSquad {
  id: string;
  formation: string;
  created_at: string;
  slots: (HomeTotwMember | null)[];
  staff: HomeTotwMember[];
}

export interface CompetitionEditionDetails {
  totalGoals: number;
  totalAthletes: number;
  totalYellowCards: number;
  totalRedCards: number;
  totalCards: number;
  debutTeams: Team[];
  phaseLeaders: EditionPhaseLeader[];
  pastChampions: Team[];
  defendingChampion: Team | null;
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
  editionDetails: CompetitionEditionDetails;
  awards: EditionAward[];
  totsSquad: EditionTotsSquad | null;
  topScorers: AthleteStatLeader[];
  topAssisters: AthleteStatLeader[];
  topYellowCards: AthleteStatLeader[];
  topMotm: AthleteStatLeader[];
  topRedCards: AthleteStatLeader[];
  topTotwSelections: AthleteStatLeader[];
  totwGallery: TotwGalleryEntry[];
  topCoaches: StaffStatLeader[];
  groups: Group[];
  groupTeams: GroupTeam[];
  tableMarkers: TableMarker[];
}

export interface AthleteListItem {
  id: string;
  full_name: string;
  surname: string | null;
  photo_url: string | null;
  current_team: Team | null;
}

export interface AthleteRecentMatch {
  match: Match;
  rating: number | null;
  isMotm: boolean;
}

export interface AthleteProfileData {
  athlete: Athlete & { id: string; nationality: string | null };
  careerStats: AthleteCareerStats | null;
  stints: AthleteTeamStint[];
  recentMatches: AthleteRecentMatch[];
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