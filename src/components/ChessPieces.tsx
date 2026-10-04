import React from 'react';

interface PieceProps {
  className?: string;
  fill?: string;
  stroke?: string;
}

// Brand wordmark & interactive piece icons
export const KnightPiece: React.FC<PieceProps> = ({
  className = 'w-6 h-6',
  fill = 'currentColor',
  stroke = 'none'
}) => (
  <svg viewBox="0 0 45 45" className={className} fill="none" aria-hidden="true">
    <g fill={fill} stroke={stroke}>
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21z" />
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-2 2.5-3c1 0 1 3 1 3z" />
    </g>
  </svg>
);

export const QueenPiece: React.FC<PieceProps> = ({
  className = 'w-6 h-6',
  fill = 'currentColor'
}) => (
  <svg viewBox="0 0 45 45" className={className} fill={fill} aria-hidden="true">
    <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 22.5,10 L 14,25 L 6.5,13.5 L 9,26 z" />
    <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 13.5,36.5 22.5,36.5 24,36.5 C 25.5,36.5 31.5,36.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26" />
    <path d="M 11,38.5 L 34,38.5 L 34,40 L 11,40 Z" />
    <circle cx="6" cy="12" r="2" />
    <circle cx="14" cy="9" r="2" />
    <circle cx="22.5" cy="8" r="2" />
    <circle cx="31" cy="9" r="2" />
    <circle cx="39" cy="12" r="2" />
  </svg>
);

export const KingPiece: React.FC<PieceProps> = ({
  className = 'w-6 h-6',
  fill = 'currentColor'
}) => (
  <svg viewBox="0 0 45 45" className={className} fill={fill} aria-hidden="true">
    <path d="M 21.5,5 L 23.5,5 L 23.5,8 L 26.5,8 L 26.5,10 L 23.5,10 L 23.5,13 L 21.5,13 L 21.5,10 L 18.5,10 L 18.5,8 L 21.5,8 Z" />
    <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 33.5,35 34,30.5 32,27 C 30,23.5 24,20.5 22.5,20.5 C 21,20.5 15,23.5 13,27 C 11,30.5 11.5,35 11.5,37 z" />
    <path d="M 11,38 L 34,38 L 34,40 L 11,40 Z" />
  </svg>
);

export const RookPiece: React.FC<PieceProps> = ({
  className = 'w-6 h-6',
  fill = 'currentColor'
}) => (
  <svg viewBox="0 0 45 45" className={className} fill={fill} aria-hidden="true">
    <path d="M 9,39 L 36,39 L 36,36 L 9,36 Z" />
    <path d="M 12,36 L 12,32 L 33,32 L 33,36 Z" />
    <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 Z" />
    <path d="M 14,17 L 14,29.5 L 31,29.5 L 31,17 Z" />
  </svg>
);

export const BishopPiece: React.FC<PieceProps> = ({
  className = 'w-6 h-6',
  fill = 'currentColor'
}) => (
  <svg viewBox="0 0 45 45" className={className} fill={fill} aria-hidden="true">
    <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 Z" />
    <circle cx="22.5" cy="8" r="2.5" />
    <path d="M 9,39 L 36,39 L 36,36 L 9,36 Z" />
  </svg>
);

export const PawnPiece: React.FC<PieceProps> = ({
  className = 'w-6 h-6',
  fill = 'currentColor'
}) => (
  <svg viewBox="0 0 45 45" className={className} fill={fill} aria-hidden="true">
    <circle cx="22.5" cy="13" r="4.5" />
    <path d="M 16,21 C 16,23.5 18,25 20,26 C 17,27 12,32 12,39 L 33,39 C 33,32 28,27 25,26 C 27,25 29,23.5 29,21 Z" />
  </svg>
);

// =========================================================================
// Delicate Outline Piece Watermarks (Matching Screenshot 2026-10-04 at 13.30.17.png)
// =========================================================================

// Top-Left King Outline with cross
export const KingOutlinePiece: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 45 45" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {/* Cross on top */}
    <path d="M22.5 6v6M19.5 9h6" />
    {/* Crown shape */}
    <path d="M12 33c4 3 17 3 21 0-1-5-3-9-5-12-3-4-5.5-4-5.5-4s-2.5 0-5.5 4c-2 3-4 7-5 12z" />
    {/* Base lines */}
    <path d="M11 37h23M9 40h27" />
  </svg>
);

// Mid-Left Pawn Outline
export const PawnOutlinePiece: React.FC<{ className?: string }> = ({ className = 'w-10 h-12' }) => (
  <svg viewBox="0 0 45 45" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="22.5" cy="14" r="5" />
    <path d="M18 20h9" />
    <path d="M16 26c3 1 10 1 13 0 1 4 3 8 5 12H11c2-4 4-8 5-12z" />
    <path d="M10 41h25" />
  </svg>
);

// Lower-Left Knight Outline facing left
export const KnightOutlinePiece: React.FC<{ className?: string }> = ({ className = 'w-14 h-16' }) => (
  <svg viewBox="0 0 45 45" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21z" />
    <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-2 2.5-3c1 0 1 3 1 3z" />
    <circle cx="15" cy="15" r="1" fill="currentColor" />
  </svg>
);

// Bottom-Left subtle base
export const PawnBaseOutlinePiece: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 45 45" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 34c4-3 13-3 17 0" />
    <path d="M11 38h23M9 41h27" />
  </svg>
);

// Top-Right 5-point Queen Crown Outline with circular points
export const QueenCrownOutlinePiece: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 45 45" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {/* 5 crown spikes */}
    <path d="M7 16l3 12h25l3-12-6 8-6-13-3.5 13-3.5-13-6 13z" />
    {/* Base rim */}
    <path d="M10 32h25M9 36h27" />
    {/* Circle tips */}
    <circle cx="7" cy="14" r="1.5" />
    <circle cx="13" cy="9" r="1.5" />
    <circle cx="22.5" cy="7" r="1.5" />
    <circle cx="32" cy="9" r="1.5" />
    <circle cx="38" cy="14" r="1.5" />
  </svg>
);

// Mid-Right Upper Bishop Outline
export const BishopOutlinePiece: React.FC<{ className?: string }> = ({ className = 'w-10 h-14' }) => (
  <svg viewBox="0 0 45 45" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="22.5" cy="9" r="2" />
    <path d="M15 32c2.5 2.5 12.5 2.5 15 0 0-2-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 2-2.5 4z" />
    <path d="M17.5 26h10M11 37h23M9 40h27" />
  </svg>
);

// Mid-Right Large Iconic King / Queen Crown Watermark (matching screenshot)
export const LargeCrownWatermark: React.FC<{ className?: string }> = ({ className = 'w-36 h-40' }) => (
  <svg viewBox="0 0 80 90" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {/* Top cross */}
    <path d="M40 8v14M33 15h14" />
    {/* Large arched crown head */}
    <path d="M22 62c4-18 10-27 18-27s14 9 18 27" />
    <path d="M15 62c0-14 8-22 14-27" />
    <path d="M65 62c0-14-8-22-14-27" />
    {/* Broad pedestal lines */}
    <path d="M18 70h44" strokeWidth="3.5" />
    <path d="M14 78h52" strokeWidth="4" />
  </svg>
);

// Lower-Right Rook Outline
export const RookOutlinePiece: React.FC<{ className?: string }> = ({ className = 'w-12 h-14' }) => (
  <svg viewBox="0 0 45 45" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 12V9h4v3h5V9h5v3h4v3l-2 2v14l2 2v4H11v-4l2-2V17l-2-2v-3z" />
    <path d="M15 20h15M15 26h15M10 38h25" />
  </svg>
);
