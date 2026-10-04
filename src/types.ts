export type Platform = 'chesscom' | 'lichess';

export interface RecentGame {
  id: string;
  url: string;
  speed: string;
  rated: boolean;
  playedAt: string;
  userColor: 'white' | 'black';
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  opponentRating: number;
  opening: string;
  movesCount: number;
}

export interface PlayerProfile {
  username: string;
  platform: Platform;
  avatarUrl: string;
  createdAt: string | null;
  ratings: {
    rapid: number;
    blitz: number;
    bullet: number;
    puzzle: number;
  };
  gamesTotal: number;
  winRates: {
    wins: number;
    losses: number;
    draws: number;
  };
  recentGames: RecentGame[];
}

export interface QuizAnswers {
  experienceLevel: string;
  playstyle: string;
  mainWeakness: string;
  weeklyHours: string;
  targetRating: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  category: 'tactics' | 'opening' | 'endgame' | 'strategy';
  targetTheme?: string;
  completed: boolean;
  resourceName?: string;
  resourceLink?: string;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  subtitle?: string;
  description: string;
  duration: string;
  milestones: RoadmapMilestone[];
}

export interface LichessPuzzle {
  id: string;
  fen: string;
  moves: string[]; // UCI moves list, e.g. ['e2e4', 'e7e5']
  rating: number;
  themes: string[];
  title: string;
  turn: 'w' | 'b';
  source?: string;
}

export interface EngineEvaluation {
  eval: number | string; // e.g. +2.4 or 'M3'
  depth: number;
  pvs?: string[];
  source: string;
}

export interface CoachReview {
  summary: string;
  keyTheme: string;
  tacticalBreakdown: string;
  actionableAdvice: string;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  todaySolved: number;
  dailyGoal: number;
  activityHistory: Record<string, number>; // date -> count
  unlockedBadges: string[];
}

export interface ThemeStat {
  theme: string;
  attempted: number;
  solved: number;
}

export interface UserStats {
  totalAttempted: number;
  totalSolved: number;
  overallAccuracy: number;
  themeStats: Record<string, ThemeStat>;
  recentPuzzles: {
    id: string;
    theme: string;
    rating: number;
    solved: boolean;
    solvedAt: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  lastLoginAt: string;
  chessProfile?: PlayerProfile | null;
  streakData: StreakData;
  userStats: UserStats;
  quizAnswers: QuizAnswers | null;
  completedMilestones: string[];
}

