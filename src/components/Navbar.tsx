import React, { useState, useRef, useEffect } from 'react';
import { Flame, Brain, BookOpen, Target, BarChart2, Sun, Moon, LogIn, LogOut } from 'lucide-react';
import { StreakData } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  activeTab: 'analyze' | 'roadmap' | 'training' | 'stats';
  onSelectTab: (tab: 'analyze' | 'roadmap' | 'training' | 'stats') => void;
  streakData: StreakData;
  onOpenQuiz: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentUser: FirebaseUser | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  streakData,
  onOpenQuiz,
  isDarkMode,
  onToggleTheme,
  currentUser,
  onOpenAuth,
  onSignOut
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isPermanentUser = currentUser && !currentUser.isAnonymous;
  const userLabel = isPermanentUser
    ? currentUser.displayName || currentUser.email?.split('@')[0] || 'Player'
    : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
          <button
            onClick={() => onSelectTab('analyze')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'analyze'
                ? 'bg-[#EBF7F0] text-[#00875A] border border-[#D2EFE0] dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Brain className="w-4 h-4 text-[#00875A] dark:text-emerald-400" />
            <span>Analyze</span>
          </button>

          <button
            onClick={() => onSelectTab('roadmap')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roadmap'
                ? 'bg-[#EBF7F0] text-[#00875A] border border-[#D2EFE0] dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Roadmap</span>
          </button>

          <button
            onClick={() => onSelectTab('training')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'training'
                ? 'bg-[#EBF7F0] text-[#00875A] border border-[#D2EFE0] dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Train Tactics</span>
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-[#EBF7F0] text-[#00875A] border border-[#D2EFE0] dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Stats</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Theme, Streak, Sign In, Quiz) */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Daily Streak Indicator */}
          <button
            onClick={() => onSelectTab('stats')}
            title={`Current Streak: ${streakData.currentStreak} day${streakData.currentStreak === 1 ? '' : 's'}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF6EC] border border-[#FDE5CA] text-[#B5681E] dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 hover:brightness-95 transition-all cursor-pointer"
          >
            <Flame className={`w-3.5 h-3.5 ${streakData.currentStreak > 0 ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-[#B5681E] dark:text-amber-400'}`} />
            <span className="text-xs sm:text-sm font-bold font-mono tabular-nums leading-none">
              {streakData.currentStreak}
            </span>
          </button>

          {/* User Sign In / Profile dropdown */}
          {isPermanentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowUserDropdown(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-[#00875A] text-white flex items-center justify-center text-[10px] uppercase font-bold">
                  {userLabel?.charAt(0) || 'P'}
                </div>
                <span className="max-w-[80px] sm:max-w-[110px] truncate">{userLabel}</span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-mono text-slate-400 uppercase">Signed in as</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                      {currentUser?.email || userLabel}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onSignOut();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>Sign In</span>
            </button>
          )}

          {/* Quiz Button (matching exact green in screenshot) */}
          <button
            onClick={onOpenQuiz}
            className="inline-flex items-center justify-center px-4 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white shadow-xs transition-colors cursor-pointer"
          >
            Quiz
          </button>
        </div>
      </div>
    </header>
  );
};
