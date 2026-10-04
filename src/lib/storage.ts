import { StreakData, UserStats, QuizAnswers, RoadmapMilestone } from '../types';

const STREAK_KEY = 'chess_coach_streak_data';
const STATS_KEY = 'chess_coach_user_stats';
const QUIZ_KEY = 'chess_coach_quiz_answers';
const ROADMAP_PROGRESS_KEY = 'chess_coach_roadmap_progress';
const PROFILE_KEY = 'chess_coach_saved_profile';

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadStreakData(): StreakData {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  const defaultData: StreakData = {
    currentStreak: 0,
    bestStreak: 0,
    lastActiveDate: '',
    todaySolved: 0,
    dailyGoal: 3,
    activityHistory: {},
    unlockedBadges: []
  };

  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return defaultData;
    const data: StreakData = JSON.parse(raw);

    // If last active date is earlier than yesterday, streak is broken
    if (data.lastActiveDate && data.lastActiveDate !== today && data.lastActiveDate !== yesterday) {
      data.currentStreak = 0;
    }

    // Reset todaySolved if it's a new day
    if (data.lastActiveDate !== today) {
      data.todaySolved = 0;
    }

    return data;
  } catch {
    return defaultData;
  }
}

export function recordStreakPuzzleSolve(): StreakData {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  const data = loadStreakData();

  data.todaySolved = (data.todaySolved || 0) + 1;
  data.activityHistory = data.activityHistory || {};
  data.activityHistory[today] = (data.activityHistory[today] || 0) + 1;

  if (data.lastActiveDate !== today) {
    if (data.lastActiveDate === yesterday) {
      data.currentStreak += 1;
    } else {
      data.currentStreak = 1;
    }
    data.lastActiveDate = today;
  }

  if (data.currentStreak > data.bestStreak) {
    data.bestStreak = data.currentStreak;
  }

  // Check badges
  const badges = new Set(data.unlockedBadges || []);
  if (data.currentStreak >= 1) badges.add('First Move');
  if (data.currentStreak >= 3) badges.add('3-Day Fire');
  if (data.currentStreak >= 7) badges.add('7-Day Master');
  if (data.currentStreak >= 14) badges.add('Fortnight Focus');
  if (data.currentStreak >= 30) badges.add('Monthly Grandmaster');
  if ((data.activityHistory[today] || 0) >= data.dailyGoal) badges.add('Daily Goal Met');

  data.unlockedBadges = Array.from(badges);

  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save streak data:', e);
  }

  return data;
}

export function loadUserStats(): UserStats {
  const defaultStats: UserStats = {
    totalAttempted: 0,
    totalSolved: 0,
    overallAccuracy: 0,
    themeStats: {
      fork: { theme: 'Fork', attempted: 0, solved: 0 },
      pin: { theme: 'Pin', attempted: 0, solved: 0 },
      skewer: { theme: 'Skewer', attempted: 0, solved: 0 },
      discoveredAttack: { theme: 'Discovered Attack', attempted: 0, solved: 0 },
      mateIn2: { theme: 'Mate in 2', attempted: 0, solved: 0 },
      endgame: { theme: 'Endgame', attempted: 0, solved: 0 },
      opening: { theme: 'Opening', attempted: 0, solved: 0 }
    },
    recentPuzzles: []
  };

  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats;
    const stats: UserStats = JSON.parse(raw);
    return { ...defaultStats, ...stats, themeStats: { ...defaultStats.themeStats, ...stats.themeStats } };
  } catch {
    return defaultStats;
  }
}

export function recordPuzzleResult(
  puzzleId: string,
  theme: string,
  rating: number,
  solved: boolean
): UserStats {
  const stats = loadUserStats();

  stats.totalAttempted += 1;
  if (solved) stats.totalSolved += 1;
  stats.overallAccuracy = Math.round((stats.totalSolved / Math.max(1, stats.totalAttempted)) * 100);

  // Normalize theme key
  const cleanTheme = theme || 'tactics';
  if (!stats.themeStats[cleanTheme]) {
    stats.themeStats[cleanTheme] = {
      theme: cleanTheme.charAt(0).toUpperCase() + cleanTheme.slice(1),
      attempted: 0,
      solved: 0
    };
  }
  stats.themeStats[cleanTheme].attempted += 1;
  if (solved) stats.themeStats[cleanTheme].solved += 1;

  stats.recentPuzzles.unshift({
    id: puzzleId,
    theme: cleanTheme,
    rating,
    solved,
    solvedAt: new Date().toISOString()
  });
  if (stats.recentPuzzles.length > 25) {
    stats.recentPuzzles.pop();
  }

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to save stats:', e);
  }

  return stats;
}

export function loadQuizAnswers(): QuizAnswers | null {
  try {
    const raw = localStorage.getItem(QUIZ_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveQuizAnswers(answers: QuizAnswers): void {
  try {
    localStorage.setItem(QUIZ_KEY, JSON.stringify(answers));
  } catch (e) {
    console.warn('Failed to save quiz answers:', e);
  }
}

export function loadCompletedMilestones(): string[] {
  try {
    const raw = localStorage.getItem(ROADMAP_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleMilestoneCompleted(id: string): string[] {
  const current = loadCompletedMilestones();
  const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
  try {
    localStorage.setItem(ROADMAP_PROGRESS_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('Failed to save milestone:', e);
  }
  return next;
}

const FEEDBACK_KEY = 'chess_coach_feedback_entries';

const SEED_FEEDBACK: import('../types').FeedbackEntry[] = [
  {
    id: 'fb-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    puzzleId: '01Qk9',
    rating: 1680,
    type: 'positive',
    category: 'tactical_advice',
    userComment: 'The GM Coach explanation about dislodging the queen first was super clear. Helped me spot the tactic in blitz.',
    coachReviewSummary: 'Great tactical execution! You spotted the key weakness.',
    status: 'new'
  },
  {
    id: 'fb-2',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    puzzleId: '02d9z',
    rating: 1720,
    type: 'negative',
    category: 'blunder_detection',
    userComment: 'I played Rc1 instead of Bb2. The engine called it a blunder but Rc1 still looked equal. Good explanation though.',
    coachReviewSummary: 'Close attempt, but Rc1 missteps. The solution decisively captures the initiative.',
    status: 'reviewed'
  }
];

export function loadFeedbackEntries(): import('../types').FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    if (!raw) {
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(SEED_FEEDBACK));
      return SEED_FEEDBACK;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_FEEDBACK;
  }
}

export function saveFeedbackEntry(entry: Omit<import('../types').FeedbackEntry, 'id' | 'timestamp' | 'status'>): import('../types').FeedbackEntry {
  const entries = loadFeedbackEntries();
  const newEntry: import('../types').FeedbackEntry = {
    ...entry,
    id: `fb-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'new'
  };
  const updated = [newEntry, ...entries];
  try {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save feedback:', e);
  }
  return newEntry;
}

export function updateFeedbackStatus(id: string, status: 'new' | 'reviewed' | 'resolved'): import('../types').FeedbackEntry[] {
  const entries = loadFeedbackEntries();
  const updated = entries.map(e => e.id === id ? { ...e, status } : e);
  try {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to update feedback:', e);
  }
  return updated;
}

