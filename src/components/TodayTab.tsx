import React from 'react';
import { CalendarDay, Event, LanguageMode, MonthConfig, Translations } from '../types';
import { Translator } from '../utils/translator';
import { MoonGraphic } from './MoonGraphic';
import { CalendarRange, Info, MapPin, Search, Settings, Star, AlertTriangle, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';

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
  
  // Format Gregorian date nicely: "Sunday, July 05, 2026"
  const formattedGregorian = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate greeting depending on current local time
  const currentHour = today.getHours();
  const meiteiGreeting = currentHour < 12 
    ? "ꯃꯪꯉꯥꯡ ꯄꯨꯟꯁꯤꯕ" // Good morning representation
    : currentHour < 17 
      ? "ꯂꯨꯋꯥꯡ ꯄꯨꯟꯁꯤꯕ" // Good afternoon representation
      : "ꯈꯨꯃꯥꯟ ꯄꯨꯟꯁꯤꯕ"; // Good evening representation

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Dynamic Header Toolbar */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Today's Date</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Manipuri Traditional Lunar Calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenSearch}
            className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Search traditional days and holidays"
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

      {/* Greeting Banner */}
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-black text-rose-800 dark:text-rose-400 tracking-wide">
          Khurumjari / ꯈꯨꯔꯨꯝꯖꯔꯤ
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Greeting of peace and longevity • {meiteiGreeting}
        </p>
      </div>

      {/* Gregorian Banner Block with soft gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-800 to-rose-950 p-6 text-white shadow-xl dark:shadow-rose-950/20">
        <div className="relative z-10 flex flex-col items-center text-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-200/80">
            Gregorian Date
          </span>
          <h4 className="text-xl font-bold md:text-2xl tracking-tight text-white">
            {formattedGregorian}
          </h4>
        </div>
        {/* Background glow graphics */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
      </div>

      {!todayDay ? (
        <div className="flex flex-col items-center justify-center p-8 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-3xl text-center gap-4">
          <CalendarIcon className="w-12 h-12 text-amber-600 dark:text-amber-500" />
          <div className="flex flex-col gap-1">
            <h5 className="font-bold text-gray-900 dark:text-white">Active Calendar Check</h5>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm">
              Today's date falls outside the pre-loaded calendar data. Please browse the full calendar view to view traditional days and events.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Manipuri Lunar Date Card */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-4 shadow-sm flex flex-col gap-3">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">
                Manipuri Lunar Date
              </span>
            </div>

            {/* Split row for traditional Month and Day */}
            <div className="grid grid-cols-2 gap-2 bg-gray-50/50 dark:bg-gray-800/20 p-2.5 rounded-xl border border-gray-100/50 dark:border-gray-800/50 text-center relative items-center">
              {/* Left pane: Month */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                  Month
                </span>
                <span className="text-base font-black text-gray-900 dark:text-white tracking-tight mt-0.5">
                  {todayDay.month}
                </span>
                {languageMode !== LanguageMode.ENGLISH && (
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-400 mt-0.5">
                    {Translator.translateMonth(todayDay.month, languageMode, translations)}
                  </span>
                )}
              </div>

              {/* Vertical divider */}
              <div className="absolute left-1/2 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800 -translate-x-1/2" />

              {/* Right pane: Day */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                  Day (Thasi)
                </span>
                <span className="text-base font-black text-gray-900 dark:text-white tracking-tight mt-0.5">
                  {todayDay.day.join(' & ')}
                </span>
                {languageMode !== LanguageMode.ENGLISH && (
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-400 mt-0.5">
                    {todayDay.day.map((d) => Translator.translateDigits(d.toString(), languageMode, translations)).join(' & ')}
                  </span>
                )}
              </div>
            </div>

            {/* Astronomical Moon Phase Banner */}
            {todayDay.observance && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/10 p-2 flex items-center gap-3">
                <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
                  <MoonGraphic
                    phase={todayDay.observance}
                    moonPhase={todayDay.moonPhase}
                    size={28}
                  />
                </div>
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500 block leading-none">
                    ASTRONOMICAL PHASE
                  </span>
                  <h5 className="text-xs font-bold text-amber-900 dark:text-amber-400 capitalize mt-0.5 leading-none">
                    {todayDay.observance} {todayDay.moonPhase && `(${todayDay.moonPhase})`}
                  </h5>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Festivals Slider */}
          {upcomingFestivals.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">
                  Upcoming Festivals Countdown
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  {upcomingFestivals.length} events loaded
                </span>
              </div>

              {/* Horizontal sliding area */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                {upcomingFestivals.map((item, idx) => {
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
                    : 'bg-rose-800 text-white dark:bg-rose-400 dark:text-rose-950';

                  return (
                    <div
                      key={`${item.date}-${idx}`}
                      onClick={() => onNavigateToDetail(item.date)}
                      className="flex-shrink-0 w-64 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:border-rose-300 dark:hover:border-rose-900/50 cursor-pointer transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg tracking-wider ${badgeStyle}`}>
                            {daysText}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {hasHoliday ? 'Public Holiday' : 'Festival'}
                          </span>
                        </div>

                        <h6 className="font-extrabold text-gray-900 dark:text-white leading-tight line-clamp-2 h-10">
                          {firstFest.name}
                        </h6>
                      </div>

                      <div className="flex flex-col gap-1 border-t border-gray-100/50 dark:border-gray-800/50 pt-3">
                        {/* Gregorian date info */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        {/* Meitei lunar month & day */}
                        <div className="flex items-center gap-1.5 text-xs text-rose-800 dark:text-rose-400 font-bold mt-1">
                          <Star className="w-3.5 h-3.5" />
                          <span>
                            {Translator.translateMonth(item.dayData.month, languageMode, translations)} - {item.dayData.day.map((d) => Translator.translateDigits(d.toString(), languageMode, translations)).join(' & ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Today's Festivals and Occasions List */}
          {todayDay.festivals && todayDay.festivals.length > 0 && (
            <div className="rounded-3xl border border-amber-500/15 bg-amber-500/5 p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-600 dark:text-amber-500 fill-current" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-500">
                  Today's Occasions & Festivals
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {todayDay.festivals.map((festId) => {
                  const ev = eventsList.find((e) => e.id === festId);
                  if (!ev) return null;
                  return (
                    <div
                      key={festId}
                      className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-amber-100 dark:border-amber-950/20 shadow-sm flex items-center justify-between gap-4"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold text-gray-900 dark:text-white leading-tight">
                          {ev.name}
                        </span>
                        {ev.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {ev.description}
                          </p>
                        )}
                      </div>
                      <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        ev.isHoliday 
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400' 
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/10 dark:text-rose-400/80'
                      }`}>
                        {ev.isHoliday ? 'Govt Holiday' : 'Festival'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* General Events and Observances List */}
          {todayDay.events && todayDay.events.length > 0 && (
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400">
                <Info className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Today's Observances & Events
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {todayDay.events.map((evId) => {
                  const ev = eventsList.find((e) => e.id === evId);
                  if (!ev) return null;
                  return (
                    <div
                      key={evId}
                      className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-extrabold text-gray-900 dark:text-white leading-tight">
                          {ev.name}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                          ev.isHoliday 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {ev.isHoliday ? 'General Holiday' : ev.category.replace('_', ' ')}
                        </span>
                      </div>
                      {ev.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month Traditional Rules */}
          {todayMonthConfig && (
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 p-6 flex flex-col gap-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-800 dark:text-rose-400">
                {todayDay.month} Month Guidelines
              </span>

              {/* Thasi Maikei Direction */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-800 dark:text-rose-400 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thasi Maikei Direction</h5>
                  <p className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
                    {Translator.translateDirection(todayMonthConfig.thasiMaikei, languageMode, translations)}
                  </p>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Tatnaba Days */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tatnaba (Inauspicious Days)</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                     ceremonially avoided weekdays:
                  </p>
                  <p className="text-sm font-black text-red-600 dark:text-red-400 mt-1">
                    {todayMonthConfig.tatnaba.length > 0 
                      ? todayMonthConfig.tatnaba.map((dayName) => Translator.translateWeekday(dayName, languageMode, translations)).join(', ') 
                      : 'None designated this month'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
