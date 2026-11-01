import { DEFAULT_MANTRAS } from '../data/defaultMantras';
import {
  ActiveCounterState,
  DailyRecord,
  Mantra,
  Sankalpa,
  UserSettings,
} from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'japsankhya_settings_v1',
  ACTIVE_COUNTER: 'japsankhya_active_counter_v1',
  MANTRAS: 'japsankhya_mantras_v1',
  DAILY_RECORDS: 'japsankhya_daily_records_v1',
  SANKALPAS: 'japsankhya_sankalpas_v1',
  LIFETIME_STATS: 'japsankhya_lifetime_stats_v1',
};

const DEFAULT_SETTINGS: UserSettings = {
  language: 'hi',
  theme: 'light',
  malaSize: 108,
  dailyGoal: 108, // 1 Mala by default, easily adjustable to 540, 1080, etc.
  soundEnabled: true,
  soundType: 'bell',
  soundVolume: 0.8,
  hapticFeedback: 'medium',
  tanpuraDrone: false,
  tanpuraVolume: 0.35,
  screenWakeLock: true,
  autoNextMala: true,
  useHindiNumerals: false,
  vibrateOnMalaComplete: true,
  bellOnMalaComplete: true,
};

const DEFAULT_ACTIVE_STATE: ActiveCounterState = {
  mantraId: 'om-namah-shivaya',
  mode: '108_mala',
  currentBead: 0,
  completedMalas: 0,
  sessionTotalCount: 0,
  sessionStartTimestamp: Date.now(),
  sessionElapsedSeconds: 0,
  historyStack: [],
};

export const getTodayDateStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const storageService = {
  // Settings
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Error reading settings from storage', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  },

  // Active Counter State
  getActiveCounterState(): ActiveCounterState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_COUNTER);
      if (data) {
        return { ...DEFAULT_ACTIVE_STATE, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Error reading active counter', e);
    }
    return DEFAULT_ACTIVE_STATE;
  },

  saveActiveCounterState(state: ActiveCounterState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_COUNTER, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving active counter', e);
    }
  },

  // Mantras (Default + Custom)
  getMantras(): Mantra[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MANTRAS);
      if (data) {
        const stored: Mantra[] = JSON.parse(data);
        // Ensure all default mantras exist, merge any custom ones
        const defaultIds = new Set(DEFAULT_MANTRAS.map((m) => m.id));
        const customMantras = stored.filter((m) => !defaultIds.has(m.id));
        return [...DEFAULT_MANTRAS, ...customMantras];
      }
    } catch (e) {
      console.warn('Error reading mantras', e);
    }
    return DEFAULT_MANTRAS;
  },

  saveCustomMantra(mantra: Mantra): Mantra[] {
    const current = this.getMantras();
    const updated = [...current.filter((m) => m.id !== mantra.id), mantra];
    try {
      localStorage.setItem(STORAGE_KEYS.MANTRAS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving custom mantra', e);
    }
    return updated;
  },

  deleteCustomMantra(id: string): Mantra[] {
    const current = this.getMantras();
    const updated = current.filter((m) => m.id !== id || !m.isCustom);
    try {
      localStorage.setItem(STORAGE_KEYS.MANTRAS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error deleting custom mantra', e);
    }
    return updated;
  },

  // Daily Records
  getAllDailyRecords(): Record<string, DailyRecord> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading daily records', e);
    }
    return {};
  },

  getTodayRecord(): DailyRecord {
    const today = getTodayDateStr();
    const all = this.getAllDailyRecords();
    return (
      all[today] || {
        dateStr: today,
        totalJap: 0,
        malasCompleted: 0,
        mantrasBreakdown: {},
        activeSeconds: 0,
      }
    );
  },

  recordJapIncrement(mantraId: string, delta: number = 1, isMalaCompleted: boolean = false, addedSeconds: number = 1): DailyRecord {
    const today = getTodayDateStr();
    const all = this.getAllDailyRecords();
    const record = all[today] || {
      dateStr: today,
      totalJap: 0,
      malasCompleted: 0,
      mantrasBreakdown: {},
      activeSeconds: 0,
    };

    record.totalJap = Math.max(0, record.totalJap + delta);
    if (isMalaCompleted) {
      record.malasCompleted += 1;
    }
    record.activeSeconds += addedSeconds;
    record.mantrasBreakdown[mantraId] = Math.max(0, (record.mantrasBreakdown[mantraId] || 0) + delta);

    all[today] = record;
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_RECORDS, JSON.stringify(all));
    } catch (e) {
      console.error('Error writing daily record', e);
    }

    // Also update lifetime stats
    this.incrementLifetimeStats(delta, isMalaCompleted ? 1 : 0);

    // Update active sankalpas if any
    this.incrementSankalpas(delta);

    return record;
  },

  // Lifetime Stats
  getLifetimeStats(): { totalJap: number; totalMalas: number } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIFETIME_STATS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading lifetime stats', e);
    }

    // Compute from daily records if lifetime stats not yet initialized
    const all = this.getAllDailyRecords();
    let totalJap = 0;
    let totalMalas = 0;
    Object.values(all).forEach((rec) => {
      totalJap += rec.totalJap || 0;
      totalMalas += rec.malasCompleted || 0;
    });
    return { totalJap, totalMalas };
  },

  incrementLifetimeStats(deltaJap: number, deltaMalas: number = 0): void {
    const current = this.getLifetimeStats();
    const updated = {
      totalJap: Math.max(0, current.totalJap + deltaJap),
      totalMalas: Math.max(0, current.totalMalas + deltaMalas),
    };
    try {
      localStorage.setItem(STORAGE_KEYS.LIFETIME_STATS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving lifetime stats', e);
    }
  },

  // Streak Calculation
  calculateStreak(): { currentStreak: number; bestStreak: number; activeDaysCount: number } {
    const all = this.getAllDailyRecords();
    const sortedDates = Object.keys(all)
      .filter((d) => (all[d].totalJap || 0) > 0)
      .sort();

    if (sortedDates.length === 0) {
      return { currentStreak: 0, bestStreak: 0, activeDaysCount: 0 };
    }

    const today = getTodayDateStr();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    // Compute consecutive streaks
    let bestStreak = 0;
    let tempStreak = 0;
    let prevTime: number | null = null;

    for (const dateStr of sortedDates) {
      const currentTime = new Date(dateStr).getTime();
      if (prevTime === null) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((currentTime - prevTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      prevTime = currentTime;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    }

    // Current streak: does streak include today or yesterday?
    const hasToday = (all[today]?.totalJap || 0) > 0;
    const hasYesterday = (all[yesterday]?.totalJap || 0) > 0;

    let currentStreak = 0;
    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? new Date() : yesterdayDate;
      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        if ((all[dStr]?.totalJap || 0) > 0) {
          currentStreak += 1;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return {
      currentStreak,
      bestStreak: Math.max(bestStreak, currentStreak),
      activeDaysCount: sortedDates.length,
    };
  },

  // Sankalpa (Spiritual vows)
  getSankalpas(): Sankalpa[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SANKALPAS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading sankalpas', e);
    }
    // Default initial inspiring sankalpa
    const initialSankalpa: Sankalpa = {
      id: 'default-sankalpa-1',
      titleHi: '४० दिवसीय सवा लाख नाम जाप संकल्प',
      titleEn: '40-Day 125,000 Naam Jap Sankalpa',
      targetCount: 125000,
      currentCount: 0,
      startDate: getTodayDateStr(),
      targetDays: 40,
      completed: false,
      notes: 'चित्त शुद्धि एवं आत्म कल्याण हेतु लिया गया पावन संकल्प।',
    };
    return [initialSankalpa];
  },

  saveSankalpa(sankalpa: Sankalpa): Sankalpa[] {
    const list = this.getSankalpas().filter((s) => s.id !== sankalpa.id);
    list.unshift(sankalpa);
    try {
      localStorage.setItem(STORAGE_KEYS.SANKALPAS, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving sankalpa', e);
    }
    return list;
  },

  incrementSankalpas(delta: number): void {
    if (delta <= 0) return;
    const list = this.getSankalpas();
    let changed = false;
    list.forEach((s) => {
      if (!s.completed) {
        s.currentCount += delta;
        if (s.currentCount >= s.targetCount) {
          s.completed = true;
        }
        changed = true;
      }
    });
    if (changed) {
      try {
        localStorage.setItem(STORAGE_KEYS.SANKALPAS, JSON.stringify(list));
      } catch (e) {
        console.error('Error updating sankalpas', e);
      }
    }
  },

  // Export full data as JSON
  exportDataJSON(): string {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      activeCounter: this.getActiveCounterState(),
      mantras: this.getMantras(),
      dailyRecords: this.getAllDailyRecords(),
      lifetimeStats: this.getLifetimeStats(),
      sankalpas: this.getSankalpas(),
    };
    return JSON.stringify(payload, null, 2);
  },

  // Import JSON backup
  importDataJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.activeCounter) localStorage.setItem(STORAGE_KEYS.ACTIVE_COUNTER, JSON.stringify(data.activeCounter));
      if (data.mantras) localStorage.setItem(STORAGE_KEYS.MANTRAS, JSON.stringify(data.mantras));
      if (data.dailyRecords) localStorage.setItem(STORAGE_KEYS.DAILY_RECORDS, JSON.stringify(data.dailyRecords));
      if (data.lifetimeStats) localStorage.setItem(STORAGE_KEYS.LIFETIME_STATS, JSON.stringify(data.lifetimeStats));
      if (data.sankalpas) localStorage.setItem(STORAGE_KEYS.SANKALPAS, JSON.stringify(data.sankalpas));
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  // Reset all data
  resetAllData(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
