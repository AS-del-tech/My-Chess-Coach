import React from 'react';

interface EvaluationBarProps {
  evaluation: number | string; // e.g. +2.4, -1.8, 'M2', '-M1'
  depth?: number;
  orientation?: 'white' | 'black';
  isBlunder?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  evaluation,
  depth = 24,
  orientation = 'white',
  isBlunder = false
}) => {
  // Compute percentage for white advantage (0% to 100%, 50% is equal)
  let whitePercent = 50;
  let formattedEval = '0.0';

  if (typeof evaluation === 'string') {
    if (evaluation.startsWith('M') || evaluation.startsWith('+M')) {
      const moves = parseInt(evaluation.replace('+M', '').replace('M', ''), 10) || 1;
      whitePercent = 98;
      formattedEval = `M${moves}`;
    } else if (evaluation.startsWith('-M')) {
      const moves = parseInt(evaluation.replace('-M', ''), 10) || 1;
      whitePercent = 2;
      formattedEval = `-M${moves}`;
    } else {
      const parsed = parseFloat(evaluation);
      if (!isNaN(parsed)) {
        // sigmoid or clamp curve
        whitePercent = Math.min(96, Math.max(4, 50 + (parsed / 8) * 50));
        formattedEval = parsed > 0 ? `+${parsed.toFixed(1)}` : parsed.toFixed(1);
      }
    }
  } else if (typeof evaluation === 'number') {
    whitePercent = Math.min(96, Math.max(4, 50 + (evaluation / 8) * 50));
    formattedEval = evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1);
  }

  // If orientation is black, flip bar
  const displayWhiteHeight = orientation === 'white' ? whitePercent : 100 - whitePercent;

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <div className="text-[11px] font-mono font-bold text-slate-300 tabular-nums">
        {formattedEval}
      </div>

      <div className="relative w-5 sm:w-6 h-[320px] sm:h-[440px] md:h-[500px] rounded-sm overflow-hidden bg-[#242b35] border border-slate-700/80 shadow-inner flex flex-col justify-end">
        {/* Black side fill */}
        <div className="w-full bg-[#1b1f26] transition-all duration-500 ease-out flex-1" />

        {/* White side fill */}
        <div
          className="w-full bg-[#f8fafc] transition-all duration-500 ease-out border-t border-slate-400/50"
          style={{ height: `${displayWhiteHeight}%` }}
        />

        {/* Center line (0.0 equality mark) */}
        <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-amber-500/70 pointer-events-none" />

        {/* Score overlay inside bar */}
        <div
          className={`absolute left-0 right-0 text-center text-[10px] font-bold font-mono px-0.5 pointer-events-none ${
            displayWhiteHeight > 50 ? 'bottom-2 text-slate-800' : 'top-2 text-slate-200'
          }`}
        >
          {formattedEval}
        </div>
      </div>

      <div className="text-[10px] font-mono text-slate-500">
        d{depth}
      </div>

      {isBlunder && (
        <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/70 border border-rose-800/80 px-1.5 py-0.5 rounded text-center animate-pulse">
          Blunder
        </span>
      )}
    </div>
  );
};
