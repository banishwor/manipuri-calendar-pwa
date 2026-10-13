import React, { useState, useEffect } from 'react';
import { LanguageMode } from '../types';

// Meitei Mayek digits for clock face (1 to 12)
const MEITEI_CLOCK_DIGITS = [
  { val: 12, text: '꯱꯲', angle: 0 },
  { val: 1, text: '꯱', angle: 30 },
  { val: 2, text: '꯲', angle: 60 },
  { val: 3, text: '꯳', angle: 90 },
  { val: 4, text: '꯴', angle: 120 },
  { val: 5, text: '꯵', angle: 150 },
  { val: 6, text: '꯶', angle: 180 },
  { val: 7, text: '꯷', angle: 210 },
  { val: 8, text: '꯸', angle: 240 },
  { val: 9, text: '꯹', angle: 270 },
  { val: 10, text: '꯱꯰', angle: 300 },
  { val: 11, text: '꯱꯱', angle: 330 },
];

// Bengali digits for clock face (1 to 12)
const BENGALI_CLOCK_DIGITS = [
  { val: 12, text: '১২', angle: 0 },
  { val: 1, text: '১', angle: 30 },
  { val: 2, text: '২', angle: 60 },
  { val: 3, text: '৩', angle: 90 },
  { val: 4, text: '৪', angle: 120 },
  { val: 5, text: '৫', angle: 150 },
  { val: 6, text: '৬', angle: 180 },
  { val: 7, text: '৭', angle: 210 },
  { val: 8, text: '৮', angle: 240 },
  { val: 9, text: '৯', angle: 270 },
  { val: 10, text: '১০', angle: 300 },
  { val: 11, text: '১১', angle: 330 },
];

interface MeiteiClockProps {
  languageMode?: LanguageMode;
}

export const MeiteiClock: React.FC<MeiteiClockProps> = ({ languageMode = LanguageMode.MEITEI_MAYEK }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Angular rotation degrees for hands
  const secondDeg = seconds * 6; // 360 / 60
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  // Digital time formatting for Imphal Local Time
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-4 lg:p-5 shadow-sm flex items-center justify-between gap-5 w-full">
      {/* Analog Clock Dial (Proportional ~140px on desktop) */}
      <div className="relative w-32 h-32 md:w-34 md:h-34 lg:w-36 lg:h-36 flex-shrink-0 flex items-center justify-center">
        {/* Physical Outer Bezel Ring (Burgundy & Gold) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#800E13] via-[#5A0A0D] to-[#2B0508] p-2 shadow-lg dark:shadow-rose-950/50 border-2 border-[#D4AF37]/60 flex items-center justify-center">
          {/* Inner Dial Face with Subtle Radial Tone */}
          <div className="w-full h-full rounded-full bg-[#FAF7F2] dark:bg-[#1E1416] relative flex items-center justify-center shadow-inner border border-amber-900/15 overflow-hidden">
            {/* 60 Minute & Hour Tick Marks & Hairline Ring */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44.5" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.5" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="#800E13" strokeWidth="0.5" strokeDasharray="1.5 2.5" opacity="0.3" />
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = i * 30;
                const isQuarter = i % 3 === 0;
                return (
                  <line
                    key={i}
                    x1="50"
                    y1={isQuarter ? "5.5" : "7"}
                    x2="50"
                    y2={isQuarter ? "9.5" : "8.5"}
                    stroke={isQuarter ? "#800E13" : "#D4AF37"}
                    strokeWidth={isQuarter ? "1.6" : "0.9"}
                    strokeLinecap="round"
                    transform={`rotate(${angle} 50 50)`}
                    opacity={isQuarter ? "0.9" : "0.6"}
                  />
                );
              })}
            </svg>

            {/* Subtle Crescent & Star Motif at Center Top */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center justify-center opacity-30 text-[#800E13] dark:text-[#E2847A]">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4C12.92 3.04 12.46 3 12 3z" />
              </svg>
            </div>

            {/* 12 Hour Numerals in Authentic Script */}
            {(languageMode === LanguageMode.BENGALI ? BENGALI_CLOCK_DIGITS : MEITEI_CLOCK_DIGITS).map(({ val, text, angle }) => {
              const rad = ((angle - 90) * Math.PI) / 180;
              const r = 35; // radius from center % (inset for clean breathing room)
              const x = Math.round(50 + r * Math.cos(rad));
              const y = Math.round(50 + r * Math.sin(rad));
              const isMajor = val === 12 || val === 3 || val === 6 || val === 9;

              return (
                <span
                  key={val}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute font-black leading-none select-none ${
                    isMajor
                      ? 'text-xs lg:text-sm text-[#800E13] dark:text-[#E2847A] font-black'
                      : 'text-[9px] lg:text-[10px] text-gray-500 dark:text-gray-400 font-bold'
                  }`}
                >
                  {text}
                </span>
              );
            })}

            {/* Clock Hands with Soft Realistic Drop Shadows */}
            {/* Hour Hand */}
            <div
              style={{ transform: `rotate(${hourDeg}deg)` }}
              className="absolute w-1.5 h-8 lg:h-9 rounded-full bg-[#3B070B] dark:bg-[#FCE8EA] shadow-sm origin-bottom bottom-1/2 left-[calc(50%-3px)] transition-transform duration-200"
            />
            {/* Minute Hand */}
            <div
              style={{ transform: `rotate(${minuteDeg}deg)` }}
              className="absolute w-1 h-11 lg:h-12 rounded-full bg-[#5C0D11] dark:bg-[#F2BDC2] shadow-sm origin-bottom bottom-1/2 left-[calc(50%-2px)] transition-transform duration-200"
            />
            {/* Second Hand */}
            <div
              style={{ transform: `rotate(${secondDeg}deg)` }}
              className="absolute w-[1.5px] h-13 lg:h-14 rounded-full bg-[#D4AF37] shadow-sm origin-bottom bottom-1/2 left-[calc(50%-0.75px)] transition-transform duration-100 ease-linear"
            />

            {/* Center Pivot Pin */}
            <div className="absolute w-2.5 h-2.5 rounded-full bg-[#D4AF37] border-2 border-[#800E13] shadow-md z-10" />
          </div>
        </div>
      </div>

      {/* Digital Time & Imphal Context */}
      <div className="flex flex-col justify-center gap-1.5 flex-1 pl-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {languageMode === LanguageMode.BENGALI 
              ? 'ইম্ফল স্থানীয় সময়' 
              : languageMode === LanguageMode.MEITEI_MAYEK 
                ? 'ꯏꯝꯐꯥꯜ ꯃꯇꯝ' 
                : 'IMPHAL LOCAL TIME'}
          </span>
        </div>

        {/* Live Digital Time */}
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            {displayHours}:{displayMinutes}
          </h3>
          <span className="text-sm font-black text-[#800E13] dark:text-rose-400">
            {ampm}
          </span>
        </div>

        {/* Gregorian Date */}
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {formattedDate}
        </p>

        {/* Cultural Seal Label */}
        <div className="flex items-center gap-1.5 text-rose-800/60 dark:text-rose-400/60 mt-0.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" />
          </svg>
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {languageMode === LanguageMode.BENGALI 
              ? 'কাংলৈপাক মান সময়' 
              : languageMode === LanguageMode.MEITEI_MAYEK 
                ? 'ꯀꯪꯂꯩꯄꯥꯛ ꯃꯇꯝ' 
                : 'Kangleipak Standard Time'}
          </span>
        </div>
      </div>
    </div>
  );
};
