import React, { useState, useEffect } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { sound } from '../lib/sound';
import lichessPieces from '../lib/lichess_pieces.json';

interface ChessboardProps {
  fen: string;
  orientation?: 'white' | 'black';
  onMove?: (from: string, to: string, promotion?: string) => boolean | void;
  interactive?: boolean;
  lastMove?: { from: string; to: string } | null;
  bestMoveArrow?: { from: string; to: string } | null;
  highlightSquares?: string[];
  highlightVariant?: 'hint' | 'blunder' | 'correct';
  disabled?: boolean;
}

// Map piece color and type to official tournament Lichess Cburnett SVG
const getPieceSvg = (color: 'w' | 'b', type: string): string => {
  const key = `${color}${type.toUpperCase()}` as keyof typeof lichessPieces;
  return lichessPieces[key] || '';
};

export const Chessboard: React.FC<ChessboardProps> = ({
  fen,
  orientation = 'white',
  onMove,
  interactive = true,
  lastMove = null,
  bestMoveArrow = null,
  highlightSquares = [],
  highlightVariant = 'hint',
  disabled = false
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  // Initialize chess instance to check legal moves from FEN
  const chess = React.useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  const ranks = orientation === 'white' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const files = orientation === 'white' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);
  }, [fen]);

  const handleSquareClick = (square: string) => {
    if (!interactive || disabled) return;

    // Check if clicking on an already selected square (deselect)
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // Check if making a move to this target square
    if (selectedSquare) {
      const isLegal = legalMoves.some(m => m.to === square);
      if (isLegal) {
        // Check for pawn promotion (pawn reaching 8th or 1st rank)
        const piece = chess.get(selectedSquare as Square);
        const isPromotion =
          piece?.type === 'p' &&
          ((piece.color === 'w' && square.endsWith('8')) ||
            (piece.color === 'b' && square.endsWith('1')));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        executeMove(selectedSquare, square);
        return;
      }
    }

    // Otherwise, select new square if it contains current player's piece
    const piece = chess.get(square as Square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      const moves = chess.moves({ square: square as Square, verbose: true });
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const executeMove = (from: string, to: string, promotion?: string) => {
    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);

    if (onMove) {
      onMove(from, to, promotion);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, square: string) => {
    if (!interactive || disabled) {
      e.preventDefault();
      return;
    }
    const piece = chess.get(square as Square);
    if (!piece || piece.color !== chess.turn()) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData('text/plain', square);
    setSelectedSquare(square);
    const moves = chess.moves({ square: square as Square, verbose: true });
    setLegalMoves(moves);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSquare: string) => {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData('text/plain');
    if (!fromSquare) return;

    const isLegal = legalMoves.some(m => m.from === fromSquare && m.to === targetSquare);
    if (isLegal) {
      const piece = chess.get(fromSquare as Square);
      const isPromotion =
        piece?.type === 'p' &&
        ((piece.color === 'w' && targetSquare.endsWith('8')) ||
          (piece.color === 'b' && targetSquare.endsWith('1')));

      if (isPromotion) {
        setPendingPromotion({ from: fromSquare, to: targetSquare });
      } else {
        executeMove(fromSquare, targetSquare);
      }
    }
  };

  // Coordinate helper for drawing vector arrows
  const getSquareCoords = (sq: string) => {
    if (!sq || sq.length < 2) return null;
    const file = sq[0].toLowerCase();
    const rank = parseInt(sq[1], 10);
    const fIdx = files.indexOf(file);
    const rIdx = ranks.indexOf(rank);
    if (fIdx === -1 || rIdx === -1) return null;
    return {
      x: (fIdx + 0.5) * 12.5,
      y: (rIdx + 0.5) * 12.5
    };
  };

  const arrow = bestMoveArrow
    ? {
        from: getSquareCoords(bestMoveArrow.from),
        to: getSquareCoords(bestMoveArrow.to)
      }
    : null;

  let arrowLine = null;
  if (arrow?.from && arrow?.to) {
    const dx = arrow.to.x - arrow.from.x;
    const dy = arrow.to.y - arrow.from.y;
    const angle = Math.atan2(dy, dx);
    const endX = arrow.to.x - Math.cos(angle) * 3;
    const endY = arrow.to.y - Math.sin(angle) * 3;
    arrowLine = {
      x1: arrow.from.x,
      y1: arrow.from.y,
      x2: endX,
      y2: endY
    };
  }

  return (
    <div className="relative select-none aspect-square w-full max-w-[460px] sm:max-w-[480px] rounded-xl overflow-hidden shadow-2xl border-4 border-[#242b35]">
      {/* 8x8 Board Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {ranks.map((rank, rIdx) =>
          files.map((file, fIdx) => {
            const square = `${file}${rank}`;
            const isLight = (rIdx + fIdx) % 2 === 0;
            const piece = chess.get(square as Square);
            const isSelected = selectedSquare === square;
            const isLastMove = lastMove?.from === square || lastMove?.to === square;
            const isHighlighted = highlightSquares.includes(square);
            const legalTarget = legalMoves.find(m => m.to === square);

            // Natural tournament board theme (Lichess Wood / Classic tournament colors)
            const squareBg = isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]';

            // Highlight styling based on variant
            let highlightClasses = '';
            if (isHighlighted) {
              if (highlightVariant === 'blunder') {
                highlightClasses = 'ring-inset ring-4 ring-rose-500 after:absolute after:inset-0 after:bg-rose-500/35 after:pointer-events-none animate-pulse';
              } else if (highlightVariant === 'correct') {
                highlightClasses = 'ring-inset ring-4 ring-emerald-500 after:absolute after:inset-0 after:bg-emerald-500/35 after:pointer-events-none';
              } else {
                highlightClasses = 'ring-inset ring-4 ring-amber-400 after:absolute after:inset-0 after:bg-amber-400/30 after:pointer-events-none animate-pulse';
              }
            }

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, square)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors ${squareBg} ${
                  isSelected ? 'ring-inset ring-4 ring-emerald-500' : ''
                } ${isLastMove ? 'after:absolute after:inset-0 after:bg-amber-400/35 after:pointer-events-none' : ''} ${highlightClasses}`}
              >
                {/* Coordinate labels */}
                {fIdx === 0 && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] font-bold font-mono pointer-events-none ${
                      isLight ? 'text-[#b58863]' : 'text-[#f0d9b5]'
                    }`}
                  >
                    {rank}
                  </span>
                )}
                {rIdx === 7 && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] font-bold font-mono pointer-events-none ${
                      isLight ? 'text-[#b58863]' : 'text-[#f0d9b5]'
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Official Lichess Piece Vector */}
                {piece && (
                  <div
                    draggable={interactive && !disabled && piece.color === chess.turn()}
                    onDragStart={e => handleDragStart(e, square)}
                    className="w-[88%] h-[88%] flex items-center justify-center z-10 transition-transform active:scale-95 cursor-grab active:cursor-grabbing [&>svg]:w-full [&>svg]:h-full [&>svg]:pointer-events-none"
                    dangerouslySetInnerHTML={{
                      __html: getPieceSvg(piece.color as 'w' | 'b', piece.type)
                    }}
                  />
                )}

                {/* Legal Move Indicator */}
                {legalTarget && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {piece ? (
                      // Capture ring
                      <div className="w-[88%] h-[88%] rounded-full border-4 border-black/25" />
                    ) : (
                      // Move dot
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black/25" />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Visual Move Arrow Overlay */}
      {arrowLine && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
          viewBox="0 0 100 100"
        >
          <defs>
            <marker
              id="hint-arrowhead"
              markerWidth="4.5"
              markerHeight="4.5"
              refX="2.8"
              refY="2"
              orient="auto"
            >
              <polygon points="0 0, 4.5 2, 0 4" fill="#00875A" />
            </marker>
          </defs>
          <line
            x1={arrowLine.x1}
            y1={arrowLine.y1}
            x2={arrowLine.x2}
            y2={arrowLine.y2}
            stroke="#00875A"
            strokeWidth="2.4"
            strokeLinecap="round"
            markerEnd="url(#hint-arrowhead)"
            opacity="0.88"
          />
        </svg>
      )}

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-slate-700 p-4 rounded-xl shadow-2xl text-center max-w-xs w-full animate-in fade-in zoom-in-95">
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Choose Promotion</h4>
            <div className="grid grid-cols-4 gap-2">
              {(['q', 'r', 'b', 'n'] as const).map(pType => {
                const turnColor = chess.turn();
                return (
                  <button
                    key={pType}
                    onClick={() => executeMove(pendingPromotion.from, pendingPromotion.to, pType)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{
                        __html: getPieceSvg(turnColor as 'w' | 'b', pType)
                      }}
                    />
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPendingPromotion(null)}
              className="mt-3 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
