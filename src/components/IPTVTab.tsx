"use client";

import React, { useState } from 'react';
import { Play, Tv, ListMusic, Volume2, Shield } from 'lucide-react';

interface Channel {
  id: number;
  name: string;
  category: string;
  url: string;
  logo: string;
}

export default function IPTVTab() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'News', 'Music', 'Entertainment', 'Sports'];

  const channels: Channel[] = [
    {
      id: 1,
      name: "Polimer News Live",
      category: "News",
      url: "https://polimernews.com",
      logo: "🔴"
    },
    {
      id: 2,
      name: "Puthiya Thalaimurai Live",
      category: "News",
      url: "https://puthiyathalaimurai.com",
      logo: "📺"
    },
    {
      id: 3,
      name: "Sun Music HD",
      category: "Music",
      url: "https://sunnetwork.in",
      logo: "🎵"
    },
    {
      id: 4,
      name: "Star Vijay TV",
      category: "Entertainment",
      url: "https://hotstar.com",
      logo: "🎬"
    },
    {
      id: 5,
      name: "Kalaignar TV",
      category: "Entertainment",
      url: "https://kalaignartv.co.in",
      logo: "📽️"
    }
  ];

  const filteredChannels = channels.filter(c => activeCategory === 'All' || c.category === activeCategory);

  return (
    <div className="w-full max-w-5xl space-y-6">
      {/* IPTV Player Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Video Player Display (Col span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="relative aspect-video w-full rounded-2xl border border-zinc-800 bg-black overflow-hidden flex items-center justify-center shadow-lg">
            {selectedChannel ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <span className="text-6xl mb-4 animate-pulse">{selectedChannel.logo}</span>
                <h4 className="text-xl font-bold text-white mb-2">{selectedChannel.name}</h4>
                <p className="text-xs text-zinc-500 mb-6 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                  Category: {selectedChannel.category}
                </p>
                <a 
                  href={selectedChannel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-lg text-xs font-bold bg-cyber-cyan text-zinc-950 shadow-lg shadow-cyber-cyan/15 hover:scale-105 transition-transform flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-zinc-950" /> Connect Live Stream
                </a>
              </div>
            ) : (
              <div className="text-center p-6">
                <Tv className="w-16 h-16 text-zinc-700 mx-auto mb-4 animate-bounce" />
                <h4 className="text-lg font-bold text-zinc-400">Select a Channel to Watch</h4>
                <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">
                  Click on any television channel in the side panel list to boot up the broadcast connection.
                </p>
              </div>
            )}
            
            {/* Player Ambient neon glow */}
            <div className="absolute inset-0 border border-cyber-cyan/5 rounded-2xl pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/40 leading-relaxed">
            <Shield className="w-5 h-5 text-cyber-cyan shrink-0" />
            <p>
              IPTV connections are resolved dynamically. Ensure you allow popups if redirect options occur for external streaming portals.
            </p>
          </div>
        </div>

        {/* Channel Selection List (Col span 1) */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between max-h-[460px]">
          <div>
            <h4 className="font-bold text-white mb-4 flex items-center gap-1.5">
              <ListMusic className="w-5 h-5 text-cyber-pink" /> CHANNEL LIST
            </h4>

            {/* Category tabs inside channel list panel */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-zinc-800/60 scrollbar-none">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-cyber-pink text-white shadow-md'
                      : 'bg-zinc-900 text-zinc-500 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[260px] pr-1">
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    selectedChannel?.id === channel.id
                      ? 'bg-cyber-cyan/10 border-cyber-cyan text-white'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{channel.logo}</span>
                  <div className="flex-1">
                    <span className="text-xs font-bold block">{channel.name}</span>
                    <span className="text-[9px] text-zinc-500 font-extrabold uppercase">{channel.category}</span>
                  </div>
                  <Volume2 className="w-3.5 h-3.5 text-zinc-600" />
                </div>
              ))}

              {filteredChannels.length === 0 && (
                <div className="text-center py-8 text-xs text-zinc-600 font-bold">
                  No channels found.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
