"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Bot, Sparkles, BarChart2, Tv, BookOpen, Calendar, Home
} from 'lucide-react';

import RacerTab from '@/components/RacerTab';
import AIAssistantTab from '@/components/AIAssistantTab';
import NewsTab from '@/components/NewsTab';
import MarketTab from '@/components/MarketTab';
import IPTVTab from '@/components/IPTVTab';
import ThirukkuralTab from '@/components/ThirukkuralTab';

type TabType = 'ai' | 'racer' | 'news' | 'market' | 'iptv' | 'thirukkural';

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabType>('ai');

  const menuItems = [
    { id: 'ai', label: 'Local LLM AI', icon: Bot, color: 'text-cyber-cyan' },
    { id: 'racer', label: '3D Arcade', icon: Gamepad2, color: 'text-cyber-pink' },
    { id: 'news', label: 'News', icon: Sparkles, color: 'text-amber-400' },
    { id: 'market', label: 'Markets', icon: BarChart2, color: 'text-emerald-400' },
    { id: 'iptv', label: 'IPTV', icon: Tv, color: 'text-purple-400' },
    { id: 'thirukkural', label: 'Thirukkural', icon: BookOpen, color: 'text-blue-400' },
  ];

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 flex flex-col items-center cyber-grid selection:bg-cyber-cyan selection:text-black">
      
      {/* Top Header Navigation Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('ai')}>
            <span className="text-xl">🚀</span>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm md:text-base tracking-wider text-gradient">
                PRAVIN TAMILAN PORTAL
              </span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-mono">
                LOCAL LLM & 3D ARCADE
              </span>
            </div>
          </div>

          {/* Navigation Bar Buttons */}
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected 
                      ? 'bg-zinc-900 text-white border border-zinc-700 shadow-md scale-105' 
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Tab Portal View */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-6 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className="w-full flex justify-center"
          >
            {activeTab === 'ai' && <AIAssistantTab />}
            {activeTab === 'racer' && <RacerTab />}
            {activeTab === 'news' && <NewsTab />}
            {activeTab === 'market' && <MarketTab />}
            {activeTab === 'iptv' && <IPTVTab />}
            {activeTab === 'thirukkural' && <ThirukkuralTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}


