import React, { useState } from 'react';
import {
  X,
  Calendar,
  Flame,
  Award,
  Download,
  Upload,
  CheckCircle2,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { DailyRecord, Language, Mantra, Sankalpa } from '../types';
import { formatCountNumber, formatDuration } from '../utils/languageUtils';
import { storageService, getTodayDateStr } from '../services/storageService';

interface SpiritualAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  dailyRecords: Record<string, DailyRecord>;
  lifetimeStats: { totalJap: number; totalMalas: number };
  streakData: { currentStreak: number; bestStreak: number; activeDaysCount: number };
  sankalpas: Sankalpa[];
  mantras: Mantra[];
  onRefreshData: () => void;
}

export const SpiritualAnalyticsModal: React.FC<SpiritualAnalyticsModalProps> = ({
  isOpen,
  onClose,
  language,
  dailyRecords,
  lifetimeStats,
  streakData,
  sankalpas,
  mantras,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'sankalpa' | 'backup'>('overview');
  const [showNewSankalpaForm, setShowNewSankalpaForm] = useState(false);
  const [newSankalpaTitle, setNewSankalpaTitle] = useState('');
  const [newSankalpaTarget, setNewSankalpaTarget] = useState('10000');
  const [newSankalpaDays, setNewSankalpaDays] = useState('21');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute 7-day and 30-day totals
  const today = new Date();
  const past30Days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    past30Days.push(d.toISOString().split('T')[0]);
  }

  let last7DaysJap = 0;
  let last30DaysJap = 0;
  past30Days.forEach((dateStr, idx) => {
    const rec = dailyRecords[dateStr];
    if (rec) {
      last30DaysJap += rec.totalJap || 0;
      if (idx >= 23) {
        last7DaysJap += rec.totalJap || 0;
      }
    }
  });

  // Mantra breakdown
  const mantraMap = new Map<string, string>();
  mantras.forEach((m) => {
    mantraMap.set(m.id, language === 'hi' ? m.nameHi : m.nameEn);
  });

  const aggregateMantraCounts: Record<string, number> = {};
  Object.values(dailyRecords).forEach((rec) => {
    if (rec.mantrasBreakdown) {
      Object.entries(rec.mantrasBreakdown).forEach(([mId, cnt]) => {
        aggregateMantraCounts[mId] = (aggregateMantraCounts[mId] || 0) + cnt;
      });
    }
  });

  // Export JSON file download
  const handleExport = () => {
    const dataStr = storageService.exportDataJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `japsankhya_backup_${getTodayDateStr()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = storageService.importDataJSON(text);
        if (success) {
          setImportStatus(language === 'hi' ? 'डेटा सफलतापूर्वक पुनर्स्थापित हो गया!' : 'Data restored successfully!');
          onRefreshData();
        } else {
          setImportStatus(language === 'hi' ? 'डेटा फ़ाइल अमान्य है।' : 'Invalid backup file.');
        }
      } catch {
        setImportStatus(language === 'hi' ? 'आयात विफल रहा।' : 'Import failed.');
      }
    };
    reader.readAsText(file);
  };

  const handleCreateSankalpa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSankalpaTitle.trim()) return;

    const target = parseInt(newSankalpaTarget, 10) || 10000;
    const days = parseInt(newSankalpaDays, 10) || 21;

    const item: Sankalpa = {
      id: `sankalpa-${Date.now()}`,
      titleHi: newSankalpaTitle.trim(),
      titleEn: newSankalpaTitle.trim(),
      targetCount: target,
      currentCount: 0,
      startDate: getTodayDateStr(),
      targetDays: days,
      completed: false,
    };

    storageService.saveSankalpa(item);
    setShowNewSankalpaForm(false);
    setNewSankalpaTitle('');
    onRefreshData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#FAF6EF] dark:bg-[#1E1A16] border border-[#B89A60]/40 shadow-2xl overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#B89A60]/20 bg-[#F0E7D8]/60 dark:bg-[#26201B]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#C88735]/15 text-[#C88735]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-rozha text-lg sm:text-xl font-bold text-[#3C3026] dark:text-[#F0E7D8]">
                {language === 'hi' ? 'साधना इतिहास एवं प्रगति' : 'Spiritual Journey & Analytics'}
              </h3>
              <p className="text-xs text-[#3C3026]/70 dark:text-[#F0E7D8]/70">
                {language === 'hi'
                  ? 'अपनी साधना की निरंतरता, संकल्प और संचित पुण्य का अवलोकन करें'
                  : 'Track your spiritual progress, consistency, and divine vows'}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-[#B89A60]/20 bg-[#FAF6EF] dark:bg-[#1A1612] px-4 pt-2 gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-[#C88735] text-[#C88735] dark:text-amber-400'
                : 'border-transparent text-[#3C3026]/60 dark:text-[#F0E7D8]/60 hover:text-[#3C3026]'
            }`}
          >
            {language === 'hi' ? 'साधना समीक्षा' : 'Overview'}
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'calendar'
                ? 'border-[#C88735] text-[#C88735] dark:text-amber-400'
                : 'border-transparent text-[#3C3026]/60 dark:text-[#F0E7D8]/60 hover:text-[#3C3026]'
            }`}
          >
            {language === 'hi' ? 'दैनिक पंचांग' : 'Calendar (30d)'}
          </button>
          <button
            onClick={() => setActiveTab('sankalpa')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'sankalpa'
                ? 'border-[#C88735] text-[#C88735] dark:text-amber-400'
                : 'border-transparent text-[#3C3026]/60 dark:text-[#F0E7D8]/60 hover:text-[#3C3026]'
            }`}
          >
            {language === 'hi' ? 'संकल्प (Vows)' : 'Sankalpas'}
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'backup'
                ? 'border-[#C88735] text-[#C88735] dark:text-amber-400'
                : 'border-transparent text-[#3C3026]/60 dark:text-[#F0E7D8]/60 hover:text-[#3C3026]'
            }`}
          >
            {language === 'hi' ? 'बैकअप एवं डेटा' : 'Backup & Data'}
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Highlight Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/20 text-center">
                  <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60 block mb-0.5">
                    {language === 'hi' ? 'गत ७ दिन जाप' : 'Last 7 Days'}
                  </span>
                  <span className="font-rozha text-xl font-bold text-[#C88735] dark:text-amber-400">
                    {formatCountNumber(last7DaysJap)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/20 text-center">
                  <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60 block mb-0.5">
                    {language === 'hi' ? 'गत ३० दिन जाप' : 'Last 30 Days'}
                  </span>
                  <span className="font-rozha text-xl font-bold text-[#C88735] dark:text-amber-400">
                    {formatCountNumber(last30DaysJap)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/20 text-center">
                  <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60 block mb-0.5">
                    {language === 'hi' ? 'सर्वोत्तम क्रम' : 'Best Streak'}
                  </span>
                  <div className="flex items-center justify-center gap-1 font-rozha text-xl font-bold text-orange-600 dark:text-orange-400">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>{streakData.bestStreak} {language === 'hi' ? 'दिन' : 'days'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/20 text-center">
                  <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60 block mb-0.5">
                    {language === 'hi' ? 'सक्रिय दिवस' : 'Active Days'}
                  </span>
                  <span className="font-rozha text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {streakData.activeDaysCount} {language === 'hi' ? 'दिन' : 'days'}
                  </span>
                </div>
              </div>

              {/* Mantra Breakdown */}
              <div className="p-4 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/25">
                <h4 className="font-rozha text-sm sm:text-base font-bold text-[#3C3026] dark:text-[#F0E7D8] mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C88735]" />
                  <span>{language === 'hi' ? 'मंत्र अनुसार संचित जाप' : 'Cumulative Jap by Mantra'}</span>
                </h4>

                {Object.keys(aggregateMantraCounts).length === 0 ? (
                  <p className="text-xs text-[#3C3026]/60 dark:text-[#F0E7D8]/60 text-center py-4">
                    {language === 'hi'
                      ? 'अभी कोई जाप रिकॉर्ड नहीं हुआ है। मुख्य पृष्ठ पर जाकर जाप प्रारंभ करें।'
                      : 'No chants recorded yet. Start counting on the dashboard!'}
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {Object.entries(aggregateMantraCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([mId, cnt]) => {
                        const mTitle = mantraMap.get(mId) || mId;
                        const pct = Math.round((cnt / Math.max(1, lifetimeStats.totalJap)) * 100);
                        return (
                          <div key={mId} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-[#3C3026] dark:text-[#F0E7D8]">
                                {mTitle}
                              </span>
                              <span className="text-[#C88735] dark:text-amber-400 font-bold">
                                {formatCountNumber(cnt)} ({Math.floor(cnt / 108)} {language === 'hi' ? 'माला' : 'malas'})
                              </span>
                            </div>
                            <div className="w-full bg-[#FAF6EF] dark:bg-[#1A1612] h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#C88735] to-[#F59E0B] rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-rozha text-sm font-bold text-[#3C3026] dark:text-[#F0E7D8] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C88735]" />
                  <span>{language === 'hi' ? 'गत ३० दिनों का दैनिक रिकॉर्ड' : 'Past 30 Days Activity'}</span>
                </h4>
                <span className="text-[11px] text-[#3C3026]/60 dark:text-[#F0E7D8]/60">
                  {language === 'hi' ? 'गहरे रंग = अधिक जाप' : 'Darker = More Japs'}
                </span>
              </div>

              {/* Heatmap Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {past30Days.map((dStr) => {
                  const rec = dailyRecords[dStr];
                  const count = rec?.totalJap || 0;
                  const malas = rec?.malasCompleted || 0;
                  const dateObj = new Date(dStr);
                  const isToday = dStr === getTodayDateStr();

                  // Intensity classes based on count
                  let bgClass = 'bg-[#F0E7D8]/50 dark:bg-[#28221D] border-[#B89A60]/20 text-[#3C3026]/60 dark:text-[#F0E7D8]/60';
                  if (count > 0 && count < 108) {
                    bgClass = 'bg-amber-500/20 border-amber-500/40 text-[#C88735] font-semibold';
                  } else if (count >= 108 && count < 540) {
                    bgClass = 'bg-amber-500/40 border-amber-500/60 text-[#917540] dark:text-amber-300 font-bold';
                  } else if (count >= 540) {
                    bgClass = 'bg-gradient-to-br from-[#C88735] to-[#B45309] text-white border-[#B45309] font-bold shadow-xs';
                  }

                  return (
                    <div
                      key={dStr}
                      className={`p-2 rounded-xl border text-center transition-all ${bgClass} ${
                        isToday ? 'ring-2 ring-[#C88735]' : ''
                      }`}
                    >
                      <span className="text-[10px] block opacity-80">
                        {dateObj.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="text-xs font-rozha block mt-0.5">
                        {count > 0 ? formatCountNumber(count) : '-'}
                      </span>
                      {malas > 0 && (
                        <span className="text-[9px] block opacity-90">
                          {malas} {language === 'hi' ? 'माला' : 'm'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'sankalpa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-rozha text-sm sm:text-base font-bold text-[#3C3026] dark:text-[#F0E7D8]">
                    {language === 'hi' ? 'पावन संकल्प एवं अनुष्ठान' : 'Spiritual Vows & Anushthan'}
                  </h4>
                  <p className="text-xs text-[#3C3026]/70 dark:text-[#F0E7D8]/70">
                    {language === 'hi'
                      ? 'समयबद्ध लक्ष्य निर्धारित कर अपनी साधना को सिद्ध करें'
                      : 'Set sacred milestone targets with target days'}
                  </p>
                </div>

                <button
                  onClick={() => setShowNewSankalpaForm(!showNewSankalpaForm)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#C88735] hover:bg-[#B45309] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'नया संकल्प' : 'New Vow'}</span>
                </button>
              </div>

              {/* New Sankalpa Form */}
              {showNewSankalpaForm && (
                <form
                  onSubmit={handleCreateSankalpa}
                  className="p-3.5 rounded-2xl bg-[#F0E7D8]/80 dark:bg-[#28221D] border border-[#B89A60]/30 space-y-3"
                >
                  <div>
                    <label className="text-[11px] font-semibold text-[#3C3026] dark:text-[#F0E7D8] block mb-1">
                      {language === 'hi' ? 'संकल्प का शीर्षक' : 'Vow Title'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newSankalpaTitle}
                      onChange={(e) => setNewSankalpaTitle(e.target.value)}
                      placeholder="उदा. २१ दिवसीय १०,००० नाम जाप"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1A16] border border-[#B89A60]/30 text-xs text-[#3C3026] dark:text-[#F0E7D8] focus:outline-none focus:border-[#C88735]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-[#3C3026] dark:text-[#F0E7D8] block mb-1">
                        {language === 'hi' ? 'लक्ष्य जाप संख्या' : 'Target Jap Count'}
                      </label>
                      <input
                        type="number"
                        min="108"
                        step="108"
                        required
                        value={newSankalpaTarget}
                        onChange={(e) => setNewSankalpaTarget(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1A16] border border-[#B89A60]/30 text-xs text-[#3C3026] dark:text-[#F0E7D8] focus:outline-none focus:border-[#C88735]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#3C3026] dark:text-[#F0E7D8] block mb-1">
                        {language === 'hi' ? 'अवधि (दिन)' : 'Target Duration (Days)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        required
                        value={newSankalpaDays}
                        onChange={(e) => setNewSankalpaDays(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1A16] border border-[#B89A60]/30 text-xs text-[#3C3026] dark:text-[#F0E7D8] focus:outline-none focus:border-[#C88735]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewSankalpaForm(false)}
                      className="px-3 py-1.5 text-xs text-[#3C3026]/70 dark:text-[#F0E7D8]/70"
                    >
                      {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#C88735] text-white text-xs font-semibold shadow-xs"
                    >
                      {language === 'hi' ? 'संकल्प धारण करें' : 'Commit Vow'}
                    </button>
                  </div>
                </form>
              )}

              {/* Sankalpa List */}
              <div className="space-y-3">
                {sankalpas.map((s) => {
                  const pct = Math.min(100, Math.round((s.currentCount / Math.max(1, s.targetCount)) * 100));
                  return (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/25 shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {s.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Flame className="w-4 h-4 text-[#C88735]" />
                          )}
                          <h5 className="font-bold text-xs sm:text-sm text-[#3C3026] dark:text-[#F0E7D8]">
                            {language === 'hi' ? s.titleHi : s.titleEn}
                          </h5>
                        </div>

                        <span className="text-xs font-bold text-[#C88735] dark:text-amber-400">
                          {pct}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#3C3026]/70 dark:text-[#F0E7D8]/70 mb-1">
                        <span>
                          {formatCountNumber(s.currentCount)} / {formatCountNumber(s.targetCount)} {language === 'hi' ? 'जाप' : 'chants'}
                        </span>
                        <span>
                          {s.targetDays} {language === 'hi' ? 'दिवसीय' : 'days target'}
                        </span>
                      </div>

                      <div className="w-full bg-[#FAF6EF] dark:bg-[#1A1612] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            s.completed
                              ? 'bg-emerald-500'
                              : 'bg-gradient-to-r from-[#C88735] to-[#F59E0B]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/25 space-y-3">
                <h4 className="font-rozha text-sm sm:text-base font-bold text-[#3C3026] dark:text-[#F0E7D8]">
                  {language === 'hi' ? 'डेटा बैकअप एवं डिवाइस स्थानांतरण' : 'Data Backup & Device Transfer'}
                </h4>
                <p className="text-xs text-[#3C3026]/75 dark:text-[#F0E7D8]/75 leading-relaxed">
                  {language === 'hi'
                    ? 'आपकी समस्त साधना, इतिहास, कस्टम मंत्र और संकल्प सुरक्षित हैं। आप कभी भी संपूर्ण डेटा को .json फाइल के रूप में निर्यात कर सकते हैं तथा अन्य मोबाइल या कंप्यूटर पर पुनः आयात कर सकते हैं।'
                    : 'All your chanting history, custom mantras, and vows are stored locally on your device. You can export a full backup anytime and restore it on any device.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C88735] hover:bg-[#B45309] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{language === 'hi' ? 'बैकअप डाउनलोड करें (.json)' : 'Export Backup File (.json)'}</span>
                  </button>

                  <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FAF6EF] dark:bg-[#1E1A16] border border-[#B89A60]/40 text-[#3C3026] dark:text-[#F0E7D8] text-xs font-semibold hover:bg-[#F0E7D8] transition-colors cursor-pointer text-center">
                    <Upload className="w-4 h-4 text-[#C88735]" />
                    <span>{language === 'hi' ? 'बैकअप फ़ाइल आयात करें' : 'Import Backup File'}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                </div>

                {importStatus && (
                  <p className="text-xs text-center font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                    {importStatus}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
