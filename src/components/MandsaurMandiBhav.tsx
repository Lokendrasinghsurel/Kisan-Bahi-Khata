import React, { useState, useMemo } from 'react';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Volume2, 
  VolumeX, 
  Share2, 
  Calculator, 
  Calendar, 
  Store, 
  Info,
  Clock,
  PhoneCall,
  Check
} from 'lucide-react';
import { MandiRate } from '../types';
import { MANDSAUR_MANDI_RATES, MANDI_INFO } from '../data/mandsaurMandiData';
import { speakInHindi, stopSpeech } from '../utils/speech';
import { AgroAdvertisements } from './AgroAdvertisements';

interface MandsaurMandiBhavProps {
  onSelectCropForCalculator: (cropName: string, price: number) => void;
  onQuickAddExpenseForShop?: (shopName: string, pesticideName?: string) => void;
  lang: 'hi' | 'hinglish';
}

export const MandsaurMandiBhav: React.FC<MandsaurMandiBhavProps> = ({
  onSelectCropForCalculator,
  onQuickAddExpenseForShop,
  lang,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const categories = [
    { id: 'all', label: 'सभी फसलें' },
    { id: 'spices', label: 'मसाला (लहसुन, मैथी, इसबगोल)' },
    { id: 'oilseeds', label: 'तिलहन (सोयाबीन, सरसों)' },
    { id: 'grains', label: 'अनाज (गेहूं, मक्का)' },
    { id: 'pulses', label: 'दलहन (चना, मटर)' },
    { id: 'commercial', label: 'व्यापारिक (खसखस / पोस्ता)' },
  ];

  const filteredRates = useMemo(() => {
    return MANDSAUR_MANDI_RATES.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return item.commodityHi.toLowerCase().includes(q) || 
               item.commodityEn.toLowerCase().includes(q) || 
               item.variety?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedCategory, search]);

  const handleSpeakAllRates = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    let speech = `मंदसौर कृषि उपज मंडी के आज के ताजा भाव इस प्रकार हैं। `;
    filteredRates.slice(0, 8).forEach(r => {
      speech += `${r.commodityHi}, मॉडल भाव ${r.modalPrice} रुपये, अधिकतम भाव ${r.maxPrice} रुपये प्रति क्विंटल। आवक ${r.arrivalBags} बोरी। `;
    });
    speech += `मंडी में व्यापार सुचारू रूप से चालू है। धन्यवाद।`;

    setIsPlayingAudio(true);
    speakInHindi(speech, () => setIsPlayingAudio(false));
  };

  const handleShareMandiWhatsApp = () => {
    let text = `🏛️ *मंदसौर कृषि उपज मंडी - आज के ताजा भाव*\n📅 दिनांक: ${new Date().toLocaleDateString('hi-IN')}\n\n`;
    filteredRates.forEach((r, idx) => {
      const trendSymbol = r.trend === 'up' ? '▲ तेजी' : r.trend === 'down' ? '▼ मंदी' : '▬ समान';
      text += `${idx + 1}. *${r.commodityHi}* (${r.variety || ''})\n   मॉडल: ₹${r.modalPrice}/qu | अधिक: ₹${r.maxPrice} | आवक: ${r.arrivalBags} बोरी (${trendSymbol})\n`;
    });
    text += `\n📌 स्रोत: किसान बही-खाता (मंदसौर मंडी)\nशेयर करें किसान भाइयों के साथ!`;

    if (navigator.share) {
      navigator.share({ title: 'मंदसौर मंडी भाव', text }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleCopyRates = () => {
    let text = `🏛️ मंदसौर मंडी भाव:\n`;
    filteredRates.forEach(r => {
      text += `${r.commodityHi}: ₹${r.modalPrice}/क्विंटल (आवक: ${r.arrivalBags} बोरी)\n`;
    });
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mandi Title & Info Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-700 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 pointer-events-none transform -skew-x-12"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-emerald-950 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                दैनिक नीलामी भाव
              </span>
              <span className="text-emerald-200 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {MANDI_INFO.timing}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              {MANDI_INFO.nameHi}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
              लहसुन, सोयाबीन, गेहूं, मैथी व मसालों की एशिया की प्रमुख कृषि उपज मंडी का अधिकृत दैनिक भाव।
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSpeakAllRates}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                isPlayingAudio
                  ? 'bg-amber-400 text-emerald-950 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAudio ? 'बोलना बंद करें' : 'भाव बोलकर सुनें'}</span>
            </button>

            <button
              onClick={handleShareMandiWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition"
            >
              <Share2 className="w-4 h-4" />
              <span>व्हाट्सएप शेयर</span>
            </button>

            <button
              onClick={handleCopyRates}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs font-semibold border border-white/20 transition flex items-center gap-1"
              title="भाव कॉपी करें"
            >
              {copiedNotification ? <Check className="w-4 h-4 text-amber-300" /> : 'कॉपी'}
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-4 pt-3 border-t border-emerald-700/80 flex flex-wrap items-center justify-between text-xs text-emerald-200 gap-2">
          <span>📦 कुल दैनिक आवक: <strong>{MANDI_INFO.totalArrivalToday}</strong></span>
          <span>⚠️ {MANDI_INFO.closedDays}</span>
          <span className="flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
            <span>मंडी हेल्पलाइन: {MANDI_INFO.helpline}</span>
          </span>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="फसल खोजें: लहसुन, सोयाबीन, गेहूं, मैथी, चना..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-stone-500 font-semibold px-1">
            कुल फसलें: {filteredRates.length}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === c.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mandi Bhav Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRates.map((rate) => {
          const isUp = rate.trend === 'up';
          const isDown = rate.trend === 'down';

          return (
            <div
              key={rate.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm hover:shadow-md transition hover:border-emerald-300 flex flex-col justify-between"
            >
              <div>
                {/* Header: Name, Variety & Trend */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 leading-snug">
                      {rate.commodityHi}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">
                      {rate.variety || rate.commodityEn}
                    </p>
                  </div>

                  {/* Trend Badge */}
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isUp 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : isDown 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                      : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}>
                    {isUp && <TrendingUp className="w-3.5 h-3.5" />}
                    {isDown && <TrendingDown className="w-3.5 h-3.5" />}
                    {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
                    <span>
                      {isUp ? `+₹${rate.changeAmount} तेजी` : isDown ? `-₹${Math.abs(rate.changeAmount)} मंदी` : 'समान'}
                    </span>
                  </span>
                </div>

                {/* Primary Price: Modal Price */}
                <div className="my-3 p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                      मॉडल भाव (Modal Rate)
                    </span>
                    <span className="text-2xl font-extrabold text-stone-900">
                      ₹{rate.modalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-stone-500 font-medium ml-1">/क्विंटल</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-stone-500 block">दैनिक आवक</span>
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md inline-block">
                      {rate.arrivalBags.toLocaleString('en-IN')} बोरी
                    </span>
                  </div>
                </div>

                {/* Min & Max Price Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <span className="text-stone-500 block text-[10px]">न्यूनतम भाव (Min)</span>
                    <span className="font-bold text-stone-700">₹{rate.minPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <span className="text-emerald-700 block text-[10px]">उच्चतम भाव (Max)</span>
                    <span className="font-bold text-emerald-800">₹{rate.maxPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions: Use in Calculator & Audio */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    const speech = `${rate.commodityHi}, मॉडल भाव ${rate.modalPrice} रुपये, अधिकतम भाव ${rate.maxPrice} रुपये, न्यूनतम ${rate.minPrice} रुपये प्रति क्विंटल। आवक ${rate.arrivalBags} बोरी।`;
                    speakInHindi(speech);
                  }}
                  className="text-stone-500 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-stone-100 transition text-xs flex items-center gap-1 font-medium"
                  title="भाव सुनें"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">सुनें</span>
                </button>

                <button
                  onClick={() => onSelectCropForCalculator(rate.commodityHi, rate.modalPrice)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                  <span>मुनाफा कैलकुलेट करें</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Window Auto-Scrolling Agro Advertisement (Bhoomi Agro Surel & Mali Krishi Kendra Kharsod) */}
      <AgroAdvertisements 
        onQuickAddExpenseForShop={onQuickAddExpenseForShop} 
        lang={lang} 
      />

      {/* Mandi Farmer Advisory & Rules Box */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-amber-950 space-y-3">
        <h4 className="font-bold text-base flex items-center gap-2 text-amber-900">
          <Info className="w-5 h-5 text-amber-700" />
          <span>मंदसौर मंडी में माल लाते समय किसान भाइयों के लिए जरूरी निर्देश:</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
          <div className="flex items-start gap-2 bg-white/70 p-3 rounded-xl border border-amber-200/60">
            <span className="text-emerald-600 font-bold">1.</span>
            <span>
              <strong>लहसुन व प्याज ग्रेडिंग:</strong> मंडी में माल को हमेशा छांटकर (छर्री, लड्डू, बोल्ड) अलग-अलग बोरियों में लाएं। इससे आपको ₹2,000 से ₹4,000 प्रति क्विंटल तक अधिक भाव मिलता है।
            </span>
          </div>

          <div className="flex items-start gap-2 bg-white/70 p-3 rounded-xl border border-amber-200/60">
            <span className="text-emerald-600 font-bold">2.</span>
            <span>
              <strong>सोयाबीन व गेहूं नमी (Moisture):</strong> सोयाबीन 10% से 12% से अधिक गीला न हो। सूखी उपज की नीलामी में बोली ऊंची लगती है और कटौती (दागी/कटौती) नहीं होती।
            </span>
          </div>

          <div className="flex items-start gap-2 bg-white/70 p-3 rounded-xl border border-amber-200/60">
            <span className="text-emerald-600 font-bold">3.</span>
            <span>
              <strong>भुगतान व पर्ची:</strong> मंडी में माल बेचने के बाद अधिकृत तोल पर्ची व अनुबंध पत्र (अनुज्ञा पत्र) अवश्य लें। नियमानुसार व्यापारी को उसी दिन भुगतान करना अनिवार्य है।
            </span>
          </div>

          <div className="flex items-start gap-2 bg-white/70 p-3 rounded-xl border border-amber-200/60">
            <span className="text-emerald-600 font-bold">4.</span>
            <span>
              <strong>प्रवेश टोकन:</strong> मंडी के मुख्य गेट पर अपनी उपज की सही एंट्री करवाएं व टोकन सुरक्षित रखें ताकि नीलामी व यार्ड पार्किंग में असुविधा न हो।
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
