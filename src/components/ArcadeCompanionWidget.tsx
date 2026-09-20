"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Sparkles, Volume2, Shield, Zap } from 'lucide-react';

interface ArcadeCompanionProps {
  gameName: string;
}

export default function ArcadeCompanionWidget({ gameName }: ArcadeCompanionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    {
      role: 'ai',
      text: `👾 **Cyber Boss AI**: I am your local AI companion for **${gameName}**! Ask me for strategy guides, cheat codes, or gameplay tips.`
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isTyping) return;

    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    // Query Ollama / local endpoint or generate game assistant advice
    try {
      const res = await fetch('http://localhost:11434/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          messages: [
            { role: 'system', content: `You are the Cyber Arcade AI Companion for the game ${gameName}. Give brief, witty, high-energy gaming advice in under 3 sentences.` },
            { role: 'user', content: userText }
          ],
          stream: false,
          temperature: 0.8
        }),
        signal: AbortSignal.timeout(3500)
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || 'Keep your focus on the track!';
        setMessages(prev => [...prev, { role: 'ai', text: reply }]);
      } else {
        throw new Error('Offline fallback');
      }
    } catch (err) {
      // Intelligent game fallback responses
      setTimeout(() => {
        let fallbackReply = '';
        const q = userText.toLowerCase();
        if (q.includes('cheat') || q.includes('code')) {
          fallbackReply = "⚡ **CHEAT CODES DETECTED**: Press Nitro boost right before turning to trigger maximum drift multiplier!";
        } else if (q.includes('pong') || q.includes('paddle')) {
          fallbackReply = "🏓 **PONG STRATEGY**: Aim for the top or bottom wall corners to create sharp rebound angles that outsmart the AI!";
        } else if (q.includes('racer') || q.includes('car')) {
          fallbackReply = "🏎️ **RACER TIP**: Save your Nitro meter for straight highway stretches to reach top speed of 280 km/h!";
        } else {
          fallbackReply = `🎮 Strategy locked for "${userText}". Focus on timing your moves to achieve peak high scores!`;
        }
        setMessages(prev => [...prev, { role: 'ai', text: fallbackReply }]);
      }, 500);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-3 rounded-full bg-gradient-to-r from-cyber-cyan via-blue-600 to-cyber-pink text-zinc-950 font-black text-xs flex items-center gap-2 shadow-2xl shadow-cyber-cyan/40 hover:scale-110 active:scale-95 transition-all border border-cyber-cyan/50"
        >
          <Bot className="w-5 h-5 animate-bounce" />
          <span>AI GAME ASSISTANT</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 h-[420px] rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-cyber-cyan font-bold">
              <Bot className="w-4 h-4" />
              <span>ARCADE COMPANION</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-2.5 rounded-xl ${
                    m.role === 'user'
                      ? 'bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan rounded-tr-none'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-zinc-500 text-[10px] animate-pulse flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyber-cyan animate-spin" /> AI analyzing match state...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 border-t border-zinc-900 bg-zinc-900/40 flex gap-1.5 overflow-x-auto scrollbar-none">
            {['🎮 Strategy Tip', '⚡ Cheat Codes', '🏆 Beat High Score'].map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(prompt);
                }}
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 hover:text-white whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2 border-t border-zinc-800 bg-zinc-900 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask AI assistant..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-cyber-cyan"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-cyber-cyan text-zinc-950 font-bold hover:opacity-90"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
