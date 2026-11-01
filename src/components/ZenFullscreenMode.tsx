import React, { useState } from 'react';
import { Minimize2, Flame, Sparkles } from 'lucide-react';
import { CountingMode, Language, Mantra, UserSettings } from '../types';
import { formatCountNumber } from '../utils/languageUtils';
import { soundService } from '../services/soundService';

interface ZenFullscreenModeProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  mantra: Mantra;
  settings: UserSettings;
  mode: CountingMode;
  currentBead: number;
  sessionTotalCount: number;
  completedMalas: number;
  onIncrement: () => void;
}

export const ZenFullscreenMode: React.FC<ZenFullscreenModeProps> = ({
  isOpen,
  onClose,
  language,
  mantra,
  settings,
  mode,
  currentBead,
  sessionTotalCount,
  completedMalas,
  onIncrement,
}) => {
  const [pulseAnimation, setPulseAnimation] = useState(false);

  if (!isOpen) return null;

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent triggering when clicking the close button
    const target = e.target as HTMLElement;
    if (target.closest('.zen-exit-btn')) return;

    setPulseAnimation(true);
    setTimeout(() => setPulseAnimation(false), 200);

    // Sound
    if (settings.soundEnabled) {
      soundService.playTapSound(settings.soundType, settings.soundVolume);
    }
    // Haptic
    soundService.triggerHaptic(settings.hapticFeedback);

    onIncrement();
  };

  const malaSize = settings.malaSize || 108;
  const count = mode === '108_mala' ? currentBead : sessionTotalCount;

  return (
    <div
      onClick={handleTap}
      onTouchStart={handleTap}
      className="fixed inset-0 z-50 bg-[#14110E] text-[#F0E7D8] flex flex-col justify-between items-center p-6 select-none cursor-pointer overflow-hidden animate-in fade-in duration-300"
    >
      {/* Background Soft Diya Glow */}
      <div
        className={`absolute rounded-full bg-[#C88735]/15 blur-3xl transition-transform duration-300 pointer-events-none ${
          pulseAnimation ? 'w-[450px] h-[450px] scale-125' : 'w-[320px] h-[320px]'
        }`}
      />

      {/* Top Bar: Mantra & Exit Button */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-[#B89A60] font-semibold">
            {language === 'hi' ? 'ध्यान कक्ष (Zen Meditation)' : 'Zen Meditation Mode'}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="zen-exit-btn p-2.5 rounded-2xl bg-[#231F1A] border border-[#B89A60]/40 text-[#F0E7D8] hover:bg-[#3C3026] transition-colors"
          title="Exit Zen Mode"
        >
          <Minimize2 className="w-4 h-4 text-[#C88735]" />
        </button>
      </div>

      {/* Center Devotional Core */}
      <div className="text-center my-auto flex flex-col items-center z-10 max-w-lg">
        {/* Sacred Flame */}
        <div className="mb-4">
          <Flame
            className={`w-12 h-12 text-amber-500 animate-flame transition-transform ${
              pulseAnimation ? 'scale-125' : ''
            }`}
          />
        </div>

        {/* Sacred Mantra Text */}
        <h2 className="font-rozha text-3xl sm:text-4xl text-[#F0E7D8] font-bold leading-relaxed mb-2 drop-shadow-md">
          {mantra.textHi}
        </h2>
        {mantra.textEn && (
          <p className="font-marcellus text-sm text-[#D4B982] italic mb-6">
            {mantra.textEn}
          </p>
        )}

        {/* Gigantic Glowing Counter Number */}
        <div className="relative flex items-center justify-center my-2">
          <span
            className={`font-rozha text-7xl sm:text-8xl font-black text-[#F59E0B] tracking-tight transition-transform duration-150 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)] ${
              pulseAnimation ? 'scale-110' : ''
            }`}
          >
            {formatCountNumber(count, settings.useHindiNumerals)}
          </span>
        </div>

        {/* Mala Progress in Zen */}
        {mode === '108_mala' ? (
          <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-[#B89A60]">
            <span>{formatCountNumber(currentBead, settings.useHindiNumerals)} / {formatCountNumber(malaSize, settings.useHindiNumerals)} {language === 'hi' ? 'मनके' : 'beads'}</span>
            <span>•</span>
            <span className="text-emerald-400">{completedMalas} {language === 'hi' ? 'माला पूर्ण' : 'malas completed'}</span>
          </div>
        ) : (
          <div className="mt-4 text-xs font-semibold text-[#B89A60]">
            <span>{Math.floor(sessionTotalCount / 108)} {language === 'hi' ? 'माला तुल्य' : 'equiv malas'}</span>
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="z-10 text-center">
        <p className="text-[11px] text-[#F0E7D8]/50 tracking-wider">
          {language === 'hi'
            ? 'स्क्रीन पर कहीं भी स्पर्श करके जाप गिनें'
            : 'Tap anywhere on the screen to count'}
        </p>
      </div>
    </div>
  );
};
