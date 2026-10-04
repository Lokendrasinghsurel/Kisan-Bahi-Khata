import React, { useState, useRef, useEffect } from 'react';
import { 
  Sprout, 
  PlusCircle, 
  FileText, 
  RefreshCw, 
  TrendingUp, 
  Volume2, 
  VolumeX,
  Share2,
  Calendar,
  Layers,
  User,
  LogIn,
  Smartphone,
  MoreVertical,
  Globe,
  Play,
  X
} from 'lucide-react';
import { MANDSAUR_MANDI_RATES } from '../data/mandsaurMandiData';
import { speakInHindi, stopSpeech } from '../utils/speech';
import { FarmerUser } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'ledger' | 'dashboard' | 'mandi' | 'calculator';
  setActiveTab: (tab: 'ledger' | 'dashboard' | 'mandi' | 'calculator') => void;
  onOpenNewEntry: () => void;
  onOpenPrint: () => void;
  onResetDemoData: () => void;
  onOpenLogin: () => void;
  onOpenInstallModal?: () => void;
  onOpenPlayStoreModal?: () => void;
  currentUser: FarmerUser | null;
  lang: 'hi' | 'hinglish';
  setLang: (lang: 'hi' | 'hinglish') => void;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewEntry,
  onOpenPrint,
  onResetDemoData,
  onOpenLogin,
  onOpenInstallModal,
  onOpenPlayStoreModal,
  currentUser,
  lang,
  setLang,
  totalIncome,
  totalExpense,
  netProfit,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Audio speech handler for top crops in Mandsaur Mandi
  const handleSpeakMandiTop = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    const topCrops = MANDSAUR_MANDI_RATES.slice(0, 4);
    let speechText = 'राम राम किसान भाइयों! मंदसौर मंडी के प्रमुख भाव इस प्रकार हैं: ';
    topCrops.forEach((c) => {
      const trendWord = c.trend === 'up' ? 'तेजी' : c.trend === 'down' ? 'मंदी' : 'समान';
      speechText += `${c.commodityHi} का मॉडल भाव ${c.modalPrice} रुपये प्रति क्विंटल, बाजार में ${trendWord} है। `;
    });
    speechText += 'किसान बही-खाता पर अपना दैनिक हिसाब सुरक्षित रखें। धन्यवाद!';

    setIsPlayingAudio(true);
    speakInHindi(speechText, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleShareApp = () => {
    const text = '🌾 किसान बही-खाता (Kisan Bahi Khata) - मंदसौर मंडी भाव, फसल-खाद खर्च और मुनाफा हिसाब के लिए यह ऐप चलाएं: ' + window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'किसान बही-खाता - मंदसौर मंडी',
        text: text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const todayDateStr = new Intl.DateTimeFormat('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  }).format(new Date());

  // Duplicate for smooth seamless scrolling loop
  const tickerItems = [...MANDSAUR_MANDI_RATES, ...MANDSAUR_MANDI_RATES];

  return (
    <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-30 border-b border-emerald-900">
      {/* Top Banner: Auto-Scrolling Live Mandi Bhav Ticker */}
      <div className="bg-emerald-950/95 py-1 px-3 text-xs text-emerald-200 border-b border-emerald-800/80 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 shrink-0 font-medium text-amber-300 z-10 bg-emerald-950 pr-2 border-r border-emerald-800">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-bold text-[11px] sm:text-xs tracking-wider">मंडी लाइव:</span>
          </div>

          {/* Continuous scrolling marquee container */}
          <div className="overflow-hidden whitespace-nowrap flex-1 relative mask-linear">
            <div className="animate-marquee flex items-center gap-3 sm:gap-4 cursor-pointer py-0.5">
              {tickerItems.map((rate, index) => (
                <div
                  key={`${rate.id}-${index}`}
                  onClick={() => setActiveTab('mandi')}
                  className="inline-flex items-center gap-1 bg-emerald-900/80 hover:bg-emerald-800 px-2 py-0.5 rounded-md border border-emerald-700/60 transition shrink-0 text-xs"
                >
                  <span className="text-white font-medium">{rate.commodityHi}</span>
                  <span className="text-amber-300 font-bold">
                    ₹{rate.modalPrice.toLocaleString('en-IN')}
                  </span>
                  <span
                    className={
                      rate.trend === 'up'
                        ? 'text-emerald-300 font-bold text-[10px]'
                        : rate.trend === 'down'
                        ? 'text-rose-400 font-bold text-[10px]'
                        : 'text-stone-300 text-[10px]'
                    }
                  >
                    {rate.trend === 'up' ? '▲ तेजी' : rate.trend === 'down' ? '▼ मंदी' : '▬'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 shrink-0 text-emerald-300 text-xs pl-2 border-l border-emerald-800">
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>{todayDateStr}</span>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Clean Brand Logo & Farmer Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center shadow-md font-bold text-xl sm:text-2xl border-2 border-amber-300 shrink-0">
              🌾
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight">
                  किसान बही-खाता
                </h1>
                <span className="text-[10px] font-extrabold bg-amber-400 text-emerald-950 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  मंदसौर
                </span>
              </div>

              {/* Subtitle / User info */}
              <div className="text-[11px] sm:text-xs text-emerald-200 truncate mt-0.5">
                {currentUser ? (
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-amber-300 font-bold truncate">
                      👤 {currentUser.name}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="font-mono text-[10px] text-emerald-200">
                      {currentUser.uniqueId || `KISAN-${currentUser.mobile}`}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  </div>
                ) : (
                  <span>दैनिक फसल, खाद व मुनाफा हिसाब</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Mobile Actions: Minimal, Spacious & Uncongested */}
          <div className="flex items-center gap-1.5 md:hidden shrink-0 relative" ref={menuRef}>
            {/* Audio Voice Assistant Button */}
            <button
              onClick={handleSpeakMandiTop}
              title={isPlayingAudio ? 'आवाज़ बंद करें' : 'मंडी भाव सुनें'}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center transition border ${
                isPlayingAudio 
                  ? 'bg-amber-400 text-emerald-950 border-amber-300 animate-pulse font-bold' 
                  : 'bg-emerald-900/80 hover:bg-emerald-700 text-emerald-200 border-emerald-700'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4 text-emerald-950" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
            </button>

            {/* Clean More Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center transition border ${
                isMobileMenuOpen 
                  ? 'bg-emerald-950 text-amber-300 border-amber-400' 
                  : 'bg-emerald-900/80 hover:bg-emerald-700 text-white border-emerald-700'
              }`}
              title="अन्य सुविधाएं"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Mobile Dropdown Menu for Auxiliary Tools */}
            {isMobileMenuOpen && (
              <div className="absolute right-0 top-12 w-52 bg-white text-stone-800 rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <span>सुविधाएं (Tools)</span>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setLang(lang === 'hi' ? 'hinglish' : 'hi');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-stone-50 flex items-center gap-2.5 transition"
                >
                  <Globe className="w-4 h-4 text-emerald-700" />
                  <span>भाषा: <strong>{lang === 'hi' ? 'हिंदी (सक्रिय)' : 'Hinglish'}</strong></span>
                </button>

                <button
                  onClick={() => {
                    onOpenPrint();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-stone-50 flex items-center gap-2.5 transition"
                >
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>पर्ची / रसीद प्रिंट करें</span>
                </button>

                <button
                  onClick={() => {
                    handleShareApp();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-stone-50 flex items-center gap-2.5 transition"
                >
                  <Share2 className="w-4 h-4 text-emerald-700" />
                  <span>व्हाट्सएप पर शेयर करें</span>
                </button>

                {onOpenPlayStoreModal && (
                  <button
                    onClick={() => {
                      onOpenPlayStoreModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-stone-50 flex items-center gap-2.5 text-emerald-900 transition"
                  >
                    <Play className="w-4 h-4 text-amber-500" />
                    <span>Google Play Store गाइड</span>
                  </button>
                )}

                <div className="border-t border-stone-100 my-1"></div>

                <button
                  onClick={() => {
                    onResetDemoData();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-rose-50 text-stone-600 hover:text-rose-700 flex items-center gap-2.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
                  <span>डेमो डेटा लोड / रीसेट</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Desktop Controls (Spacious & Rich) */}
          <div className="hidden md:flex items-center justify-end gap-2.5">
            {/* Quick Stats Pill */}
            <div className="hidden lg:flex items-center gap-3 bg-emerald-900/90 border border-emerald-700/80 px-3 py-1.5 rounded-xl text-xs">
              <div>
                <span className="text-emerald-300 block text-[10px]">शुद्ध मुनाफा (Net Profit)</span>
                <span className={`font-bold text-sm ${netProfit >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  ₹{netProfit.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-6 w-px bg-emerald-700"></div>
              <div>
                <span className="text-emerald-300 block text-[10px]">कुल आमदनी</span>
                <span className="font-semibold text-white">₹{totalIncome.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Android PWA Install Button */}
            {onOpenInstallModal && (
              <PWAInstallButton onOpenInstallModal={onOpenInstallModal} variant="full" />
            )}

            {/* Farmer Mobile Login Button */}
            <button
              onClick={onOpenLogin}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                currentUser
                  ? 'bg-amber-400 text-emerald-950 shadow-sm border border-amber-300'
                  : 'bg-emerald-900/90 hover:bg-emerald-700 text-white border border-emerald-600'
              }`}
            >
              {currentUser ? <User className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5 text-amber-300" />}
              <span>
                {currentUser ? currentUser.name.split(' ')[1] || currentUser.name : 'मोबाइल लॉगिन'}
              </span>
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'hi' ? 'hinglish' : 'hi')}
              className="bg-emerald-900/80 hover:bg-emerald-700 border border-emerald-600/80 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-100 transition"
              title="भाषा बदलें"
            >
              🌐 {lang === 'hi' ? 'हिंदी' : 'Hinglish'}
            </button>

            {/* Play Store Guide */}
            {onOpenPlayStoreModal && (
              <button
                onClick={onOpenPlayStoreModal}
                className="hidden xl:flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-amber-400/80 text-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
                title="Google Play Store पर पब्लिश करें"
              >
                <span>▶️</span>
                <span>Play Store</span>
              </button>
            )}

            {/* Audio Voice Assistant */}
            <button
              onClick={handleSpeakMandiTop}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isPlayingAudio 
                  ? 'bg-amber-400 text-emerald-950 border-amber-300 animate-pulse font-bold' 
                  : 'bg-emerald-700/80 hover:bg-emerald-600 text-white border-emerald-600'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAudio ? 'आवाज़ बंद करें' : 'भाव सुनें'}</span>
            </button>

            {/* Print Slip */}
            <button
              onClick={onOpenPrint}
              className="bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition"
              title="पर्ची / रसीद प्रिंट करें"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>पर्ची प्रिंट</span>
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleShareApp}
              className="bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition"
              title="व्हाट्सएप पर शेयर करें"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>शेयर</span>
            </button>

            {/* Big Add Entry button for Desktop */}
            <button
              onClick={onOpenNewEntry}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-4 py-2 rounded-xl text-sm shadow-md active:scale-95 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ नया हिसाब दर्ज करें</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        {/* On Mobile: Sleek, compact segmented pill control */}
        {/* On Desktop: Full spaced menu */}
        <div className="mt-2 pt-2 border-t border-emerald-700/60 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ledger'
                ? 'bg-amber-400 text-emerald-950 shadow-sm'
                : 'text-emerald-100 hover:bg-emerald-700/60 bg-emerald-900/40 md:bg-transparent'
            }`}
          >
            <span>📖</span>
            <span className="hidden sm:inline">दैनिक बही-खाता (Ledger)</span>
            <span className="sm:hidden">बही-खाता</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-amber-400 text-emerald-950 shadow-sm'
                : 'text-emerald-100 hover:bg-emerald-700/60 bg-emerald-900/40 md:bg-transparent'
            }`}
          >
            <span>📊</span>
            <span className="hidden sm:inline">ग्राफिकल विश्लेषण (Dashboard)</span>
            <span className="sm:hidden">विश्लेषण</span>
          </button>

          <button
            onClick={() => setActiveTab('mandi')}
            className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'mandi'
                ? 'bg-amber-400 text-emerald-950 shadow-sm'
                : 'text-emerald-100 hover:bg-emerald-700/60 bg-emerald-900/40 md:bg-transparent'
            }`}
          >
            <span>🏛️</span>
            <span className="hidden sm:inline">मंदसौर मंडी भाव (Mandi Rates)</span>
            <span className="sm:hidden">मंडी भाव</span>
            <span className="bg-red-500 text-white text-[9px] px-1 py-0.2 rounded-full font-bold">
              ताजा
            </span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-amber-400 text-emerald-950 shadow-sm'
                : 'text-emerald-100 hover:bg-emerald-700/60 bg-emerald-900/40 md:bg-transparent'
            }`}
          >
            <span>🧮</span>
            <span className="hidden sm:inline">फसल व खाद कैलकुलेटर (Estimator)</span>
            <span className="sm:hidden">कैलकुलेटर</span>
          </button>
        </div>
      </div>
    </header>
  );
};
