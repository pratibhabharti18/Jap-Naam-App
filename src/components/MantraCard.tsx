import React, { useState } from 'react';
import { ChevronRight, Info, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Language, Mantra } from '../types';
import { t } from '../utils/languageUtils';

interface MantraCardProps {
  mantra: Mantra;
  language: Language;
  onOpenSelector: () => void;
}

export const MantraCard: React.FC<MantraCardProps> = ({
  mantra,
  language,
  onOpenSelector,
}) => {
  const [showMeaning, setShowMeaning] = useState(false);

  return (
    <div className="w-full rounded-2xl bg-[#F0E7D8]/80 dark:bg-[#231F1A] border border-[#B89A60]/35 p-3.5 sm:p-4 shadow-xs transition-all relative overflow-hidden">
      {/* Subtle traditional watermark decorative ring */}
      <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full border-4 border-[#B89A60]/10 pointer-events-none" />

      {/* Top Header: Deity & Change Mantra Button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C88735]/15 dark:bg-[#C88735]/25 border border-[#C88735]/30 text-[#C88735] dark:text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>{language === 'hi' ? mantra.deityHi : mantra.deityEn}</span>
          </span>
          <span className="text-xs text-[#3C3026]/70 dark:text-[#F0E7D8]/70 font-medium hidden sm:inline">
            • {language === 'hi' ? mantra.nameHi : mantra.nameEn}
          </span>
        </div>

        <button
          onClick={onOpenSelector}
          className="flex items-center gap-1 text-xs font-semibold text-[#C88735] hover:text-[#917540] dark:text-amber-400 dark:hover:text-amber-300 transition-colors py-1 px-2 rounded-lg hover:bg-[#C88735]/10"
        >
          <span>{t.changeMantra[language]}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sacred Mantra Text */}
      <div className="text-center py-2 px-1">
        <h2 className="font-rozha text-2xl sm:text-3xl text-[#3C3026] dark:text-[#F0E7D8] font-bold leading-relaxed tracking-wide select-none drop-shadow-xs">
          {mantra.textHi}
        </h2>
        {mantra.textEn && (
          <p className="text-xs sm:text-sm text-[#C88735] dark:text-[#D4B982] font-marcellus italic mt-1 font-medium select-none">
            {mantra.textEn}
          </p>
        )}
      </div>

      {/* Expandable Spiritual Meaning */}
      <div className="mt-2 pt-2 border-t border-[#B89A60]/20 flex flex-col items-center">
        <button
          onClick={() => setShowMeaning(!showMeaning)}
          className="flex items-center gap-1 text-[11px] text-[#3C3026]/70 dark:text-[#F0E7D8]/70 hover:text-[#C88735] dark:hover:text-amber-300 font-medium transition-colors"
        >
          <Info className="w-3 h-3 text-[#C88735]" />
          <span>{language === 'hi' ? 'मंत्र का दिव्य भावार्थ' : 'Spiritual Meaning & Essence'}</span>
          {showMeaning ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showMeaning && (
          <div className="mt-2 text-xs text-center text-[#3C3026]/90 dark:text-[#F0E7D8]/90 bg-[#FAF6EF]/70 dark:bg-[#171511]/70 p-2.5 rounded-xl border border-[#B89A60]/25 max-w-xl animate-in fade-in duration-200">
            {language === 'hi' ? mantra.meaningHi : mantra.meaningEn}
          </div>
        )}
      </div>
    </div>
  );
};
