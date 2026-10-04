import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AnalyzeView } from './components/AnalyzeView';
import { RoadmapView } from './components/RoadmapView';
import { TrainingArena } from './components/TrainingArena';
import { StatsView } from './components/StatsView';
import { QuizModal } from './components/QuizModal';
import { CoachChatModal } from './components/CoachChatModal';
import { AuthModal } from './components/AuthModal';
import { Platform, PlayerProfile, StreakData, UserStats, QuizAnswers } from './types';
import {
  loadStreakData,
  loadUserStats,
  loadQuizAnswers,
  saveQuizAnswers,
  loadCompletedMilestones,
  toggleMilestoneCompleted
} from './lib/storage';
import {
  initFirebaseAuth,
  testFirestoreConnection,
  syncUserDataToFirestore,
  loadUserDataFromFirestore,
  logOut
} from './lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'roadmap' | 'training' | 'stats'>('analyze');
  const [trainingTheme, setTrainingTheme] = useState<string>('all');
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chess_coach_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Profile State
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Persistent user progress
  const [streakData, setStreakData] = useState<StreakData>(loadStreakData());
  const [userStats, setUserStats] = useState<UserStats>(loadUserStats());
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(loadQuizAnswers());
  const [completedMilestones, setCompletedMilestones] = useState<string[]>(loadCompletedMilestones());
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Initialize Firebase Auth & test connection
  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = initFirebaseAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load cloud state if available
        const cloudData = await loadUserDataFromFirestore(user.uid);
        if (cloudData) {
          if (cloudData.streak) setStreakData(cloudData.streak);
          if (cloudData.stats) setUserStats(cloudData.stats);
          if (cloudData.completedMilestones) setCompletedMilestones(cloudData.completedMilestones);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Sync theme with HTML documentElement
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('chess_coach_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('chess_coach_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Refresh stats and streak data from storage on mount
    setStreakData(loadStreakData());
    setUserStats(loadUserStats());
    setQuizAnswers(loadQuizAnswers());
    setCompletedMilestones(loadCompletedMilestones());
  }, []);

  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleAuthSuccess = async (user: FirebaseUser) => {
    setCurrentUser(user);
    const cloudData = await loadUserDataFromFirestore(user.uid);
    if (cloudData) {
      if (cloudData.streak) setStreakData(cloudData.streak);
      if (cloudData.stats) setUserStats(cloudData.stats);
      if (cloudData.completedMilestones) setCompletedMilestones(cloudData.completedMilestones);
      if (cloudData.username && cloudData.platform) {
        handleAnalyze(cloudData.username, cloudData.platform as Platform, 10);
      }
    } else {
      // First-time permanent account: migrate current in-memory progress to cloud
      syncUserDataToFirestore(user.uid, {
        email: user.email,
        displayName: user.displayName,
        username: profile?.username,
        platform: profile?.platform,
        streak: streakData,
        stats: userStats,
        completedMilestones
      });
    }
  };

  const handleSignOut = async () => {
    await logOut();
    // Reset to local storage defaults
    setStreakData(loadStreakData());
    setUserStats(loadUserStats());
    setCompletedMilestones(loadCompletedMilestones());
    setProfile(null);
  };

  const handleAnalyze = async (username: string, platform: Platform, gamesCount: number) => {
    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const url = `/api/chess/profile?username=${encodeURIComponent(username)}&platform=${platform}&gamesCount=${gamesCount}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch player profile');
      }

      setProfile(data);

      if (currentUser) {
        syncUserDataToFirestore(currentUser.uid, {
          username,
          platform,
          streak: streakData,
          stats: userStats
        });
      }
    } catch (err: any) {
      console.error('Analyze error:', err);
      setAnalyzeError(err.message || 'Unable to connect to chess server. Please check the username.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveQuiz = (answers: QuizAnswers) => {
    setQuizAnswers(answers);
    saveQuizAnswers(answers);
    setActiveTab('roadmap');
  };

  const handleToggleMilestone = (id: string) => {
    const updated = toggleMilestoneCompleted(id);
    setCompletedMilestones(updated);
    if (currentUser) {
      syncUserDataToFirestore(currentUser.uid, {
        completedMilestones: updated
      });
    }
  };

  const handleSelectThemeTraining = (theme: string) => {
    setTrainingTheme(theme);
    setActiveTab('training');
  };

  const handleStreakUpdate = (nextStreak: StreakData) => {
    setStreakData(nextStreak);
    if (currentUser) {
      syncUserDataToFirestore(currentUser.uid, {
        streak: nextStreak
      });
    }
  };

  const handleRefreshStats = () => {
    const nextStats = loadUserStats();
    setUserStats(nextStats);
    if (currentUser) {
      syncUserDataToFirestore(currentUser.uid, {
        stats: nextStats
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-200 transition-colors">
      {/* Strict 3-zone Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        streakData={streakData}
        onOpenQuiz={() => setIsQuizOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'analyze' && (
          <AnalyzeView
            onAnalyze={handleAnalyze}
            isLoading={isAnalyzing}
            profile={profile}
            error={analyzeError}
            onGoToRoadmap={() => setActiveTab('roadmap')}
            onGoToTraining={() => setActiveTab('training')}
            onOpenQuiz={() => setIsQuizOpen(true)}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapView
            quizAnswers={quizAnswers}
            profile={profile}
            completedMilestones={completedMilestones}
            onToggleMilestone={handleToggleMilestone}
            onOpenQuiz={() => setIsQuizOpen(true)}
            onSelectThemeTraining={handleSelectThemeTraining}
          />
        )}

        {activeTab === 'training' && (
          <TrainingArena
            initialTheme={trainingTheme}
            streakData={streakData}
            onStreakUpdate={handleStreakUpdate}
            onStatsUpdate={handleRefreshStats}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            streakData={streakData}
            userStats={userStats}
            onGoToTraining={() => setActiveTab('training')}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Diagnostic Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onSaveQuiz={handleSaveQuiz}
        initialAnswers={quizAnswers}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Floating GM AI Coach Chat Widget */}
      <CoachChatModal
        profile={profile}
        streakCount={streakData.currentStreak}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B0F17] py-6 text-xs text-slate-500 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>♟</span>
            <span>Chess Coach · Master your game with Lichess Puzzles & Stockfish Engine Analysis</span>
          </div>
          <p className="text-slate-500">
            Real data from Lichess.org & Chess.com Public APIs
          </p>
        </div>
      </footer>
    </div>
  );
}
