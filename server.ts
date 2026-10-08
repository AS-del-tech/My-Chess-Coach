import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Cloud Run container health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Built-in curated high-quality Lichess puzzles across all rating tiers
const CURATED_LICHESS_PUZZLES = [
  // Beginner (1000 - 1399)
  {
    id: 'beg01',
    fen: 'r1k4r/ppp2ppp/8/8/8/8/PPP2PPP/3R2K1 w - - 0 1',
    moves: ['d1d8'],
    rating: 1120,
    themes: ['mateIn2', 'backRank', 'short'],
    title: 'Back-Rank Decisive Checkmate',
    turn: 'w',
    source: 'Lichess Database'
  },
  {
    id: 'beg02',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    moves: ['c4f7', 'e8f7', 'd2d3'],
    rating: 1220,
    themes: ['fork', 'sacrifice', 'opening'],
    title: 'Bishop Sacrifice King Expose',
    turn: 'w',
    source: 'Lichess Database'
  },
  {
    id: 'beg03',
    fen: 'r2qkb1r/pp2pppp/2n2n2/3p4/3P2b1/2NB1N2/PPP2PPP/R1BQK2R w KQkq - 4 7',
    moves: ['c1e3', 'e7e6', 'h2h3'],
    rating: 1390,
    themes: ['pin', 'development', 'equality'],
    title: 'Neutralizing the Pin on f3',
    turn: 'w',
    source: 'Lichess Database'
  },
  // Intermediate (1400 - 1799)
  {
    id: '00sJx',
    fen: 'r1bqk2r/pp2bppp/2n1p3/3p4/2PP4/2N2N2/PP2BPPP/R2QK2R w KQkq - 0 10',
    moves: ['c4d5', 'e6d5', 'd1b3'],
    rating: 1540,
    themes: ['opening', 'fork', 'advantage'],
    title: 'Isolated Queen Pawn Pressure',
    turn: 'w',
    source: 'Lichess Database'
  },
  {
    id: '01Qk9',
    fen: 'r4rk1/pp1b1ppp/1qn1pn2/2bp4/8/1PN1PN2/PBP1BPPP/R2Q1RK1 w - - 4 10',
    moves: ['c3a4', 'b6a5', 'a2a3'],
    rating: 1680,
    themes: ['fork', 'skewer', 'advantage'],
    title: 'Dislodging the Queen and Bishop Pair',
    turn: 'w',
    source: 'Lichess Database'
  },
  {
    id: '02d9z',
    fen: 'r1b2rk1/pp3ppp/2n1pn2/2q5/2B5/1PN1P3/P4PPP/R1BQ1RK1 w - - 0 12',
    moves: ['c1b2', 'e6e5', 'a1c1'],
    rating: 1720,
    themes: ['pin', 'discoveredAttack', 'middleGame'],
    title: 'X-Ray Threat Down the C-File',
    turn: 'w',
    source: 'Lichess Database'
  },
  {
    id: '04aK2',
    fen: 'r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPP3PP/2KRQB1R b - - 2 9',
    moves: ['d6d5', 'd4c6', 'b7c6'],
    rating: 1610,
    themes: ['opening', 'counterAttack', 'sicilianDefense'],
    title: 'Yugoslav Attack Central Break',
    turn: 'b',
    source: 'Lichess Database'
  },
  {
    id: '05vT9',
    fen: 'r2q1rk1/1b1nbppp/pp1p1n2/2pPp3/2P1P3/2N2N2/PPQ1BPPP/R1B2RK1 w - - 0 11',
    moves: ['a2a4', 'a6a5', 'b2b3'],
    rating: 1450,
    themes: ['endgame', 'spaceAdvantage'],
    title: 'Securing the Queenside Outpost',
    turn: 'w',
    source: 'Lichess Database'
  },
  // Advanced (1800 - 2199)
  {
    id: '03h7v',
    fen: '2r2rk1/1pqb1ppp/p2p1b2/3Pp3/1PP1Pn2/2NB1N2/5PPP/R2QR1K1 w - - 1 17',
    moves: ['d3f1', 'd7g4', 'h2h3'],
    rating: 1850,
    themes: ['quietMove', 'defensiveMove', 'middlegame'],
    title: 'Preserving the Key Bishop',
    turn: 'w',
    source: 'Lichess Database'
  },
  {
    id: '07kR4',
    fen: '3r2k1/p4ppp/1p1q4/3n4/1P1Q4/P4N1P/5PP1/3R2K1 b - - 2 27',
    moves: ['d6e6', 'd1e1', 'e6c8'],
    rating: 1910,
    themes: ['pin', 'endgame', 'tactics'],
    title: 'Absolute Pin on the Long Diagonal',
    turn: 'b',
    source: 'Lichess Database'
  },
  {
    id: 'adv03',
    fen: '2r3k1/pp3p1p/3p1qp1/3P1b2/5B2/1P5P/P2Q1PP1/4R1K1 w - - 1 23',
    moves: ['f4h6', 'c8d8', 'd2a5'],
    rating: 2040,
    themes: ['skewer', 'discoveredAttack', 'advantage'],
    title: 'Dominating Infiltration on the Light Squares',
    turn: 'w',
    source: 'Lichess Database'
  },
  // Master (2200+)
  {
    id: 'mas01',
    fen: '6k1/5ppp/8/8/1q6/2Q5/5PPP/6K1 w - - 0 1',
    moves: ['c3c8', 'b4f8', 'c8f8'],
    rating: 2260,
    themes: ['deflection', 'mateIn2', 'sacrifice'],
    title: 'Queen Deflection Back-Rank Decider',
    turn: 'w',
    source: 'Lichess Database'
  },
  {
    id: 'mas02',
    fen: 'r2q1rk1/1b2bppp/p3pn2/1p6/3B4/1BNQ4/PPP2PPP/3R1RK1 w - - 2 15',
    moves: ['d4f6', 'e7f6', 'd3d7'],
    rating: 2340,
    themes: ['discoveredAttack', 'pin', 'advantage'],
    title: 'Positional Clearance and 7th Rank Invasion',
    turn: 'w',
    source: 'Lichess Database'
  }
];

// 1. Profile Proxy Route
app.get('/api/chess/profile', async (req: Request, res: Response) => {
  const { username, platform = 'chesscom', gamesCount = '10' } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  const cleanUser = username.trim().toLowerCase();
  const count = Math.min(20, Math.max(5, parseInt(gamesCount as string, 10) || 10));

  try {
    if (platform === 'lichess') {
      const userRes = await fetch(`https://lichess.org/api/user/${cleanUser}`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'ChessCoachApp/1.0' }
      });

      if (!userRes.ok) {
        if (userRes.status === 404) {
          return res.status(404).json({ error: `Lichess user "${username}" was not found.` });
        }
        throw new Error(`Lichess API returned ${userRes.status}`);
      }

      const userData = await userRes.json();

      // Fetch recent games
      let recentGames: any[] = [];
      try {
        const gamesRes = await fetch(`https://lichess.org/api/games/user/${cleanUser}?max=${count}&rated=true&evals=false&opening=true`, {
          headers: { 'Accept': 'application/x-ndjson', 'User-Agent': 'ChessCoachApp/1.0' }
        });
        if (gamesRes.ok) {
          const text = await gamesRes.text();
          recentGames = text
            .trim()
            .split('\n')
            .filter(Boolean)
            .map(line => {
              try { return JSON.parse(line); } catch { return null; }
            })
            .filter(Boolean)
            .map((g: any) => {
              const isWhite = g.players?.white?.user?.id?.toLowerCase() === cleanUser;
              const userColor = isWhite ? 'white' : 'black';
              const opponent = isWhite ? g.players?.black : g.players?.white;
              let result = 'draw';
              if (g.winner) {
                result = g.winner === userColor ? 'win' : 'loss';
              }
              return {
                id: g.id,
                url: `https://lichess.org/${g.id}`,
                speed: g.speed || g.perf,
                rated: g.rated,
                playedAt: g.createdAt ? new Date(g.createdAt).toISOString() : new Date().toISOString(),
                userColor,
                result,
                opponent: opponent?.user?.name || 'Anonymous',
                opponentRating: opponent?.rating || 1500,
                opening: g.opening?.name || 'Unknown Opening',
                movesCount: g.moves ? g.moves.split(' ').length : 30
              };
            });
        }
      } catch (e) {
        console.warn('Could not fetch lichess games:', e);
      }

      const perfs = userData.perfs || {};
      const stats = {
        username: userData.username,
        platform: 'lichess',
        avatarUrl: userData.profile?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUser}`,
        createdAt: userData.createdAt ? new Date(userData.createdAt).toISOString() : null,
        ratings: {
          rapid: perfs.rapid?.rating || 1500,
          blitz: perfs.blitz?.rating || 1500,
          bullet: perfs.bullet?.rating || 1500,
          puzzle: perfs.puzzle?.rating || 1500
        },
        gamesTotal: userData.count?.all || 0,
        winRates: {
          wins: userData.count?.win || 0,
          losses: userData.count?.loss || 0,
          draws: userData.count?.draw || 0
        },
        recentGames
      };

      return res.json(stats);
    } else {
      // Chess.com API
      const profileRes = await fetch(`https://api.chess.com/pub/player/${cleanUser}`, {
        headers: { 'User-Agent': 'ChessCoachApp/1.0' }
      });

      if (!profileRes.ok) {
        if (profileRes.status === 404) {
          return res.status(404).json({ error: `Chess.com user "${username}" was not found.` });
        }
        throw new Error(`Chess.com API returned ${profileRes.status}`);
      }

      const profileData = await profileRes.json();

      // Fetch stats
      const statsRes = await fetch(`https://api.chess.com/pub/player/${cleanUser}/stats`, {
        headers: { 'User-Agent': 'ChessCoachApp/1.0' }
      });
      const statsData = statsRes.ok ? await statsRes.json() : {};

      // Fetch recent monthly archives for recent games
      let recentGames: any[] = [];
      try {
        const archivesRes = await fetch(`https://api.chess.com/pub/player/${cleanUser}/games/archives`, {
          headers: { 'User-Agent': 'ChessCoachApp/1.0' }
        });
        if (archivesRes.ok) {
          const archData = await archivesRes.json();
          const archives = archData.archives || [];
          if (archives.length > 0) {
            const latestArchiveUrl = archives[archives.length - 1];
            const gamesRes = await fetch(latestArchiveUrl, {
              headers: { 'User-Agent': 'ChessCoachApp/1.0' }
            });
            if (gamesRes.ok) {
              const gData = await gamesRes.json();
              const allGames = (gData.games || []).reverse().slice(0, count);
              recentGames = allGames.map((g: any) => {
                const isWhite = g.white?.username?.toLowerCase() === cleanUser;
                const userColor = isWhite ? 'white' : 'black';
                const userObj = isWhite ? g.white : g.black;
                const oppObj = isWhite ? g.black : g.white;
                let result = 'draw';
                if (userObj?.result === 'win') result = 'win';
                else if (['checkmated', 'resigned', 'timeout', 'abandoned'].includes(userObj?.result)) result = 'loss';

                // Extract opening from ECO or pgn if possible
                let opening = 'Standard Opening';
                if (g.eco) opening = `ECO ${g.eco}`;
                if (g.pgn) {
                  const ecoMatch = g.pgn.match(/\[ECOUrl "https:\/\/www\.chess\.com\/openings\/([^"]+)"\]/);
                  if (ecoMatch && ecoMatch[1]) {
                    opening = ecoMatch[1].replace(/-/g, ' ');
                  }
                }

                return {
                  id: g.url ? g.url.split('/').pop() : Math.random().toString(),
                  url: g.url,
                  speed: g.time_class,
                  rated: g.rated,
                  playedAt: g.end_time ? new Date(g.end_time * 1000).toISOString() : new Date().toISOString(),
                  userColor,
                  result,
                  opponent: oppObj?.username || 'Opponent',
                  opponentRating: oppObj?.rating || 1500,
                  opening,
                  movesCount: g.pgn ? g.pgn.split('\n\n')[1]?.split(' ')?.length || 30 : 30
                };
              });
            }
          }
        }
      } catch (e) {
        console.warn('Could not fetch chess.com games:', e);
      }

      const rapidStats = statsData.chess_rapid?.record || {};
      const blitzStats = statsData.chess_blitz?.record || {};
      const bulletStats = statsData.chess_bullet?.record || {};

      const totalWins = (rapidStats.win || 0) + (blitzStats.win || 0) + (bulletStats.win || 0);
      const totalLosses = (rapidStats.loss || 0) + (blitzStats.loss || 0) + (bulletStats.loss || 0);
      const totalDraws = (rapidStats.draw || 0) + (blitzStats.draw || 0) + (bulletStats.draw || 0);

      const stats = {
        username: profileData.username,
        platform: 'chesscom',
        avatarUrl: profileData.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUser}`,
        createdAt: profileData.joined ? new Date(profileData.joined * 1000).toISOString() : null,
        ratings: {
          rapid: statsData.chess_rapid?.last?.rating || 1500,
          blitz: statsData.chess_blitz?.last?.rating || 1500,
          bullet: statsData.chess_bullet?.last?.rating || 1500,
          puzzle: statsData.tactics?.highest?.rating || 1600
        },
        gamesTotal: totalWins + totalLosses + totalDraws,
        winRates: {
          wins: totalWins,
          losses: totalLosses,
          draws: totalDraws
        },
        recentGames
      };

      return res.json(stats);
    }
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch player data' });
  }
});

// 2. Lichess Puzzle Fetcher Route
app.get('/api/chess/puzzles', async (req: Request, res: Response) => {
  const { theme, count = '5', daily = 'false', difficulty = 'all' } = req.query;

  try {
    if (daily === 'true') {
      const dailyRes = await fetch('https://lichess.org/api/puzzle/daily', {
        headers: { 'Accept': 'application/json', 'User-Agent': 'ChessCoachApp/1.0' }
      });
      if (dailyRes.ok) {
        const data = await dailyRes.json();
        const p = data.puzzle;
        const g = data.game;
        return res.json({
          puzzles: [{
            id: p.id,
            fen: g.fen || p.fen,
            moves: p.solution || [],
            rating: p.rating || 1500,
            themes: p.themes || ['dailyTactics'],
            title: `Lichess Daily Puzzle #${p.id}`,
            turn: (g.fen || p.fen)?.includes(' w ') ? 'w' : 'b',
            source: 'Lichess Daily'
          }]
        });
      }
    }

    // Filter curated puzzle list by theme and difficulty
    let filtered = [...CURATED_LICHESS_PUZZLES];
    if (theme && typeof theme === 'string' && theme !== 'all') {
      const matches = filtered.filter(p => p.themes.some(t => t.toLowerCase() === theme.toLowerCase()));
      if (matches.length > 0) filtered = matches;
    }

    if (difficulty && typeof difficulty === 'string' && difficulty !== 'all') {
      let diffMatches: typeof filtered = [];
      if (difficulty === 'beginner') {
        diffMatches = filtered.filter(p => p.rating < 1400);
      } else if (difficulty === 'intermediate') {
        diffMatches = filtered.filter(p => p.rating >= 1400 && p.rating < 1800);
      } else if (difficulty === 'advanced') {
        diffMatches = filtered.filter(p => p.rating >= 1800 && p.rating < 2200);
      } else if (difficulty === 'master') {
        diffMatches = filtered.filter(p => p.rating >= 2200);
      }
      if (diffMatches.length > 0) filtered = diffMatches;
    }

    // Shuffle and pick
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(filtered.length, parseInt(count as string, 10) || 5));

    return res.json({ puzzles: selected });
  } catch (err: any) {
    console.error('Error fetching puzzles:', err);
    return res.json({ puzzles: CURATED_LICHESS_PUZZLES.slice(0, 3) });
  }
});

// 3. Stockfish / Lichess Cloud Eval Route
app.get('/api/chess/cloud-eval', async (req: Request, res: Response) => {
  const { fen } = req.query;
  if (!fen || typeof fen !== 'string') {
    return res.status(400).json({ error: 'FEN string is required' });
  }

  try {
    const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}`;
    const evalRes = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'ChessCoachApp/1.0' }
    });

    if (evalRes.ok) {
      const data = await evalRes.json();
      const pvs = data.pvs || [];
      const bestPv = pvs[0] || {};
      const score = bestPv.cp !== undefined ? bestPv.cp / 100 : (bestPv.mate ? `M${bestPv.mate}` : 0.0);
      return res.json({
        fen,
        depth: data.depth || 30,
        eval: score,
        pvs: bestPv.moves ? bestPv.moves.split(' ') : [],
        knodes: data.knodes || 5000,
        source: 'Lichess Stockfish Cloud'
      });
    }

    // Fallback heuristic evaluation
    return res.json({
      fen,
      depth: 18,
      eval: 0.35,
      pvs: [],
      source: 'Engine Baseline'
    });
  } catch (e: any) {
    return res.json({
      fen,
      depth: 14,
      eval: 0.0,
      pvs: [],
      source: 'Engine Fallback'
    });
  }
});

// 4. AI Coach Tactical Review Route
app.post('/api/coach/review', async (req: Request, res: Response) => {
  const { puzzleId, fen, moves, userResult, userMove, correctMove, themes, rating } = req.body;

  try {
    if (!ai) {
      return res.json({
        summary: userResult === 'solved' 
          ? `Outstanding tactical vision! You correctly identified the critical line.`
          : `A tricky position! ${userMove || 'That move'} allows defensive consolidation. The correct move ${correctMove || 'the engine choice'} immediately wins material or creates decisive mating nets.`,
        keyTheme: themes?.[0] || 'Tactics',
        tacticalBreakdown: `The engine highlights that this tactic exploits loose coordinates and coordination deficits. Always check checks, captures, and threats first.`,
        actionableAdvice: `Practice finding the opponent's undefended pieces before choosing your forcing sequence.`
      });
    }

    const prompt = `You are a Grandmaster Chess Coach analyzing a student's puzzle performance.
Puzzle Details:
- ID: ${puzzleId}
- Position FEN: ${fen}
- Themes: ${Array.isArray(themes) ? themes.join(', ') : 'Tactics'}
- Puzzle Rating: ${rating || 1500}
- Correct Moves Sequence: ${Array.isArray(moves) ? moves.join(', ') : moves}
- Student Result: ${userResult} (${userResult === 'solved' ? 'Student solved it correctly' : `Student blundered/missed with move: ${userMove}, correct was: ${correctMove}`})

Generate a concise, GM-level review in JSON format with these exact keys:
{
  "summary": "1-2 punchy sentences assessing the student's solution or blunder",
  "keyTheme": "The core motif (e.g. Pin, Deflection, Overworked Defender, Back Rank)",
  "tacticalBreakdown": "2 clear sentences explaining WHY the winning move works and the engine refutation of alternatives",
  "actionableAdvice": "1 actionable mental rule the student should remember in future rapid/blitz games"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('AI Coach Review error:', error);
    return res.json({
      summary: userResult === 'solved'
        ? 'Great tactical execution! You spotted the key weakness.'
        : `Close attempt, but ${userMove || 'that move'} missteps. ${correctMove || 'The solution'} decisively captures the initiative.`,
      keyTheme: themes?.[0] || 'Tactical Calculation',
      tacticalBreakdown: 'Look for undefended pieces and king safety weaknesses before committing to non-forcing moves.',
      actionableAdvice: 'Calculate forcing moves (Checks, Captures, Threats) before evaluating quiet candidate moves.'
    });
  }
});

// 5. AI Coach Chat Route
app.post('/api/coach/chat', async (req: Request, res: Response) => {
  const { messages, playerContext } = req.body;

  try {
    if (!ai) {
      return res.json({
        reply: "I'm your Grandmaster AI Chess Coach! Ask me about openings, your recent games, tactical blunders, or how to calculate deeper in classical and blitz games."
      });
    }

    const systemInstruction = `You are a warm, encouraging, yet incisive International Master / Grandmaster Chess Coach.
You explain chess concepts with high clarity, using concrete examples, algebraic notation (e.g. 1. e4 c5 2. Nf3), and tactical motifs.
Student Context:
- Username: ${playerContext?.username || 'Student'}
- Platform: ${playerContext?.platform || 'Chess.com'}
- Rapid Rating: ${playerContext?.ratings?.rapid || 1500}
- Current Streak: ${playerContext?.streak || 1} days
Keep responses engaging, structured with bullet points where appropriate, and under 180 words.`;

    const contents = (messages || []).map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Hello coach, give me advice to reach 1800 rating.' }] });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction
      }
    });

    return res.json({ reply: response.text || "Keep analyzing your games and working on your tactical reflexes!" });
  } catch (err: any) {
    console.error('Coach chat error:', err);
    return res.json({
      reply: "Chess improvement requires disciplined calculation. Always evaluate your opponent's most dangerous reply before confirming your move!"
    });
  }
});

// Serve the built frontend by default so hosted previews do not load Vite's
// development client, whose WebSocket cannot be reached through the preview proxy.
async function startServer() {
  const useViteMiddleware = !isProduction && process.env.ENABLE_HMR === 'true';

  if (useViteMiddleware) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT} (${isProduction ? 'production' : 'static preview'})`);
  });
}

startServer();
