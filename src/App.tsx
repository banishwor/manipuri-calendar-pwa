import React, { useState, useEffect, useMemo } from 'react';
import { CalendarDay, Event, LanguageMode, DisplayTheme, CalendarTab, MonthConfig, Translations } from './types';
import { CalendarRepository } from './utils/calendarData';
import { Translator } from './utils/translator';
import { TodayTab } from './components/TodayTab';
import { CalendarTab as CalendarViewTab } from './components/CalendarTab';
import { AlmanacTab } from './components/AlmanacTab';
import { AboutTab } from './components/AboutTab';
import { SearchScreen } from './components/SearchScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { DayDetailScreen } from './components/DayDetailScreen';
import { Calendar as CalendarIcon, Info, MapPin, Compass, ShieldAlert, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- STATE DECLARATIONS ---
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // PWA Install Prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('install') === 'auto' || urlParams.get('install') === 'true') {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);


  // Active dates context
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [daysOfMonth, setDaysOfMonth] = useState<CalendarDay[]>([]);
  const [monthConfigs, setMonthConfigs] = useState<Record<string, MonthConfig>>({});
  
  // Today's details (for greeting and banners)
  const [todayDay, setTodayDay] = useState<CalendarDay | null>(null);
  const [todayMonthConfig, setTodayMonthConfig] = useState<MonthConfig | null>(null);

  // Lists & Translations
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [translations, setTranslations] = useState<Translations | null>(null);

  // User Settings (loaded from / persisted to localStorage)
  const [languageMode, setLanguageMode] = useState<LanguageMode>(LanguageMode.ENGLISH);
  const [displayTheme, setDisplayTheme] = useState<DisplayTheme>(DisplayTheme.SYSTEM);

  // Overlay Screens
  const [activeTab, setActiveTab] = useState<CalendarTab>(CalendarTab.TODAY);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Load preferences
    const savedLang = localStorage.getItem('mc_language_mode');
    if (savedLang && Object.values(LanguageMode).includes(savedLang as LanguageMode)) {
      setLanguageMode(savedLang as LanguageMode);
    }

    const savedTheme = localStorage.getItem('mc_display_theme');
    if (savedTheme && Object.values(DisplayTheme).includes(savedTheme as DisplayTheme)) {
      setDisplayTheme(savedTheme as DisplayTheme);
    }

    const repo = CalendarRepository.getInstance();
    
    const initializeData = async () => {
      try {
        await repo.init();
        setEventsList(repo.getEvents());
        setTranslations(repo.getTranslations());

        // Default to active year based on actual current local date, if available in years.json
        const today = new Date();
        const activeYear = repo.getAvailableYears().includes(today.getFullYear()) 
          ? today.getFullYear() 
          : repo.getAvailableYears()[0] || 2026;

        const activeMonth = today.getMonth() + 1;

        setCurrentYear(activeYear);
        setCurrentMonth(activeMonth);

        // Load baseline year dataset
        await repo.loadYearData(activeYear);
        
        // Fetch current month days
        const days = await repo.getDaysForMonth(activeYear, activeMonth);
        setDaysOfMonth(days);

        const configs = await repo.getMonthConfigsForYear(activeYear);
        setMonthConfigs(configs);

        // Fetch Today's specific day details
        const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        const dayDetails = await repo.getDayDetails(todayStr);
        setTodayDay(dayDetails);
        if (dayDetails) {
          const tConfig = await repo.getMonthConfig(today.getFullYear(), dayDetails.month);
          setTodayMonthConfig(tConfig);
        }

        setInitialized(true);
      } catch (e) {
        console.error('Initialization failed', e);
      } finally {
        setLoading(false);
        // Dim splash screen after brief pause to allow gorgeous transition animation
        setTimeout(() => {
          setShowSplash(false);
        }, 2200);
      }
    };

    initializeData();
  }, []);

  // --- DISPLAY THEME APPLICATION ---
  useEffect(() => {
    const rootClass = document.documentElement.classList;
    const isDarkPrefer = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (displayTheme === DisplayTheme.DARK || (displayTheme === DisplayTheme.SYSTEM && isDarkPrefer)) {
      rootClass.add('dark');
    } else {
      rootClass.remove('dark');
    }

    // Persist
    localStorage.setItem('mc_display_theme', displayTheme);
  }, [displayTheme]);

  // Persist language mode changes
  useEffect(() => {
    localStorage.setItem('mc_language_mode', languageMode);
  }, [languageMode]);

  // --- REACTIVE DATA LOADING (ON MONTH / YEAR NAVIGATION) ---
  useEffect(() => {
    if (!initialized) return;

    let active = true;
    const loadNewMonthData = async () => {
      const repo = CalendarRepository.getInstance();
      try {
        await repo.loadYearData(currentYear);
        if (!active) return;

        const days = await repo.getDaysForMonth(currentYear, currentMonth);
        if (!active) return;
        setDaysOfMonth(days);

        const configs = await repo.getMonthConfigsForYear(currentYear);
        if (!active) return;
        setMonthConfigs(configs);
      } catch (e) {
        console.error('Failed to load month dataset dynamically', e);
      }
    };

    loadNewMonthData();
    return () => { active = false; };
  }, [currentYear, currentMonth, initialized]);

  // --- UPCOMING HOLIDAYS COUNTDOWN CALCULATION ---
  const upcomingFestivals = useMemo(() => {
    if (!initialized || daysOfMonth.length === 0) return [];
    
    try {
      const repo = CalendarRepository.getInstance();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // We flat-map days of current and next discovered years to evaluate countdowns
      const allDiscoveredDays: CalendarDay[] = [];
      repo.getAvailableYears().forEach((year) => {
        // Retrieve loaded dataset from memory caches
        // @ts-ignore
        const cachedDays = repo.calendarCache[year] || [];
        allDiscoveredDays.push(...cachedDays);
      });

      const list = allDiscoveredDays.map((day) => {
        const parts = day.gregorian.split('-');
        const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        dateObj.setHours(0, 0, 0, 0);

        if (dateObj >= today && day.festivals && day.festivals.length > 0) {
          const matchedEvents = day.festivals
            .map((id) => eventsList.find((e) => e.id === id))
            .filter(Boolean) as Event[];

          if (matchedEvents.length > 0) {
            const timeDiff = dateObj.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            return {
              date: day.gregorian,
              dayData: day,
              events: matchedEvents,
              daysRemaining: daysDiff
            };
          }
        }
        return null;
      }).filter(Boolean) as any[];

      // Sort chronologically by remaining days and take first 10 items
      return list
        .sort((a, b) => a.daysRemaining - b.daysRemaining)
        .slice(0, 10);
    } catch (e) {
      console.warn('Countdown calculation error', e);
      return [];
    }
  }, [initialized, daysOfMonth, eventsList]);

  // --- MONTH CHANGE NAVIGATION HANDLERS ---
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      const prevYear = currentYear - 1;
      const repo = CalendarRepository.getInstance();
      if (repo.getAvailableYears().includes(prevYear)) {
        setCurrentYear(prevYear);
        setCurrentMonth(12);
      }
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      const nextYear = currentYear + 1;
      const repo = CalendarRepository.getInstance();
      if (repo.getAvailableYears().includes(nextYear)) {
        setCurrentYear(nextYear);
        setCurrentMonth(1);
      }
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    const repo = CalendarRepository.getInstance();
    if (repo.getAvailableYears().includes(today.getFullYear())) {
      setCurrentYear(today.getFullYear());
      setCurrentMonth(today.getMonth() + 1);
    }
  };

  // --- ICON CUSTOM CANVAS PAINT REPLICATION IN SVG ---
  const renderNavIconToday = (isSelected: boolean) => (
    <svg className="w-6 h-6 transition-colors" viewBox="0 0 24 24">
      {/* Crescent moon path */}
      <path
        d="M 18 3.6 C 6 3.6, 6 20.4, 18 20.4 C 10.08 18.72, 10.08 5.28, 18 3.6 Z"
        fill={isSelected ? '#800E13' : 'currentColor'}
        className={isSelected ? 'dark:fill-rose-400' : 'text-gray-400 dark:text-gray-500'}
      />
      {/* Meitei traditional star decoration */}
      <path
        d="M 17.28 8.16 L 17.94 10.14 L 19.92 10.8 L 17.94 11.46 L 17.28 13.44 L 16.62 11.46 L 14.64 10.8 L 16.62 10.14 Z"
        fill={isSelected ? '#D4AF37' : 'currentColor'}
        className={isSelected ? '' : 'opacity-80 text-gray-400 dark:text-gray-500'}
      />
    </svg>
  );

  const renderNavIconCalendar = (isSelected: boolean) => (
    <svg className="w-6 h-6 transition-colors" viewBox="0 0 24 24">
      {/* Calendar Plate Body */}
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        fill="none"
        stroke={isSelected ? '#800E13' : 'currentColor'}
        strokeWidth="2"
        className={isSelected ? 'dark:stroke-rose-400' : 'text-gray-400 dark:text-gray-500'}
      />
      <rect
        x="3"
        y="5"
        width="18"
        height="4"
        fill={isSelected ? '#800E13' : 'currentColor'}
        className={isSelected ? 'dark:fill-rose-400' : 'text-gray-400 dark:text-gray-500'}
      />
      {/* Bind rings */}
      <rect x="6" y="2" width="2" height="4" rx="0.5" fill="#D4AF37" />
      <rect x="16" y="2" width="2" height="4" rx="0.5" fill="#D4AF37" />
      {/* Grid dots */}
      <circle cx="7" cy="13" r="1.2" fill={isSelected ? '#800E13' : 'currentColor'} className={isSelected ? 'dark:fill-rose-400' : 'text-gray-400'} />
      <circle cx="12" cy="13" r="1.2" fill={isSelected ? '#800E13' : 'currentColor'} className={isSelected ? 'dark:fill-rose-400' : 'text-gray-400'} />
      <circle cx="17" cy="13" r="1.2" fill={isSelected ? '#800E13' : 'currentColor'} className={isSelected ? 'dark:fill-rose-400' : 'text-gray-400'} />
      <circle cx="7" cy="17" r="1.2" fill={isSelected ? '#800E13' : 'currentColor'} className={isSelected ? 'dark:fill-rose-400' : 'text-gray-400'} />
      <circle cx="12" cy="17" r="1.2" fill={isSelected ? '#800E13' : 'currentColor'} className={isSelected ? 'dark:fill-rose-400' : 'text-gray-400'} />
      <circle cx="17" cy="17" r="1.2" fill={isSelected ? '#800E13' : 'currentColor'} className={isSelected ? 'dark:fill-rose-400' : 'text-gray-400'} />
    </svg>
  );

  const renderNavIconTatnaba = (isSelected: boolean) => (
    <svg className="w-6 h-6 transition-colors" viewBox="0 0 24 24">
      {/* Outer Dial Dial */}
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke={isSelected ? '#800E13' : 'currentColor'}
        strokeWidth="2"
        className={isSelected ? 'dark:stroke-rose-400' : 'text-gray-400 dark:text-gray-500'}
      />
      <circle cx="12" cy="12" r="1.5" fill="#D4AF37" />
      {/* Sharp compass pointers */}
      <path d="M12 12l-2.5 0L12 4.5z" fill="#D4AF37" />
      <path d="M12 12l2.5 0L12 19.5z" fill={isSelected ? '#800E13' : 'currentColor'} className={isSelected ? 'dark:fill-rose-400' : 'text-gray-400'} opacity="0.45" />
    </svg>
  );

  const renderNavIconInfo = (isSelected: boolean) => (
    <svg className="w-6 h-6 transition-colors" viewBox="0 0 24 24">
      {/* Scroll shape */}
      <path
        d="M4 4h4v16H4zm12 0h4v16h-4z"
        fill="none"
        stroke={isSelected ? '#800E13' : 'currentColor'}
        strokeWidth="2"
        className={isSelected ? 'dark:stroke-rose-400' : 'text-gray-400 dark:text-gray-500'}
      />
      <line
        x1="8"
        y1="6.5"
        x2="16"
        y2="6.5"
        stroke={isSelected ? '#800E13' : 'currentColor'}
        strokeWidth="2"
        className={isSelected ? 'dark:stroke-rose-400' : 'text-gray-400 dark:text-gray-500'}
      />
      <line
        x1="8"
        y1="17.5"
        x2="16"
        y2="17.5"
        stroke={isSelected ? '#800E13' : 'currentColor'}
        strokeWidth="2"
        className={isSelected ? 'dark:stroke-rose-400' : 'text-gray-400 dark:text-gray-500'}
      />
      {/* Ancient lines */}
      <line x1="9.5" y1="10" x2="14.5" y2="10" stroke="#D4AF37" strokeWidth="1.2" />
      <line x1="9.5" y1="14" x2="14.5" y2="14" stroke="#D4AF37" strokeWidth="1.2" />
    </svg>
  );

  // --- DYNAMIC SPLASH CONTAINER SCREEN ---
  if (showSplash) {
    // Gregorian today date calculations
    const today = new Date();
    const dayOfWeekName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = today.toLocaleDateString('en-US', { month: 'long' });
    const ordinalSuffix = (d: number) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
      }
    };
    const formattedGregorianSplash = `${today.getDate()}${ordinalSuffix(today.getDate())} ${monthName}`;

    // Meitei lunar month and days calculations inside splash screen
    const meiteiWeekdaySplash = whenWeekdayMeitei(today.getDay());
    const meiteiMonthAndDaySplash = todayDay 
      ? `${Translator.translateMonth(todayDay.month, LanguageMode.MEITEI_MAYEK, translations)} ${todayDay.day.map((d) => Translator.translateDigits(d.toString(), LanguageMode.MEITEI_MAYEK, translations)).join(' & ')} ꯅꯤ ꯄꯥꯟꯕ`
      : 'ꯂꯣꯗ ꯇꯧꯔꯤ...';

    return (
      <div className="fixed inset-0 z-50 bg-[#FDFBF7] text-[#2B0508] flex flex-col items-center justify-between px-6 pb-6 pt-safe-lg md:p-8 overflow-hidden select-none">
        {/* Soft, safe time greeting at top */}
        <div className="pt-8 text-center flex flex-col gap-1">
          <span className="text-xl font-black tracking-wider text-rose-900 leading-none">
            ꯈꯨꯔꯨꯝꯖꯔꯤ
          </span>
          <span className="text-[10px] uppercase font-bold text-rose-700/60 tracking-widest mt-1">
            Traditional Welcome
          </span>
        </div>

        {/* Center application titles */}
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-40 h-40 md:w-44 md:h-44 transform transition-transform animate-pulse drop-shadow-xl flex items-center justify-center">
            <img src="./logo.png" alt="Manipuri Calendar Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <h1 className="text-2xl font-black text-rose-900 tracking-tight uppercase">
              Manipuri Calendar
            </h1>
            <h2 className="text-lg font-black text-rose-850 tracking-wider">
              ꯃꯩꯇꯩ ꯊꯥꯄꯥꯟꯂꯣꯟ
            </h2>
          </div>
        </div>

        {/* Split info box at bottom */}
        <div className="w-full max-w-sm flex flex-col gap-4 pb-8">
          <div className="grid grid-cols-2 gap-3">
            {/* Gregorian Card */}
            <div className="rounded-2xl border border-rose-900/10 bg-rose-500/5 p-4 flex flex-col gap-1 text-center">
              <span className="text-[8px] font-black uppercase text-rose-700/60 tracking-wider">Today's Date</span>
              <span className="text-sm font-black text-gray-900 leading-snug mt-1">{dayOfWeekName}</span>
              <span className="text-xs font-bold text-gray-500">{formattedGregorianSplash}</span>
            </div>

            {/* Lunar Card */}
            <div className="rounded-2xl border border-rose-900/10 bg-rose-500/5 p-4 flex flex-col gap-1 text-center">
              <span className="text-[8px] font-black uppercase text-rose-700/60 tracking-wider">Meitei Lunar</span>
              <span className="text-sm font-black text-gray-900 leading-snug mt-1">{meiteiWeekdaySplash}</span>
              <span className="text-xs font-bold text-gray-500 truncate">{meiteiMonthAndDaySplash}</span>
            </div>
          </div>

          {/* Credits */}
          <div className="flex flex-col text-center mt-4">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
              ❃ Developer Tribute ❃
            </span>
            <span className="text-xs font-bold text-gray-500 mt-1.5">
              Made with 💖 by Banishwor Athokpam
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Helper helper to check Meitei weekdays for splash
  function whenWeekdayMeitei(dayNum: number): string {
    switch (dayNum) {
      case 0: return 'ꯅꯣꯡꯃꯥꯢꯆꯤꯡ';
      case 1: return 'ꯅꯤꯡꯊꯧꯀꯥꯕ';
      case 2: return 'ꯂꯩꯄꯥꯛꯄꯣꯛꯄ';
      case 3: return 'ꯌꯨꯝ|ꯁꯀꯩꯁꯥ';
      case 4: return 'ꯁꯥꯒꯣꯜꯁꯦꯟ';
      case 5: return 'ꯏꯔꯥꯏ';
      case 6: return 'ꯊꯥꯡꯖꯥ';
      default: return '';
    }
  }

  // --- CORE UI LAYOUT SCREEN ---
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#140D0E] text-[#2B0508] dark:text-[#F9EAEB] transition-colors relative flex flex-col">
      
      {/* Desktop Navigation Side Bar & Top bar (hides on mobile) */}
      <header className="hidden md:flex border-b border-gray-100 dark:border-gray-800/80 bg-white/80 dark:bg-[#1D1416]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-800 flex items-center justify-center text-white font-bold">
              ꯋ
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight leading-none text-rose-850 dark:text-rose-400">Manipuri Calendar</h1>
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">ꯃꯩꯇꯩ ꯊꯥꯄꯥꯟꯂꯣꯟ</span>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {[
              { tab: CalendarTab.TODAY, label: 'Today', icon: renderNavIconToday },
              { tab: CalendarTab.CALENDAR, label: 'Calendar', icon: renderNavIconCalendar },
              { tab: CalendarTab.ALMANAC, label: 'Almanac', icon: renderNavIconTatnaba },
              { tab: CalendarTab.INFO, label: 'Info', icon: renderNavIconInfo }
            ].map((btn) => {
              const isSel = activeTab === btn.tab;
              return (
                <button
                  key={btn.tab}
                  onClick={() => setActiveTab(btn.tab)}
                  className={`px-4 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
                    isSel 
                      ? 'bg-rose-500/10 text-rose-800 dark:text-rose-400 border-none' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {btn.icon(isSel)}
                  {btn.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Responsive Body Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pb-4 pt-safe md:py-6 overflow-hidden">
        {activeTab === CalendarTab.TODAY && (
          <TodayTab
            todayDay={todayDay}
            todayMonthConfig={todayMonthConfig}
            languageMode={languageMode}
            translations={translations}
            upcomingFestivals={upcomingFestivals}
            onNavigateToDetail={(date) => setSelectedDateStr(date)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            eventsList={eventsList}
          />
        )}

        {activeTab === CalendarTab.CALENDAR && (
          <CalendarViewTab
            currentYear={currentYear}
            currentMonth={currentMonth}
            languageMode={languageMode}
            translations={translations}
            daysOfMonth={daysOfMonth}
            onNavigateToDetail={(date) => setSelectedDateStr(date)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            eventsList={eventsList}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onJumpToToday={handleJumpToToday}
          />
        )}

        {activeTab === CalendarTab.ALMANAC && (
          <AlmanacTab
            languageMode={languageMode}
            translations={translations}
            todayDay={todayDay}
          />
        )}

        {activeTab === CalendarTab.INFO && (
          <AboutTab />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (behaves like a persistent sticky bottom-bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#1D1416]/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800/80 z-30 pb-safe">
        <div className="grid grid-cols-4 h-16 items-center text-center">
          {[
            { tab: CalendarTab.TODAY, label: 'Today', icon: renderNavIconToday },
            { tab: CalendarTab.CALENDAR, label: 'Calendar', icon: renderNavIconCalendar },
            { tab: CalendarTab.ALMANAC, label: 'Almanac', icon: renderNavIconTatnaba },
            { tab: CalendarTab.INFO, label: 'Info', icon: renderNavIconInfo }
          ].map((btn) => {
            const isSel = activeTab === btn.tab;
            return (
              <button
                key={btn.tab}
                onClick={() => setActiveTab(btn.tab)}
                className="flex flex-col items-center justify-center gap-1.5 h-full text-center transition-all select-none"
              >
                {btn.icon(isSel)}
                <span className={`text-[10px] font-bold ${
                  isSel ? 'text-rose-800 dark:text-rose-450 font-black' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {btn.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* --- FLOATING OVERLAY DIALOG MODALS WITH ANIMATE PRESENCE --- */}
      <AnimatePresence>
        {/* Settings Overlay */}
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SettingsScreen
              languageMode={languageMode}
              onSetLanguageMode={setLanguageMode}
              displayTheme={displayTheme}
              onSetDisplayTheme={setDisplayTheme}
              onClose={() => setSettingsOpen(false)}
              onOpenAbout={() => {
                setSettingsOpen(false);
                setActiveTab(CalendarTab.INFO);
              }}
            />
          </motion.div>
        )}

        {/* Search Overlay */}
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SearchScreen
              languageMode={languageMode}
              translations={translations}
              eventsList={eventsList}
              onNavigateToDetail={(date) => {
                setSelectedDateStr(date);
                setSearchOpen(false);
              }}
              onClose={() => setSearchOpen(false)}
            />
          </motion.div>
        )}

        {/* Day Detail Overlay */}
        {selectedDateStr && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DayDetailScreen
              dateStr={selectedDateStr}
              languageMode={languageMode}
              translations={translations}
              eventsList={eventsList}
              onClose={() => setSelectedDateStr(null)}
            />
          </motion.div>
        )}

        {/* PWA Install Prompt Overlay */}
        {showInstallPrompt && deferredPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <div className="bg-[#FDFBF7] dark:bg-[#1D1416] border border-[#E9DCC4] dark:border-[#2b1016]/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-2xl">
                  <CalendarIcon className="w-10 h-10 text-rose-800 dark:text-rose-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#2B0508] dark:text-rose-100 mb-2">Install Manipuri Calendar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Install the application on your home screen for quick offline access, push notifications, and a full-screen standalone experience.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={async () => {
                    if (deferredPrompt) {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      console.log(`User response to install prompt: ${outcome}`);
                      setDeferredPrompt(null);
                    }
                    setShowInstallPrompt(false);
                    const url = new URL(window.location.href);
                    url.searchParams.delete('install');
                    window.history.replaceState({}, '', url.pathname + url.search);
                  }}
                  className="w-full py-3 bg-rose-800 hover:bg-rose-700 text-white rounded-xl font-semibold transition cursor-pointer"
                >
                  Install Now
                </button>
                <button
                  onClick={() => {
                    setShowInstallPrompt(false);
                    const url = new URL(window.location.href);
                    url.searchParams.delete('install');
                    window.history.replaceState({}, '', url.pathname + url.search);
                  }}
                  className="w-full py-3 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-500 dark:text-gray-400 rounded-xl font-semibold transition cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
