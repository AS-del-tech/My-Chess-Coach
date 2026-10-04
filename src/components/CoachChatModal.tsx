import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Bot } from 'lucide-react';
import { ChatMessage, PlayerProfile } from '../types';

interface CoachChatModalProps {
  profile: PlayerProfile | null;
  streakCount: number;
}

export const CoachChatModal: React.FC<CoachChatModalProps> = ({
  profile,
  streakCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'coach',
      text: `Hello! I'm your Grandmaster AI Chess Coach. Ask me about opening preparation, calculation techniques, how to stop blundering, or how to reach your next rating milestone!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          playerContext: {
            username: profile?.username || 'Student',
            platform: profile?.platform || 'chesscom',
            ratings: profile?.ratings || { rapid: 1500 },
            streak: streakCount
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const coachMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: 'coach',
          text: data.reply || "Always keep your pieces defended and examine your opponent's checks and captures before deciding on a move!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, coachMsg]);
      }
    } catch (e) {
      console.error('Chat error:', e);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'coach',
          text: 'Tactical discipline is built move by move. Make sure to calculate forcing responses for both sides!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'How do I stop hanging pieces in blitz?',
    'What is the best response to 1. d4?',
    'How can I convert knight vs bishop endgames?'
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Chess Coach chat"
        className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full bg-[#00875A] hover:bg-[#00744D] text-white shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
      >
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <span className="sr-only">Chat with Chess Coach</span>
      </button>

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] max-h-[85vh] h-[580px] bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 transition-colors">
          {/* Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Grandmaster Coach</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Online · Powered by Gemini
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 dark:bg-[#0B0F17]/60">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-xs'
                      : 'bg-white dark:bg-[#1C2638] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-none shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-[#1C2638] border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-none text-slate-500 dark:text-slate-400 text-xs w-28">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (If history is short) */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto">
              {quickPrompts.map(qp => (
                <button
                  key={qp}
                  onClick={() => {
                    setInput(qp);
                  }}
                  className="whitespace-nowrap px-2.5 py-1 text-[11px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask coach for tips, openings, or analysis..."
              className="flex-1 h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
