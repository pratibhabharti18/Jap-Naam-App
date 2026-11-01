import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Apple,
  Layers,
  Copy,
  Check,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Language } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NativeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const NativeExportModal: React.FC<NativeExportModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const capacitorCommands = `npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init JapSankhya com.spiritual.japsankhya --web-dir dist
npm run build
npx cap add android
npx cap add ios
npx cap open android`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#FAF6EF] dark:bg-[#1E1A16] border border-[#B89A60]/40 shadow-2xl overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#B89A60]/20 bg-[#F0E7D8]/60 dark:bg-[#26201B]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#C88735]/15 text-[#C88735]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-rozha text-lg sm:text-xl font-bold text-[#3C3026] dark:text-[#F0E7D8]">
                {language === 'hi' ? 'मोबाइल ऍप एवं नेटिव एक्सपोर्ट' : 'Mobile App & Native Build'}
              </h3>
              <p className="text-xs text-[#3C3026]/70 dark:text-[#F0E7D8]/70">
                {language === 'hi'
                  ? 'एंड्रॉयड व आईफोन पर ऍप इंस्टॉल करें अथवा नेटिव पैकेज तैयार करें'
                  : 'Install on Android & iPhone or package as a native app'}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Method 1: Instant PWA Direct Home Screen Installation */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/15 border border-[#C88735]/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#C88735] text-white">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h4 className="font-rozha text-sm sm:text-base font-bold text-[#C88735] dark:text-amber-400">
                  {language === 'hi' ? 'विधि १: तुरंत मोबाइल ऍप इंस्टॉल करें' : 'Method 1: Direct 1-Tap Mobile Install'}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                {language === 'hi' ? 'अनुशंसित (Recommended)' : 'Recommended'}
              </span>
            </div>

            <p className="text-xs text-[#3C3026]/80 dark:text-[#F0E7D8]/80 leading-relaxed">
              {language === 'hi'
                ? 'जापसंख्या एक आधुनिक PWA (Progressive Web App) है। यह बिना किसी ऐप स्टोर के आपके फोन पर एक मूल ऐप की भांति पूर्ण स्क्रीन में कार्य करता है और ऑफलाइन भी चलता है।'
                : 'JapSankhya is an installable PWA. It runs standalone in full-screen on Android & iPhone without browser address bars, with offline caching.'}
            </p>

            {/* Install Button / Guidance */}
            {isInstalled ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{language === 'hi' ? 'ऍप आपके डिवाइस पर पहले से स्थापित है!' : 'App is already running as installed PWA!'}</span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={install}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C88735] hover:bg-[#B45309] text-white text-xs font-bold shadow-md transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'hi' ? 'होम स्क्रीन पर ऍप जोड़ें (Install App)' : 'Install JapSankhya App to Home Screen'}</span>
              </button>
            ) : isIOS ? (
              <div className="p-3 rounded-xl bg-white dark:bg-[#1E1A16] border border-[#B89A60]/30 space-y-2 text-xs">
                <span className="font-bold text-[#3C3026] dark:text-[#F0E7D8] flex items-center gap-1.5">
                  <Apple className="w-4 h-4" />
                  <span>{language === 'hi' ? 'iPhone / iPad (Safari) पर कैसे जोड़ें:' : 'How to install on iPhone (Safari):'}</span>
                </span>
                <ol className="list-decimal pl-4 space-y-1 text-[#3C3026]/80 dark:text-[#F0E7D8]/80">
                  <li>
                    {language === 'hi'
                      ? 'सफारी ब्राउज़र में नीचे दिए "Share" (शेयर) बटन पर टैप करें।'
                      : 'Tap the "Share" icon in Safari toolbar below.'}
                  </li>
                  <li>
                    {language === 'hi'
                      ? 'सूची में नीचे स्क्रॉल कर "Add to Home Screen" (होम स्क्रीन पर जोड़ें) चुनें।'
                      : 'Scroll down and tap "Add to Home Screen".'}
                  </li>
                  <li>
                    {language === 'hi'
                      ? 'ऊपरी दाएँ कोने में "Add" पर टैप करें। ऍप आपके होम स्क्रीन पर आ जाएगा।'
                      : 'Tap "Add" in top right. The app will launch standalone.'}
                  </li>
                </ol>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-xs text-[#3C3026]/80 dark:text-[#F0E7D8]/80 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#C88735]" />
                <span>
                  {language === 'hi'
                    ? 'ब्राउज़र मेनू (⋮) पर क्लिक करें और "Add to Home Screen" या "Install" चुनें।'
                    : 'Open browser menu (⋮) and tap "Install app" or "Add to Home screen".'}
                </span>
              </div>
            )}
          </div>

          {/* Method 2: Export to Native Android APK / AAB & iOS Xcode project */}
          <div className="p-4 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/25 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#3C3026] text-white">
                <Layers className="w-4 h-4" />
              </span>
              <h4 className="font-rozha text-sm sm:text-base font-bold text-[#3C3026] dark:text-[#F0E7D8]">
                {language === 'hi' ? 'विधि २: कैपेसिटर (Capacitor) से नेटिव APK / iOS बनाना' : 'Method 2: Native Android & iOS via Capacitor'}
              </h4>
            </div>

            <p className="text-xs text-[#3C3026]/75 dark:text-[#F0E7D8]/75 leading-relaxed">
              {language === 'hi'
                ? 'इस कोडबेस को Google Play Store और Apple App Store के लिए नेटिव एंड्रॉयड स्टूडियो (.apk / .aab) और iOS (Xcode) प्रोजेक्ट में आसानी से बदला जा सकता है:'
                : 'This standard Vite + React project can be wrapped with Capacitor into full native Android Studio and iOS Xcode workspaces:'}
            </p>

            <div className="relative">
              <pre className="p-3 rounded-xl bg-[#171511] text-[#FDE68A] text-[11px] font-mono overflow-x-auto leading-relaxed border border-[#B89A60]/30">
                {capacitorCommands}
              </pre>
              <button
                onClick={() => copyToClipboard(capacitorCommands, 'cap')}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#2E2922] hover:bg-[#3C3026] text-[#FAF6EF] text-xs flex items-center gap-1 transition-colors border border-[#B89A60]/30"
              >
                {copiedKey === 'cap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'cap' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Method 3: Google Play Store via Bubblewrap (TWA) */}
          <div className="p-4 rounded-2xl bg-[#F0E7D8]/60 dark:bg-[#26201B] border border-[#B89A60]/25 space-y-2">
            <h4 className="font-rozha text-xs sm:text-sm font-bold text-[#3C3026] dark:text-[#F0E7D8]">
              {language === 'hi' ? 'विधि ३: PWABuilder द्वारा १-क्लिक में Play Store पैकेज' : 'Method 3: 1-Click Play Store via PWABuilder'}
            </h4>
            <p className="text-xs text-[#3C3026]/75 dark:text-[#F0E7D8]/75 leading-relaxed">
              {language === 'hi'
                ? 'PWABuilder.com पर जाकर इस ऍप का यूआरएल दर्ज करें। यह स्वचालित रूप से हस्ताक्षरित एंड्रॉयड .aab पैकेज उत्पन्न कर देगा जिसे सीधे Google Play Console में प्रकाशित किया जा सकता है।'
                : 'Enter this app URL into PWABuilder.com. It automatically validates your manifest and packages a signed Android .aab bundle ready for Google Play Console submission.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
