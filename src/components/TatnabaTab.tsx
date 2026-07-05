import React from 'react';
import { LanguageMode, MonthConfig, Translations } from '../types';
import { Translator } from '../utils/translator';
import { MapPin, AlertTriangle } from 'lucide-react';

interface TatnabaTabProps {
  languageMode: LanguageMode;
  translations: Translations | null;
  monthConfigs: Record<string, MonthConfig>;
  isLoading: boolean;
}

export const TatnabaTab: React.FC<TatnabaTabProps> = ({
  languageMode,
  translations,
  monthConfigs,
  isLoading
}) => {
  // Traditional sequence of Meitei Calendar Months
  const traditionalSequence = [
    'Sajibu', 'Kalen', 'Inga', 'Ingen', 'Thawan', 'Langban',
    'Mera', 'Hiyangei', 'Poinu', 'Wakching', 'Phairen', 'Lamta'
  ];

  // Map the keys of monthConfigs to sort according to the traditional sequence
  const sortedMonthNames = Object.keys(monthConfigs).sort((a, b) => {
    const nameA = a.toUpperCase().replace(/\s*\(LEAP\)/g, '').replace(/_LEAP/g, '').trim();
    const nameB = b.toUpperCase().replace(/\s*\(LEAP\)/g, '').replace(/_LEAP/g, '').trim();
    
    // Fallbacks for ENGA/INGA naming variations
    const normA = nameA === 'ENGA' ? 'INGA' : nameA === 'ENGEN' ? 'INGEN' : nameA;
    const normB = nameB === 'ENGA' ? 'INGA' : nameB === 'ENGEN' ? 'INGEN' : nameB;

    const indexA = traditionalSequence.findIndex((m) => m.toUpperCase() === normA);
    const indexB = traditionalSequence.findIndex((m) => m.toUpperCase() === normB);

    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header */}
      <div className="py-2 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Tatnaba &amp; Thasi Maikei</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Traditional Rules &amp; Avoided Weekdays</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-rose-800 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sortedMonthNames.length === 0 ? (
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
          No traditional configurations found for this year.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {sortedMonthNames.map((monthKey) => {
            const config = monthConfigs[monthKey];
            if (!config) return null;

            const monthDisplayName = Translator.translateMonth(monthKey, languageMode, translations);
            const translatedDirection = Translator.translateDirection(config.thasiMaikei, languageMode, translations);
            
            const translatedTatnaba = config.tatnaba.map((weekday) => {
              return Translator.translateWeekdayShort(weekday, languageMode, translations);
            }).join(', ');

            return (
              <div
                key={monthKey}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 md:p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all border-l-4 border-l-rose-800 dark:border-l-rose-600"
              >
                {/* Month Title */}
                <div>
                  <h4 className="text-base font-black text-rose-800 dark:text-rose-400 leading-tight">
                    {monthDisplayName}
                  </h4>
                </div>

                {/* Info Fields */}
                <div className="flex flex-col gap-2.5">
                  {/* Thasi Maikei Direction */}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Thasi Maikei</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {translatedDirection}
                      </span>
                    </div>
                  </div>

                  {/* Tatnaba Avoided Weekdays */}
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500/80 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-red-500/80 uppercase tracking-wider">Tatnaba</span>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">
                        {translatedTatnaba || 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
