import React, { useState, useEffect } from 'react';
import { 
  X, 
  IndianRupee, 
  Calendar, 
  User, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Hash
} from 'lucide-react';
import { LedgerEntry, TransactionType, AllCategory, ExpenseCategory, IncomeCategory } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, POPULAR_CROPS, UNITS } from '../utils/constants';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: LedgerEntry) => void;
  editingEntry?: LedgerEntry | null;
  prefillData?: {
    partyName?: string;
    itemDescription?: string;
    category?: AllCategory;
  } | null;
  lang: 'hi' | 'hinglish';
}

const KHAD_PRESETS = ['DAP (डायमोनियम फॉस्फेट)', 'यूरिया (Urea)', 'NPK 12:32:16', 'पोटाश (MOP)', 'सल्फर 90% दानेदार', 'जिंक सल्फेट', 'गोबर खाद ट्राली'];
const KITNASHAK_PRESETS = ['कोराजन (इल्ली नाशक)', 'पेगासस (थ्रिप्स स्पेशल)', 'नैटिवो (फफूंदनाशक)', 'एम्प्लीगो (कीटनाशक)', 'खरपतवार नाशक (Nimar/Odyssey)', 'ह्यूमिक एसिड व टॉनिक'];

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  prefillData,
  lang,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [crop, setCrop] = useState<string>(POPULAR_CROPS[0]);
  const [category, setCategory] = useState<AllCategory>('khad');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unit, setUnit] = useState<string>('बोरी (Bag)');
  const [ratePerUnit, setRatePerUnit] = useState<number | ''>('');
  const [partyName, setPartyName] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'partial'>('paid');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingEntry) {
      setType(editingEntry.type);
      setDate(editingEntry.date);
      setCrop(editingEntry.crop);
      setCategory(editingEntry.category);
      setItemDescription(editingEntry.itemDescription);
      setAmount(editingEntry.amount);
      setQuantity(editingEntry.quantity ?? '');
      setUnit(editingEntry.unit ?? 'बोरी (Bag)');
      setRatePerUnit(editingEntry.ratePerUnit ?? '');
      setPartyName(editingEntry.partyName ?? '');
      setPaymentStatus(editingEntry.paymentStatus);
      setPaidAmount(editingEntry.paidAmount ?? editingEntry.amount);
      setNotes(editingEntry.notes ?? '');
    } else if (prefillData) {
      setType('expense');
      setDate(new Date().toISOString().split('T')[0]);
      setCrop(POPULAR_CROPS[0]);
      setCategory(prefillData.category || 'kitnashak');
      setItemDescription(prefillData.itemDescription || '');
      setAmount('');
      setQuantity('');
      setUnit('लीटर (Ltr)');
      setRatePerUnit('');
      setPartyName(prefillData.partyName || '');
      setPaymentStatus('paid');
      setPaidAmount('');
      setNotes('');
      setError('');
    } else {
      // Default reset
      setType('expense');
      setDate(new Date().toISOString().split('T')[0]);
      setCrop(POPULAR_CROPS[0]);
      setCategory('khad');
      setItemDescription('');
      setAmount('');
      setQuantity('');
      setUnit('बोरी (Bag)');
      setRatePerUnit('');
      setPartyName('');
      setPaymentStatus('paid');
      setPaidAmount('');
      setNotes('');
      setError('');
    }
  }, [editingEntry, prefillData, isOpen]);

  // When type changes, adjust default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('fasal_bikri');
      setUnit('क्विंटल (q)');
    } else {
      setCategory('khad');
      setUnit('बोरी (Bag)');
    }
  };

  // Auto-calculate amount when quantity or ratePerUnit changes
  const handleQuantityChange = (qVal: number | '') => {
    setQuantity(qVal);
    if (typeof qVal === 'number' && typeof ratePerUnit === 'number' && ratePerUnit > 0) {
      const calculated = Math.round(qVal * ratePerUnit);
      setAmount(calculated);
      if (paymentStatus === 'paid') setPaidAmount(calculated);
    }
  };

  const handleRateChange = (rVal: number | '') => {
    setRatePerUnit(rVal);
    if (typeof quantity === 'number' && quantity > 0 && typeof rVal === 'number') {
      const calculated = Math.round(quantity * rVal);
      setAmount(calculated);
      if (paymentStatus === 'paid') setPaidAmount(calculated);
    }
  };

  const handleAddQuickAmount = (increment: number) => {
    const cur = typeof amount === 'number' ? amount : 0;
    const next = cur + increment;
    setAmount(next);
    if (paymentStatus === 'paid') setPaidAmount(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('कृपया सही राशि (रुपये) दर्ज करें');
      return;
    }
    if (!itemDescription.trim()) {
      setError('कृपया विवरण या नाम दर्ज करें (जैसे DAP खाद या लहसुन बिक्री)');
      return;
    }

    const finalAmount = Number(amount);
    let finalPaid = finalAmount;
    if (paymentStatus === 'pending') {
      finalPaid = 0;
    } else if (paymentStatus === 'partial' && typeof paidAmount === 'number') {
      finalPaid = paidAmount;
    }

    const entry: LedgerEntry = {
      id: editingEntry ? editingEntry.id : `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date,
      type,
      crop,
      category,
      itemDescription: itemDescription.trim(),
      amount: finalAmount,
      quantity: typeof quantity === 'number' ? quantity : undefined,
      unit: unit || undefined,
      ratePerUnit: typeof ratePerUnit === 'number' ? ratePerUnit : undefined,
      partyName: partyName.trim() || undefined,
      paymentStatus,
      paidAmount: finalPaid,
      notes: notes.trim() || undefined,
      createdAt: editingEntry ? editingEntry.createdAt : Date.now(),
    };

    onSave(entry);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden border border-stone-200">
        {/* Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between text-white ${
          type === 'expense' ? 'bg-amber-600' : 'bg-emerald-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold">
              {type === 'expense' ? '📉' : '📈'}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                {editingEntry 
                  ? (lang === 'hi' ? 'खाता एंट्री संपादित करें' : 'Edit Ledger Entry') 
                  : (type === 'expense' ? (lang === 'hi' ? 'खर्च दर्ज करें (Expense)' : 'Add Expense') : (lang === 'hi' ? 'आमदनी दर्ज करें (Income)' : 'Add Income'))}
              </h2>
              <p className="text-xs opacity-90">
                {type === 'expense' ? 'खाद, कीटनाशक, बीज, मजदूरी या डीजल का खर्च' : 'फसल बिक्री, भूसा या अन्य आमदनी'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle: Expense vs Income */}
          {!editingEntry && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 px-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition ${
                  type === 'expense' 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>📉 खर्च (Expense)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 px-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition ${
                  type === 'income' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>📈 आमदनी (Income)</span>
              </button>
            </div>
          )}

          {/* Date & Crop Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                तारीख (Date) *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                फसल (Select Crop) *
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              >
                {POPULAR_CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              कैटेगरी चुनें (Category) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {type === 'expense'
                ? EXPENSE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded-xl text-left border text-xs flex items-center gap-2 transition ${
                        category === cat.id
                          ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-400'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/60 text-stone-700'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.labelHi}</span>
                    </button>
                  ))
                : INCOME_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded-xl text-left border text-xs flex items-center gap-2 transition ${
                        category === cat.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/60 text-stone-700'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.labelHi}</span>
                    </button>
                  ))}
            </div>
          </div>

          {/* Quick Presets for Khad & Kitnashak */}
          {type === 'expense' && category === 'khad' && (
            <div>
              <span className="text-[11px] font-semibold text-stone-500 block mb-1">
                खाद का नाम तुरंत चुनें:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {KHAD_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setItemDescription(p);
                      setUnit('बोरी (Bag)');
                    }}
                    className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg transition"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === 'expense' && category === 'kitnashak' && (
            <div>
              <span className="text-[11px] font-semibold text-stone-500 block mb-1">
                दवा / कीटनाशक तुरंत चुनें:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {KITNASHAK_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setItemDescription(p);
                      setUnit('लीटर (Ltr)');
                    }}
                    className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg transition"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Item Description / Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              विवरण / सामग्री का नाम (Item Description) *
            </label>
            <input
              type="text"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder={type === 'expense' ? 'उदा: DAP 3 बोरी, कोराजन स्प्रे, 8 मजदूर निंदाई' : 'उदा: लहसुन 20 कट्टे, सोयाबीन 15 क्विंटल'}
              required
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Quantity, Unit & Rate */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                मात्रा (Qty)
              </label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="उदा: 5"
                className="w-full border border-stone-300 bg-white rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                इकाई (Unit)
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-stone-300 bg-white rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                भाव (Rate / Unit)
              </label>
              <div className="relative">
                <span className="absolute left-2 top-2 text-stone-400 text-xs">₹</span>
                <input
                  type="number"
                  step="any"
                  value={ratePerUnit}
                  onChange={(e) => handleRateChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="उदा: 1350"
                  className="w-full border border-stone-300 bg-white rounded-lg pl-6 pr-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Total Amount in Rupees */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                कुल राशि (Total Amount in ₹) *
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-stone-400">तुरंत जोड़ें:</span>
                <button
                  type="button"
                  onClick={() => handleAddQuickAmount(500)}
                  className="text-[10px] bg-stone-200 hover:bg-stone-300 px-1.5 py-0.5 rounded text-stone-800"
                >
                  +₹500
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuickAmount(1000)}
                  className="text-[10px] bg-stone-200 hover:bg-stone-300 px-1.5 py-0.5 rounded text-stone-800"
                >
                  +₹1,000
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuickAmount(5000)}
                  className="text-[10px] bg-stone-200 hover:bg-stone-300 px-1.5 py-0.5 rounded text-stone-800"
                >
                  +₹5,000
                </button>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-stone-500 font-bold text-lg">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                  setAmount(val);
                  if (paymentStatus === 'paid') setPaidAmount(val);
                }}
                required
                placeholder="उदा: 8500"
                className="w-full border-2 border-emerald-600/60 rounded-xl pl-8 pr-3 py-2 text-lg font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Party Name / Merchant / Laborer & Payment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-500" />
                व्यापारी / दुकानदार / मजदूर का नाम
              </label>
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="उदा: पाटीदार खाद भंडार / अग्रवाल मंडी व्यापारी"
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                भुगतान स्थिति (Payment Status)
              </label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentStatus('paid');
                    setPaidAmount(typeof amount === 'number' ? amount : '');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition text-center ${
                    paymentStatus === 'paid'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  नकद / पूरा
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentStatus('pending');
                    setPaidAmount(0);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition text-center ${
                    paymentStatus === 'pending'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  उधार / बाकी
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('partial')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition text-center ${
                    paymentStatus === 'partial'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  आंशिक दिया
                </button>
              </div>
            </div>
          </div>

          {/* If Partial Payment */}
          {paymentStatus === 'partial' && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
              <span className="text-xs font-semibold text-amber-900 shrink-0">
                अभी कितना दिया?
              </span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1.5 text-stone-500 text-xs">₹</span>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="उदा: 2000"
                  className="w-full border border-amber-300 rounded-lg pl-6 pr-2 py-1 text-sm bg-white"
                />
              </div>
              <span className="text-xs text-rose-600 font-semibold shrink-0">
                बाकी: ₹{Math.max(0, (typeof amount === 'number' ? amount : 0) - (typeof paidAmount === 'number' ? paidAmount : 0))}
              </span>
            </div>
          )}

          {/* Notes / Remarks */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              खास टिप्पणी / बिल पर्ची नंबर (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="उदा: पर्ची नं. 452, लहसुन कटाई के बाद दिया जाएगा"
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition flex items-center gap-2 ${
                type === 'expense' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingEntry ? 'बदलाव सहेजें' : 'खाते में जोड़ें (Save)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
