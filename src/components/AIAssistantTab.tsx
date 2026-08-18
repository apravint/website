"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Cpu, Trash2 } from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export default function AIAssistantTab() {
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: "SYSTEM SHIELD LOADED. Hello! I am your Termux-integrated assistant. Ask me anything about node compilation, Linux environments, or general utilities.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: inputVal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulated response delay
    setTimeout(() => {
      let replyText = "Query indexed. ";
      const txt = userMsg.text.toLowerCase();

      if (txt.includes('help') || txt.includes('command')) {
        replyText += "Available shell categories include: 'status' to review server metrics, 'compilation' to inspect static directories, and 'git' for source control.";
      } else if (txt.includes('linux') || txt.includes('termux')) {
        replyText += "This environment leverages Termux packages. Make sure you utilize 'pkg update && pkg upgrade' to pull down compiled C/C++ security assets.";
      } else if (txt.includes('racer') || txt.includes('game')) {
        replyText += "The Neon Road Racer game relies on canvas rendering and Web Audio oscillators. Keep steering to avoid AI drift loops!";
      } else {
        replyText += "I've logged your request into the local system queue. I am processing it offline.";
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: "System logs flushed. Terminal reset complete.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-hidden shadow-xl flex flex-col h-[520px] glass-card">
      
      {/* Console Header */}
      <div className="flex justify-between items-center p-4 border-b border-zinc-900 bg-zinc-900/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
          </div>
          <span className="text-xs text-zinc-500 font-bold ml-2 font-mono flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" /> bash - guest@pravintamilan.com
          </span>
        </div>

        <button 
          onClick={handleClear}
          className="text-zinc-600 hover:text-red-400 hover:scale-105 transition-all p-1"
          title="Clear Terminal Logs"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Message Output Logs */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 font-mono text-xs md:text-sm select-text scrollbar-thin">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[85%] rounded-xl px-4 py-2.5 leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-cyber-cyan/10 border border-cyber-cyan/25 text-cyber-cyan rounded-tr-none'
                : 'bg-zinc-900/60 border border-zinc-800 text-zinc-300 rounded-tl-none'
            }`}>
              {msg.sender === 'bot' && <span className="text-cyber-pink mr-1 font-bold">$</span>}
              {msg.text}
            </div>
            <span className="text-[9px] text-zinc-600 font-bold mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold font-mono">
            <Cpu className="w-4 h-4 animate-spin text-cyber-pink" /> Processing pipeline query...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Form Console */}
      <form 
        onSubmit={handleSend}
        className="p-4 border-t border-zinc-900 bg-zinc-900/20 flex gap-3"
      >
        <input 
          type="text" 
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Enter shell inquiry... (e.g. 'help', 'game')"
          className="flex-1 px-4 py-2.5 rounded-lg bg-black border border-zinc-800 focus:border-cyber-cyan/40 focus:outline-none text-white text-xs md:text-sm font-mono placeholder:text-zinc-700"
        />
        <button 
          type="submit"
          className="px-4 py-2.5 rounded-lg bg-cyber-cyan text-zinc-950 hover:opacity-90 font-bold text-xs flex items-center justify-center transition-opacity"
        >
          <Send className="w-4 h-4 fill-zinc-950" />
        </button>
      </form>
    </div>
  );
}
