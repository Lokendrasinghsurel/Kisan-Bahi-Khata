import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  IndianRupee, 
  Sparkles, 
  TrendingUp, 
  Sprout, 
  ShieldCheck, 
  Info, 
  Layers, 
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { CROP_PRESETS } from '../utils/constants';
import { MANDSAUR_MANDI_RATES } from '../data/mandsaurMandiData';
import { CropCostPreset, LedgerEntry } from '../types';

interface FasalCalculatorProps {
  initialCropName?: string;
  initialPrice?: number;
  onAddProjectionToLedger: (entry: LedgerEntry) => void;
  lang: 'hi' | 'hinglish';
}

export const FasalCalculator: React.FC<FasalCalculatorProps> = ({
  initialCropName,
  initialPrice,
  onAddProjectionToLedger,
  lang,
}) => {
  const [activeCalcTab, setActiveCalcTab] = useState<'profit' | 'fertilizer'>('profit');

  // Selected crop preset
  const [selectedCropId, setSelectedCropId] = useState<string>('lahsun');
  const [landArea, setLandArea] = useState<number>(3); // 3 bigha default
  const [areaUnit, setAreaUnit] = useState<'bigha' | 'acre'>('bigha');

  // Cost items per bigha
  const [seedCost, setSeedCost] = useState<number>(14000);
  const [fertilizerCost, setFertilizerCost] = useState<number>(5500);
  const [pesticideCost, setPesticideCost] = useState<number>(4200);
  const [laborCost, setLaborCost] = useState<number>(7500);
  const [tractorCost, setTractorCost] = useState<number>(3200);
  const [irrigationCost, setIrrigationCost] = useState<number>(2000);
  const [otherCost, setOtherCost] = useState<number>(1500);

  // Yield and selling price
  const [yieldPerUnit, setYieldPerUnit] = useState<number>(18); // क्विंटल प्रति बीघा
  const [sellingPrice, setSellingPrice] = useState<number>(15200); // ₹ per quintal

  const [savedNotification, setSavedNotification] = useState(false);

  // Sync if initialCropName is passed from Mandi Bhav
  useEffect(() => {
    if (initialCropName) {
      const match = CROP_PRESETS.find(p => 
        initialCropName.includes(p.cropNameHi.split(' ')[0]) || 
        p.cropNameHi.includes(initialCropName.split(' ')[0])
      );
      if (match) {
        setSelectedCropId(match.id);
        loadPreset(match, initialPrice);
      } else if (initialPrice) {
        setSellingPrice(initialPrice);
      }
    }
  }, [initialCropName, initialPrice]);

  const loadPreset = (preset: CropCostPreset, customPrice?: number) => {
    setSeedCost(preset.seedCostPerBigha);
    setFertilizerCost(preset.fertilizerCostPerBigha);
    setPesticideCost(preset.pesticideCostPerBigha);
    setLaborCost(preset.laborCostPerBigha);
    setTractorCost(preset.tractorMachineryCostPerBigha);
    setIrrigationCost(preset.irrigationCostPerBigha);
    setOtherCost(preset.otherCostPerBigha);
    setYieldPerUnit(preset.averageYieldPerBigha);
    
    // Check if we have Mandi live rate for this
    if (customPrice) {
      setSellingPrice(customPrice);
    } else {
      const mandiMatch = MANDSAUR_MANDI_RATES.find(m => 
        m.commodityHi.includes(preset.cropNameHi.split(' ')[0])
      );
      setSellingPrice(mandiMatch ? mandiMatch.modalPrice : preset.typicalPricePerQuintal);
    }
  };

  const handleCropPresetChange = (cropId: string) => {
    setSelectedCropId(cropId);
    const preset = CROP_PRESETS.find(p => p.id === cropId);
    if (preset) {
      loadPreset(preset);
    }
  };

  // Convert acre to bigha multiplier if acre chosen (1 acre ~ 1.6 Bigha in Malwa)
  const effectiveBigha = areaUnit === 'acre' ? landArea * 1.6 : landArea;

  // Real-time calculations
  const totalCostPerBigha = seedCost + fertilizerCost + pesticideCost + laborCost + tractorCost + irrigationCost + otherCost;
  const totalCostAllArea = Math.round(totalCostPerBigha * effectiveBigha);

  const totalYieldQuintals = Math.round(yieldPerUnit * effectiveBigha * 10) / 10;
  const grossRevenue = Math.round(totalYieldQuintals * sellingPrice);

  const netProfit = grossRevenue - totalCostAllArea;
  const profitPerBigha = effectiveBigha > 0 ? Math.round(netProfit / effectiveBigha) : 0;
  const costPerQuintal = totalYieldQuintals > 0 ? Math.round(totalCostAllArea / totalYieldQuintals) : 0;
  const roiPercentage = totalCostAllArea > 0 ? Math.round((netProfit / totalCostAllArea) * 100) : 0;
  const breakEvenRate = totalYieldQuintals > 0 ? Math.round(totalCostAllArea / totalYieldQuintals) : 0;

  // Selected preset object
  const currentPreset = CROP_PRESETS.find(p => p.id === selectedCropId) || CROP_PRESETS[0];

  // Fertilizer calculator
  const dapBags = Math.round(((currentPreset.recommendedKhad.dapKgPerBigha * effectiveBigha) / 50) * 10) / 10;
  const ureaBags = Math.round(((currentPreset.recommendedKhad.ureaKgPerBigha * effectiveBigha) / 45) * 10) / 10;
  const potashBags = Math.round(((currentPreset.recommendedKhad.potashKgPerBigha * effectiveBigha) / 50) * 10) / 10;
  const zincKg = Math.round(currentPreset.recommendedKhad.zincKgPerBigha * effectiveBigha);
  const approxFertilizerBudget = Math.round((dapBags * 1350) + (ureaBags * 270) + (potashBags * 1700) + (zincKg * 110));

  // Add projected income/expense to ledger
  const handleSaveToLedger = () => {
    const entry: LedgerEntry = {
      id: `calc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      crop: currentPreset.cropNameHi,
      category: 'fasal_bikri',
      itemDescription: `${currentPreset.cropNameHi} संभावित बिक्री (${effectiveBigha} बीघा @ ${yieldPerUnit} qu/बीघा)`,
      amount: grossRevenue,
      quantity: totalYieldQuintals,
      unit: 'क्विंटल (q)',
      ratePerUnit: sellingPrice,
      paymentStatus: 'paid',
      paidAmount: grossRevenue,
      notes: `कैलकुलेटर द्वारा अनुमानित शुद्ध मुनाफा: ₹${netProfit.toLocaleString('en-IN')}, कुल लागत: ₹${totalCostAllArea.toLocaleString('en-IN')}`,
      createdAt: Date.now(),
    };
    onAddProjectionToLedger(entry);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-900 text-lg">🧮</span>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              फसल लागत, उपज व मुनाफा कैलकुलेटर
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500">
            बीज, खाद, कीटनाशक, जुताई व मंडी भाव के अनुसार फसल लगाने से पहले ही निकालें शुद्ध लाभ का गणित।
          </p>
        </div>

        {/* Tab Switcher: Profit vs Fertilizer */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start md:self-auto">
          <button
            onClick={() => setActiveCalcTab('profit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeCalcTab === 'profit' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>💰 फसल मुनाफा हिसाब</span>
          </button>
          <button
            onClick={() => setActiveCalcTab('fertilizer')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeCalcTab === 'fertilizer' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🌱 खाद मात्रा कैलकुलेटर</span>
          </button>
        </div>
      </div>

      {activeCalcTab === 'profit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Inputs Form */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
            {/* Step 1: Crop Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                १. फसल का चुनाव करें (Select Crop)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CROP_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleCropPresetChange(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 ${
                      selectedCropId === p.id
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/60 text-stone-700'
                    }`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <span className="text-xs font-semibold leading-tight">{p.cropNameHi}</span>
                    <span className="text-[10px] text-stone-400">{p.season}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Land Area */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    २. खेत का रकबा / क्षेत्रफल (Land Area)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      min="0.25"
                      value={landArea}
                      onChange={(e) => setLandArea(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-24 border border-stone-300 bg-white rounded-lg px-3 py-1.5 text-base font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500"
                    />
                    <select
                      value={areaUnit}
                      onChange={(e) => setAreaUnit(e.target.value as any)}
                      className="border border-stone-300 bg-white rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-700"
                    >
                      <option value="bigha">बीघा (Bigha)</option>
                      <option value="acre">एकड़ (Acre)</option>
                    </select>
                    <span className="text-xs text-stone-500">
                      (= {effectiveBigha.toFixed(1)} बीघा मालवा मान)
                    </span>
                  </div>
                </div>

                {/* Quick Area Buttons */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 5, 10].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setLandArea(n)}
                      className={`text-xs px-2 py-1 rounded-md border font-semibold ${
                        landArea === n ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Expenses per Bigha */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  ३. प्रति बीघा अनुमानित खर्च (Costs per Bigha in ₹)
                </label>
                <button
                  type="button"
                  onClick={() => loadPreset(currentPreset)}
                  className="text-[11px] text-emerald-800 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>मालवा औसत रीसेट करें</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-semibold text-stone-600 block mb-1">
                    🌾 बीज खर्च
                  </span>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-xs text-stone-400">₹</span>
                    <input
                      type="number"
                      value={seedCost}
                      onChange={(e) => setSeedCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-stone-300 rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-stone-900"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-semibold text-emerald-800 block mb-1">
                    🌱 खाद व उर्वरक
                  </span>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-xs text-stone-400">₹</span>
                    <input
                      type="number"
                      value={fertilizerCost}
                      onChange={(e) => setFertilizerCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-stone-300 rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-stone-900"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-semibold text-amber-800 block mb-1">
                    🛡️ कीटनाशक स्प्रे
                  </span>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-xs text-stone-400">₹</span>
                    <input
                      type="number"
                      value={pesticideCost}
                      onChange={(e) => setPesticideCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-stone-300 rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-stone-900"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-semibold text-orange-800 block mb-1">
                    👷 मजदूरी व निंदाई
                  </span>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-xs text-stone-400">₹</span>
                    <input
                      type="number"
                      value={laborCost}
                      onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-stone-300 rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-stone-900"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-semibold text-yellow-800 block mb-1">
                    🚜 ट्रैक्टर व जुताई
                  </span>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-xs text-stone-400">₹</span>
                    <input
                      type="number"
                      value={tractorCost}
                      onChange={(e) => setTractorCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-stone-300 rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-stone-900"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-semibold text-blue-800 block mb-1">
                    💧 सिंचाई व बिजली
                  </span>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-xs text-stone-400">₹</span>
                    <input
                      type="number"
                      value={irrigationCost}
                      onChange={(e) => setIrrigationCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-stone-300 rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-stone-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Yield and Selling Price */}
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
              <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                ४. पैदावार व अनुमानित मंडी भाव
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-semibold text-stone-700 block mb-1">
                    प्रति बीघा अनुमानित पैदावार (Yield)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      value={yieldPerUnit}
                      onChange={(e) => setYieldPerUnit(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-sm font-bold text-stone-900"
                    />
                    <span className="text-xs font-semibold text-stone-600 shrink-0">
                      क्विंटल / बीघा
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    कुल उत्पादन: <strong>{totalYieldQuintals} क्विंटल</strong>
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-stone-700">
                      संभावित मंडी भाव (Price)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const m = MANDSAUR_MANDI_RATES.find(r => r.commodityHi.includes(currentPreset.cropNameHi.split(' ')[0]));
                        if (m) setSellingPrice(m.modalPrice);
                      }}
                      className="text-[10px] text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-1.5 py-0.5 rounded"
                    >
                      मंडी भाव लाएं
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-stone-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-emerald-300 rounded-lg pl-7 pr-3 py-1.5 text-sm font-bold text-stone-900"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    रुपये प्रति क्विंटल
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Output / Profit Results Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`rounded-3xl p-6 text-white shadow-lg border relative overflow-hidden ${
              netProfit >= 0 
                ? 'bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 border-emerald-700' 
                : 'bg-gradient-to-br from-rose-800 via-rose-900 to-red-950 border-rose-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200">
                  {effectiveBigha} बीघा का शुद्ध परिणाम
                </span>
                <span className="text-xs font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">
                  {netProfit >= 0 ? `+${roiPercentage}% लाभ` : `${roiPercentage}% नुकसान`}
                </span>
              </div>

              {/* Big Profit Number */}
              <div className="my-3">
                <span className="text-xs text-stone-300 block">अनुमानित शुद्ध मुनाफा (Net Profit)</span>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {netProfit >= 0 ? '+' : '-'}₹{Math.abs(netProfit).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-emerald-200/90 mt-1">
                  प्रति बीघा बचत: <strong>₹{profitPerBigha.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-2 pt-4 border-t border-white/10 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stone-300">कुल संभावित आवक (बिक्री):</span>
                  <span className="font-bold text-amber-300">₹{grossRevenue.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-300">कुल लागत व खर्च:</span>
                  <span className="font-bold text-rose-300">₹{totalCostAllArea.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-300">लागत प्रति बीघा:</span>
                  <span className="font-semibold text-white">₹{totalCostPerBigha.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-300">लागत प्रति क्विंटल (Cost/q):</span>
                  <span className="font-semibold text-white">₹{costPerQuintal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-emerald-200 font-semibold">न्यूनतम भाव (ब्रेक-ईवन):</span>
                  <span className="font-bold text-amber-200">
                    कम से कम ₹{breakEvenRate}/qu
                  </span>
                </div>
              </div>

              {/* Action: Add to Ledger */}
              <div className="mt-5 pt-4 border-t border-white/15">
                <button
                  onClick={handleSaveToLedger}
                  className="w-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-emerald-950 font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>यह संभावित बजट बही-खाता में जोड़ें</span>
                </button>
                {savedNotification && (
                  <div className="mt-2 text-center text-xs text-amber-200 font-bold flex items-center justify-center gap-1 animate-bounce">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>सफलतापूर्वक बही-खाता में दर्ज किया गया!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Farmer Decision Advice */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                <span>💡</span>
                <span>किसान लाभ सलाह (Agronomy Insight):</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                यदि मंडी भाव <strong>₹{breakEvenRate}</strong> से ऊपर रहता है, तभी यह फसल शुद्ध मुनाफा देगी। वर्तमान में मंदसौर मंडी में {currentPreset.cropNameHi} का भाव लगभग <strong>₹{sellingPrice.toLocaleString('en-IN')}</strong> है, जिससे आपको लगभग <strong>{roiPercentage}%</strong> का लाभ मिल सकता है।
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Fertilizer Requirement Calculator */
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-700" />
              <span>वैज्ञानिक खाद मात्रा कैलकुलेटर (NPK / DAP / Urea)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {currentPreset.cropNameHi} के लिए {effectiveBigha} बीघा खेत में अनुशंसित संतुलित पोषण ताकि फसल भरपूर हो और खाद पर फालतू खर्च न हो।
            </p>
          </div>

          {/* Cards for each Fertilizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* DAP */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1">
                <span>DAP (18:46:0)</span>
                <span>फास्फोरस</span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-800">
                {dapBags} <span className="text-sm font-semibold">बोरी (Bags)</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-1">
                कुल: {Math.round(currentPreset.recommendedKhad.dapKgPerBigha * effectiveBigha)} किग्रा (बुवाई के समय)
              </div>
            </div>

            {/* Urea */}
            <div className="p-4 rounded-2xl bg-lime-50 border border-lime-200">
              <div className="flex items-center justify-between text-xs font-bold text-lime-900 mb-1">
                <span>यूरिया (Urea 46% N)</span>
                <span>नाइट्रोजन</span>
              </div>
              <div className="text-2xl font-extrabold text-lime-800">
                {ureaBags} <span className="text-sm font-semibold">बोरी (Bags)</span>
              </div>
              <div className="text-[11px] text-lime-700 mt-1">
                कुल: {Math.round(currentPreset.recommendedKhad.ureaKgPerBigha * effectiveBigha)} किग्रा (दो किस्तों में)
              </div>
            </div>

            {/* Potash */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1">
                <span>पोटाश (MOP 60% K)</span>
                <span>पोटाश (चमक व दाना)</span>
              </div>
              <div className="text-2xl font-extrabold text-amber-800">
                {potashBags} <span className="text-sm font-semibold">बोरी (Bags)</span>
              </div>
              <div className="text-[11px] text-amber-700 mt-1">
                कुल: {Math.round(currentPreset.recommendedKhad.potashKgPerBigha * effectiveBigha)} किग्रा (लहसुन में जरूरी)
              </div>
            </div>

            {/* Zinc Sulphate */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                <span>जिंक सल्फर</span>
                <span>सूक्ष्म पोषक तत्व</span>
              </div>
              <div className="text-2xl font-extrabold text-stone-800">
                {zincKg} <span className="text-sm font-semibold">किग्रा (kg)</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                पीलापन रोकने व जड़ों के विकास हेतु
              </div>
            </div>
          </div>

          {/* Fertilizer Application Schedule */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs text-stone-700 leading-relaxed">
            <h4 className="font-bold text-stone-900 text-sm">
              📅 खाद देने का सही समय व तरीका:
            </h4>
            <div className="space-y-1.5">
              <p>
                <strong>१. बुवाई के समय (Basal Dose):</strong> पूरी DAP और पोटाश की मात्रा तथा यूरिया का 1/3 भाग आखिरी जुताई के समय खेत में मिला दें।
              </p>
              <p>
                <strong>२. पहली सिंचाई पर (First Watering):</strong> यूरिया का 1/3 भाग सिंचाई के तुरंत पहले या बाद में दें।
              </p>
              <p>
                <strong>३. गांठ/फूल बनने पर (Vegetative/Bulbing):</strong> बचा हुआ यूरिया व सूक्ष्म पोषक तत्वों का छिड़काव करें। लहसुन व प्याज में पोटाश से कंद बड़ा व चमकदार बनता है।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
