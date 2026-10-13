import React, { useState } from 'react';
import { 
  Heart, Smartphone, Sparkles, ExternalLink, 
  CheckCircle2, User, Globe, Rss, Share2, Check, Copy, 
  Mail, Star, Eye, Lightbulb, Send, Moon, Compass, ShieldCheck
} from 'lucide-react';
import { LanguageMode, Translations } from '../types';

interface AboutTabProps {
  languageMode?: LanguageMode;
  translations?: Translations | null;
}

export const AboutTab: React.FC<AboutTabProps> = ({
  languageMode = LanguageMode.ENGLISH,
  translations = null
}) => {
  const [shareCopied, setShareCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  // Localized section titles
  const isMayek = languageMode === LanguageMode.MEITEI_MAYEK;
  const isBengali = languageMode === LanguageMode.BENGALI;

  const headerTitle = isBengali 
    ? 'তথ্য ও নির্দেশিকা' 
    : isMayek 
      ? 'ꯏ-ꯄꯥꯎ ꯑꯃꯁꯨꯡ ꯂꯝꯖꯤꯡ' 
      : 'Information & Guide';

  const headerSubtitle = isBengali
    ? 'অ্যাপ্লিকেশন, ডেভেলপার এবং ঐতিহ্য রক্ষার বিশদ বিবরণ'
    : isMayek
      ? 'ꯑꯦꯞ, ꯁꯦꯝꯕꯃꯤ ꯑꯃꯁꯨꯡ ꯆꯠꯅꯕꯤ ꯀꯟꯕꯒꯤ ꯋꯥꯐꯝ'
      : 'About the application, developer, and cultural preservation mission';

  const handleShare = async () => {
    const fullUrl = window.location.href.split('#')[0].split('?')[0];
    const shareData = {
      title: 'Manipuri Calendar · ꯃꯩꯇꯩ ꯊꯥꯄꯥꯟꯂꯣꯟ',
      text: 'Fast, ad-free traditional Meitei calendar with Today’s Thaban, Tatnaba & Thasi Maikei.',
      url: fullUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback: Copy URL to clipboard
    try {
      await navigator.clipboard.writeText(fullUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText('banishwor@outlook.com');
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2500);
    } catch {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2500);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-y-auto select-none pr-1 pb-16 md:pb-0 scrollbar-thin">
      {/* Ambient Liquid Glass Backdrop Orbs */}
      <div className="absolute top-2 left-1/4 w-80 h-80 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-12 w-72 h-72 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-4 left-10 w-64 h-64 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="pb-2.5 mb-2.5 border-b border-gray-100 dark:border-gray-800/80 shrink-0 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg lg:text-xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            {headerTitle}
          </h2>
          <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
            {headerSubtitle}
          </p>
        </div>

        {/* Quick Header Share Button */}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-800 dark:text-rose-400 text-xs font-bold border border-rose-500/20 active:scale-95 transition-all cursor-pointer shadow-2xs shrink-0"
          title="Share Manipuri Calendar"
        >
          {shareCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share App</span>
            </>
          )}
        </button>
      </div>

      {/* Main Balanced Bento Grid: 2 Columns on Desktop, Perfectly Equal Baseline Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-4 flex-1 min-h-0 items-stretch">
        
        {/* =========================================================================
            LEFT COLUMN (Col Span 7): Heritage Mission, Ecosystem & Principles
            ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-3 lg:gap-3.5 min-h-0">
          
          {/* Card 1: Cultural Heritage Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4A0A10] via-[#680F18] to-[#881B24] p-4 lg:p-4.5 text-white shadow-md border border-white/20">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-rose-100">
                  MANIPURI CALENDAR · PWA
                </span>
                <span className="text-[9.5px] font-bold text-amber-200">
                  MALIYAPHAM PALCHA KUMSHING
                </span>
              </div>

              <div>
                <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                  ꯃꯩꯇꯩ ꯊꯥꯄꯥꯟꯂꯣꯟ
                </h3>
                <p className="text-xs text-rose-100/90 font-medium leading-relaxed mt-1">
                  Preserving Meitei heritage, lunar reckoning (Thaban), astrological guidelines (Tatnaba &amp; Thasi Maikei), and language through thoughtful digital craftsmanship.
                </p>
              </div>

              {/* Cultural Feature Highlights */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/15 text-[10px]">
                <div className="flex items-center gap-1.5 text-rose-100">
                  <Moon className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="font-semibold truncate">Lunar Thaban</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-100">
                  <Compass className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="font-semibold truncate">Thasi Maikei</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="font-semibold truncate">100% Ad-Free</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Manipuri Apps Ecosystem (Dual Apps in 2 Columns) */}
          <div className="relative overflow-hidden rounded-3xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-gray-900/65 backdrop-blur-2xl p-4 shadow-2xs flex flex-col gap-2.5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-rose-500/10 dark:bg-rose-400/15 border border-rose-500/20 flex items-center justify-center text-rose-800 dark:text-rose-400 shrink-0">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white leading-none">
                    Manipuri Apps Ecosystem
                  </h4>
                  <span className="text-[9.5px] text-gray-400 dark:text-gray-500">
                    Free companion utilities built for the community
                  </span>
                </div>
              </div>

              <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20">
                2 Companion Apps
              </span>
            </div>

            {/* 2 Apps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* App 1: Yek Salai */}
              <a
                href="https://play.google.com/store/apps/details?id=com.yeksalaiapp"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/50 p-2.5 hover:border-rose-400/50 hover:bg-rose-50/20 dark:hover:bg-rose-950/20 transition-all flex flex-col justify-between gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-11 h-14 rounded-xl overflow-hidden shadow-2xs border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-100">
                    <img
                      src="./yek_salai_screenshot.jpeg"
                      alt="Yek Salai App"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-black text-gray-900 dark:text-white group-hover:text-rose-800 dark:group-hover:text-rose-400 transition-colors truncate leading-tight">
                      Yek Salai · Meitei Clan
                    </h5>
                    <span className="text-[8.5px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider block mt-0.5">
                      Genealogy &amp; Rules
                    </span>
                    <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-snug line-clamp-2 mt-1">
                      Identify 7 Salai, look up surnames (Yumnak), and check marriage compatibility rules (Yek Tinnaba).
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 dark:border-gray-800/60 text-[9px]">
                  <span className="text-gray-400 font-semibold">Google Play</span>
                  <span className="inline-flex items-center gap-0.5 font-bold text-rose-800 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
                    <span>View App</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </a>

              {/* App 2: Manipur Calculator */}
              <a
                href="https://play.google.com/store/apps/details?id=com.manipurcalculator.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/50 p-2.5 hover:border-rose-400/50 hover:bg-rose-50/20 dark:hover:bg-rose-950/20 transition-all flex flex-col justify-between gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-11 h-14 rounded-xl overflow-hidden shadow-2xs border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-100">
                    <img
                      src="./manipur_calculator_screenshot.jpeg"
                      alt="Manipur Calculator App"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-black text-gray-900 dark:text-white group-hover:text-rose-800 dark:group-hover:text-rose-400 transition-colors truncate leading-tight">
                      Manipur Calculator
                    </h5>
                    <span className="text-[8.5px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block mt-0.5">
                      Traditional Converters
                    </span>
                    <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-snug line-clamp-2 mt-1">
                      Land converters (Pari, Lourak, Sangam), gold units (San, Chaning, Tola), and finance tools.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 dark:border-gray-800/60 text-[9px]">
                  <span className="text-gray-400 font-semibold">Google Play</span>
                  <span className="inline-flex items-center gap-0.5 font-bold text-rose-800 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
                    <span>View App</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Card 3: Ethics & Origin (Dual Split: Why Ad-Free & Why PWA) */}
          <div className="relative overflow-hidden rounded-3xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-gray-900/65 backdrop-blur-2xl p-4 shadow-2xs">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Part A: Why Ad-Free */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-lg bg-rose-500/10 dark:bg-rose-400/15 border border-rose-500/20 flex items-center justify-center text-rose-800 dark:text-rose-400 shrink-0">
                      <Heart className="w-3 h-3 fill-current" />
                    </div>
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">
                      Why 100% Ad-Free?
                    </h4>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      'Zero full-screen or popup ads',
                      'No "Watch Ad to Continue"',
                      'Zero telemetry or hidden tracking',
                      'Respects sacred lunar time'
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-1.5 text-[10.5px] text-gray-700 dark:text-gray-300 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-rose-700 dark:text-rose-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Part B: Why PWA on iOS & Web */}
              <div className="flex flex-col justify-between sm:border-l sm:border-gray-100 sm:dark:border-gray-800/60 sm:pl-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800/60">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/20 flex items-center justify-center text-amber-800 dark:text-amber-400 shrink-0">
                      <Smartphone className="w-3 h-3" />
                    </div>
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">
                      Why PWA for iPhone &amp; Web?
                    </h4>
                  </div>

                  <p className="text-[10.5px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    Companion to our <a href="https://play.google.com/store/apps/details?id=com.manipurcalendar" target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white font-bold underline hover:text-rose-800 dark:hover:text-rose-400 transition-colors">Android app</a>. To avoid Apple’s yearly $99 developer fee for a free utility, I custom-crafted this PWA so iPhone &amp; desktop users get full offline access with zero ads.
                  </p>
                </div>

                <span className="text-[9.5px] font-bold text-amber-800 dark:text-amber-400 mt-2 block">
                  Tip: Safari 'Share' → 'Add to Home Screen'
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            RIGHT COLUMN (Col Span 5): Developer Profile, Contribute Lore & Community
            ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3 lg:gap-3.5 min-h-0">
          
          {/* Card 4: Developer Profile */}
          <div className="relative overflow-hidden rounded-3xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-gray-900/65 backdrop-blur-2xl p-4 shadow-2xs">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-800 to-amber-700 flex items-center justify-center text-white shadow-md border border-white/20 shrink-0 font-black text-sm">
                B
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                  Banishwor Athokpam
                </h4>
                <p className="text-[11px] font-bold text-rose-800 dark:text-rose-400">
                  Independent Software Engineer · Manipur
                </p>
              </div>
            </div>

            <p className="text-[10.5px] text-gray-600 dark:text-gray-300 leading-snug mb-3">
              Independent engineer building thoughtful software that solves community utility needs while preserving Manipuri traditions, script, and language.
            </p>

            {/* Interactive Social & Personal Chips */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href="https://banishwor.github.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-800/40 hover:bg-rose-500/10 hover:border-rose-400/40 text-center text-[10.5px] font-bold text-gray-700 dark:text-gray-300 hover:text-rose-800 dark:hover:text-rose-400 transition-all flex flex-col items-center gap-1 group shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors" />
                <span>Portfolio</span>
              </a>

              <a
                href="https://baniat.blogspot.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-800/40 hover:bg-rose-500/10 hover:border-rose-400/40 text-center text-[10.5px] font-bold text-gray-700 dark:text-gray-300 hover:text-rose-800 dark:hover:text-rose-400 transition-all flex flex-col items-center gap-1 group shadow-2xs"
              >
                <Rss className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors" />
                <span>Blog</span>
              </a>

              <a
                href="https://banishwor.github.io/aboutme/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-800/40 hover:bg-rose-500/10 hover:border-rose-400/40 text-center text-[10.5px] font-bold text-gray-700 dark:text-gray-300 hover:text-rose-800 dark:hover:text-rose-400 transition-all flex flex-col items-center gap-1 group shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors" />
                <span>About Me</span>
              </a>
            </div>
          </div>

          {/* Card 5: Contribute Cultural Lore & Contact Developer */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 dark:border-amber-400/20 bg-gradient-to-br from-amber-50/70 via-white/80 to-rose-50/50 dark:from-amber-950/20 dark:via-gray-900/70 dark:to-rose-950/20 backdrop-blur-2xl p-4 shadow-2xs flex flex-col gap-2.5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                    <Mail className="w-3 h-3" />
                  </div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    Contribute Lore &amp; Contact
                  </h4>
                </div>

                <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20">
                  Credit Given
                </span>
              </div>

              <p className="text-[10.5px] text-gray-600 dark:text-gray-300 leading-snug mb-2">
                Share authentic cultural lore without copyright boundaries. All contributors receive verified in-app attribution:
              </p>

              {/* Cultural Lore Topics (Clean Vector Icons, No Emojis) */}
              <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-amber-200/60 dark:border-gray-700 text-[10px] font-bold text-gray-800 dark:text-gray-200 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">ꯔꯥꯁꯤ ꯐꯜ (Rashi Fal)</span>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-amber-200/60 dark:border-gray-700 text-[10px] font-bold text-gray-800 dark:text-gray-200 shadow-2xs">
                  <Star className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span className="truncate">ꯄꯣꯛꯄ ꯅꯨꯃꯤꯠ (Pokpa)</span>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-amber-200/60 dark:border-gray-700 text-[10px] font-bold text-gray-800 dark:text-gray-200 shadow-2xs">
                  <Eye className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">ꯃꯤꯠ ꯆꯣꯡꯕ (Mit Chongba)</span>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-amber-200/60 dark:border-gray-700 text-[10px] font-bold text-gray-800 dark:text-gray-200 shadow-2xs">
                  <Lightbulb className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">Suggestions &amp; Ideas</span>
                </div>
              </div>
            </div>

            {/* Email Actions */}
            <div className="flex items-center gap-2">
              <a
                href="mailto:banishwor@outlook.com?subject=[Manipuri%20Calendar]%20Cultural%20Data%20Contribution%20/%20Feedback"
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white text-[11px] font-black shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center truncate"
              >
                <Send className="w-3 h-3 shrink-0" />
                <span className="truncate">banishwor@outlook.com</span>
              </a>

              <button
                onClick={handleCopyEmail}
                className="py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer text-[10.5px] font-bold flex items-center gap-1.5 shrink-0 bg-white/70 dark:bg-gray-800/70"
                title="Copy Email Address"
              >
                {emailCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 6: Share App with Community */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-500/20 dark:border-rose-400/20 bg-gradient-to-br from-rose-50/80 via-white/80 to-amber-50/60 dark:from-rose-950/30 dark:via-gray-900/70 dark:to-amber-950/20 backdrop-blur-2xl p-4 shadow-2xs">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/40 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <Share2 className="w-3 h-3" />
                </div>
                <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  Share With Community
                </h4>
              </div>

              <span className="text-[8.5px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20">
                Instant Link
              </span>
            </div>

            <p className="text-[10.5px] text-gray-600 dark:text-gray-300 leading-snug mb-2.5">
              Help friends, elders, and the diaspora stay connected with Manipuri sacred festivals, Tatnaba &amp; Thaban.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-850 to-rose-700 hover:from-rose-900 hover:to-rose-800 text-white text-[11px] font-black shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {shareCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Manipuri Calendar</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer bg-white/70 dark:bg-gray-800/70"
                title="Copy Web Link"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Sleek Bottom Spec Strip */}
      <div className="shrink-0 pt-2.5 mt-2.5 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-[10.5px] text-gray-400 dark:text-gray-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700 dark:text-gray-300">v2.0.0 (Build 4)</span>
          <span>·</span>
          <span>Offline Service Worker</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Mera 3424 MPK</span>
        </div>
        <div className="font-medium">
          Built with care in Manipur · ꯃꯩꯇꯩ ꯊꯥꯄꯥꯟꯂꯣꯟ
        </div>
      </div>
    </div>
  );
};
