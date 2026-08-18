"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Quote, Sparkles } from 'lucide-react';

interface Meaning {
  ta_mu_va: string;
  ta_salamon: string;
  ta_kalaignar: string;
  en: string;
}

interface Kural {
  number: number;
  chapter: string;
  section: string;
  kural: string[];
  meaning: Meaning;
}

export default function ThirukkuralTab() {
  const [kurals, setKurals] = useState<Kural[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');
  const [meaningAuthor, setMeaningAuthor] = useState<'ta_mu_va' | 'ta_salamon' | 'ta_kalaignar' | 'en'>('ta_mu_va');
  const [dailyKural, setDailyKural] = useState<Kural | null>(null);

  // Fetch Kural records on mount
  useEffect(() => {
    fetch('/assets/thirukkural.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.kurals) {
          setKurals(data.kurals);
          
          // Generate Kural of the Day based on calendar day
          const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
          const dailyIndex = (dayOfYear % data.kurals.length) || 0;
          setDailyKural(data.kurals[dailyIndex]);
        }
      })
      .catch(err => console.error("Failed to load Kural database:", err));
  }, []);

  const sections = ['All', 'அறத்துப்பால்', 'பொருட்பால்', 'காமத்துப்பால்'];

  const filteredKurals = kurals.filter(k => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      k.number.toString() === query ||
      k.chapter.toLowerCase().includes(query) ||
      k.kural.some(line => line.includes(query));
    
    const matchesSection = selectedSection === 'All' || k.section === selectedSection;
    return matchesSearch && matchesSection;
  }).slice(0, 15); // Limit to top 15 results for performance

  return (
    <div className="w-full max-w-5xl space-y-6">
      
      {/* Daily Featured Kural */}
      {dailyKural && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl glass-card border-cyber-cyan/20 bg-cyber-cyan/5 relative overflow-hidden"
        >
          <div className="aurora-glow-cyan top-0 right-0 -mr-16 -mt-16 opacity-30" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/20 text-[10px] font-bold text-cyber-cyan w-fit mb-4">
            <Sparkles className="w-3 h-3" /> திருக்குறள் தினம் (Kural of the Day)
          </div>

          <div className="my-4 text-center">
            <Quote className="w-8 h-8 text-cyber-cyan/20 mx-auto mb-2" />
            <p className="text-lg md:text-xl font-bold text-white leading-relaxed mb-2 font-sans">
              {dailyKural.kural[0]}
            </p>
            <p className="text-lg md:text-xl font-bold text-white leading-relaxed font-sans">
              {dailyKural.kural[1]}
            </p>
            <span className="text-xs text-zinc-500 font-bold block mt-3">
              குறள் {dailyKural.number} | அதிகாரம்: {dailyKural.chapter} | பால்: {dailyKural.section}
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/40">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Meaning:</span>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              {dailyKural.meaning[meaningAuthor]}
            </p>
          </div>
        </motion.div>
      )}

      {/* Search Console & Commentator Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search by Kural number or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-zinc-950 border border-zinc-800 focus:border-cyber-cyan/50 focus:outline-none text-white"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {sections.map((sec, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedSection === sec 
                  ? 'bg-cyber-cyan text-zinc-950 shadow-[0_0_12px_rgba(0,240,255,0.25)]' 
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Commentary Selector & Kurals List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Commentator Selection Sidebar (Col span 1) */}
        <div className="p-6 rounded-2xl glass-card h-fit space-y-4">
          <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-cyber-pink" /> Commentator
          </h4>
          
          <div className="flex flex-col gap-2">
            {[
              { id: 'ta_mu_va', label: 'மு. வரதராசனார் (M.V.)' },
              { id: 'ta_salamon', label: 'சாலமன் பாப்பையா (Salomon)' },
              { id: 'ta_kalaignar', label: 'கலைஞர் மு.க (Kalaignar)' },
              { id: 'en', label: 'English Translation' }
            ].map((auth) => (
              <button
                key={auth.id}
                onClick={() => setMeaningAuthor(auth.id as any)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  meaningAuthor === auth.id
                    ? 'bg-cyber-pink/15 border-cyber-pink text-white shadow-md'
                    : 'bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {auth.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Kural Results (Col span 3) */}
        <div className="lg:col-span-3 space-y-4">
          {filteredKurals.map((k) => (
            <motion.div
              key={k.number}
              layout
              className="p-5 rounded-2xl glass-card hover:border-cyber-cyan/20 transition-all space-y-4"
            >
              <div className="flex justify-between items-center border-b border-zinc-800/40 pb-2">
                <span className="text-xs font-extrabold text-cyber-cyan bg-cyber-cyan/10 px-2.5 py-0.5 rounded-full">
                  குறள் {k.number}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  {k.chapter} | {k.section}
                </span>
              </div>

              <div className="font-sans font-bold text-white text-base leading-relaxed pl-2">
                <p>{k.kural[0]}</p>
                <p>{k.kural[1]}</p>
              </div>

              <div className="pt-2 border-t border-zinc-850">
                <span className="text-[9px] text-zinc-600 font-extrabold uppercase tracking-wider block mb-1">Meaning:</span>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {k.meaning[meaningAuthor]}
                </p>
              </div>
            </motion.div>
          ))}

          {filteredKurals.length === 0 && (
            <div className="py-12 text-center text-zinc-500 font-semibold">
              {kurals.length === 0 ? "Loading Kural database..." : "No Kurals match your criteria."}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
