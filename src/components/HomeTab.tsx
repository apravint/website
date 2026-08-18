"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Code, BookOpen, Terminal, Sparkles, PhoneCall, ChevronRight } from 'lucide-react';

interface HomeTabProps {
  onTabChange: (tabId: string) => void;
}

export default function HomeTab({ onTabChange }: HomeTabProps) {
  const [localTime, setLocalTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setLocalTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  const skills = [
    { name: 'TypeScript / React', value: 92, color: 'from-cyber-cyan to-blue-500' },
    { name: 'Node.js / Express', value: 88, color: 'from-green-400 to-emerald-600' },
    { name: 'Python / AI Automation', value: 85, color: 'from-yellow-400 to-amber-500' },
    { name: 'Mobile Systems (Termux)', value: 95, color: 'from-cyber-pink to-purple-600' }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
    >
      {/* Profile Bento Card (Col span 2) */}
      <motion.div 
        variants={itemVariants}
        className="md:col-span-2 p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between min-h-[220px]"
      >
        <div className="aurora-glow-cyan top-0 right-0 -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/20 text-xs font-semibold text-cyber-cyan mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Web Developer & System Tinkerer
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Pravin <span className="text-gradient">Tamilan</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-md leading-relaxed">
            Building premium next-generation websites, automating mobile workflows in Termux, and exploring AI-assisted application compilation.
          </p>
        </div>

        <div className="flex gap-4 mt-6 z-10">
          <a 
            href="https://github.com/apravint" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg> GitHub Profile
          </a>
          <button 
            onClick={() => onTabChange('ai')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-cyber-cyan to-blue-600 hover:opacity-90 text-zinc-950 transition-opacity"
          >
            <span>Consult AI</span> <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Clock widget bento (Col span 1) */}
      <motion.div 
        variants={itemVariants}
        className="p-6 rounded-2xl glass-card flex flex-col justify-between items-center text-center min-h-[220px] relative overflow-hidden"
      >
        <div className="aurora-glow-pink bottom-0 left-0 -ml-16 -mb-16" />
        <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">SYSTEM TIME</div>
        <div className="text-3xl md:text-4xl font-black text-gradient font-mono my-auto tracking-widest">
          {localTime || '00:00:00'}
        </div>
        <div className="text-xs text-zinc-400 font-semibold mb-2">Termux Host Node</div>
      </motion.div>

      {/* Technical Skill Bento Card (Col span 1) */}
      <motion.div 
        variants={itemVariants}
        className="p-6 rounded-2xl glass-card flex flex-col justify-between"
      >
        <div>
          <div className="w-10 h-10 rounded-xl bg-cyber-pink/10 border border-cyber-pink/20 flex items-center justify-center text-cyber-pink mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Core Tech Stack</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            Primary focus on building responsive frontends and resilient backend automation networks.
          </p>
        </div>

        <div className="space-y-3.5">
          {skills.map((skill, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-400">{skill.name}</span>
                <span className="text-white">{skill.value}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/40">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                  style={{ width: `${skill.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Play Arcade Promo (Col span 2) */}
      <motion.div 
        variants={itemVariants}
        className="md:col-span-2 p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="flex-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 mb-3">
            🕹️ ARCADE CABINET
          </span>
          <h3 className="text-xl font-bold text-white mb-2">Play Neon Road Racer</h3>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-md">
            Ride on an endless synthwave highway track, steer to dodge obstacles, and activate nitro boosts. Programmatic graphics and audio context loops.
          </p>
          <button 
            onClick={() => onTabChange('racer')}
            className="mt-4 px-5 py-2.5 rounded-lg text-xs font-bold bg-cyber-pink hover:bg-cyber-pink/90 text-white shadow-lg shadow-cyber-pink/20 transition-all flex items-center gap-1.5"
          >
            Launch Racer Game 🏍️
          </button>
        </div>

        <div className="w-32 h-32 flex items-center justify-center rounded-2xl bg-zinc-900/60 border border-zinc-800 relative">
          <span className="text-5xl animate-bounce">🏍️</span>
          <div className="absolute inset-0 border border-cyber-cyan/10 rounded-2xl animate-pulse" />
        </div>
      </motion.div>

      {/* Literature & Tools Bento Section */}
      <motion.div 
        variants={itemVariants}
        className="md:col-span-3 p-6 rounded-2xl glass-card"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-cyber-cyan" /> Quick Access Services
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
          <button 
            onClick={() => onTabChange('news')}
            className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-cyber-cyan/30 text-center transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📰</div>
            <span className="text-xs font-bold text-zinc-300 block">News Hub</span>
          </button>

          <button 
            onClick={() => onTabChange('market')}
            className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-cyber-cyan/30 text-center transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📈</div>
            <span className="text-xs font-bold text-zinc-300 block">Markets</span>
          </button>

          <button 
            onClick={() => onTabChange('iptv')}
            className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-cyber-cyan/30 text-center transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📺</div>
            <span className="text-xs font-bold text-zinc-300 block">IPTV</span>
          </button>

          <button 
            onClick={() => onTabChange('calendar')}
            className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-cyber-cyan/30 text-center transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📅</div>
            <span className="text-xs font-bold text-zinc-300 block">Tamil Calendar</span>
          </button>

          <button 
            onClick={() => onTabChange('thirukkural')}
            className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-cyber-cyan/30 text-center transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📖</div>
            <span className="text-xs font-bold text-zinc-300 block">Thirukkural</span>
          </button>

          <button 
            onClick={() => onTabChange('kavithai')}
            className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-cyber-cyan/30 text-center transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">✍️</div>
            <span className="text-xs font-bold text-zinc-300 block">Kavithai</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
