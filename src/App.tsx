/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ActiveCounterState,
  CountingMode,
  DailyRecord,
  Language,
  Mantra,
  Sankalpa,
  UserSettings,
} from './types';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { MantraCard } from './components/MantraCard';
import { CounterMain } from './components/CounterMain';
import { MantraLibraryModal } from './components/MantraLibraryModal';
import { SpiritualAnalyticsModal } from './components/SpiritualAnalyticsModal';
import { SettingsModal } from './components/SettingsModal';
import { NativeExportModal } from './components/NativeExportModal';
import { ZenFullscreenMode } from './components/ZenFullscreenMode';

export default function App() {
  // 1. Settings & Preferences
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState<boolean>(false);

  // 2. Active Counter State
  const [activeCounter, setActiveCounter] = useState<ActiveCounterState>(() =>
    storageService.getActiveCounterState()
  );

  // 3. Mantras Data
  const [mantras, setMantras] = useState<Mantra[]>(() => storageService.getMantras());

  // 4. Daily & Lifetime Records
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyRecord>>(() =>
    storageService.getAllDailyRecords()
  );
  const [lifetimeStats, setLifetimeStats] = useState(() => storageService.getLifetimeStats());
  const [streakData, setStreakData] = useState(() => storageService.calculateStreak());
  const [sankalpas, setSankalpas] = useState<Sankalpa[]>(() => storageService.getSankalpas());

  // 5. Modals State
  const [isMantraLibraryOpen, setIsMantraLibraryOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isZenModeOpen, setIsZenModeOpen] = useState(false);

  // 6. Session Timer
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Sync theme with DOM root
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Screen Wake-Lock API integration
  useEffect(() => {
    const requestWakeLock = async () => {
      if (settings.screenWakeLock && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch {
          // Wake lock might fail if tab is not visible
        }
      }
    };
    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [settings.screenWakeLock]);

  // Session elapsed timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save active state to storage on changes
  useEffect(() => {
    storageService.saveActiveCounterState(activeCounter);
  }, [activeCounter]);

  // Active Selected Mantra
  const activeMantra =
    mantras.find((m) => m.id === activeCounter.mantraId) || mantras[0];

  const todayRecord = storageService.getTodayRecord();

  // Handler: Increment Tap
  const handleIncrement = () => {
    const malaSize = settings.malaSize || 108;
    const isModeMala = activeCounter.mode === '108_mala';

    let nextBead = activeCounter.currentBead + 1;
    let nextCompletedMalas = activeCounter.completedMalas;
    let isMalaCompletedNow = false;

    if (isModeMala) {
      if (nextBead >= malaSize) {
        nextCompletedMalas += 1;
        isMalaCompletedNow = true;
        nextBead = 0; // Automatically reset for next mala
      }
    }

    const nextTotal = activeCounter.sessionTotalCount + 1;

    // Push previous state for undo capability
    const nextHistoryStack = [
      ...activeCounter.historyStack.slice(-50),
      activeCounter.currentBead,
    ];

    setActiveCounter((prev) => ({
      ...prev,
      currentBead: nextBead,
      completedMalas: nextCompletedMalas,
      sessionTotalCount: nextTotal,
      historyStack: nextHistoryStack,
    }));

    // Record persistent data in database
    storageService.recordJapIncrement(
      activeMantra.id,
      1,
      isMalaCompletedNow,
      1
    );

    // Refresh metrics in state
    setDailyRecords(storageService.getAllDailyRecords());
    setLifetimeStats(storageService.getLifetimeStats());
    setStreakData(storageService.calculateStreak());
    setSankalpas(storageService.getSankalpas());
  };

  // Handler: Undo Last Tap
  const handleUndo = () => {
    if (activeCounter.sessionTotalCount <= 0 && activeCounter.currentBead <= 0) {
      return;
    }

    const malaSize = settings.malaSize || 108;
    const stack = [...activeCounter.historyStack];
    const prevBead = stack.pop();

    let newBead = activeCounter.currentBead - 1;
    let newCompleted = activeCounter.completedMalas;

    if (prevBead !== undefined) {
      newBead = prevBead;
    } else if (newBead < 0) {
      if (newCompleted > 0) {
        newCompleted -= 1;
        newBead = malaSize - 1;
      } else {
        newBead = 0;
      }
    }

    setActiveCounter((prev) => ({
      ...prev,
      currentBead: Math.max(0, newBead),
      completedMalas: Math.max(0, newCompleted),
      sessionTotalCount: Math.max(0, prev.sessionTotalCount - 1),
      historyStack: stack,
    }));

    // Rollback record in database
    storageService.recordJapIncrement(activeMantra.id, -1, false, 0);
    setDailyRecords(storageService.getAllDailyRecords());
    setLifetimeStats(storageService.getLifetimeStats());
    setStreakData(storageService.calculateStreak());
  };

  // Handler: Reset Active Counter
  const handleReset = () => {
    setActiveCounter((prev) => ({
      ...prev,
      currentBead: 0,
      sessionTotalCount: 0,
      historyStack: [],
    }));
  };

  // Handler: Change Counting Mode
  const handleChangeMode = (mode: CountingMode) => {
    setActiveCounter((prev) => ({
      ...prev,
      mode,
    }));
  };

  // Handler: Select Mantra
  const handleSelectMantra = (mantra: Mantra) => {
    setActiveCounter((prev) => ({
      ...prev,
      mantraId: mantra.id,
    }));
  };

  // Handler: Add Custom Mantra
  const handleAddCustomMantra = (customMantra: Mantra) => {
    const updated = storageService.saveCustomMantra(customMantra);
    setMantras(updated);
  };

  // Handler: Delete Custom Mantra
  const handleDeleteCustomMantra = (id: string) => {
    const updated = storageService.deleteCustomMantra(id);
    setMantras(updated);
    if (activeCounter.mantraId === id) {
      setActiveCounter((prev) => ({
        ...prev,
        mantraId: updated[0].id,
      }));
    }
  };

  // Handler: Update User Settings
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  // Handler: Reset All Data (Factory Reset)
  const handleResetAllData = () => {
    storageService.resetAllData();
    setSettings(storageService.getSettings());
    setActiveCounter(storageService.getActiveCounterState());
    setMantras(storageService.getMantras());
    setDailyRecords({});
    setLifetimeStats({ totalJap: 0, totalMalas: 0 });
    setStreakData({ currentStreak: 0, bestStreak: 0, activeDaysCount: 0 });
    setSankalpas(storageService.getSankalpas());
  };

  // Refresh all state from storage (used after backup import)
  const refreshAllData = () => {
    setSettings(storageService.getSettings());
    setActiveCounter(storageService.getActiveCounterState());
    setMantras(storageService.getMantras());
    setDailyRecords(storageService.getAllDailyRecords());
    setLifetimeStats(storageService.getLifetimeStats());
    setStreakData(storageService.calculateStreak());
    setSankalpas(storageService.getSankalpas());
  };

  // App Body
  const appContent = (
    <div className="min-h-full flex flex-col bg-[#FAF6EF] dark:bg-[#171511] text-[#3C3026] dark:text-[#F0E7D8] transition-colors pb-10">
      {/* Top Header */}
      <Header
        language={settings.language}
        onToggleLanguage={() =>
          handleUpdateSettings({
            ...settings,
            language: settings.language === 'hi' ? 'en' : 'hi',
          })
        }
        theme={settings.theme}
        onToggleTheme={() =>
          handleUpdateSettings({
            ...settings,
            theme: settings.theme === 'dark' ? 'light' : 'dark',
          })
        }
        isMobileDeviceFrame={isMobileDeviceFrame}
        onToggleMobileFrame={() => setIsMobileDeviceFrame(!isMobileDeviceFrame)}
        onOpenMantraLibrary={() => setIsMantraLibraryOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
        streak={streakData.currentStreak}
      />

      {/* Main Devotional Workspace */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-3 sm:pt-4 flex flex-col gap-3.5">
        {/* Devotional Greeting & Key Metrics Cards */}
        <DashboardStats
          language={settings.language}
          todayJap={todayRecord.totalJap}
          dailyGoal={settings.dailyGoal}
          todayMalas={todayRecord.malasCompleted}
          lifetimeJap={lifetimeStats.totalJap}
          currentStreak={streakData.currentStreak}
          useHindiNumerals={settings.useHindiNumerals}
          onOpenGoalSetting={() => setIsSettingsOpen(true)}
        />

        {/* Selected Mantra Display Card */}
        <MantraCard
          mantra={activeMantra}
          language={settings.language}
          onOpenSelector={() => setIsMantraLibraryOpen(true)}
        />

        {/* The Central Counting Button & Controls */}
        <CounterMain
          language={settings.language}
          settings={settings}
          mode={activeCounter.mode}
          onChangeMode={handleChangeMode}
          currentBead={activeCounter.currentBead}
          completedMalas={activeCounter.completedMalas}
          sessionTotalCount={activeCounter.sessionTotalCount}
          onIncrement={handleIncrement}
          onUndo={handleUndo}
          onReset={handleReset}
          onOpenZenMode={() => setIsZenModeOpen(true)}
          sessionElapsedSeconds={sessionElapsedSeconds}
        />
      </main>

      {/* Footer Tagline */}
      <footer className="mt-auto pt-4 text-center select-none text-[11px] text-[#3C3026]/50 dark:text-[#F0E7D8]/50">
        <p className="font-rozha text-[#C88735] dark:text-[#B89A60] text-xs">
          ॥ ॐ तत्सत् ॥
        </p>
        <p className="mt-0.5">
          {settings.language === 'hi'
            ? 'जापसंख्या • हर नाम में भक्ति, हर जाप में शांति।'
            : 'JapSankhya • Devotion in Every Name, Peace in Every Chant.'}
        </p>
      </footer>
    </div>
  );

  return (
    <>
      {/* Device Frame Wrapper (for responsive mobile preview on desktop) */}
      {isMobileDeviceFrame ? (
        <div className="min-h-screen bg-[#2A231C] p-4 sm:p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-[420px] h-[860px] max-h-[92vh] rounded-[48px] p-3 bg-black shadow-2xl border-4 border-[#B89A60]/40 flex flex-col overflow-hidden relative">
            {/* Simulated iPhone Dynamic Island / Speaker Notch */}
            <div className="w-28 h-4 bg-black rounded-full mx-auto mb-1 z-40 shrink-0 border border-gray-800" />
            <div className="flex-1 rounded-[36px] overflow-y-auto overflow-x-hidden scrollbar-none relative">
              {appContent}
            </div>
            {/* Simulated Home Indicator Bar */}
            <div className="w-32 h-1 bg-gray-500/60 rounded-full mx-auto mt-2 shrink-0" />
          </div>
        </div>
      ) : (
        appContent
      )}

      {/* Modals & Fullscreen Overlays */}
      <MantraLibraryModal
        isOpen={isMantraLibraryOpen}
        onClose={() => setIsMantraLibraryOpen(false)}
        language={settings.language}
        mantras={mantras}
        selectedMantraId={activeCounter.mantraId}
        onSelectMantra={handleSelectMantra}
        onAddCustomMantra={handleAddCustomMantra}
        onDeleteCustomMantra={handleDeleteCustomMantra}
      />

      <SpiritualAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        language={settings.language}
        dailyRecords={dailyRecords}
        lifetimeStats={lifetimeStats}
        streakData={streakData}
        sankalpas={sankalpas}
        mantras={mantras}
        onRefreshData={refreshAllData}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={settings.language}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetAllData={handleResetAllData}
      />

      <NativeExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        language={settings.language}
      />

      <ZenFullscreenMode
        isOpen={isZenModeOpen}
        onClose={() => setIsZenModeOpen(false)}
        language={settings.language}
        mantra={activeMantra}
        settings={settings}
        mode={activeCounter.mode}
        currentBead={activeCounter.currentBead}
        sessionTotalCount={activeCounter.sessionTotalCount}
        completedMalas={activeCounter.completedMalas}
        onIncrement={handleIncrement}
      />
    </>
  );
}
