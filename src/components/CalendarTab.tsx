"use client";

import React, { useState } from 'react';
import { Calendar as LucideCalendar, ChevronLeft, ChevronRight, Clock, Star, Sparkles } from 'lucide-react';

interface Festival {
  month: number;
  day: number;
  name: string;
  nameTa: string;
  type: 'government' | 'hindu' | 'muslim' | 'christian';
}

interface TamilDateInfo {
  monthNameEn: string;
  monthNameTa: string;
  day: number;
  yearNameEn: string;
  yearNameTa: string;
  fullTamilDate: string;
}

export default function CalendarTab() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = [
    { en: "SUN", ta: "ஞாயிறு" },
    { en: "MON", ta: "திங்கள்" },
    { en: "TUE", ta: "செவ்வாய்" },
    { en: "WED", ta: "புதன்" },
    { en: "THU", ta: "வியாழன்" },
    { en: "FRI", ta: "வெள்ளி" },
    { en: "SAT", ta: "சனி" }
  ];

  // Helper to calculate exact Tamil month, day, and year for any given Gregorian date
  const getTamilDateInfo = (year: number, month: number, day: number): TamilDateInfo => {
    // Tamil month boundaries approximate map
    let monthEn = "";
    let monthTa = "";
    let tDay = 1;

    if (month === 0) { // Jan
      if (day < 14) { monthEn = "Margazhi"; monthTa = "மார்கழி"; tDay = day + 17; }
      else { monthEn = "Thai"; monthTa = "தை"; tDay = day - 13; }
    } else if (month === 1) { // Feb
      if (day < 13) { monthEn = "Thai"; monthTa = "தை"; tDay = day + 18; }
      else { monthEn = "Maasi"; monthTa = "மாசி"; tDay = day - 12; }
    } else if (month === 2) { // Mar
      if (day < 15) { monthEn = "Maasi"; monthTa = "மாசி"; tDay = day + 16; }
      else { monthEn = "Panguni"; monthTa = "பங்குனி"; tDay = day - 14; }
    } else if (month === 3) { // Apr
      if (day < 14) { monthEn = "Panguni"; monthTa = "பங்குனி"; tDay = day + 17; }
      else { monthEn = "Chithirai"; monthTa = "சித்திரை"; tDay = day - 13; }
    } else if (month === 4) { // May
      if (day < 15) { monthEn = "Chithirai"; monthTa = "சித்திரை"; tDay = day + 17; }
      else { monthEn = "Vaikasi"; monthTa = "வைகாசி"; tDay = day - 14; }
    } else if (month === 5) { // Jun
      if (day < 15) { monthEn = "Vaikasi"; monthTa = "வைகாசி"; tDay = day + 16; }
      else { monthEn = "Aani"; monthTa = "ஆனி"; tDay = day - 14; }
    } else if (month === 6) { // Jul
      if (day < 16) { monthEn = "Aani"; monthTa = "ஆனி"; tDay = day + 16; }
      else { monthEn = "Aadi"; monthTa = "ஆடி"; tDay = day - 15; }
    } else if (month === 7) { // Aug
      if (day < 17) { monthEn = "Aadi"; monthTa = "ஆடி"; tDay = day + 16; }
      else { monthEn = "Avani"; monthTa = "ஆவணி"; tDay = day - 16; }
    } else if (month === 8) { // Sep
      if (day < 17) { monthEn = "Avani"; monthTa = "ஆவணி"; tDay = day + 15; }
      else { monthEn = "Purattasi"; monthTa = "புரட்டாசி"; tDay = day - 16; }
    } else if (month === 9) { // Oct
      if (day < 18) { monthEn = "Purattasi"; monthTa = "புரட்டாசி"; tDay = day + 14; }
      else { monthEn = "Aippasi"; monthTa = "ஐப்பசி"; tDay = day - 17; }
    } else if (month === 10) { // Nov
      if (day < 17) { monthEn = "Aippasi"; monthTa = "ஐப்பசி"; tDay = day + 14; }
      else { monthEn = "Karthigai"; monthTa = "கார்த்திகை"; tDay = day - 16; }
    } else { // Dec
      if (day < 16) { monthEn = "Karthigai"; monthTa = "கார்த்திகை"; tDay = day + 14; }
      else { monthEn = "Margazhi"; monthTa = "மார்கழி"; tDay = day - 15; }
    }

    const tamilYears = [
      { en: "Prabhava", ta: "பிரபவ" }, { en: "Vibhava", ta: "விபவ" }, { en: "Sukla", ta: "சுக்ல" },
      { en: "Pramodoota", ta: "பிரமோதூத" }, { en: "Prajothpatti", ta: "பிரஜோற்பத்தி" }, { en: "Aangirasa", ta: "ஆங்கீரச" },
      { en: "Srimukha", ta: "ஸ்ரீமுக" }, { en: "Bhava", ta: "பவ" }, { en: "Yuva", ta: "யுவ" },
      { en: "Dhaatu", ta: "தாது" }, { en: "Eesvara", ta: "ஈஸ்வர" }, { en: "Vehudhanya", ta: "வெகுதானிய" },
      { en: "Pramathi", ta: "பிரமாதி" }, { en: "Vikrama", ta: "விக்ரம" }, { en: "Visha", ta: "விஷு" },
      { en: "Chithrabhanu", ta: "சித்ரபானு" }, { en: "Subhanu", ta: "சுபானு" }, { en: "Tharana", ta: "தாரண" },
      { en: "Parthiba", ta: "பார்த்திப" }, { en: "Viya", ta: "விய" }, { en: "Sarvajith", ta: "சர்வஜித்" },
      { en: "Sarvadhari", ta: "சர்வதாரி" }, { en: "Virodhi", ta: "விரோதி" }, { en: "Vikruthi", ta: "விக்ருதி" },
      { en: "Khara", ta: "கர" }, { en: "Nandhana", ta: "நந்தன" }, { en: "Vijaya", ta: "விஜய" },
      { en: "Jaya", ta: "ஜய" }, { en: "Manmatha", ta: "மன்மத" }, { en: "Dhunmuki", ta: "துன்முகி" },
      { en: "Hevilambi", ta: "ஹேவிளம்பி" }, { en: "Vilambi", ta: "விளம்பி" }, { en: "Vikari", ta: "விகாரி" },
      { en: "Sharvari", ta: "சார்வரி" }, { en: "Plava", ta: "பிளவ" }, { en: "Subhakruth", ta: "சுபகிருது" },
      { en: "Sobhakruth", ta: "சோபகிருது" }, { en: "Krodhi", ta: "க்ரோதி" }, { en: "Visvavasu", ta: "விஸ்வாவஸு" },
      { en: "Parabhava", ta: "பராபவ" }
    ];

    const yearIdx = Math.abs((year - 1987) % 60);
    const yObj = tamilYears[yearIdx] || { en: "Krodhi", ta: "க்ரோதி" };

    return {
      monthNameEn: monthEn,
      monthNameTa: monthTa,
      day: tDay,
      yearNameEn: yObj.en,
      yearNameTa: yObj.ta,
      fullTamilDate: `${monthTa} ${tDay} (${monthEn} ${tDay}), ${yObj.ta} வருடம்`
    };
  };

  // Comprehensive Tamil & National Holidays database
  const festivals: Festival[] = [
    { month: 0, day: 1, name: "New Year's Day", nameTa: "ஆங்கில புத்தாண்டு", type: 'government' },
    { month: 0, day: 14, name: "Pongal Festival", nameTa: "தைப்பொங்கல்", type: 'hindu' },
    { month: 0, day: 15, name: "Mattu Pongal / Thiruvalluvar Day", nameTa: "மாட்டுப் பொங்கல் / திருவள்ளுவர் நாள்", type: 'hindu' },
    { month: 0, day: 16, name: "Kaanum Pongal", nameTa: "காணும் பொங்கல்", type: 'hindu' },
    { month: 0, day: 26, name: "Republic Day", nameTa: "குடியரசு தினம்", type: 'government' },
    { month: 1, day: 14, name: "Thaipusam Festival", nameTa: "தைப்பூசம்", type: 'hindu' },
    { month: 2, day: 8, name: "Maha Shivaratri", nameTa: "மகா சிவராத்திரி", type: 'hindu' },
    { month: 3, day: 14, name: "Tamil New Year (Chithirai Thirunaal)", nameTa: "தமிழ் புத்தாண்டு (சித்திரை திருநாள்)", type: 'hindu' },
    { month: 3, day: 18, name: "Good Friday", nameTa: "புனித வெள்ளி", type: 'christian' },
    { month: 4, day: 1, name: "May Day / Labor Day", nameTa: "மே தினம் / உழைப்பாளர் தினம்", type: 'government' },
    { month: 6, day: 17, name: "Muharram", nameTa: "முஹர்ரம்", type: 'muslim' },
    { month: 7, day: 3, name: "Aadi Perukku", nameTa: "ஆடிப் பெருக்கு", type: 'hindu' },
    { month: 7, day: 15, name: "Independence Day", nameTa: "சுதந்திர தினம்", type: 'government' },
    { month: 7, day: 25, name: "Onam Festival", nameTa: "ஓணம் பண்டிகை", type: 'hindu' },
    { month: 7, day: 28, name: "Avani Avittam", nameTa: "ஆவணி அவிட்டம்", type: 'hindu' },
    { month: 8, day: 5, name: "Ganesh Chaturthi", nameTa: "விநாயகர் சதுர்த்தி", type: 'hindu' },
    { month: 8, day: 16, name: "Milad-un-Nabi", nameTa: "மிலாடி நபி", type: 'muslim' },
    { month: 9, day: 2, name: "Gandhi Jayanti", nameTa: "காந்தி ஜெயந்தி", type: 'government' },
    { month: 9, day: 11, name: "Ayudha Pooja", nameTa: "ஆயுத பூஜை", type: 'hindu' },
    { month: 9, day: 12, name: "Vijaya Dasami", nameTa: "விஜயதசமி", type: 'hindu' },
    { month: 9, day: 31, name: "Deepavali (Diwali)", nameTa: "தீபாவளி பண்டிகை", type: 'hindu' },
    { month: 10, day: 26, name: "Karthigai Deepam", nameTa: "கார்த்திகை தீபம்", type: 'hindu' },
    { month: 11, day: 25, name: "Christmas Day", nameTa: "கிறிஸ்துமஸ் பெருநாள்", type: 'christian' }
  ];

  // Helper calendar calculations
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const totalDays = getDaysInMonth(currentMonth, currentYear);
  const startDay = getFirstDayOfMonth(currentMonth, currentYear);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(1);
  };

  // Generate calendar grid array
  const gridCells = [];
  for (let i = 0; i < startDay; i++) {
    gridCells.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    gridCells.push(i);
  }

  // Get festival for a specific day in the current month
  const getFestivalForDay = (day: number | null) => {
    if (!day) return null;
    return festivals.find(f => f.month === currentMonth && f.day === day) || null;
  };

  // Get Tamil date info for selected day
  const selectedTamilInfo = selectedDay 
    ? getTamilDateInfo(currentYear, currentMonth, selectedDay)
    : null;

  // Get Day of week text for selected day
  const selectedDateObj = selectedDay ? new Date(currentYear, currentMonth, selectedDay) : null;
  const selectedDayOfWeekObj = selectedDateObj ? daysOfWeek[selectedDateObj.getDay()] : null;

  // Header Tamil Month range display
  const midMonthTamilInfo = getTamilDateInfo(currentYear, currentMonth, 15);

  return (
    <div className="w-full max-w-[1700px] space-y-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Calendar Grid (Col span 2) */}
        <div className="md:col-span-2 p-6 rounded-2xl glass-card shadow-2xl border border-zinc-800">
          <div className="flex justify-between items-center mb-6 font-mono">
            <div>
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <LucideCalendar className="w-5 h-5 text-cyber-cyan" /> {months[currentMonth]} {currentYear}
              </h3>
              <p className="text-xs text-cyber-pink font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                தமிழ் மாதம்: <span className="text-amber-300 font-extrabold">{midMonthTamilInfo.monthNameTa} / {midMonthTamilInfo.monthNameEn}</span> ({midMonthTamilInfo.yearNameTa} வருடம்)
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 text-white transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 text-white transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Titles with English & Tamil Day Names */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold mb-3">
            {daysOfWeek.map((d, i) => (
              <div key={i} className="flex flex-col items-center p-1 bg-zinc-900/50 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-400 text-[10px]">{d.en}</span>
                <span className="text-cyber-cyan text-[11px] font-extrabold">{d.ta}</span>
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-2 font-mono">
            {gridCells.map((day, idx) => {
              const hasFest = day ? festivals.some(f => f.month === currentMonth && f.day === day) : false;
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = selectedDay === day;

              const tInfo = day ? getTamilDateInfo(currentYear, currentMonth, day) : null;

              return (
                <div
                  key={idx}
                  onClick={() => day && setSelectedDay(day)}
                  className={`min-h-[76px] flex flex-col justify-between p-1.5 rounded-xl border text-xs font-bold transition-all relative ${
                    !day 
                      ? 'bg-transparent border-transparent pointer-events-none' 
                      : (isSelected
                          ? 'bg-cyber-cyan text-zinc-950 border-cyber-cyan shadow-[0_0_15px_rgba(0,240,255,0.25)] scale-105 z-10'
                          : isToday
                          ? 'bg-cyber-pink/20 border-cyber-pink text-white font-extrabold'
                          : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-300 cursor-pointer')
                  }`}
                >
                  {day && tInfo && (
                    <>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-black">{day}</span>
                        {isToday && <span className="text-[7px] bg-cyber-pink text-white px-1 py-0.2 rounded font-extrabold">TODAY</span>}
                      </div>

                      {/* Tamil Date Indicator Badge */}
                      <div className="flex flex-col items-start mt-1">
                        <span className={`text-[10px] font-extrabold px-1 rounded ${
                          isSelected ? 'bg-zinc-950 text-amber-300' : 'text-amber-400 bg-amber-950/40 border border-amber-500/20'
                        }`}>
                          {tInfo.monthNameTa} {tInfo.day}
                        </span>
                      </div>

                      {hasFest && (
                        <span className={`w-2 h-2 rounded-full absolute bottom-1.5 right-1.5 ${
                          isSelected ? 'bg-zinc-950' : 'bg-cyber-pink animate-pulse'
                        }`} />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Date auspicious details panel (Col span 1) */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between border border-zinc-800 font-mono">
          <div>
            <h4 className="font-bold text-white mb-4 flex items-center gap-1.5 uppercase text-xs tracking-wider">
              <Clock className="w-5 h-5 text-cyber-pink" /> பஞ்சாங்கம் & தமிழ் தேதி (Panchangam)
            </h4>

            {selectedDay && selectedTamilInfo && selectedDayOfWeekObj ? (
              <div className="space-y-4">
                {/* Gregorian & Tamil Date Box */}
                <div className="pb-3 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider block">ஆங்கில & தமிழ் தேதி</span>
                  <div className="text-base font-black text-white">{selectedDay} {months[currentMonth]} {currentYear}</div>
                  <div className="text-sm font-extrabold text-amber-300 mt-0.5 flex items-center gap-1.5">
                    <span>🗓️ {selectedTamilInfo.fullTamilDate}</span>
                  </div>
                  <div className="text-xs text-cyber-cyan font-bold mt-1">
                    {selectedDayOfWeekObj.ta} கிழமை ({selectedDayOfWeekObj.en})
                  </div>
                </div>

                {getFestivalForDay(selectedDay) ? (
                  <div className="p-3 rounded-xl bg-cyber-pink/10 border border-cyber-pink/30 text-xs text-cyber-pink flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-cyber-pink shrink-0" /> 
                      <span className="font-extrabold">{getFestivalForDay(selectedDay)?.name}</span>
                    </div>
                    <div className="text-[11px] font-bold text-rose-300 pl-6">
                      {getFestivalForDay(selectedDay)?.nameTa}
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 text-[11px] text-zinc-400">
                    இன்று முக்கிய அரசு / சமய விடுமுறை இல்லை.
                  </div>
                )}

                {/* Auspicious Timings Panchangam */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400">நல்ல நேரம் (Nalla Neram)</span>
                    <span className="text-emerald-400 font-bold">10:30 AM - 11:30 AM</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400">ராகு காலம் (Rahu Kaalam)</span>
                    <span className="text-red-400 font-bold">01:30 PM - 03:00 PM</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400">எமகண்டம் (Yama Gandam)</span>
                    <span className="text-zinc-400 font-bold">06:00 AM - 07:30 AM</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400">குளிகை (Kuligai Neram)</span>
                    <span className="text-cyan-400 font-bold">09:00 AM - 10:30 AM</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs font-bold leading-relaxed">
                Click on any calendar grid date to view astrological Tamil dates & panchangam.
              </div>
            )}
          </div>

          <div className="text-[10px] text-zinc-500 border-t border-zinc-800/40 pt-4 mt-6">
            தமிழ் பஞ்சாங்கம் கணிப்பு: திருக்கணித பஞ்சாங்கம் (Thirukanitha Panchangam).
          </div>
        </div>

      </div>
    </div>
  );
}
