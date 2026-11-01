"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, RefreshCw, Search, Star, Tv } from "lucide-react";
import Hls from "hls.js";
import { Page, PageHeader } from "@/components/site/ui";

interface Channel {
  id: string;
  name: string;
  category: string;
  url: string;
  logo: string;
}

const BASE = "https://iptv-org.github.io/iptv";
const LANGUAGES = [
  ["tam", "Tamil (தமிழ்)"], ["eng", "English"], ["hin", "Hindi (हिंदी)"], ["tel", "Telugu (తెలుగు)"], ["mal", "Malayalam (മലയാളം)"],
  ["kan", "Kannada (ಕನ್ನಡ)"], ["ben", "Bengali (বাংলা)"], ["spa", "Spanish (Español)"], ["fra", "French (Français)"], ["deu", "German (Deutsch)"], ["jpn", "Japanese (日本語)"],
];
const CATEGORIES = [
  ["categories/news", "News"], ["categories/sports", "Sports"], ["categories/movies", "Movies"], ["categories/music", "Music"],
  ["categories/animation", "Kids and animation"], ["countries/in", "All India"], ["index", "All channels"],
];
const MAX_LISTED = 300;

function parseM3U(text: string): Channel[] {
  const channels: Channel[] = [];
  let current: Partial<Channel> = {};
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("#EXTINF:")) {
      const comma = line.lastIndexOf(",");
      current = {
        name: (comma !== -1 && line.substring(comma + 1).trim()) || "Unnamed channel",
        logo: line.match(/tvg-logo="([^"]+)"/i)?.[1] ?? "",
        category: line.match(/group-title="([^"]+)"/i)?.[1] ?? "General",
      };
    } else if (/^https?:\/\//.test(line) && current.name) {
      channels.push({ ...current, id: `${channels.length}`, url: line } as Channel);
      current = {};
    }
  }
  return channels;
}

export default function TvView() {
  const [source, setSource] = useState(`${BASE}/languages/tam.m3u`);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favsOnly, setFavsOnly] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem("iptv-favorites") || "[]"));
    } catch {}
  }, []);

  const toggleFavorite = (url: string) => {
    const next = favorites.includes(url) ? favorites.filter((u) => u !== url) : [...favorites, url];
    setFavorites(next);
    try {
      localStorage.setItem("iptv-favorites", JSON.stringify(next));
    } catch {}
  };

  const fetchPlaylist = useCallback(async (url: string) => {
    setLoading(true);
    setListError(false);
    setChannel(null);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(String(res.status));
      setChannels(parseM3U(await res.text()));
    } catch {
      setChannels([]);
      setListError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaylist(source);
  }, [source, fetchPlaylist]);

  useEffect(() => {
    const video = videoRef.current;
    setStreamError(false);
    if (!channel || !video) return;
    const play = () => video.play().catch(() => {});
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      let recovered = false;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, play);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !recovered) {
          recovered = true;
          hls.recoverMediaError();
        } else {
          setStreamError(true);
          hls.destroy();
        }
      });
      return () => hls.destroy();
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = channel.url;
      play();
      return () => video.removeAttribute("src");
    }
    setStreamError(true);
  }, [channel]);

  const q = query.toLowerCase();
  const filtered = channels.filter(
    (c) => (!favsOnly || favorites.includes(c.url)) && (c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)),
  );

  return (
    <Page>
      <PageHeader title="TV" intro={<>Channels from the open-source <a href="https://github.com/iptv-org/iptv" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">iptv-org</a> playlists. Some streams may be offline or blocked in your browser.</>}>
        <div className="flex gap-2 md:w-72 shrink-0">
          <select aria-label="Choose a playlist" className="field" value={source} onChange={(e) => setSource(e.target.value)}>
            <optgroup label="Language">
              {LANGUAGES.map(([code, name]) => <option key={code} value={`${BASE}/languages/${code}.m3u`}>{name}</option>)}
            </optgroup>
            <optgroup label="Category">
              {CATEGORIES.map(([path, name]) => <option key={path} value={`${BASE}/${path}.m3u`}>{name}</option>)}
            </optgroup>
          </select>
          <button onClick={() => fetchPlaylist(source)} className="btn !px-2.5 shrink-0" aria-label="Reload playlist">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </PageHeader>

      <div className="grid lg:grid-cols-[1fr_21rem] gap-4 items-start">
        <div>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black text-white">
            <video ref={videoRef} className={`w-full h-full ${channel && !streamError ? "" : "invisible"}`} playsInline controls />
            {!channel && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70 text-sm">
                <Tv className="w-8 h-8" /> Choose a channel to start watching
              </div>
            )}
            {channel && streamError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-sm">
                <p>{channel.name} can&apos;t play here. It may be offline or blocked by the stream&apos;s host.</p>
                <a href={channel.url} target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-1.5">
                  Open the stream directly <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
          {channel && (
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-medium truncate">{channel.name}</h2>
                <div className="text-sm text-muted truncate">{channel.category}</div>
              </div>
              <button onClick={() => toggleFavorite(channel.url)} className="icon-btn shrink-0" aria-pressed={favorites.includes(channel.url)} aria-label={`Favourite ${channel.name}`}>
                <Star className={`w-4 h-4 ${favorites.includes(channel.url) ? "fill-accent text-accent" : ""}`} />
              </button>
            </div>
          )}
        </div>

        <div className="panel flex flex-col h-[28rem] lg:h-[36rem]">
          <div className="p-3 border-b border-line space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
              <input type="search" aria-label="Search channels" placeholder="Search channels" value={query} onChange={(e) => setQuery(e.target.value)} className="field !pl-9" />
            </div>
            <div className="flex items-center justify-between text-sm text-muted">
              <span aria-live="polite">{loading ? "Loading…" : `${filtered.length.toLocaleString()} channels`}</span>
              <button onClick={() => setFavsOnly(!favsOnly)} aria-pressed={favsOnly} className={`flex items-center gap-1 cursor-pointer hover:text-ink ${favsOnly ? "text-accent" : ""}`}>
                <Star className={`w-3.5 h-3.5 ${favsOnly ? "fill-accent" : ""}`} /> Favourites
              </button>
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto p-1.5">
            {filtered.slice(0, MAX_LISTED).map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setChannel(c)}
                  aria-current={channel?.id === c.id}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-md text-left cursor-pointer ${channel?.id === c.id ? "bg-surface-2" : "hover:bg-surface-2"}`}
                >
                  <span className="w-8 h-8 shrink-0 rounded bg-surface-2 overflow-hidden flex items-center justify-center">
                    {c.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logo} alt="" loading="lazy" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : <Tv className="w-4 h-4 text-muted" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm truncate">{c.name}</span>
                    <span className="block text-xs text-muted truncate">{c.category}</span>
                  </span>
                </button>
              </li>
            ))}
            {listError && <li className="p-6 text-center text-sm text-muted">The playlist couldn&apos;t be loaded. Try reloading it.</li>}
            {!loading && !listError && filtered.length === 0 && <li className="p-6 text-center text-sm text-muted">No channels found.</li>}
            {filtered.length > MAX_LISTED && <li className="p-3 text-center text-xs text-muted">Showing the first {MAX_LISTED}. Search to find more.</li>}
          </ul>
        </div>
      </div>
    </Page>
  );
}
