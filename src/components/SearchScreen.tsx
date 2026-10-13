import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CalendarDay, Event, LanguageMode, Translations } from '../types';
import { Translator } from '../utils/translator';
import { CalendarRepository } from '../utils/calendarData';
import { MoonGraphic } from './MoonGraphic';
import { 
  Search, 
  X, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  Sparkles,
  Flame,
  Moon,
  Clock,
  CornerDownLeft,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';

interface SearchScreenProps {
  languageMode: LanguageMode;
  translations: Translations | null;
  eventsList: Event[];
  onNavigateToDetail: (dateStr: string) => void;
  onClose: () => void;
}

type FilterCategory = 'all' | 'holiday' | 'memorial' | 'festival' | 'ritual' | 'moon';

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

export const SearchScreen: React.FC<SearchScreenProps> = ({
  languageMode,
  translations,
  eventsList,
  onNavigateToDetail,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchResults, setSearchResults] = useState<CalendarDay[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultItemRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // Lock body scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Quick category options with multi-script translations
  const filterOptions = useMemo(() => [
    { 
      id: 'all' as FilterCategory, 
      label: languageMode === LanguageMode.BENGALI ? 'সব' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯄꯨꯝꯅꯃꯛ' : 'All',
      icon: Sparkles
    },
    { 
      id: 'holiday' as FilterCategory, 
      label: languageMode === LanguageMode.BENGALI ? 'সরকারি ছুটি' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯄꯣꯊꯥ ꯅꯨꯃꯤꯠ' : 'Holidays',
      badgeColor: 'text-red-600 dark:text-red-400 bg-red-500/10'
    },
    { 
      id: 'memorial' as FilterCategory, 
      label: languageMode === LanguageMode.BENGALI ? 'স্মৃতি দিবস' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯅꯤꯡꯁꯤꯡ ꯅꯨꯃꯤꯠ' : 'Memorials',
      badgeColor: 'text-slate-600 dark:text-slate-300 bg-slate-500/10'
    },
    { 
      id: 'festival' as FilterCategory, 
      label: languageMode === LanguageMode.BENGALI ? 'উৎসব' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯀꯨꯝꯍꯩ' : 'Festivals',
      badgeColor: 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
    },
    { 
      id: 'ritual' as FilterCategory, 
      label: languageMode === LanguageMode.BENGALI ? 'অনুষ্ঠান' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯂꯥꯏ ꯊꯧꯔꯝ' : 'Rituals',
      badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
    },
    { 
      id: 'moon' as FilterCategory, 
      label: languageMode === LanguageMode.BENGALI ? 'চাঁদের দশা' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯊꯥ ꯃꯃꯤ' : 'Moon Phases',
      badgeColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10'
    }
  ], [languageMode]);

  // Query and category search execution
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const trimmed = searchQuery.trim();
      const repo = CalendarRepository.getInstance();

      // If both query and category are empty/default
      if (!trimmed && activeFilter === 'all') {
        setSearchResults([]);
        setSelectedIndex(-1);
        return;
      }

      setSearching(true);
      try {
        let baseDays: CalendarDay[] = [];

        if (trimmed) {
          // Perform text search across dates, occasions, and translations
          baseDays = await repo.searchDays(trimmed);
        } else {
          // If query is empty but a category filter is selected, load available years
          const availableYears = repo.getAvailableYears();
          for (const yr of availableYears) {
            const yrDays = await repo.getDaysForYear(yr);
            baseDays.push(...yrDays);
          }
        }

        // Apply active category filter if specified
        if (activeFilter !== 'all') {
          baseDays = baseDays.filter((day) => {
            if (activeFilter === 'moon') {
              return !!(day.observance && (
                day.observance === 'PURNIMA' || 
                day.observance === 'AMAVASYA' || 
                day.observance.includes('MOON')
              ));
            }

            const dayEvents = [...(day.festivals || []), ...(day.events || [])]
              .map((id) => eventsList.find((e) => e.id === id))
              .filter(Boolean) as Event[];

            if (activeFilter === 'holiday') {
              return dayEvents.some((e) => e.isHoliday || e.category === 'holiday' || e.category === 'bank_holiday');
            }
            if (activeFilter === 'memorial') {
              return dayEvents.some((e) => e.category === 'memorial');
            }
            if (activeFilter === 'festival') {
              return dayEvents.some((e) => e.category === 'festival' || e.category === 'celebration');
            }
            if (activeFilter === 'ritual') {
              return dayEvents.some((e) => e.category === 'ritual');
            }
            return true;
          });
        }

        // Deduplicate and sort chronologically
        const uniqueMap = new Map<string, CalendarDay>();
        baseDays.forEach((d) => uniqueMap.set(d.gregorian, d));
        const finalResults = Array.from(uniqueMap.values()).sort((a, b) => a.gregorian.localeCompare(b.gregorian));

        setSearchResults(finalResults);
        setSelectedIndex(finalResults.length > 0 ? 0 : -1);
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setSearching(false);
      }
    }, 180);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, activeFilter, eventsList]);

  // Keyboard navigation for desktop spotlight experience
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev < searchResults.length - 1 ? prev + 1 : 0;
        resultItemRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : searchResults.length - 1;
        resultItemRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        onNavigateToDetail(searchResults[selectedIndex].gregorian);
      }
    }
  };

  // Popular keywords for quick exploration
  const popularKeywords = [
    { label: 'Cheiraoba', value: 'Cheiraoba' },
    { label: 'Yaoshang', value: 'Yaoshang' },
    { label: 'June 18', value: 'June 18' },
    { label: 'May 3', value: 'May 3' },
    { label: 'Puya Meithaba', value: 'Puya Meithaba' },
    { label: 'Ningol Chakkouba', value: 'Ningol Chakkouba' },
    { label: 'Imoinu', value: 'Imoinu' },
    { label: 'Kang', value: 'Kang' },
    { label: 'Purnima', value: 'Purnima' },
    { label: 'Tatnaba', value: 'Tatnaba' },
    { label: 'Sajibu', value: 'Sajibu' },
    { label: 'Republic Day', value: 'Republic Day' }
  ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 sm:backdrop-blur-md flex items-stretch sm:items-center justify-center p-0 sm:p-5 lg:p-6 overflow-hidden sm:overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Responsive Modal: Edge-to-Edge on Mobile, Floating Crystal Dialog on Desktop */}
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        onKeyDown={handleKeyDown}
        className="relative w-full h-full sm:h-auto sm:max-w-xl lg:max-w-2xl xl:max-w-3xl sm:max-h-[88vh] rounded-none sm:rounded-3xl bg-white dark:bg-gray-900 sm:bg-white/95 sm:dark:bg-gray-900/95 sm:backdrop-blur-2xl border-0 sm:border border-white/80 dark:border-white/10 shadow-none sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden my-0 sm:my-auto"
      >
        {/* Header Bar with Mobile Safe Area & Generous Hit Areas */}
        <div className="flex items-center gap-2 sm:gap-3 px-3.5 sm:px-6 pt-safe pb-3 sm:py-4 border-b border-gray-100 dark:border-gray-800/80 bg-white/90 dark:bg-gray-900/90 sm:bg-white/70 sm:dark:bg-gray-900/70 sm:backdrop-blur-md shrink-0">
          
          {/* Mobile Back Button */}
          <button
            onClick={onClose}
            className="sm:hidden w-9 h-9 -ml-1 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 flex items-center justify-center shrink-0 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Desktop Search Icon Pill */}
          <div className="hidden sm:flex w-9 h-9 rounded-2xl bg-rose-500/10 dark:bg-rose-400/15 border border-rose-500/20 items-center justify-center text-rose-800 dark:text-rose-400 shrink-0">
            <Search className="w-4.5 h-4.5" />
          </div>

          {/* Clean Input Field */}
          <div className="flex-1 flex items-center min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                languageMode === LanguageMode.BENGALI 
                  ? 'তারিখ, উৎসব, স্মৃতি দিবস বা ছুটি খুঁজুন...' 
                  : languageMode === LanguageMode.MEITEI_MAYEK 
                  ? 'ꯅꯨꯃꯤꯠ, ꯀꯨꯝꯃꯩ, ꯅꯤꯡꯁꯤꯡ ꯅꯨꯃꯤꯠ ꯊꯤꯕ...' 
                  : 'Search dates, festivals, memorials, or holidays...'
              }
              className="w-full bg-transparent text-base sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Right Action Icons with Accessible Hit Targets */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Desktop ESC hint badge */}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200/80 dark:border-gray-700/80 select-none">
              ESC
            </kbd>

            {/* Desktop Apple-style Circular Close Button */}
            <button
              onClick={onClose}
              className="hidden sm:flex w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 ml-1 shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-gray-100 dark:border-gray-800/60 overflow-x-auto scrollbar-none shrink-0 bg-gray-50/70 dark:bg-gray-950/40">
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt.id;
            const IconComp = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveFilter(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation ${
                  isActive
                    ? 'bg-rose-900 dark:bg-rose-700 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-850 border border-gray-200/70 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {IconComp && <IconComp className="w-3 h-3" />}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3.5 sm:px-5 lg:px-6 py-3 sm:py-5 space-y-2.5 scrollbar-thin pb-safe sm:pb-6">
          {!searchQuery.trim() && activeFilter === 'all' ? (
            /* Empty State & Quick Explore Prompts */
            <div className="flex flex-col items-center justify-center py-8 sm:py-14 text-center px-4 max-w-lg mx-auto">
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-3xl bg-rose-500/10 dark:bg-rose-400/10 border border-rose-500/20 flex items-center justify-center text-rose-800 dark:text-rose-400 mb-3.5 shadow-inner">
                <Search className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>

              <h4 className="text-base sm:text-lg font-black text-gray-950 dark:text-white mb-1.5">
                {languageMode === LanguageMode.BENGALI 
                  ? 'ছুটির দিন, স্মৃতি দিবস ও ঐতিহ্যবাহী তিথি খুঁজুন' 
                  : languageMode === LanguageMode.MEITEI_MAYEK 
                  ? 'ꯄꯣꯊꯥ ꯅꯨꯃꯤꯠ, ꯅꯤꯡꯁꯤꯡ ꯅꯨꯃꯤꯠ ꯑꯃꯁꯨꯡ ꯆꯠꯅꯕꯤꯒꯤ ꯅꯨꯃꯤꯠꯁꯤꯡ ꯊꯤꯕ' 
                  : 'Find Holidays, Memorials & Traditional Dates'}
              </h4>

              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5 sm:mb-6">
                {languageMode === LanguageMode.BENGALI
                  ? 'মৈতৈ ময়েক, ইংরেজি, বাংলা বা ফিল্টার ট্যাপ করে যেকোনো তিথি অনুসন্ধান করুন।'
                  : languageMode === LanguageMode.MEITEI_MAYEK
                  ? 'ꯃꯩꯇꯩ ꯃꯌꯦꯛ, ꯏꯪꯂꯤꯁ, ꯕꯥꯡꯂꯥ ꯅꯠꯇ꯭ꯔꯒ ꯃꯈꯜ ꯈꯅꯕꯗ ꯊꯤꯕ ꯌꯥꯏ꯫'
                  : 'Type in English, Meitei Mayek, or Bengali, or click category filters to explore.'}
              </p>

              {/* Popular Quick Suggestions */}
              <div className="w-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2.5 block">
                  {languageMode === LanguageMode.BENGALI ? 'জনপ্রিয় অনুসন্ধান' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯃꯤꯌꯥꯝꯅ ꯊꯤꯕ' : 'Quick Suggestions'}
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                  {popularKeywords.map((kw) => (
                    <button
                      key={kw.value}
                      onClick={() => setSearchQuery(kw.value)}
                      className="px-3 py-1.5 rounded-xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-850 hover:bg-rose-500/10 hover:border-rose-800/40 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all cursor-pointer active:scale-95 shadow-2xs touch-manipulation"
                    >
                      {kw.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : searching ? (
            /* Animated Loader */
            <div className="flex flex-col justify-center items-center py-20 gap-3">
              <div className="w-8 h-8 border-3 border-rose-800 dark:border-rose-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                {languageMode === LanguageMode.BENGALI ? 'অনুসন্ধান চলছে...' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯊꯤꯔꯤ...' : 'Searching calendar...'}
              </span>
            </div>
          ) : searchResults.length === 0 ? (
            /* No Results Found */
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-gray-700 dark:text-gray-300 mb-1">
                {languageMode === LanguageMode.BENGALI 
                  ? `"${searchQuery}" এর জন্য কিছু পাওয়া যায়নি` 
                  : languageMode === LanguageMode.MEITEI_MAYEK 
                  ? `"${searchQuery}" ꯒꯤ ꯑꯣꯏꯕ ꯐꯪꯗꯦ` 
                  : `No results found for "${searchQuery}"`}
              </h4>
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
                {languageMode === LanguageMode.BENGALI
                  ? 'বানান পরীক্ষা করুন বা অন্য কোনো কীওয়ার্ড চেষ্টা করুন।'
                  : languageMode === LanguageMode.MEITEI_MAYEK
                  ? 'ꯃꯌꯦꯛ ꯑꯃꯨꯛ ꯍꯟꯅ ꯌꯦꯡꯕꯤꯌꯨ ꯅꯠꯇ꯭ꯔꯒ ꯑꯇꯣꯞꯄ ꯊꯤꯕꯤꯌꯨ꯫'
                  : 'Try double-checking your spelling or searching for a different keyword or category.'}
              </p>
            </div>
          ) : (
            /* Results Scrollable List */
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 mb-1 text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                <span>
                  {languageMode === LanguageMode.BENGALI ? 'ফলাফল' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯐꯪꯈ꯭ꯔꯕ ꯅꯨꯃꯤꯠ' : 'Matching Days'} ({searchResults.length})
                </span>
                <span className="hidden sm:inline text-[10px] font-normal lowercase tracking-normal">
                  click or press Enter to view
                </span>
              </div>

              {searchResults.map((dayData, idx) => {
                const isSelected = idx === selectedIndex;

                // Resolve events and festivals
                const matchedFestivals = (dayData.festivals || [])
                  .map((id) => eventsList.find((e) => e.id === id))
                  .filter(Boolean) as Event[];

                const matchedEvents = (dayData.events || [])
                  .map((id) => eventsList.find((e) => e.id === id))
                  .filter(Boolean) as Event[];

                // Deduplicate by name
                const combinedList: Event[] = [];
                [...matchedFestivals, ...matchedEvents].forEach((ev) => {
                  if (!combinedList.some((it) => it.name.toLowerCase() === ev.name.toLowerCase())) {
                    combinedList.push(ev);
                  }
                });

                const hasHoliday = combinedList.some((e) => e.isHoliday || e.category === 'holiday' || e.category === 'bank_holiday');

                // Gregorian date formatting
                const gDate = new Date(dayData.gregorian);
                const gWeekday = gDate.toLocaleDateString('en-US', { weekday: 'short' });
                const gMonth = gDate.toLocaleDateString('en-US', { month: 'short' });
                const gDayNum = dayData.gregorian.split('-')[2];
                const gYear = dayData.gregorian.split('-')[0];

                const translatedMonth = Translator.translateMonth(dayData.month, languageMode, translations);
                const translatedDays = dayData.day.map((d) => Translator.translateDigits(d.toString(), languageMode, translations)).join('/');

                return (
                  <div
                    key={dayData.gregorian}
                    ref={(el) => { resultItemRefs.current[idx] = el; }}
                    onClick={() => onNavigateToDetail(dayData.gregorian)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`group rounded-2xl border p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-150 cursor-pointer touch-manipulation ${
                      isSelected
                        ? 'border-rose-400 dark:border-rose-500 bg-rose-50/70 dark:bg-rose-950/35 shadow-sm ring-1 ring-rose-500/20'
                        : 'border-gray-150 dark:border-gray-800/80 bg-white dark:bg-gray-850/60 hover:bg-gray-50/80 dark:hover:bg-gray-800 hover:border-rose-200 dark:hover:border-rose-900/40'
                    }`}
                  >
                    {/* Left: Gregorian Day Number Badge */}
                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                      <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex flex-col items-center justify-center border font-black transition-all ${
                        hasHoliday
                          ? 'bg-red-500/10 border-red-200/80 dark:border-red-900/40 text-red-600 dark:text-red-400'
                          : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200/60 dark:border-gray-700/60 text-gray-850 dark:text-gray-100'
                      }`}>
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 leading-none">
                          {gMonth}
                        </span>
                        <span className="text-sm sm:text-lg font-black leading-tight">
                          {gDayNum}
                        </span>
                      </div>

                      {/* Visible Moon Graphic on all screen sizes */}
                      {dayData.observance && (
                        <div className="flex w-9 h-9 sm:w-10 sm:h-10 bg-gray-50 dark:bg-gray-800/40 rounded-xl items-center justify-center border border-gray-150 dark:border-gray-800 shrink-0">
                          <MoonGraphic
                            phase={dayData.observance}
                            moonPhase={dayData.moonPhase}
                            size={20}
                          />
                        </div>
                      )}
                    </div>

                    {/* Middle: Details & Badges */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                        <h5 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white leading-tight truncate">
                          {translatedMonth}, {translatedDays}
                        </h5>
                        <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500">
                          · {gWeekday}, {gDayNum} {gMonth} {gYear}
                        </span>
                      </div>

                      {/* Associated occasions & badges */}
                      {combinedList.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-1.5 sm:mt-2">
                          {combinedList.map((ev) => {
                            const badge = getCategoryBadge(ev, languageMode);
                            return (
                              <span
                                key={ev.id}
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 ${badge.className}`}
                              >
                                {ev.category === 'memorial' && <Flame className="w-2.5 h-2.5 shrink-0" />}
                                <span className="truncate max-w-[180px] sm:max-w-[240px]">{ev.name}</span>
                                <span className="opacity-60 text-[9px] font-normal">({badge.label})</span>
                              </span>
                            );
                          })}
                        </div>
                      ) : dayData.observance ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                            {dayData.observance}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 sm:mt-1">
                          Standard calendar day
                        </span>
                      )}
                    </div>

                    {/* Right: Chevron Arrow */}
                    <div className="shrink-0 flex items-center pl-0.5 text-gray-400 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors">
                      <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-150 ${isSelected ? 'translate-x-1 text-rose-700 dark:text-rose-400' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Shortcut Hints Footer Bar */}
        <div className="hidden sm:flex items-center justify-between px-5 sm:px-6 py-2.5 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/70 dark:bg-gray-950/50 shrink-0 text-[11px] text-gray-500 dark:text-gray-400 select-none">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Manipuri Calendar Spotlight</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px]">↓</kbd>
              <span className="text-[10px] ml-0.5">navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px] flex items-center">
                <CornerDownLeft className="w-2.5 h-2.5 mr-0.5" /> Enter
              </kbd>
              <span className="text-[10px] ml-0.5">select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px]">ESC</kbd>
              <span className="text-[10px] ml-0.5">close</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
