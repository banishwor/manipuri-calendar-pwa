import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CalendarDay, LanguageMode, MonthConfig, Translations } from '../types';
import { Translator } from '../utils/translator';
import { CalendarRepository } from '../utils/calendarData';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Compass, 
  ShieldAlert, 
  Sparkles, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { MaikeiCompass, DIRECTION_METADATA } from './MaikeiCompass';

interface AlmanacTabProps {
  languageMode: LanguageMode;
  translations: Translations | null;
  todayDay: CalendarDay | null;
}

// 4 Traditional Meitei Seasons helper
const getSeasonInfo = (monthName: string, mode: LanguageMode) => {
  const norm = monthName?.toUpperCase().replace(/\s*\(LEAP\)/g, '').replace(/_LEAP/g, '').trim() || '';
  
  if (['PHAIREN', 'PHAIREL', 'LAMTA', 'SAJIBU'].includes(norm)) {
    return { 
      en: 'Spring', 
      label: mode === LanguageMode.BENGALI ? '🌸 য়েন্নিংথা (Spring)' : mode === LanguageMode.MEITEI_MAYEK ? '🌸 ꯌꯦꯟꯅꯤꯡꯊꯥ' : '🌸 Yenningtha · Spring',
      badgeClass: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20'
    };
  }
  
  if (['KALEN', 'INGA', 'ENGA', 'INGEN', 'ENGEN'].includes(norm)) {
    return { 
      en: 'Summer', 
      label: mode === LanguageMode.BENGALI ? '☀️ কালেনথা (Summer)' : mode === LanguageMode.MEITEI_MAYEK ? '☀️ ꯀꯥꯂꯦꯟꯊꯥ' : '☀️ Kalentha · Summer',
      badgeClass: 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20'
    };
  }
  
  if (['THAWAN', 'LANGBAN', 'MERA'].includes(norm)) {
    return { 
      en: 'Autumn', 
      label: mode === LanguageMode.BENGALI ? '🍁 নাকেনথা (Autumn)' : mode === LanguageMode.MEITEI_MAYEK ? '🍁 ꯅꯥꯀꯦꯟꯊꯥ' : '🍁 Nakentha · Autumn',
      badgeClass: 'bg-rose-500/10 text-rose-800 dark:text-rose-400 border-rose-500/20'
    };
  }
  
  return { 
    en: 'Winter', 
    label: mode === LanguageMode.BENGALI ? '❄️ নিংথমথা (Winter)' : mode === LanguageMode.MEITEI_MAYEK ? '❄️ ꯅꯤꯡꯊꯝꯊꯥ' : '❄️ Ningthamtha · Winter',
    badgeClass: 'bg-sky-500/10 text-sky-800 dark:text-sky-400 border-sky-500/20'
  };
};

export const AlmanacTab: React.FC<AlmanacTabProps> = ({
  languageMode,
  translations,
  todayDay
}) => {
  const currentActiveMeiteiYear = useMemo(() => {
    if (todayDay) {
      return Translator.getMeiteiYear(todayDay.gregorian, todayDay.month);
    }
    return 3424;
  }, [todayDay]);

  const [selectedMeiteiYear, setSelectedMeiteiYear] = useState<number>(() => {
    if (todayDay) {
      return Translator.getMeiteiYear(todayDay.gregorian, todayDay.month);
    }
    return 3424;
  });
  const minMeiteiYear = 3423;
  const maxMeiteiYear = 3425;

  const gregorianCycle = useMemo(() => {
    switch (selectedMeiteiYear) {
      case 3423: return '2025-26';
      case 3424: return '2026-27';
      case 3425: return '2027-28';
      default: return `${selectedMeiteiYear - 1398}-${(selectedMeiteiYear - 1398 + 1) % 100}`;
    }
  }, [selectedMeiteiYear]);

  const [monthConfigs, setMonthConfigs] = useState<Record<string, MonthConfig>>({});
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(true);

  // Mobile Tabs: Tatnaba, Maikei
  const tabs = ['Tatnaba', 'Maikei'] as const;
  type TabType = typeof tabs[number];
  const [activeTab, setActiveTab] = useState<TabType>('Tatnaba');

  // Track active selected month for the direction compass
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDirection, setSelectedDirection] = useState<string>('');
  const activeMonthRef = useRef<HTMLButtonElement | null>(null);

  // Switch tabs & always reset state to current active year & current active month
  const handleSelectTab = (tabName: TabType) => {
    setActiveTab(tabName);
    setSelectedMeiteiYear(currentActiveMeiteiYear);
    const todayMonth = todayDay?.month || '';
    if (todayMonth && monthConfigs[todayMonth]) {
      setSelectedMonth(todayMonth);
      setSelectedDirection(monthConfigs[todayMonth].thasiMaikei || 'CHINGKHEI');
    }
  };

  // Auto-scroll horizontal carousel so active / current month is centered
  useEffect(() => {
    if (activeTab === 'Maikei') {
      const timer = setTimeout(() => {
        activeMonthRef.current?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [activeTab, selectedMonth]);

  // Traditional sequence of Meitei Calendar Months
  const baseSequence = [
    'Sajibu', 'Kalen', 'Inga', 'Ingen', 'Thawan', 'Langban',
    'Mera', 'Hiyangei', 'Poinu', 'Wakching', 'Phairen', 'Lamta'
  ];

  // Load configs when selectedMeiteiYear changes
  useEffect(() => {
    let active = true;
    const fetchConfigs = async () => {
      setIsLoadingConfigs(true);
      try {
        const repo = CalendarRepository.getInstance();
        const configs = await repo.getMonthConfigsForMeiteiYear(selectedMeiteiYear);
        if (!active) return;
        setMonthConfigs(configs);
      } catch (e) {
        console.error('Failed to load month configs for Meitei year', e);
      } finally {
        if (active) setIsLoadingConfigs(false);
      }
    };
    fetchConfigs();
    return () => { active = false; };
  }, [selectedMeiteiYear]);

  // Sync with current date's Meitei year on initial load
  useEffect(() => {
    if (todayDay) {
      const meiteiYear = Translator.getMeiteiYear(todayDay.gregorian, todayDay.month);
      if (meiteiYear >= minMeiteiYear && meiteiYear <= maxMeiteiYear) {
        setSelectedMeiteiYear(meiteiYear);
      }
    }
  }, [todayDay]);

  const sortedMonths = useMemo(() => {
    return Object.keys(monthConfigs).sort((a, b) => {
      const baseA = a.replace(/\s*\(LEAP\)/gi, '').replace(/_LEAP/gi, '').trim();
      const baseB = b.replace(/\s*\(LEAP\)/gi, '').replace(/_LEAP/gi, '').trim();
      
      const indexA = baseSequence.findIndex((m) => m.toUpperCase() === baseA.toUpperCase());
      const indexB = baseSequence.findIndex((m) => m.toUpperCase() === baseB.toUpperCase());

      const normIndexA = indexA === -1 ? 999 : indexA;
      const normIndexB = indexB === -1 ? 999 : indexB;

      if (normIndexA !== normIndexB) {
        return normIndexA - normIndexB;
      }
      return a.toUpperCase().includes('LEAP') ? 1 : -1;
    });
  }, [monthConfigs]);

  // Sync selected month for compass
  useEffect(() => {
    if (sortedMonths.length > 0) {
      const isCurrentYear = selectedMeiteiYear === currentActiveMeiteiYear;
      const todayMonth = todayDay?.month || '';
      const matchingTodayMonth = sortedMonths.find((m) => m.toUpperCase() === todayMonth.toUpperCase());

      if (isCurrentYear && matchingTodayMonth && monthConfigs[matchingTodayMonth]) {
        // In current active year, focus on current month
        setSelectedMonth(matchingTodayMonth);
        setSelectedDirection(monthConfigs[matchingTodayMonth].thasiMaikei || 'CHINGKHEI');
      } else {
        // In a different year, start at Month 1 (first month of that year)
        const first = sortedMonths[0];
        setSelectedMonth(first);
        setSelectedDirection(monthConfigs[first]?.thasiMaikei || 'CHINGKHEI');
      }
    }
  }, [sortedMonths, selectedMeiteiYear, currentActiveMeiteiYear, todayDay, monthConfigs]);

  // Selected month config for inspector
  const activeSelectedConfig = useMemo(() => {
    if (!selectedMonth || !monthConfigs[selectedMonth]) return null;
    return monthConfigs[selectedMonth];
  }, [selectedMonth, monthConfigs]);

  const activeDirection = activeSelectedConfig?.thasiMaikei?.toUpperCase() || selectedDirection?.toUpperCase() || 'CHINGKHEI';
  const needleAngle = DIRECTION_METADATA[activeDirection]?.needleAngle ?? 45;
  const directionNative = Translator.translateDirection(activeDirection, languageMode, translations);
  const directionEng = DIRECTION_METADATA[activeDirection]?.en || activeDirection;

  const selectedMonthSeason = getSeasonInfo(selectedMonth, languageMode);
  const selectedMonthDisplayName = Translator.translateMonth(selectedMonth, languageMode, translations);

  return (
    <div className="w-full md:h-full md:flex-1 md:flex md:flex-col min-h-0">
      
      {/* =========================================================================
          DESKTOP WIDESCREEN VIEW (>= 768px): 60/40 Matrix & Astrolabe Inspector
          ========================================================================= */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-4 lg:gap-5 w-full md:h-full md:flex-1 min-h-0 items-stretch">
        
        {/* LEFT COLUMN: ~60% Width (Col Span 7) - 12-Month Almanac Matrix */}
        <div className="md:col-span-7 flex flex-col justify-between gap-3 h-full min-h-0 self-stretch">
          
          {/* Header & Year Navigator Bar */}
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 shadow-sm shrink-0">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl lg:text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase leading-none">
                  {languageMode === LanguageMode.BENGALI ? 'মণিপুরী পঞ্জিকা' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯃꯅꯤꯄꯨꯔꯤ ꯊꯥꯁꯤ-ꯇꯠꯅꯕ' : 'Almanac Matrix'}
                </h2>
                <span className="text-rose-800 dark:text-rose-400 font-black text-sm lg:text-base leading-none">
                  · {Translator.translateDigits(selectedMeiteiYear.toString(), languageMode, translations)} MPK
                </span>
              </div>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1">
                {languageMode === LanguageMode.BENGALI 
                  ? '১২ মাসের তৎনবা ও থাসী মাইকৈ দিক নির্ণয়' 
                  : languageMode === LanguageMode.MEITEI_MAYEK 
                    ? 'ꯊꯥ ꯱꯲ꯒꯤ ꯈꯣꯡꯆꯠ ꯇꯠꯅꯕ ꯑꯃꯁꯨꯡ ꯊꯥꯁꯤ ꯃꯥꯏꯀꯩ' 
                    : `12-Month Tatnaba & Thasi Maikei Directory (${gregorianCycle})`}
              </p>
            </div>

            {/* Year Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {selectedMeiteiYear !== currentActiveMeiteiYear && (
                <button
                  onClick={() => setSelectedMeiteiYear(currentActiveMeiteiYear)}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  Current Year
                </button>
              )}

              <div className="flex items-center gap-1 border border-gray-100 dark:border-gray-800 rounded-xl p-0.5 bg-gray-50 dark:bg-gray-800/40">
                <button
                  onClick={() => {
                    if (selectedMeiteiYear > minMeiteiYear) setSelectedMeiteiYear(selectedMeiteiYear - 1);
                  }}
                  disabled={selectedMeiteiYear <= minMeiteiYear}
                  className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Previous Year"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-extrabold px-1 text-gray-800 dark:text-gray-200">
                  {selectedMeiteiYear}
                </span>
                <button
                  onClick={() => {
                    if (selectedMeiteiYear < maxMeiteiYear) setSelectedMeiteiYear(selectedMeiteiYear + 1);
                  }}
                  disabled={selectedMeiteiYear >= maxMeiteiYear}
                  className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Next Year"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 12-Month Interactive Grid Matrix (3 cols x 4 rows) */}
          <div className="flex-1 min-h-0 flex flex-col">
            {isLoadingConfigs ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
                <div className="w-8 h-8 border-3 border-rose-800 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-gray-400">Loading astrological configurations...</span>
              </div>
            ) : sortedMonths.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8 text-gray-400 text-xs">
                No configurations found for year {selectedMeiteiYear}.
              </div>
            ) : (
              <div className="grid grid-cols-3 grid-rows-4 gap-2 lg:gap-2.5 flex-1 min-h-0">
                {sortedMonths
                  .filter((m) => !m.toUpperCase().includes('LEAP'))
                  .map((monthName, idx) => {
                    const config = monthConfigs[monthName];
                    if (!config) return null;

                    const isSelected = monthName === selectedMonth;
                    const isCurrentCalendarMonth = selectedMeiteiYear === currentActiveMeiteiYear && todayDay?.month?.toUpperCase() === monthName.toUpperCase();
                    const monthDisplayName = Translator.translateMonth(monthName, languageMode, translations);
                    const directionDisplayName = Translator.translateDirection(config.thasiMaikei, languageMode, translations);
                    const season = getSeasonInfo(monthName, languageMode);

                    const tatnabaDaysStr = config.tatnaba.length === 0
                      ? (languageMode === LanguageMode.BENGALI ? 'নেই' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯂꯩꯇꯦ' : 'None')
                      : config.tatnaba.map((d) => Translator.translateWeekdayShort(d, languageMode, translations)).join(', ');

                    return (
                      <div
                        key={`month-tile-${monthName}`}
                        onClick={() => {
                          setSelectedMonth(monthName);
                          setSelectedDirection(config.thasiMaikei);
                        }}
                        className={`rounded-2xl border p-2.5 lg:p-3 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] select-none h-full min-h-0 ${
                          isSelected
                            ? 'border-2 border-rose-600 dark:border-rose-500 bg-gradient-to-br from-rose-50/90 to-amber-50/30 dark:from-rose-950/40 dark:to-amber-950/20 shadow-md ring-2 ring-rose-500/20'
                            : 'border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/90 hover:border-rose-300 dark:hover:border-rose-800/60 hover:bg-gray-50/80 dark:hover:bg-gray-850/60'
                        }`}
                      >
                        {/* Top Row: Month Number, Title & Current Pill */}
                        <div className="flex items-start justify-between gap-1 leading-none">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 shrink-0">
                              {(idx + 1).toString().padStart(2, '0')}
                            </span>
                            <h4 className={`text-sm lg:text-base font-black truncate ${
                              isSelected ? 'text-rose-950 dark:text-rose-100' : 'text-gray-900 dark:text-white'
                            }`}>
                              {monthDisplayName}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isCurrentCalendarMonth && (
                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                                Current
                              </span>
                            )}
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${season.badgeClass}`}>
                              {season.en}
                            </span>
                          </div>
                        </div>

                        {/* Middle Row: Tatnaba Prohibited Weekdays */}
                        <div className="flex items-center justify-between text-[11px] my-1">
                          <span className="text-[9.5px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            Tatnaba
                          </span>
                          <span className={`text-[11px] font-black ${
                            config.tatnaba.length === 0
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}>
                            {config.tatnaba.length > 0 && '⚡ '}
                            {tatnabaDaysStr}
                          </span>
                        </div>

                        {/* Bottom Row: Thasi Maikei Direction */}
                        <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-[11px]">
                          <span className="text-[9.5px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            Thasi Maikei
                          </span>
                          <span className="text-[11px] font-black text-rose-800 dark:text-rose-400 flex items-center gap-1">
                            <span>🧭</span>
                            <span>{directionDisplayName}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ~40% Width (Col Span 5) - Live Astrolabe Compass & Inspector */}
        <div className="md:col-span-5 flex flex-col justify-between gap-3 h-full min-h-0 self-stretch">
          
          {/* Card 1: Celestial Maikei Compass Astrolabe */}
          <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-4 shadow-sm flex flex-col items-center justify-between shrink-0">
            {/* Header */}
            <div className="w-full flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-rose-500/10 dark:bg-rose-400/15 border border-rose-500/20 flex items-center justify-center text-rose-800 dark:text-rose-400">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    {languageMode === LanguageMode.BENGALI ? 'থাসী মাইকৈ দিকদর্শন' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯊꯥꯁꯤ ꯃꯥꯏꯀꯩ' : 'Thasi Maikei Astrolabe'}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">
                    {selectedMonthDisplayName} · {selectedMeiteiYear} MPK
                  </span>
                </div>
              </div>

              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20">
                ⚠️ {languageMode === LanguageMode.BENGALI ? 'বর্জনীয় দিক' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯊꯣꯛꯂꯣꯏꯗꯕ' : 'Inauspicious'}
              </span>
            </div>

            {/* Circular Physical Compass Dial */}
            <MaikeiCompass
              selectedDirection={activeDirection}
              selectedMonthName={selectedMonth}
              languageMode={languageMode}
              translations={translations}
              showReadout={false}
              className="my-1 w-[185px] lg:w-[200px]"
            />

            {/* Readout */}
            <div className="text-center flex flex-col items-center">
              <span className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                {directionNative} · {directionEng}
              </span>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                {languageMode === LanguageMode.BENGALI 
                  ? `${selectedMonthDisplayName} মাসে এই দিকে যাত্রা বর্জনীয়` 
                  : languageMode === LanguageMode.MEITEI_MAYEK 
                    ? `${selectedMonthDisplayName} ꯊꯥꯁꯤꯗ ꯃꯥꯏꯀꯩ ꯑꯁꯤꯗ ꯈꯣꯡꯆꯠ ꯆꯠꯂꯣꯏꯗꯕ` 
                    : `Inauspicious direction for commencement of journey in ${selectedMonth}`}
              </p>
            </div>
          </div>

          {/* Card 2: Selected Month Astrological Deep-Dive */}
          <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-3.5 lg:p-4 shadow-sm flex flex-col justify-between flex-1 min-h-0">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-800 dark:text-rose-400" />
                <span className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white">
                  {selectedMonthDisplayName} · Rules Summary
                </span>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${selectedMonthSeason.badgeClass}`}>
                {selectedMonthSeason.label}
              </span>
            </div>

            {/* Astrological Points */}
            <div className="space-y-2.5 my-2">
              {/* Tatnaba Row */}
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {activeSelectedConfig?.tatnaba && activeSelectedConfig.tatnaba.length > 0 ? (
                      <span>
                        Tatnaba: {activeSelectedConfig.tatnaba.map((d) => Translator.translateWeekday(d, languageMode, translations)).join(', ')}
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400">
                        No Tatnaba restrictions designated for {selectedMonthDisplayName}
                      </span>
                    )}
                  </span>
                  <p className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {activeSelectedConfig?.tatnaba && activeSelectedConfig.tatnaba.length > 0 
                      ? 'Avoid embarking on long journeys or commencing major enterprises on these weekdays.' 
                      : 'All weekdays in this lunar cycle are favorable for journeys and ceremonial deeds.'}
                  </p>
                </div>
              </div>

              {/* Thasi Direction Row */}
              <div className="flex items-start gap-2.5">
                <Compass className="w-4 h-4 text-rose-800 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    Thasi Maikei Direction: {directionNative}
                  </span>
                  <p className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    Where the new moon resides. Journeys directed towards {directionEng} are ill-omened.
                  </p>
                </div>
              </div>
            </div>

            {/* Favorable Days Footnote */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                Days not marked as Tatnaba are astrologically clear for auspicious journeys.
              </span>
            </div>
          </div>

          {/* Card 3: Traditional Puya Proverb Banner */}
          <div className="p-3.5 rounded-3xl bg-red-500/10 border border-red-500/20 text-center shrink-0">
            <p className="text-xs lg:text-sm font-black text-red-700 dark:text-red-400">
              {languageMode === LanguageMode.BENGALI
                ? 'তৎনবা নুমিত্তা অফবা থবক তৌবা ফত্তে'
                : 'ꯇꯥꯠꯅꯥꯕꯥ ꯅꯨꯃꯤꯠ ꯇꯥ ꯑꯐꯕ ꯊꯕꯛ ꯇꯧꯕ ꯐꯠꯇꯦ'}
            </p>
            <p className="text-[9.5px] text-gray-600 dark:text-gray-400 mt-1 font-medium">
              Ancient Astrological Maxim: Auspicious undertakings and distant travels are traditionally avoided on Tatnaba days.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEW (< 768px): 100% Preserved Touch Swipe Layout (UNTOUCHED)
          ========================================================================= */}
      <div className="md:hidden flex flex-col gap-4 pb-24 w-full">
        {/* Header Bar */}
        <div className="py-2 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Almanac</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Traditional Tatnaba &amp; Thasi Maikei Astrological Rules</p>
        </div>

        {/* Pill Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {tabs.map((tabName) => {
            const isActive = activeTab === tabName;
            return (
              <button
                key={tabName}
                onClick={() => handleSelectTab(tabName)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-800 dark:text-rose-400 border border-rose-800/30 dark:border-rose-400/30 shadow-sm'
                    : 'bg-gray-100/70 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {isActive && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                <span>{tabName}</span>
              </button>
            );
          })}
        </div>

        {isLoadingConfigs ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-rose-800 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sortedMonths.length === 0 ? (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400">
            No configurations loaded for this year.
          </div>
        ) : (
          <>
            {/* --- MAIKEI TAB VIEW (OPTION A: LIVE ASTROLABE WITH HORIZONTAL MONTH SELECTOR & ZERO SCROLL) --- */}
            {activeTab === 'Maikei' && (
              <div className="flex flex-col items-center gap-2 w-full">
                {/* Compact Centered Year Navigator */}
                <div className="flex items-center justify-center gap-5 py-0.5">
                  <button
                    onClick={() => {
                      if (selectedMeiteiYear > minMeiteiYear) setSelectedMeiteiYear(selectedMeiteiYear - 1);
                    }}
                    disabled={selectedMeiteiYear <= minMeiteiYear}
                    className="p-1.5 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Previous Year"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xl font-black text-rose-900 dark:text-rose-100 tracking-tight leading-none">
                      {Translator.translateDigits(selectedMeiteiYear.toString(), languageMode, translations)}
                    </span>
                    <span className="text-[10.5px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                      MP {selectedMeiteiYear} · {gregorianCycle}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (selectedMeiteiYear < maxMeiteiYear) setSelectedMeiteiYear(selectedMeiteiYear + 1);
                    }}
                    disabled={selectedMeiteiYear >= maxMeiteiYear}
                    className="p-1.5 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Next Year"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Animated Interactive Compass Graphic */}
                <MaikeiCompass
                  selectedDirection={selectedDirection}
                  selectedMonthName={selectedMonth}
                  languageMode={languageMode}
                  translations={translations}
                  showReadout={true}
                  className="my-1 w-[200px] sm:w-[220px]"
                />

                {/* Horizontal Scrolling Month Selector Carousel */}
                <div className="w-full flex flex-col gap-1.5 mt-0.5">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-400">
                      {languageMode === LanguageMode.BENGALI ? 'মাস নির্বাচন করুন' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯊꯥ ꯈꯜꯂꯨ' : 'SELECT MONTH'}
                    </span>
                    <span className="text-[9.5px] font-bold text-gray-400">
                      {selectedMonth} ({Translator.translateDirection(monthConfigs[selectedMonth]?.thasiMaikei || '', languageMode, translations)})
                    </span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory scrollbar-none">
                    {sortedMonths
                      .filter((m) => !m.toUpperCase().includes('LEAP'))
                      .map((monthName, idx) => {
                        const config = monthConfigs[monthName];
                        if (!config) return null;
                        const isSelected = monthName === selectedMonth;
                        const isCurrentCalendarMonth = selectedMeiteiYear === currentActiveMeiteiYear && todayDay?.month?.toUpperCase() === monthName.toUpperCase();
                        const monthDisplayName = Translator.translateMonth(monthName, languageMode, translations);

                        return (
                          <button
                            key={monthName}
                            ref={isSelected ? activeMonthRef : undefined}
                            onClick={() => {
                              setSelectedMonth(monthName);
                              setSelectedDirection(config.thasiMaikei);
                            }}
                            className={`shrink-0 snap-start px-3 py-2 rounded-2xl flex items-center gap-1.5 border transition-all cursor-pointer select-none ${
                              isSelected
                                ? 'bg-rose-800 text-white dark:bg-rose-600 border-rose-800 dark:border-rose-500 shadow-md ring-2 ring-rose-500/20'
                                : isCurrentCalendarMonth
                                  ? 'border-2 border-rose-500 bg-rose-500/10 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                                  : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850'
                            }`}
                          >
                            <span className={`text-[10px] font-bold ${isSelected ? 'text-rose-200' : 'text-gray-400 dark:text-gray-500'}`}>
                              {Translator.translateDigits((idx + 1).toString().padStart(2, '0'), languageMode, translations)}
                            </span>
                            <span className="text-xs font-black truncate">
                              {monthDisplayName}
                            </span>
                            {isCurrentCalendarMonth && (
                              <span className={`text-[7.5px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-rose-600 text-white dark:bg-rose-500 dark:text-rose-950'
                              }`}>
                                {languageMode === LanguageMode.BENGALI ? 'চলতি' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯉꯁꯤ' : 'Now'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Directional Astrological Guidance Card */}
                <div className="w-full p-3 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent dark:from-rose-950/30 dark:via-amber-950/10 border border-rose-500/20 shadow-sm flex items-start gap-3 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 dark:bg-rose-500/30 flex items-center justify-center text-rose-800 dark:text-rose-300 shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                        {Translator.translateDirection(monthConfigs[selectedMonth]?.thasiMaikei || '', languageMode, translations)} · {DIRECTION_METADATA[monthConfigs[selectedMonth]?.thasiMaikei]?.en || monthConfigs[selectedMonth]?.thasiMaikei}
                      </span>
                      <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 uppercase">
                        Inauspicious
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">
                      {languageMode === LanguageMode.BENGALI
                        ? `${Translator.translateMonth(selectedMonth, languageMode, translations)} মাসে এই দিকে যাত্রা ও শুভ কাজ বর্জনীয়।`
                        : languageMode === LanguageMode.MEITEI_MAYEK
                          ? `${Translator.translateMonth(selectedMonth, languageMode, translations)} ꯊꯥꯁꯤꯗ ꯃꯥꯏꯀꯩ ꯑꯁꯤꯗ ꯈꯣꯡꯆꯠ ꯆꯠꯂꯣꯏꯗꯕꯅꯤ꯫`
                          : `Where the new moon resides. Journeys directed towards ${DIRECTION_METADATA[monthConfigs[selectedMonth]?.thasiMaikei]?.en || monthConfigs[selectedMonth]?.thasiMaikei} are ill-omened in ${selectedMonth}.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* --- TATNABA TAB VIEW (COMPACT 2-COLUMN DIRECTORY WITH ZERO SCROLL) --- */}
            {activeTab === 'Tatnaba' && (() => {
              const nonLeapMonths = sortedMonths.filter((m) => !m.toUpperCase().includes('LEAP'));
              const col1Months = nonLeapMonths.slice(0, 6);
              const col2Months = nonLeapMonths.slice(6, 12);

              const renderMonthRow = (monthName: string, indexNumber: number) => {
                const config = monthConfigs[monthName];
                if (!config) return null;
                const isCurrentCalendarMonth = selectedMeiteiYear === currentActiveMeiteiYear && todayDay?.month?.toUpperCase() === monthName.toUpperCase();
                const monthDisplayName = Translator.translateMonth(monthName, languageMode, translations);
                const tatnabaDaysStr = config.tatnaba.length === 0
                  ? (languageMode === LanguageMode.BENGALI ? 'নেই' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯂꯩꯇꯦ' : 'None')
                  : config.tatnaba.map((weekday) => Translator.translateWeekdayShort(weekday, languageMode, translations)).join(', ');

                return (
                  <div
                    key={monthName}
                    className={`px-3 py-2.5 rounded-2xl border flex items-center justify-between gap-1.5 transition-all select-none min-h-[46px] ${
                      isCurrentCalendarMonth
                        ? 'border-2 border-rose-600 dark:border-rose-500 bg-gradient-to-r from-rose-50/95 via-amber-50/40 to-transparent dark:from-rose-950/45 dark:via-amber-950/25 shadow-md ring-1 ring-rose-500/20'
                        : 'border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[10px] shrink-0 ${isCurrentCalendarMonth ? 'text-rose-800 dark:text-rose-400 font-black' : 'text-gray-400 dark:text-gray-500 font-bold'}`}>
                        {Translator.translateDigits(indexNumber.toString().padStart(2, '0'), languageMode, translations)}
                      </span>
                      <span className={`text-xs sm:text-sm font-black truncate ${isCurrentCalendarMonth ? 'text-rose-950 dark:text-rose-100' : 'text-gray-900 dark:text-white'}`}>
                        {monthDisplayName}
                      </span>
                      {isCurrentCalendarMonth && (
                        <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded-md bg-rose-600 text-white dark:bg-rose-500 dark:text-rose-950 uppercase tracking-wider shrink-0 shadow-sm">
                          {languageMode === LanguageMode.BENGALI ? 'চলতি' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯉꯁꯤ' : 'Current'}
                        </span>
                      )}
                    </div>

                    <span className={`text-xs font-bold shrink-0 ${
                      config.tatnaba.length === 0
                        ? 'text-gray-400 dark:text-gray-500 font-semibold'
                        : isCurrentCalendarMonth
                          ? 'text-rose-700 dark:text-rose-300 font-black'
                          : 'text-red-600 dark:text-red-400 font-extrabold'
                    }`}>
                      {tatnabaDaysStr}
                    </span>
                  </div>
                );
              };

              return (
                <div className="flex flex-col gap-3">
                  {/* Centered Dignified Year Navigator */}
                  <div className="relative flex items-center justify-center gap-6 py-1">
                    <button
                      onClick={() => {
                        if (selectedMeiteiYear > minMeiteiYear) setSelectedMeiteiYear(selectedMeiteiYear - 1);
                      }}
                      disabled={selectedMeiteiYear <= minMeiteiYear}
                      className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Previous Year"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-center text-center">
                      <span className="text-2xl font-black text-rose-900 dark:text-rose-100 tracking-tight leading-none">
                        {Translator.translateDigits(selectedMeiteiYear.toString(), languageMode, translations)}
                      </span>
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-1">
                        MP {selectedMeiteiYear} · {gregorianCycle}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedMeiteiYear < maxMeiteiYear) setSelectedMeiteiYear(selectedMeiteiYear + 1);
                      }}
                      disabled={selectedMeiteiYear >= maxMeiteiYear}
                      className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Next Year"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 2-Column Almanac Directory (6 Rows Each, Apple-standard 46px touch targets) */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Left Column: Months 01 to 06 */}
                    <div className="flex flex-col gap-2">
                      {col1Months.map((m, idx) => renderMonthRow(m, idx + 1))}
                    </div>

                    {/* Right Column: Months 07 to 12 */}
                    <div className="flex flex-col gap-2">
                      {col2Months.map((m, idx) => renderMonthRow(m, idx + 7))}
                    </div>
                  </div>

                  {/* Traditional Warning Proverb Footer Banner (Exact Wording Preserved) */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center shadow-sm">
                    <p className="text-xs sm:text-sm font-black text-red-600 dark:text-red-400 leading-tight">
                      {languageMode === LanguageMode.BENGALI
                        ? 'তৎনবা নুমিত্তা অফবা থবক তৌবা ফত্তে'
                        : 'ꯇꯥꯠꯅꯥꯕꯥ ꯅꯨꯃꯤꯠ ꯇꯥ ꯑꯐꯕ ꯊꯕꯛ ꯇꯧꯕ ꯐꯠꯇꯦ'}
                    </p>
                    <p className="text-[9.5px] sm:text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium leading-snug">
                      Traditional Astrological Guidance: Avoid embarking on auspicious ventures on Tatnaba days.
                    </p>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
};
