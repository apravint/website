"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Search, Square, Volume2 } from "lucide-react";
import { Chips, Page, useCopy, useSpeech } from "@/components/site/ui";

type Author = "ta_mu_va" | "ta_salamon" | "ta_kalaignar" | "en";

interface Kural {
  number: number;
  chapter: string;
  section: string;
  kural: string[];
  meaning: Record<Author, string>;
}

const AUTHORS: { id: Author; label: string }[] = [
  { id: "ta_mu_va", label: "மு. வரதராசனார்" },
  { id: "ta_salamon", label: "சாலமன் பாப்பையா" },
  { id: "ta_kalaignar", label: "கலைஞர்" },
  { id: "en", label: "English" },
];

const SECTIONS = ["All", "அறத்துப்பால்", "பொருட்பால்", "காமத்துப்பால்"].map((id) => ({ id, label: id === "All" ? "All" : id }));
const PER_PAGE = 20;

export default function ThirukkuralView() {
  const [kurals, setKurals] = useState<Kural[]>([]);
  const [failed, setFailed] = useState(false);
  const [daily, setDaily] = useState<Kural | null>(null);
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("All");
  const [author, setAuthor] = useState<Author>("ta_mu_va");
  const [page, setPage] = useState(1);
  const { speaking, speak } = useSpeech();
  const { copied, copy } = useCopy();

  useEffect(() => {
    fetch("/assets/thirukkural.json")
      .then((res) => res.json())
      .then((data: { kurals: Kural[] }) => {
        setKurals(data.kurals);
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        setDaily(data.kurals[dayOfYear % data.kurals.length]);
      })
      .catch(() => setFailed(true));
  }, []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    return kurals.filter((k) => {
      if (section !== "All" && k.section !== section) return false;
      if (!q) return true;
      return (
        k.number.toString() === q ||
        k.chapter.toLowerCase().includes(q) ||
        k.kural.some((line) => line.toLowerCase().includes(q)) ||
        (k.meaning[author] || "").toLowerCase().includes(q)
      );
    });
  }, [kurals, query, section, author]);

  const totalPages = Math.ceil(results.length / PER_PAGE) || 1;
  const current = Math.min(page, totalPages);
  const visible = results.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const goTo = (p: number) => {
    setPage(p);
    document.getElementById("results")?.scrollIntoView();
  };

  return (
    <Page>
      <h1 className="font-tamil text-4xl sm:text-5xl tracking-tight">திருக்குறள்</h1>
      <p className="mt-3 text-muted">1,330 couplets in 133 chapters, with three Tamil commentaries and an English translation.</p>

      {daily && (
        <section className="mt-10 border-y border-line py-10 sm:py-14 text-center">
          <div className="eyebrow">Kural of the day · {daily.number}</div>
          <blockquote className="mt-5 font-tamil text-2xl sm:text-3xl leading-relaxed">
            <p>{daily.kural[0]}</p>
            <p>{daily.kural[1]}</p>
          </blockquote>
          <div className="mt-3 font-tamil text-sm text-muted">{daily.chapter} · {daily.section}</div>
          <p className={`mt-5 mx-auto max-w-2xl text-muted leading-relaxed ${author === "en" ? "" : "font-tamil"}`}>{daily.meaning[author]}</p>
        </section>
      )}

      <div id="results" className="mt-10 scroll-mt-20 space-y-3">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
          <input
            type="search"
            aria-label="Search kurals"
            placeholder="Search by number, chapter or text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="field !pl-9 font-tamil"
          />
        </div>
        <Chips label="Filter by section" options={SECTIONS} value={section} onChange={(s) => { setSection(s); setPage(1); }} />
        <Chips label="Choose a commentary" options={AUTHORS} value={author} onChange={setAuthor} />
      </div>

      <div className="mt-6 text-sm text-muted" aria-live="polite">
        {failed ? "The Thirukkural couldn't be loaded. Refresh the page to try again." : kurals.length === 0 ? "Loading…" : `${results.length.toLocaleString()} kurals`}
      </div>

      <ol className="mt-2 divide-y divide-line">
        {visible.map((k) => (
          <li key={k.number} className="py-6 grid sm:grid-cols-[3.5rem_1fr_auto] gap-x-4 gap-y-2">
            <span className="font-mono text-sm text-accent pt-1">{k.number}</span>
            <div>
              <div className="font-tamil text-lg leading-relaxed">
                <p>{k.kural[0]}</p>
                <p>{k.kural[1]}</p>
              </div>
              <p className={`mt-2 text-sm text-muted leading-relaxed ${author === "en" ? "" : "font-tamil"}`}>{k.meaning[author]}</p>
              <div className="mt-2 font-tamil text-xs text-muted">{k.chapter} · {k.section}</div>
            </div>
            <div className="flex sm:flex-col gap-1">
              <button onClick={() => speak(k.number, `${k.kural[0]}. ${k.kural[1]}`)} className="icon-btn" aria-label={`Listen to kural ${k.number}`}>
                {speaking === k.number ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button onClick={() => copy(`திருக்குறள் ${k.number} (${k.chapter})\n${k.kural[0]}\n${k.kural[1]}\n\n${k.meaning[author]}`, String(k.number))} className="icon-btn" aria-label={`Copy kural ${k.number}`}>
                {copied === String(k.number) ? <Check className="w-4 h-4 text-up" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </li>
        ))}
      </ol>

      {kurals.length > 0 && results.length === 0 && <p className="py-12 text-center text-muted">No kurals match your search.</p>}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button disabled={current === 1} onClick={() => goTo(current - 1)} className="btn"><ChevronLeft className="w-4 h-4" /> Previous</button>
          <span className="text-muted">Page {current} of {totalPages}</span>
          <button disabled={current === totalPages} onClick={() => goTo(current + 1)} className="btn">Next <ChevronRight className="w-4 h-4" /></button>
        </nav>
      )}
    </Page>
  );
}
