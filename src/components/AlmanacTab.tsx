import React, { useState, useEffect, useMemo } from 'react';
import { CalendarDay, LanguageMode, MonthConfig, Translations } from '../types';
import { Translator } from '../utils/translator';
import { CalendarRepository } from '../utils/calendarData';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface AlmanacTabProps {
  languageMode: LanguageMode;
  translations: Translations | null;
  todayDay: CalendarDay | null;
}

export const AlmanacTab: React.FC<AlmanacTabProps> = ({
  languageMode,
  translations,
  todayDay
}) => {
  const [selectedMeiteiYear, setSelectedMeiteiYear] = useState<number>(3424);
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

  // Tabs: Tatnaba, Maikei
  const tabs = ['Tatnaba', 'Maikei'] as const;
  type TabType = typeof tabs[number];
  const [activeTab, setActiveTab] = useState<TabType>('Tatnaba');

  // Track active selected month for the direction compass
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDirection, setSelectedDirection] = useState<string>('');

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
      const todayMonth = todayDay?.month || '';
      const matchingMonth = sortedMonths.find((m) => m.toUpperCase() === todayMonth.toUpperCase());
      if (matchingMonth && monthConfigs[matchingMonth]) {
        setSelectedMonth(matchingMonth);
        setSelectedDirection(monthConfigs[matchingMonth].thasiMaikei || 'CHINGKHEI');
      } else if (!selectedMonth || !monthConfigs[selectedMonth]) {
        const first = sortedMonths[0];
        setSelectedMonth(first);
        setSelectedDirection(monthConfigs[first]?.thasiMaikei || 'CHINGKHEI');
      }
    }
  }, [sortedMonths, todayDay]);

  return (
    <div className="flex flex-col gap-4 pb-24 w-full">
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
              onClick={() => setActiveTab(tabName)}
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
          {/* --- MAIKEI TAB VIEW --- */}
          {activeTab === 'Maikei' && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 w-full text-left">
                Where the new moon (Thasi) rests, month by month.
              </p>

              {/* Year Navigator */}
              <div className="flex items-center justify-center gap-6 py-1">
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
                  <span className="text-2xl font-black text-rose-900 dark:text-rose-100 tracking-tight">
                    {Translator.translateDigits(selectedMeiteiYear.toString(), languageMode, translations)}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
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

              {/* Compass Graphic */}
              <MaikeiCompass
                selectedDirection={selectedDirection}
                selectedMonthName={selectedMonth}
                languageMode={languageMode}
                translations={translations}
              />

              {/* Scrollable Month List */}
              <div className="w-full flex flex-col gap-1.5 mt-2">
                {sortedMonths.map((monthName) => {
                  const config = monthConfigs[monthName];
                  if (!config) return null;
                  const isSelected = monthName === selectedMonth;
                  const monthDisplayName = Translator.translateMonth(monthName, languageMode, translations);
                  const directionNameNative = Translator.translateDirection(config.thasiMaikei, languageMode, translations);
                  const directionNameEng = config.thasiMaikei.charAt(0).toUpperCase() + config.thasiMaikei.slice(1).toLowerCase();

                  return (
                    <div
                      key={monthName}
                      onClick={() => {
                        setSelectedMonth(monthName);
                        setSelectedDirection(config.thasiMaikei);
                      }}
                      className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-rose-500/15 dark:bg-rose-500/20 border border-rose-800/30 dark:border-rose-400/30 shadow-sm'
                          : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850'
                      }`}
                    >
                      <span className={`text-sm ${
                        isSelected ? 'font-black text-rose-900 dark:text-rose-200' : 'font-bold text-gray-800 dark:text-gray-200'
                      }`}>
                        {monthDisplayName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${
                          isSelected ? 'text-rose-800 dark:text-rose-400' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {directionNameNative}
                        </span>
                        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                          {directionNameEng}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- TATNABA TAB VIEW --- */}
          {activeTab === 'Tatnaba' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Days to avoid in each month of Meitei year {selectedMeiteiYear}.
              </p>

              {/* Year Navigator */}
              <div className="flex items-center justify-center gap-6 py-1">
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
                  <span className="text-2xl font-black text-rose-900 dark:text-rose-100 tracking-tight">
                    {Translator.translateDigits(selectedMeiteiYear.toString(), languageMode, translations)}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
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

              {/* 3-Column Grid of Month Cards */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {sortedMonths
                  .filter((m) => !m.toUpperCase().includes('LEAP'))
                  .map((monthName) => {
                    const config = monthConfigs[monthName];
                    if (!config) return null;
                    const monthDisplayName = Translator.translateMonth(monthName, languageMode, translations);
                    const tatnabaDaysStr = config.tatnaba.length === 0
                      ? 'None'
                      : config.tatnaba.map((weekday) => Translator.translateWeekdayShort(weekday, languageMode, translations)).join(', ');

                    return (
                      <div
                        key={monthName}
                        className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 flex flex-col items-center justify-center text-center gap-1 shadow-sm min-h-[105px]"
                      >
                        <h4 className="text-xs sm:text-sm font-black text-rose-800 dark:text-rose-400 truncate w-full">
                          {monthDisplayName}
                        </h4>
                        <span className="text-[9px] font-bold text-red-500/80 uppercase tracking-wider">
                          Tatnaba
                        </span>
                        <span className={`text-[11px] font-bold ${
                          config.tatnaba.length === 0
                            ? 'text-gray-400 dark:text-gray-500'
                            : 'text-red-600 dark:text-red-400'
                        } truncate w-full`}>
                          {tatnabaDaysStr}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Warning Proverb Footer Banner */}
              <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-sm font-black text-red-600 dark:text-red-400">
                  {languageMode === LanguageMode.BENGALI
                    ? 'তৎনবা নুমিত্তা অফবা থবক তৌবা ফত্তে'
                    : 'ꯇꯥꯠꯅꯥꯕꯥ ꯅꯨꯝꯤꯠ ꯇꯥ ꯑꯐꯥꯕꯥ ꯊꯥꯕꯛ ꯇꯧꯕ ꯐꯥꯠ ꯇꯦ'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  Traditional Astrological Guidance: Avoid embarking on auspicious ventures on Tatnaba days.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface MaikeiCompassProps {
  selectedDirection: string;
  selectedMonthName: string;
  languageMode: LanguageMode;
  translations: Translations | null;
}

const MaikeiCompass: React.FC<MaikeiCompassProps> = ({
  selectedDirection,
  selectedMonthName,
  languageMode,
  translations
}) => {
  // 8 traditional Meitei directions with angles (degrees, standard polar 0° is East/NONGPOK, 270° is North/AWANG, etc.)
  const directions = [
    { key: 'AWANG', angle: 270 },
    { key: 'CHINGKHEI', angle: 315 },
    { key: 'NONGPOK', angle: 0 },
    { key: 'MEIRAM', angle: 45 },
    { key: 'KHA', angle: 90 },
    { key: 'SANTHONG', angle: 135 },
    { key: 'NONGCHUP', angle: 180 },
    { key: 'KOUBRU', angle: 225 }
  ];

  const outerRadius = 108;
  const innerRadius = 76;
  const textRadius = 92;
  const center = 120; // 240 / 2

  const dirDisplayNative = Translator.translateDirection(selectedDirection, languageMode, translations);
  const dirDisplayEng = selectedDirection ? selectedDirection.charAt(0).toUpperCase() + selectedDirection.slice(1).toLowerCase() : '';
  const translatedMonth = Translator.translateMonth(selectedMonthName, languageMode, translations);

  return (
    <div className="relative w-[240px] h-[240px] select-none my-2">
      {/* SVG Circular Tracks */}
      <svg className="w-full h-full" viewBox="0 0 240 240">
        {/* Outer track */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-200 dark:text-gray-800"
        />
        {/* Inner track */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-200 dark:text-gray-800"
        />

        {/* Direction Points & Dots */}
        {directions.map(({ key, angle }) => {
          const rad = (angle * Math.PI) / 180;
          const isSelected = key.toUpperCase() === selectedDirection.toUpperCase();

          const dotX = center + innerRadius * Math.cos(rad);
          const dotY = center + innerRadius * Math.sin(rad);

          return (
            <g key={key}>
              <circle
                cx={dotX}
                cy={dotY}
                r={isSelected ? 4.5 : 2.5}
                className={isSelected ? 'fill-rose-800 dark:fill-rose-500' : 'fill-gray-300 dark:fill-gray-700'}
              />
            </g>
          );
        })}
      </svg>

      {/* Direction Text Labels in Channel */}
      {directions.map(({ key, angle }) => {
        const rad = (angle * Math.PI) / 180;
        const isSelected = key.toUpperCase() === selectedDirection.toUpperCase();

        const labelX = center + textRadius * Math.cos(rad);
        const labelY = center + textRadius * Math.sin(rad);

        return (
          <div
            key={key}
            style={{
              position: 'absolute',
              left: `${labelX}px`,
              top: `${labelY}px`,
              transform: 'translate(-50%, -50%)'
            }}
            className={`text-[9px] whitespace-nowrap transition-colors pointer-events-none ${
              isSelected
                ? 'font-black text-rose-800 dark:text-rose-400 scale-110'
                : 'font-semibold text-gray-400 dark:text-gray-500'
            }`}
          >
            {Translator.translateDirection(key, languageMode, translations)}
          </div>
        );
      })}

      {/* Center Readout Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none">
        <span className="text-base font-black text-gray-900 dark:text-white leading-tight">
          {dirDisplayNative}
        </span>
        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-400">
          {dirDisplayEng}
        </span>
        <span className="text-[10px] font-bold text-rose-800 dark:text-rose-400 mt-1">
          Thasi maikei - {translatedMonth}
        </span>
      </div>
    </div>
  );
};
