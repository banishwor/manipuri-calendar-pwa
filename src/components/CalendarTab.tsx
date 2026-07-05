import React, { useMemo, useRef } from 'react';
import { CalendarDay, Event, LanguageMode, Translations } from '../types';
import { Translator } from '../utils/translator';
import { MoonGraphic } from './MoonGraphic';
import { ChevronLeft, ChevronRight, Search, Settings, Star } from 'lucide-react';
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
}

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
  onJumpToToday
}) => {
  const today = new Date();
  
  // Touch swipe gesture handlers for month navigation
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

    // Only process swipe if horizontal movement is larger than vertical movement
    if (Math.abs(diffX) > Math.abs(diffY)) {
      const minSwipeDistance = 50; // Minimum distance in px to register a swipe
      if (Math.abs(diffX) > minSwipeDistance) {
        if (diffX > 0) {
          // Swipe right -> Previous Month
          onPrevMonth();
        } else {
          // Swipe left -> Next Month
          onNextMonth();
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };
  
  // Format Gregorian month name: "January 2026"
  const localDate = new Date(currentYear, currentMonth - 1, 1);
  const gregorianMonthName = localDate.toLocaleString('en-US', { month: 'long' });

  // Get active lunar months in current grid
  const activeLunarMonths = useMemo(() => {
    const list = daysOfMonth.map((d) => d.month);
    return Array.from(new Set(list));
  }, [daysOfMonth]);

  const activeMonthsSubtitle = useMemo(() => {
    if (activeLunarMonths.length === 0) return '';
    return activeLunarMonths
      .map((m) => Translator.translateMonth(m, languageMode, translations))
      .join(' / ');
  }, [activeLunarMonths, languageMode, translations]);

  // Calculations for grid rendering:
  // Sunday = 0, Monday = 1 ... Saturday = 6
  const startDayOfWeek = useMemo(() => {
    return localDate.getDay();
  }, [localDate]);

  const lengthOfMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 0).getDate();
  }, [currentYear, currentMonth]);

  // Construct standard week headers
  const weekdaysKeys = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  // Days list to fill the 35 or 42 grid cells, wrapped to 5 rows (35 cells max) if there's an overflow (6 rows).
  const gridCells = useMemo(() => {
    const cells: ({ type: 'empty' } | { type: 'day'; dayNumber: number; dateStr: string; dayData: CalendarDay | null; isToday: boolean; isSunday: boolean })[] = [];
    
    // Add empty slots before first day of month
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push({ type: 'empty' });
    }

    // Add days of the month
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

    // In case of a 6-row calendar layout (total grid cells > 35),
    // fold/merge the 6th row (indices 35 to 41) into the 1st row (indices 0 to 6).
    // This allows the entire calendar page to fit cleanly in 5 rows without scrolling.
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

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col gap-4 pb-24 touch-pan-y"
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
          disabled={currentYear === 2026 && currentMonth === 1}
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
          disabled={currentYear === 2027 && currentMonth === 12}
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
          {gridCells.map((cell, idx) => {
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

            // Check if day matches any Government Holidays or Festivals (for coloring/badges)
            let containsHoliday = false;
            let topFestivalName = '';

            if (dayData.festivals && dayData.festivals.length > 0) {
              const matches = dayData.festivals.map((id) => eventsList.find((e) => e.id === id)).filter(Boolean) as Event[];
              const hol = matches.find((m) => m.isHoliday);
              if (hol) {
                containsHoliday = true;
              }
              const topFest = matches[0];
              if (topFest) {
                topFestivalName = topFest.name;
              }
            }

            const isObservance = dayData.observance === 'purnima' || dayData.observance === 'thasi' || dayData.observance === 'ekadasi';

            // Establish color scheme categories
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

            // Month Label Bottom e.g., "Sajibu 1"
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
  );
};
