export enum Sport {
  Basketball = 'Basketball',
  Soccer = 'Soccer',
  Volleyball = 'Volleyball',
}

export interface Team {
  name: string;
  score: number;
  color: string;
}

export interface TeamConfig {
    name: string;
    color: string;
}

export interface TeamStat {
  wins: number;
  losses: number;
  ties: number;
  totalGames: number;
  teamConfig: TeamConfig;
}

export interface SavedTeam {
    id: string;
    name: string;
    color: string;
    sport?: Sport | 'Universal';
}

export interface MatchConfig {
  sport: Sport;
  teamA: TeamConfig;
  teamB: TeamConfig;
  durationMinutes: number;
  durationSeconds: number;
  periods: number;
  gameMode?: 'time' | 'score';
  targetScore?: number;
}

export type PauseReason = 'Timeout' | 'Foul' | 'Violation' | 'Challenge';

export enum GameStatus {
  NotStarted = 'NOT_STARTED',
  InProgress = 'IN_PROGRESS',
  Paused = 'PAUSED',
  PeriodBreak = 'PERIOD_BREAK',
  Finished = 'FINISHED',
  TieBreak = 'TIE_BREAK',
}

export interface GameState {
  teamA: Team;
  teamB: Team;
  currentPeriod: number;
  pauseReason?: PauseReason | null;
  status: GameStatus;
  setScores?: { a: number; b: number }; // For volleyball
  winner?: 'A' | 'B' | 'TIE' | null;
  message?: string | null; // For overlays
  periodScores: Array<{ a: number; b: number }>;
  notification?: { message: string };
}

export type Theme = 'light' | 'dark' | 'coder' | 'viola';

export type View = 'landing' | 'dashboard' | 'setup' | 'match' | 'audience' | 'settings' | 'analytics' | 'history' | 'teams';

export enum Font {
    Display = 'display',
    Mono = 'mono',
    Sans = 'sans',
}

export enum Layout {
    Wide = 'wide',
    Compact = 'compact',
}

export interface SportDefaultSettings {
    durationMinutes: number;
    durationSeconds: number;
    periods: number;
    targetScore: number;
}

export interface Settings {
    theme: Theme;
    font: Font;
    layout: Layout;
    defaultSport: Sport;
    defaultTeamAColor: string;
    defaultTeamBColor: string;
    sportDefaults: Record<Sport, SportDefaultSettings>;
}

export type MatchStatus = 'In Progress' | 'Finished' | 'Upcoming';

export type Match = MatchConfig & {
  id: string;
  status: MatchStatus;
  isArchived?: boolean;
  isCompleted?: boolean;
  finalScoreA?: number;
  finalScoreB?: number;
  periodScores?: Array<{ a: number; b: number }>;
};