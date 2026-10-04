import React, { useState } from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, ThumbsUp, ThumbsDown, Filter, Trash2, RefreshCw, KeyRound, Server } from 'lucide-react';
import { FeedbackEntry } from '../types';
import { loadFeedbackEntries, updateFeedbackStatus } from '../lib/storage';

interface AdminViewProps {
  onBackToApp: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBackToApp }) => {
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>(loadFeedbackEntries());
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');
  const [isPingingApi, setIsPingingApi] = useState(false);
  const [apiPingResult, setApiPingResult] = useState<string | null>(null);

  const handleUpdateStatus = (id: string, status: 'new' | 'reviewed' | 'resolved') => {
    const updated = updateFeedbackStatus(id, status);
    setFeedbackList(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all feedback logs?')) {
      localStorage.removeItem('chess_coach_feedback_entries');
      setFeedbackList([]);
    }
  };

  const handleTestApiConnection = async () => {
    setIsPingingApi(true);
    setApiPingResult(null);
    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ sender: 'user', text: 'System diagnostics test: Respond with GM coach confirmation.' }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        setApiPingResult(`Connection Active! Gemini Response: "${data.reply?.slice(0, 100)}..."`);
      } else {
        setApiPingResult(`Server returned HTTP ${res.status}. Falling back to internal engine logic.`);
      }
    } catch (e: any) {
      setApiPingResult(`Error: ${e.message}`);
    } finally {
      setIsPingingApi(false);
    }
  };

  const filtered = feedbackList.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const positiveCount = feedbackList.filter(f => f.type === 'positive').length;
  const negativeCount = feedbackList.filter(f => f.type === 'negative').length;
  const newCount = feedbackList.filter(f => f.status === 'new').length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            Admin & Diagnostics Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-100 mt-1">
            API Security & User Feedback Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Audit live server AI connectivity, review tactical advice ratings, and manage student reports.
          </p>
        </div>

        <button
          onClick={onBackToApp}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
        >
          Return to App
        </button>
      </div>

      {/* Security Architecture & API Key Management Panel */}
      <div className="bg-[#131B2B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-slate-100">
                API Key & Server Architecture
              </h2>
              <span className="text-xs text-emerald-400 font-mono">
                Environment Secret Protected · Server-Side Proxy
              </span>
            </div>
          </div>

          <button
            onClick={handleTestApiConnection}
            disabled={isPingingApi}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPingingApi ? 'animate-spin' : ''}`} />
            <span>{isPingingApi ? 'Testing...' : 'Test AI Connection'}</span>
          </button>
        </div>

        {/* Informational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>How the API Key Works</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google AI Studio automatically injects your <code className="text-amber-300 font-mono">GEMINI_API_KEY</code> into the server environment at runtime (<code className="text-slate-300 font-mono">process.env.GEMINI_API_KEY</code>). No manual client-side key input is required.
            </p>
          </div>

          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero-Leak Security</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              API keys are never exposed in browser HTML, bundles, or client forms. All AI generation and Stockfish evaluation go through backend proxy endpoints (<code className="text-slate-300 font-mono">/api/coach/*</code>).
            </p>
          </div>

          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Server className="w-4 h-4 text-sky-400" />
              <span>Resilient Heuristic Fallback</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Even if an API key is unconfigured, paused, or hits quota limits, the app seamlessly runs on built-in GM tactical heuristics and Stockfish lines without crashing.
            </p>
          </div>
        </div>

        {apiPingResult && (
          <div className="p-3 bg-slate-900 border border-emerald-800/80 rounded-xl text-xs font-mono text-emerald-300 animate-in fade-in">
            {apiPingResult}
          </div>
        )}
      </div>

      {/* Feedback Review Dashboard */}
      <div className="bg-[#131B2B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold font-display text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>User & Coaching Feedback Logs</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review what players said about tactical reviews, blunder detections, and AI advice.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              disabled={feedbackList.length === 0}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
              title="Clear all logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Total Entries</div>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-0.5">
              {feedbackList.length}
            </div>
          </div>
          <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">New / Unreviewed</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-0.5">
              {newCount}
            </div>
          </div>
          <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Helpful / Positive</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
              {positiveCount}
            </div>
          </div>
          <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Issue Reports</div>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-0.5">
              {negativeCount}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
            <span className="text-xs text-slate-400 mr-2">Type:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('positive')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                filterType === 'positive' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Positive
            </button>
            <button
              onClick={() => setFilterType('negative')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                filterType === 'negative' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Issues
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-2">Status:</span>
            {(['all', 'new', 'reviewed', 'resolved'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${
                  filterStatus === st ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No feedback entries matching the selected filters.
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.type === 'positive' ? (
                      <span className="p-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-rose-950/80 text-rose-400 border border-rose-800">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <span className="text-xs font-semibold text-slate-200 capitalize">
                      {item.category.replace('_', ' ')}
                    </span>

                    {item.puzzleId && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Puzzle #{item.puzzleId} ({item.rating} Elo)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        item.status === 'new'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : item.status === 'reviewed'
                          ? 'bg-sky-950 text-sky-400 border border-sky-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 bg-black/30 p-2.5 rounded-lg border border-slate-800/80">
                  "{item.userComment}"
                </p>

                {item.coachReviewSummary && (
                  <div className="text-[11px] text-slate-400 italic">
                    AI Context: "{item.coachReviewSummary}"
                  </div>
                )}

                {/* Status action buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {item.status !== 'reviewed' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'reviewed')}
                      className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    >
                      Mark Reviewed
                    </button>
                  )}
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'resolved')}
                      className="px-2.5 py-1 text-[11px] rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
