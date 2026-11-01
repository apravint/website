"use client";

import { useEffect, useState } from "react";
import { Chips, Page, PageHeader } from "@/components/site/ui";

type Region = "India" | "USA" | "World";

interface Exchange {
  name: string;
  region: Region;
  timeZone: string;
  open: number; // minutes after local midnight
  close: number;
  indices: { name: string; level: number; currency: string }[];
}

const EXCHANGES: Exchange[] = [
  {
    name: "NSE and BSE, Mumbai", region: "India", timeZone: "Asia/Kolkata", open: 555, close: 930,
    indices: [
      { name: "NIFTY 50", level: 25182.5, currency: "₹" },
      { name: "SENSEX", level: 82365.8, currency: "₹" },
      { name: "NIFTY Bank", level: 51420.1, currency: "₹" },
      { name: "NIFTY IT", level: 42890.75, currency: "₹" },
    ],
  },
  {
    name: "NYSE and Nasdaq, New York", region: "USA", timeZone: "America/New_York", open: 570, close: 960,
    indices: [
      { name: "S&P 500", level: 5738.1, currency: "$" },
      { name: "Nasdaq Composite", level: 18074.5, currency: "$" },
      { name: "Dow Jones", level: 42124.65, currency: "$" },
      { name: "Russell 2000", level: 2220.4, currency: "$" },
    ],
  },
  { name: "LSE, London", region: "World", timeZone: "Europe/London", open: 480, close: 990, indices: [{ name: "FTSE 100", level: 8280.5, currency: "£" }] },
  { name: "Xetra, Frankfurt", region: "World", timeZone: "Europe/Berlin", open: 540, close: 1050, indices: [{ name: "DAX", level: 19238.2, currency: "€" }] },
  { name: "TSE, Tokyo", region: "World", timeZone: "Asia/Tokyo", open: 540, close: 900, indices: [{ name: "Nikkei 225", level: 37870.2, currency: "¥" }] },
  { name: "HKEX, Hong Kong", region: "World", timeZone: "Asia/Hong_Kong", open: 570, close: 960, indices: [{ name: "Hang Seng", level: 19924.5, currency: "HK$" }] },
];

const BULLION = [
  { name: "Gold 24K", unit: "per gram", price: "₹7,420" },
  { name: "Gold 22K", unit: "per gram", price: "₹6,802" },
  { name: "Silver", unit: "per 10 grams", price: "₹935" },
  { name: "Platinum", unit: "per gram", price: "₹3,510" },
];

const COMMODITIES = [
  { name: "Basmati rice", unit: "per kg", price: "₹98" },
  { name: "Bellary onion", unit: "per kg", price: "₹45" },
  { name: "Tomato", unit: "per kg", price: "₹30" },
  { name: "Coconut oil", unit: "per litre", price: "₹215" },
  { name: "Milk", unit: "per litre", price: "₹60" },
  { name: "Sugar", unit: "per kg", price: "₹45" },
];

const REGIONS = [
  { id: "All", label: "All" },
  { id: "India", label: "India" },
  { id: "USA", label: "USA" },
  { id: "World", label: "World" },
] as const;

const hhmm = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

function localClock(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  const weekday = get("weekday");
  const mins = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
  return { weekday, mins, label: hhmm(mins), weekend: weekday === "Sat" || weekday === "Sun" };
}

function PriceList({ title, rows }: { title: string; rows: { name: string; unit: string; price: string }[] }) {
  return (
    <div className="panel p-5">
      <h3 className="font-medium">{title}</h3>
      <ul className="mt-3 divide-y divide-line text-sm">
        {rows.map((r) => (
          <li key={r.name} className="flex items-baseline justify-between gap-4 py-2">
            <span>{r.name} <span className="text-muted">{r.unit}</span></span>
            <span className="font-mono tabular-nums">{r.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MarketsView() {
  const [now, setNow] = useState<Date | null>(null);
  const [region, setRegion] = useState<(typeof REGIONS)[number]["id"]>("All");

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  const shown = region === "All" ? EXCHANGES : EXCHANGES.filter((e) => e.region === region);

  return (
    <Page>
      <PageHeader title="Markets" intro="Which exchanges are open right now, worked out from each exchange's local time. Public holidays aren't accounted for." />
      <Chips label="Filter by region" options={REGIONS} value={region} onChange={setRegion} />

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {shown.map((e) => {
          const clock = now && localClock(now, e.timeZone);
          const open = !!clock && !clock.weekend && clock.mins >= e.open && clock.mins <= e.close;
          return (
            <div key={e.name} className="panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">{e.name}</h2>
                  <p className="mt-0.5 text-sm text-muted">
                    Trades {hhmm(e.open)} to {hhmm(e.close)} local{clock && `, now ${clock.weekday} ${clock.label}`}
                  </p>
                </div>
                {clock && (
                  <span className={`shrink-0 flex items-center gap-1.5 text-sm ${open ? "text-up" : "text-muted"}`}>
                    <span className={`w-2 h-2 rounded-full ${open ? "bg-up" : "bg-muted/50"}`} />
                    {open ? "Open" : "Closed"}
                  </span>
                )}
              </div>
              <ul className="mt-3 text-sm divide-y divide-line">
                {e.indices.map((i) => (
                  <li key={i.name} className="flex justify-between py-1.5">
                    <span>{i.name}</span>
                    <span className="font-mono tabular-nums text-muted">
                      {i.currency}{i.level.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <PriceList title="Bullion, Chennai" rows={BULLION} />
        <PriceList title="Essentials" rows={COMMODITIES} />
      </div>

      <p className="mt-4 text-sm text-muted">
        Index levels and prices are fixed reference figures, not live quotes. Don&apos;t use them for trading or buying decisions.
      </p>
    </Page>
  );
}
