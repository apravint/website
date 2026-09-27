"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Share2, Plus, Volume2, Copy, Check, Feather, BookOpen, Send, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Poem {
  id: number;
  category: 'வாழ்க்கை' | 'காதல்' | 'நட்பு' | 'இயற்கை' | 'தேசம்';
  title: string;
  englishTitle: string;
  verses: string[];
  likes: number;
  author?: string;
}

const INITIAL_POEMS: Poem[] = [
  {
    id: 1,
    category: 'வாழ்க்கை',
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
    likes: 42,
    author: "மரபு நிலா"
  },
  {
    id: 2,
    category: 'வாழ்க்கை',
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
    likes: 38,
    author: "பாரதி அடியான்"
  },
  {
    id: 3,
    category: 'காதல்',
    title: "கண் சிமிட்டும் கவிதையே",
    englishTitle: "Blinking Poetry",
    verses: [
      "உன் விழிப் பார்வையில் பூத்த பூக்கள்,",
      "என் நெஞ்சில் நறுமணம் வீசுதடி!",
      "மௌனத்தின் மொழியில் பேசும் இரவுகள்,",
      "உன் நினைவுகளால் ஒளிருதடி."
    ],
    likes: 55,
    author: "காதல் கவிஞன்"
  },
  {
    id: 4,
    category: 'இயற்கை',
    title: "மழையின் சங்கீதம்",
    englishTitle: "Symphony of Rain",
    verses: [
      "வானம் சிந்தும் முத்து மணிகள்,",
      "பூமியின் தாகம் தீர்க்கும் அமுதம்.",
      "மரங்களின் இலைகளில் தாலாட்டு பாடி,",
      "மண்ணின் மனதை மகிழ்விக்கும் மழை!"
    ],
    likes: 29,
    author: "இயற்கைப் பிரியன்"
  },
  {
    id: 5,
    category: 'நட்பு',
    title: "தோளின் சுமை தாங்கி",
    englishTitle: "Pillar of Friendship",
    verses: [
      "வார்த்தைகள் தேவையில்லாத பந்தம்,",
      "வாழ்கையின் நிழலாய் தொடரும் சொந்தம்.",
      "துன்பத்தில் கரம் கொடுக்கும் தோழன்,",
      "இறைவன் தந்த இன்முகப் பரிசு!"
    ],
    likes: 47,
    author: "நட்பின் நதி"
  },
  {
    id: 6,
    category: 'தேசம்',
    title: "தமிழ் மண்ணின் வீரம்",
    englishTitle: "Valor of Tamil Soil",
    verses: [
      "பழம்பெரும் மொழியின் பெருமை காப்போம்,",
      "பாரதி வழியில் அறத்தைப் பரப்புவோம்.",
      "வீரமும் ஈரமும் நிறைந்த நெஞ்சோடு,",
      "தமிழ் தாயின் புகழ் கொடியை ஏற்றுவோம்!"
    ],
    likes: 61,
    author: "தமிழ் தொண்டன்"
  }
];

export default function KavithaiTab() {
  const [poems, setPoems] = useState<Poem[]>(INITIAL_POEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likedPoemIds, setLikedPoemIds] = useState<number[]>([]);
  const [speakingPoemId, setSpeakingPoemId] = useState<number | null>(null);
  const [copiedPoemId, setCopiedPoemId] = useState<number | null>(null);

  // Generator Modal state
  const [showModal, setShowModal] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newCategory, setNewCategory] = useState<'வாழ்க்கை' | 'காதல்' | 'நட்பு' | 'இயற்கை' | 'தேசம்'>('வாழ்க்கை');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const savedPoems = localStorage.getItem('user-kavithai-list');
    const savedLikes = localStorage.getItem('user-kavithai-likes');
    if (savedPoems) {
      try { setPoems(JSON.parse(savedPoems)); } catch (e) {}
    }
    if (savedLikes) {
      try { setLikedPoemIds(JSON.parse(savedLikes)); } catch (e) {}
    }
  }, []);

  const handleLike = (id: number) => {
    const isLiked = likedPoemIds.includes(id);
    const updatedLikes = isLiked
      ? likedPoemIds.filter(i => i !== id)
      : [...likedPoemIds, id];
    
    setLikedPoemIds(updatedLikes);
    localStorage.setItem('user-kavithai-likes', JSON.stringify(updatedLikes));

    const updatedPoems = poems.map(p => {
      if (p.id === id) {
        return { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    });
    setPoems(updatedPoems);
    localStorage.setItem('user-kavithai-list', JSON.stringify(updatedPoems));
  };

  const speakPoem = (poem: Poem) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (speakingPoemId === poem.id) {
      setSpeakingPoemId(null);
      return;
    }

    const textToSpeak = `${poem.title}. ${poem.verses.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ta-IN';
    utterance.rate = 0.85;
    utterance.onend = () => setSpeakingPoemId(null);
    utterance.onerror = () => setSpeakingPoemId(null);
    setSpeakingPoemId(poem.id);
    window.speechSynthesis.speak(utterance);
  };

  const copyPoem = (poem: Poem) => {
    const textToCopy = `✍️ ${poem.title} (${poem.englishTitle})\n\n${poem.verses.join('\n')}\n\n— கவிஞர்: ${poem.author || 'தமிழ் கவிதை'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPoemId(poem.id);
    setTimeout(() => setCopiedPoemId(null), 2000);
  };

  // AI Poem Generator Simulation based on topic
  const generateKavithai = () => {
    if (!newTopic.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const topic = newTopic.trim();
      const newPoem: Poem = {
        id: Date.now(),
        category: newCategory,
        title: `${topic} குறித்த கவிதை`,
        englishTitle: `Poem on ${topic}`,
        verses: [
          `${topic} தந்த வெளிச்சத்தில் நெஞ்சம் விழிக்கும்,`,
          `அன்பின் பாதையில் அரும்புகள் பூக்கும்.`,
          `நம்பிக்கை சுடராய் பிரகாசிக்கும் காலம்,`,
          `வெற்றி மாலை சூடும் புதிய விடியல்!`
        ],
        likes: 1,
        author: "AI தமிழ் கவிஞன்"
      };

      const updated = [newPoem, ...poems];
      setPoems(updated);
      localStorage.setItem('user-kavithai-list', JSON.stringify(updated));

      setNewTopic('');
      setIsGenerating(false);
      setShowModal(false);
    }, 1000);
  };

  const categories = ['All', 'வாழ்க்கை', 'காதல்', 'நட்பு', 'இயற்கை', 'தேசம்'];
  const filteredPoems = selectedCategory === 'All' 
    ? poems 
    : poems.filter(p => p.category === selectedCategory);

  return (
    <div className="w-full max-w-[1700px] space-y-6 font-sans">
      
      {/* Header & Generator Trigger Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-zinc-800 shadow-2xl">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            ✍️ தமிழ் கவிதைகள் <span className="text-gradient">| Modern Tamil Poetry</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Explore Tamil poetry celebrating life, love, friendship, nature, and patriotism with TTS audio recitation.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-pink via-purple-600 to-cyber-cyan text-white font-extrabold text-xs tracking-wider shadow-lg shadow-cyber-pink/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start md:self-auto font-mono"
        >
          <Wand2 className="w-4 h-4 animate-spin" /> AI கவிதை உருவாக்கு (Compose AI Poem)
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none font-mono">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-cyber-pink text-white border border-cyber-pink shadow-[0_0_15px_rgba(255,0,127,0.3)] scale-105'
                : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {cat === 'All' ? '🌐 ALL POEMS' : `🏷️ ${cat}`}
          </button>
        ))}
      </div>

      {/* Poem Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPoems.map((poem) => {
          const isLiked = likedPoemIds.includes(poem.id);
          const isSpeaking = speakingPoemId === poem.id;

          return (
            <div 
              key={poem.id} 
              className="p-6 rounded-2xl glass-card flex flex-col justify-between relative overflow-hidden group border border-zinc-800 hover:border-cyber-pink/30 transition-all shadow-xl"
            >
              <div className="aurora-glow-pink top-0 right-0 -mr-20 -mt-20 opacity-20" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded-full border border-cyber-cyan/20 uppercase">
                      {poem.category}
                    </span>
                    <h4 className="text-lg font-extrabold text-white group-hover:text-cyber-pink transition-colors mt-2">
                      {poem.title}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mt-0.5 font-mono">
                      {poem.englishTitle}
                    </span>
                  </div>
                  <Sparkles className="w-4 h-4 text-cyber-pink animate-pulse shrink-0" />
                </div>

                {/* Stanzas */}
                <div className="space-y-2.5 my-6 text-sm text-zinc-200 leading-relaxed font-sans font-medium pl-1 border-l-2 border-cyber-pink/30">
                  {poem.verses.map((verse, idx) => (
                    <p key={idx}>{verse}</p>
                  ))}
                </div>

                {poem.author && (
                  <span className="text-[10px] text-zinc-500 font-mono block italic text-right">
                    — கவிஞர்: {poem.author}
                  </span>
                )}
              </div>

              {/* Card Footer Action Bar */}
              <div className="flex justify-between items-center border-t border-zinc-900 pt-4 mt-4 z-10 font-mono text-xs">
                <button 
                  onClick={() => handleLike(poem.id)}
                  className={`flex items-center gap-1.5 font-bold transition-all ${
                    isLiked ? 'text-red-400 scale-105' : 'text-zinc-500 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-400 text-red-400' : 'fill-none'}`} />
                  <span>{poem.likes}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => speakPoem(poem)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                      isSpeaking 
                        ? 'bg-cyber-pink text-white border-cyber-pink animate-pulse' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                    title="Listen Tamil Recitation"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? 'Listening...' : 'Listen'}</span>
                  </button>

                  <button 
                    onClick={() => copyPoem(poem)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
                    title="Copy Poem Text"
                  >
                    {copiedPoemId === poem.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Kavithai Generator Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-5 font-mono"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-cyber-pink" /> AI தமிழ் கவிதை உருவாக்கி
                </h4>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-zinc-500 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">கவிதை தலைப்பு / Topic:</label>
                  <input
                    type="text"
                    placeholder="e.g. மழை, அம்மா, காதல், வெற்றி..."
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-cyber-pink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">வகை / Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-cyber-pink focus:outline-none"
                  >
                    <option value="வாழ்க்கை">வாழ்க்கை (Life)</option>
                    <option value="காதல்">காதல் (Love)</option>
                    <option value="நட்பு">நட்பு (Friendship)</option>
                    <option value="இயற்கை">இயற்கை (Nature)</option>
                    <option value="தேசம்">தேசம் (Patriotism)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 text-xs font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={isGenerating || !newTopic.trim()}
                  onClick={generateKavithai}
                  className="flex-1 py-2.5 rounded-xl bg-cyber-pink text-white text-xs font-extrabold disabled:opacity-30 hover:scale-105 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyber-pink/20"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Feather className="w-4 h-4" /> Compose Poem
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
