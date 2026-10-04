import React, { useState } from 'react';
import { Search, Loader2, User, Brain, Target, ArrowRight, ExternalLink } from 'lucide-react';
import { Platform, PlayerProfile } from '../types';
import {
  KingOutlinePiece,
  PawnOutlinePiece,
  KnightOutlinePiece,
  PawnBaseOutlinePiece,
  QueenCrownOutlinePiece,
  BishopOutlinePiece,
  LargeCrownWatermark,
  RookOutlinePiece
} from './ChessPieces';

interface AnalyzeViewProps {
  onAnalyze: (username: string, platform: Platform, gamesCount: number) => Promise<void>;
  isLoading: boolean;
  profile: PlayerProfile | null;
  error: string | null;
  onGoToRoadmap: () => void;
  onGoToTraining: () => void;
  onOpenQuiz: () => void;
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({
  onAnalyze,
  isLoading,
  profile,
  error,
  onGoToRoadmap,
  onGoToTraining,
  onOpenQuiz
}) => {
  const [platform, setPlatform] = useState<Platform>('chesscom');
  const [username, setUsername] = useState('');
  const [gamesCount, setGamesCount] = useState<number>(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || isLoading) return;
    onAnalyze(username.trim(), platform, gamesCount);
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Decorative Outline Chess Pieces in the background (Matching Screenshot 2026-10-04 at 13.30.17.png) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
        {/* Top-left King Outline */}
        <div className="absolute top-[1.5%] left-[2.5%] text-slate-300/40 dark:text-slate-700/30">
          <KingOutlinePiece className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
        {/* Mid-left Pawn */}
        <div className="absolute top-[48%] left-[1.5%] text-slate-300/40 dark:text-slate-700/30">
          <PawnOutlinePiece className="w-8 h-10 sm:w-10 sm:h-12" />
        </div>
        {/* Lower-left Knight */}
        <div className="absolute top-[61%] left-[3.5%] text-slate-300/40 dark:text-slate-700/30">
          <KnightOutlinePiece className="w-12 h-14 sm:w-14 sm:h-16" />
        </div>
        {/* Bottom-left Base */}
        <div className="absolute top-[96%] left-[1%] text-slate-300/30 dark:text-slate-700/20">
          <PawnBaseOutlinePiece className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        {/* Top-right Queen Crown with 5 points */}
        <div className="absolute top-[17%] right-[11%] text-slate-300/40 dark:text-slate-700/30">
          <QueenCrownOutlinePiece className="w-12 h-12 sm:w-14 sm:h-14" />
        </div>
        {/* Mid-right Upper Bishop */}
        <div className="absolute top-[37%] right-[6%] text-slate-300/40 dark:text-slate-700/30">
          <BishopOutlinePiece className="w-8 h-11 sm:w-10 sm:h-13" />
        </div>
        {/* Mid-right Large Crown Watermark */}
        <div className="absolute top-[53%] right-[2%] text-slate-200/70 dark:text-slate-800/60">
          <LargeCrownWatermark className="w-28 h-32 sm:w-36 sm:h-40" />
        </div>
        {/* Lower-right Rook */}
        <div className="absolute top-[72%] right-[9.5%] text-slate-300/40 dark:text-slate-700/30">
          <RookOutlinePiece className="w-10 h-12 sm:w-12 sm:h-14" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-10 sm:py-16 space-y-12">
        {/* Hero Section matching reference screenshot */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
            <span>AI-Powered Chess Coaching</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-slate-900 dark:text-slate-100 max-w-3xl mx-auto leading-[1.08] text-balance">
            Your Personal <span className="text-[#3b4992] dark:text-indigo-400">Chess</span> <span className="text-[#f97316] dark:text-orange-500">Coach</span>
          </h1>
          <p className="text-base sm:text-lg font-normal text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-3">
            Learn. Grow. Win.
          </p>
        </div>

        {/* Search & Platform Selector Card */}
        <div className="bg-white dark:bg-[#131B2B] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-6 sm:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-none space-y-8 transition-colors">
          {/* Platform Toggle */}
          <div className="flex items-center justify-center">
            <div className="inline-flex p-1 bg-slate-100/90 dark:bg-slate-900 rounded-full border border-slate-200/80 dark:border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => setPlatform('chesscom')}
                className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  platform === 'chesscom'
                    ? 'bg-[#00875A] text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <span>♟</span>
                <span>Chess.com</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatform('lichess')}
                className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  platform === 'lichess'
                    ? 'bg-[#00875A] text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <span>♞</span>
                <span>Lichess</span>
              </button>
            </div>
          </div>

          {/* Input Form with Analyze button */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={platform === 'chesscom' ? 'Enter your Chess.com username...' : 'Enter your Lichess username...'}
                className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#7c86b2] focus:ring-2 focus:ring-[#7c86b2]/20 transition-colors text-sm sm:text-base"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="h-14 px-8 rounded-2xl font-bold text-sm sm:text-base bg-[#7c86b2] hover:bg-[#6c77a3] text-white shadow-none disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 text-white" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </form>

          {/* Game Count Selector (5, 10, 20) */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center mt-2 mb-4">
              HOW MANY RECENT GAMES TO ANALYZE?
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => setGamesCount(5)}
                className={`p-5 rounded-2xl border text-center transition-all cursor-pointer ${
                  gamesCount === 5
                    ? 'border-2 border-[#2dd4bf] bg-teal-50/20 dark:bg-teal-500/10'
                    : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-2xl mb-1 text-amber-500">⚡</div>
                <div className="text-2xl font-black font-display text-slate-900 dark:text-slate-100">5</div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Quick Snapshot</div>
              </button>

              <button
                type="button"
                onClick={() => setGamesCount(10)}
                className={`p-5 rounded-2xl border text-center transition-all cursor-pointer ${
                  gamesCount === 10
                    ? 'border-2 border-[#2dd4bf] bg-teal-50/20 dark:bg-teal-500/10'
                    : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-2xl mb-1">📈</div>
                <div className="text-2xl font-black font-display text-emerald-600 dark:text-emerald-400">10</div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Balanced View</div>
              </button>

              <button
                type="button"
                onClick={() => setGamesCount(20)}
                className={`p-5 rounded-2xl border text-center transition-all cursor-pointer ${
                  gamesCount === 20
                    ? 'border-2 border-[#2dd4bf] bg-teal-50/20 dark:bg-teal-500/10'
                    : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-2xl mb-1">🔬</div>
                <div className="text-2xl font-black font-display text-slate-900 dark:text-slate-100">20</div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Deep Analysis</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs sm:text-sm text-center">
              {error}
            </div>
          )}
        </div>

        {/* Profile Overview Card (If Loaded) */}
        {profile && (
          <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 rounded-[28px] p-6 sm:p-10 space-y-6 shadow-xl animate-in fade-in duration-300 transition-colors">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl border border-slate-200 dark:border-slate-700 object-cover bg-slate-100 dark:bg-slate-900"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-slate-100">
                      {profile.username}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize font-medium">
                      {profile.platform}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <span>{profile.gamesTotal.toLocaleString()} total games</span>
                    {profile.createdAt && (
                      <>
                        <span>·</span>
                        <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={onOpenQuiz}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={onGoToRoadmap}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#00875A] hover:bg-[#00744D] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>View Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Ratings Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Rapid</div>
                <div className="text-2xl font-black font-mono text-[#00875A] dark:text-emerald-400 tabular-nums">
                  {profile.ratings.rapid || '—'}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Blitz</div>
                <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                  {profile.ratings.blitz || '—'}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Bullet</div>
                <div className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400 tabular-nums">
                  {profile.ratings.bullet || '—'}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Puzzles</div>
                <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 tabular-nums">
                  {profile.ratings.puzzle || '—'}
                </div>
              </div>
            </div>

            {/* Win Rates Ratio Bar */}
            {profile.winRates && (profile.winRates.wins + profile.winRates.losses + profile.winRates.draws > 0) && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="text-[#00875A] dark:text-emerald-400 font-semibold">{profile.winRates.wins} Wins</span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">{profile.winRates.draws} Draws</span>
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">{profile.winRates.losses} Losses</span>
                </div>
                <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
                  <div
                    className="bg-[#00875A] transition-all duration-500"
                    style={{
                      width: `${(profile.winRates.wins / (profile.winRates.wins + profile.winRates.losses + profile.winRates.draws)) * 100}%`
                    }}
                  />
                  <div
                    className="bg-slate-400 transition-all duration-500"
                    style={{
                      width: `${(profile.winRates.draws / (profile.winRates.wins + profile.winRates.losses + profile.winRates.draws)) * 100}%`
                    }}
                  />
                  <div
                    className="bg-rose-500 transition-all duration-500"
                    style={{
                      width: `${(profile.winRates.losses / (profile.winRates.wins + profile.winRates.losses + profile.winRates.draws)) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Recent Games List */}
            {profile.recentGames && profile.recentGames.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Recent Games Analyzed ({profile.recentGames.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    {platform === 'chesscom' ? 'Chess.com Archive' : 'Lichess Rated'}
                  </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 overflow-hidden">
                  {profile.recentGames.map((game) => (
                    <div
                      key={game.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs sm:text-sm hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-14 sm:w-16 py-0.5 rounded-lg text-center text-xs font-bold uppercase tracking-wider ${
                            game.result === 'win'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80'
                              : game.result === 'loss'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800/80'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {game.result}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span>vs {game.opponent}</span>
                            <span className="text-slate-500 text-xs font-mono">({game.opponentRating})</span>
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-2 mt-0.5">
                            <span className="capitalize">{game.userColor}</span>
                            <span>·</span>
                            <span className="truncate max-w-[200px] sm:max-w-[280px]">{game.opening}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                          {game.speed}
                        </span>
                        {game.url && (
                          <a
                            href={game.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            title="View Game"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt to train */}
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Ready to sharpen your tactics?</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Practice verified Lichess puzzles with real-time Stockfish engine evaluation and GM advice.
                </p>
              </div>
              <button
                onClick={onGoToTraining}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#00875A] hover:bg-[#00744D] text-white shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                Start Tactical Training
              </button>
            </div>
          </div>
        )}

        {/* Feature Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-white dark:bg-[#131B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex gap-4 shadow-sm transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00875A] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-1">Real Profile Data</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ratings, win rates, and game stats pulled live from Chess.com or Lichess public APIs.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#131B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex gap-4 shadow-sm transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00875A] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-1">Tailored Quiz</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                4 quick questions match your improvement plan to your goals, time, and playstyle.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#131B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex gap-4 shadow-sm transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00875A] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-1">Personalized Roadmap</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                A 3-phase interactive plan with real resources, checkboxes, and coach-level advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
