import React, { useRef } from 'react';
import { Printer, X, Download, Share2, FileCheck, IndianRupee } from 'lucide-react';
import { LedgerEntry } from '../types';

interface PrintSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LedgerEntry[];
  farmerName?: string;
  villageName?: string;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({
  isOpen,
  onClose,
  entries,
  farmerName = 'श्री किसान जी',
  villageName = 'मंदसौर, मध्य प्रदेश',
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-6 overflow-hidden border border-stone-200">
        {/* Top Modal Controls */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">किसान बही-खाता पर्ची / रसीद प्रिंट</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट / PDF सेव करें</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper View */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto bg-stone-50" ref={printRef}>
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-300 shadow-sm space-y-6 text-stone-900">
            {/* Slip Header */}
            <div className="border-b-2 border-emerald-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
                  डिजिटल किसान डायरी • मंदसौर मंडी
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  किसान बही-खाता विवरण
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  फसल, खाद, कीटनाशक, मजदूरी व आमदनी का अधिकृत हिसाब
                </p>
              </div>

              <div className="sm:text-right text-xs text-stone-600 space-y-1">
                <div className="font-bold text-stone-900">किसान: {farmerName}</div>
                <div>ग्राम / क्षेत्र: {villageName}</div>
                <div>दिनांक: {new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>

            {/* Financial Summary Box */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-stone-100/80 rounded-xl text-center border border-stone-200">
              <div>
                <span className="text-[11px] text-stone-500 block">कुल आमदनी (बिक्री)</span>
                <span className="text-base sm:text-lg font-bold text-emerald-700">
                  ₹{totalIncome.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="border-x border-stone-300">
                <span className="text-[11px] text-stone-500 block">कुल खर्च (लागत)</span>
                <span className="text-base sm:text-lg font-bold text-amber-700">
                  ₹{totalExpense.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block">शुद्ध मुनाफा (लाभ)</span>
                <span className={`text-base sm:text-lg font-extrabold ${netProfit >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                  {netProfit >= 0 ? '+' : '-'}₹{Math.abs(netProfit).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-300 bg-stone-100 text-stone-700">
                    <th className="py-2 px-2.5 font-bold">तारीख</th>
                    <th className="py-2 px-2.5 font-bold">फसल</th>
                    <th className="py-2 px-2.5 font-bold">विवरण (खाद/दवा/बिक्री)</th>
                    <th className="py-2 px-2.5 font-bold">मात्रा</th>
                    <th className="py-2 px-2.5 font-bold">व्यापारी/दुकान</th>
                    <th className="py-2 px-2.5 font-bold text-right">रकम (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {entries.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50">
                      <td className="py-2 px-2.5 whitespace-nowrap text-stone-600 font-medium">
                        {item.date}
                      </td>
                      <td className="py-2 px-2.5 font-semibold text-stone-800 whitespace-nowrap">
                        {item.crop}
                      </td>
                      <td className="py-2 px-2.5 text-stone-800">
                        {item.itemDescription}
                        {item.paymentStatus !== 'paid' && (
                          <span className="ml-1 text-[10px] text-rose-600 font-bold">(उधार)</span>
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-stone-600 whitespace-nowrap">
                        {item.quantity ? `${item.quantity} ${item.unit || ''}` : '-'}
                      </td>
                      <td className="py-2 px-2.5 text-stone-600 whitespace-nowrap">
                        {item.partyName || '-'}
                      </td>
                      <td className={`py-2 px-2.5 font-bold text-right whitespace-nowrap ${
                        item.type === 'income' ? 'text-emerald-700' : 'text-amber-800'
                      }`}>
                        {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Stamp & Signature Area */}
            <div className="pt-6 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <div>
                <p>कंप्यूटर जनरेटेड किसान बही-खाता पर्ची।</p>
                <p>प्रमाणित रिकॉर्ड • मंदसौर कृषि उपज मंडी</p>
              </div>

              <div className="text-center">
                <div className="w-32 border-b border-stone-400 h-8 mb-1"></div>
                <span>किसान / व्यवस्थापक हस्ताक्षर</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
