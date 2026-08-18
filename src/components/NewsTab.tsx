"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Calendar, User } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  category: string;
  date: string;
  source: string;
  snippet: string;
  content: string;
  gradient: string;
}

export default function NewsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const categories = ['All', 'Technology', 'Markets', 'Sports', 'Tamil Nadu'];

  const articles: Article[] = [
    {
      id: 1,
      title: "Tamil Nadu Launches Advanced IT Hub",
      category: "Technology",
      date: "Aug 18, 2026",
      source: "TN Tech Press",
      snippet: "A new state-of-the-art incubation park designed to accelerate SaaS startups and local developers.",
      content: "The Government of Tamil Nadu has inaugurated its newest state-of-the-art incubation facility in Chennai. The hub boasts modern high-speed server rooms, AI compute clusters, and space for over 500 tech startups. This initiative is aimed at solidifying the state's status as a top tier software development destination in South Asia.",
      gradient: "from-cyber-cyan to-blue-600"
    },
    {
      id: 2,
      title: "Gold Rates Dip Following Global Market Adjustments",
      category: "Markets",
      date: "Aug 17, 2026",
      source: "Bullion Daily",
      snippet: "Gold prices drop slightly, sparking interest in local jewellery retail markets.",
      content: "Gold prices saw a modest pullback today, trading down 0.4% after international central bank policy meetings. In Chennai, the sovereign rate settled slightly lower, drawing heavy retail footfall to local gold stores. Analysts suggest this is a minor correction in an otherwise long-term bull market.",
      gradient: "from-yellow-500 to-amber-600"
    },
    {
      id: 3,
      title: "Chennai Super Kings Gear Up for Winter T20",
      category: "Sports",
      date: "Aug 16, 2026",
      source: "Sportstar TN",
      snippet: "CSK training camps begin at Chepauk Stadium with local youngsters getting the spotlight.",
      content: "The Chennai Super Kings franchise has officially kicked off its training camp at the M. A. Chidambaram Stadium. Focus this winter is highly directed towards nurturing uncapped players from Tamil Nadu's district cricket leagues. Coaches indicate a heavy workload of physical conditioning and spin bowling strategies.",
      gradient: "from-amber-400 to-yellow-500"
    },
    {
      id: 4,
      title: "Next.js 16 Released with Improved Compilation Speeds",
      category: "Technology",
      date: "Aug 15, 2026",
      source: "Vercel News",
      snippet: "Next.js 16 leverages Rust compilers for 40% faster local builds.",
      content: "Vercel has released Next.js 16, which marks a significant milestone in modern web development. The build compiler has been completely rewritten using optimized Rust, offering 40% faster local dev boot times. It also introduces automatic typegen features and deep support for React Server Components.",
      gradient: "from-cyber-pink to-purple-600"
    },
    {
      id: 5,
      title: "New Hydroelectric Project Approved in Nilgiris",
      category: "Tamil Nadu",
      date: "Aug 14, 2026",
      source: "Green Earth TN",
      snippet: "Eco-friendly power generation expansion set to provide power to 50,000 homes.",
      content: "Environmental clearances have been granted for a new run-of-the-river hydroelectric power expansion project in the Nilgiris district. Designed with zero water storage dams, the project will generate 60MW of clean electricity with minimal impact on local forestry and wildlife preserves.",
      gradient: "from-emerald-400 to-teal-600"
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-5xl space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search news articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-zinc-950 border border-zinc-800 focus:border-cyber-cyan/50 focus:outline-none text-white"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-cyber-cyan text-zinc-950 shadow-[0_0_12px_rgba(0,240,255,0.25)]' 
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((article) => (
          <motion.div
            key={article.id}
            layoutId={`article-card-${article.id}`}
            onClick={() => setSelectedArticle(article)}
            className="p-5 rounded-2xl glass-card cursor-pointer flex flex-col justify-between h-[210px] group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${article.gradient} opacity-5 blur-2xl group-hover:opacity-15 transition-opacity`} />
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyber-cyan">
                  {article.category}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  {article.date}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyber-cyan transition-colors line-clamp-2">
                {article.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                {article.snippet}
              </p>
            </div>

            <div className="flex justify-between items-center border-t border-zinc-800/60 pt-3 mt-4 text-[10px] text-zinc-500 font-bold">
              <span>{article.source}</span>
              <span className="flex items-center gap-1 text-cyber-cyan group-hover:translate-x-1 transition-transform">
                Read Article <Eye className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>
        ))}

        {filteredArticles.length === 0 && (
          <div className="md:col-span-2 py-12 text-center text-zinc-500 font-semibold">
            No articles match your search parameters.
          </div>
        )}
      </div>

      {/* Reader Modal Overlay */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              layoutId={`article-card-${selectedArticle.id}`}
              className="relative w-full max-w-2xl p-6 md:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-cyber-cyan bg-cyber-cyan/10 px-2.5 py-1 rounded-full border border-cyber-cyan/20">
                  {selectedArticle.category}
                </span>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="text-zinc-500 hover:text-white font-bold text-sm"
                >
                  Close ✕
                </button>
              </div>

              <h2 className="text-2xl font-black text-white leading-tight mb-4">
                {selectedArticle.title}
              </h2>

              <div className="flex gap-4 text-xs text-zinc-500 font-semibold mb-6 border-b border-zinc-900 pb-4">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {selectedArticle.date}</span>
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {selectedArticle.source}</span>
              </div>

              <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                {selectedArticle.content}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
