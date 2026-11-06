"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Heart, Plus, Square, Volume2, X } from "lucide-react";
import { Chips, Page, PageHeader, useCopy, useSpeech } from "@/components/site/ui";

const CATEGORIES = [
  { id: "வாழ்க்கை", en: "Life" },
  { id: "காதல்", en: "Love" },
  { id: "நட்பு", en: "Friendship" },
  { id: "இயற்கை", en: "Nature" },
  { id: "தேசம்", en: "Country" },
] as const;
type Category = (typeof CATEGORIES)[number]["id"];

interface Poem {
  id: number;
  category: Category;
  title: string;
  englishTitle: string;
  verses: string[];
  likes: number;
  author?: string;
}

const INITIAL_POEMS: Poem[] = [
  { id: 1, category: "வாழ்க்கை", title: "விடியல் வரையும் வரைபடம்", englishTitle: "Map of the Sunrise", likes: 42, author: "மரபு நிலா", verses: ["இருளின் மடியில் உறங்கும் உலகம்,", "வெளிச்சக் கீற்றால் விழித்துக் கொள்ளும்.", "விடியலின் அழகில் உறையும் பனித்துளி,", "புன்னகை சிந்திப் புவிக்குத் திரும்பும்.", "கனவுகள் யாவும் நிஜமாய் மாறும்,", "நம்பிக்கை கொண்டால் விடியல் தூரம் இல்லை!"] },
  { id: 2, category: "வாழ்க்கை", title: "வாழ்க்கை ஒரு பயணம்", englishTitle: "Life is a Journey", likes: 38, author: "பாரதி அடியான்", verses: ["கரடு முரடான பாதைகள் வரலாம்,", "சோர்ந்து போகாமல் நடப்பதே அழகு.", "விழுந்தால் எழுந்திடு ஒரு புயல் போல,", "வெற்றி உன் கையில் விடைபெறாது.", "நாளை நமதே என்ற முழக்கத்தோடு,", "தொடரட்டும் உன் வீரப் பயணம்!"] },
  { id: 3, category: "காதல்", title: "கண் சிமிட்டும் கவிதையே", englishTitle: "Blinking Poetry", likes: 55, author: "காதல் கவிஞன்", verses: ["உன் விழிப் பார்வையில் பூத்த பூக்கள்,", "என் நெஞ்சில் நறுமணம் வீசுதடி!", "மௌனத்தின் மொழியில் பேசும் இரவுகள்,", "உன் நினைவுகளால் ஒளிருதடி."] },
  { id: 4, category: "இயற்கை", title: "மழையின் சங்கீதம்", englishTitle: "Symphony of Rain", likes: 29, author: "இயற்கைப் பிரியன்", verses: ["வானம் சிந்தும் முத்து மணிகள்,", "பூமியின் தாகம் தீர்க்கும் அமுதம்.", "மரங்களின் இலைகளில் தாலாட்டு பாடி,", "மண்ணின் மனதை மகிழ்விக்கும் மழை!"] },
  { id: 5, category: "நட்பு", title: "தோளின் சுமை தாங்கி", englishTitle: "Pillar of Friendship", likes: 47, author: "நட்பின் நதி", verses: ["வார்த்தைகள் தேவையில்லாத பந்தம்,", "வாழ்கையின் நிழலாய் தொடரும் சொந்தம்.", "துன்பத்தில் கரம் கொடுக்கும் தோழன்,", "இறைவன் தந்த இன்முகப் பரிசு!"] },
  { id: 6, category: "தேசம்", title: "தமிழ் மண்ணின் வீரம்", englishTitle: "Valor of Tamil Soil", likes: 61, author: "தமிழ் தொண்டன்", verses: ["பழம்பெரும் மொழியின் பெருமை காப்போம்,", "பாரதி வழியில் அறத்தைப் பரப்புவோம்.", "வீரமும் ஈரமும் நிறைந்த நெஞ்சோடு,", "தமிழ் தாயின் புகழ் கொடியை ஏற்றுவோம்!"] },
];

const FILTERS = [{ id: "All", label: "All" }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.id }))] as { id: string; label: string }[];

const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export default function KavithaiView() {
  const [poems, setPoems] = useState(INITIAL_POEMS);
  const [liked, setLiked] = useState<number[]>([]);
  const [filter, setFilter] = useState("All");
  const [composing, setComposing] = useState(false);
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState<Category>("வாழ்க்கை");
  const { speaking, speak } = useSpeech();
  const { copied, copy } = useCopy();

  useEffect(() => {
    const savedPoems = load<Poem[]>("user-kavithai-list");
    const savedLikes = load<number[]>("user-kavithai-likes");
    if (savedPoems) setPoems(savedPoems);
    if (savedLikes) setLiked(savedLikes);
  }, []);

  const toggleLike = (id: number) => {
    const isLiked = liked.includes(id);
    const nextLiked = isLiked ? liked.filter((i) => i !== id) : [...liked, id];
    const nextPoems = poems.map((p) => (p.id === id ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p));
    setLiked(nextLiked);
    setPoems(nextPoems);
    save("user-kavithai-likes", nextLiked);
    save("user-kavithai-list", nextPoems);
  };

  const compose = (e: React.FormEvent) => {
    e.preventDefault();
    const t = topic.trim();
    if (!t) return;
    const next: Poem[] = [
      {
        id: Date.now(),
        category,
        title: `${t} குறித்த கவிதை`,
        englishTitle: `A poem on ${t}`,
        verses: [
          `${t} தந்த வெளிச்சத்தில் நெஞ்சம் விழிக்கும்,`,
          "அன்பின் பாதையில் அரும்புகள் பூக்கும்.",
          "நம்பிக்கை சுடராய் பிரகாசிக்கும் காலம்,",
          "வெற்றி மாலை சூடும் புதிய விடியல்!",
        ],
        likes: 0,
      },
      ...poems,
    ];
    setPoems(next);
    save("user-kavithai-list", next);
    setTopic("");
    setComposing(false);
  };

  const shown = filter === "All" ? poems : poems.filter((p) => p.category === filter);

  return (
    <Page>
      <PageHeader title={<span className="font-tamil">கவிதைகள்</span>} intro="Tamil poems on life, love, friendship, nature and country. Press Listen to hear one read aloud.">
        <button onClick={() => setComposing(!composing)} className="btn self-start md:self-auto shrink-0" aria-expanded={composing}>
          {composing ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} Make a poem from a template
        </button>
      </PageHeader>

      {composing && (
        <form onSubmit={compose} className="panel p-5 mb-6 grid sm:grid-cols-[1fr_12rem_auto] gap-3 items-end">
          <label className="text-sm">
            <span className="block mb-1 text-muted">Topic</span>
            <input className="field font-tamil" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="மழை, அம்மா, வெற்றி..." />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-muted">Category</span>
            <select className="field" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.en}</option>)}
            </select>
          </label>
          <button type="submit" disabled={!topic.trim()} className="btn btn-primary">Add poem</button>
          <p className="sm:col-span-3 text-sm text-muted">This fills your topic into a fixed verse. It&apos;s saved in this browser only.</p>
        </form>
      )}

      <Chips label="Filter by category" options={FILTERS} value={filter} onChange={setFilter} />

      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map((poem) => {
          const isLiked = liked.includes(poem.id);
          const text = `${poem.title} (${poem.englishTitle})\n\n${poem.verses.join("\n")}${poem.author ? `\n\n— ${poem.author}` : ""}`;
          return (
            <article key={poem.id} className="panel p-6 flex flex-col">
              <h2 className="font-tamil text-xl leading-snug">{poem.title}</h2>
              <div className="mt-1 text-sm text-muted">{poem.englishTitle}</div>
              <div className="my-5 flex-1 font-tamil leading-loose">
                {poem.verses.map((v) => <p key={v}>{v}</p>)}
              </div>
              {poem.author && <div className="font-tamil text-sm text-muted mb-3">— {poem.author}</div>}
              <div className="flex items-center justify-between border-t border-line pt-3 -mb-2 -mx-2">
                <button onClick={() => toggleLike(poem.id)} aria-pressed={isLiked} aria-label={`Like ${poem.englishTitle}`} className="flex items-center gap-1.5 px-2 h-9 text-sm text-muted hover:text-ink cursor-pointer">
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-accent text-accent" : ""}`} /> {poem.likes}
                </button>
                <div className="flex items-center">
                  <button onClick={() => speak(poem.id, `${poem.title}. ${poem.verses.join(". ")}`)} className="flex items-center gap-1.5 px-2 h-9 text-sm text-muted hover:text-ink cursor-pointer">
                    {speaking === poem.id ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-4 h-4" />}
                    {speaking === poem.id ? "Stop" : "Listen"}
                  </button>
                  <button onClick={() => copy(text, String(poem.id))} className="icon-btn" aria-label={`Copy ${poem.englishTitle}`}>
                    {copied === String(poem.id) ? <Check className="w-4 h-4 text-up" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Page>
  );
}
