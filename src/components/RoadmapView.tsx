import React from 'react';
import { Check, Target, ArrowRight, Award } from 'lucide-react';
import { RoadmapPhase, QuizAnswers, PlayerProfile } from '../types';

interface RoadmapViewProps {
  quizAnswers: QuizAnswers | null;
  profile: PlayerProfile | null;
  completedMilestones: string[];
  onToggleMilestone: (id: string) => void;
  onOpenQuiz: () => void;
  onSelectThemeTraining: (theme: string) => void;
}

const DEFAULT_PHASES: RoadmapPhase[] = [
  {
    phaseNumber: 1,
    title: 'Phase 1: Tactical Foundation & Blunder Proofing',
    subtitle: 'Weeks 1–3 · Eliminate 1-move blunders and master forcing candidate moves',
    duration: 'Weeks 1 – 3',
    description: 'Focus on pattern recognition for pins, forks, skewers, and undefended pieces.',
    milestones: [
      {
        id: 'p1_forks',
        title: 'Complete 25 Knight & Queen Fork Tactics',
        description: 'Train double attacks on undefended pieces and king checks.',
        category: 'tactics',
        targetTheme: 'fork',
        completed: false,
        resourceName: 'Practice Fork Puzzles',
        resourceLink: '#'
      },
      {
        id: 'p1_pins',
        title: 'Master Absolute & Relative Pins',
        description: 'Exploit immobilized pieces aligned with kings or major pieces.',
        category: 'tactics',
        targetTheme: 'pin',
        completed: false,
        resourceName: 'Practice Pin Puzzles',
        resourceLink: '#'
      },
      {
        id: 'p1_blunder_check',
        title: 'Pre-Move Blunder Checklist Protocol',
        description: 'Before every move: check opponent checks, captures, and attacking threats (C.C.T.).',
        category: 'strategy',
        completed: false,
        resourceName: 'Blunder Check Rules'
      },
      {
        id: 'p1_streak_3',
        title: 'Maintain a 3-Day Tactical Training Streak',
        description: 'Solve at least 3 rated Lichess puzzles each day consecutively.',
        category: 'tactics',
        completed: false
      }
    ]
  },
  {
    phaseNumber: 2,
    title: 'Phase 2: Positional Mastery & Central Control',
    subtitle: 'Weeks 4–7 · Win the middlegame through outposts, pawn breaks, and open files',
    duration: 'Weeks 4 – 7',
    description: 'Learn when to attack, when to improve your worst piece, and how to create weaknesses.',
    milestones: [
      {
        id: 'p2_skewers',
        title: 'Execute 20 Skewers & Discovered Attacks',
        description: 'Punish aligned heavyweight pieces and uncover devastating battery attacks.',
        category: 'tactics',
        targetTheme: 'skewer',
        completed: false,
        resourceName: 'Practice Skewer Drills'
      },
      {
        id: 'p2_openings',
        title: 'Refine Core Opening Repertoire (2 White, 2 Black)',
        description: 'Establish sound opening plans through move 10 without falling into traps.',
        category: 'opening',
        completed: false
      },
      {
        id: 'p2_outposts',
        title: 'Establish Undefendable Knight Outposts',
        description: 'Plant pieces on protected central squares that enemy pawns cannot dislodge.',
        category: 'strategy',
        completed: false
      },
      {
        id: 'p2_mate2',
        title: 'Solve 30 Checkmate in 2 Sequences',
        description: 'Calculate forced mating nets around the castled king.',
        category: 'tactics',
        targetTheme: 'mateIn2',
        completed: false,
        resourceName: 'Practice Mate-in-2'
      }
    ]
  },
  {
    phaseNumber: 3,
    title: 'Phase 3: Endgame Precision & Advantage Conversion',
    subtitle: 'Weeks 8–12 · Convert +2 pawn advantages reliably into full tournament points',
    duration: 'Weeks 8 – 12',
    description: 'Master king activity, pawn promotion races, and rook endgame fundamentals.',
    milestones: [
      {
        id: 'p3_king_activity',
        title: 'Activate King in 15 Pawn Endgames',
        description: 'Master Opposition, triangulation, and outflanking rules.',
        category: 'endgame',
        targetTheme: 'endgame',
        completed: false,
        resourceName: 'Practice Endgame Tactics'
      },
      {
        id: 'p3_rook_endgames',
        title: 'Lucena & Philidor Positions Mastery',
        description: 'Standard technical drawing and winning techniques in single-rook endings.',
        category: 'endgame',
        completed: false
      },
      {
        id: 'p3_review_games',
        title: 'Annotate 10 Rapid Losses with Engine Review',
        description: 'Find the turning point in each game and note the alternative GM candidate move.',
        category: 'strategy',
        completed: false
      }
    ]
  }
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  quizAnswers,
  profile,
  completedMilestones,
  onToggleMilestone,
  onOpenQuiz,
  onSelectThemeTraining
}) => {
  const totalMilestones = DEFAULT_PHASES.reduce((acc, p) => acc + p.milestones.length, 0);
  const completedCount = completedMilestones.length;
  const progressPercent = Math.round((completedCount / Math.max(1, totalMilestones)) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Banner / Assessment Card */}
      <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Personalized Training Plan
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            {profile ? `${profile.username}'s 3-Phase Roadmap` : 'Custom Improvement Roadmap'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {quizAnswers ? (
              <>
                Targeted for <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{quizAnswers.playstyle}</span> playstyle · Focusing on <span className="text-amber-600 dark:text-amber-400 font-semibold">{quizAnswers.mainWeakness}</span> · Paced for {quizAnswers.weeklyHours}.
              </>
            ) : (
              'Complete the diagnostic quiz to customize these milestones to your specific weaknesses and rating goal.'
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Progress gauge */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                {completedCount} / {totalMilestones} Tasks
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {progressPercent}% Complete
              </div>
            </div>
          </div>

          <button
            onClick={onOpenQuiz}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            Adjust Goals
          </button>
        </div>
      </div>

      {/* 3 Phases List */}
      <div className="space-y-6">
        {DEFAULT_PHASES.map((phase) => {
          const phaseCompletedCount = phase.milestones.filter(m => completedMilestones.includes(m.id)).length;
          const phasePercent = Math.round((phaseCompletedCount / phase.milestones.length) * 100);

          return (
            <div
              key={phase.phaseNumber}
              className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 transition-colors"
            >
              {/* Phase Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      {phase.duration}
                    </span>
                    <span className="text-slate-400 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {phaseCompletedCount}/{phase.milestones.length} Done
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-0.5">
                    {phase.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{phase.subtitle}</p>
                </div>

                <div className="w-28 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden shrink-0 mt-2 sm:mt-0">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${phasePercent}%` }}
                  />
                </div>
              </div>

              {/* Milestones Checklist */}
              <div className="space-y-3">
                {phase.milestones.map((milestone) => {
                  const isDone = completedMilestones.includes(milestone.id);

                  return (
                    <div
                      key={milestone.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                          : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleMilestone(milestone.id)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-transparent hover:border-emerald-500'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>

                        <div>
                          <div className={`text-sm font-semibold ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                            {milestone.title}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {milestone.description}
                          </p>
                        </div>
                      </div>

                      {/* Interactive Link or Direct Practice */}
                      {milestone.targetTheme && (
                        <button
                          type="button"
                          onClick={() => onSelectThemeTraining(milestone.targetTheme!)}
                          className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>Train Tactics</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
