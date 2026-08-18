"use client";

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Star } from 'lucide-react';

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

export default function MarketTab() {
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  const bullions: BullionRate[] = [
    { asset: "Gold (24K)", purity: "99.9% Pure per Gram", price: "₹7,245.00", change: "+₹24.00 (0.33%)", isUp: true },
    { asset: "Gold (22K)", purity: "Jewellery Gold per Gram", price: "₹6,641.00", change: "+₹22.00 (0.33%)", isUp: true },
    { asset: "Silver", purity: "99.9% Pure per 10 Gram", price: "₹912.00", change: "-₹4.50 (0.49%)", isUp: false },
    { asset: "Platinum", purity: "95% Pure per Gram", price: "₹3,450.00", change: "+₹15.00 (0.44%)", isUp: true }
  ];

  const commodities: CommodityRate[] = [
    { name: "Rice (Basmati)", price: "₹95.00", unit: "per Kg", change: "Stable", isUp: true },
    { name: "Onion (Bellary)", price: "₹48.00", unit: "per Kg", change: "-₹2.00", isUp: false },
    { name: "Tomato (Local)", price: "₹32.00", unit: "per Kg", change: "-₹5.00", isUp: false },
    { name: "Coconut Oil", price: "₹210.00", unit: "per Litre", change: "+₹4.00", isUp: true },
    { name: "Milk (Pasteurized)", price: "₹60.00", unit: "per Litre", change: "Stable", isUp: true },
    { name: "Sugar (White refined)", price: "₹44.00", unit: "per Kg", change: "+₹1.50", isUp: true }
  ];

  const handleRefresh = () => {
    setLastUpdated(new Date().toLocaleTimeString());
  };

  return (
    <div className="w-full max-w-5xl space-y-6">
      {/* Header Info */}
      <div className="flex justify-between items-center p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div>
          <h3 className="font-bold text-white">Market Price Index</h3>
          <p className="text-xs text-zinc-500">Live prices for bullion and essential food commodities.</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-white hover:border-cyber-cyan/30 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refreshed: {lastUpdated}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bullion card list (Col span 2) */}
        <div className="md:col-span-2 p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-white mb-4 flex items-center gap-1.5">
              👑 BULLION RATES (CHENNAI)
            </h4>
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
                      b.isUp ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {b.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {b.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-[10px] text-zinc-500 mt-6 pt-4 border-t border-zinc-800/40">
            * Local gold rates include typical import tariffs but exclude local GST (3%) and jewellery making charges.
          </div>
        </div>

        {/* Commodity cards list (Col span 1) */}
        <div className="p-6 rounded-2xl glass-card">
          <h4 className="font-bold text-white mb-4 flex items-center gap-1.5">
            🥦 VEGETABLES & GROCERY
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
                      : (c.isUp ? 'text-emerald-400' : 'text-red-400')
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
