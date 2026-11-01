import React, { useState } from 'react';
import {
  X,
  Sliders,
  Volume2,
  Smartphone,
  Eye,
  RotateCcw,
  Sparkles,
  Music,
} from 'lucide-react';
import { HapticStrength, Language, SoundType, UserSettings } from '../types';
import { soundService } from '../services/soundService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleChange = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
  };

  const handleTestSound = (type: SoundType) => {
    soundService.playTapSound(type, settings.soundVolume);
  };

  const handleTestHaptic = (strength: HapticStrength) => {
    soundService.triggerHaptic(strength);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-[#FAF6EF] dark:bg-[#1E1A16] border border-[#B89A60]/40 shadow-2xl overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#B89A60]/20 bg-[#F0E7D8]/60 dark:bg-[#26201B]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#C88735]/15 text-[#C88735]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-rozha text-lg sm:text-xl font-bold text-[#3C3026] dark:text-[#F0E7D8]">
                {language === 'hi' ? 'साधना प्राथमिकताएं' : 'App Settings & Preferences'}
              </h3>
              <p className="text-xs text-[#3C3026]/70 dark:text-[#F0E7D8]/70">
                {language === 'hi'
                  ? 'ध्वनि, कंपन, माला का आकार और दैनिक लक्ष्य अनुकूलित करें'
                  : 'Customize audio, haptics, mala size, and daily targets'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#3C3026]/60 dark:text-[#F0E7D8]/60 hover:bg-[#F0E7D8] dark:hover:bg-[#2E2922] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Section 1: Mala Size & Targets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C88735] dark:text-amber-400">
              {language === 'hi' ? 'माला एवं दैनिक लक्ष्य' : 'Mala & Daily Target'}
            </h4>

            {/* Mala Size */}
            <div className="p-3.5 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/20 flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-[#3C3026] dark:text-[#F0E7D8] block">
                  {language === 'hi' ? 'माला का आकार (मनके)' : 'Mala Size (Beads)'}
                </span>
                <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60">
                  {language === 'hi' ? 'परंपरागत १०८ मनके अथवा २७/५४' : 'Traditional 108 beads or 27/54'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {[27, 54, 108].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleChange('malaSize', size)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                      settings.malaSize === size
                        ? 'bg-[#C88735] text-white shadow-xs'
                        : 'bg-[#FAF6EF] dark:bg-[#1E1A16] text-[#3C3026] dark:text-[#F0E7D8] border border-[#B89A60]/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Goal */}
            <div className="p-3.5 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-[#3C3026] dark:text-[#F0E7D8] block">
                  {language === 'hi' ? 'दैनिक लक्ष्य (मंत्र जाप)' : 'Daily Target (Jap Count)'}
                </span>
                <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60">
                  {language === 'hi' ? 'प्रतिदिन पूर्ण करने का संकल्प' : 'Target repetitions per day'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {[108, 540, 1080, 2160].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleChange('dailyGoal', goal)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                      settings.dailyGoal === goal
                        ? 'bg-[#C88735] text-white shadow-xs'
                        : 'bg-[#FAF6EF] dark:bg-[#1E1A16] text-[#3C3026] dark:text-[#F0E7D8] border border-[#B89A60]/30'
                    }`}
                  >
                    {goal} {goal === 108 ? '(1m)' : goal === 1080 ? '(10m)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Sound & Bell */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C88735] dark:text-amber-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'ध्वनि एवं मंदिर घंटी' : 'Audio & Bell Settings'}</span>
            </h4>

            {/* Sound Enabled Switch */}
            <div className="p-3.5 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/20 flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-[#3C3026] dark:text-[#F0E7D8] block">
                  {language === 'hi' ? 'जाप ध्वनि' : 'Chanting Tap Sound'}
                </span>
                <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60">
                  {language === 'hi' ? 'प्रत्येक स्पर्श पर दिव्य ध्वनि' : 'Sound on every count'}
                </span>
              </div>

              <button
                onClick={() => handleChange('soundEnabled', !settings.soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.soundEnabled ? 'bg-[#C88735]' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound Tone Selection */}
            {settings.soundEnabled && (
              <div className="p-3.5 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/20 space-y-2.5">
                <span className="text-xs sm:text-sm font-semibold text-[#3C3026] dark:text-[#F0E7D8] block">
                  {language === 'hi' ? 'ध्वनि का प्रकार' : 'Sound Tone'}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'bell' as SoundType, labelHi: '🔔 मंदिर घंटी', labelEn: '🔔 Temple Bell' },
                    { id: 'wood_click' as SoundType, labelHi: '🪵 रुद्राक्ष मनका', labelEn: '🪵 Rudraksha Click' },
                    { id: 'shankh' as SoundType, labelHi: '🐚 दिव्य शंख', labelEn: '🐚 Sacred Shankh' },
                    { id: 'om_tone' as SoundType, labelHi: '🕉️ ओंकार नाद', labelEn: '🕉️ Cosmic Om' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        handleChange('soundType', s.id);
                        handleTestSound(s.id);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                        settings.soundType === s.id
                          ? 'bg-[#C88735] text-white border-[#C88735] shadow-xs'
                          : 'bg-[#FAF6EF] dark:bg-[#1E1A16] text-[#3C3026] dark:text-[#F0E7D8] border-[#B89A60]/30'
                      }`}
                    >
                      <span>{language === 'hi' ? s.labelHi : s.labelEn}</span>
                      <Sparkles className="w-3 h-3 opacity-70" />
                    </button>
                  ))}
                </div>

                {/* Volume Slider */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-[#3C3026]/70 dark:text-[#F0E7D8]/70 mb-1">
                    <span>{language === 'hi' ? 'ध्वनि तीव्रता' : 'Volume'}</span>
                    <span>{Math.round(settings.soundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.soundVolume}
                    onChange={(e) => handleChange('soundVolume', parseFloat(e.target.value))}
                    className="w-full accent-[#C88735]"
                  />
                </div>
              </div>
            )}

            {/* Mala Completion Bell Switch */}
            <div className="p-3.5 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/20 flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-[#3C3026] dark:text-[#F0E7D8] block">
                  {language === 'hi' ? 'माला पूर्ण घंटी' : 'Mala Completion Bell'}
                </span>
                <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60">
                  {language === 'hi' ? '१०८ पूर्ण होने पर मंगल शंखनाद / घंटी' : 'Resonant bell upon reaching 108'}
                </span>
              </div>

              <button
                onClick={() => handleChange('bellOnMalaComplete', !settings.bellOnMalaComplete)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.bellOnMalaComplete ? 'bg-[#C88735]' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.bellOnMalaComplete ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 3: Vibration / Haptic */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C88735] dark:text-amber-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'स्पर्श कंपन (Haptics)' : 'Vibration Feedback'}</span>
            </h4>

            <div className="p-3.5 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/20 space-y-2">
              <span className="text-xs sm:text-sm font-semibold text-[#3C3026] dark:text-[#F0E7D8] block">
                {language === 'hi' ? 'कंपन की तीव्रता' : 'Vibration Intensity'}
              </span>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'off' as HapticStrength, labelHi: 'बंद', labelEn: 'Off' },
                  { id: 'light' as HapticStrength, labelHi: 'हल्का', labelEn: 'Light' },
                  { id: 'medium' as HapticStrength, labelHi: 'मध्यम', labelEn: 'Medium' },
                  { id: 'strong' as HapticStrength, labelHi: 'तीव्र', labelEn: 'Strong' },
                ].map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      handleChange('hapticFeedback', h.id);
                      handleTestHaptic(h.id);
                    }}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      settings.hapticFeedback === h.id
                        ? 'bg-[#C88735] text-white border-[#C88735] shadow-xs'
                        : 'bg-[#FAF6EF] dark:bg-[#1E1A16] text-[#3C3026] dark:text-[#F0E7D8] border-[#B89A60]/30'
                    }`}
                  >
                    {language === 'hi' ? h.labelHi : h.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Display & Screen */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C88735] dark:text-amber-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'प्रदर्शन एवं साधना सुगमता' : 'Display & Meditation Experience'}</span>
            </h4>

            {/* Keep Screen Awake Switch */}
            <div className="p-3.5 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/20 flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-[#3C3026] dark:text-[#F0E7D8] block">
                  {language === 'hi' ? 'स्क्रीन चालू रखें (Wake Lock)' : 'Keep Screen Awake'}
                </span>
                <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60">
                  {language === 'hi' ? 'साधना के दौरान स्क्रीन बंद नहीं होगी' : 'Prevents display sleep while chanting'}
                </span>
              </div>

              <button
                onClick={() => handleChange('screenWakeLock', !settings.screenWakeLock)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.screenWakeLock ? 'bg-[#C88735]' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.screenWakeLock ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Hindi Numerals Switch */}
            <div className="p-3.5 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/20 flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-[#3C3026] dark:text-[#F0E7D8] block">
                  {language === 'hi' ? 'देवनागरी अंक (१, २, ३...)' : 'Hindi Numerals (१, २, ३...)'}
                </span>
                <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60">
                  {language === 'hi' ? 'पारंपरिक भारतीय अंकों में प्रदर्शन' : 'Display digits in Devanagari script'}
                </span>
              </div>

              <button
                onClick={() => handleChange('useHindiNumerals', !settings.useHindiNumerals)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.useHindiNumerals ? 'bg-[#C88735]' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.useHindiNumerals ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 5: Reset Data Danger Zone */}
          <div className="pt-3 border-t border-red-500/20">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-red-500/40 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'सभी डेटा रीसेट करें (Factory Reset)' : 'Reset All App Data'}</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-2">
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                  {language === 'hi'
                    ? 'चेतावनी: आपका संपूर्ण इतिहास, संकल्प और कस्टम मंत्र मिट जाएंगे।'
                    : 'Warning: This will clear all history, vows, and custom mantras.'}
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1A16] text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    onClick={() => {
                      onResetAllData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-xs hover:bg-red-700"
                  >
                    {language === 'hi' ? 'हाँ, मिटा दें' : 'Confirm Reset'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
