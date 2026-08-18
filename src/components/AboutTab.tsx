import React from 'react';
import { Award, BookOpen, Check, Heart, Shield, Star, Globe, Rss, User, Smartphone } from 'lucide-react';

export const AboutTab: React.FC = () => {
  const versionInfo = [
    { label: 'App Version', value: '2.0.0' },
    { label: 'Build Number', value: '4' },
    { label: 'Last Updated', value: 'August 2026' },
    { label: 'Developer', value: 'Banishwor Athokpam' },
    { label: 'Website', value: 'banishwor.github.io' }
  ];

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="py-2 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Information &amp; Guide</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">About the application, developer, and mission</p>
      </div>

      {/* Traditional Script Header Card with Gradient Backdrop */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-800 to-orange-700 p-6 text-white shadow-xl dark:shadow-rose-950/20">
        <div className="relative z-10 flex flex-col gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-100/80">
            MANIPURI CALENDAR
          </span>
          <h3 className="text-2xl font-black text-white">
            ꯃꯩꯇꯩ ꯊꯥꯄꯥꯟꯂꯣꯟ
          </h3>
          <p className="text-xs text-rose-100/90 font-medium mt-1">
            Preserving Meitei heritage, language, and astronomical calculations through modern technology.
          </p>
        </div>
        {/* Background glow graphics */}
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* About Me card */}
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-6 flex flex-col gap-4 shadow-sm">
        <h4 className="text-base font-extrabold text-rose-800 dark:text-rose-400 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          About Manipuri Calendar
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Manipuri Calendar is designed to provide a clean, fast, and distraction-free experience for everyone who wants quick access to the Manipuri calendar, Today's Thaban, festivals, and important dates.
        </p>

        {/* Extension of Android App / iOS Note Banner */}
        <div className="rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-800/15 dark:border-rose-400/20 p-4 flex flex-col gap-1.5">
          <span className="text-xs font-black text-rose-850 dark:text-rose-400 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-rose-800 dark:text-rose-400" />
            Why a Web App for iOS?
          </span>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            This application is a direct extension of our main <strong className="text-gray-900 dark:text-white font-bold">Manipuri Calendar Android app</strong>. As an independent developer, maintaining the mandatory yearly $99 Apple Developer subscription fee is difficult for a free community app. To ensure iOS and iPhone users don't miss out on having a fast, ad-free traditional Meitei calendar, I custom-built this full Progressive Web App (PWA) specifically for you.
          </p>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100/50 dark:border-gray-800/50">
          The goal is simple: Open the app, get the information you need instantly, and continue with your day.
        </p>
      </div>

      {/* Developer Card */}
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-6 flex flex-col gap-4 shadow-sm">
        <h4 className="text-base font-extrabold text-rose-800 dark:text-rose-400 flex items-center gap-2">
          <User className="w-4 h-4" />
          Developer Profile
        </h4>
        <div>
          <h5 className="text-md font-black text-gray-900 dark:text-white">Banishwor Athokpam</h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">Independent Software Engineer</p>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          I'm an independent developer from Manipur who enjoys building useful software that makes everyday life easier while helping preserve Manipuri culture through technology.
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          <a
            href="https://banishwor.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-rose-800/30 text-center text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-rose-800 dark:hover:text-rose-400 hover:bg-rose-500/5 transition-all flex items-center justify-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            Portfolio
          </a>
          <a
            href="https://baniat.blogspot.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-rose-800/30 text-center text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-rose-800 dark:hover:text-rose-400 hover:bg-rose-500/5 transition-all flex items-center justify-center gap-1.5"
          >
            <Rss className="w-3.5 h-3.5" />
            Blog
          </a>
          <a
            href="https://banishwor.github.io/aboutme/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-rose-800/30 text-center text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-rose-800 dark:hover:text-rose-400 hover:bg-rose-500/5 transition-all flex items-center justify-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            About Me
          </a>
        </div>
      </div>

      {/* Other Apps */}
      <div className="flex flex-col gap-4">
        <div className="py-1">
          <h4 className="text-base font-extrabold text-rose-800 dark:text-rose-400">
            My Other Apps
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Useful utilities for the Manipuri community</p>
        </div>

        {/* Yek Salai Card */}
        <a
          href="https://play.google.com/store/apps/details?id=com.yeksalaiapp"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-4 sm:p-5 flex flex-row gap-4 sm:gap-5 items-center shadow-sm hover:shadow-md hover:border-rose-800/20 transition-all group"
        >
          <div className="w-[84px] sm:w-[92px] h-[148px] sm:h-[162px] flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700/50">
            <img
              src="./yek_salai_screenshot.jpeg"
              alt="Yek Salai Screenshot"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
            <div className="flex flex-col gap-1">
              <h5 className="text-sm sm:text-base font-black text-gray-900 dark:text-white group-hover:text-rose-800 dark:group-hover:text-rose-400 transition-colors leading-snug">
                Yek Salai - Meitei Clan
              </h5>
              <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 sm:line-clamp-none">
                Identify Meitei clans (Yek/Salai), look up surnames (Yumnak/Sagei), and check traditional marriage compatibility (Yek Tinnaba / Shairuk Tinnaba).
              </p>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-800 dark:text-rose-400 text-xs font-bold border border-rose-800/10 transition-colors">
                Get on Play Store
              </span>
            </div>
          </div>
        </a>

        {/* Manipur Calculator Card */}
        <a
          href="https://play.google.com/store/apps/details?id=com.manipurcalculator.app"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-4 sm:p-5 flex flex-row gap-4 sm:gap-5 items-center shadow-sm hover:shadow-md hover:border-rose-800/20 transition-all group"
        >
          <div className="w-[84px] sm:w-[92px] h-[148px] sm:h-[162px] flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700/50">
            <img
              src="./manipur_calculator_screenshot.jpeg"
              alt="Manipur Calculator Screenshot"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
            <div className="flex flex-col gap-1">
              <h5 className="text-sm sm:text-base font-black text-gray-900 dark:text-white group-hover:text-rose-800 dark:group-hover:text-rose-400 transition-colors leading-snug">
                Manipur Calculator
              </h5>
              <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 sm:line-clamp-none">
                A comprehensive utility tool for the Manipuri community. Features traditional land unit converters (Pari, Lourak, Sangam), gold weight converters (San, Chaning, Tola), and various financial calculators.
              </p>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-800 dark:text-rose-400 text-xs font-bold border border-rose-800/10 transition-colors">
                Get on Play Store
              </span>
            </div>
          </div>
        </a>
      </div>

      {/* Mission card */}
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-6 flex flex-col gap-3 shadow-sm">
        <h4 className="text-base font-extrabold text-rose-800 dark:text-rose-400 flex items-center gap-2">
          <Award className="w-4 h-4" />
          My Mission
        </h4>
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          Technology should preserve culture, not distract from it.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          My mission is to build modern software that respects users' time while making Manipuri traditions, language, and culture more accessible to everyone. Every feature is designed with simplicity, speed, reliability, and usefulness in mind.
        </p>
      </div>

      {/* Why Ad-Free */}
      <div className="rounded-3xl border border-rose-800/20 bg-rose-500/5 p-6 flex flex-col gap-4">
        <h4 className="text-base font-extrabold text-rose-800 dark:text-rose-400 flex items-center gap-2">
          <Heart className="w-4 h-4 fill-current text-rose-800 dark:text-rose-400" />
          Why Ad-Free?
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Many calendar apps have become overloaded with intrusive advertisements. Checking Today's Thaban or the Manipuri calendar shouldn't require watching videos, closing pop-ups, or waiting for advertisements.
        </p>
        <p className="text-sm font-bold text-rose-800 dark:text-rose-400">
          This app is different.
        </p>
        <div className="flex flex-col gap-2">
          {[
            'No full-screen ads',
            'No "Watch Ad to Continue"',
            'No interruptions',
            'No unnecessary distractions'
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-350">
              <Check className="w-4 h-4 text-rose-850 dark:text-rose-400" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Just open the app and use it. Your attention is valuable, and this app respects it.
        </p>
      </div>

      {/* Privacy */}
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-6 flex flex-col gap-3 shadow-sm">
        <h4 className="text-base font-extrabold text-rose-800 dark:text-rose-400 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Privacy Assurance
        </h4>
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          Your privacy matters.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Manipuri Calendar does not require an account and does not collect unnecessary personal information. No hidden tracking. No unnecessary permissions.
        </p>
      </div>

      {/* Support development */}
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-6 flex flex-col gap-3 shadow-sm">
        <h4 className="text-base font-extrabold text-rose-800 dark:text-rose-400 flex items-center gap-2">
          <Star className="w-4 h-4 fill-current text-rose-800 dark:text-rose-400" />
          Support Development
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          If you enjoy using Manipuri Calendar, you can support its growth by:
        </p>
        <div className="flex flex-col gap-2 pl-1">
          {[
            'Leaving a positive review',
            'Sharing it with family and friends',
            'Sending suggestions or reporting issues'
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-350">
              <Star className="w-3.5 h-3.5 text-rose-800 dark:text-rose-400 fill-current" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Version Information Table */}
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-6 flex flex-col gap-4 shadow-sm">
        <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
          Version Information
        </h4>
        <div className="flex flex-col gap-3">
          {versionInfo.map((info) => (
            <div key={info.label} className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">{info.label}</span>
              <span className="font-extrabold text-gray-900 dark:text-white">{info.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer message */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
        Built with care in Manipur.
      </p>
    </div>
  );
};
