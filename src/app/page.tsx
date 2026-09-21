"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Bot, Tv, BookOpen, Calendar as CalendarIcon, Feather, Home, Radar
} from 'lucide-react';

import HomeTab from '@/components/HomeTab';
import RacerTab from '@/components/RacerTab';
import CyberPongTab from '@/components/CyberPongTab';
import AIAssistantTab from '@/components/AIAssistantTab';
import IPTVTab from '@/components/IPTVTab';
import ThirukkuralTab from '@/components/ThirukkuralTab';
import CalendarTab from '@/components/CalendarTab';
import KavithaiTab from '@/components/KavithaiTab';
import GodsEyeViewTab from '@/components/GodsEyeViewTab';
import ArcadeCompanionWidget from '@/components/ArcadeCompanionWidget';

type TabType = 'godseye' | 'ai' | 'arcade' | 'iptv' | 'thirukkural' | 'calendar' | 'kavithai' | 'home';
type ArcadeGameType = 'racer' | 'pong';

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabType>('godseye');
  const [arcadeGame, setArcadeGame] = useState<ArcadeGameType>('racer');

  const menuItems = [
    { id: 'godseye', label: "God's Eye View", icon: Radar, color: 'text-cyber-cyan' },
    { id: 'ai', label: 'Local LLM AI', icon: Bot, color: 'text-emerald-400' },
    { id: 'arcade', label: '3D Arcade', icon: Gamepad2, color: 'text-cyber-pink' },
    { id: 'iptv', label: 'Live IPTV', icon: Tv, color: 'text-purple-400' },
    { id: 'thirukkural', label: 'Thirukkural', icon: BookOpen, color: 'text-blue-400' },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, color: 'text-amber-400' },
    { id: 'kavithai', label: 'Kavithai', icon: Feather, color: 'text-rose-400' },
    { id: 'home', label: 'Home Hub', icon: Home, color: 'text-zinc-400' },
  ];

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 flex flex-col items-center cyber-grid selection:bg-cyber-cyan selection:text-black">
      
      {/* Top Header Navigation Navbar (Full Screen Width) */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md shadow-2xl">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('ai')}>
            <span className="text-xl">🚀</span>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm md:text-base tracking-wider text-gradient">
                PRAVIN TAMILAN PORTAL
              </span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-mono">
                FULLSCREEN LOCAL LLM & IPTV PORTAL
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
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected 
                      ? 'bg-zinc-900 text-white border border-zinc-700 shadow-lg scale-105' 
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

      {/* Main Tab Portal View - Expanded to Full Screen max-w-[1700px] */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto p-2 sm:p-6 pb-20 md:pb-6 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className="w-full flex flex-col items-center justify-center"
          >
            {activeTab === 'godseye' && <GodsEyeViewTab />}
            {activeTab === 'home' && <HomeTab onTabChange={(tab) => setActiveTab(tab as TabType)} />}
            {activeTab === 'ai' && <AIAssistantTab />}

            {activeTab === 'arcade' && (
              <div className="w-full flex flex-col items-center gap-4">
                {/* Arcade Game Selector Sub-Header */}
                <div className="flex items-center gap-2 bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800 shadow-lg font-mono">
                  <button
                    onClick={() => setArcadeGame('racer')}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                      arcadeGame === 'racer'
                        ? 'bg-cyber-pink text-white shadow-lg shadow-cyber-pink/30 scale-105'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    🏎️ 3D CYBER RACER
                  </button>
                  <button
                    onClick={() => setArcadeGame('pong')}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                      arcadeGame === 'pong'
                        ? 'bg-cyber-cyan text-zinc-950 shadow-lg shadow-cyber-cyan/30 scale-105'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    🏓 3D NEON PONG
                  </button>
                </div>

                {/* Selected Game View */}
                {arcadeGame === 'racer' && <RacerTab />}
                {arcadeGame === 'pong' && <CyberPongTab />}

                {/* In-Game AI Companion Floating Widget */}
                <ArcadeCompanionWidget gameName={arcadeGame === 'racer' ? '3D Cyber Racer' : '3D Neon Cyber Pong'} />
              </div>
            )}

            {activeTab === 'iptv' && <IPTVTab />}
            {activeTab === 'thirukkural' && <ThirukkuralTab />}
            {activeTab === 'calendar' && <CalendarTab />}
            {activeTab === 'kavithai' && <KavithaiTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-md flex justify-around items-center p-1.5 md:hidden">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all ${
                isSelected ? 'text-cyber-cyan scale-105 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-cyber-cyan' : item.color}`} />
              <span className="text-[9px] tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </footer>
    </div>
  );
}
