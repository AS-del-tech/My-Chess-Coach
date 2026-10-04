import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Chess, Square } from 'chess.js';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Flame,
  ArrowRight,
  RotateCcw,
  Zap,
  Lightbulb,
  SlidersHorizontal
} from 'lucide-react';
import { Chessboard } from './Chessboard';
import { EvaluationBar } from './EvaluationBar';
import { LichessPuzzle, EngineEvaluation, CoachReview, StreakData } from '../types';
import { sound } from '../lib/sound';
import { recordStreakPuzzleSolve, recordPuzzleResult } from '../lib/storage';

interface TrainingArenaProps {
  initialTheme?: string;
  streakData: StreakData;
  onStreakUpdate: (data: StreakData) => void;
  onStatsUpdate: () => void;
}

const THEMES = [
  { id: 'all', label: 'All Tactics' },
  { id: 'fork', label: 'Forks' },
  { id: 'pin', label: 'Pins' },
  { id: 'skewer', label: 'Skewers' },
  { id: 'discoveredAttack', label: 'Discovered Attacks' },
  { id: 'mateIn2', label: 'Mate in 2' },
  { id: 'endgame', label: 'Endgames' }
];

const DIFFICULTIES = [
  { id: 'all', label: 'All Ratings' },
  { id: 'beginner', label: 'Beginner (1000–1399)' },
  { id: 'intermediate', label: 'Intermediate (1400–1799)' },
  { id: 'advanced', label: 'Advanced (1800–2199)' },
  { id: 'master', label: 'Master (2200+)' }
];

export const TrainingArena: React.FC<TrainingArenaProps> = ({
  initialTheme = 'all',
  streakData,
  onStreakUpdate,
  onStatsUpdate
}) => {
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');
  const [puzzle, setPuzzle] = useState<LichessPuzzle | null>(null);
  const [currentFen, setCurrentFen] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [solutionIndex, setSolutionIndex] = useState<number>(0);
  const [puzzleStatus, setPuzzleStatus] = useState<'in_progress' | 'solved'>('in_progress');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [incorrectMessage, setIncorrectMessage] = useState<string | null>(null);
  const [incorrectSquare, setIncorrectSquare] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Progressive 3-Tier Hint State (0 = None, 1 = Piece, 2 = Move Arrow, 3 = Full Explanation)
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2 | 3>(0);

  // Keep a ref to the chess instance and pre-move FEN for instant auto-reset
  const chessRef = useRef<Chess>(new Chess());
  const preMoveFenRef = useRef<string>('');

  // Engine & AI Coach state
  const [engineEval, setEngineEval] = useState<EngineEvaluation>({
    eval: 0.0,
    depth: 22,
    source: 'Stockfish 16'
  });
  const [coachReview, setCoachReview] = useState<CoachReview | null>(null);
  const [isGeneratingCoachReview, setIsGeneratingCoachReview] = useState(false);

  // Fetch puzzle from server with theme and difficulty
  const fetchPuzzle = useCallback(
    async (theme: string, difficulty: string, isDaily: boolean = false) => {
      setIsLoading(true);
      setPuzzleStatus('in_progress');
      setIsIncorrect(false);
      setIncorrectMessage(null);
      setIncorrectSquare(null);
      setCoachReview(null);
      setHintLevel(0);
      setLastMove(null);

      try {
        const url = `/api/chess/puzzles?theme=${theme}&difficulty=${difficulty}&daily=${isDaily ? 'true' : 'false'}`;
        const res = await fetch(url);
        const data = await res.json();
        const nextP: LichessPuzzle = data.puzzles?.[0];

        if (nextP) {
          setPuzzle(nextP);
          const chess = new Chess(nextP.fen);
          chessRef.current = chess;
          preMoveFenRef.current = chess.fen();
          setCurrentFen(chess.fen());
          setSolutionIndex(0);

          // Fetch engine baseline eval for position
          fetchEngineEval(nextP.fen);
        }
      } catch (err) {
        console.error('Failed to fetch puzzle:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchEngineEval = async (fen: string) => {
    try {
      const res = await fetch(`/api/chess/cloud-eval?fen=${encodeURIComponent(fen)}`);
      if (res.ok) {
        const data = await res.json();
        setEngineEval({
          eval: data.eval,
          depth: data.depth || 24,
          source: data.source || 'Stockfish'
        });
      }
    } catch {
      // Keep existing eval
    }
  };

  const fetchCoachReview = async (
    p: LichessPuzzle,
    userResult: 'solved' | 'failed',
    userMove?: string,
    correctMove?: string
  ) => {
    setIsGeneratingCoachReview(true);
    try {
      const res = await fetch('/api/coach/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleId: p.id,
          fen: p.fen,
          moves: p.moves,
          userResult,
          userMove,
          correctMove,
          themes: p.themes,
          rating: p.rating
        })
      });
      if (res.ok) {
        const review: CoachReview = await res.json();
        setCoachReview(review);
      }
    } catch (e) {
      console.warn('Could not generate AI coach review:', e);
    } finally {
      setIsGeneratingCoachReview(false);
    }
  };

  useEffect(() => {
    fetchPuzzle(selectedTheme, selectedDifficulty);
  }, [selectedTheme, selectedDifficulty, fetchPuzzle]);

  const handleUserMove = (from: string, to: string, promotion: string = 'q') => {
    if (!puzzle || puzzleStatus !== 'in_progress') return;

    // Snapshot position before user's move attempt for instant auto-reset
    const chess = chessRef.current;
    preMoveFenRef.current = chess.fen();

    const uciMove = `${from}${to}${promotion !== 'q' ? promotion : ''}`;
    const expectedMove = puzzle.moves[solutionIndex];

    try {
      const moveResult = chess.move({ from, to, promotion });
      if (!moveResult) return;
      if (moveResult.captured) sound.playCapture();
      else sound.playMove();
    } catch {
      return;
    }

    setLastMove({ from, to });
    setCurrentFen(chess.fen());

    const matchesSolution =
      expectedMove &&
      (expectedMove.startsWith(from + to) || expectedMove.toLowerCase() === uciMove.toLowerCase());

    if (matchesSolution) {
      setIsIncorrect(false);
      setIncorrectMessage(null);
      setIncorrectSquare(null);
      setHintLevel(0); // clear hints on correct progress

      const nextIdx = solutionIndex + 1;

      // Check if puzzle is fully solved
      if (nextIdx >= puzzle.moves.length) {
        setPuzzleStatus('solved');
        sound.playSuccess();
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.65 }
        });

        // Update streak & stats
        const updatedStreak = recordStreakPuzzleSolve();
        onStreakUpdate(updatedStreak);
        recordPuzzleResult(puzzle.id, puzzle.themes[0] || 'tactics', puzzle.rating, true);
        onStatsUpdate();

        // Update Stockfish eval in player favor (+6.5)
        setEngineEval(prev => ({ ...prev, eval: puzzle.turn === 'w' ? 6.5 : -6.5 }));

        // Generate GM AI Coach advice
        fetchCoachReview(puzzle, 'solved');
      } else {
        // Step solved sound
        sound.playStepSolve();

        // Opponent's automatic response
        setSolutionIndex(nextIdx);
        const opponentUci = puzzle.moves[nextIdx];

        setTimeout(() => {
          if (!opponentUci) return;
          const oppFrom = opponentUci.slice(0, 2);
          const oppTo = opponentUci.slice(2, 4);
          const oppPromo = opponentUci.slice(4) || undefined;

          try {
            const oppMove = chess.move({ from: oppFrom, to: oppTo, promotion: oppPromo });
            if (oppMove) {
              if (oppMove.captured) sound.playCapture();
              else sound.playMove();

              setLastMove({ from: oppFrom, to: oppTo });
              preMoveFenRef.current = chess.fen();
              setCurrentFen(chess.fen());
              setSolutionIndex(nextIdx + 1);
            }
          } catch (e) {
            console.warn('Opponent auto-move failed:', e);
          }
        }, 400);
      }
    } else {
      // Inaccurate Move — play sound, show brief flash, and INSTANTLY auto-reset the board!
      sound.playBlunder();
      setIsIncorrect(true);
      setIncorrectSquare(to);
      setIncorrectMessage(
        `Move ${from.toUpperCase()}–${to.toUpperCase()} is not the winning continuation.`
      );

      // Record in stats
      recordPuzzleResult(puzzle.id, puzzle.themes[0] || 'tactics', puzzle.rating, false);
      onStatsUpdate();

      // Trigger GM AI Coach advice
      fetchCoachReview(puzzle, 'failed', `${from}-${to}`, expectedMove);

      // Automatically reset piece back to original square after 400ms
      setTimeout(() => {
        if (!preMoveFenRef.current) return;
        const preChess = new Chess(preMoveFenRef.current);
        chessRef.current = preChess;
        setCurrentFen(preChess.fen());
        setLastMove(null);
        setIncorrectSquare(null);
        setIsIncorrect(false);
      }, 420);
    }
  };

  // Reset whole puzzle to initial starting position
  const handleResetPuzzle = () => {
    if (!puzzle) return;
    const chess = new Chess(puzzle.fen);
    chessRef.current = chess;
    preMoveFenRef.current = chess.fen();
    setCurrentFen(chess.fen());
    setSolutionIndex(0);
    setLastMove(null);
    setIsIncorrect(false);
    setIncorrectMessage(null);
    setIncorrectSquare(null);
    setHintLevel(0);
    setPuzzleStatus('in_progress');
    setCoachReview(null);
    fetchEngineEval(puzzle.fen);
  };

  // Progressive Hint Step
  const handleAdvanceHint = () => {
    if (!puzzle) return;
    sound.playHintChime();
    setHintLevel(prev => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 3));
  };

  // Auto-play the solution move
  const handleShowSolution = () => {
    if (!puzzle) return;
    const expectedMove = puzzle.moves[solutionIndex];
    if (!expectedMove) return;

    const from = expectedMove.slice(0, 2);
    const to = expectedMove.slice(2, 4);
    const promo = expectedMove.slice(4) || undefined;

    const chess = chessRef.current;
    try {
      const move = chess.move({ from, to, promotion: promo });
      if (move) {
        if (move.captured) sound.playCapture();
        else sound.playMove();
        setLastMove({ from, to });
        setCurrentFen(chess.fen());
        setHintLevel(3);
      }
    } catch (e) {
      console.warn('Auto-play solution move failed:', e);
    }
  };

  const orientation = puzzle ? (puzzle.turn === 'w' ? 'white' : 'black') : 'white';

  // Compute active hints and arrow
  const currentExpectedMove = puzzle?.moves[solutionIndex] || '';
  const hintFrom = currentExpectedMove.slice(0, 2);
  const hintTo = currentExpectedMove.slice(2, 4);

  // Piece name for Tier 1 hint
  const hintPieceName = (() => {
    if (!hintFrom || !chessRef.current) return 'piece';
    const p = chessRef.current.get(hintFrom as Square);
    if (!p) return 'piece';
    const names: Record<string, string> = {
      p: 'Pawn',
      n: 'Knight',
      b: 'Bishop',
      r: 'Rook',
      q: 'Queen',
      k: 'King'
    };
    return names[p.type] || 'piece';
  })();

  // Highlight squares and arrow
  let highlightSquares: string[] = [];
  let highlightVariant: 'hint' | 'blunder' | 'correct' = 'hint';
  let bestMoveArrow: { from: string; to: string } | null = null;

  if (isIncorrect && incorrectSquare) {
    highlightSquares = [incorrectSquare];
    highlightVariant = 'blunder';
  } else if (puzzleStatus === 'solved') {
    if (lastMove) {
      highlightSquares = [lastMove.from, lastMove.to];
      highlightVariant = 'correct';
    }
  } else if (hintLevel === 1 && hintFrom) {
    highlightSquares = [hintFrom];
    highlightVariant = 'hint';
  } else if (hintLevel >= 2 && hintFrom && hintTo) {
    highlightSquares = [hintFrom, hintTo];
    highlightVariant = 'hint';
    bestMoveArrow = { from: hintFrom, to: hintTo };
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Training Header & Selectors */}
      <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#00875A] dark:text-emerald-400 uppercase tracking-wider">
                Lichess Tactical Arena
              </span>
              <span className="text-slate-400 dark:text-slate-600">·</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Stockfish Engine Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-slate-100 mt-1">
              {puzzle?.title || 'Interactive Tactical Trainer'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPuzzle(selectedTheme, selectedDifficulty, true)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              <span>Daily Puzzle</span>
            </button>
            <button
              onClick={() => fetchPuzzle(selectedTheme, selectedDifficulty)}
              disabled={isLoading}
              className="px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-[#00875A] hover:bg-[#00744D] text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>New Puzzle</span>
            </button>
          </div>
        </div>

        {/* Difficulty Tier Selector */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#00875A]" />
            <span>Difficulty Rating Tier:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDifficulty(d.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  selectedDifficulty === d.id
                    ? 'bg-[#00875A] text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Filters */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Tactical Motif:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  selectedTheme === t.id
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Board & Engine Evaluation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Chessboard + Eval Bar */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col items-center transition-colors">
          {/* Status Banner */}
          <div className="w-full flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-3.5 h-3.5 rounded-full shadow-xs ${
                  puzzle?.turn === 'w' ? 'bg-white border-2 border-slate-400' : 'bg-slate-900 border border-slate-600'
                }`}
              />
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {puzzle?.turn === 'w' ? 'White to Move' : 'Black to Move'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {puzzle?.rating && (
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  Rating: <span className="text-amber-600 dark:text-amber-400 font-black">{puzzle.rating}</span>
                </span>
              )}
              {puzzle?.id && (
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                  #{puzzle.id}
                </span>
              )}
            </div>
          </div>

          {/* Board + Eval Bar Container */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
            {/* Stockfish Eval Bar */}
            <EvaluationBar
              evaluation={engineEval.eval}
              depth={engineEval.depth}
              orientation={orientation}
              isBlunder={isIncorrect}
            />

            {/* Interactive Chessboard */}
            <Chessboard
              fen={currentFen}
              orientation={orientation}
              onMove={handleUserMove}
              interactive={puzzleStatus === 'in_progress'}
              lastMove={lastMove}
              bestMoveArrow={bestMoveArrow}
              highlightSquares={highlightSquares}
              highlightVariant={highlightVariant}
              disabled={isLoading}
            />
          </div>

          {/* Controls Below Board */}
          <div className="w-full flex items-center justify-between mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 px-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetPuzzle}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Reset puzzle to initial state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleAdvanceHint}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  hintLevel > 0
                    ? 'bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Lightbulb className={`w-3.5 h-3.5 ${hintLevel > 0 ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{hintLevel === 0 ? 'Get Hint' : `Hint ${hintLevel}/3`}</span>
              </button>
            </div>

            <button
              onClick={() => fetchPuzzle(selectedTheme, selectedDifficulty)}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#00875A] hover:bg-[#00744D] text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>Next Puzzle</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Progressive Hint Card */}
          {hintLevel > 0 && currentExpectedMove && (
            <div className="w-full mt-3 p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/70 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                  <Lightbulb className="w-4 h-4 fill-amber-500 text-amber-600" />
                  <span>Progressive Hint (Tier {hintLevel} of 3)</span>
                </span>
                {hintLevel < 3 && (
                  <button
                    onClick={handleAdvanceHint}
                    className="font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Need more help?</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {hintLevel === 1 && (
                <p className="text-slate-700 dark:text-slate-300">
                  Focus on your <span className="font-bold text-amber-800 dark:text-amber-300">{hintPieceName}</span> on{' '}
                  <span className="font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                    {hintFrom.toUpperCase()}
                  </span>
                  . It has a decisive tactical idea.
                </p>
              )}

              {hintLevel === 2 && (
                <p className="text-slate-700 dark:text-slate-300">
                  Target square revealed! Move your {hintPieceName} from{' '}
                  <span className="font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                    {hintFrom.toUpperCase()}
                  </span>{' '}
                  to{' '}
                  <span className="font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                    {hintTo.toUpperCase()}
                  </span>{' '}
                  (see green arrow on board).
                </p>
              )}

              {hintLevel === 3 && (
                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  <p>
                    <span className="font-bold text-amber-800 dark:text-amber-300">Winning Move:</span>{' '}
                    <span className="font-mono font-bold">{hintFrom.toUpperCase()}–{hintTo.toUpperCase()}</span>.
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Theme: <span className="capitalize font-semibold">{puzzle?.themes.join(', ')}</span>. This creates an unanswerable double threat or breakthrough.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Feedback, Instant Auto-Reset & AI Review */}
        <div className="lg:col-span-5 space-y-4">
          {/* Solved Banner */}
          {puzzleStatus === 'solved' && (
            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-200 flex items-start gap-3.5 shadow-lg animate-in fade-in duration-200">
              <CheckCircle2 className="w-6 h-6 text-[#00875A] dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div>
                  <h3 className="text-base font-black font-display text-emerald-900 dark:text-emerald-200">
                    Tactical Strike Solved!
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                    Accurate calculation. Your training streak has been recorded.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <div className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-black/40 px-2.5 py-1 rounded-xl border border-amber-300 dark:border-amber-500/20">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    <span>Streak: {streakData.currentStreak} day{streakData.currentStreak === 1 ? '' : 's'}</span>
                  </div>
                  <button
                    onClick={() => fetchPuzzle(selectedTheme, selectedDifficulty)}
                    className="px-3 py-1 bg-[#00875A] hover:bg-[#00744D] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer ml-auto"
                  >
                    Next Puzzle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Gentle Incorrect Move Banner with Auto-Reset */}
          {incorrectMessage && puzzleStatus !== 'solved' && (
            <div className="p-5 rounded-3xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200 flex items-start gap-3.5 shadow-md animate-in fade-in duration-200">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2.5 flex-1">
                <div>
                  <h3 className="text-base font-black font-display text-amber-900 dark:text-amber-200">
                    Not quite the move
                  </h3>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                    {incorrectMessage} The board automatically reset so you can try another move!
                  </p>
                </div>

                {/* Instant Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleAdvanceHint}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Get Hint</span>
                  </button>
                  <button
                    onClick={handleShowSolution}
                    className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Show Solution
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Engine Analysis Card */}
          <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚙️</span>
                <h3 className="text-sm font-bold font-display text-slate-800 dark:text-slate-200">
                  Stockfish Engine Analysis
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Evaluation: <span className="font-bold text-[#00875A] dark:text-emerald-400 font-mono">{engineEval.eval}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Depth</span>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">{engineEval.depth} plies</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Tactical Theme</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5 truncate">
                  {puzzle?.themes?.[0] || 'Combination'}
                </div>
              </div>
            </div>

            {/* AI Grandmaster Review */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Grandmaster Advice</span>
              </div>

              {isGeneratingCoachReview ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 animate-pulse flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Grandmaster evaluating tactical idea...</span>
                </div>
              ) : coachReview ? (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{coachReview.summary || coachReview.tacticalBreakdown}"
                  </p>
                  {coachReview.actionableAdvice && (
                    <div className="text-[11px] font-semibold text-[#00875A] dark:text-emerald-400">
                      Key Takeaway: {coachReview.actionableAdvice}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Make your move on the board to receive instant engine feedback and grandmaster coaching.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
