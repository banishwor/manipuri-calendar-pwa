import React, { useEffect } from 'react';
import { LanguageMode, DisplayTheme } from '../types';
import { 
  X, 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Monitor, 
  Check, 
  Info, 
  ChevronRight, 
  Sparkles,
  Calendar as CalendarIcon,
  Globe2,
  Palette
} from 'lucide-react';
import { motion } from 'motion/react';

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
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock background scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const languageOptions = [
    { 
      mode: LanguageMode.ENGLISH, 
      label: 'English', 
      nativeName: 'English Script',
      badge: 'A',
      preview: '12 Mera · 3424 MPK',
      badgeClass: 'text-rose-900 dark:text-rose-200'
    },
    { 
      mode: LanguageMode.MEITEI_MAYEK, 
      label: 'Meitei Mayek', 
      nativeName: 'ꯃꯩꯇꯩ ꯃꯌꯦꯛ',
      badge: 'ꯋ',
      preview: '꯱꯲ ꯃꯦꯔꯥ · ꯳꯴꯲꯴',
      badgeClass: 'text-rose-800 dark:text-rose-400'
    },
    { 
      mode: LanguageMode.BENGALI, 
      label: 'Bengali', 
      nativeName: 'বাংলা লিপি',
      badge: 'অ',
      preview: '১২ মেরা · ৩৪২৪',
      badgeClass: 'text-rose-800 dark:text-rose-400'
    }
  ];

  const themeOptions = [
    { 
      theme: DisplayTheme.SYSTEM, 
      label: 'System', 
      desc: 'Automatic device sync',
      icon: Monitor,
      previewGradient: 'from-amber-100/60 to-gray-800/80'
    },
    { 
      theme: DisplayTheme.LIGHT, 
      label: 'Light', 
      desc: 'Warm parchment day mode',
      icon: Sun,
      previewGradient: 'from-rose-50 to-amber-50'
    },
    { 
      theme: DisplayTheme.DARK, 
      label: 'Dark', 
      desc: 'Eye-friendly OLED night mode',
      icon: Moon,
      previewGradient: 'from-gray-900 to-gray-950'
    }
  ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/45 dark:bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 lg:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Apple-style Frosted Crystal Pop-up Card */}
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        className="relative w-full max-w-lg lg:max-w-xl max-h-[88vh] rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden my-auto"
      >
        {/* Apple Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800/80 shrink-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-400/15 border border-rose-500/20 flex items-center justify-center text-rose-800 dark:text-rose-400 shrink-0">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-tight">
                {languageMode === LanguageMode.BENGALI ? 'পছন্দ ও সেটিংস' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯄꯨꯛꯅꯤꯡ ꯆꯪꯕ ꯑꯃꯁꯨꯡ ꯁꯦꯝꯖꯤꯟ-ꯁꯥꯖꯤꯟꯕ' : 'Preferences & Settings'}
              </h3>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                {languageMode === LanguageMode.BENGALI ? 'লিপি ও প্রদর্শন থিম পরিবর্তন' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯃꯌꯦꯛ ꯑꯃꯁꯨꯡ ꯃꯃꯤ ꯁꯦꯝꯗꯣꯛ-ꯁꯦꯝꯖꯤꯟ' : 'Customize script, appearance & theme'}
              </span>
            </div>
          </div>

          {/* Floating Apple-style Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-5 scrollbar-thin">
          
          {/* 1. Language Script Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 px-1">
              <Globe2 className="w-3.5 h-3.5 text-rose-800 dark:text-rose-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {languageMode === LanguageMode.BENGALI ? 'ভাষা ও লিপি' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯂꯣꯟ ꯑꯃꯁꯨꯡ ꯃꯌꯦꯛ' : 'Language Script'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {languageOptions.map((opt) => {
                const isSelected = languageMode === opt.mode;
                return (
                  <div
                    key={opt.mode}
                    onClick={() => onSetLanguageMode(opt.mode)}
                    className={`relative rounded-2xl border p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] select-none ${
                      isSelected
                        ? 'border-2 border-rose-600 dark:border-rose-500 bg-gradient-to-br from-rose-50/90 to-amber-50/30 dark:from-rose-950/40 dark:to-amber-950/20 shadow-sm ring-2 ring-rose-500/20'
                        : 'border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 hover:bg-gray-50/80 dark:hover:bg-gray-850/60'
                    }`}
                  >
                    {/* Top row: Big Badge & Selected Check */}
                    <div className="flex items-start justify-between">
                      <span className={`text-2xl font-black ${
                        isSelected ? opt.badgeClass : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {opt.badge}
                      </span>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-rose-800 dark:bg-rose-700 text-white flex items-center justify-center shadow-2xs">
                          <Check className="w-3 h-3 stroke-[3px]" />
                        </div>
                      )}
                    </div>

                    {/* Labels */}
                    <div className="mt-2.5 flex flex-col">
                      <span className={`text-xs font-black leading-tight ${
                        isSelected ? 'text-rose-950 dark:text-rose-100' : 'text-gray-900 dark:text-gray-200'
                      }`}>
                        {opt.label}
                      </span>
                      <span className={`text-[10px] font-bold mt-0.5 ${
                        isSelected ? 'text-rose-800/80 dark:text-rose-400' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {opt.nativeName}
                      </span>
                    </div>

                    {/* Sample Preview Chip */}
                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded block truncate text-center ${
                        isSelected 
                          ? 'bg-rose-500/10 text-rose-900 dark:text-rose-200 border border-rose-500/20' 
                          : 'bg-gray-100/70 dark:bg-gray-800/70 text-gray-500 dark:text-gray-400'
                      }`}>
                        {opt.preview}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Display Theme Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 px-1">
              <Palette className="w-3.5 h-3.5 text-rose-800 dark:text-rose-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {languageMode === LanguageMode.BENGALI ? 'প্রদর্শন থিম' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯃꯃꯤ ꯑꯃꯁꯨꯡ ꯃꯆꯨ' : 'Appearance Theme'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {themeOptions.map((opt) => {
                const isSelected = displayTheme === opt.theme;
                const IconComponent = opt.icon;
                return (
                  <div
                    key={opt.theme}
                    onClick={() => onSetDisplayTheme(opt.theme)}
                    className={`relative rounded-2xl border p-3 sm:p-3.5 flex flex-col items-center justify-between text-center cursor-pointer transition-all active:scale-[0.98] select-none ${
                      isSelected
                        ? 'border-2 border-rose-600 dark:border-rose-500 bg-rose-50/80 dark:bg-rose-950/30 shadow-sm ring-2 ring-rose-500/20'
                        : 'border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 hover:bg-gray-50/80 dark:hover:bg-gray-850/60'
                    }`}
                  >
                    {/* Icon container */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-rose-800 text-white shadow-2xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Label & Description */}
                    <div className="mt-2 flex flex-col items-center">
                      <span className={`text-xs font-black leading-tight ${
                        isSelected ? 'text-rose-950 dark:text-rose-100' : 'text-gray-900 dark:text-gray-200'
                      }`}>
                        {opt.label}
                      </span>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium mt-0.5 leading-tight">
                        {opt.desc}
                      </span>
                    </div>

                    {/* Bottom Check indicator */}
                    <div className="mt-2.5 h-4 flex items-center justify-center">
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-rose-800 dark:bg-rose-700 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3px]" />
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Grouped App Information & Cultural About */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-850/40 p-3.5 space-y-3">
            {/* App Identification Card */}
            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-gray-100 dark:border-gray-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-700 to-rose-900 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  ꯊ
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-900 dark:text-white leading-tight">
                    Manipuri Calendar PWA
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                    Indigenous Lunar & Gregorian System
                  </span>
                </div>
              </div>

              <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20">
                v2.4.0 · 3424 MPK
              </span>
            </div>

            {/* Link to About & Cultural Sources Screen */}
            <div
              onClick={onOpenAbout}
              className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 flex items-center justify-between cursor-pointer hover:bg-rose-50/50 dark:hover:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-800/60 transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 dark:bg-rose-400/15 text-rose-800 dark:text-rose-400 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-900 dark:text-white group-hover:text-rose-900 dark:group-hover:text-rose-200 transition-colors">
                    {languageMode === LanguageMode.BENGALI ? 'মণিপুরী ক্যালেন্ডার পরিচিতি' : languageMode === LanguageMode.MEITEI_MAYEK ? 'ꯃꯅꯤꯄꯨꯔꯤ ꯊꯥ-ꯅꯨꯃꯤꯠꯀꯤ ꯋꯥꯔꯤ' : 'About & Cultural Acknowledgements'}
                  </span>
                  <span className="text-[9.5px] text-gray-400 dark:text-gray-500">
                    Maliyapham Palcha Kumshing history & credits
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors" />
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
