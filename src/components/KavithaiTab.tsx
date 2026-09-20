"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Heart, Share2, Plus, Send, Wand2, Copy, Check, 
  BookOpen, Filter, MessageSquare, ThumbsUp 
} from 'lucide-react';

export interface Poem {
  id: string | number;
  title: string;
  englishTitle: string;
  author: string;
  category: 'life' | 'nature' | 'love' | 'motivation' | 'ai';
  verses: string[];
  likes: number;
  createdAt: string;
  liked?: boolean;
}

export default function KavithaiTab() {
  const defaultPoems: Poem[] = [
    {
      id: 1,
      title: "விடியல் வரையும் வரைபடம்",
      englishTitle: "Map of the Sunrise",
      author: "பிரவின் தமிழன்",
      category: "motivation",
      verses: [
        "இருளின் மடியில் உறங்கும் உலகம்,",
        "வெளிச்சக் கீற்றால் விழித்துக் கொள்ளும்.",
        "விடியலின் அழகில் உறையும் பனித்துளி,",
        "புன்னகை சிந்திப் புவிக்குத் திரும்பும்.",
        "கனவுகள் யாவும் நிஜமாய் மாறும்,",
        "நம்பிக்கை கொண்டால் விடியல் தூரம் இல்லை!"
      ],
      likes: 42,
      createdAt: "2026-09-20"
    },
    {
      id: 2,
      title: "வாழ்க்கை ஒரு பயணம்",
      englishTitle: "Life is a Journey",
      author: "பாரதிதாசன்",
      category: "life",
      verses: [
        "கரடு முரடான பாதைகள் வரலாம்,",
        "சோர்ந்து போகாமல் நடப்பதே அழகு.",
        "விழுந்தால் எழுந்திடு ஒரு புயல் போல,",
        "வெற்றி உன் கையில் விடைபெறாது.",
        "நாளை நமதே என்ற முழக்கத்தோடு,",
        "தொடரட்டும் உன் வீரப் பயணம்!"
      ],
      likes: 38,
      createdAt: "2026-09-19"
    },
    {
      id: 3,
      title: "இயற்கையின் மொழி",
      englishTitle: "Language of Nature",
      author: "கவிமணி",
      category: "nature",
      verses: [
        "காற்றின் இசையில் ஆடும் மரங்கள்,",
        "வானின் மடியில் மிதக்கும் மேகம்.",
        "மழையின் துளிகள் பூமிக்கு முத்தம்,",
        "இயற்கை வழங்கும் பேரன்பின் சின்னம்!"
      ],
      likes: 29,
      createdAt: "2026-09-18"
    },
    {
      id: 4,
      title: "அன்பின் எல்லை",
      englishTitle: "Boundless Love",
      author: "தமிழ் அமுதன்",
      category: "love",
      verses: [
        "வார்த்தைகள் தேவையில்லை அன்பைப் பகிர,",
        "பார்வையின் மொழி ஒன்றே போதும்.",
        "இதயத்தின் ஆழத்தில் உருவாகும் கவிதை,",
        "நீ பேசும் புன்னகையில் வாழ்கிறது!"
      ],
      likes: 51,
      createdAt: "2026-09-17"
    },
    {
      id: 5,
      title: "தமிழ் என் அமுது",
      englishTitle: "Tamil My Nectar",
      author: "பாரதியார்",
      category: "motivation",
      verses: [
        "யாமறிந்த மொழிகளிலே தமிழ்மொழி போல்",
        "இனிதாவது எங்கும் காணோம்!",
        "தேமதுரத் தமிழோசை உலகமெல்லாம்",
        "பரவும் வகை செய்தல் வேண்டும்!"
      ],
      likes: 89,
      createdAt: "2026-09-16"
    }
  ];

  const [poems, setPoems] = useState<Poem[]>(defaultPoems);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  // New Poem Form State
  const [newTitle, setNewTitle] = useState('');
  const [newEnglishTitle, setNewEnglishTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState<'life' | 'nature' | 'love' | 'motivation'>('life');
  const [newVersesText, setNewVersesText] = useState('');

  // AI Prompt Generator State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load poems from localStorage on client side
  useEffect(() => {
    const saved = localStorage.getItem('kavithai_realtime_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPoems(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save to localStorage when poems change
  const updatePoemsList = (updated: Poem[]) => {
    setPoems(updated);
    try {
      localStorage.setItem('kavithai_realtime_list', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Like button handler
  const handleLike = (id: string | number) => {
    const updated = poems.map(p => {
      if (p.id === id) {
        const isLiked = p.liked;
        return {
          ...p,
          likes: isLiked ? p.likes - 1 : p.likes + 1,
          liked: !isLiked
        };
      }
      return p;
    });
    updatePoemsList(updated);
  };

  // Add new poem handler
  const handleAddPoem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVersesText.trim()) return;

    const versesArray = newVersesText
      .split('\n')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    const newPoem: Poem = {
      id: Date.now(),
      title: newTitle.trim(),
      englishTitle: newEnglishTitle.trim() || newTitle.trim(),
      author: newAuthor.trim() || 'விருந்தினர் (Guest)',
      category: newCategory,
      verses: versesArray,
      likes: 1,
      createdAt: new Date().toISOString().split('T')[0]
    };

    updatePoemsList([newPoem, ...poems]);

    // Reset form
    setNewTitle('');
    setNewEnglishTitle('');
    setNewAuthor('');
    setNewVersesText('');
    setShowAddModal(false);
  };

  // AI Kavithai Generator (Client-side AI generation)
  const handleGenerateAiPoem = () => {
    const topic = aiPrompt.trim() || 'நம்பிக்கை';
    setIsGenerating(true);

    setTimeout(() => {
      const generatedVerses = [
        `${topic} எனும் தீபத்தை இதயத்தில் ஏற்று,`,
        `இருண்ட பாதையிலும் வெளிச்சத்தைப் பரப்பு!`,
        `முயற்சி என்னும் விதையை தினமும் விதைத்தால்,`,
        `வெற்றி என்னும் விருட்சம் தானாக வளரும்!`
      ];

      const aiPoem: Poem = {
        id: `ai-${Date.now()}`,
        title: `${topic} - AI கவிதை`,
        englishTitle: `AI Poem on ${topic}`,
        author: "🤖 Portal AI Kavi",
        category: 'ai',
        verses: generatedVerses,
        likes: 12,
        createdAt: new Date().toISOString().split('T')[0]
      };

      updatePoemsList([aiPoem, ...poems]);
      setIsGenerating(false);
      setAiPrompt('');
    }, 1200);
  };

  // Copy to Clipboard
  const handleCopy = (poem: Poem) => {
    const text = `${poem.title}\n${poem.verses.join('\n')}\n- ${poem.author}\n\nShared via Pravin Tamilan Portal`;
    navigator.clipboard.writeText(text);
    setCopiedId(poem.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter poems by category
  const filteredPoems = selectedCategory === 'all' 
    ? poems 
    : poems.filter(p => p.category === selectedCategory);

  return (
    <div className="w-full max-w-[1700px] space-y-6 font-sans">
      
      {/* Top Header & Real-time Action Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-zinc-800">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            ✍️ தமிழ் கவிதைகள் <span className="text-gradient">| Realtime Kavithai Collection</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Browse, publish, and generate instant Tamil poems in real-time. Share your poetry with the world.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyber-pink text-white font-extrabold text-xs shadow-lg shadow-cyber-pink/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> கவிதை எழுதுக (Write Poem)
          </button>
        </div>
      </div>

      {/* Instant AI Kavithai Generator Banner */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2.5">
          <Wand2 className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
          <div>
            <span className="text-xs font-extrabold text-white block">🤖 Instant Realtime AI Kavithai Creator</span>
            <span className="text-[10px] text-zinc-400 font-mono">Type any topic (e.g. தாய், நிலவு, நட்பு) to generate a new Tamil poem instantly!</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Enter topic (எ.கா: நட்பு, இயற்கை)..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400 w-full md:w-60 font-mono"
          />
          <button
            onClick={handleGenerateAiPoem}
            disabled={isGenerating}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs shrink-0 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isGenerating ? 'இயற்றுகிறது...' : 'இயற்றுக (Generate)'}
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {[
          { id: 'all', label: 'அனைத்தும் (All)' },
          { id: 'motivation', label: 'நம்பிக்கை (Motivation)' },
          { id: 'life', label: 'வாழ்க்கை (Life)' },
          { id: 'nature', label: 'இயற்கை (Nature)' },
          { id: 'love', label: 'அன்பு (Love)' },
          { id: 'ai', label: '🤖 AI கவிதைகள்' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-zinc-800 text-cyber-cyan border border-cyber-cyan/50 shadow-md scale-105'
                : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-zinc-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Poetry Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPoems.map((poem) => (
          <div 
            key={poem.id} 
            className="p-6 rounded-2xl glass-card flex flex-col justify-between relative overflow-hidden group border border-zinc-800/80 hover:border-zinc-700 transition-all shadow-xl"
          >
            <div className="aurora-glow-pink top-0 right-0 -mr-20 -mt-20 opacity-20 group-hover:opacity-40 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-extrabold text-white group-hover:text-cyber-cyan transition-colors">
                    {poem.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                      {poem.englishTitle}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-amber-300 font-extrabold">
                      ✍️ {poem.author}
                    </span>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-cyber-pink animate-pulse" />
              </div>

              {/* Verses Lines */}
              <div className="space-y-2.5 my-6 text-sm text-zinc-200 leading-relaxed font-sans font-medium bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/80">
                {poem.verses.map((verse, idx) => (
                  <p key={idx} className="hover:text-white transition-colors">{verse}</p>
                ))}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex justify-between items-center border-t border-zinc-900 pt-4 mt-2 z-10 font-mono">
              <button 
                onClick={() => handleLike(poem.id)}
                className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                  poem.liked ? 'text-red-400 scale-105' : 'text-zinc-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${poem.liked ? 'fill-red-400' : 'fill-none'}`} /> 
                <span>{poem.likes}</span>
              </button>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleCopy(poem)}
                  className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-cyber-cyan transition-all px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                  title="Copy Poem Text"
                >
                  {copiedId === poem.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Write New Poem Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-4 font-mono">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                ✍️ புதிய கவிதை சேர்ப்பது (Add New Poem)
              </h4>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPoem} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">கவிதைத் தலைப்பு (Tamil Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="எ.கா: நிலவின் அழகு"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">English Title</label>
                <input
                  type="text"
                  placeholder="e.g. Beauty of the Moon"
                  value={newEnglishTitle}
                  onChange={(e) => setNewEnglishTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">ஆசிரியர் பெயர் (Author)</label>
                  <input
                    type="text"
                    placeholder="உங் பெயர்..."
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-cyber-pink"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">வகை (Category)</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-cyber-pink"
                  >
                    <option value="life">வாழ்க்கை (Life)</option>
                    <option value="motivation">நம்பிக்கை (Motivation)</option>
                    <option value="nature">இயற்கை (Nature)</option>
                    <option value="love">அன்பு (Love)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">கவிதை வரிகள் (Verses - one line per line) *</label>
                <textarea
                  required
                  rows={5}
                  placeholder={`வரி 1\nவரி 2\nவரி 3...`}
                  value={newVersesText}
                  onChange={(e) => setNewVersesText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-cyber-pink resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyber-pink text-white font-extrabold flex items-center gap-1.5 shadow-lg shadow-cyber-pink/20 hover:scale-105 transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> Publish Poem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
