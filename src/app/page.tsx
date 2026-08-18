"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Tv, BarChart2, Calendar, Gamepad2, MessageSquare, 
  BookOpen, Sparkles, Settings, Sun, Moon, Palette 
} from 'lucide-react';

import HomeTab from '@/components/HomeTab';
import NewsTab from '@/components/NewsTab';
import MarketTab from '@/components/MarketTab';
import IPTVTab from '@/components/IPTVTab';
import CalendarTab from '@/components/CalendarTab';
import RacerTab from '@/components/RacerTab';
import AIAssistantTab from '@/components/AIAssistantTab';
import KavithaiTab from '@/components/KavithaiTab';

type TabType = 'home' | 'news' | 'market' | 'iptv' | 'calendar' | 'racer' | 'ai' | 'kavithai';

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [accentColor, setAccentColor] = useState<string>('cyan'); // cyan, pink, emerald, purple
  const [showSettings, setShowSettings] = useState(false);

  // Client-side theme bootstrapper
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('pt-theme') as 'light' | 'dark';
      const savedAccent = localStorage.getItem('pt-accent');
      if (savedTheme) setTheme(savedTheme);
      if (savedAccent) setAccentColor(savedAccent);
    }
  }, []);

  // Update root color variables when accent changes
  useEffect(() => {
    const root = document.documentElement;
    if (accentColor === 'pink') {
      root.style.setProperty('--color-cyber-cyan', '#ff007f');
      root.style.setProperty('--color-cyber-pink', '#8b5cf6');
    } else if (accentColor === 'emerald') {
      root.style.setProperty('--color-cyber-cyan', '#10b981');
      root.style.setProperty('--color-cyber-pink', '#06b6d4');
    } else if (accentColor === 'purple') {
      root.style.setProperty('--color-cyber-cyan', '#a855f7');
      root.style.setProperty('--color-cyber-pink', '#ec4899');
    } else {
      // Default Cyan
      root.style.setProperty('--color-cyber-cyan', '#00f0ff');
      root.style.setProperty('--color-cyber-pink', '#ff007f');
    }
    localStorage.setItem('pt-accent', accentColor);
  }, [accentColor]);

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('pt-theme', nextTheme);
    
    // Apply body bg classes accordingly
    const root = document.documentElement;
    if (nextTheme === 'light') {
      root.style.setProperty('--color-bg-dark', '#f8fafc');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    } else {
      root.style.setProperty('--color-bg-dark', '#02040a');
      document.body.style.backgroundColor = '#02040a';
      document.body.style.color = '#f8fafc';
    }
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'news', label: 'News', icon: Sparkles },
    { id: 'market', label: 'Markets', icon: BarChart2 },
    { id: 'iptv', label: 'IPTV', icon: Tv },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'racer', label: 'Arcade', icon: Gamepad2 },
    { id: 'ai', label: 'AI Console', icon: MessageSquare },
    { id: 'kavithai', label: 'Kavithai', icon: BookOpen },
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#02040a] text-slate-100'
    } cyber-grid`}>
      
      {/* Aurora Ambient Background Lights */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 -mt-40 aurora-glow-cyan" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -mt-40 aurora-glow-pink" />

      {/* Header Navigation Navbar */}
      <header className="sticky top-0 z-40 w-full glass-card border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <span className="text-xl">🚀</span>
            <span className="font-extrabold text-lg tracking-wider text-gradient">
              PRAVIN TAMILAN
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Navbar Tabs */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected 
                        ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/25' 
                        : 'text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Quick settings gear controls */}
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="w-9 h-9 rounded-lg border border-zinc-800 bg-zinc-900/60 flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all"
              >
                <Settings className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 p-4 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl space-y-4"
                  >
                    {/* Theme switcher */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Theme</span>
                      <button 
                        onClick={handleThemeToggle}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white"
                      >
                        {theme === 'dark' ? (
                          <><span>Dark Mode</span> <Moon className="w-3.5 h-3.5 text-cyber-cyan" /></>
                        ) : (
                          <><span>Light Mode</span> <Sun className="w-3.5 h-3.5 text-yellow-500" /></>
                        )}
                      </button>
                    </div>

                    {/* Accent Colors List */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block flex items-center gap-1">
                        <Palette className="w-3 h-3" /> Accent Color
                      </span>
                      <div className="flex gap-2.5 justify-center">
                        {['cyan', 'pink', 'emerald', 'purple'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setAccentColor(color)}
                            className={`w-6 h-6 rounded-full transition-transform ${
                              color === 'cyan' ? 'bg-cyan-400' :
                              color === 'pink' ? 'bg-pink-500' :
                              color === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500'
                            } ${accentColor === color ? 'scale-125 border border-white' : 'hover:scale-110'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Portal Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 relative z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full flex justify-center"
          >
            {activeTab === 'home' && <HomeTab onTabChange={(t) => setActiveTab(t as TabType)} />}
            {activeTab === 'news' && <NewsTab />}
            {activeTab === 'market' && <MarketTab />}
            {activeTab === 'iptv' && <IPTVTab />}
            {activeTab === 'calendar' && <CalendarTab />}
            {activeTab === 'racer' && <RacerTab />}
            {activeTab === 'ai' && <AIAssistantTab />}
            {activeTab === 'kavithai' && <KavithaiTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Sticky Footer Navigation Bar */}
      <footer className="lg:hidden sticky bottom-0 z-40 w-full glass-card border-t border-zinc-800 bg-zinc-950/75 backdrop-blur-md">
        <div className="flex justify-around items-center h-16 px-2">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 ${
                  isSelected ? 'text-cyber-cyan scale-110' : 'text-zinc-500 hover:text-zinc-300'
                } transition-all`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-bold tracking-wider">{item.label}</span>
              </button>
            );
          })}
          
          {/* More menu items options dropdown toggle */}
          <button
            onClick={() => setActiveTab(activeTab === 'racer' || activeTab === 'ai' || activeTab === 'kavithai' ? 'home' : 'racer')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 ${
              activeTab === 'racer' || activeTab === 'ai' || activeTab === 'kavithai' 
                ? 'text-cyber-pink scale-110' 
                : 'text-zinc-500'
            } transition-all`}
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wider">Arcade+</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
