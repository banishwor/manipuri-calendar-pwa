import React, { useState } from 'react';
import { CalendarDay, Event, LanguageMode, MonthConfig, Translations } from '../types';
import { Translator } from '../utils/translator';
import { MoonGraphic } from './MoonGraphic';
import { MeiteiClock } from './MeiteiClock';
import {
  Calendar as CalendarIcon,
  Search,
  Settings,
  Star,
  AlertTriangle,
  Compass,
  Sparkles,
  ChevronRight,
  Sun,
  Leaf,
  Moon,
  Info,
  CalendarRange,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TodayTabProps {
  todayDay: CalendarDay | null;
  todayMonthConfig: MonthConfig | null;
  languageMode: LanguageMode;
  translations: Translations | null;
  upcomingFestivals: { date: string; dayData: CalendarDay; events: Event[]; daysRemaining: number }[];
  onNavigateToDetail: (dateStr: string) => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  eventsList: Event[];
}

// Helpers for 4 seasonal calculations (Yenningtha, Kalentha, Nakentha, Ningthamtha)
const getSeasonInfo = (monthName: string, mode: LanguageMode) => {
  const norm = monthName?.toUpperCase().replace(/\s*\(LEAP\)/g, '').replace(/_LEAP/g, '').trim() || '';
  
  // 1. Spring (Yenning-tha): Phairen (Feb-Mar), Lamta (Mar-Apr), Sajibu (Apr-May)
  if (['PHAIREN', 'PHAIREL', 'LAMTA', 'SAJIBU'].includes(norm)) {
    return { 
      en: 'Spring', 
      label: mode === LanguageMode.BENGALI ? 'য়েন্নিংথা (Yenningtha)' : mode === LanguageMode.MEITEI_MAYEK ? 'ꯌꯦꯟꯅꯤꯡꯊꯥ' : 'ꯌꯦꯟꯅꯤꯡꯊꯥ (Yenningtha)' 
    };
  }
  
  // 2. Summer / Monsoon (Kalen / Olangtha): Kalen (May-Jun), Enga (Jun-Jul), Engen (Jul-Aug)
  if (['KALEN', 'INGA', 'ENGA', 'INGEN', 'ENGEN'].includes(norm)) {
    return { 
      en: 'Summer', 
      label: mode === LanguageMode.BENGALI ? 'কালেনথা (Kalentha)' : mode === LanguageMode.MEITEI_MAYEK ? 'ꯀꯥꯂꯦꯟꯊꯥ' : 'ꯀꯥꯂꯦꯟꯊꯥ (Kalentha)' 
    };
  }
  
  // 3. Autumn (Nakentha): Thawan (Aug-Sep), Langban (Sep-Oct), Mera (Oct-Nov)
  if (['THAWAN', 'LANGBAN', 'MERA'].includes(norm)) {
    return { 
      en: 'Autumn', 
      label: mode === LanguageMode.BENGALI ? 'নাকেনথা (Nakentha)' : mode === LanguageMode.MEITEI_MAYEK ? 'ꯅꯥꯀꯦꯟꯊꯥ' : 'ꯅꯥꯀꯦꯟꯊꯥ (Nakentha)' 
    };
  }
  
  // 4. Winter (Ningthamtha / Nongjutha): Hiyangei (Nov-Dec), Poinu (Dec-Jan), Wakching (Jan-Feb)
  return { 
    en: 'Winter', 
    label: mode === LanguageMode.BENGALI ? 'নিংথমথা (Ningthamtha)' : mode === LanguageMode.MEITEI_MAYEK ? 'ꯅꯤꯡꯊꯝꯊꯥ' : 'ꯅꯤꯡꯊꯝꯊꯥ (Ningthamtha)' 
  };
};

const getGreetingText = (hour: number, mode: LanguageMode) => {
  if (mode === LanguageMode.BENGALI) {
    if (hour < 12) return { title: 'খুরুমজরি', period: 'মঙাং পুনশিবা', sub: 'শান্তি ও দীর্ঘায়ুর শুভেচ্ছা' };
    if (hour < 17) return { title: 'খুরুমজরি', period: 'লুৱাং পুনশিবা', sub: 'শান্তি ও দীর্ঘায়ুর শুভেচ্ছা' };
    return { title: 'খুরুমজরি', period: 'খুমান পুনশিবা', sub: 'শান্তি ও দীর্ঘায়ুর শুভেচ্ছা' };
  }
  if (mode === LanguageMode.MEITEI_MAYEK) {
    if (hour < 12) return { title: 'ꯈꯨꯔꯨꯝꯖꯔꯤ', period: 'ꯃꯪꯉꯥꯡ ꯄꯨꯟꯁꯤꯕ', sub: 'ꯏꯪ-ꯆꯤꯛꯄ ꯑꯃꯁꯨꯡ ꯄꯨꯟꯁꯤ ꯁꯥꯡꯕꯒꯤ ꯈꯨꯔꯨꯝꯖꯔꯤ' };
    if (hour < 17) return { title: 'ꯈꯨꯔꯨꯝꯖꯔꯤ', period: 'ꯂꯨꯋꯥꯡ ꯄꯨꯟꯁꯤꯕ', sub: 'ꯏꯪ-ꯆꯤꯛꯄ ꯑꯃꯁꯨꯡ ꯄꯨꯟꯁꯤ ꯁꯥꯡꯕꯒꯤ ꯈꯨꯔꯨꯝꯖꯔꯤ' };
    return { title: 'ꯈꯨꯔꯨꯝꯖꯔꯤ', period: 'ꯈꯨꯃꯥꯟ ꯄꯨꯟꯁꯤꯕ', sub: 'ꯏꯪ-ꯆꯤꯛꯄ ꯑꯃꯁꯨꯡ ꯄꯨꯟꯁꯤ ꯁꯥꯡꯕꯒꯤ ꯈꯨꯔꯨꯝꯖꯔꯤ' };
  }
  if (hour < 12) return { title: 'Khurumjari', period: 'Mangang Punsiba (ꯃꯪꯉꯥꯡ ꯄꯨꯟꯁꯤꯕ)', sub: 'Greeting of peace and longevity' };
  if (hour < 17) return { title: 'Khurumjari', period: 'Luwang Punsiba (ꯂꯨꯋꯥꯡ ꯄꯨꯟꯁꯤꯕ)', sub: 'Greeting of peace and longevity' };
  return { title: 'Khurumjari', period: 'Khuman Punsiba (ꯈꯨꯃꯥꯟ ꯄꯨꯟꯁꯤꯕ)', sub: 'Greeting of peace and longevity' };
};

const getCategoryBadge = (ev: Event, mode: LanguageMode) => {
  if (ev.isHoliday) {
    return {
      label: mode === LanguageMode.BENGALI ? 'সরকারি ছুটি' : mode === LanguageMode.MEITEI_MAYEK ? 'ꯄꯣꯊꯥ ꯅꯨꯃꯤꯠ' : 'Govt Holiday',
      className: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
    };
  }
  switch (ev.category) {
    case 'memorial':
      return {
        label: mode === LanguageMode.BENGALI ? 'স্মৃতি দিবস' : mode === LanguageMode.MEITEI_MAYEK ? 'ꯅꯤꯡꯁꯤꯡ ꯅꯨꯃꯤꯠ' : 'Memorial',
        className: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20'
      };
    case 'commemoration':
      return {
        label: mode === LanguageMode.BENGALI ? 'বিশেষ দিবস' : mode === LanguageMode.MEITEI_MAYEK ? 'ꯈꯪꯖꯤꯟꯕ ꯅꯨꯃꯤꯠ' : 'Observance',
        className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20'
      };
    case 'ritual':
      return {
        label: mode === LanguageMode.BENGALI ? 'অনুষ্ঠান' : mode === LanguageMode.MEITEI_MAYEK ? 'ꯂꯥꯏ ꯊꯧꯔꯝ' : 'Ritual',
        className: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20'
      };
    case 'bank_holiday':
      return {
        label: mode === LanguageMode.BENGALI ? 'ব্যাংক ছুটি' : mode === LanguageMode.MEITEI_MAYEK ? 'ꯕꯦꯡꯛ ꯄꯣꯊꯥ' : 'Bank Holiday',
        className: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
      };
    case 'celebration':
      return {
        label: mode === LanguageMode.BENGALI ? 'উৎসব দিবস' : mode === LanguageMode.MEITEI_MAYEK ? 'ꯍꯔꯥꯎ-ꯀꯨꯝꯍꯩ' : 'Celebration',
        className: 'bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20'
      };
    case 'festival':
    default:
      return {
        label: mode === LanguageMode.BENGALI ? 'উৎসব' : mode === LanguageMode.MEITEI_MAYEK ? 'ꯀꯨꯝꯍꯩ' : 'Festival',
        className: 'bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20'
      };
  }
};

export const TodayTab: React.FC<TodayTabProps> = ({
  todayDay,
  todayMonthConfig,
  languageMode,
  translations,
  upcomingFestivals,
  onNavigateToDetail,
  onOpenSettings,
  onOpenSearch,
  eventsList
}) => {
  const today = new Date();
  const dayOfWeekIndex = today.getDay();
  const dayOfWeekName = today.toLocaleDateString('en-US', { weekday: 'long' });

  // Format Gregorian date: "Monday, October 12, 2026"
  const formattedGregorian = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // ISO string for navigating to today's details (e.g. "2026-10-15")
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

  // Calculate greeting depending on current local time & language mode
  const currentHour = today.getHours();
  const greetingData = getGreetingText(currentHour, languageMode);
  const meiteiGreeting = greetingData.period;

  // Active script mode: In English mode, display indigenous Meitei Mayek alongside English
  const activeScriptMode = languageMode === LanguageMode.ENGLISH ? LanguageMode.MEITEI_MAYEK : languageMode;
  const season = todayDay ? getSeasonInfo(todayDay.month, languageMode) : { en: 'Autumn', label: languageMode === LanguageMode.BENGALI ? 'নাকেনথা (Nakentha)' : 'ꯅꯥꯀꯦꯟꯊꯥ' };
  const translatedDayString = todayDay 
    ? todayDay.day.map((d) => Translator.translateDigits(d.toString(), activeScriptMode, translations)).join(' & ') 
    : (languageMode === LanguageMode.BENGALI ? '২' : '꯲');
  const translatedMonthString = todayDay 
    ? Translator.translateMonth(todayDay.month, activeScriptMode, translations) 
    : (languageMode === LanguageMode.BENGALI ? 'মেরা' : 'ꯃꯦꯔꯥ');

  // Check if today has festivals or observances
  const todayFestivals = todayDay?.festivals?.map((id) => eventsList.find((e) => e.id === id)).filter(Boolean) as Event[] || [];
  const todayEvents = todayDay?.events?.map((id) => eventsList.find((e) => e.id === id)).filter(Boolean) as Event[] || [];
  const hasObservances = todayFestivals.length > 0 || todayEvents.length > 0;

  // Combine festivals and general events into a unified occasions array
  const todayOccasions = React.useMemo(() => {
    const list: Event[] = [];
    todayFestivals.forEach((f) => {
      if (!list.some((e) => e.id === f.id)) list.push(f);
    });
    todayEvents.forEach((e) => {
      if (!list.some((it) => it.id === e.id)) list.push(e);
    });
    return list;
  }, [todayFestivals, todayEvents]);

  // Toggle state for desktop: whether to view Observance Spotlight or At a Glance
  const [showObservanceSpotlight, setShowObservanceSpotlight] = useState(hasObservances);

  return (
    <div className="w-full md:h-full md:flex-1 md:flex md:flex-col min-h-0">
      {/* =========================================================================
          DESKTOP WIDESCREEN VIEW (DPI-RESPONSIVE FULL VIEWPORT FIT >= 768px)
          ========================================================================= */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-4 lg:gap-5 w-full md:h-full md:flex-1 min-h-0 items-stretch">
        {/* LEFT COLUMN: 60% Width (Col Span 7) - Stretches full height */}
        <div className="md:col-span-7 flex flex-col justify-between gap-4 h-full min-h-0 self-stretch">
          {/* Top Hero Card: Today's Manipuri Date with Real Scenic Loktak Lake Photo */}
          <div className="relative overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between flex-1 min-h-0">
            {/* Real Scenic Photograph of Loktak Lake at Dawn with Seamless Blending */}
            <div className="absolute right-0 top-0 bottom-0 w-[55%] lg:w-[60%] overflow-hidden pointer-events-none select-none rounded-r-3xl">
              <img 
                src="assets/loktak_hero.jpg" 
                alt="Loktak Lake Manipur Sunrise" 
                className="w-full h-full object-cover object-center scale-105"
              />
              {/* Directional gradient mask: Seamless transition from pure surface on left to photograph on right */}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent dark:from-gray-900 dark:via-gray-900/60 dark:to-transparent" />
              {/* Subtle bottom gradient to allow scenic photo reflection through liquid glass dock */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/60 via-white/15 to-transparent dark:from-gray-900/60 dark:via-gray-900/15" />
            </div>

            {/* Left Content Area (Overlaid on clean opaque backing) */}
            <div className="relative z-10 flex flex-col gap-2 max-w-[62%]">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-800 dark:text-rose-400">
                TODAY'S DATE
              </span>

              {/* Bold Primary Date Headline */}
              <div className="flex flex-col gap-0.5">
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-rose-950 dark:text-rose-100 tracking-tight leading-none uppercase">
                  {todayDay ? `${todayDay.month} · ${todayDay.day.join('&')}` : 'Loading...'}
                </h1>
                <p className="text-xl lg:text-2xl font-black text-rose-800/90 dark:text-rose-300 tracking-wider mt-1">
                  {translatedMonthString} · {translatedDayString}
                </p>
              </div>

              {/* Khurumjari Welcome with spellCheck disabled */}
              <div className="mt-1 flex flex-col" spellCheck={false}>
                <h3 className="text-sm lg:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{greetingData.title}</span>
                  {languageMode === LanguageMode.ENGLISH && (
                    <span className="text-xs font-semibold text-rose-800/80 dark:text-rose-400/80">· ꯈꯨꯔꯨꯝꯖꯔꯤ</span>
                  )}
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 font-medium leading-tight">
                  {greetingData.sub} • {languageMode === LanguageMode.ENGLISH ? 'Khuman Punsiba' : greetingData.period}
                </p>
              </div>
            </div>

            {/* Liquid Glass Bottom Dock (Middle-aligned, Frosted Crystal Aesthetics) */}
            <div className="relative z-10 mt-3 pt-2 w-full">
              <div className="w-full flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl bg-white/45 dark:bg-gray-900/45 backdrop-blur-xl border border-white/80 dark:border-white/15 shadow-[0_8px_30px_rgb(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)]">
                {/* Left: Gregorian Date */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-400/15 border border-rose-500/20 dark:border-rose-400/25 flex items-center justify-center text-rose-800 dark:text-rose-400 shrink-0 shadow-inner">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] font-black uppercase tracking-widest text-rose-950/60 dark:text-rose-300/70 leading-none">
                      {languageMode === LanguageMode.BENGALI ? 'গ্রেগরিয়ান তারিখ' : 'Gregorian Date'}
                    </span>
                    <span className="text-xs lg:text-[13px] font-bold text-gray-900 dark:text-white leading-tight mt-0.5 truncate">
                      {formattedGregorian}
                    </span>
                  </div>
                </div>

                {/* Vertical Liquid Glass Hairline Divider */}
                <div className="h-6 w-px bg-gray-300/60 dark:bg-gray-700/60 shrink-0" />

                {/* Right: Day of Week */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/20 dark:border-amber-400/25 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 shadow-inner">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-950/60 dark:text-amber-300/70 leading-none">
                      {languageMode === LanguageMode.BENGALI ? 'বার' : 'Day of Week'}
                    </span>
                    <span className="text-xs lg:text-[13px] font-bold text-gray-900 dark:text-white leading-tight mt-0.5 truncate">
                      {languageMode === LanguageMode.BENGALI 
                        ? `${dayOfWeekName} (${Translator.translateWeekday(dayOfWeekName, LanguageMode.BENGALI, translations)})` 
                        : dayOfWeekName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC SWAP: Observance Spotlight vs "Today at a Glance" (fills remaining left height) */}
          <div className="w-full flex-1 min-h-0 flex flex-col">
            <AnimatePresence mode="wait">
              {hasObservances && showObservanceSpotlight ? (
                /* CELEBRATION SPOTLIGHT CARD */
                <motion.div
                  key="observance-card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30 dark:from-amber-950/20 dark:via-gray-900 dark:to-rose-950/20 p-4 lg:p-5 shadow-sm flex flex-col justify-between h-full min-h-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-current" />
                      <span className="text-xs lg:text-sm font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                        Today's Observance &amp; Festival
                      </span>
                    </div>

                    <button
                      onClick={() => setShowObservanceSpotlight(false)}
                      className="text-[9.5px] font-black px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-rose-800 hover:border-rose-300 transition-colors cursor-pointer"
                    >
                      View At a Glance
                    </button>
                  </div>

                  {/* Occasion & observance details */}
                  <div className="flex flex-col gap-2 flex-1 justify-center min-h-0 py-1">
                    {todayOccasions.map((fest) => {
                      const badge = getCategoryBadge(fest, languageMode);
                      return (
                        <div key={fest.id} className="flex items-start justify-between gap-3 bg-white dark:bg-gray-900/80 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight truncate">
                              {fest.name}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug line-clamp-2">
                              {fest.description || 'Traditional Manipuri religious festival and cultural observance celebrated with customary devotion.'}
                            </p>
                          </div>
                          <span className={`flex-shrink-0 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Compact Lunar Badges on Observance Card */}
                  <div className="grid grid-cols-4 gap-2 pt-1 border-t border-amber-100/60 dark:border-amber-900/20 text-center">
                    <div className="bg-white/60 dark:bg-gray-900/40 p-1.5 rounded-xl">
                      <span className="text-[8px] font-bold text-gray-400 uppercase block">Month</span>
                      <span className="text-xs font-black text-rose-800 dark:text-rose-400">{todayDay?.month}</span>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-900/40 p-1.5 rounded-xl">
                      <span className="text-[8px] font-bold text-gray-400 uppercase block">Thasi Day</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white">{todayDay?.day.join('&')}</span>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-900/40 p-1.5 rounded-xl">
                      <span className="text-[8px] font-bold text-gray-400 uppercase block">Season</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white">{season.en}</span>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-900/40 p-1.5 rounded-xl">
                      <span className="text-[8px] font-bold text-gray-400 uppercase block">Phase</span>
                      <span className="text-xs font-black text-amber-700 dark:text-amber-400 truncate block">{todayDay?.observance || 'Waxing'}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* TODAY AT A GLANCE (6-CARD COMPACT GRID WITH RICH DATA DENSITY) */
                <motion.div
                  key="glance-card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full min-h-0 flex-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-800 dark:text-rose-400">
                      TODAY AT A GLANCE
                    </span>

                    {hasObservances && (
                      <button
                        onClick={() => setShowObservanceSpotlight(true)}
                        className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        ★ View Today's Observance
                      </button>
                    )}
                  </div>

                  {/* The 6 Clean Metrics Grid - Balanced Swiss Style Data Density */}
                  <div className="grid grid-cols-3 gap-2.5 lg:gap-3 flex-1 min-h-0 py-1" spellCheck={false}>
                    {/* 1. Month */}
                    <div className="bg-gray-50/70 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100/80 dark:border-gray-800/60 hover:border-rose-200 dark:hover:border-rose-900/40 transition-colors flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Moon className="w-3.5 h-3.5 text-rose-800 dark:text-rose-400" />
                          <span className="text-[8.5px] font-bold uppercase tracking-wider">Month</span>
                        </div>
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-850 dark:bg-rose-950/40 dark:text-rose-300">Lunar</span>
                      </div>
                      <div className="my-auto">
                        <span className="text-base lg:text-lg font-black text-gray-900 dark:text-white leading-tight block">{todayDay?.month || 'MERA'}</span>
                        <span className="text-xs font-bold text-rose-800 dark:text-rose-400 block mt-0.5">{translatedMonthString}</span>
                      </div>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">Meitei Kalendha</span>
                    </div>

                    {/* 2. Day (Thasi) */}
                    <div className="bg-gray-50/70 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100/80 dark:border-gray-800/60 hover:border-rose-200 dark:hover:border-rose-900/40 transition-colors flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <CalendarRange className="w-3.5 h-3.5 text-rose-800 dark:text-rose-400" />
                          <span className="text-[8.5px] font-bold uppercase tracking-wider">Day (Thasi)</span>
                        </div>
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-850 dark:bg-rose-950/40 dark:text-rose-300">Numit</span>
                      </div>
                      <div className="my-auto">
                        <span className="text-base lg:text-lg font-black text-gray-900 dark:text-white leading-tight block">{todayDay?.day.join(' & ') || '2'}</span>
                        <span className="text-xs font-bold text-rose-800 dark:text-rose-400 block mt-0.5">{translatedDayString}</span>
                      </div>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">Thasi Cycle</span>
                    </div>

                    {/* 3. Day of Week */}
                    <div className="bg-gray-50/70 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100/80 dark:border-gray-800/60 hover:border-amber-200 dark:hover:border-amber-900/40 transition-colors flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span className="text-[8.5px] font-bold uppercase tracking-wider">Weekday</span>
                        </div>
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">Solar</span>
                      </div>
                      <div className="my-auto">
                        <span className="text-base lg:text-lg font-black text-gray-900 dark:text-white leading-tight block truncate">{dayOfWeekName}</span>
                        <span className="text-xs font-bold text-rose-800 dark:text-rose-400 block mt-0.5 truncate">
                          {Translator.translateWeekday(dayOfWeekName, activeScriptMode, translations)}
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">Weekly Order</span>
                    </div>

                    {/* 4. Season */}
                    <div className="bg-gray-50/70 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100/80 dark:border-gray-800/60 hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-colors flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[8.5px] font-bold uppercase tracking-wider">Season</span>
                        </div>
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">Nature</span>
                      </div>
                      <div className="my-auto">
                        <span className="text-base lg:text-lg font-black text-gray-900 dark:text-white leading-tight block truncate">{season.en}</span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5 truncate">{season.label}</span>
                      </div>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">Climatic Period</span>
                    </div>

                    {/* 5. Lunar Phase */}
                    <div className="bg-gray-50/70 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100/80 dark:border-gray-800/60 hover:border-amber-200 dark:hover:border-amber-900/40 transition-colors flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Moon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          <span className="text-[8.5px] font-bold uppercase tracking-wider">Moon Phase</span>
                        </div>
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">Orbit</span>
                      </div>
                      <div className="my-auto">
                        <span className="text-base lg:text-lg font-black text-gray-900 dark:text-white leading-tight block truncate">{todayDay?.observance || 'Waxing'}</span>
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mt-0.5 truncate">
                          {languageMode === LanguageMode.BENGALI 
                            ? (todayDay?.observance === 'purnima' ? 'পূর্ণিমা' : todayDay?.observance === 'thasi' ? 'থাসী' : 'থা থাংজবা') 
                            : (todayDay?.moonPhase ? `${todayDay.moonPhase}` : 'ꯊꯥ ꯊꯥꯡꯖꯕ')}
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">Illumination</span>
                    </div>

                    {/* 6. Special Note */}
                    <div className="bg-gray-50/70 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100/80 dark:border-gray-800/60 hover:border-rose-200 dark:hover:border-rose-900/40 transition-colors flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Sparkles className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
                          <span className="text-[8.5px] font-bold uppercase tracking-wider">Observance</span>
                        </div>
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">Custom</span>
                      </div>
                      <div className="my-auto">
                        <span className="text-base lg:text-lg font-black text-gray-900 dark:text-white leading-tight block truncate">
                          {hasObservances ? todayFestivals[0]?.name || 'Special Day' : 'Regular Day'}
                        </span>
                        <span className="text-xs font-bold text-gray-500 block mt-0.5 truncate">
                          {hasObservances ? 'Ceremony today' : 'No restrictions'}
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">Astrology Note</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: 40% Width (Col Span 5) - Stretches to the exact same baseline */}
        <div className="md:col-span-5 flex flex-col justify-between gap-4 h-full min-h-0 self-stretch">
          {/* 1. Physical Analog Clock with Multi-Script Numerals + Imphal Local Time */}
          <div className="shrink-0">
            <MeiteiClock languageMode={languageMode} />
          </div>

          {/* 2. Upcoming Festivals Agenda Card - Fills middle height with 4 events (Gestalt Proximity) */}
          <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-4 lg:p-5 shadow-sm flex flex-col justify-between flex-1 min-h-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-800 dark:text-rose-400">
                UPCOMING EVENTS
              </span>
              <span className="text-[9px] font-bold text-gray-400">
                {upcomingFestivals.length} events loaded
              </span>
            </div>

            {/* 4 Festival Rows evenly distributed */}
            <div className="flex flex-col justify-between gap-1.5 flex-1 min-h-0 py-1">
              {upcomingFestivals.slice(0, 4).map((item, idx) => {
                const firstFest = item.events[0];
                if (!firstFest) return null;

                const daysText = item.daysRemaining === 0 
                  ? 'TODAY' 
                  : item.daysRemaining === 1 
                    ? 'TOMORROW' 
                    : `IN ${item.daysRemaining} DAYS`;

                const badgeStyle = item.daysRemaining <= 3 
                  ? 'bg-red-600 text-white' 
                  : item.daysRemaining <= 14 
                    ? 'bg-rose-800 text-white dark:bg-rose-500' 
                    : 'bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300';

                return (
                  <div
                    key={`${item.date}-${idx}`}
                    onClick={() => onNavigateToDetail(item.date)}
                    className="p-2 lg:p-2.5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-rose-300 dark:hover:border-rose-900/50 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-white dark:hover:bg-gray-850 transition-all flex items-center justify-between gap-3 cursor-pointer group flex-1"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg tracking-wider whitespace-nowrap ${badgeStyle}`}>
                        {daysText}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <h5 className="text-xs lg:text-sm font-bold text-gray-900 dark:text-white group-hover:text-rose-800 dark:group-hover:text-rose-400 transition-colors truncate">
                          {firstFest.name}
                        </h5>
                        <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
                          <span>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span>•</span>
                          <span className="text-rose-800 dark:text-rose-400 font-semibold">
                            {Translator.translateMonth(item.dayData.month, languageMode, translations)} · {item.dayData.day.map((d) => Translator.translateDigits(d.toString(), languageMode, translations)).join('&')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-rose-800 dark:group-hover:text-rose-400 transition-colors flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Current Month Traditional Guidelines Card - Fixed bottom element matching left baseline */}
          {todayMonthConfig && (
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-3.5 lg:p-4 shadow-sm flex flex-col justify-between gap-2 min-h-0 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-800 dark:text-rose-400">
                {todayDay?.month?.toUpperCase() || ''} MONTH GUIDELINES
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Col 1: Thasi Maikei Direction */}
                <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/60 dark:border-rose-900/30 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-rose-100/80 dark:bg-rose-900/40 flex items-center justify-center text-rose-800 dark:text-rose-300 flex-shrink-0">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[7.5px] font-bold text-gray-400 uppercase tracking-widest block leading-none truncate">
                      {languageMode === LanguageMode.BENGALI ? 'দিক (মাইকৈ)' : 'DIRECTION'}
                    </span>
                    <span className="text-xs font-black text-gray-900 dark:text-white leading-tight block truncate mt-0.5">
                      {Translator.translateDirection(todayMonthConfig.thasiMaikei, languageMode, translations)}
                      {languageMode === LanguageMode.ENGLISH && (
                        <span className="text-[10.5px] text-rose-800/70 dark:text-rose-400/70 font-semibold ml-1">
                          ({Translator.translateDirection(todayMonthConfig.thasiMaikei, LanguageMode.MEITEI_MAYEK, translations)})
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Col 2: Tatnaba Avoided Weekdays (Auspicious lunar chip) */}
                <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/60 dark:border-amber-900/30 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-amber-100/80 dark:bg-amber-900/40 flex items-center justify-center text-amber-800 dark:text-amber-300 flex-shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[7.5px] font-bold text-amber-700/80 dark:text-amber-400 uppercase tracking-widest block leading-none truncate">
                      {languageMode === LanguageMode.BENGALI ? 'তৎনবা বার' : 'TATNABA'}
                    </span>
                    <span className="text-xs font-black text-gray-900 dark:text-white leading-tight block truncate mt-0.5" title={todayMonthConfig.tatnaba.join(', ')}>
                      {todayMonthConfig.tatnaba.length > 0 
                        ? todayMonthConfig.tatnaba.map((d) => Translator.translateWeekday(d, languageMode, translations)).join(', ')
                        : 'None'}
                      {languageMode === LanguageMode.ENGLISH && todayMonthConfig.tatnaba.length > 0 && (
                        <span className="text-[10.5px] text-amber-800/70 dark:text-amber-400/70 font-semibold ml-1">
                          ({todayMonthConfig.tatnaba.map((d) => Translator.translateWeekday(d, LanguageMode.MEITEI_MAYEK, translations)).join(', ')})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEW (100% PRESERVED & UNTOUCHED UNDER MD BREAKPOINT < 768px)
          ========================================================================= */}
      {/* =========================================================================
          MOBILE VIEW (OPTIMIZED FOR ZERO-SCROLL VIEWPORT FIT ON REGULAR DAYS)
          ========================================================================= */}
      <div className="md:hidden flex flex-col gap-3.5 pb-24">
        {/* Header Toolbar & Dynamic Cultural Greeting */}
        <div className="flex flex-col gap-1.5 pb-2 border-b border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                Today's Date
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                Manipuri Traditional Lunar Calendar
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={onOpenSearch}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Search traditional days and holidays"
              >
                <Search className="w-4 h-4" />
              </button>
              <button 
                onClick={onOpenSettings}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-row Greeting dynamically adapting according to current local hour & language */}
          <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-rose-800 dark:text-rose-400 shrink-0">
                {greetingData.title}
                {languageMode === LanguageMode.ENGLISH && ' · ꯈꯨꯔꯨꯝꯖꯔꯤ'}
              </span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">
                {greetingData.period}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium shrink-0 hidden sm:inline">
              {greetingData.sub}
            </span>
          </div>
        </div>

        {!todayDay ? (
          <div className="flex flex-col items-center justify-center p-6 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-3xl text-center gap-3">
            <CalendarIcon className="w-10 h-10 text-amber-600 dark:text-amber-500" />
            <div className="flex flex-col gap-1">
              <h5 className="font-bold text-gray-900 dark:text-white text-sm">Active Calendar Check</h5>
              <p className="text-xs text-gray-600 dark:text-gray-300 max-w-sm">
                Today's date falls outside the pre-loaded calendar data. Please browse the full calendar view to view traditional days and events.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Primary Manipuri Date Hero Card with Integrated Frosted Bottom Dock */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-900 via-rose-950 to-rose-900 p-4 sm:p-5 text-white shadow-lg border border-rose-800/40">
              {/* Subtle ambient lighting */}
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-rose-500/15 blur-2xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-2.5">
                {/* Eyebrow Label & Season Pill */}
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black uppercase tracking-widest text-rose-200/80">
                    TODAY'S DATE
                  </span>
                  {season && (
                    <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-rose-100 border border-white/10">
                      {season.label}
                    </span>
                  )}
                </div>

                {/* Big Bold Primary Manipuri Headline */}
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-none uppercase text-white">
                    {todayDay.month} · {todayDay.day.join('&')}
                  </h3>
                  <p className="text-lg sm:text-xl font-black text-rose-200/90 tracking-wide mt-0.5">
                    {translatedMonthString} · {translatedDayString}
                  </p>
                </div>

                {/* Integrated Frosted Glass Dock (Gregorian + Astronomical Moon Phase) */}
                <div className="mt-1 pt-1 border-t border-white/10">
                  <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-2xl bg-white/10 dark:bg-black/25 backdrop-blur-md border border-white/15">
                    {/* Left: Gregorian Date & Weekday */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-200 shrink-0">
                        <CalendarIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[7.5px] font-bold uppercase tracking-wider text-rose-200/70 leading-none">
                          {languageMode === LanguageMode.BENGALI ? 'গ্রেগরিয়ান তারিখ' : 'Gregorian'}
                        </span>
                        <span className="text-xs font-bold text-white leading-tight mt-0.5 truncate">
                          {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Center Hairline Divider */}
                    <div className="h-6 w-px bg-white/20 shrink-0" />

                    {/* Right: Moon Phase & Thasi Day */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center shrink-0">
                        <MoonGraphic phase={todayDay.observance || ''} moonPhase={todayDay.moonPhase || 'waxing'} size={20} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[7.5px] font-bold uppercase tracking-wider text-amber-200/80 leading-none">
                          {languageMode === LanguageMode.BENGALI ? 'চন্দ্র পর্ব' : 'Moon Phase'}
                        </span>
                        <span className="text-xs font-bold text-amber-100 leading-tight mt-0.5 truncate">
                          {todayDay.observance 
                            ? (languageMode === LanguageMode.BENGALI 
                                ? (todayDay.observance === 'purnima' ? 'পূর্ণিমা' : todayDay.observance === 'thasi' ? 'থাসী' : todayDay.observance)
                                : languageMode === LanguageMode.MEITEI_MAYEK
                                  ? (todayDay.observance === 'purnima' ? 'ꯄꯨꯔꯅꯤꯃꯥ' : todayDay.observance === 'thasi' ? 'ꯊꯥꯁꯤ' : todayDay.observance)
                                  : (todayDay.observance.charAt(0).toUpperCase() + todayDay.observance.slice(1)))
                            : (languageMode === LanguageMode.BENGALI ? 'শুক্লপক্ষ' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯊꯥ ꯊꯥꯡꯖꯕ' : 'Waxing')} 
                          {' · '}
                          {todayDay.day.map((d) => Translator.translateDigits(d.toString(), languageMode, translations)).join('&')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Today's Occasion & Observance Card (Conditional: Only renders if today has occasions) */}
            {hasObservances && (
              <div 
                onClick={() => onNavigateToDetail(todayStr)}
                className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/5 dark:from-amber-950/30 dark:via-gray-900 dark:to-rose-950/20 p-3.5 shadow-sm hover:border-amber-400 transition-all cursor-pointer flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 truncate">
                      {languageMode === LanguageMode.BENGALI ? 'আজকের উৎসব ও বিশেষ দিবস' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯉꯁꯤꯒꯤ ꯀꯨꯝꯍꯩ ꯑꯃꯁꯨꯡ ꯂꯥꯏ ꯊꯧꯔꯝ' : "Today's Occasion & Observance"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0">
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {todayOccasions.slice(0, 2).map((ev) => {
                  const badge = getCategoryBadge(ev, languageMode);
                  return (
                    <div key={ev.id} className="flex items-center justify-between gap-3 bg-white/70 dark:bg-gray-900/70 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight truncate">
                          {ev.name}
                        </h4>
                        {ev.description && (
                          <p className="text-[10.5px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {ev.description}
                          </p>
                        )}
                      </div>
                      <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. Upcoming Festivals Countdown Horizontal Carousel */}
            {upcomingFestivals.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-400">
                    UPCOMING EVENTS COUNTDOWN
                  </span>
                  <span className="text-[9px] font-bold text-gray-400">
                    {upcomingFestivals.length} events
                  </span>
                </div>

                <div className="flex gap-2.5 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory scrollbar-none">
                  {upcomingFestivals.slice(0, 6).map((item, idx) => {
                    const firstFest = item.events[0];
                    const hasHoliday = item.events.some((e) => e.isHoliday);
                    if (!firstFest) return null;

                    const daysText = item.daysRemaining === 0 
                      ? 'TODAY' 
                      : item.daysRemaining === 1 
                        ? 'TOMORROW' 
                        : `IN ${item.daysRemaining} DAYS`;
                    const badgeStyle = item.daysRemaining <= 3 
                      ? 'bg-red-600 text-white' 
                      : 'bg-rose-800 text-white dark:bg-rose-500';

                    return (
                      <div
                        key={`${item.date}-${idx}`}
                        onClick={() => onNavigateToDetail(item.date)}
                        className="shrink-0 w-52 snap-start rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-sm hover:border-rose-300 dark:hover:border-rose-900/50 cursor-pointer transition-all flex flex-col justify-between gap-2.5"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-md tracking-wider ${badgeStyle}`}>
                            {daysText}
                          </span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate">
                            {hasHoliday ? 'Holiday' : firstFest.category}
                          </span>
                        </div>

                        <h5 className="font-bold text-xs text-gray-900 dark:text-white leading-tight line-clamp-1">
                          {firstFest.name}
                        </h5>

                        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 dark:border-gray-800/60 text-[10px]">
                          <span className="text-gray-400">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-rose-800 dark:text-rose-400 font-bold truncate">
                            {Translator.translateMonth(item.dayData.month, languageMode, translations)} · {item.dayData.day.map((d) => Translator.translateDigits(d.toString(), languageMode, translations)).join('&')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Month Guidelines (2-Column Compact Grid) */}
            {todayMonthConfig && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-400 px-0.5">
                  {todayDay?.month?.toUpperCase() || ''} MONTH GUIDELINES
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Col 1: Thasi Maikei Direction */}
                  <div className="p-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-800 dark:text-rose-400 shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[7.5px] font-bold text-gray-400 uppercase tracking-widest block leading-none truncate">
                        {languageMode === LanguageMode.BENGALI ? 'দিক (মাইকৈ)' : 'THASI MAIKEI'}
                      </span>
                      <span className="text-xs font-black text-gray-900 dark:text-white leading-tight block truncate mt-1">
                        {Translator.translateDirection(todayMonthConfig.thasiMaikei, languageMode, translations)}
                      </span>
                    </div>
                  </div>

                  {/* Col 2: Tatnaba Inauspicious Days */}
                  <div className="p-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[7.5px] font-bold text-amber-700/80 dark:text-amber-400 uppercase tracking-widest block leading-none truncate">
                        {languageMode === LanguageMode.BENGALI ? 'তৎনবা বার' : 'TATNABA'}
                      </span>
                      <span className="text-xs font-black text-gray-900 dark:text-white leading-tight block truncate mt-1">
                        {todayMonthConfig.tatnaba.length > 0 
                          ? todayMonthConfig.tatnaba.map((dayName) => Translator.translateWeekday(dayName, languageMode, translations)).join(', ') 
                          : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
