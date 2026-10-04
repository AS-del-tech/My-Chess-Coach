# Implementation Plan: Instant Puzzle Reset & Authentic Background Piece Art

Align puzzle mistake mechanics with professional chess platforms and reproduce the exact background chess piece art from the reference screenshot.

---

## 1. User Alignment & Requirements

Based on your prompt and uploaded screenshot (`Screenshot 2026-10-04 at 13.30.17.png`):
1. **Instant Board Reset on Mistakes**:
   - When a wrong move is played, automatically slide/reset the piece back to its origin square after a brief feedback moment (400ms), restoring the board position instantly.
   - The user does not need to click a "Try Again" button; the board is immediately ready for their next attempt, maintaining high solving momentum.
2. **Stop Calling All Wrong Moves "Blunder"**:
   - Eliminate aggressive "BLUNDER" labels, red warning triangles, and blunder terminology.
   - Replace with professional chess training feedback: *"Incorrect move — that drops your advantage. Look for a stronger tactical continuation."* or *"Not quite the move — try another idea."*
   - Keep gentle encouragement and instant access to hints.
3. **Exact Background Chess Piece Outlines (Matching Screenshot)**:
   - In `AnalyzeView.tsx` (and `App.tsx`), replace dark rotated silhouettes with delicate, upright, light-slate outline vectors positioned exactly along the margins as shown in your screenshot:
     - **Top-Left**: Faint King crown outline (`top: 1.5%`, `left: 3%`, size `w-20 h-20`).
     - **Mid-Left**: Subtle Pawn outline (`top: 48%`, `left: 1.5%`, size `w-10 h-12`).
     - **Lower-Left**: Knight profile outline facing left (`top: 62%`, `left: 4%`, size `w-14 h-16`).
     - **Bottom-Left**: Subtle base outline (`top: 96%`, `left: 1%`).
     - **Top-Right**: Queen crown 5-point outline (`top: 18%`, `right: 11%`, size `w-14 h-14`).
     - **Mid-Right Upper**: Bishop outline (`top: 38%`, `right: 6%`, size `w-10 h-14`).
     - **Mid-Right**: Prominent King/Queen rounded outline (`top: 52%`, `right: 2.5%`, size `w-32 h-36`).
     - **Lower-Right**: Rook castle tower outline (`top: 72%`, `right: 10%`, size `w-12 h-14`).
   - Match colors: soft translucent grey outlines (`text-slate-300/40` in light mode, `dark:text-slate-700/30` in dark mode) that sit quietly behind text without visual clutter.

---

## 2. Proposed Architecture & Component Changes

### A. Automatic Move Rollback & Gentle Feedback (`src/components/TrainingArena.tsx`)
- When user plays a move that doesn't match the solution:
  - Play subtle incorrect sound cue (`sound.playStepSolve()` or soft tone, not an aggressive buzzer).
  - Briefly highlight the attempted square in amber/rose for 400ms.
  - Automatically revert the board back to the pre-move position (`chessRef.current = new Chess(preMoveFenRef.current)` and `setCurrentFen(...)`).
  - Set friendly message: *"Not quite the move — look for a tactical breakthrough."*
  - Board remains interactive (`puzzleStatus = 'in_progress'`) so the player can immediately try another move without clicking any reset buttons!

### B. Background Piece Outlines (`src/components/AnalyzeView.tsx` & `src/components/ChessPieces.tsx`)
- Create dedicated SVG outline components in `ChessPieces.tsx`:
  - `KingOutline`
  - `QueenOutline`
  - `KnightOutline`
  - `RookOutline`
  - `BishopOutline`
  - `PawnOutline`
  - `LargeCrownWatermark`
- Position each outline at the exact viewport percentages observed in `Screenshot 2026-10-04 at 13.30.17.png` using non-intrusive `strokeWidth="1.5"` and `fill="none"`.

---

## 3. Verification & Validation Steps
1. **Interactive Testing**:
   - Make an incorrect move during puzzle training: verify the piece automatically returns to its original square within ~400ms without needing any manual button clicks.
   - Verify the UI displays helpful coaching guidance without using the word "blunder".
   - Navigate to the Analyze screen: verify the faint outlined chess pieces along the left and right margins match `Screenshot 2026-10-04 at 13.30.17.png`.
2. **Build Verification**:
   - Run `lint_applet` and `compile_applet` to confirm 0 compilation errors.
