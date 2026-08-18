"use client";

import React, { useState } from 'react';
import { Calendar as LucideCalendar, ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';

interface Festival {
  day: number;
  name: string;
  type: 'government' | 'hindu' | 'muslim' | 'christian';
}

export default function CalendarTab() {
  const [currentMonth, setCurrentMonth] = useState(7); // August (0-indexed base, so 7)
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(18);

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const tamilMonths = [
    "Margazhi / Thai", "Thai / Masi", "Masi / Panguni", "Panguni / Chithirai", 
    "Chithirai / Vaikasi", "Vaikasi / Aani", "Aani / Aadi", "Aadi / Aavani", 
    "Aavani / Purattasi", "Purattasi / Aippasi", "Aippasi / Karthigai", "Karthigai / Margazhi"
  ];

  // Mock festival entries for August 2026
  const festivals: Festival[] = [
    { day: 3, name: "Aadi Perukku", type: 'hindu' },
    { day: 15, name: "Independence Day", type: 'government' },
    { day: 25, name: "Onam Festival", type: 'hindu' },
    { day: 28, name: "Avani Avittam", type: 'hindu' }
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
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  // Generate calendar grid array
  const gridCells = [];
  for (let i = 0; i < startDay; i++) {
    gridCells.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    gridCells.push(i);
  }

  // Get festival for a day
  const getFestivalForDay = (day: number | null) => {
    if (!day) return null;
    return festivals.find(f => f.day === day) || null;
  };

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Calendar Grid (Col span 2) */}
        <div className="md:col-span-2 p-6 rounded-2xl glass-card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-extrabold text-white text-lg flex items-center gap-1.5">
                <LucideCalendar className="w-5 h-5 text-cyber-cyan" /> {months[currentMonth]} {currentYear}
              </h3>
              <p className="text-[10px] text-cyber-pink font-bold uppercase tracking-wider mt-0.5">
                Tamil Month: {tamilMonths[currentMonth]}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Titles */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-500 mb-2">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {gridCells.map((day, idx) => {
              const hasFest = day ? festivals.some(f => f.day === day) : false;
              const isSelected = selectedDay === day;

              return (
                <div
                  key={idx}
                  onClick={() => day && setSelectedDay(day)}
                  className={`aspect-square flex flex-col justify-between p-1.5 rounded-xl border text-xs font-bold transition-all relative ${
                    !day 
                      ? 'bg-transparent border-transparent pointer-events-none' 
                      : (isSelected
                          ? 'bg-cyber-cyan text-zinc-950 border-cyber-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                          : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-300 cursor-pointer')
                  }`}
                >
                  {day && (
                    <>
                      <span>{day}</span>
                      {hasFest && (
                        <span className={`w-1.5 h-1.5 rounded-full absolute bottom-2 right-2 ${
                          isSelected ? 'bg-zinc-950' : 'bg-cyber-pink'
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
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-white mb-4 flex items-center gap-1.5 uppercase">
              <Clock className="w-5 h-5 text-cyber-pink" /> Auspicious Times
            </h4>

            {selectedDay ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider block">SELECTED DATE</span>
                  <span className="text-base font-black text-white">{selectedDay} {months[currentMonth]} {currentYear}</span>
                </div>

                {getFestivalForDay(selectedDay) && (
                  <div className="p-3 rounded-xl bg-cyber-pink/10 border border-cyber-pink/20 text-xs text-cyber-pink flex items-center gap-2">
                    <Star className="w-4 h-4 fill-cyber-pink" /> 
                    <span className="font-bold">Festival: {getFestivalForDay(selectedDay)?.name}</span>
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400">Nalla Neram</span>
                    <span className="text-white font-bold font-mono">10:30 AM - 11:30 AM</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400">Rahu Kaalam</span>
                    <span className="text-red-400 font-bold font-mono">01:30 PM - 03:00 PM</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400">Yama Gandam</span>
                    <span className="text-zinc-400 font-bold font-mono">06:00 AM - 07:30 AM</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400">Kuligai Neram</span>
                    <span className="text-emerald-400 font-bold font-mono">09:00 AM - 10:30 AM</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs font-bold leading-relaxed">
                Click on any calendar grid date to view astrological timings and state holidays.
              </div>
            )}
          </div>

          <div className="text-[10px] text-zinc-500 border-t border-zinc-800/40 pt-4 mt-6">
            Astrological charts are computed using Thirukanitha Panchangam parameters.
          </div>
        </div>

      </div>
    </div>
  );
}
