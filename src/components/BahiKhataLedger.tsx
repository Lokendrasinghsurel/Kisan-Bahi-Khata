import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  IndianRupee, 
  Calendar, 
  User, 
  AlertTriangle,
  CheckCircle,
  Share2,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { LedgerEntry, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, POPULAR_CROPS } from '../utils/constants';
import { AgroAdvertisements } from './AgroAdvertisements';

interface BahiKhataLedgerProps {
  entries: LedgerEntry[];
  onOpenNewEntry: () => void;
  onEditEntry: (entry: LedgerEntry) => void;
  onDeleteEntry: (id: string) => void;
  onQuickAddExpenseForShop?: (shopName: string, pesticideName?: string) => void;
  onResetDemoData?: () => void;
  farmerName?: string;
  lang: 'hi' | 'hinglish';
}

export const BahiKhataLedger: React.FC<BahiKhataLedgerProps> = ({
  entries,
  onOpenNewEntry,
  onEditEntry,
  onDeleteEntry,
  onQuickAddExpenseForShop,
  onResetDemoData,
  farmerName,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense' | 'khad' | 'kitnashak' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc'>('date-desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter(item => {
      // Type / Category quick filters
      if (selectedType === 'income' && item.type !== 'income') return false;
      if (selectedType === 'expense' && item.type !== 'expense') return false;
      if (selectedType === 'khad' && item.category !== 'khad') return false;
      if (selectedType === 'kitnashak' && item.category !== 'kitnashak') return false;
      if (selectedType === 'pending' && item.paymentStatus === 'paid') return false;

      // Crop filter
      if (selectedCrop !== 'all' && item.crop !== selectedCrop) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = item.itemDescription.toLowerCase().includes(q);
        const matchParty = item.partyName?.toLowerCase().includes(q) || false;
        const matchNotes = item.notes?.toLowerCase().includes(q) || false;
        const matchCrop = item.crop.toLowerCase().includes(q);
        return matchDesc || matchParty || matchNotes || matchCrop;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      return 0;
    });
  }, [entries, selectedType, selectedCrop, searchQuery, sortBy]);

  // Calculations for KPI Cards
  const totalIncome = useMemo(() => {
    return entries.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  }, [entries]);

  const totalExpense = useMemo(() => {
    return entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  }, [entries]);

  const netProfit = totalIncome - totalExpense;

  const totalKhadKitnashak = useMemo(() => {
    return entries
      .filter(e => e.category === 'khad' || e.category === 'kitnashak')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [entries]);

  const totalUdharPending = useMemo(() => {
    return entries
      .filter(e => e.paymentStatus !== 'paid')
      .reduce((acc, curr) => acc + (curr.amount - (curr.paidAmount || 0)), 0);
  }, [entries]);

  const getCategoryDetails = (entry: LedgerEntry) => {
    if (entry.type === 'expense') {
      const found = EXPENSE_CATEGORIES.find(c => c.id === entry.category);
      return { label: found?.labelHi || 'खर्च', icon: found?.icon || '📦' };
    } else {
      const found = INCOME_CATEGORIES.find(c => c.id === entry.category);
      return { label: found?.labelHi || 'आमदनी', icon: found?.icon || '💰' };
    }
  };

  const handleShareEntry = (entry: LedgerEntry) => {
    const text = `🌾 *किसान बही-खाता पर्ची*\n📅 तारीख: ${entry.date}\n🌱 फसल: ${entry.crop}\n📌 विवरण: ${entry.itemDescription}\n💰 राशि: ₹${entry.amount.toLocaleString('en-IN')}\n🏷️ स्थिति: ${entry.paymentStatus === 'paid' ? 'पूरा भुगतान' : 'उधार/बाकी'}\n👤 व्यापारी/व्यक्ति: ${entry.partyName || 'लागू नहीं'}`;
    if (navigator.share) {
      navigator.share({ title: 'किसान बही-खाता', text }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Stats Header Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Income */}
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-emerald-600/60 relative overflow-hidden">
          <div className="absolute -right-2 -bottom-2 text-6xl opacity-10">🌾</div>
          <div className="flex items-center justify-between text-emerald-200 text-xs sm:text-sm font-medium mb-1">
            <span>कुल आमदनी (Income)</span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            ₹{totalIncome.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-200/90 mt-0.5">
            फसल बिक्री व उपज
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-amber-500/60 relative overflow-hidden">
          <div className="absolute -right-2 -bottom-2 text-6xl opacity-10">🚜</div>
          <div className="flex items-center justify-between text-amber-100 text-xs sm:text-sm font-medium mb-1">
            <span>कुल खर्च (Expense)</span>
            <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200" />
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            ₹{totalExpense.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] sm:text-[11px] text-amber-100/90 mt-0.5">
            खाद, दवा, बीज, मजदूरी
          </div>
        </div>

        {/* Net Profit */}
        <div className={`text-white rounded-2xl p-3.5 sm:p-5 shadow-xs border relative overflow-hidden ${
          netProfit >= 0 
            ? 'bg-gradient-to-br from-green-700 to-teal-900 border-green-600/60' 
            : 'bg-gradient-to-br from-rose-700 to-red-900 border-rose-600/60'
        }`}>
          <div className="absolute -right-2 -bottom-2 text-6xl opacity-10">
            {netProfit >= 0 ? '✨' : '⚠️'}
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-1 opacity-90">
            <span>{netProfit >= 0 ? 'शुद्ध मुनाफा (Profit)' : 'घाटा (Loss)'}</span>
            <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            {netProfit >= 0 ? '+' : '-'}₹{Math.abs(netProfit).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] sm:text-[11px] opacity-90 mt-0.5">
            {totalIncome > 0 ? `मार्जिन: ${Math.round((netProfit / totalIncome) * 100)}%` : 'हिसाब चालू है'}
          </div>
        </div>

        {/* Khad & Kitnashak Total + Udhar */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-1">
              <span>खाद व दवा खर्च</span>
              <span>🌱+🛡️</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-stone-900">
              ₹{totalKhadKitnashak.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="pt-1.5 border-t border-stone-100 mt-1.5 flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-rose-600">उधार / बकाया:</span>
            <span className="text-xs font-bold bg-rose-50 text-rose-700 px-2 py-0.2 rounded-full border border-rose-200">
              ₹{totalUdharPending.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Search, Filters, Quick Add */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="खोजें: DAP, कोराजन, रियावन लहसुन, दुकानदार या पर्ची..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Crop Selector & Sort */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">🌾 सभी फसलें (All Crops)</option>
              {POPULAR_CROPS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2 text-xs sm:text-sm font-medium text-stone-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="date-desc">नया पहले (Newest)</option>
              <option value="date-asc">पुराना पहले (Oldest)</option>
              <option value="amount-desc">बड़ी रकम (Highest)</option>
            </select>

            <button
              onClick={onOpenNewEntry}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>नई एंट्री</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs font-semibold text-stone-400 shrink-0">फिल्टर:</span>
          
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedType === 'all'
                ? 'bg-stone-800 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            सभी ({entries.length})
          </button>

          <button
            onClick={() => setSelectedType('income')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              selectedType === 'income'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>💰 केवल आमदनी</span>
          </button>

          <button
            onClick={() => setSelectedType('expense')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              selectedType === 'expense'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>📉 केवल खर्च</span>
          </button>

          <button
            onClick={() => setSelectedType('khad')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              selectedType === 'khad'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span>🌱 केवल खाद (DAP/Urea)</span>
          </button>

          <button
            onClick={() => setSelectedType('kitnashak')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              selectedType === 'kitnashak'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>🛡️ केवल कीटनाशक / दवा</span>
          </button>

          <button
            onClick={() => setSelectedType('pending')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              selectedType === 'pending'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span>⏳ केवल उधार / बाकी</span>
          </button>
        </div>
      </div>

      {/* Featured Agro Agency Advertisements (Bhoomi Agro Surel & Mali Krishi Kendra Kharsod) */}
      <AgroAdvertisements 
        onQuickAddExpenseForShop={onQuickAddExpenseForShop} 
        lang={lang} 
      />

      {/* Ledger Cards / List View */}
      {filteredEntries.length === 0 ? (
        <div className="bg-gradient-to-b from-white to-amber-50/40 rounded-3xl p-6 sm:p-10 text-center border-2 border-dashed border-emerald-300 shadow-sm space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-400 text-emerald-950 mx-auto flex items-center justify-center text-4xl shadow-md border-2 border-white">
            🌾
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              ताजा बही-खाता (Fresh Ledger)
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              {farmerName ? `नमस्ते ${farmerName}! आपका खाता तैयार है` : 'आपका डिजिटल बही-खाता तैयार है'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              अभी आपके खाते में कोई पुराना हिसाब दर्ज नहीं है। आप अपनी फसल, खाद, दवा या मंडी बिक्री का हिसाब तुरंत दर्ज कर सकते हैं।
            </p>
          </div>

          {/* Big Add Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenNewEntry}
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-extrabold px-8 py-3.5 rounded-2xl text-base shadow-lg transition inline-flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5 text-amber-300" />
              <span>+ अपनी पहली एंट्री जोड़ें (Add First Entry)</span>
            </button>

            {onResetDemoData && (
              <button
                onClick={onResetDemoData}
                className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-3 rounded-2xl text-xs transition border border-stone-200"
              >
                नमूना (Demo) रिकॉर्ड लोड करें
              </button>
            )}
          </div>

          {/* Quick Category Action Cards for new customer */}
          <div className="pt-4 border-t border-stone-200/80 max-w-xl mx-auto">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-3">
              शुरू करने के लिए कोई भी एक मद चुनें:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={onOpenNewEntry}
                className="p-3 bg-white hover:bg-emerald-50 rounded-xl border border-stone-200 hover:border-emerald-300 transition text-center shadow-xs group"
              >
                <span className="text-2xl block mb-1">🌱</span>
                <span className="text-xs font-bold text-stone-800 group-hover:text-emerald-800 block">खाद (DAP/Urea)</span>
                <span className="text-[10px] text-stone-400">खर्च दर्ज करें</span>
              </button>

              <button
                onClick={onOpenNewEntry}
                className="p-3 bg-white hover:bg-amber-50 rounded-xl border border-stone-200 hover:border-amber-300 transition text-center shadow-xs group"
              >
                <span className="text-2xl block mb-1">🛡️</span>
                <span className="text-xs font-bold text-stone-800 group-hover:text-amber-800 block">कीटनाशक दवा</span>
                <span className="text-[10px] text-stone-400">स्प्रे खर्च</span>
              </button>

              <button
                onClick={onOpenNewEntry}
                className="p-3 bg-white hover:bg-green-50 rounded-xl border border-stone-200 hover:border-green-300 transition text-center shadow-xs group"
              >
                <span className="text-2xl block mb-1">💰</span>
                <span className="text-xs font-bold text-stone-800 group-hover:text-green-800 block">फसल बिक्री</span>
                <span className="text-[10px] text-stone-400">आमदनी जोड़ें</span>
              </button>

              <button
                onClick={onOpenNewEntry}
                className="p-3 bg-white hover:bg-yellow-50 rounded-xl border border-stone-200 hover:border-yellow-300 transition text-center shadow-xs group"
              >
                <span className="text-2xl block mb-1">🚜</span>
                <span className="text-xs font-bold text-stone-800 group-hover:text-yellow-800 block">ट्रैक्टर / मजदूरी</span>
                <span className="text-[10px] text-stone-400">जुताई खर्च</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 px-1">
            <span>कुल रिकॉर्ड: {filteredEntries.length}</span>
            <span>
              दिखाया जा रहा हिसाब: ₹{filteredEntries.reduce((a, b) => b.type === 'income' ? a + b.amount : a - b.amount, 0).toLocaleString('en-IN')}
            </span>
          </div>

          {filteredEntries.map((entry) => {
            const { label, icon } = getCategoryDetails(entry);
            const isExpense = entry.type === 'expense';
            const isPending = entry.paymentStatus === 'pending' || entry.paymentStatus === 'partial';

            return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition hover:shadow-md ${
                  isExpense ? 'hover:border-amber-400 border-stone-200' : 'hover:border-emerald-400 border-stone-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Icon, Description, Tags */}
                  <div className="flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner ${
                      isExpense ? 'bg-amber-100/80 text-amber-900' : 'bg-emerald-100/80 text-emerald-900'
                    }`}>
                      {icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-stone-900 text-base sm:text-lg">
                          {entry.itemDescription}
                        </span>

                        {/* Crop badge */}
                        <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full border border-stone-200">
                          {entry.crop}
                        </span>

                        {/* Category label */}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          isExpense ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {label}
                        </span>

                        {/* Payment Status badge */}
                        {isPending ? (
                          <span className="text-[11px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-300 animate-pulse">
                            उधार / बाकी: ₹{(entry.amount - (entry.paidAmount || 0)).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> नकद पूरा
                          </span>
                        )}
                      </div>

                      {/* Meta line: Date, Qty & Rate, Party, Notes */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 pt-0.5">
                        <span className="flex items-center gap-1 text-stone-600 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {new Intl.DateTimeFormat('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(entry.date))}
                        </span>

                        {entry.quantity && (
                          <span className="bg-stone-50 px-2 py-0.5 rounded border border-stone-200 font-medium text-stone-700">
                            मात्रा: {entry.quantity} {entry.unit || ''} {entry.ratePerUnit ? `@ ₹${entry.ratePerUnit.toLocaleString('en-IN')}` : ''}
                          </span>
                        )}

                        {entry.partyName && (
                          <span className="flex items-center gap-1 text-stone-700 font-semibold">
                            <User className="w-3.5 h-3.5 text-stone-400" />
                            {entry.partyName}
                          </span>
                        )}

                        {entry.notes && (
                          <span className="text-stone-500 italic max-w-xs truncate">
                            📝 {entry.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 gap-2 shrink-0">
                    <div className={`text-xl sm:text-2xl font-extrabold flex items-center tracking-tight ${
                      isExpense ? 'text-amber-700' : 'text-emerald-700'
                    }`}>
                      <span>{isExpense ? '- ' : '+ '}</span>
                      <span>₹{entry.amount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleShareEntry(entry)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        title="व्हाट्सएप पर शेयर करें"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEditEntry(entry)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-blue-700 hover:bg-blue-50 transition"
                        title="संपादित करें (Edit)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {deleteConfirmId === entry.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                          <span className="text-[10px] text-rose-700 font-bold">हटाएं?</span>
                          <button
                            onClick={() => {
                              onDeleteEntry(entry.id);
                              setDeleteConfirmId(null);
                            }}
                            className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded font-bold hover:bg-rose-700"
                          >
                            हाँ
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-stone-500 text-[10px] px-1 hover:text-stone-800"
                          >
                            नहीं
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(entry.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="हटाएं (Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
