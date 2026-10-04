import React, { useMemo, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  PieChart as PieChartIcon, 
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Sprout,
  ShieldAlert,
  Wallet
} from 'lucide-react';
import { LedgerEntry } from '../types';
import { EXPENSE_CATEGORIES } from '../utils/constants';

interface DashboardAnalyticsProps {
  entries: LedgerEntry[];
  lang: 'hi' | 'hinglish';
  onNavigateToLedger: () => void;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  entries,
  lang,
  onNavigateToLedger,
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | '3months' | 'thisYear'>('all');

  // Filter entries by time if applicable
  const currentFilteredEntries = useMemo(() => {
    if (timeFilter === 'all') return entries;
    const now = new Date().getTime();
    const daysLimit = timeFilter === '3months' ? 90 : 365;
    return entries.filter(e => {
      const entryTime = new Date(e.date).getTime();
      return (now - entryTime) <= daysLimit * 86400000;
    });
  }, [entries, timeFilter]);

  // Overall Totals
  const totalIncome = useMemo(() => {
    return currentFilteredEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  }, [currentFilteredEntries]);

  const totalExpense = useMemo(() => {
    return currentFilteredEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  }, [currentFilteredEntries]);

  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // Monthly breakdown for SVG Bar Chart
  const monthlyData = useMemo(() => {
    const map = new Map<string, { monthKey: string; monthLabel: string; income: number; expense: number }>();

    // Process entries
    currentFilteredEntries.forEach(item => {
      const d = new Date(item.date);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleDateString('hi-IN', { month: 'short', year: '2-digit' });

      if (!map.has(key)) {
        map.set(key, { monthKey: key, monthLabel: monthName, income: 0, expense: 0 });
      }
      const cur = map.get(key)!;
      if (item.type === 'income') {
        cur.income += item.amount;
      } else {
        cur.expense += item.amount;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [currentFilteredEntries]);

  // Maximum value for bar scaling
  const maxMonthlyVal = useMemo(() => {
    let max = 1000;
    monthlyData.forEach(m => {
      if (m.income > max) max = m.income;
      if (m.expense > max) max = m.expense;
    });
    return max * 1.15; // 15% headroom
  }, [monthlyData]);

  // Category breakdown for expenses (Khad, Kitnashak, Mazdoori, etc.)
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, { label: string; icon: string; amount: number }>();

    EXPENSE_CATEGORIES.forEach(cat => {
      map.set(cat.id, { label: cat.labelHi, icon: cat.icon, amount: 0 });
    });

    currentFilteredEntries
      .filter(e => e.type === 'expense')
      .forEach(e => {
        const cat = map.get(e.category);
        if (cat) {
          cat.amount += e.amount;
        } else {
          // fallback
          map.set('other_expense', {
            label: 'अन्य खर्च',
            icon: '📝',
            amount: (map.get('other_expense')?.amount || 0) + e.amount
          });
        }
      });

    return Array.from(map.entries())
      .map(([id, val]) => ({ id, ...val, percent: totalExpense > 0 ? (val.amount / totalExpense) * 100 : 0 }))
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [currentFilteredEntries, totalExpense]);

  // Crop-wise Profit & Loss
  const cropPerformance = useMemo(() => {
    const map = new Map<string, { crop: string; income: number; expense: number; khad: number; kitnashak: number }>();

    currentFilteredEntries.forEach(item => {
      const cropName = item.crop;
      if (!map.has(cropName)) {
        map.set(cropName, { crop: cropName, income: 0, expense: 0, khad: 0, kitnashak: 0 });
      }
      const data = map.get(cropName)!;
      if (item.type === 'income') {
        data.income += item.amount;
      } else {
        data.expense += item.amount;
        if (item.category === 'khad') data.khad += item.amount;
        if (item.category === 'kitnashak') data.kitnashak += item.amount;
      }
    });

    return Array.from(map.values())
      .map(c => {
        const profit = c.income - c.expense;
        const roi = c.expense > 0 ? Math.round((profit / c.expense) * 100) : 0;
        return { ...c, profit, roi };
      })
      .sort((a, b) => b.income - a.income);
  }, [currentFilteredEntries]);

  // Specific Khad & Kitnashak expenses
  const khadTotal = useMemo(() => {
    return currentFilteredEntries.filter(e => e.category === 'khad').reduce((s, e) => s + e.amount, 0);
  }, [currentFilteredEntries]);

  const kitnashakTotal = useMemo(() => {
    return currentFilteredEntries.filter(e => e.category === 'kitnashak').reduce((s, e) => s + e.amount, 0);
  }, [currentFilteredEntries]);

  const pendingUdhar = useMemo(() => {
    return currentFilteredEntries
      .filter(e => e.paymentStatus !== 'paid')
      .reduce((s, e) => s + (e.amount - (e.paidAmount || 0)), 0);
  }, [currentFilteredEntries]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            <span>खेती का ग्राफिकल वित्तीय विश्लेषण</span>
          </h2>
          <p className="text-xs text-stone-500">
            आमदनी, खाद, कीटनाशक खर्च व फसल अनुसार शुद्ध मुनाफे की वास्तविक स्थिति
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              timeFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            पूरा हिसाब (All Time)
          </button>
          <button
            onClick={() => setTimeFilter('3months')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              timeFilter === '3months' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            पिछले 3 महीने
          </button>
          <button
            onClick={() => setTimeFilter('thisYear')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              timeFilter === 'thisYear' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            यह वर्ष (2026)
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Income Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-2">
            <span>कुल आमदनी (Gross Income)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
              💰
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-emerald-700 tracking-tight">
            ₹{totalIncome.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">100%</span>
            <span>उपज व मंडी बिक्री से आवक</span>
          </div>
          <div className="h-1.5 w-full bg-emerald-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 w-full rounded-full"></div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-2">
            <span>कुल लागत व खर्च (Expenses)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold">
              🚜
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-amber-700 tracking-tight">
            ₹{totalExpense.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center gap-1">
            <span className="text-amber-600 font-semibold">
              {totalIncome > 0 ? `${Math.round((totalExpense / totalIncome) * 100)}%` : '0%'}
            </span>
            <span>कुल आमदनी का हिस्सा</span>
          </div>
          <div className="h-1.5 w-full bg-stone-100 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0)}%` }}
            ></div>
          </div>
        </div>

        {/* Net Profit / Loss Card */}
        <div className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden ${
          netProfit >= 0 ? 'bg-emerald-900 text-white border-emerald-800' : 'bg-rose-900 text-white border-rose-800'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium mb-2 opacity-90">
            <span>{netProfit >= 0 ? 'शुद्ध मुनाफा (Net Profit)' : 'कुल घाटा (Net Loss)'}</span>
            <span className="text-lg">{netProfit >= 0 ? '🏆' : '⚠️'}</span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            {netProfit >= 0 ? '+' : '-'}₹{Math.abs(netProfit).toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs opacity-90 flex items-center gap-1.5">
            <span className="font-bold bg-white/20 px-2 py-0.5 rounded">
              {profitMargin}% मुनाफा मार्जिन
            </span>
            <span>{netProfit >= 0 ? 'सफल लाभ' : 'लागत से कम'}</span>
          </div>
          <div className="h-1.5 w-full bg-white/20 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-amber-300 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, Math.min(100, profitMargin))}%` }}
            ></div>
          </div>
        </div>

        {/* Chemical & Fertilizer Spend Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-2">
            <span>खाद व कीटनाशक कुल</span>
            <div className="w-8 h-8 rounded-lg bg-lime-100 text-lime-900 flex items-center justify-center text-sm font-bold">
              🌱
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
            ₹{(khadTotal + kitnashakTotal).toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between pt-1 border-t border-stone-100">
            <span className="text-emerald-700 font-medium">खाद: ₹{khadTotal.toLocaleString('en-IN')}</span>
            <span className="text-amber-700 font-medium">दवा: ₹{kitnashakTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-semibold">
            दुकानों का उधार बकाया: ₹{pendingUdhar.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Main Graphical Section: Monthly Trends & Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Monthly Income vs Expense Bar Chart */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <span>📊</span>
                <span>मासिक आमदनी बनाम खर्च (Monthly Comparison)</span>
              </h3>
              <p className="text-xs text-stone-500">महीने के हिसाब से आमदनी व खर्चे का तुलनात्मक ग्राफ</p>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span>
                <span>आमदनी (Income)</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-800">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                <span>खर्च (Expense)</span>
              </span>
            </div>
          </div>

          {/* SVG Interactive Bar Chart */}
          {monthlyData.length === 0 ? (
            <div className="py-16 text-center text-stone-400 text-xs">
              ग्राफ के लिए पर्याप्त डेटा उपलब्ध नहीं है।
            </div>
          ) : (
            <div className="pt-4">
              <div className="space-y-5">
                {monthlyData.map((m) => {
                  const incomeWidth = Math.min(100, Math.round((m.income / maxMonthlyVal) * 100));
                  const expenseWidth = Math.min(100, Math.round((m.expense / maxMonthlyVal) * 100));
                  const diff = m.income - m.expense;

                  return (
                    <div key={m.monthKey} className="space-y-1.5 bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800">{m.monthLabel}</span>
                        <span className={`font-semibold ${diff >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {diff >= 0 ? `+₹${diff.toLocaleString('en-IN')} बचत` : `-₹${Math.abs(diff).toLocaleString('en-IN')} घाटा`}
                        </span>
                      </div>

                      {/* Income Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-emerald-800 w-14 shrink-0">आमदनी</span>
                        <div className="flex-1 bg-stone-200/70 rounded-full h-5 overflow-hidden flex items-center">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] font-bold text-white shadow-xs"
                            style={{ width: `${Math.max(10, incomeWidth)}%` }}
                          >
                            {m.income > 0 && `₹${(m.income / 1000).toFixed(1)}k`}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-stone-700 w-20 text-right shrink-0">
                          ₹{m.income.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Expense Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-amber-800 w-14 shrink-0">खर्च</span>
                        <div className="flex-1 bg-stone-200/70 rounded-full h-5 overflow-hidden flex items-center">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] font-bold text-white shadow-xs"
                            style={{ width: `${Math.max(10, expenseWidth)}%` }}
                          >
                            {m.expense > 0 && `₹${(m.expense / 1000).toFixed(1)}k`}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-stone-700 w-20 text-right shrink-0">
                          ₹{m.expense.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Expense Breakdown by Category */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-amber-600" />
              <span>खर्च का विभाजन (Expense Breakdown)</span>
            </h3>
            <p className="text-xs text-stone-500">
              किस मद (खाद, दवा, मजदूरी) में कितना पैसा खर्च हुआ
            </p>
          </div>

          {expenseByCategory.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              खर्च का कोई डेटा दर्ज नहीं है।
            </div>
          ) : (
            <div className="space-y-3">
              {expenseByCategory.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                    <span className="font-bold text-stone-900">
                      ₹{cat.amount.toLocaleString('en-IN')}{' '}
                      <span className="text-[11px] font-normal text-stone-500">
                        ({cat.percent.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cat.id === 'khad' 
                          ? 'bg-emerald-600' 
                          : cat.id === 'kitnashak' 
                          ? 'bg-amber-500' 
                          : cat.id === 'mazdoori' 
                          ? 'bg-orange-500' 
                          : cat.id === 'beej' 
                          ? 'bg-lime-500' 
                          : cat.id === 'diesel_tractor' 
                          ? 'bg-yellow-500' 
                          : 'bg-stone-500'
                      }`}
                      style={{ width: `${Math.max(4, cat.percent)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Fertilizer & Pesticide Tip */}
          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1 text-amber-950">
              💡 कृषि बचत सलाह:
            </span>
            <p className="leading-relaxed">
              आपके कुल खर्चे का <strong>{totalExpense > 0 ? (((khadTotal + kitnashakTotal) / totalExpense) * 100).toFixed(0) : 0}%</strong> केवल खाद व कीटनाशक पर लग रहा है। संतुलित मात्रा व मिट्टी परीक्षण (Soil Test) अनुसार ही खाद डालें।
            </p>
          </div>
        </div>
      </div>

      {/* Crop-wise Profit & Loss Cards (Fasal-vaar Munafa/Ghaata) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-700" />
              <span>फसल-वार आमदनी, खर्च व मुनाफा (Crop-wise Profit & Loss)</span>
            </h3>
            <p className="text-xs text-stone-500">प्रत्येक फसल का अलग-अलग शुद्ध हिसाब और मुनाफा दर (ROI)</p>
          </div>
          <button
            onClick={onNavigateToLedger}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>बही-खाता में सभी एंट्री देखें →</span>
          </button>
        </div>

        {cropPerformance.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-xs">
            फसलों का कोई हिसाब दर्ज नहीं है।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cropPerformance.map((crop) => {
              const isProfit = crop.profit >= 0;
              return (
                <div
                  key={crop.crop}
                  className={`p-4 rounded-2xl border transition hover:shadow-md ${
                    isProfit ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-stone-900 text-base truncate">
                      {crop.crop}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isProfit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isProfit ? `+${crop.roi}% ROI` : `${crop.roi}%`}
                    </span>
                  </div>

                  {/* Profit Amount */}
                  <div className="mb-3">
                    <span className="text-[11px] text-stone-500 block">शुद्ध मुनाफा / घाटा</span>
                    <span className={`text-xl font-extrabold ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isProfit ? '+' : '-'}₹{Math.abs(crop.profit).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="space-y-1.5 text-xs border-t border-stone-200/80 pt-2.5">
                    <div className="flex items-center justify-between text-stone-600">
                      <span>कुल आमदनी:</span>
                      <span className="font-bold text-emerald-700">₹{crop.income.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-600">
                      <span>कुल खर्च:</span>
                      <span className="font-bold text-amber-700">₹{crop.expense.toLocaleString('en-IN')}</span>
                    </div>
                    {(crop.khad > 0 || crop.kitnashak > 0) && (
                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-dashed border-stone-200">
                        <span>खाद: ₹{crop.khad.toLocaleString('en-IN')}</span>
                        <span>दवा: ₹{crop.kitnashak.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
