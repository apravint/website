"use client";

import React, { useState } from 'react';
import { Sparkles, Heart, Share2 } from 'lucide-react';

interface Poem {
  id: number;
  title: string;
  englishTitle: string;
  verses: string[];
  likes: number;
}

export default function KavithaiTab() {
  const [poems, setPoems] = useState<Poem[]>([
    {
      id: 1,
      title: "விடியல் வரையும் வரைபடம்",
      englishTitle: "Map of the Sunrise",
      verses: [
        "இருளின் மடியில் உறங்கும் உலகம்,",
        "வெளிச்சக் கீற்றால் விழித்துக் கொள்ளும்.",
        "விடியலின் அழகில் உறையும் பனித்துளி,",
        "புன்னகை சிந்திப் புவிக்குத் திரும்பும்.",
        "கனவுகள் யாவும் நிஜமாய் மாறும்,",
        "நம்பிக்கை கொண்டால் விடியல் தூரம் இல்லை!"
      ],
      likes: 24
    },
    {
      id: 2,
      title: "வாழ்க்கை ஒரு பயணம்",
      englishTitle: "Life is a Journey",
      verses: [
        "கரடு முரடான பாதைகள் வரலாம்,",
        "சோர்ந்து போகாமல் நடப்பதே அழகு.",
        "விழுந்தால் எழுந்திடு ஒரு புயல் போல,",
        "வெற்றி உன் கையில் விடைபெறாது.",
        "நாளை நமதே என்ற முழக்கத்தோடு,",
        "தொடரட்டும் உன் வீரப் பயணம்!"
      ],
      likes: 18
    }
  ]);

  const handleLike = (id: number) => {
    setPoems(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
          ✍️ தமிழ் கவிதைகள் <span className="text-gradient">| Kavithai</span>
        </h3>
        <p className="text-xs text-zinc-500 mt-2">
          A collection of modern Tamil poetry celebrating resilience, hope, and the journey of life.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {poems.map((poem) => (
          <div key={poem.id} className="p-6 rounded-2xl glass-card flex flex-col justify-between relative overflow-hidden group">
            <div className="aurora-glow-pink top-0 right-0 -mr-20 -mt-20 opacity-30" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-extrabold text-white group-hover:text-cyber-cyan transition-colors">
                    {poem.title}
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mt-0.5">
                    {poem.englishTitle}
                  </span>
                </div>
                <Sparkles className="w-4 h-4 text-cyber-cyan animate-pulse" />
              </div>

              {/* Verses representation */}
              <div className="space-y-2.5 my-6 text-sm text-zinc-300 leading-relaxed font-sans font-medium">
                {poem.verses.map((verse, idx) => (
                  <p key={idx}>{verse}</p>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-zinc-900 pt-4 mt-2 z-10">
              <button 
                onClick={() => handleLike(poem.id)}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-red-400 hover:scale-105 transition-all"
              >
                <Heart className="w-4 h-4 fill-none hover:fill-red-400" /> Likes ({poem.likes})
              </button>

              <button className="flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-cyber-cyan hover:scale-105 transition-all">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
