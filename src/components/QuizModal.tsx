import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight } from 'lucide-react';
import { QuizAnswers } from '../types';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuiz: (answers: QuizAnswers) => void;
  initialAnswers?: QuizAnswers | null;
}

const QUESTIONS = [
  {
    key: 'experienceLevel',
    title: '1. What is your current chess rating or experience level?',
    subtitle: 'This anchors your starting exercises and tactical difficulty.',
    options: [
      { label: 'Beginner (< 1000)', desc: 'Learning core fundamentals and piece safety' },
      { label: 'Intermediate (1000 – 1400)', desc: 'Comfortable with basic tactics and openings' },
      { label: 'Club Player (1400 – 1800)', desc: 'Seeking deep calculation and positional mastery' },
      { label: 'Advanced (1800+)', desc: 'Fine-tuning nuances, endgame technique, and preparation' }
    ]
  },
  {
    key: 'playstyle',
    title: '2. Which playstyle best describes your approach?',
    subtitle: 'Helps us recommend openings and middlegame themes.',
    options: [
      { label: 'Aggressive Attacker', desc: 'Gambits, kingside sacrifices, and sharp open games' },
      { label: 'Solid Positional', desc: 'Piece maneuvering, pawn structures, and low-risk control' },
      { label: 'Dynamic Universal', desc: 'Balanced play adapting to the demands of the position' },
      { label: 'Fast Tactical Blitz', desc: 'Quick instinctive blows and clock pressure' }
    ]
  },
  {
    key: 'mainWeakness',
    title: '3. What is your single biggest bottleneck right now?',
    subtitle: 'Your roadmap will focus heavily on correcting this habit.',
    options: [
      { label: 'Tactical Blunders', desc: 'Missing 1-2 move tactics or opponent counter-threats' },
      { label: 'Converting Endgames', desc: 'Failing to turn winning material into full points' },
      { label: 'Opening Knowledge', desc: 'Getting bad positions or falling into opening traps' },
      { label: 'Time Management', desc: 'Freezing on normal moves and losing on the clock' }
    ]
  },
  {
    key: 'weeklyHours',
    title: '4. How much time can you dedicate per week?',
    subtitle: 'Paces your 3-phase training schedule realistically.',
    options: [
      { label: '1 – 2 Hours (Casual)', desc: '10 mins daily tactics and a weekend review' },
      { label: '3 – 5 Hours (Steady)', desc: 'Daily puzzle streak + 3 focused rapid analysis sessions' },
      { label: '6 – 10 Hours (Intensive)', desc: 'Serious structured regimen with opening book study' },
      { label: '10+ Hours (Hardcore)', desc: 'Rapid tournament preparation and master games study' }
    ]
  }
];

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  onSaveQuiz,
  initialAnswers
}) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    experienceLevel: initialAnswers?.experienceLevel || QUESTIONS[0].options[1].label,
    playstyle: initialAnswers?.playstyle || QUESTIONS[1].options[0].label,
    mainWeakness: initialAnswers?.mainWeakness || QUESTIONS[2].options[0].label,
    weeklyHours: initialAnswers?.weeklyHours || QUESTIONS[3].options[1].label,
    targetRating: '+150 Elo in 90 Days'
  });

  if (!isOpen) return null;

  const currentQ = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const handleSelectOption = (optLabel: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.key]: optLabel
    }));
  };

  const handleNext = () => {
    if (isLast) {
      onSaveQuiz(answers);
      onClose();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-700/80 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Diagnostic Assessment · Step {step + 1} of {QUESTIONS.length}
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
              {currentQ.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{currentQ.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-2.5">
          {currentQ.options.map(opt => {
            const isSelected = (answers as any)[currentQ.key] === opt.label;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => handleSelectOption(opt.label)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{opt.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</div>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>{isLast ? 'Generate Custom Plan' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
