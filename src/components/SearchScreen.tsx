import React, { useState, useEffect } from 'react';
import { CalendarDay, Event, LanguageMode, Translations } from '../types';
import { Translator } from '../utils/translator';
import { CalendarRepository } from '../utils/calendarData';
import { MoonGraphic } from './MoonGraphic';
import { ArrowLeft, Search, X, Calendar, Star } from 'lucide-react';

interface SearchScreenProps {
  languageMode: LanguageMode;
  translations: Translations | null;
  eventsList: Event[];
  onNavigateToDetail: (dateStr: string) => void;
  onClose: () => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  languageMode,
  translations,
  eventsList,
  onNavigateToDetail,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CalendarDay[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const trimmed = searchQuery.trim();
      if (!trimmed) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const repo = CalendarRepository.getInstance();
        const results = await repo.searchDays(trimmed);
        setSearchResults(results);
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

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
        <h2 className="text-lg font-black text-gray-900 dark:text-white">Search Calendar</h2>
      </div>

      {/* Input query field */}
      <div className="p-4 bg-white dark:bg-gray-950 flex flex-col gap-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dates, festivals, or holidays..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-950 focus:border-rose-800 dark:focus:border-rose-600 focus:outline-none transition-all text-sm font-medium text-gray-900 dark:text-white"
            autoFocus
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {!searchQuery.trim() ? (
          /* Empty Search Suggestions */
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <Search className="w-14 h-14 text-rose-800/20 dark:text-rose-400/20 mb-4" />
            <h4 className="text-md font-extrabold text-gray-950 dark:text-white mb-2">
              Find Holidays &amp; Traditional Dates
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mb-6">
              Search by English names, Meitei month names, or custom holiday identifiers.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {['Cheiraoba', 'Purnima', 'Republic Day', 'Phairen', 'Yaoshang', '2026-03'].map((kw) => (
                <button
                  key={kw}
                  onClick={() => setSearchQuery(kw)}
                  className="px-3.5 py-1.5 rounded-full border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:bg-rose-500/5 hover:border-rose-800/30 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        ) : searching ? (
          /* Loader */
          <div className="flex justify-center items-center py-20">
            <div className="w-7 h-7 border-3 border-rose-800 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : searchResults.length === 0 ? (
          /* Empty Matches State */
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <h4 className="text-md font-extrabold text-gray-500 dark:text-gray-400 mb-2">
              No results found for "{searchQuery}"
            </h4>
            <p className="text-xs text-gray-400">
              Try double checking your spellings or search keywords.
            </p>
          </div>
        ) : (
          /* Results Scrollable List */
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 mt-1 block">
              Matching Days ({searchResults.length})
            </span>

            {searchResults.map((dayData) => {
              // Extract matching events & holidays
              const matchedFestivals = (dayData.festivals || [])
                .map((id) => eventsList.find((e) => e.id === id))
                .filter(Boolean) as Event[];

              const matchedEvents = (dayData.events || [])
                .map((id) => eventsList.find((e) => e.id === id))
                .filter(Boolean) as Event[];

              const hasHoliday = matchedFestivals.some((f) => f.isHoliday) || matchedEvents.some((e) => e.isHoliday);

              const formattedDate = new Date(dayData.gregorian).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={dayData.gregorian}
                  onClick={() => onNavigateToDetail(dayData.gregorian)}
                  className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center gap-4 hover:border-rose-800/30 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
                >
                  {/* Left Graphic Icon */}
                  <div className="flex-shrink-0">
                    {dayData.observance ? (
                      <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl flex items-center justify-center border border-gray-100/30 dark:border-gray-800/30">
                        <MoonGraphic
                          phase={dayData.observance}
                          moonPhase={dayData.moonPhase}
                          size={28}
                        />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border font-black text-sm ${
                        hasHoliday 
                          ? 'bg-red-500/5 border-red-200/50 dark:border-red-950/30 text-red-600 dark:text-red-400' 
                          : 'bg-rose-500/5 border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200'
                      }`}>
                        <span>{dayData.gregorian.split('-')[2]}</span>
                      </div>
                    )}
                  </div>

                  {/* Middle Info Column */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <h5 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug truncate">
                      {Translator.translateMonth(dayData.month, languageMode, translations)}, Day {dayData.day.map((d) => Translator.translateDigits(d.toString(), languageMode, translations)).join('/')}
                    </h5>
                    <span className="text-[10px] text-gray-400 font-medium tracking-tight flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formattedDate}
                    </span>

                    {/* Associated occasion chips */}
                    {(matchedFestivals.length > 0 || matchedEvents.length > 0) && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {matchedFestivals.map((fest) => (
                          <span
                            key={fest.id}
                            className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                              fest.isHoliday 
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                                : 'bg-rose-500/5 text-rose-800 dark:text-rose-400'
                            }`}
                          >
                            {fest.name}
                          </span>
                        ))}
                        {matchedEvents.map((ev) => (
                          <span
                            key={ev.id}
                            className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                              ev.isHoliday 
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {ev.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
