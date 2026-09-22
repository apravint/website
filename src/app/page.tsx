"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Bot, Tv, BookOpen, Calendar as CalendarIcon, Feather, Home, ScanEye, Shield, Flag
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
    { id: 'godseye', label: "God's Eye View", icon: ScanEye, color: 'text-cyan-400' },
    { id: 'ai', label: 'Local LLM AI', icon: Bot, color: 'text-emerald-400' },
    { id: 'arcade', label: '3D Arcade', icon: Gamepad2, color: 'text-pink-400' },
    { id: 'iptv', label: 'Live IPTV', icon: Tv, color: 'text-purple-400' },
    { id: 'thirukkural', label: 'Thirukkural', icon: BookOpen, color: 'text-blue-400' },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, color: 'text-amber-400' },
    { id: 'kavithai', label: 'Kavithai', icon: Feather, color: 'text-rose-400' },
    { id: 'home', label: 'Home Hub', icon: Home, color: 'text-slate-400' },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col items-center selection:bg-cyan-500 selection:text-black">
      
      {/* Top Header Navigation Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md shadow-xl">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('godseye')}>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm md:text-base tracking-wider text-slate-100">
                PRAVIN TAMILAN <span className="text-cyan-400 font-mono text-xs font-normal">SYSTEMS</span>
              </span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest font-mono">
                SPATIAL INTELLIGENCE & ENTERPRISE PORTAL
              </span>
            </div>
          </div>

          {/* Navigation Bar Buttons */}
          <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isSelected 
                      ? 'bg-slate-900 text-white border border-slate-700 shadow-md scale-[1.02]' 
                      : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Tab Portal View */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto p-2 sm:p-6 pb-20 md:pb-6 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="w-full flex flex-col items-center justify-center"
          >
            {activeTab === 'godseye' && <GodsEyeViewTab />}
            {activeTab === 'home' && <HomeTab onTabChange={(tab) => setActiveTab(tab as TabType)} />}
            {activeTab === 'ai' && <AIAssistantTab />}

            {activeTab === 'arcade' && (
              <div className="w-full flex flex-col items-center gap-4">
                {/* Arcade Game Selector Sub-Header */}
                <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-lg font-mono">
                  <button
                    onClick={() => setArcadeGame('racer')}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      arcadeGame === 'racer'
                        ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Flag className="w-4 h-4" /> 3D CYBER RACER
                  </button>
                  <button
                    onClick={() => setArcadeGame('pong')}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      arcadeGame === 'pong'
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4" /> 3D NEON PONG
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
