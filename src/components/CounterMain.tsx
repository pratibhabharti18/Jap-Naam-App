import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Undo2,
  Volume2,
  VolumeX,
  Music,
  Maximize2,
  Flame,
  CheckCircle,
  Timer,
  Zap,
} from 'lucide-react';
import { CountingMode, Language, UserSettings } from '../types';
import { formatCountNumber, formatDuration, t } from '../utils/languageUtils';
import { RudrakshaMalaVisualizer } from './RudrakshaMalaVisualizer';
import { soundService } from '../services/soundService';

interface CounterMainProps {
  language: Language;
  settings: UserSettings;
  mode: CountingMode;
  onChangeMode: (mode: CountingMode) => void;
  currentBead: number;
  completedMalas: number;
  sessionTotalCount: number;
  onIncrement: () => void;
  onUndo: () => void;
  onReset: () => void;
  onOpenZenMode: () => void;
  sessionElapsedSeconds: number;
}

export const CounterMain: React.FC<CounterMainProps> = ({
  language,
  settings,
  mode,
  onChangeMode,
  currentBead,
  completedMalas,
  sessionTotalCount,
  onIncrement,
  onUndo,
  onReset,
  onOpenZenMode,
  sessionElapsedSeconds,
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [tapRipples, setTapRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [tanpuraActive, setTanpuraActive] = useState(false);
  const [soundMuted, setSoundMuted] = useState(!settings.soundEnabled);
  const [lastMilestoneToast, setLastMilestoneToast] = useState<string | null>(null);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const malaSize = settings.malaSize || 108;
  const remainingBeads = Math.max(0, malaSize - currentBead);

  // Chant speed (Japs per minute)
  const chantSpeed = sessionElapsedSeconds > 5 && sessionTotalCount > 0
    ? Math.round((sessionTotalCount / sessionElapsedSeconds) * 60)
    : 0;

  // Sync sound muted state if settings change
  useEffect(() => {
    setSoundMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Handle Tanpura drone toggle
  const handleToggleTanpura = () => {
    const nextState = soundService.toggleTanpuraDrone(settings.tanpuraVolume || 0.35);
    setTanpuraActive(nextState);
  };

  // Trigger tap event
  const handleTap = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    // Determine tap location for ripple
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      let clientX = rect.left + rect.width / 2;
      let clientY = rect.top + rect.height / 2;

      if ('clientX' in e && e.clientX) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if ('touches' in e && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const newRipple = { id: Date.now(), x, y };
      setTapRipples((prev) => [...prev.slice(-3), newRipple]);
    }

    // Sound feedback
    if (!soundMuted) {
      soundService.playTapSound(settings.soundType, settings.soundVolume);
    }

    // Haptic feedback
    soundService.triggerHaptic(settings.hapticFeedback);

    // Check if this tap completes a mala (in Mode A)
    const nextBead = currentBead + 1;
    if (mode === '108_mala' && nextBead >= malaSize) {
      // Trigger mala completion celebrations!
      handleMalaCelebration();
    } else if (mode === 'continuous' && (sessionTotalCount + 1) % 100 === 0) {
      // 100-chant milestone toast in continuous mode
      showMilestoneMessage(`${sessionTotalCount + 1} ${language === 'hi' ? 'जाप पूर्ण!' : 'Chants Complete!'}`);
    }

    // Increment counter
    onIncrement();
  };

  const showMilestoneMessage = (msg: string) => {
    setLastMilestoneToast(msg);
    setTimeout(() => {
      setLastMilestoneToast(null);
    }, 2800);
  };

  const handleMalaCelebration = () => {
    // 1. Play temple bell
    if (settings.bellOnMalaComplete && !soundMuted) {
      soundService.playMalaCompletionBell(settings.soundVolume);
    }
    // 2. Heavy vibration
    if (settings.vibrateOnMalaComplete) {
      soundService.triggerHaptic(settings.hapticFeedback, true);
    }
    // 3. Sacred Gold & Saffron Confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#C88735', '#B89A60', '#FDE68A', '#DC2626'],
      });
    } catch {
      // In case canvas not accessible
    }
    // 4. Milestone toast
    showMilestoneMessage(
      language === 'hi'
        ? `🌺 १ माला पूर्ण! (${completedMalas + 1} पूर्ण माला)`
        : `🌺 1 Mala Completed! (${completedMalas + 1} total)`
    );
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center p-1 rounded-2xl bg-[#F0E7D8]/80 dark:bg-[#231F1A] border border-[#B89A60]/30 shadow-xs mb-4">
        <button
          onClick={() => onChangeMode('108_mala')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            mode === '108_mala'
              ? 'bg-gradient-to-r from-[#C88735] to-[#B89A60] text-white shadow-xs'
              : 'text-[#3C3026]/75 dark:text-[#F0E7D8]/75 hover:text-[#C88735]'
          }`}
        >
          {t.modeA[language]}
        </button>
        <button
          onClick={() => onChangeMode('continuous')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            mode === 'continuous'
              ? 'bg-gradient-to-r from-[#C88735] to-[#B89A60] text-white shadow-xs'
              : 'text-[#3C3026]/75 dark:text-[#F0E7D8]/75 hover:text-[#C88735]'
          }`}
        >
          {t.modeB[language]}
        </button>
      </div>

      {/* Milestone / Mala Celebratory Toast */}
      {lastMilestoneToast && (
        <div className="mb-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-amber-500/20 border border-amber-500/50 text-[#C88735] dark:text-amber-300 text-xs font-bold animate-bounce shadow-md">
          {lastMilestoneToast}
        </div>
      )}

      {/* Mode A: Mala Progress Info Bar */}
      {mode === '108_mala' ? (
        <div className="flex items-center justify-center gap-6 mb-3 text-xs sm:text-sm">
          <div className="text-center">
            <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60 font-medium block">
              {t.malaProgress[language]}
            </span>
            <span className="font-rozha text-base sm:text-lg font-bold text-[#C88735] dark:text-amber-400">
              {formatCountNumber(currentBead, settings.useHindiNumerals)} / {formatCountNumber(malaSize, settings.useHindiNumerals)}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[#B89A60]/30" />

          <div className="text-center">
            <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60 font-medium block">
              {t.remainingBeads[language]}
            </span>
            <span className="font-rozha text-base sm:text-lg font-bold text-[#3C3026] dark:text-[#F0E7D8]">
              {formatCountNumber(remainingBeads, settings.useHindiNumerals)}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[#B89A60]/30" />

          <div className="text-center">
            <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60 font-medium block">
              {t.completedMalas[language]}
            </span>
            <span className="font-rozha text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatCountNumber(completedMalas, settings.useHindiNumerals)}
            </span>
          </div>
        </div>
      ) : (
        /* Mode B: Continuous Stats Bar */
        <div className="flex items-center justify-center gap-6 mb-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 text-center">
            <Timer className="w-3.5 h-3.5 text-[#C88735]" />
            <span className="font-mono text-xs sm:text-sm font-semibold text-[#3C3026] dark:text-[#F0E7D8]">
              {formatDuration(sessionElapsedSeconds)}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[#B89A60]/30" />

          <div className="flex items-center gap-1.5 text-center">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs sm:text-sm font-semibold text-[#3C3026] dark:text-[#F0E7D8]">
              {formatCountNumber(chantSpeed, settings.useHindiNumerals)} {language === 'hi' ? 'जाप/मिनट' : 'jap/min'}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[#B89A60]/30" />

          <div className="text-center">
            <span className="text-xs sm:text-sm font-semibold text-[#C88735] dark:text-amber-400">
              {Math.floor(sessionTotalCount / 108)} {language === 'hi' ? 'माला तुल्य' : 'equiv malas'}
            </span>
          </div>
        </div>
      )}

      {/* Central Counting Stage with 108 Rudraksha Bead Visualizer */}
      <div className="relative my-2 sm:my-4 flex items-center justify-center">
        {/* Background Visualizer (Beads) */}
        {settings.showBeadAnimation !== false && mode === '108_mala' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <RudrakshaMalaVisualizer
              currentBead={currentBead}
              malaSize={malaSize}
            />
          </div>
        )}

        {/* Ambient Diya / Lotus Aura Glow */}
        <div
          className={`absolute rounded-full transition-all duration-300 pointer-events-none ${
            isPressing
              ? 'w-64 h-64 bg-[#C88735]/35 blur-2xl scale-110'
              : 'w-56 h-56 bg-amber-500/15 blur-xl'
          }`}
        />

        {/* The Big Circular Touch Button */}
        <button
          ref={buttonRef}
          type="button"
          onMouseDown={() => setIsPressing(true)}
          onMouseUp={() => setIsPressing(false)}
          onTouchStart={() => setIsPressing(true)}
          onTouchEnd={() => setIsPressing(false)}
          onClick={handleTap}
          className={`relative z-10 w-52 h-52 sm:w-60 sm:h-60 rounded-full flex flex-col items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer overflow-hidden border-4 border-[#B89A60]/40 dark:border-[#B89A60]/50 ${
            isPressing
              ? 'scale-[0.96] ring-8 ring-[#C88735]/30'
              : 'hover:scale-[1.01]'
          }`}
          style={{
            background:
              'radial-gradient(circle at 35% 30%, #FAF6EF 0%, #F0E7D8 45%, #E0D0B8 75%, #C8B291 100%)',
          }}
          aria-label={t.tapToChant[language]}
        >
          {/* Dark Mode Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2E2822] via-[#201B16] to-[#14110E] opacity-0 dark:opacity-100 transition-opacity" />

          {/* Golden Rim / Decorative Mandala Rings */}
          <div className="absolute inset-2 rounded-full border border-[#B89A60]/40 pointer-events-none" />
          <div className="absolute inset-4 rounded-full border border-dashed border-[#B89A60]/30 pointer-events-none" />

          {/* Ripple Visuals */}
          {tapRipples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-[#C88735]/25 pointer-events-none animate-ping"
              style={{
                left: ripple.x - 40,
                top: ripple.y - 40,
                width: 80,
                height: 80,
                animationDuration: '500ms',
              }}
            />
          ))}

          {/* Central Sacred Flame & Diya */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-1">
              <Flame
                className={`w-8 h-8 sm:w-9 sm:h-9 text-amber-500 animate-flame transition-transform ${
                  isPressing ? 'scale-125' : ''
                }`}
              />
              <div className="absolute -inset-1 rounded-full bg-amber-400/30 blur-xs -z-10" />
            </div>

            {/* Counter Value */}
            <span
              className="font-rozha text-5xl sm:text-6xl font-bold tracking-tight text-[#3C3026] dark:text-[#F0E7D8] drop-shadow-xs transition-transform"
            >
              {formatCountNumber(
                mode === '108_mala' ? currentBead : sessionTotalCount,
                settings.useHindiNumerals
              )}
            </span>

            {/* Label Underneath */}
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#C88735] dark:text-amber-300 mt-0.5">
              {mode === '108_mala'
                ? (language === 'hi' ? 'मनका (Bead)' : 'Mala Bead')
                : (language === 'hi' ? 'कुल जाप' : 'Total Jap')}
            </span>

            <span className="text-[10px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60 mt-0.5">
              {t.tapToChant[language]}
            </span>
          </div>
        </button>
      </div>

      {/* Control Buttons Bar */}
      <div className="flex items-center gap-2 sm:gap-3 mt-3">
        {/* Undo Button */}
        <button
          onClick={onUndo}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#F0E7D8]/80 dark:bg-[#231F1A] hover:bg-[#E2D3BE] dark:hover:bg-[#2E2922] text-[#3C3026] dark:text-[#F0E7D8] border border-[#B89A60]/30 text-xs font-medium transition-all shadow-xs active:scale-95"
          title={t.undo[language]}
        >
          <Undo2 className="w-3.5 h-3.5 text-[#C88735]" />
          <span>{t.undo[language]}</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={() => setShowResetModal(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#F0E7D8]/80 dark:bg-[#231F1A] hover:bg-[#E2D3BE] dark:hover:bg-[#2E2922] text-[#3C3026] dark:text-[#F0E7D8] border border-[#B89A60]/30 text-xs font-medium transition-all shadow-xs active:scale-95"
          title={t.reset[language]}
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#C88735]" />
          <span>{t.reset[language]}</span>
        </button>

        {/* Sound Mute/Unmute */}
        <button
          onClick={() => setSoundMuted(!soundMuted)}
          className={`p-2 rounded-xl border border-[#B89A60]/30 transition-all shadow-xs active:scale-95 ${
            !soundMuted
              ? 'bg-[#C88735]/15 text-[#C88735] dark:text-amber-400'
              : 'bg-[#F0E7D8]/80 dark:bg-[#231F1A] text-[#3C3026]/50 dark:text-[#F0E7D8]/50'
          }`}
          title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Tanpura Drone Ambient Toggle */}
        <button
          onClick={handleToggleTanpura}
          className={`flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-medium transition-all shadow-xs active:scale-95 ${
            tanpuraActive
              ? 'bg-[#C88735] text-white border-[#C88735] animate-pulse'
              : 'bg-[#F0E7D8]/80 dark:bg-[#231F1A] text-[#3C3026] dark:text-[#F0E7D8] border-[#B89A60]/30'
          }`}
          title={t.tanpuraDrone[language]}
        >
          <Music className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.tanpuraDrone[language]}</span>
          <span className="sm:hidden">{language === 'hi' ? 'तानपुरा' : 'Drone'}</span>
        </button>

        {/* Zen Fullscreen Mode */}
        <button
          onClick={onOpenZenMode}
          className="p-2 rounded-xl bg-[#F0E7D8]/80 dark:bg-[#231F1A] hover:bg-[#E2D3BE] dark:hover:bg-[#2E2922] text-[#3C3026] dark:text-[#F0E7D8] border border-[#B89A60]/30 transition-all shadow-xs active:scale-95"
          title={t.zenMode[language]}
        >
          <Maximize2 className="w-4 h-4 text-[#C88735]" />
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#FAF6EF] dark:bg-[#231F1A] border border-[#B89A60]/40 p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6 text-[#C88735] dark:text-amber-400" />
            </div>

            <h3 className="font-rozha text-lg font-bold text-[#3C3026] dark:text-[#F0E7D8]">
              {language === 'hi' ? 'क्या आप गणक रीसेट करना चाहते हैं?' : 'Reset Current Jap Counter?'}
            </h3>

            <p className="text-xs text-[#3C3026]/75 dark:text-[#F0E7D8]/75 mt-2 leading-relaxed">
              {language === 'hi'
                ? 'वर्तमान माला की गणना ० पर आ जाएगी। आपकी आज की संचित साधना और इतिहास सुरक्षित रहेगा।'
                : 'Current counter will reset to 0. Your saved daily totals and spiritual history remain safe.'}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowResetModal(false)}
                className="py-2.5 px-4 rounded-xl bg-[#F0E7D8] dark:bg-[#1D1814] text-[#3C3026] dark:text-[#F0E7D8] text-xs font-semibold hover:bg-[#E2D3BE] transition-colors"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onReset();
                  setShowResetModal(false);
                }}
                className="py-2.5 px-4 rounded-xl bg-[#C88735] hover:bg-[#B45309] text-white text-xs font-semibold transition-colors shadow-sm"
              >
                {language === 'hi' ? 'हाँ, रीसेट करें' : 'Yes, Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
