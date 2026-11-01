import React from 'react';
import {
  Moon,
  Sun,
  Smartphone,
  Maximize2,
  BookOpen,
  BarChart2,
  Settings,
  Download,
  Flame,
} from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/languageUtils';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isMobileDeviceFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenMantraLibrary: () => void;
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
  onOpenExportModal: () => void;
  streak: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  isMobileDeviceFrame,
  onToggleMobileFrame,
  onOpenMantraLibrary,
  onOpenAnalytics,
  onOpenSettings,
  onOpenExportModal,
  streak,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#FAF6EF]/90 dark:bg-[#171511]/90 border-b border-[#B89A60]/20 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-[#3C3026] via-[#C88735] to-[#B89A60] p-[2px] shadow-sm">
            <div className="w-full h-full rounded-full bg-[#FAF6EF] dark:bg-[#171511] flex items-center justify-center overflow-hidden">
              <span className="font-rozha text-xl text-[#C88735] select-none font-bold">ॐ</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center shadow-xs">
              <Flame className="w-2.5 h-2.5 text-white animate-flame" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-rozha text-xl md:text-2xl font-bold tracking-tight text-[#3C3026] dark:text-[#F0E7D8]">
                {t.appName[language]}
              </h1>
              {streak > 0 && (
                <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-500 animate-pulse" />
                  <span>{streak} {language === 'hi' ? 'दिन' : 'd'}</span>
                </div>
              )}
            </div>
            <p className="hidden sm:block text-[11px] text-[#C88735] dark:text-[#B89A60] font-medium tracking-wide">
              {t.tagline[language]}
            </p>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Mantras Library Button */}
          <button
            onClick={onOpenMantraLibrary}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F0E7D8]/80 dark:bg-[#231F1A] hover:bg-[#E2D3BE] dark:hover:bg-[#2E2922] text-[#3C3026] dark:text-[#F0E7D8] text-xs font-medium border border-[#B89A60]/30 transition-all shadow-xs"
            title={t.mantraLibrary[language]}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#C88735]" />
            <span className="hidden md:inline">{t.mantraLibrary[language]}</span>
          </button>

          {/* Analytics / History */}
          <button
            onClick={onOpenAnalytics}
            className="p-2 rounded-xl bg-[#F0E7D8]/80 dark:bg-[#231F1A] hover:bg-[#E2D3BE] dark:hover:bg-[#2E2922] text-[#3C3026] dark:text-[#F0E7D8] border border-[#B89A60]/30 transition-all shadow-xs"
            title={t.historyAndAnalytics[language]}
            aria-label="Analytics"
          >
            <BarChart2 className="w-4 h-4 text-[#C88735]" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="px-2 py-1.5 rounded-xl bg-[#C88735]/10 dark:bg-[#C88735]/20 hover:bg-[#C88735]/25 border border-[#C88735]/40 text-[#C88735] dark:text-amber-300 text-xs font-bold transition-all shadow-xs"
            title="Switch Language / भाषा बदलें"
          >
            {language === 'hi' ? 'EN' : 'हिन्दी'}
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-[#F0E7D8]/80 dark:bg-[#231F1A] hover:bg-[#E2D3BE] dark:hover:bg-[#2E2922] text-[#3C3026] dark:text-[#F0E7D8] border border-[#B89A60]/30 transition-all shadow-xs"
            title="Theme Toggle"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#3C3026]" />
            )}
          </button>

          {/* Mobile Frame Preview Toggle (for desktop testers) */}
          <button
            onClick={onToggleMobileFrame}
            className="hidden lg:flex p-2 rounded-xl bg-[#F0E7D8]/80 dark:bg-[#231F1A] hover:bg-[#E2D3BE] dark:hover:bg-[#2E2922] text-[#3C3026] dark:text-[#F0E7D8] border border-[#B89A60]/30 transition-all shadow-xs"
            title={isMobileDeviceFrame ? 'Switch to Fullscreen Responsive' : 'Switch to Mobile Device Frame Preview'}
            aria-label="Device frame toggle"
          >
            {isMobileDeviceFrame ? (
              <Maximize2 className="w-4 h-4 text-[#C88735]" />
            ) : (
              <Smartphone className="w-4 h-4 text-[#C88735]" />
            )}
          </button>

          {/* Mobile App & PWA Export Guide */}
          <button
            onClick={onOpenExportModal}
            className="p-2 rounded-xl bg-[#C88735] hover:bg-[#B45309] text-white transition-all shadow-xs flex items-center justify-center"
            title={t.mobileExport[language]}
            aria-label="Mobile Install & Export"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-[#F0E7D8]/80 dark:bg-[#231F1A] hover:bg-[#E2D3BE] dark:hover:bg-[#2E2922] text-[#3C3026] dark:text-[#F0E7D8] border border-[#B89A60]/30 transition-all shadow-xs"
            title={t.settings[language]}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-[#3C3026] dark:text-[#F0E7D8]" />
          </button>
        </div>
      </div>
    </header>
  );
};
