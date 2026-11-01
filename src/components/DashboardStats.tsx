import React from 'react';
import { Flame, CheckCircle2, Target, Award, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { formatCountNumber, getSpiritualGreeting, t } from '../utils/languageUtils';

interface DashboardStatsProps {
  language: Language;
  todayJap: number;
  dailyGoal: number;
  todayMalas: number;
  lifetimeJap: number;
  currentStreak: number;
  useHindiNumerals: boolean;
  onOpenGoalSetting: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  language,
  todayJap,
  dailyGoal,
  todayMalas,
  lifetimeJap,
  currentStreak,
  useHindiNumerals,
  onOpenGoalSetting,
}) => {
  const { greeting, subtitle } = getSpiritualGreeting(language);
  const goalPercentage = Math.min(100, Math.round((todayJap / Math.max(1, dailyGoal)) * 100));

  return (
    <div className="w-full space-y-3">
      {/* Devotional Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F0E7D8] via-[#FAF6EF] to-[#F0E7D8] dark:from-[#231F1A] dark:via-[#1D1915] dark:to-[#231F1A] p-3.5 border border-[#B89A60]/30 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[#C88735] dark:text-[#E09E4F] font-rozha text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{greeting}</span>
            </div>
            <p className="text-xs text-[#3C3026]/80 dark:text-[#F0E7D8]/80 font-medium mt-0.5">
              {subtitle}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60 font-medium block">
              {language === 'hi' ? 'आज का दिन' : 'Current Date'}
            </span>
            <span className="text-xs font-semibold text-[#3C3026] dark:text-[#F0E7D8]">
              {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Key Spiritual Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Today's Jap Card */}
        <div
          onClick={onOpenGoalSetting}
          className="group cursor-pointer rounded-2xl bg-[#F0E7D8]/70 dark:bg-[#231F1A] p-3 border border-[#B89A60]/25 hover:border-[#C88735]/60 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between text-[#C88735] dark:text-amber-400 mb-1">
            <span className="text-[11px] font-medium text-[#3C3026]/75 dark:text-[#F0E7D8]/75">
              {t.todayJap[language]}
            </span>
            <Target className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-rozha text-[#3C3026] dark:text-[#F0E7D8]">
              {formatCountNumber(todayJap, useHindiNumerals)}
            </span>
            <span className="text-[11px] text-[#3C3026]/50 dark:text-[#F0E7D8]/50">
              / {formatCountNumber(dailyGoal, useHindiNumerals)}
            </span>
          </div>
          {/* Goal Progress Bar */}
          <div className="mt-2 w-full bg-[#FAF6EF] dark:bg-[#171511] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C88735] to-[#F59E0B] rounded-full transition-all duration-500"
              style={{ width: `${goalPercentage}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-[#C88735] dark:text-amber-400 font-medium">
            <span>{goalPercentage}% {language === 'hi' ? 'लक्ष्य' : 'goal'}</span>
            <span>{language === 'hi' ? 'बदलें' : 'edit'}</span>
          </div>
        </div>

        {/* Completed Malas Card */}
        <div className="rounded-2xl bg-[#F0E7D8]/70 dark:bg-[#231F1A] p-3 border border-[#B89A60]/25 shadow-xs">
          <div className="flex items-center justify-between text-[#C88735] dark:text-amber-400 mb-1">
            <span className="text-[11px] font-medium text-[#3C3026]/75 dark:text-[#F0E7D8]/75">
              {t.completedMalas[language]}
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-rozha text-[#3C3026] dark:text-[#F0E7D8]">
              {formatCountNumber(todayMalas, useHindiNumerals)}
            </span>
            <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60">
              {language === 'hi' ? 'माला' : 'malas'}
            </span>
          </div>
          <p className="mt-2 text-[10px] text-emerald-700 dark:text-emerald-300 font-medium truncate">
            {todayMalas > 0
              ? `${formatCountNumber(todayMalas * 108, useHindiNumerals)} ${language === 'hi' ? 'मंत्र पूर्ण' : 'mantras'}`
              : (language === 'hi' ? 'प्रारंभ करें' : 'Start chanting')}
          </p>
        </div>

        {/* Lifetime Jap Card */}
        <div className="rounded-2xl bg-[#F0E7D8]/70 dark:bg-[#231F1A] p-3 border border-[#B89A60]/25 shadow-xs">
          <div className="flex items-center justify-between text-[#C88735] dark:text-amber-400 mb-1">
            <span className="text-[11px] font-medium text-[#3C3026]/75 dark:text-[#F0E7D8]/75">
              {t.lifetimeJap[language]}
            </span>
            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-rozha text-[#3C3026] dark:text-[#F0E7D8]">
              {formatCountNumber(lifetimeJap, useHindiNumerals)}
            </span>
          </div>
          <p className="mt-2 text-[10px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60 font-medium">
            {Math.floor(lifetimeJap / 108)} {language === 'hi' ? 'माला कुल' : 'total malas'}
          </p>
        </div>

        {/* Sadhana Streak Card */}
        <div className="rounded-2xl bg-[#F0E7D8]/70 dark:bg-[#231F1A] p-3 border border-[#B89A60]/25 shadow-xs">
          <div className="flex items-center justify-between text-[#C88735] dark:text-amber-400 mb-1">
            <span className="text-[11px] font-medium text-[#3C3026]/75 dark:text-[#F0E7D8]/75">
              {t.streakDays[language]}
            </span>
            <Flame className="w-3.5 h-3.5 text-orange-500 animate-flame" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-rozha text-[#C88735] dark:text-amber-400">
              {formatCountNumber(currentStreak, useHindiNumerals)}
            </span>
            <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60">
              {language === 'hi' ? 'दिन' : 'days'}
            </span>
          </div>
          <p className="mt-2 text-[10px] text-[#C88735] dark:text-amber-300 font-medium truncate">
            {currentStreak > 0
              ? (language === 'hi' ? 'साधना अखंडित' : 'Streak alive')
              : (language === 'hi' ? 'आज जप करें' : 'Chant today')}
          </p>
        </div>
      </div>
    </div>
  );
};
