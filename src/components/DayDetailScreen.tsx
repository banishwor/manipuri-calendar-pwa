import React, { useState, useEffect, useMemo } from 'react';
import { CalendarDay, Event, LanguageMode, MonthConfig, Translations } from '../types';
import { Translator } from '../utils/translator';
import { CalendarRepository } from '../utils/calendarData';
import { MoonGraphic } from './MoonGraphic';
import { 
  X, 
  Calendar as CalendarIcon, 
  MapPin, 
  AlertTriangle, 
  ExternalLink,
  Sparkles,
  ShieldAlert,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

interface DayDetailScreenProps {
  dateStr: string; // "YYYY-MM-DD"
  languageMode: LanguageMode;
  translations: Translations | null;
  eventsList: Event[];
  onClose: () => void;
}

export const DayDetailScreen: React.FC<DayDetailScreenProps> = ({
  dateStr,
  languageMode,
  translations,
  eventsList,
  onClose
}) => {
  const [dayDetail, setDayDetail] = useState<CalendarDay | null>(null);
  const [monthConfig, setMonthConfig] = useState<MonthConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scrolling while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Fetch day detail and month config
  useEffect(() => {
    let active = true;
    const loadDetails = async () => {
      setLoading(true);
      try {
        const repo = CalendarRepository.getInstance();
        const details = await repo.getDayDetails(dateStr);
        if (!active) return;
        
        setDayDetail(details);
        if (details) {
          const config = await repo.getMonthConfig(parseInt(dateStr.split('-')[0], 10), details.month);
          if (active) setMonthConfig(config);
        }
      } catch (e) {
        console.error('Failed to load day detail data', e);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDetails();
    return () => { active = false; };
  }, [dateStr]);

  // Gregorian date formatting
  const dateInfo = useMemo(() => {
    if (!dateStr) return { weekday: '', formattedGregorian: '', weekdayKey: '' };
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const weekdaysKeys = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      return {
        weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
        weekdayKey: weekdaysKeys[d.getDay()],
        formattedGregorian: d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      };
    } catch {
      return { weekday: '', formattedGregorian: dateStr, weekdayKey: '' };
    }
  }, [dateStr]);

  // Lunar date translations
  const meiteiYear = useMemo(() => {
    if (!dayDetail) return 3424;
    return Translator.getMeiteiYear(dateStr, dayDetail.month);
  }, [dateStr, dayDetail]);

  const meiteiYearDigits = Translator.translateDigits(meiteiYear.toString(), languageMode, translations);
  const meiteiYearLabel = Translator.getMeiteiYearLabel(languageMode);

  const translatedMonth = dayDetail 
    ? Translator.translateMonth(dayDetail.month, languageMode, translations) 
    : '';

  const translatedDayDigits = dayDetail 
    ? dayDetail.day.map((d) => Translator.translateDigits(d.toString(), languageMode, translations)).join(' & ') 
    : '';

  const translatedWeekday = dateInfo.weekdayKey 
    ? Translator.translateWeekday(dateInfo.weekdayKey, languageMode, translations) 
    : '';

  // Tatnaba check for this day
  const isTatnabaDay = useMemo(() => {
    if (!monthConfig || !dateInfo.weekdayKey) return false;
    return monthConfig.tatnaba.includes(dateInfo.weekdayKey);
  }, [monthConfig, dateInfo.weekdayKey]);

  // Thasi Maikei direction
  const thasiMaikeiDirection = monthConfig?.thasiMaikei?.toUpperCase() || '';
  const thasiMaikeiNative = Translator.translateDirection(thasiMaikeiDirection, languageMode, translations);

  // Deduplicated festival & event list
  const combinedEvents = useMemo(() => {
    if (!dayDetail) return [];
    const list: Event[] = [];

    if (dayDetail.festivals && dayDetail.festivals.length > 0) {
      dayDetail.festivals.forEach((fId) => {
        const ev = eventsList.find((e) => e.id === fId);
        if (ev && !list.some((it) => it.name.toLowerCase() === ev.name.toLowerCase())) {
          list.push(ev);
        }
      });
    }

    if (dayDetail.events && dayDetail.events.length > 0) {
      dayDetail.events.forEach((eId) => {
        const ev = eventsList.find((e) => e.id === eId);
        if (ev && !list.some((it) => it.name.toLowerCase() === ev.name.toLowerCase())) {
          list.push(ev);
        }
      });
    }

    return list;
  }, [dayDetail, eventsList]);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/45 dark:bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 lg:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Apple-style Frosted Crystal Pop-up Card */}
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        className="relative w-full max-w-lg lg:max-w-xl max-h-[88vh] rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden my-auto"
      >
        {/* Apple Header with Date & Circular Close Button */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-gray-100 dark:border-gray-800/80 shrink-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-400/15 border border-rose-500/20 flex items-center justify-center text-rose-800 dark:text-rose-400 shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-tight truncate">
                {languageMode === LanguageMode.BENGALI ? 'তারিখের বিবরণ' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯅꯨꯃꯤꯠꯀꯤ ꯑꯀꯨꯞꯄ' : 'Date Details'}
              </h3>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 truncate">
                {dateInfo.formattedGregorian}
              </span>
            </div>
          </div>

          {/* Floating Apple-style Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 gap-3 min-h-[260px]">
            <div className="w-8 h-8 border-3 border-rose-800 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400 font-bold">
              {languageMode === LanguageMode.BENGALI ? 'তথ্য লোড হচ্ছে...' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯗꯦꯇꯥ ꯂꯣꯗ ꯇꯧꯔꯤ...' : 'Loading date details...'}
            </p>
          </div>
        ) : !dayDetail ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3 min-h-[260px]">
            <CalendarIcon className="w-10 h-10 text-rose-800/40" />
            <h4 className="text-sm font-black text-gray-900 dark:text-white">
              Data Unavailable
            </h4>
            <p className="text-xs text-gray-400 max-w-xs">
              No lunar calendar records found for {dateStr}.
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-3.5 scrollbar-thin">
            
            {/* 1. Hero Card: Primary Manipuri Lunar Date */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 via-rose-50/50 to-amber-50/30 dark:from-rose-950/35 dark:via-rose-950/20 dark:to-amber-950/15 border border-rose-200/60 dark:border-rose-900/40 p-4 sm:p-5 shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-800/70 dark:text-rose-400/80">
                    {languageMode === LanguageMode.BENGALI ? 'মণিপুরী তারিখ' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯃꯅꯤꯄꯨꯔꯤ ꯊꯥ-ꯅꯨꯃꯤꯠ' : 'Manipuri Lunar Date'}
                  </span>
                  
                  {/* Large Dual-Script Headline */}
                  <h2 className="text-2xl sm:text-3xl font-black text-rose-950 dark:text-rose-100 tracking-tight leading-none uppercase">
                    {dayDetail.month} · {dayDetail.day.join(' & ')}
                  </h2>

                  {/* Localized Script Subtitle */}
                  <p className="text-base sm:text-lg font-black text-rose-800 dark:text-rose-300 tracking-wide mt-0.5">
                    {translatedMonth} · {translatedDayDigits}
                    {languageMode === LanguageMode.ENGLISH && (
                      <span className="text-sm font-bold text-rose-700/80 dark:text-rose-400/80 ml-2">
                        ({Translator.translateMonth(dayDetail.month, LanguageMode.MEITEI_MAYEK, translations)} · {dayDetail.day.map((d) => Translator.translateDigits(d.toString(), LanguageMode.MEITEI_MAYEK, translations)).join('&')})
                      </span>
                    )}
                  </p>
                </div>

                {/* Weekday Badge */}
                <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-rose-200/50 dark:border-rose-800/40 text-center shrink-0 shadow-2xs">
                  <span className="text-xs font-black text-rose-900 dark:text-rose-200 block">
                    {translatedWeekday}
                  </span>
                  {languageMode === LanguageMode.ENGLISH && (
                    <span className="text-[9px] font-bold text-rose-800/70 dark:text-rose-400/70 block">
                      {Translator.translateWeekday(dateInfo.weekdayKey, LanguageMode.MEITEI_MAYEK, translations)}
                    </span>
                  )}
                </div>
              </div>

              {/* Maliya Phambal Kumshing Sub-bar */}
              <div className="mt-3 pt-2.5 border-t border-rose-200/50 dark:border-rose-900/30 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-rose-900/70 dark:text-rose-300/70">
                  {meiteiYearLabel}
                </span>
                <span className="font-black text-rose-950 dark:text-rose-200">
                  {meiteiYearDigits} ({meiteiYear})
                </span>
              </div>
            </div>

            {/* 2. Moon Observance Card (Purnima, Thasi, Ekadasi) */}
            {dayDetail.observance && (
              <div className="rounded-2xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4 flex items-center gap-3.5 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center shrink-0 shadow-2xs">
                  <MoonGraphic
                    phase={dayDetail.observance}
                    moonPhase={dayDetail.moonPhase}
                    size={32}
                  />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                      {languageMode === LanguageMode.BENGALI ? 'চন্দ্র পর্ব' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯊꯥꯒꯤ ꯐꯤꯚꯝ' : 'Lunar Observance'}
                    </span>
                    {dayDetail.moonPhase && (
                      <span className="text-[8.5px] font-bold text-gray-500 dark:text-gray-400 capitalize">
                        ({dayDetail.moonPhase})
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white capitalize mt-0.5">
                    {dayDetail.observance}
                  </h4>

                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed mt-0.5">
                    {dayDetail.observance.toLowerCase() === 'purnima' && 
                      (languageMode === LanguageMode.BENGALI 
                        ? 'পূর্ণিমা হলো পূর্ণ চন্দ্রের দিন। এটি আধ্যাত্মিক ব্রত, উপবাস ও প্রার্থনার পবিত্র ক্ষণ।' 
                        : languageMode === LanguageMode.MEITEI_MAYEK 
                          ? 'ꯄꯨꯔꯅꯤꯃꯥ (ꯊꯥꯅꯤꯜ) ꯑꯁꯤ ꯊꯥ ꯃꯄꯨꯡ ꯐꯥꯕ ꯅꯨꯃꯤꯠꯅꯤ꯫ ꯂꯥꯏꯅꯤꯡ-ꯂꯥꯏꯁꯣꯜ ꯑꯃꯁꯨꯡ ꯎꯁꯣꯏ-ꯎꯔꯥꯜ ꯇꯧꯕꯒꯤ ꯅꯨꯃꯤꯠꯅꯤ꯫' 
                          : 'Full moon day representing illumination and spiritual abundance. Widely observed with temple prayers and fasting.')}
                    {dayDetail.observance.toLowerCase() === 'thasi' && 
                      (languageMode === LanguageMode.BENGALI 
                        ? 'থাসী (অমাবস্যা) হলো চন্দ্র চক্রের সমাপ্তি পর্ব।' 
                        : languageMode === LanguageMode.MEITEI_MAYEK 
                          ? 'ꯊꯥꯁꯤ (ꯑꯃꯥꯕꯁ꯭ꯌꯥ) ꯑꯁꯤ ꯊꯥ ꯃꯨꯠꯄ ꯅꯨꯃꯤꯠꯅꯤ꯫' 
                          : 'Traditional new moon / dark moon day (Amavasya), marking the culmination of the lunar cycle.')}
                    {dayDetail.observance.toLowerCase() === 'ekadasi' && 
                      (languageMode === LanguageMode.BENGALI 
                        ? 'একাদশী হলো ব্রত ও শুদ্ধতার একাদশ তিথি।' 
                        : languageMode === LanguageMode.MEITEI_MAYEK 
                          ? 'ꯑꯦꯀꯥꯗꯁꯤ ꯑꯁꯤ ꯊꯥꯒꯤ ꯱꯱ ꯁꯨꯕ ꯅꯨꯃꯤꯠꯇ ꯄꯥꯡꯊꯣꯛꯄ ꯎꯁꯣꯏ ꯅꯨꯃꯤꯠꯅꯤ꯫' 
                          : 'Eleventh lunar day sacred for fasting, vegetarian observance, and spiritual contemplation.')}
                  </p>
                </div>
              </div>
            )}

            {/* 3. Festivals & Public Holidays Card */}
            {combinedEvents.length > 0 && (
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/40 dark:bg-gray-850/40 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-800 dark:text-rose-400" />
                    <span className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white">
                      {languageMode === LanguageMode.BENGALI ? 'উৎসব ও সরকারি ছুটি' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯀꯨꯝꯍꯩ ꯑꯃꯁꯨꯡ ꯂꯩꯉꯥꯛꯀꯤ ꯄꯣꯊꯥ ꯅꯨꯃꯤꯠ' : 'Festivals & Holidays'}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-800 dark:text-rose-400">
                    {combinedEvents.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {combinedEvents.map((ev) => (
                    <div 
                      key={ev.id}
                      className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 shadow-2xs flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                          {ev.name}
                        </h4>
                        <span className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                          ev.isHoliday
                            ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
                            : ev.category === 'memorial'
                              ? 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20'
                              : ev.category === 'commemoration'
                                ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20'
                                : ev.category === 'ritual'
                                  ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                          {ev.isHoliday 
                            ? (languageMode === LanguageMode.BENGALI ? 'সরকারি ছুটি' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯄꯣꯊꯥ ꯅꯨꯃꯤꯠ' : 'Govt Holiday')
                            : ev.category === 'memorial'
                              ? (languageMode === LanguageMode.BENGALI ? 'স্মৃতি দিবস' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯅꯤꯡꯁꯤꯡ ꯅꯨꯃꯤꯠ' : 'Memorial')
                              : ev.category === 'commemoration'
                                ? (languageMode === LanguageMode.BENGALI ? 'বিশেষ দিবস' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯈꯪꯖꯤꯟꯕ ꯅꯨꯃꯤꯠ' : 'Observance')
                                : ev.category === 'ritual'
                                  ? (languageMode === LanguageMode.BENGALI ? 'অনুষ্ঠান' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯂꯥꯏ ꯊꯧꯔꯝ' : 'Ritual')
                                  : (languageMode === LanguageMode.BENGALI ? 'উৎসব' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯀꯨꯝꯍꯩ' : 'Festival')}
                        </span>
                      </div>

                      {ev.description && (
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                          {ev.description}
                        </p>
                      )}

                      {ev.blogUrl && (
                        <a
                          href={ev.blogUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-rose-800 hover:text-rose-950 dark:text-rose-400 dark:hover:text-rose-200 mt-1 inline-flex items-center gap-1.5 transition-colors self-start"
                        >
                          <span>Read article</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Traditional Almanac Guidelines (Tatnaba & Thasi Maikei) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Tatnaba Day Advisory */}
              <div className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 ${
                isTatnabaDay
                  ? 'bg-amber-50/50 dark:bg-amber-950/25 border-amber-300/80 dark:border-amber-900/50'
                  : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/30'
              }`}>
                <div className="flex items-center gap-2">
                  {isTatnabaDay ? (
                    <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    {languageMode === LanguageMode.BENGALI ? 'তৎনবা বিচার' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯈꯣꯡꯆꯠ ꯇꯠꯅꯕ' : 'Tatnaba Status'}
                  </span>
                </div>

                <div>
                  <span className={`text-xs font-black block ${
                    isTatnabaDay ? 'text-amber-800 dark:text-amber-300' : 'text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {isTatnabaDay 
                      ? (languageMode === LanguageMode.BENGALI ? '⚠️ তৎনবা দিন (যাত্রা নিষেধ)' : languageMode === LanguageMode.MEITEI_MAYEK ? '⚠️ ꯈꯣꯡꯆꯠ ꯇꯠꯅꯕ ꯅꯨꯃꯤꯠ' : '⚠️ Tatnaba Day')
                      : (languageMode === LanguageMode.BENGALI ? 'যাত্রার জন্য শুভ' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯈꯣꯡꯆꯠ ꯌꯥꯕ ꯅꯨꯃꯤꯠ' : 'Favorable Day')}
                  </span>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight mt-1">
                    {isTatnabaDay 
                      ? 'Avoid embarking on long journeys or commencement of major ventures today.' 
                      : 'No Tatnaba travel restrictions on this weekday.'}
                  </p>
                </div>
              </div>

              {/* Thasi Maikei Direction */}
              {monthConfig && (
                <div className="p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/40 dark:bg-gray-850/40 flex flex-col justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-rose-800 dark:text-rose-400" />
                    <span className="text-[10px] font-black uppercase tracking-tight text-gray-900 dark:text-white">
                      {languageMode === LanguageMode.BENGALI ? 'থাসী মাইকৈ' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯊꯥꯁꯤ ꯃꯥꯏꯀꯩ' : 'Thasi Maikei'}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-black text-rose-900 dark:text-rose-200 block">
                      {thasiMaikeiNative} ({thasiMaikeiDirection})
                    </span>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight mt-1">
                      {languageMode === LanguageMode.BENGALI 
                        ? 'এই মাসে এই দিকে ভ্রমণ বর্জনীয় দিক।' 
                        : languageMode === LanguageMode.MEITEI_MAYEK 
                          ? 'ꯊꯥꯁꯤꯗ ꯃꯥꯏꯀꯩ ꯑꯁꯤꯗ ꯈꯣꯡꯆꯠ ꯆꯠꯂꯣꯏꯗꯕ꯫' 
                          : 'Forbidden journey direction for this lunar month.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </motion.div>
    </div>
  );
};
