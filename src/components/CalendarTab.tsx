import React, { useMemo, useRef, useState, useEffect } from 'react';
import { CalendarDay, Event, LanguageMode, Translations, MonthConfig } from '../types';
import { Translator } from '../utils/translator';
import { CalendarRepository } from '../utils/calendarData';
import { MoonGraphic } from './MoonGraphic';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Settings, 
  Compass, 
  ShieldAlert, 
  Sparkles,
  Calendar as CalendarIcon,
  ChevronRight as ChevronRightSmall
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarTabProps {
  currentYear: number;
  currentMonth: number;
  languageMode: LanguageMode;
  translations: Translations | null;
  daysOfMonth: CalendarDay[];
  onNavigateToDetail: (dateStr: string) => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  eventsList: Event[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToToday: () => void;
  monthConfigs?: Record<string, MonthConfig>;
}

// 4 Traditional Meitei Seasons helper (Yenningtha, Kalentha, Nakentha, Ningthamtha)
const getSeasonInfo = (monthName: string, mode: LanguageMode) => {
  const norm = monthName?.toUpperCase().replace(/\s*\(LEAP\)/g, '').replace(/_LEAP/g, '').trim() || '';
  
  // 1. Spring (Yenning-tha): Phairen (Feb-Mar), Lamta (Mar-Apr), Sajibu (Apr-May)
  if (['PHAIREN', 'PHAIREL', 'LAMTA', 'SAJIBU'].includes(norm)) {
    return { 
      en: 'Spring', 
      label: mode === LanguageMode.BENGALI ? '🌸 য়েন্নিংথা (Spring)' : mode === LanguageMode.MEITEI_MAYEK ? '🌸 ꯌꯦꯟꯅꯤꯡꯊꯥ' : '🌸 Yenningtha · Spring',
      badgeClass: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20'
    };
  }
  
  // 2. Summer / Monsoon (Kalen / Olangtha): Kalen (May-Jun), Enga (Jun-Jul), Engen (Jul-Aug)
  if (['KALEN', 'INGA', 'ENGA', 'INGEN', 'ENGEN'].includes(norm)) {
    return { 
      en: 'Summer', 
      label: mode === LanguageMode.BENGALI ? '☀️ কালেনথা (Summer)' : mode === LanguageMode.MEITEI_MAYEK ? '☀️ ꯀꯥꯂꯦꯟꯊꯥ' : '☀️ Kalentha · Summer',
      badgeClass: 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20'
    };
  }
  
  // 3. Autumn (Nakentha): Thawan (Aug-Sep), Langban (Sep-Oct), Mera (Oct-Nov)
  if (['THAWAN', 'LANGBAN', 'MERA'].includes(norm)) {
    return { 
      en: 'Autumn', 
      label: mode === LanguageMode.BENGALI ? '🍁 নাকেনথা (Autumn)' : mode === LanguageMode.MEITEI_MAYEK ? '🍁 ꯅꯥꯀꯦꯟꯊꯥ' : '🍁 Nakentha · Autumn',
      badgeClass: 'bg-rose-500/10 text-rose-800 dark:text-rose-400 border-rose-500/20'
    };
  }
  
  // 4. Winter (Ningthamtha / Nongjutha): Hiyangei (Nov-Dec), Poinu (Dec-Jan), Wakching (Jan-Feb)
  return { 
    en: 'Winter', 
    label: mode === LanguageMode.BENGALI ? '❄️ নিংথমথা (Winter)' : mode === LanguageMode.MEITEI_MAYEK ? '❄️ ꯅꯤꯡꯊꯝꯊꯥ' : '❄️ Ningthamtha · Winter',
    badgeClass: 'bg-sky-500/10 text-sky-800 dark:text-sky-400 border-sky-500/20'
  };
};

// 8 Traditional Meitei Directions metadata for Compass Dial
const DIRECTION_METADATA: Record<string, { needleAngle: number; en: string }> = {
  'AWANG': { needleAngle: 0, en: 'North' },
  'CHINGKHEI': { needleAngle: 45, en: 'North-East' },
  'NONGPOK': { needleAngle: 90, en: 'East' },
  'MEIRAM': { needleAngle: 135, en: 'South-East' },
  'KHA': { needleAngle: 180, en: 'South' },
  'MAKHA': { needleAngle: 180, en: 'South' },
  'SANTHONG': { needleAngle: 225, en: 'South-West' },
  'NONGCHUP': { needleAngle: 270, en: 'West' },
  'KOUBRU': { needleAngle: 315, en: 'North-West' }
};

const COMPASS_DIAL_POINTS = [
  { key: 'AWANG', polarAngle: 270, labelEn: 'N', labelMayek: 'ꯑ' },
  { key: 'CHINGKHEI', polarAngle: 315, labelEn: 'NE', labelMayek: 'ꯆꯤ' },
  { key: 'NONGPOK', polarAngle: 0, labelEn: 'E', labelMayek: 'ꯅꯣ' },
  { key: 'MEIRAM', polarAngle: 45, labelEn: 'SE', labelMayek: 'ꯃꯩ' },
  { key: 'KHA', polarAngle: 90, labelEn: 'S', labelMayek: 'ꯈ' },
  { key: 'SANTHONG', polarAngle: 135, labelEn: 'SW', labelMayek: 'ꯁ' },
  { key: 'NONGCHUP', polarAngle: 180, labelEn: 'W', labelMayek: 'ꯆꯨ' },
  { key: 'KOUBRU', polarAngle: 225, labelEn: 'NW', labelMayek: 'ꯀ' }
];

export const CalendarTab: React.FC<CalendarTabProps> = ({
  currentYear,
  currentMonth,
  languageMode,
  translations,
  daysOfMonth,
  onNavigateToDetail,
  onOpenSettings,
  onOpenSearch,
  eventsList,
  onPrevMonth,
  onNextMonth,
  onJumpToToday,
  monthConfigs
}) => {
  const today = new Date();
  
  // Touch swipe gesture handlers for mobile month navigation
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      const minSwipeDistance = 50;
      if (Math.abs(diffX) > minSwipeDistance) {
        if (diffX > 0) {
          onPrevMonth();
        } else {
          onNextMonth();
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };
  
  // Format Gregorian month name: "October 2026"
  const localDate = new Date(currentYear, currentMonth - 1, 1);
  const gregorianMonthName = localDate.toLocaleString('en-US', { month: 'long' });

  // Get active lunar months in current grid
  const activeLunarMonths = useMemo(() => {
    const list = daysOfMonth.map((d) => d.month);
    return Array.from(new Set(list));
  }, [daysOfMonth]);

  const primaryLunarMonth = useMemo(() => {
    if (daysOfMonth.length === 0) return '';
    const midIndex = Math.floor(daysOfMonth.length / 2);
    return daysOfMonth[midIndex]?.month || daysOfMonth[0]?.month || '';
  }, [daysOfMonth]);

  const activeMonthsSubtitle = useMemo(() => {
    if (activeLunarMonths.length === 0) return '';
    return activeLunarMonths
      .map((m) => Translator.translateMonth(m, languageMode, translations))
      .join(' / ');
  }, [activeLunarMonths, languageMode, translations]);

  // Fallback MonthConfig loading if not directly passed in props
  const [internalConfigs, setInternalConfigs] = useState<Record<string, MonthConfig>>({});
  useEffect(() => {
    if (monthConfigs && Object.keys(monthConfigs).length > 0) return;
    let active = true;
    const repo = CalendarRepository.getInstance();
    repo.getMonthConfigsForYear(currentYear).then((configs) => {
      if (active && configs) setInternalConfigs(configs);
    }).catch(console.error);
    return () => { active = false; };
  }, [currentYear, monthConfigs]);

  const effectiveConfigs = useMemo(() => {
    if (monthConfigs && Object.keys(monthConfigs).length > 0) return monthConfigs;
    return internalConfigs;
  }, [monthConfigs, internalConfigs]);

  const activeMonthConfig = useMemo(() => {
    if (!primaryLunarMonth) return null;
    const norm = primaryLunarMonth.toUpperCase().replace(/\s*\(LEAP\)/g, '').replace(/_LEAP/g, '').trim();
    if (effectiveConfigs[norm]) return effectiveConfigs[norm];
    if (effectiveConfigs[primaryLunarMonth]) return effectiveConfigs[primaryLunarMonth];
    return null;
  }, [primaryLunarMonth, effectiveConfigs]);

  // Compass and Thasi Maikei info
  const thasiMaikeiDirection = activeMonthConfig?.thasiMaikei?.toUpperCase() || 'CHINGKHEI';
  const needleAngle = DIRECTION_METADATA[thasiMaikeiDirection]?.needleAngle ?? 45;
  const thasiMaikeiNative = Translator.translateDirection(thasiMaikeiDirection, languageMode, translations);
  const thasiMaikeiEn = DIRECTION_METADATA[thasiMaikeiDirection]?.en || thasiMaikeiDirection;

  // Tatnaba days
  const tatnabaDays = activeMonthConfig?.tatnaba || [];

  // Season and Meitei Year
  const season = getSeasonInfo(primaryLunarMonth, languageMode);
  const meiteiYear = useMemo(() => {
    if (daysOfMonth.length > 0) {
      const midDay = daysOfMonth[Math.floor(daysOfMonth.length / 2)];
      return Translator.getMeiteiYear(midDay.gregorian, midDay.month);
    }
    return currentYear + 1398;
  }, [daysOfMonth, currentYear]);

  const meiteiYearDigits = Translator.translateDigits(meiteiYear.toString(), languageMode, translations);
  const translatedPrimaryMonth = Translator.translateMonth(primaryLunarMonth, languageMode, translations);

  // Month navigation boundary flags
  const isMinMonth = currentYear === 2026 && currentMonth === 1;
  const isMaxMonth = currentYear === 2027 && currentMonth === 12;

  // Calculations for grid rendering:
  // Sunday = 0, Monday = 1 ... Saturday = 6
  const startDayOfWeek = useMemo(() => {
    return localDate.getDay();
  }, [localDate]);

  const lengthOfMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 0).getDate();
  }, [currentYear, currentMonth]);

  const weekdaysKeys = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  // Monthly Festivals Agenda items for right sidebar
  const monthlyFestivals = useMemo(() => {
    const items: {
      dateStr: string;
      dayNumber: number;
      gregorianFormatted: string;
      lunarMonth: string;
      lunarDays: number[];
      name: string;
      isHoliday: boolean;
      category: string;
    }[] = [];

    daysOfMonth.forEach((day) => {
      const parts = day.gregorian.split('-');
      const dayNum = parseInt(parts[2], 10);
      const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, dayNum);
      const gregShort = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Observance
      if (day.observance) {
        const obsName = day.observance.charAt(0).toUpperCase() + day.observance.slice(1);
        items.push({
          dateStr: day.gregorian,
          dayNumber: dayNum,
          gregorianFormatted: gregShort,
          lunarMonth: day.month,
          lunarDays: day.day,
          name: obsName,
          isHoliday: false,
          category: 'observance'
        });
      }

      // Festivals
      if (day.festivals && day.festivals.length > 0) {
        day.festivals.forEach((fId) => {
          const ev = eventsList.find((e) => e.id === fId);
          if (ev && !items.some((it) => it.dateStr === day.gregorian && it.name.toLowerCase() === ev.name.toLowerCase())) {
            items.push({
              dateStr: day.gregorian,
              dayNumber: dayNum,
              gregorianFormatted: gregShort,
              lunarMonth: day.month,
              lunarDays: day.day,
              name: ev.name,
              isHoliday: !!ev.isHoliday,
              category: ev.category || (ev.isHoliday ? 'holiday' : 'festival')
            });
          }
        });
      }

      // Events
      if (day.events && day.events.length > 0) {
        day.events.forEach((eId) => {
          const ev = eventsList.find((e) => e.id === eId);
          if (ev && !items.some((it) => it.dateStr === day.gregorian && it.name.toLowerCase() === ev.name.toLowerCase())) {
            items.push({
              dateStr: day.gregorian,
              dayNumber: dayNum,
              gregorianFormatted: gregShort,
              lunarMonth: day.month,
              lunarDays: day.day,
              name: ev.name,
              isHoliday: !!ev.isHoliday,
              category: ev.category || (ev.isHoliday ? 'holiday' : 'festival')
            });
          }
        });
      }
    });

    return items.sort((a, b) => a.dayNumber - b.dayNumber);
  }, [daysOfMonth, eventsList]);

  // Mobile Grid Cells (Existing 35-slot folded grid for mobile)
  const mobileGridCells = useMemo(() => {
    const cells: ({ type: 'empty' } | { type: 'day'; dayNumber: number; dateStr: string; dayData: CalendarDay | null; isToday: boolean; isSunday: boolean })[] = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push({ type: 'empty' });
    }

    for (let dayNum = 1; dayNum <= lengthOfMonth; dayNum++) {
      const dayStr = dayNum.toString().padStart(2, '0');
      const monthStr = currentMonth.toString().padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

      const dayData = daysOfMonth.find((d) => d.gregorian === dateStr) || null;
      
      const isToday = 
        today.getFullYear() === currentYear && 
        (today.getMonth() + 1) === currentMonth && 
        today.getDate() === dayNum;

      const cellDate = new Date(currentYear, currentMonth - 1, dayNum);
      const isSunday = cellDate.getDay() === 0;

      cells.push({
        type: 'day',
        dayNumber: dayNum,
        dateStr,
        dayData,
        isToday,
        isSunday
      });
    }

    if (cells.length > 35) {
      for (let i = 0; i < 7; i++) {
        const overflowIndex = 35 + i;
        if (overflowIndex < cells.length) {
          const overflowCell = cells[overflowIndex];
          if (overflowCell && overflowCell.type === 'day') {
            cells[i] = overflowCell;
          }
        }
      }
      return cells.slice(0, 35);
    }

    return cells;
  }, [currentYear, currentMonth, daysOfMonth, startDayOfWeek, lengthOfMonth, today]);

  // Desktop Grid Cells (Uncompressed 5 or 6 row layout with Tatnaba indicators and festival tags)
  const desktopGridCells = useMemo(() => {
    const cells: ({
      type: 'empty';
      key: string;
    } | {
      type: 'day';
      key: string;
      dayNumber: number;
      dateStr: string;
      dayData: CalendarDay | null;
      isToday: boolean;
      isSunday: boolean;
      isTatnaba: boolean;
      topFestival?: { name: string; isHoliday: boolean };
      containsHoliday: boolean;
    })[] = [];

    // Empty leading slots
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push({ type: 'empty', key: `lead-${i}` });
    }

    // Month days
    for (let dayNum = 1; dayNum <= lengthOfMonth; dayNum++) {
      const dayStr = dayNum.toString().padStart(2, '0');
      const monthStr = currentMonth.toString().padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      const dayData = daysOfMonth.find((d) => d.gregorian === dateStr) || null;

      const isToday = 
        today.getFullYear() === currentYear && 
        (today.getMonth() + 1) === currentMonth && 
        today.getDate() === dayNum;

      const cellDate = new Date(currentYear, currentMonth - 1, dayNum);
      const isSunday = cellDate.getDay() === 0;
      const weekdayKey = weekdaysKeys[cellDate.getDay()];
      const isTatnaba = tatnabaDays.includes(weekdayKey);

      const matchedFestivals = dayData?.festivals 
        ? (dayData.festivals.map((id) => eventsList.find((e) => e.id === id)).filter(Boolean) as Event[]) 
        : [];
      const matchedEvents = dayData?.events 
        ? (dayData.events.map((id) => eventsList.find((e) => e.id === id)).filter(Boolean) as Event[]) 
        : [];
      const containsHoliday = matchedFestivals.some((f) => f.isHoliday) || matchedEvents.some((e) => e.isHoliday);

      let topFestival: { name: string; isHoliday: boolean } | undefined;
      if (matchedFestivals.length > 0) {
        topFestival = { name: matchedFestivals[0].name, isHoliday: !!matchedFestivals[0].isHoliday };
      } else {
        const holEvent = matchedEvents.find((e) => e.isHoliday);
        if (holEvent) {
          topFestival = { name: holEvent.name, isHoliday: true };
        } else if (matchedEvents.length > 0) {
          topFestival = { name: matchedEvents[0].name, isHoliday: !!matchedEvents[0].isHoliday };
        }
      }

      cells.push({
        type: 'day',
        key: `day-${dateStr}`,
        dayNumber: dayNum,
        dateStr,
        dayData,
        isToday,
        isSunday,
        isTatnaba,
        topFestival,
        containsHoliday
      });
    }

    // Trailing empty slots to complete the final row
    const totalSlots = cells.length <= 35 ? 35 : 42;
    const trailingCount = totalSlots - cells.length;
    for (let i = 0; i < trailingCount; i++) {
      cells.push({ type: 'empty', key: `trail-${i}` });
    }

    return cells;
  }, [startDayOfWeek, lengthOfMonth, currentYear, currentMonth, daysOfMonth, today, tatnabaDays, eventsList]);

  // Helper for desktop weekday header dual-script display
  const getDesktopWeekdayLabel = (key: string) => {
    switch (languageMode) {
      case LanguageMode.MEITEI_MAYEK:
        return Translator.translateWeekday(key, languageMode, translations);
      case LanguageMode.BENGALI: {
        const bengaliShort = Translator.translateWeekdayShort(key, languageMode, translations);
        const enShort = Translator.translateWeekdayShort(key, LanguageMode.ENGLISH, translations);
        return `${bengaliShort} · ${enShort}`;
      }
      default: {
        const enShort = Translator.translateWeekdayShort(key, LanguageMode.ENGLISH, translations);
        const mayekShort = Translator.translateWeekdayShort(key, LanguageMode.MEITEI_MAYEK, translations);
        return `${enShort} · ${mayekShort}`;
      }
    }
  };

  return (
    <div className="w-full md:h-full md:flex-1 md:flex md:flex-col min-h-0">
      {/* =========================================================================
          DESKTOP WIDESCREEN VIEW (>= 768px): 70/30 Split with Grid + Compass & Agenda
          ========================================================================= */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-4 lg:gap-5 w-full md:h-full md:flex-1 min-h-0 items-stretch">
        
        {/* LEFT COLUMN: ~68% Width (Col Span 8) - Calendar Grid & Dual-Era Controls */}
        <div className="md:col-span-8 flex flex-col justify-between gap-3 h-full min-h-0 self-stretch">
          
          {/* Header Bar: Dual-Era Month Title, Season Pill, Navigation */}
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 shadow-sm shrink-0">
            {/* Title & Era Badges */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl lg:text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase leading-none">
                    {gregorianMonthName} {currentYear}
                  </h2>
                  <span className="text-rose-800 dark:text-rose-400 font-black text-sm lg:text-base leading-none">
                    · {translatedPrimaryMonth} {meiteiYearDigits}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {Translator.getMeiteiYearLabel(languageMode)}
                  </span>
                  <span className="text-gray-300 dark:text-gray-700 text-xs">•</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${season.badgeClass}`}>
                    {season.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onPrevMonth}
                disabled={isMinMonth}
                className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onJumpToToday}
                className="px-3.5 py-1.5 bg-rose-800 hover:bg-rose-900 dark:bg-rose-700 dark:hover:bg-rose-800 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯉꯁꯤ' : languageMode === LanguageMode.BENGALI ? 'আজ' : 'Today'}
              </button>

              <button
                onClick={onNextMonth}
                disabled={isMaxMonth}
                className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday 7-Column Headers */}
          <div className="grid grid-cols-7 gap-1.5 lg:gap-2 px-1 text-center shrink-0">
            {weekdaysKeys.map((key) => {
              const isSun = key === 'SUNDAY';
              const label = getDesktopWeekdayLabel(key);
              return (
                <div
                  key={`desktop-weekday-${key}`}
                  className={`py-1.5 px-1 rounded-xl text-xs font-black tracking-wide border uppercase select-none ${
                    isSun
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                      : 'bg-gray-100/60 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800/50'
                  }`}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {/* Desktop Dual-Date Calendar Grid (Equal Fractional Row Fit) */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className={`grid grid-cols-7 gap-1.5 lg:gap-2 flex-1 min-h-0 ${desktopGridCells.length > 35 ? 'grid-rows-6' : 'grid-rows-5'}`}>
              {desktopGridCells.map((cell) => {
                if (cell.type === 'empty') {
                  return (
                    <div 
                      key={cell.key}
                      className="rounded-2xl border border-dashed border-gray-200/50 dark:border-gray-800/40 bg-gray-50/20 dark:bg-gray-900/20 opacity-30 h-full min-h-0 pointer-events-none"
                    />
                  );
                }

                const { dayNumber, dateStr, dayData, isToday, isSunday, isTatnaba, topFestival, containsHoliday } = cell;

                // Month Label & Lunar Day Number
                const cellMonthLabel = dayData ? Translator.translateMonth(dayData.month, languageMode, translations) : '';
                const cellDayLabel = dayData 
                  ? dayData.day.map((d) => Translator.translateDigits(d.toString(), languageMode, translations)).join('/') 
                  : '';

                // Styling logic
                let borderClass = 'border-gray-100 dark:border-gray-800/80';
                let bgClass = 'bg-white dark:bg-gray-900/90 hover:bg-gray-50/80 dark:hover:bg-gray-800/60';
                let dateNumColor = 'text-gray-900 dark:text-gray-100';

                if (isToday) {
                  borderClass = 'border-rose-600 dark:border-rose-500 border-2 shadow-sm ring-2 ring-rose-500/20';
                  bgClass = 'bg-gradient-to-br from-rose-50/80 to-amber-50/30 dark:from-rose-950/40 dark:to-amber-950/20';
                  dateNumColor = 'text-rose-900 dark:text-rose-200';
                } else if (containsHoliday || isSunday) {
                  borderClass = 'border-red-100 dark:border-red-900/30';
                  bgClass = 'bg-red-500/[0.03] dark:bg-red-950/[0.12] hover:bg-red-500/[0.06]';
                  dateNumColor = 'text-red-600 dark:text-red-500';
                } else if (dayData?.observance) {
                  borderClass = 'border-amber-200/60 dark:border-amber-900/40';
                  bgClass = 'bg-amber-500/[0.03] dark:bg-amber-950/[0.12]';
                }

                return (
                  <div
                    key={cell.key}
                    onClick={() => onNavigateToDetail(dateStr)}
                    className={`rounded-2xl border p-1.5 lg:p-2 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md select-none h-full min-h-0 ${borderClass} ${bgClass}`}
                  >
                    {/* Top Row: Gregorian Date Number & Moon Phase / Tatnaba */}
                    <div className="flex items-center justify-between gap-1 leading-none">
                      {isToday ? (
                        <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-rose-800 dark:bg-rose-700 text-white flex items-center justify-center text-xs lg:text-sm font-black shadow-sm">
                          {dayNumber}
                        </div>
                      ) : (
                        <span className={`text-sm lg:text-base font-black ${dateNumColor}`}>
                          {dayNumber}
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        {isTatnaba && (
                          <span 
                            className="text-[9px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-extrabold"
                            title="Tatnaba Day (Travel Prohibited)"
                          >
                            ⚡
                          </span>
                        )}
                        {dayData?.observance && (
                          <MoonGraphic
                            phase={dayData.observance}
                            moonPhase={dayData.moonPhase}
                            size={14}
                          />
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Manipuri Lunar Date */}
                    <div className="flex flex-col overflow-hidden my-0.5">
                      <span className="text-[10px] lg:text-[11px] font-bold text-rose-800 dark:text-rose-400 truncate leading-tight">
                        {cellDayLabel} {cellMonthLabel}
                      </span>
                    </div>

                    {/* Bottom Row: Festival / Holiday Badge */}
                    <div className="h-4 flex items-center overflow-hidden">
                      {topFestival ? (
                        <span 
                          className={`text-[8px] lg:text-[9px] font-extrabold uppercase truncate px-1.5 py-0.5 rounded leading-tight w-full block ${
                            topFestival.isHoliday
                              ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
                              : 'bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20'
                          }`}
                          title={topFestival.name}
                        >
                          {topFestival.name}
                        </span>
                      ) : dayData?.observance ? (
                        <span className="text-[7.5px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 truncate">
                          {dayData.observance}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ~32% Width (Col Span 4) - Thasi Maikei Compass, Tatnaba & Agenda */}
        <div className="md:col-span-4 flex flex-col justify-between gap-3 h-full min-h-0 self-stretch">
          
          {/* Card 1: Thasi Maikei Direction Compass */}
          <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-3.5 lg:p-4 shadow-sm flex flex-col items-center justify-between shrink-0">
            {/* Header */}
            <div className="w-full flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-rose-500/10 dark:bg-rose-400/15 border border-rose-500/20 flex items-center justify-center text-rose-800 dark:text-rose-400">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    {languageMode === LanguageMode.BENGALI ? 'থাসী মাইকৈ' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯊꯥꯁꯤ ꯃꯥꯏꯀꯩ' : 'Thasi Maikei'}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">
                    {translatedPrimaryMonth}
                  </span>
                </div>
              </div>

              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20">
                ⚠️ {languageMode === LanguageMode.BENGALI ? 'বর্জনীয় দিক' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯊꯣꯛꯂꯣꯏꯗꯕ' : 'Inauspicious'}
              </span>
            </div>

            {/* Circular Physical Compass Dial */}
            <div className="relative w-[150px] h-[150px] select-none my-1">
              <svg className="w-full h-full" viewBox="0 0 170 170">
                {/* Outer Bezel */}
                <circle
                  cx="85"
                  cy="85"
                  r="78"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-gray-200 dark:text-gray-800"
                />
                {/* Hairline Decorative Ring */}
                <circle
                  cx="85"
                  cy="85"
                  r="66"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  className="text-gray-300 dark:text-gray-700"
                />
                {/* 8 Cardinal & Ordinal Points */}
                {COMPASS_DIAL_POINTS.map((pt) => {
                  const rad = (pt.polarAngle * Math.PI) / 180;
                  const isTarget = pt.key === thasiMaikeiDirection;
                  const dotX = 85 + 56 * Math.cos(rad);
                  const dotY = 85 + 56 * Math.sin(rad);

                  return (
                    <g key={pt.key}>
                      {isTarget && (
                        <circle
                          cx={dotX}
                          cy={dotY}
                          r={7}
                          className="stroke-rose-500 fill-rose-500/20 stroke-1.5"
                        />
                      )}
                      <circle
                        cx={dotX}
                        cy={dotY}
                        r={isTarget ? 3.5 : 2}
                        className={isTarget ? 'fill-rose-600 dark:fill-rose-400' : 'fill-gray-300 dark:fill-gray-600'}
                      />
                    </g>
                  );
                })}

                {/* Cardinal Text Labels */}
                {COMPASS_DIAL_POINTS.map((pt) => {
                  const rad = (pt.polarAngle * Math.PI) / 180;
                  const isTarget = pt.key === thasiMaikeiDirection;
                  const textX = 85 + 70 * Math.cos(rad);
                  const textY = 85 + 70 * Math.sin(rad);

                  return (
                    <text
                      key={`lbl-${pt.key}`}
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={isTarget ? "10px" : "8px"}
                      fontWeight={isTarget ? "900" : "700"}
                      className={`select-none pointer-events-none transition-colors ${
                        isTarget
                          ? 'fill-rose-700 dark:fill-rose-400'
                          : 'fill-gray-400 dark:fill-gray-500'
                      }`}
                    >
                      {languageMode === LanguageMode.MEITEI_MAYEK ? pt.labelMayek : pt.labelEn}
                    </text>
                  );
                })}

                {/* Dynamic Rotating Pointer Needle with Symmetrical (0,0) Center Anchoring */}
                <g transform="translate(85, 85)">
                  <motion.g 
                    animate={{ rotate: needleAngle }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 90, 
                      damping: 13,
                      mass: 0.8
                    }}
                    style={{ 
                      transformOrigin: 'center',
                      transformBox: 'fill-box'
                    }}
                  >
                    {/* Symmetrical bounding anchor ensures transform-origin: center is 100% locked to (0,0) */}
                    <circle cx="0" cy="0" r="60" fill="none" opacity="0" pointerEvents="none" />

                    {/* Active / Inauspicious Needle (Crimson Red with Specular Facet) */}
                    <polygon
                      points="0,-57 -3.5,0 0,-2"
                      className="fill-rose-700 dark:fill-rose-500 filter drop-shadow(0 2px 4px rgba(190,18,60,0.35))"
                    />
                    <polygon
                      points="0,-57 3.5,0 0,-2"
                      className="fill-rose-500 dark:fill-rose-400"
                    />
                    
                    {/* Counterweight (Slate Dark with Specular Facet) */}
                    <polygon
                      points="0,27 -3.5,0 0,2"
                      className="fill-slate-600 dark:fill-slate-600"
                    />
                    <polygon
                      points="0,27 3.5,0 0,2"
                      className="fill-slate-400 dark:fill-slate-500"
                    />

                    {/* Center Brass Compass Jewel */}
                    <circle
                      cx="0"
                      cy="0"
                      r="5.5"
                      className="fill-amber-400 stroke-amber-600 stroke-1 shadow-sm"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="2.5"
                      className="fill-white"
                    />
                  </motion.g>
                </g>
              </svg>
            </div>

            {/* Direction Readout */}
            <div className="text-center flex flex-col items-center">
              <span className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                {thasiMaikeiNative} · {thasiMaikeiEn}
              </span>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                {languageMode === LanguageMode.BENGALI 
                  ? 'এই মাসে এই দিকে ভ্রমণ বর্জনীয়' 
                  : languageMode === LanguageMode.MEITEI_MAYEK 
                    ? 'ꯊꯥꯁꯤꯗ ꯃꯥꯏꯀꯩ ꯑꯁꯤꯗ ꯈꯣꯡꯆꯠ ꯆꯠꯂꯣꯏꯗꯕ' 
                    : 'Forbidden journey direction this lunar month'}
              </p>
            </div>
          </div>

          {/* Card 2: Tatnaba Guidelines */}
          <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-3 lg:p-3.5 shadow-sm flex flex-col justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {languageMode === LanguageMode.BENGALI ? 'তৎনবা দিন' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯈꯣꯡꯆꯠ ꯇꯠꯅꯕ' : 'Tatnaba Guidelines'}
                </span>
                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">
                  {languageMode === LanguageMode.BENGALI ? 'যাত্রা নিষেধ' : 'Prohibited Weekdays'}
                </span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
              {tatnabaDays.length > 0 ? (
                tatnabaDays.map((dayKey) => {
                  const translatedDay = Translator.translateWeekday(dayKey, languageMode, translations);
                  return (
                    <span
                      key={`tatnaba-pill-${dayKey}`}
                      className="px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold text-xs flex items-center gap-1.5"
                    >
                      <span>⚡</span>
                      <span>{translatedDay}</span>
                      {languageMode === LanguageMode.ENGLISH && (
                        <span className="text-[10px] opacity-75 font-normal">
                          ({Translator.translateWeekday(dayKey, LanguageMode.MEITEI_MAYEK, translations)})
                        </span>
                      )}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {languageMode === LanguageMode.BENGALI ? 'এই মাসে নেই' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯊꯥꯁꯤꯗ ꯂꯩꯇꯦ' : 'None designated this month'}
                </span>
              )}
            </div>

            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              {languageMode === LanguageMode.BENGALI 
                ? 'চিহ্নিত বারে দূরপাল্লার যাত্রা বা শুভ আরম্ভ পরিহার করুন।' 
                : languageMode === LanguageMode.MEITEI_MAYEK 
                  ? 'ꯅꯨꯃꯤꯠ ꯑꯁꯤꯗ ꯂꯝꯕꯤ-ꯈꯣꯡꯆꯠ ꯑꯃꯁꯨꯡ ꯊꯕꯛ ꯑꯆꯧꯕ ꯍꯧꯗꯕ ꯐꯩ꯫' 
                  : 'Avoid commencing long journeys or major ventures on designated Tatnaba weekdays.'}
            </p>
          </div>

          {/* Card 3: Month Festivals & Sacred Agenda (Scrollable) */}
          <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-3.5 lg:p-4 shadow-sm flex flex-col flex-1 min-h-0 justify-between">
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-rose-500/10 dark:bg-rose-400/15 border border-rose-500/20 flex items-center justify-center text-rose-800 dark:text-rose-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {languageMode === LanguageMode.BENGALI ? 'এই মাসের উৎসব' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯊꯥꯁꯤꯒꯤ ꯀꯨꯝꯍꯩꯁꯤꯡ' : 'Month Festivals'}
                </span>
              </div>

              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {monthlyFestivals.length} {languageMode === LanguageMode.BENGALI ? 'টি' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯃꯨꯛ' : 'Events'}
              </span>
            </div>

            {/* Scrollable Event List */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1.5 mt-2 scrollbar-thin">
              {monthlyFestivals.length > 0 ? (
                monthlyFestivals.map((fest, idx) => {
                  const lunarText = fest.lunarDays.map((d) => Translator.translateDigits(d.toString(), languageMode, translations)).join('/') + ' ' + Translator.translateMonth(fest.lunarMonth, languageMode, translations);
                  return (
                    <div
                      key={`fest-item-${fest.dateStr}-${idx}`}
                      onClick={() => onNavigateToDetail(fest.dateStr)}
                      className="p-2 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-rose-50/60 dark:hover:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-700/60 transition-all cursor-pointer flex items-center justify-between gap-2.5"
                    >
                      {/* Left Date Chip */}
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                        <span className="text-xs font-black text-rose-800 dark:text-rose-400 leading-none">
                          {fest.dayNumber}
                        </span>
                        <span className="text-[7.5px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-none mt-0.5">
                          {fest.gregorianFormatted.split(' ')[0]}
                        </span>
                      </div>

                      {/* Festival Name & Lunar Date */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-black text-gray-900 dark:text-white truncate leading-tight">
                          {fest.name}
                        </span>
                        <span className="text-[9.5px] font-semibold text-rose-800/80 dark:text-rose-400/80 truncate">
                          {lunarText}
                        </span>
                      </div>

                      {/* Category Tag */}
                      <div className="shrink-0 flex items-center gap-1">
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          fest.isHoliday
                            ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
                            : fest.category === 'memorial'
                              ? 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20'
                              : fest.category === 'commemoration'
                                ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20'
                                : fest.category === 'ritual'
                                  ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                          {fest.isHoliday 
                            ? 'Holiday' 
                            : fest.category === 'memorial' 
                              ? 'Memorial' 
                              : fest.category === 'commemoration' 
                                ? 'Obs' 
                                : fest.category === 'ritual' 
                                  ? 'Ritual' 
                                  : 'Fest'}
                        </span>
                        <ChevronRightSmall className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center p-4 text-center">
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    No festivals or observances this month
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEW (< 768px): 100% Preserved Touch Swipe Layout (UNTOUCHED)
          ========================================================================= */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="md:hidden flex flex-col gap-4 pb-24 touch-pan-y"
      >
        {/* Calendar Header */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {gregorianMonthName} {currentYear}
            </h2>
            <p className="text-xs font-bold text-rose-800 dark:text-rose-400 mt-0.5">
              {activeMonthsSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onOpenSearch}
              className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={onOpenSettings}
              className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Month Navigation Row */}
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900 p-2 flex items-center justify-between gap-4">
          <button
            onClick={onPrevMonth}
            className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            disabled={isMinMonth}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={onJumpToToday}
            className="px-4 py-2 bg-rose-800 dark:bg-rose-700 hover:bg-rose-900 dark:hover:bg-rose-800 active:scale-95 text-white text-xs font-bold rounded-full transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Today</span>
          </button>

          <button
            onClick={onNextMonth}
            className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            disabled={isMaxMonth}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Grid of Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 bg-gray-100/50 dark:bg-gray-800/30 p-2 rounded-xl border border-gray-100 dark:border-gray-800/40 text-center">
          {weekdaysKeys.map((key) => {
            const isSun = key === 'SUNDAY';
            const label = Translator.translateWeekdayShort(key, languageMode, translations);
            return (
              <span
                key={key}
                className={`text-[10px] font-black tracking-widest ${
                  isSun ? 'text-red-600 dark:text-red-500' : 'text-rose-800 dark:text-rose-400'
                }`}
              >
                {label}
              </span>
            );
          })}
        </div>

        {/* Core Days Grid with Smooth Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentYear}-${currentMonth}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-7 gap-1.5 md:gap-2"
          >
            {mobileGridCells.map((cell, idx) => {
              if (cell.type === 'empty') {
                return (
                  <div key={`empty-${idx}`} className="aspect-[1/1.5] w-full" />
                );
              }

              const { dayNumber, dateStr, dayData, isToday, isSunday } = cell;

              if (!dayData) {
                return (
                  <div
                    key={`day-fallback-${dayNumber}`}
                    onClick={() => onNavigateToDetail(dateStr)}
                    className={`aspect-[1/1.5] w-full rounded-2xl p-2 flex flex-col justify-start border border-gray-100 dark:border-gray-800 cursor-pointer ${
                      isSunday ? 'bg-red-500/5' : 'bg-white dark:bg-gray-900'
                    }`}
                  >
                    <span className={`text-sm font-extrabold ${isSunday ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                      {dayNumber}
                    </span>
                  </div>
                );
              }

              const matchedFestivals = dayData.festivals 
                ? (dayData.festivals.map((id) => eventsList.find((e) => e.id === id)).filter(Boolean) as Event[]) 
                : [];
              const matchedEvents = dayData.events 
                ? (dayData.events.map((id) => eventsList.find((e) => e.id === id)).filter(Boolean) as Event[]) 
                : [];
              const containsHoliday = matchedFestivals.some((f) => f.isHoliday) || matchedEvents.some((e) => e.isHoliday);

              let topFestivalName = '';
              if (matchedFestivals.length > 0) {
                topFestivalName = matchedFestivals[0].name;
              } else {
                const holEvent = matchedEvents.find((e) => e.isHoliday);
                if (holEvent) {
                  topFestivalName = holEvent.name;
                } else if (matchedEvents.length > 0) {
                  topFestivalName = matchedEvents[0].name;
                }
              }

              const isObservance = dayData.observance === 'purnima' || dayData.observance === 'thasi' || dayData.observance === 'ekadasi';

              let cardBgClass = 'bg-white dark:bg-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-800/50';
              let cardBorderClass = 'border-gray-100 dark:border-gray-800/80';
              let numberColorClass = 'text-gray-900 dark:text-white';

              if (isToday) {
                cardBgClass = 'bg-rose-100/80 dark:bg-rose-950/20';
                cardBorderClass = 'border-rose-800 dark:border-rose-600 border-2';
                numberColorClass = 'text-rose-900 dark:text-rose-200';
              } else if (containsHoliday || isSunday) {
                cardBgClass = 'bg-red-500/5';
                cardBorderClass = 'border-red-100 dark:border-red-900/30';
                numberColorClass = 'text-red-600 dark:text-red-500';
              } else if (isObservance) {
                cardBgClass = 'bg-gray-50 dark:bg-gray-800/40';
                cardBorderClass = 'border-rose-800/20 dark:border-rose-400/20';
                numberColorClass = 'text-gray-900 dark:text-white';
              }

              const bottomMonthLabel = Translator.translateMonth(dayData.month, languageMode, translations);
              const bottomDayLabel = dayData.day.map((d) => Translator.translateDigits(d.toString(), languageMode, translations)).join('/');

              return (
                <div
                  key={`day-${dayNumber}`}
                  onClick={() => onNavigateToDetail(dateStr)}
                  className={`aspect-[1/1.5] w-full rounded-2xl border p-1 md:p-1.5 flex flex-col justify-between cursor-pointer transition-all active:scale-95 select-none ${cardBgClass} ${cardBorderClass}`}
                >
                  {/* 1. Top Slot: Top Festival label */}
                  <div className="h-4 flex items-center justify-center overflow-hidden">
                    {topFestivalName && (
                      <span className={`text-[7px] md:text-[8px] font-black uppercase text-center leading-none truncate px-1 rounded-sm w-full block ${
                        containsHoliday 
                          ? 'text-red-600 dark:text-red-400 bg-red-500/10' 
                          : 'text-rose-800 dark:text-rose-400 bg-rose-500/5'
                      }`}>
                        {topFestivalName}
                      </span>
                    )}
                  </div>

                  {/* 2. Middle Slot: Gregorian Day Number or Observance Moon Icon */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
                    {isObservance ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <MoonGraphic
                          phase={dayData.observance!}
                          moonPhase={dayData.moonPhase}
                          size={16}
                        />
                        <span className="text-[6.5px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-widest scale-90">
                          {dayData.observance}
                        </span>
                      </div>
                    ) : (
                      <span className={`text-base font-black ${numberColorClass}`}>
                        {dayNumber}
                      </span>
                    )}
                  </div>

                  {/* 3. Bottom Slot: Meitei Lunar Day Details */}
                  <div className="flex flex-col text-center overflow-hidden gap-0.5">
                    <span className="text-[8px] font-bold text-gray-500 dark:text-gray-400 leading-none truncate">
                      {bottomMonthLabel}
                    </span>
                    <span className="text-[9px] font-extrabold text-rose-800 dark:text-rose-400 leading-none truncate">
                      {bottomDayLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
