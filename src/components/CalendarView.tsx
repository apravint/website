"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Page } from "@/components/site/ui";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = [
  { en: "Sun", ta: "ஞாயிறு" }, { en: "Mon", ta: "திங்கள்" }, { en: "Tue", ta: "செவ்வாய்" }, { en: "Wed", ta: "புதன்" },
  { en: "Thu", ta: "வியாழன்" }, { en: "Fri", ta: "வெள்ளி" }, { en: "Sat", ta: "சனி" },
];

const TAMIL_MONTHS = ["மார்கழி", "தை", "மாசி", "பங்குனி", "சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி", "ஐப்பசி", "கார்த்திகை"];
const TAMIL_MONTHS_EN = ["Margazhi", "Thai", "Maasi", "Panguni", "Chithirai", "Vaikasi", "Aani", "Aadi", "Avani", "Purattasi", "Aippasi", "Karthigai"];

// For each Gregorian month: the day the next Tamil month begins, and the Tamil day number on the 1st.
// Index i of TAMIL_MONTHS is the Tamil month in progress when Gregorian month i begins.
const MONTH_STARTS: [cut: number, firstDay: number][] = [
  [14, 18], [13, 19], [15, 17], [14, 18], [15, 18], [15, 17], [16, 17], [17, 17], [17, 16], [18, 15], [17, 15], [16, 15],
];

// 60-year cycle; index 0 (Prabhava) began in April 1987.
const TAMIL_YEARS = [
  ["Prabhava", "பிரபவ"], ["Vibhava", "விபவ"], ["Sukla", "சுக்ல"], ["Pramodoota", "பிரமோதூத"], ["Prajothpatti", "பிரஜோற்பத்தி"],
  ["Aangirasa", "ஆங்கீரச"], ["Srimukha", "ஸ்ரீமுக"], ["Bhava", "பவ"], ["Yuva", "யுவ"], ["Dhaatu", "தாது"],
  ["Eesvara", "ஈஸ்வர"], ["Vehudhanya", "வெகுதானிய"], ["Pramathi", "பிரமாதி"], ["Vikrama", "விக்ரம"], ["Vishu", "விஷு"],
  ["Chithrabhanu", "சித்ரபானு"], ["Subhanu", "சுபானு"], ["Tharana", "தாரண"], ["Parthiba", "பார்த்திப"], ["Viya", "விய"],
  ["Sarvajith", "சர்வஜித்"], ["Sarvadhari", "சர்வதாரி"], ["Virodhi", "விரோதி"], ["Vikruthi", "விக்ருதி"], ["Khara", "கர"],
  ["Nandhana", "நந்தன"], ["Vijaya", "விஜய"], ["Jaya", "ஜய"], ["Manmatha", "மன்மத"], ["Dhunmuki", "துன்முகி"],
  ["Hevilambi", "ஹேவிளம்பி"], ["Vilambi", "விளம்பி"], ["Vikari", "விகாரி"], ["Sharvari", "சார்வரி"], ["Plava", "பிலவ"],
  ["Subhakruth", "சுபகிருது"], ["Sobhakruth", "சோபகிருது"], ["Krodhi", "குரோதி"], ["Visvavasu", "விசுவாவசு"], ["Parabhava", "பராபவ"],
  ["Plavanga", "பிலவங்க"], ["Keelaka", "கீலக"], ["Saumya", "சௌமிய"], ["Sadharana", "சாதாரண"], ["Virodhikruthu", "விரோதிகிருது"],
  ["Paridhabi", "பரிதாபி"], ["Pramadhicha", "பிரமாதீச"], ["Aanandha", "ஆனந்த"], ["Rakshasa", "ராட்சச"], ["Nala", "நள"],
  ["Pingala", "பிங்கள"], ["Kalayukthi", "காளயுக்தி"], ["Siddharthi", "சித்தார்த்தி"], ["Raudhri", "ரௌத்திரி"], ["Dhunmathi", "துன்மதி"],
  ["Dhundhubhi", "துந்துபி"], ["Rudhrodhgari", "ருத்ரோத்காரி"], ["Rakthakshi", "ரக்தாட்சி"], ["Krodhana", "குரோதன"], ["Akshaya", "அட்சய"],
];

function tamilDate(year: number, month: number, day: number) {
  const [cut, firstDay] = MONTH_STARTS[month];
  const after = day >= cut;
  const idx = (month + (after ? 1 : 0)) % 12;
  const tDay = after ? day - cut + 1 : firstDay + day - 1;
  const cycleYear = month > 3 || (month === 3 && day >= 14) ? year : year - 1;
  const [yearEn, yearTa] = TAMIL_YEARS[(((cycleYear - 1987) % 60) + 60) % 60];
  return { monthTa: TAMIL_MONTHS[idx], monthEn: TAMIL_MONTHS_EN[idx], day: tDay, yearEn, yearTa };
}

// Holidays that fall on the same Gregorian date every year.
const HOLIDAYS: { month: number; day: number; name: string; ta: string }[] = [
  { month: 0, day: 1, name: "New Year's Day", ta: "ஆங்கில புத்தாண்டு" },
  { month: 0, day: 26, name: "Republic Day", ta: "குடியரசு தினம்" },
  { month: 3, day: 14, name: "Tamil New Year", ta: "தமிழ் புத்தாண்டு" },
  { month: 4, day: 1, name: "May Day", ta: "உழைப்பாளர் தினம்" },
  { month: 7, day: 15, name: "Independence Day", ta: "சுதந்திர தினம்" },
  { month: 9, day: 2, name: "Gandhi Jayanti", ta: "காந்தி ஜெயந்தி" },
  { month: 11, day: 25, name: "Christmas Day", ta: "கிறிஸ்துமஸ்" },
];

// Weekday tables, assuming sunrise at 06:00. Sunday first.
const TIMINGS = [
  { name: "ராகு காலம்", en: "Rahu Kaalam", slots: ["4:30–6:00 PM", "7:30–9:00 AM", "3:00–4:30 PM", "12:00–1:30 PM", "1:30–3:00 PM", "10:30 AM–12:00 PM", "9:00–10:30 AM"] },
  { name: "எமகண்டம்", en: "Yamagandam", slots: ["12:00–1:30 PM", "10:30 AM–12:00 PM", "9:00–10:30 AM", "7:30–9:00 AM", "6:00–7:30 AM", "3:00–4:30 PM", "1:30–3:00 PM"] },
  { name: "குளிகை", en: "Kuligai", slots: ["3:00–4:30 PM", "1:30–3:00 PM", "12:00–1:30 PM", "10:30 AM–12:00 PM", "9:00–10:30 AM", "7:30–9:00 AM", "6:00–7:30 AM"] },
];

export default function CalendarView() {
  // Dates depend on the visitor's clock, so they're set after hydration.
  const [today, setToday] = useState<Date | null>(null);
  const [view, setView] = useState({ year: 2026, month: 0 });
  const [selected, setSelected] = useState(1);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setView({ year: now.getFullYear(), month: now.getMonth() });
    setSelected(now.getDate());
  }, []);

  if (!today) return <Page><div className="min-h-[60vh]" /></Page>;

  const { year, month } = view;
  const shift = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(1);
  };

  const total = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(new Date(year, month, 1).getDay()).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const holiday = (d: number) => HOLIDAYS.find((h) => h.month === month && h.day === d);

  const info = tamilDate(year, month, selected);
  const weekday = new Date(year, month, selected).getDay();
  const selectedHoliday = holiday(selected);

  return (
    <Page>
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight">{MONTHS[month]} {year}</h1>
          <p className="mt-2 font-tamil text-muted">{info.yearTa} வருடம் ({info.yearEn})</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => shift(-1)} className="btn !px-2.5" aria-label="Previous month"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => shift(1)} className="btn !px-2.5" aria-label="Next month"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_21rem] gap-6 items-start">
        <div>
          <div className="grid grid-cols-7 text-center mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d.en} className="py-1">
                <div className="text-xs sm:text-sm">{d.en}</div>
                <div className="hidden sm:block font-tamil text-xs text-muted">{d.ta}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={`blank-${i}`} />;
              const t = tamilDate(year, month, d);
              const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = d === selected;
              return (
                <button
                  key={d}
                  onClick={() => setSelected(d)}
                  aria-pressed={isSelected}
                  aria-label={`${d} ${MONTHS[month]}${holiday(d) ? `, ${holiday(d)!.name}` : ""}`}
                  className={`relative min-h-14 sm:min-h-20 p-1.5 sm:p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                    isSelected ? "bg-ink text-bg border-ink" : "bg-surface border-line hover:border-muted"
                  }`}
                >
                  <span className={`text-sm sm:text-base ${isToday && !isSelected ? "text-accent font-semibold" : ""}`}>{d}</span>
                  <span className={`block font-tamil text-[10px] sm:text-xs truncate ${isSelected ? "opacity-70" : "text-muted"}`}>
                    {t.day === 1 ? t.monthTa : t.day}
                  </span>
                  {holiday(d) && <span className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-bg" : "bg-accent"}`} />}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="panel p-6">
          <div className="eyebrow">{WEEKDAYS[weekday].en}, {selected} {MONTHS[month]}</div>
          <div className="mt-2 font-tamil text-2xl">{info.monthTa} {info.day}</div>
          <div className="text-sm text-muted">{info.monthEn} {info.day}, <span className="font-tamil">{WEEKDAYS[weekday].ta}</span></div>
          {selectedHoliday && (
            <div className="mt-4 rounded-lg bg-surface-2 p-3 text-sm">
              <div className="font-medium">{selectedHoliday.name}</div>
              <div className="font-tamil text-muted">{selectedHoliday.ta}</div>
            </div>
          )}
          <dl className="mt-5 divide-y divide-line text-sm">
            {TIMINGS.map((t) => (
              <div key={t.en} className="flex justify-between gap-4 py-2.5">
                <dt><span className="font-tamil">{t.name}</span><span className="block text-xs text-muted">{t.en}</span></dt>
                <dd className="font-mono text-xs text-right pt-0.5">{t.slots[weekday]}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted leading-relaxed">
            Timings assume a 6:00 AM sunrise and Tamil dates are approximate, so check a local panchangam for
            anything important. Festivals that move each year aren&apos;t shown.
          </p>
        </aside>
      </div>
    </Page>
  );
}
