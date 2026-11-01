export type Language = 'hi' | 'en';

export type CountingMode = '108_mala' | 'continuous';

export type SoundType = 'bell' | 'wood_click' | 'shankh' | 'om_tone';

export type HapticStrength = 'off' | 'light' | 'medium' | 'strong';

export interface Mantra {
  id: string;
  nameHi: string;
  nameEn: string;
  textHi: string;
  textEn: string;
  meaningHi: string;
  meaningEn: string;
  deityHi: string;
  deityEn: string;
  category: 'vedic' | 'shiva' | 'krishna' | 'devi' | 'ram' | 'ganesha' | 'hanuman' | 'buddhist' | 'custom';
  isCustom?: boolean;
}

export interface CountingSessionRecord {
  id: string;
  timestamp: number;
  mantraId: string;
  mantraName: string;
  mode: CountingMode;
  count: number;
  malasCompleted: number;
  durationSeconds: number;
  dateStr: string; // YYYY-MM-DD
}

export interface DailyRecord {
  dateStr: string; // YYYY-MM-DD
  totalJap: number;
  malasCompleted: number;
  mantrasBreakdown: Record<string, number>;
  activeSeconds: number;
}

export interface Sankalpa {
  id: string;
  titleHi: string;
  titleEn: string;
  targetCount: number;
  currentCount: number;
  startDate: string;
  targetDays: number;
  completed: boolean;
  notes?: string;
}

export interface UserSettings {
  language: Language;
  theme: 'light' | 'dark';
  malaSize: number; // default 108
  dailyGoal: number; // default 1080 (10 malas) or 108
  soundEnabled: boolean;
  soundType: SoundType;
  soundVolume: number; // 0 to 1
  hapticFeedback: HapticStrength;
  tanpuraDrone: boolean;
  tanpuraVolume: number;
  screenWakeLock: boolean;
  autoNextMala: boolean;
  useHindiNumerals: boolean;
  vibrateOnMalaComplete: boolean;
  bellOnMalaComplete: boolean;
  showBeadAnimation?: boolean;
}

export interface ActiveCounterState {
  mantraId: string;
  mode: CountingMode;
  currentBead: number; // 0 to malaSize
  completedMalas: number;
  sessionTotalCount: number;
  sessionStartTimestamp: number;
  sessionElapsedSeconds: number;
  historyStack: number[]; // For undo functionality
}
