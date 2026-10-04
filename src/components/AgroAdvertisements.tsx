import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  MapPin, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Sparkles,
  CheckCircle2,
  Store
} from 'lucide-react';
import { AGRO_ADVERTISEMENTS, AgroShopAd } from '../data/advertisementsData';

interface AgroAdvertisementsProps {
  onQuickAddExpenseForShop?: (shopName: string, pesticideName?: string) => void;
  lang?: 'hi' | 'hinglish';
}

export const AgroAdvertisements: React.FC<AgroAdvertisementsProps> = ({
  onQuickAddExpenseForShop,
  lang = 'hi',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentAd = AGRO_ADVERTISEMENTS[currentIndex];

  // Auto-scroll / rotate advertisement window every 6.5 seconds
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % AGRO_ADVERTISEMENTS.length);
      }, 6500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % AGRO_ADVERTISEMENTS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + AGRO_ADVERTISEMENTS.length) % AGRO_ADVERTISEMENTS.length);
  };

  const handleWhatsAppContact = (ad: AgroShopAd, pesticideName?: string) => {
    let msg = `नमस्ते ${ad.nameHi}, मुझे किसान बही-खाता ऐप से आपका संपर्क मिला। `;
    if (pesticideName) {
      msg += `मुझे *${pesticideName}* दवा की उपलब्धता व भाव की जानकारी चाहिए।`;
    } else {
      msg += `मुझे खाद व कीटनाशक दवा की आवश्यकता है। कृपया जानकारी दें।`;
    }
    const url = `https://api.whatsapp.com/send?phone=${ad.whatsapp}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Duplicate pesticides array for smooth infinite horizontal marquee scroll inside the window
  const marqueePesticides = [...currentAd.featuredPesticides, ...currentAd.featuredPesticides];

  return (
    <div 
      className="relative rounded-3xl overflow-hidden shadow-md border-2 border-amber-300/80 bg-white transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Single Header Bar: Auto-Scroll Window Controls */}
      <div className={`bg-gradient-to-r ${currentAd.bannerColor} text-white p-4 sm:p-5 relative transition-colors duration-700`}>
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 pointer-events-none transform -skew-x-12"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Shop Title, Badge & Location */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-amber-400 text-emerald-950 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                <span>⭐</span>
                <span>विशेष विज्ञापन: {currentIndex + 1}/{AGRO_ADVERTISEMENTS.length}</span>
              </span>
              <span className="text-emerald-200 text-xs font-semibold bg-black/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentAd.badge}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{currentAd.nameHi}</span>
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-amber-200 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>स्थान: <strong>{currentAd.locationHi}</strong></span>
              <span className="hidden sm:inline text-white/50">•</span>
              <span className="hidden sm:inline text-stone-200 text-xs">{currentAd.taglineHi}</span>
            </p>
          </div>

          {/* Quick Action Contact Buttons & Slider Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Direct Phone Call */}
            <a
              href={`tel:${currentAd.phone}`}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-emerald-950 font-black px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition"
              title="सीधे कॉल करें"
            >
              <Phone className="w-4 h-4 fill-current text-emerald-950" />
              <span>कॉल: {currentAd.phone}</span>
            </a>

            {/* WhatsApp Contact */}
            <button
              onClick={() => handleWhatsAppContact(currentAd)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition"
              title="व्हाट्सएप पर बात करें"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">व्हाट्सएप</span>
            </button>

            {/* Prev / Next Slider Navigation Buttons */}
            <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/20 gap-1 ml-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg text-white hover:bg-white/20 transition"
                title="पिछला विज्ञापन"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-lg text-amber-300 hover:bg-white/20 transition"
                title={isPaused ? "स्क्रॉल चालू करें" : "स्क्रॉल रोकें"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg text-white hover:bg-white/20 transition"
                title="अगला विज्ञापन"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Store Tabs inside Window for instant toggle */}
        <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-amber-200 font-semibold text-[11px] hidden sm:inline">दुकान चुनें:</span>
            {AGRO_ADVERTISEMENTS.map((ad, idx) => (
              <button
                key={ad.id}
                onClick={() => setCurrentIndex(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  currentIndex === idx
                    ? 'bg-amber-400 text-emerald-950 shadow-sm'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <span>{idx === 0 ? '🌾' : '🚜'}</span>
                <span>{idx === 0 ? 'भूमि एग्रो (सुरेल, खाचरौद)' : 'माली कृषि (खरसोद कलां, बड़नगर)'}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ऑटो-स्क्रॉल चालू ({isPaused ? 'रोका गया' : 'चल रहा है'})</span>
          </div>
        </div>
      </div>

      {/* Body: Auto-Scrolling Horizontal Marquee of Featured Pesticides */}
      <div className="p-3 sm:p-4 bg-stone-50 border-b border-stone-200">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{currentAd.nameHi} पर उपलब्ध प्रमुख कीटनाशक दवाएं (Pesticides List):</span>
          </span>
          <span className="text-[11px] text-stone-500 font-semibold hidden sm:inline">
            ← क्षैतिज स्क्रॉल हो रहा है (रोकने के लिए माउस रखें) →
          </span>
        </div>

        {/* Continuous Horizontal Scrolling Pesticides Ribbon */}
        <div className="overflow-hidden whitespace-nowrap py-1 relative mask-linear">
          <div className="animate-marquee flex items-center gap-3">
            {marqueePesticides.map((pest, pIdx) => (
              <div
                key={`${pest.nameHi}-${pIdx}`}
                onClick={() => onQuickAddExpenseForShop && onQuickAddExpenseForShop(currentAd.nameHi, pest.nameHi)}
                className="inline-block bg-white hover:bg-emerald-50/60 p-3 rounded-2xl border border-stone-200 hover:border-emerald-400 shadow-xs hover:shadow-sm transition cursor-pointer min-w-[240px] max-w-[280px] shrink-0 whitespace-normal"
                title="क्लिक करके यह दवा खाते में जोड़ें"
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="font-bold text-stone-900 text-xs sm:text-sm">
                    {pest.nameHi}
                  </span>
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded shrink-0">
                    {pest.badge || pest.category}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-800 mb-1">
                  ब्रांड: {pest.brand} • {pest.category}
                </div>
                <p className="text-[11px] text-stone-600 line-clamp-2 leading-tight">
                  {pest.targetPest}
                </p>
                <div className="mt-2 pt-1 border-t border-stone-100 flex items-center justify-between text-[10px] text-emerald-700 font-bold">
                  <span>+ खाते में जोड़ें</span>
                  <span>संपर्क: {currentAd.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Banner Bar */}
      <div className="px-4 py-2.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-600">
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          {currentAd.services.map((srv, sIdx) => (
            <span key={sIdx} className="flex items-center gap-1 font-medium text-stone-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 font-bold shrink-0" />
              <span>{srv}</span>
            </span>
          ))}
        </div>

        {onQuickAddExpenseForShop && (
          <button
            onClick={() => onQuickAddExpenseForShop(currentAd.nameHi, currentAd.featuredPesticides[0].nameHi)}
            className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-emerald-950 font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1 shadow-xs self-start sm:self-auto shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{currentAd.nameHi.split(' ')[0]} का खर्च खाते में जोड़ें</span>
          </button>
        )}
      </div>
    </div>
  );
};
