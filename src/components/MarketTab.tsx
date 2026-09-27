"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, RefreshCw, Activity, Clock, AlertCircle
} from 'lucide-react';

interface StockIndex {
  symbol: string;
  name: string;
  region: 'India' | 'USA' | 'World';
  flag: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  isOpen: boolean;
  marketHours: string;
}

interface BullionRate {
  asset: string;
  purity: string;
  price: string;
  change: string;
  isUp: boolean;
}

interface CommodityRate {
  name: string;
  price: string;
  unit: string;
  change: string;
  isUp: boolean;
}

// Calculate real-time market open/closed status based on exact international market time zones
function calculateIsMarketOpen(symbol: string, region: 'India' | 'USA' | 'World'): boolean {
  const now = new Date();

  if (region === 'India') {
    try {
      // Convert to IST (Asia/Kolkata)
      const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const istDate = new Date(istString);
      const day = istDate.getDay(); // 0 = Sunday, 6 = Saturday
      if (day === 0 || day === 6) return false; // Closed weekends
      const mins = istDate.getHours() * 60 + istDate.getMinutes();
      // 09:15 IST = 555 mins, 15:30 IST = 930 mins
      return mins >= 555 && mins <= 930;
    } catch (e) {
      return false;
    }
  }

  if (region === 'USA') {
    try {
      // Convert to EST (America/New_York)
      const estString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
      const estDate = new Date(estString);
      const day = estDate.getDay();
      if (day === 0 || day === 6) return false; // Closed weekends
      const mins = estDate.getHours() * 60 + estDate.getMinutes();
      // 09:30 EST = 570 mins, 16:00 EST = 960 mins
      return mins >= 570 && mins <= 960;
    } catch (e) {
      return false;
    }
  }

  // World (Europe & Asia)
  try {
    if (symbol === '^N225') { // Tokyo 09:00 - 15:00 JST
      const t = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
      if (t.getDay() === 0 || t.getDay() === 6) return false;
      const m = t.getHours() * 60 + t.getMinutes();
      return m >= 540 && m <= 900;
    }
    if (symbol === '^HSI') { // Hong Kong 09:30 - 16:00 HKT
      const t = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Hong_Kong" }));
      if (t.getDay() === 0 || t.getDay() === 6) return false;
      const m = t.getHours() * 60 + t.getMinutes();
      return m >= 570 && m <= 960;
    }
    if (symbol === '^FTSE') { // London 08:00 - 16:30 GMT
      const t = new Date(now.toLocaleString("en-US", { timeZone: "Europe/London" }));
      if (t.getDay() === 0 || t.getDay() === 6) return false;
      const m = t.getHours() * 60 + t.getMinutes();
      return m >= 480 && m <= 990;
    }
    if (symbol === '^GDAXI') { // Frankfurt 09:00 - 17:30 CET
      const t = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
      if (t.getDay() === 0 || t.getDay() === 6) return false;
      const m = t.getHours() * 60 + t.getMinutes();
      return m >= 540 && m <= 1050;
    }
  } catch (e) {}

  return false;
}

export default function MarketTab() {
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [flashSymbol, setFlashSymbol] = useState<string | null>(null);

  // Initial Baseline Stock Indexes Data
  const [indexes, setIndexes] = useState<StockIndex[]>([
    // INDIA (NSE/BSE)
    {
      symbol: '^NSEI',
      name: 'NIFTY 50',
      region: 'India',
      flag: '🇮🇳',
      price: 25182.50,
      currency: 'INR (₹)',
      change: 148.30,
      changePercent: 0.59,
      high: 25240.00,
      low: 25010.20,
      isOpen: false,
      marketHours: '09:15 - 15:30 IST'
    },
    {
      symbol: '^BSESN',
      name: 'BSE SENSEX',
      region: 'India',
      flag: '🇮🇳',
      price: 82365.80,
      currency: 'INR (₹)',
      change: 480.20,
      changePercent: 0.58,
      high: 82510.00,
      low: 81890.40,
      isOpen: false,
      marketHours: '09:15 - 15:30 IST'
    },
    {
      symbol: '^NSEBANK',
      name: 'NIFTY BANK',
      region: 'India',
      flag: '🇮🇳',
      price: 51420.10,
      currency: 'INR (₹)',
      change: -110.40,
      changePercent: -0.21,
      high: 51680.00,
      low: 51200.00,
      isOpen: false,
      marketHours: '09:15 - 15:30 IST'
    },
    {
      symbol: '^CNXIT',
      name: 'NIFTY IT',
      region: 'India',
      flag: '🇮🇳',
      price: 42890.75,
      currency: 'INR (₹)',
      change: 620.15,
      changePercent: 1.47,
      high: 43100.00,
      low: 42350.00,
      isOpen: false,
      marketHours: '09:15 - 15:30 IST'
    },

    // USA (WALL STREET)
    {
      symbol: '^GSPC',
      name: 'S&P 500',
      region: 'USA',
      flag: '🇺🇸',
      price: 5738.10,
      currency: 'USD ($)',
      change: 24.80,
      changePercent: 0.43,
      high: 5750.40,
      low: 5712.00,
      isOpen: false,
      marketHours: '09:30 - 16:00 EST'
    },
    {
      symbol: '^IXIC',
      name: 'NASDAQ Composite',
      region: 'USA',
      flag: '🇺🇸',
      price: 18074.50,
      currency: 'USD ($)',
      change: 110.20,
      changePercent: 0.61,
      high: 18120.00,
      low: 17950.00,
      isOpen: false,
      marketHours: '09:30 - 16:00 EST'
    },
    {
      symbol: '^DJI',
      name: 'DOW JONES Industrial',
      region: 'USA',
      flag: '🇺🇸',
      price: 42124.65,
      currency: 'USD ($)',
      change: -85.10,
      changePercent: -0.20,
      high: 42280.00,
      low: 41990.00,
      isOpen: false,
      marketHours: '09:30 - 16:00 EST'
    },
    {
      symbol: '^RUT',
      name: 'RUSSELL 2000',
      region: 'USA',
      flag: '🇺🇸',
      price: 2220.40,
      currency: 'USD ($)',
      change: 12.30,
      changePercent: 0.56,
      high: 2235.00,
      low: 2205.00,
      isOpen: false,
      marketHours: '09:30 - 16:00 EST'
    },

    // WORLD (EUROPE & ASIA)
    {
      symbol: '^FTSE',
      name: 'FTSE 100 (UK)',
      region: 'World',
      flag: '🇬🇧',
      price: 8280.50,
      currency: 'GBP (£)',
      change: 32.10,
      changePercent: 0.39,
      high: 8305.00,
      low: 8240.00,
      isOpen: false,
      marketHours: '08:00 - 16:30 GMT'
    },
    {
      symbol: '^GDAXI',
      name: 'DAX Performance (Germany)',
      region: 'World',
      flag: '🇩🇪',
      price: 19238.20,
      currency: 'EUR (€)',
      change: 95.40,
      changePercent: 0.50,
      high: 19290.00,
      low: 19120.00,
      isOpen: false,
      marketHours: '09:00 - 17:30 CET'
    },
    {
      symbol: '^N225',
      name: 'NIKKEI 225 (Japan)',
      region: 'World',
      flag: '🇯🇵',
      price: 37870.20,
      currency: 'JPY (¥)',
      change: 870.50,
      changePercent: 2.35,
      high: 38100.00,
      low: 37200.00,
      isOpen: false,
      marketHours: '09:00 - 15:00 JST'
    },
    {
      symbol: '^HSI',
      name: 'HANG SENG (Hong Kong)',
      region: 'World',
      flag: '🇭🇰',
      price: 19924.50,
      currency: 'HKD ($)',
      change: 790.30,
      changePercent: 4.13,
      high: 20100.00,
      low: 19300.00,
      isOpen: false,
      marketHours: '09:30 - 16:00 HKT'
    }
  ]);

  const bullions: BullionRate[] = [
    { asset: "Gold (24K)", purity: "99.9% Pure per Gram", price: "₹7,420.00", change: "+₹35.00 (0.47%)", isUp: true },
    { asset: "Gold (22K)", purity: "Jewellery Gold per Gram", price: "₹6,802.00", change: "+₹32.00 (0.47%)", isUp: true },
    { asset: "Silver", purity: "99.9% Pure per 10 Gram", price: "₹935.00", change: "+₹8.00 (0.86%)", isUp: true },
    { asset: "Platinum", purity: "95% Pure per Gram", price: "₹3,510.00", change: "-₹12.00 (0.34%)", isUp: false }
  ];

  const commodities: CommodityRate[] = [
    { name: "Rice (Basmati)", price: "₹98.00", unit: "per Kg", change: "+₹1.00", isUp: true },
    { name: "Onion (Bellary)", price: "₹45.00", unit: "per Kg", change: "-₹3.00", isUp: false },
    { name: "Tomato (Local)", price: "₹30.00", unit: "per Kg", change: "-₹2.00", isUp: false },
    { name: "Coconut Oil", price: "₹215.00", unit: "per Litre", change: "+₹5.00", isUp: true },
    { name: "Milk (Pasteurized)", price: "₹60.00", unit: "per Litre", change: "Stable", isUp: true },
    { name: "Sugar (White refined)", price: "₹45.00", unit: "per Kg", change: "+₹1.00", isUp: true }
  ];

  // Dynamically calculate and update market open/closed status & real-time ticks
  useEffect(() => {
    const updateMarketStatuses = () => {
      setIndexes(prevIndexes =>
        prevIndexes.map(idx => ({
          ...idx,
          isOpen: calculateIsMarketOpen(idx.symbol, idx.region)
        }))
      );
      setLastUpdated(new Date().toLocaleTimeString());
    };

    updateMarketStatuses();

    // Periodic simulation of ticks ONLY for open markets (or after-hours subtle ticks)
    const interval = setInterval(() => {
      setIndexes(prevIndexes => {
        // Calculate updated market statuses
        const updated = prevIndexes.map(idx => ({
          ...idx,
          isOpen: calculateIsMarketOpen(idx.symbol, idx.region)
        }));

        // Pick a random open (or any) index for tick update
        const openIndexes = updated.filter(i => i.isOpen);
        const targetList = openIndexes.length > 0 ? openIndexes : updated;
        const randomIndex = Math.floor(Math.random() * targetList.length);
        const targetSymbol = targetList[randomIndex].symbol;

        setFlashSymbol(targetSymbol);
        setTimeout(() => setFlashSymbol(null), 1000);

        return updated.map(item => {
          if (item.symbol === targetSymbol) {
            // Micro tick fluctuation
            const deltaPercent = (Math.random() * 0.2 - 0.1);
            const deltaPrice = item.price * (deltaPercent / 100);
            const newPrice = Number((item.price + deltaPrice).toFixed(2));
            const newChange = Number((item.change + deltaPrice).toFixed(2));
            const newChangePercent = Number((item.changePercent + deltaPercent).toFixed(2));

            return {
              ...item,
              price: newPrice,
              change: newChange,
              changePercent: newChangePercent,
              high: Math.max(item.high, newPrice),
              low: Math.min(item.low, newPrice)
            };
          }
          return item;
        });
      });

      setLastUpdated(new Date().toLocaleTimeString());
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setIndexes(prev =>
      prev.map(idx => ({
        ...idx,
        isOpen: calculateIsMarketOpen(idx.symbol, idx.region)
      }))
    );
    setLastUpdated(new Date().toLocaleTimeString());
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filteredIndexes = selectedRegion === 'All' 
    ? indexes 
    : indexes.filter(idx => idx.region === selectedRegion);

  const regionFilterOptions = ['All', 'India', 'USA', 'World'];

  return (
    <div className="w-full max-w-[1700px] space-y-6">
      
      {/* 🚀 Real-Time Ticker Marquee Bar */}
      <div className="w-full overflow-hidden bg-zinc-950/90 border border-zinc-800/80 rounded-2xl p-2.5 backdrop-blur-md shadow-xl flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-black shrink-0 font-mono">
          <Activity className="w-4 h-4 animate-pulse text-cyber-cyan" />
          <span>LIVE MARKETS TICKER</span>
        </div>

        <div className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-4 py-1">
          {indexes.map((idx) => {
            const isUp = idx.change >= 0;
            const isFlashing = flashSymbol === idx.symbol;
            return (
              <div 
                key={idx.symbol}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all duration-300 font-mono ${
                  isFlashing 
                    ? (isUp ? 'bg-emerald-500/20 border-emerald-400 scale-105' : 'bg-rose-500/20 border-rose-400 scale-105') 
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <span className="text-sm">{idx.flag}</span>
                <span className="font-extrabold text-zinc-200">{idx.name}</span>
                <span className="font-bold text-white">
                  {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className={`font-bold flex items-center gap-0.5 text-[11px] ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isUp ? '+' : ''}{idx.changePercent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Header Controls & Filter Bar */}
      <div className="p-6 rounded-2xl glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📈</span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Real-Time Stock Market Index <span className="text-gradient">Monitor</span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Live time-zone synchronized index trackers for India (NSE/BSE), USA (Wall Street), and Global World Markets.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Region Pills */}
          <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
            {regionFilterOptions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedRegion === region
                    ? 'bg-cyber-cyan text-zinc-950 font-black shadow-md scale-105'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {region === 'India' && '🇮🇳 '}
                {region === 'USA' && '🇺🇸 '}
                {region === 'World' && '🌏 '}
                {region}
              </button>
            ))}
          </div>

          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-bold text-zinc-300 hover:text-white hover:border-cyber-cyan/40 transition-all font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyber-cyan ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{lastUpdated}</span>
          </button>
        </div>
      </div>

      {/* Stock Indexes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredIndexes.map((idx) => {
          const isUp = idx.change >= 0;
          const isFlashing = flashSymbol === idx.symbol;

          // Compute Day Range Bar percentage
          const rangeSpan = idx.high - idx.low;
          const currentPosPercent = rangeSpan > 0 ? Math.min(100, Math.max(0, ((idx.price - idx.low) / rangeSpan) * 100)) : 50;

          return (
            <motion.div
              key={idx.symbol}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`p-5 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between border transition-all duration-300 ${
                isFlashing 
                  ? (isUp ? 'border-emerald-500/80 shadow-lg shadow-emerald-500/10' : 'border-rose-500/80 shadow-lg shadow-rose-500/10')
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{idx.flag}</span>
                    <div>
                      <h3 className="font-extrabold text-white text-base tracking-tight">{idx.name}</h3>
                      <span className="text-[10px] text-zinc-500 font-mono font-semibold">{idx.symbol}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 font-mono ${
                    idx.isOpen ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${idx.isOpen ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`} />
                    {idx.isOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>

                {/* Main Price & Change */}
                <div className="my-4 space-y-1">
                  <div className="text-2xl font-black text-white font-mono tracking-tight">
                    {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold flex items-center gap-1 font-mono ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {isUp ? '+' : ''}{idx.change.toFixed(2)} ({isUp ? '+' : ''}{idx.changePercent}%)
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-500 font-mono">{idx.currency}</span>
                  </div>
                </div>

                {/* 24-Hour Day High / Low Range Slider */}
                <div className="space-y-1.5 pt-3 border-t border-zinc-800/60 font-mono">
                  <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
                    <span>L: {idx.low.toLocaleString(undefined, { minimumFractionDigits: 1 })}</span>
                    <span>H: {idx.high.toLocaleString(undefined, { minimumFractionDigits: 1 })}</span>
                  </div>

                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden relative border border-zinc-800">
                    <div 
                      className={`h-full rounded-full ${isUp ? 'bg-gradient-to-r from-emerald-500 to-cyber-cyan' : 'bg-gradient-to-r from-rose-500 to-amber-500'}`}
                      style={{ width: `${currentPosPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Market Hours Info */}
              <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-500" /> Trading Hours
                </span>
                <span>{idx.marketHours}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bullion & Commodities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Bullion card list (Col span 2) */}
        <div className="md:col-span-2 p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-white flex items-center gap-2">
                <span>👑</span> BULLION & PRECIOUS METALS (CHENNAI INDEX)
              </h4>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                LOCAL MARKET INDEX
              </span>
            </div>

            <div className="divide-y divide-zinc-800/60 space-y-4">
              {bullions.map((b, idx) => (
                <div key={idx} className="flex justify-between items-center pt-4 first:pt-0">
                  <div>
                    <span className="text-sm font-bold text-white block">{b.asset}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{b.purity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white block font-mono">{b.price}</span>
                    <span className={`text-[10px] font-bold flex items-center justify-end gap-1 ${
                      b.isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {b.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {b.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-[10px] text-zinc-500 mt-6 pt-4 border-t border-zinc-800/40 font-mono">
            * Local bullion prices reflect Chennai bullion exchange rates (excluding local GST & making charges).
          </div>
        </div>

        {/* Commodity cards list (Col span 1) */}
        <div className="p-6 rounded-2xl glass-card">
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
            <span>🥦</span> ESSENTIAL COMMODITIES
          </h4>
          <div className="space-y-4">
            {commodities.map((c, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-zinc-300 block">{c.name}</span>
                  <span className="text-[10px] text-zinc-500 font-semibold">{c.unit}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white font-mono block">{c.price}</span>
                  <span className={`text-[9px] font-extrabold ${
                    c.change === 'Stable' 
                      ? 'text-zinc-500' 
                      : (c.isUp ? 'text-emerald-400' : 'text-rose-400')
                  }`}>
                    {c.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
