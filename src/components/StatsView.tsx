import React from 'react';
import { Flame, Trophy, Target, Award, CheckCircle, Clock, Cloud, LogIn } from 'lucide-react';
import { StreakData, UserStats } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface StatsViewProps {
  streakData: StreakData;
  userStats: UserStats;
  onGoToTraining: () => void;
  currentUser?: FirebaseUser | null;
  onOpenAuth?: () => void;
}

const BADGES = [
  { id: 'First Move', title: 'First Move', desc: 'Solved your very first training puzzle', icon: '♟️' },
  { id: '3-Day Fire', title: '3-Day Fire', desc: 'Maintained a 3-day consecutive puzzle streak', icon: '🔥' },
  { id: '7-Day Master', title: '7-Day Master', desc: 'A full week of dedicated daily chess training', icon: '⚡' },
  { id: 'Fortnight Focus', title: 'Fortnight Focus', desc: '14 consecutive days of tactical discipline', icon: '⚔️' },
  { id: 'Daily Goal Met', title: 'Daily Goal Met', desc: 'Hit your daily target of 3+ tactical puzzles', icon: '🎯' },
  { id: 'Century Club', title: 'Century Club', desc: 'Attempted over 100 tactical exercises', icon: '💯' },
  { id: 'Tactical Precision', title: 'Tactical Precision', desc: 'Achieved > 75% accuracy across 10+ puzzles', icon: '👑' }
];

export const StatsView: React.FC<StatsViewProps> = ({
  streakData,
  userStats,
  onGoToTraining,
  currentUser,
  onOpenAuth
}) => {
  const isPermanentUser = currentUser && !currentUser.isAnonymous;

  // Generate last 14 days for activity calendar
  const pastDays = Array.from({ length: 14 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - idx));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const count = streakData.activityHistory?.[key] || 0;
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    return { dateKey: key, count, dayName, dayNumber };
  });

  const dailyGoalPercent = Math.min(100, Math.round(((streakData.todaySolved || 0) / streakData.dailyGoal) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Player Analytics & Progress
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            Training Stats & Streaks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor your tactical accuracy, daily training habits, and theme proficiencies.
          </p>
        </div>

        <button
          onClick={onGoToTraining}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
        >
          Train More Puzzles
        </button>
      </div>

      {/* Cloud Sync Callout Banner if not signed in */}
      {!isPermanentUser && onOpenAuth && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Never lose your streak or tactical ratings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sign in to save your history permanently in the cloud and access it from any browser or device.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Sync</span>
          </button>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              {streakData.currentStreak}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Best: {streakData.bestStreak} days
            </div>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tactical Accuracy</span>
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {userStats.overallAccuracy}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              {userStats.totalSolved} of {userStats.totalAttempted} solved
            </div>
          </div>
        </div>

        {/* Today's Goal */}
        <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Daily Goal</span>
            <CheckCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-sky-600 dark:text-sky-400 tabular-nums">
              {streakData.todaySolved || 0} / {streakData.dailyGoal}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-sky-500 h-full transition-all duration-300"
                style={{ width: `${dailyGoalPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Solved Count */}
        <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Puzzles Solved</span>
            <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
              {userStats.totalSolved}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Lichess Verified
            </div>
          </div>
        </div>
      </div>

      {/* 14-Day Activity Heatmap */}
      <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>14-Day Tactical Workout Activity</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Daily puzzle volume</span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
          {pastDays.map(day => {
            const hasActivity = day.count > 0;
            return (
              <div
                key={day.dateKey}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between min-h-[70px] ${
                  hasActivity
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-500'
                }`}
              >
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                  {day.dayName}
                </span>
                <span className={`text-base font-bold font-mono ${hasActivity ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {day.dayNumber}
                </span>
                <span className={`text-[10px] font-mono ${hasActivity ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400 dark:text-slate-600'}`}>
                  {day.count} pts
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tactical Theme Breakdown */}
      <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
            Accuracy by Tactical Motif
          </h2>
          <span className="text-xs text-slate-500">Self-correction metrics</span>
        </div>

        <div className="space-y-3">
          {Object.entries(userStats.themeStats).map(([key, stat]) => {
            const percent = stat.attempted > 0 ? Math.round((stat.solved / stat.attempted) * 100) : 0;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{stat.theme}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">{stat.solved} / {stat.attempted}</span>
                    <span className={`font-bold ${percent >= 70 ? 'text-emerald-600 dark:text-emerald-400' : percent >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {stat.attempted > 0 ? `${percent}%` : '—'}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <div
                    className={`h-full transition-all duration-500 ${
                      percent >= 70 ? 'bg-emerald-500' : percent >= 40 ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    style={{ width: `${Math.max(4, percent)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Badges Showcase */}
      <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Milestone Achievements</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {streakData.unlockedBadges?.length || 0} / {BADGES.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {BADGES.map(badge => {
            const isUnlocked = streakData.unlockedBadges?.includes(badge.id) ||
              (badge.id === 'Century Club' && userStats.totalAttempted >= 100) ||
              (badge.id === 'Tactical Precision' && userStats.totalSolved >= 10 && userStats.overallAccuracy >= 75);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-600/40 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 opacity-60'
                }`}
              >
                <div className="text-2xl shrink-0 select-none">
                  {badge.icon}
                </div>
                <div>
                  <div className={`text-xs font-bold ${isUnlocked ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {badge.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {badge.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
