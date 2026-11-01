import { Language } from '../types';

export const toHindiDigits = (num: number | string): string => {
  const hindiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/[0-9]/g, (w) => hindiDigits[+w]);
};

export const formatCountNumber = (num: number, useHindiDigits: boolean = false): string => {
  const formatted = num.toLocaleString();
  return useHindiDigits ? toHindiDigits(formatted) : formatted;
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const getSpiritualGreeting = (lang: Language): { greeting: string; subtitle: string } => {
  const hour = new Date().getHours();
  if (lang === 'hi') {
    if (hour >= 4 && hour < 12) {
      return { greeting: 'शुभ प्रभात', subtitle: 'प्रातः कालीन पावन नाम जप' };
    } else if (hour >= 12 && hour < 17) {
      return { greeting: 'शुभ मध्याह्न', subtitle: 'शांत चित्त से जप निरंतर रखें' };
    } else if (hour >= 17 && hour < 21) {
      return { greeting: 'शुभ संध्या', subtitle: 'संध्या वंदन एवं पावन जाप' };
    } else {
      return { greeting: 'शुभ रात्रि', subtitle: 'प्रभु ध्यान में निद्रा लाभ' };
    }
  } else {
    if (hour >= 4 && hour < 12) {
      return { greeting: 'Shubh Prabhat', subtitle: 'Auspicious Morning Naam Jap' };
    } else if (hour >= 12 && hour < 17) {
      return { greeting: 'Shubh Madhyahan', subtitle: 'Afternoon Devotion & Peace' };
    } else if (hour >= 17 && hour < 21) {
      return { greeting: 'Shubh Sandhya', subtitle: 'Twilight Chanting & Serenity' };
    } else {
      return { greeting: 'Shubh Ratri', subtitle: 'Peaceful Night Meditation' };
    }
  }
};

export const t = {
  appName: {
    hi: 'जापसंख्या',
    en: 'JapSankhya',
  },
  tagline: {
    hi: 'हर नाम में भक्ति, हर जाप में शांति।',
    en: 'Devotion in Every Name, Peace in Every Chant.',
  },
  modeA: {
    hi: '१०८ माला गणक',
    en: '108 Mala Counter',
  },
  modeB: {
    hi: 'अखंड निरंतर जाप',
    en: 'Continuous Counter',
  },
  tapToChant: {
    hi: 'जाप हेतु स्पर्श करें',
    en: 'Tap to Count',
  },
  todayJap: {
    hi: 'आज का जाप',
    en: "Today's Jap",
  },
  dailyGoal: {
    hi: 'दैनिक लक्ष्य',
    en: 'Daily Goal',
  },
  completedMalas: {
    hi: 'पूर्ण माला',
    en: 'Completed Malas',
  },
  malaProgress: {
    hi: 'वर्तमान माला',
    en: 'Current Mala',
  },
  lifetimeJap: {
    hi: 'आजीवन जाप',
    en: 'Lifetime Jap',
  },
  streakDays: {
    hi: 'दिव्य साधना क्रम',
    en: 'Spiritual Streak',
  },
  remainingBeads: {
    hi: 'शेष मनके',
    en: 'Remaining Beads',
  },
  undo: {
    hi: 'पूर्ववत (Undo)',
    en: 'Undo',
  },
  reset: {
    hi: 'पुनः आरंभ',
    en: 'Reset',
  },
  zenMode: {
    hi: 'ध्यान कक्ष (Zen)',
    en: 'Zen Mode',
  },
  mantraLibrary: {
    hi: 'मंत्र संग्रह',
    en: 'Mantra Library',
  },
  changeMantra: {
    hi: 'मंत्र बदलें',
    en: 'Change Mantra',
  },
  historyAndAnalytics: {
    hi: 'साधना इतिहास',
    en: 'Analytics & Logs',
  },
  settings: {
    hi: 'प्राथमिकताएं',
    en: 'Settings',
  },
  mobileExport: {
    hi: 'मोबाइल ऍप गाइड',
    en: 'Mobile App / Export',
  },
  tanpuraDrone: {
    hi: 'तानपुरा ध्यान ध्वनि',
    en: 'Tanpura Drone',
  },
};
