import React, { useState, useEffect } from 'react';
import { CalendarDay, Event, LanguageMode, MonthConfig, Translations } from '../types';
import { Translator } from '../utils/translator';
import { CalendarRepository } from '../utils/calendarData';
import { MoonGraphic } from './MoonGraphic';
import { ArrowLeft, Calendar, Info, MapPin, AlertTriangle, Star, BookOpen, ChevronRight, ExternalLink } from 'lucide-react';

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

  const formattedGregorian = React.useMemo(() => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }, [dateStr]);

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 z-50 flex flex-col md:max-w-2xl md:mx-auto md:border-x md:border-gray-100 md:dark:border-gray-800 shadow-2xl">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 pb-4 pt-safe border-b border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-950">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-black text-gray-900 dark:text-white">Date Details</h2>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
          <div className="w-8 h-8 border-4 border-rose-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-bold">Loading date configurations...</p>
        </div>
      ) : !dayDetail ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
          <Calendar className="w-12 h-12 text-rose-800" />
          <h4 className="text-base font-black text-gray-950 dark:text-white">Date Details Unavailable</h4>
          <p className="text-xs text-gray-500 max-w-xs">
            There is no lunar data available for the requested date {dateStr}.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 pb-16">
          {/* Gregorian Date Header Card */}
          <div className="rounded-3xl bg-rose-50 dark:bg-rose-950/15 p-5 border border-rose-100/50 dark:border-rose-950/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-800 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-800/60 dark:text-rose-400">
                Gregorian Date
              </span>
              <h4 className="text-md font-extrabold text-rose-950 dark:text-rose-200">
                {formattedGregorian}
              </h4>
            </div>
          </div>

          {/* Manipuri Date Card */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-4 flex flex-col gap-3 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">
              Manipuri Date Details
            </span>

            <div className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/40 p-2.5 rounded-xl border border-gray-100/50 dark:border-gray-800/30">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                  Manipuri Month
                </span>
                <span className="text-base font-black text-gray-900 dark:text-white mt-0.5 capitalize leading-none">
                  {dayDetail.month.toLowerCase()}
                </span>
                {languageMode !== LanguageMode.ENGLISH && (
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-400 mt-0.5">
                    {Translator.translateMonth(dayDetail.month, languageMode, translations)}
                  </span>
                )}
              </div>

              <div className="flex flex-col text-right">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                  Lunar Day (Day)
                </span>
                <span className="text-base font-black text-gray-900 dark:text-white mt-0.5 leading-none">
                  {dayDetail.day.join(' & ')}
                </span>
                {languageMode !== LanguageMode.ENGLISH && (
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-400 mt-0.5">
                    {dayDetail.day.map((d) => Translator.translateDigits(d.toString(), languageMode, translations)).join(' & ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Moon Observance Details Card */}
          {dayDetail.observance && (
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-6 flex items-start gap-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-850 flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-gray-800/40">
                <MoonGraphic
                  phase={dayDetail.observance}
                  moonPhase={dayDetail.moonPhase}
                  size={42}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-800 dark:text-rose-400">
                  Special Observance
                </span>
                <h5 className="text-base font-extrabold text-gray-950 dark:text-white capitalize">
                  {dayDetail.observance} {dayDetail.moonPhase && `(${dayDetail.moonPhase.toLowerCase()})`}
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed mt-1">
                  {dayDetail.observance.toLowerCase() === 'purnima' && 'Purnima represents the traditional full moon day. It represents illumination, abundance, and is widely observed as a holy day of ritual fasting and temple prayers.'}
                  {dayDetail.observance.toLowerCase() === 'thasi' && 'Thasi marks the traditional new moon / dark moon day (Amavasya). It is the final dark phase of the lunar calendar cycle, signaling transition and reflection.'}
                  {dayDetail.observance.toLowerCase() === 'ekadasi' && 'Ekadasi is the highly auspicious eleventh lunar day of the cycle. Devout traditional observers engage in special prayers, vegetarianism, and fasting.'}
                </p>
              </div>
            </div>
          )}

          {/* Festivals & Events details card */}
          {dayDetail.festivals && dayDetail.festivals.length > 0 && (
            <div className="rounded-3xl border border-red-500/10 bg-red-500/5 p-6 flex flex-col gap-4">
              <span className="text-xs font-black uppercase tracking-wider text-red-650 dark:text-red-400">
                Festivals &amp; Events
              </span>

              <div className="flex flex-col gap-4">
                {dayDetail.festivals.map((festId) => {
                  const ev = eventsList.find((e) => e.id === festId);
                  if (!ev) return null;
                  return (
                    <div key={festId} className="flex flex-col gap-1 border-b border-red-500/10 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between gap-4">
                        <h5 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug">
                          {ev.name}
                        </h5>
                        <span className={`flex-shrink-0 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                          ev.isHoliday 
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                            : 'bg-rose-500/10 text-rose-800 dark:text-rose-400'
                        }`}>
                          {ev.isHoliday ? 'Holiday' : 'Festival'}
                        </span>
                      </div>
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-0.5 block">
                        Category: {ev.category.replace('_', ' ')}
                      </span>
                      {ev.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
                          {ev.description}
                        </p>
                      )}
                      
                      {ev.blogUrl && (
                        <a
                          href={ev.blogUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-rose-800 dark:text-rose-400 hover:text-rose-950 dark:hover:text-rose-200 mt-2 flex items-center gap-1.5 transition-colors self-start"
                        >
                          <span>Read more on blog</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* General Events Card */}
          {dayDetail.events && dayDetail.events.length > 0 && (
            <div className="rounded-3xl border border-rose-800/10 bg-rose-500/5 p-6 flex flex-col gap-4">
              <span className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-400">
                Observances &amp; Holidays
              </span>

              <div className="flex flex-col gap-4">
                {dayDetail.events.map((evId) => {
                  const ev = eventsList.find((e) => e.id === evId);
                  if (!ev) return null;
                  return (
                    <div key={evId} className="flex flex-col gap-1 border-b border-rose-500/10 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between gap-4">
                        <h5 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug">
                          {ev.name}
                        </h5>
                        <span className={`flex-shrink-0 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                          ev.isHoliday 
                            ? 'bg-rose-500/15 text-rose-800 dark:text-rose-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {ev.isHoliday ? 'General Holiday' : ev.category.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-0.5 block">
                        Category: {ev.category.replace('_', ' ')}
                      </span>
                      {ev.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
                          {ev.description}
                        </p>
                      )}
                      
                      {ev.blogUrl && (
                        <a
                          href={ev.blogUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-rose-800 dark:text-rose-400 hover:text-rose-950 dark:hover:text-rose-200 mt-2 flex items-center gap-1.5 transition-colors self-start"
                        >
                          <span>Read more on blog</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month Traditional Rules guidelines */}
          {monthConfig && (
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-6 flex flex-col gap-5 shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-rose-800 dark:text-rose-400">
                Traditional Month Rules
              </span>

              {/* Thasi Maikei Direction */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-800 dark:text-rose-400 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
                    Thasi Maikei Direction
                  </span>
                  <span className="text-sm font-black text-rose-800 dark:text-rose-400 uppercase tracking-wide">
                    {Translator.translateDirection(monthConfig.thasiMaikei, languageMode, translations)}
                  </span>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-850" />

              {/* Tatnaba Days */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-extrabold text-gray-800 dark:text-gray-200 block">
                    Tatnaba (Inauspicious Days)
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 leading-snug mt-1 block">
                     ceremonal and travel activities are traditionally avoided on these weekdays inside {dayDetail.month.toLowerCase()}:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {monthConfig.tatnaba.map((dayName) => (
                      <span
                        key={dayName}
                        className="px-3 py-1 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider"
                      >
                        {Translator.translateWeekday(dayName, languageMode, translations)}
                      </span>
                    ))}
                    {monthConfig.tatnaba.length === 0 && (
                      <span className="text-xs font-bold text-gray-400">None designated this month</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
