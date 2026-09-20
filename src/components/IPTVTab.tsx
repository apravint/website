"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Tv, ListMusic, Volume2, VolumeX, Shield, Search, Star, 
  Maximize, RefreshCw, ExternalLink, Globe, Radio, Sparkles, Filter, AlertCircle, Languages 
} from 'lucide-react';
import Hls from 'hls.js';

interface Channel {
  id: string;
  name: string;
  category: string;
  url: string;
  logo: string;
  group: string;
}

const LANGUAGE_SOURCES = [
  { code: 'tam', name: '🇮🇳 Tamil (தமிழ்)', url: 'https://iptv-org.github.io/iptv/languages/tam.m3u' },
  { code: 'eng', name: '🇬🇧 English', url: 'https://iptv-org.github.io/iptv/languages/eng.m3u' },
  { code: 'hin', name: '🇮🇳 Hindi (हिंदी)', url: 'https://iptv-org.github.io/iptv/languages/hin.m3u' },
  { code: 'tel', name: '🇮🇳 Telugu (తెలుగు)', url: 'https://iptv-org.github.io/iptv/languages/tel.m3u' },
  { code: 'mal', name: '🇮🇳 Malayalam (മലയാളം)', url: 'https://iptv-org.github.io/iptv/languages/mal.m3u' },
  { code: 'kan', name: '🇮🇳 Kannada (கன்னட)', url: 'https://iptv-org.github.io/iptv/languages/kan.m3u' },
  { code: 'ben', name: '🇮🇳 Bengali (বাংলা)', url: 'https://iptv-org.github.io/iptv/languages/ben.m3u' },
  { code: 'spa', name: '🇪🇸 Spanish (Español)', url: 'https://iptv-org.github.io/iptv/languages/spa.m3u' },
  { code: 'fra', name: '🇫🇷 French (Français)', url: 'https://iptv-org.github.io/iptv/languages/fra.m3u' },
  { code: 'deu', name: '🇩🇪 German (Deutsch)', url: 'https://iptv-org.github.io/iptv/languages/deu.m3u' },
  { code: 'jpn', name: '🇯🇵 Japanese (日本語)', url: 'https://iptv-org.github.io/iptv/languages/jpn.m3u' }
];

const CATEGORY_SOURCES = [
  { id: 'news', name: '📰 Global News', url: 'https://iptv-org.github.io/iptv/categories/news.m3u' },
  { id: 'sports', name: '⚽ Sports TV', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
  { id: 'movies', name: '🎬 Movies & Cinema', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
  { id: 'music', name: '🎵 Music TV', url: 'https://iptv-org.github.io/iptv/categories/music.m3u' },
  { id: 'animation', name: '🧸 Kids & Animation', url: 'https://iptv-org.github.io/iptv/categories/animation.m3u' },
  { id: 'india', name: '🇮🇳 All India Channels', url: 'https://iptv-org.github.io/iptv/countries/in.m3u' },
  { id: 'global', name: '🌐 Global Index (All)', url: 'https://iptv-org.github.io/iptv/index.m3u' }
];

export default function IPTVTab() {
  const [selectedSource, setSelectedSource] = useState(LANGUAGE_SOURCES[0].url);
  const [selectedLangCode, setSelectedLangCode] = useState('tam');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Player controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [streamError, setStreamError] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Load saved favorites from LocalStorage
  useEffect(() => {
    const savedFavs = localStorage.getItem('iptv-favorites');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }
  }, []);

  const toggleFavorite = (channelUrl: string) => {
    let updated = [...favorites];
    if (updated.includes(channelUrl)) {
      updated = updated.filter(u => u !== channelUrl);
    } else {
      updated.push(channelUrl);
    }
    setFavorites(updated);
    localStorage.setItem('iptv-favorites', JSON.stringify(updated));
  };

  // Parse M3U Playlist text into Channel objects
  const parseM3U = (m3uText: string): Channel[] => {
    const lines = m3uText.split('\n');
    const parsedChannels: Channel[] = [];
    let currentChannel: Partial<Channel> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('#EXTINF:')) {
        const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
        const groupMatch = line.match(/group-title="([^"]+)"/i);

        const commaIdx = line.lastIndexOf(',');
        const name = commaIdx !== -1 ? line.substring(commaIdx + 1).trim() : 'Unknown Channel';

        currentChannel = {
          id: `ch-${parsedChannels.length + 1}-${Math.random().toString(36).substr(2, 5)}`,
          name: name || 'Live Channel',
          logo: logoMatch ? logoMatch[1] : '',
          group: groupMatch ? groupMatch[1] : 'General',
          category: groupMatch ? groupMatch[1] : 'General'
        };
      } else if (line.startsWith('http://') || line.startsWith('https://')) {
        if (currentChannel.name) {
          currentChannel.url = line;
          parsedChannels.push(currentChannel as Channel);
          currentChannel = {};
        }
      }
    }
    return parsedChannels;
  };

  // Fetch M3U Playlist from source URL
  const fetchPlaylist = async (url: string) => {
    setLoading(true);
    setErrorMsg(null);
    setSelectedChannel(null);
    setStreamError(false);

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const text = await res.text();
      const parsed = parseM3U(text);
      
      if (parsed.length === 0) {
        throw new Error('No valid streaming channels found in playlist.');
      }

      setChannels(parsed);
      setSelectedChannel(parsed[0]); // Auto-select first channel
    } catch (err: any) {
      setErrorMsg(`Failed to load iptv-org playlist: ${err?.message || 'Network error'}`);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist(selectedSource);
  }, [selectedSource]);

  // HLS Stream Video Player Setup
  useEffect(() => {
    if (!selectedChannel || !videoRef.current) return;

    const video = videoRef.current;
    setStreamError(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = selectedChannel.url;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setStreamError(true);
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      setStreamError(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedChannel]);

  // Video controls helpers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      setIsMuted(v === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  // Categories list extracted from loaded channels
  const categories = ['All', ...Array.from(new Set(channels.map(c => c.category))).filter(Boolean).slice(0, 12)];

  // Filter channels by Category, Search Query, or Favorites
  const filteredChannels = channels.filter((c) => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFav = !showFavoritesOnly || favorites.includes(c.url);
    return matchesCategory && matchesSearch && matchesFav;
  });

  return (
    <div className="w-full max-w-[1700px] space-y-4 font-sans">
      
      {/* Top Source & Language Filter Bar (Full Width Occupancy) */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-2xl glass-card flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wider flex items-center gap-2">
              IPTV-ORG LIVE STREAMING PORTAL
            </h2>
            <p className="text-[10px] text-zinc-400">POWERED BY GITHUB IPTV-ORG OPEN SOURCE PLAYLISTS</p>
          </div>
        </div>

        {/* Language Selection Filter & Category Selector */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
            <Languages className="w-4 h-4 text-cyber-cyan" />
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
              }}
              className="bg-transparent text-white font-mono text-xs font-bold focus:outline-none cursor-pointer"
            >
              <optgroup label="🌐 Select by Language">
                {LANGUAGE_SOURCES.map((l) => (
                  <option key={l.code} value={l.url} className="bg-zinc-950 text-white">{l.name}</option>
                ))}
              </optgroup>
              <optgroup label="📺 Select by Category">
                {CATEGORY_SOURCES.map((c) => (
                  <option key={c.id} value={c.url} className="bg-zinc-950 text-white">{c.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <button
            onClick={() => fetchPlaylist(selectedSource)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Refresh Playlist"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyber-cyan' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Full-Screen Width IPTV Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Video Player Display (Col span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="relative aspect-video w-full rounded-2xl border border-zinc-800 bg-black overflow-hidden flex items-center justify-center shadow-2xl group min-h-[420px] md:min-h-[580px]">
            
            {/* HTML5 HLS Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              controls={false}
            />

            {/* Loading Indicator */}
            {loading && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 font-mono">
                <RefreshCw className="w-10 h-10 text-cyber-cyan animate-spin" />
                <p className="text-xs text-zinc-300 animate-pulse">
                  Fetching streams from iptv-org playlist...
                </p>
              </div>
            )}

            {/* Stream Error Notice Overlay */}
            {streamError && !loading && selectedChannel && (
              <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-10 font-mono">
                <AlertCircle className="w-12 h-12 text-amber-400 animate-bounce" />
                <div>
                  <h4 className="text-base font-extrabold text-white">{selectedChannel.name}</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                    This stream may be offline or restricted by CORS headers.
                  </p>
                </div>
                <a 
                  href={selectedChannel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyber-cyan text-zinc-950 shadow-lg shadow-cyber-cyan/20 hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Open Stream in External Player
                </a>
              </div>
            )}

            {/* Custom Video Overlay Controls Bar */}
            {selectedChannel && !loading && !streamError && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10 font-mono">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="p-2 rounded-lg bg-zinc-900/80 text-white hover:text-cyber-cyan">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="p-2 rounded-lg bg-zinc-900/80 text-white hover:text-cyber-cyan">
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-20 accent-cyber-cyan"
                    />
                  </div>

                  <span className="text-xs font-bold text-white truncate max-w-[280px]">
                    🔴 LIVE: {selectedChannel.name}
                  </span>
                </div>

                <button onClick={toggleFullscreen} className="p-2 rounded-lg bg-zinc-900/80 text-white hover:text-cyber-cyan">
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            )}

            {!selectedChannel && !loading && (
              <div className="text-center p-6 space-y-3 font-mono">
                <Tv className="w-16 h-16 text-zinc-700 mx-auto animate-pulse" />
                <h4 className="text-base font-bold text-zinc-400">Select a Channel to Broadcast</h4>
                <p className="text-xs text-zinc-600 max-w-xs mx-auto">
                  Pick any television station from the channel sidebar to initiate live HLS video playback.
                </p>
              </div>
            )}
          </div>

          {/* Current Channel Banner */}
          {selectedChannel && (
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                {selectedChannel.logo ? (
                  <img 
                    src={selectedChannel.logo} 
                    alt={selectedChannel.name} 
                    className="w-10 h-10 object-contain rounded bg-zinc-900 p-1 border border-zinc-800"
                    onError={(e) => { (e.target as any).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-zinc-900 flex items-center justify-center text-cyber-cyan border border-zinc-800 font-bold">
                    TV
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-white text-sm">{selectedChannel.name}</h3>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">
                    Category: {selectedChannel.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(selectedChannel.url)}
                  className={`p-2 rounded-xl border transition-all ${
                    favorites.includes(selectedChannel.url)
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  title="Favorite Channel"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
                <a
                  href={selectedChannel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-cyber-cyan transition-colors"
                  title="Open Raw Stream"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Channel Selection Sidebar (Col span 1) */}
        <div className="p-4 rounded-2xl glass-card border border-zinc-800 flex flex-col justify-between h-[640px]">
          <div className="flex flex-col h-full space-y-3 font-mono">
            
            {/* Header & Favorites filter */}
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
              <h4 className="font-extrabold text-white text-xs tracking-wider flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-cyber-pink" /> CHANNELS ({filteredChannels.length})
              </h4>

              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                  showFavoritesOnly ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                <Star className="w-3 h-3 fill-current" /> FAVS ({favorites.length})
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channel name or category..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-cyber-cyan"
              />
            </div>

            {/* Category tabs scrollbar */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-cyber-pink text-white shadow-md'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Channels List */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
              {filteredChannels.map((channel) => {
                const isSelected = selectedChannel?.url === channel.url;
                const isFav = favorites.includes(channel.url);

                return (
                  <div
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-cyber-cyan/15 border-cyber-cyan text-white shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {channel.logo ? (
                        <img 
                          src={channel.logo} 
                          alt="" 
                          className="w-7 h-7 object-contain rounded bg-zinc-950 p-0.5 border border-zinc-800 shrink-0"
                          onError={(e) => { (e.target as any).style.display = 'none'; }}
                        />
                      ) : (
                        <Radio className="w-4 h-4 text-cyber-cyan shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{channel.name}</span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase truncate block">
                          {channel.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(channel.url);
                      }}
                      className="p-1 text-zinc-500 hover:text-amber-400 shrink-0"
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
                    </button>
                  </div>
                );
              })}

              {filteredChannels.length === 0 && !loading && (
                <div className="text-center py-10 text-xs text-zinc-600">
                  No channels match your search filter.
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
