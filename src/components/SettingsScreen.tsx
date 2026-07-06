import React from 'react';
import { LanguageMode, DisplayTheme } from '../types';
import { ArrowLeft, Info, ChevronRight, Check } from 'lucide-react';

interface SettingsScreenProps {
  languageMode: LanguageMode;
  onSetLanguageMode: (mode: LanguageMode) => void;
  displayTheme: DisplayTheme;
  onSetDisplayTheme: (theme: DisplayTheme) => void;
  onClose: () => void;
  onOpenAbout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  languageMode,
  onSetLanguageMode,
  displayTheme,
  onSetDisplayTheme,
  onClose,
  onOpenAbout
}) => {
  const languageOptions = [
    { mode: LanguageMode.ENGLISH, label: 'English', badge: 'A' },
    { mode: LanguageMode.MEITEI_MAYEK, label: 'Meitei Mayek', badge: 'ꯋ' },
    { mode: LanguageMode.BENGALI, label: 'Bengali', badge: 'অ' }
  ];

  const themeOptions = [
    { theme: DisplayTheme.SYSTEM, label: 'System', desc: 'Default system preference' },
    { theme: DisplayTheme.LIGHT, label: 'Light', desc: 'Classic comfortable appearance' },
    { theme: DisplayTheme.DARK, label: 'Dark', desc: 'Eyes-safe night mode' }
  ];

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
        <h2 className="text-lg font-black text-gray-900 dark:text-white">Settings</h2>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-8 pb-12">
        {/* Language Script Selector Section */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
            Language Script
          </span>

          <div className="grid grid-cols-3 gap-3">
            {languageOptions.map((opt) => {
              const isSelected = languageMode === opt.mode;
              return (
                <div
                  key={opt.mode}
                  onClick={() => onSetLanguageMode(opt.mode)}
                  className={`rounded-2xl border p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-rose-500/10 border-rose-800 dark:border-rose-500 shadow-sm'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  <span className={`text-2xl font-black mb-2 ${
                    isSelected ? 'text-rose-800 dark:text-rose-400' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {opt.badge}
                  </span>
                  <span className={`text-xs font-bold ${
                    isSelected ? 'text-rose-900 dark:text-rose-200' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Display Theme Selector Section */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
            Display Theme
          </span>

          <div className="flex flex-col gap-2.5">
            {themeOptions.map((opt) => {
              const isSelected = displayTheme === opt.theme;
              return (
                <div
                  key={opt.theme}
                  onClick={() => onSetDisplayTheme(opt.theme)}
                  className={`rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                    isSelected
                      ? 'bg-rose-500/10 border-rose-800 dark:border-rose-500 shadow-sm'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-sm font-extrabold ${
                      isSelected ? 'text-rose-900 dark:text-rose-200' : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {opt.desc}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-rose-800 dark:bg-rose-700 flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-150 dark:border-gray-800" />

        {/* About App list trigger */}
        <div
          onClick={onOpenAbout}
          className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-800 dark:text-rose-400">
              <Info className="w-4 h-4" />
            </div>
            <span className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
              About Manipuri Calendar
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};
