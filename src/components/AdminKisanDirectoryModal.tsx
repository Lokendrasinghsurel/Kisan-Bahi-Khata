import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Sprout, 
  Download, 
  Search, 
  X, 
  CheckCircle2, 
  Mail, 
  Calendar,
  Layers,
  ShieldCheck,
  FileSpreadsheet,
  Cloud,
  RefreshCw,
  Eye,
  BookOpen,
  ArrowRight,
  IdCard,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { FarmerUser, LedgerEntry } from '../types';
import { 
  subscribeToAllCustomers, 
  fetchCustomerEntriesOnce 
} from '../services/customerSyncService';

interface AdminKisanDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredFarmers: FarmerUser[];
}

export const AdminKisanDirectoryModal: React.FC<AdminKisanDirectoryModalProps> = ({
  isOpen,
  onClose,
  registeredFarmers: initialFarmers,
}) => {
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('all');
  const [farmers, setFarmers] = useState<FarmerUser[]>(initialFarmers);
  const [isCloudSyncing, setIsCloudSyncing] = useState(true);

  // Inspector modal state for selected customer's live ledger entries
  const [inspectingCustomer, setInspectingCustomer] = useState<FarmerUser | null>(null);
  const [customerEntries, setCustomerEntries] = useState<LedgerEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Listen to Firestore real-time customer stream
  useEffect(() => {
    if (!isOpen) return;
    setIsCloudSyncing(true);

    const unsubscribe = subscribeToAllCustomers(
      (cloudCustomers) => {
        if (cloudCustomers && cloudCustomers.length > 0) {
          // Merge with initial / local list avoiding duplicates
          const map = new Map<string, FarmerUser>();
          cloudCustomers.forEach((c) => map.set(c.id, c));
          initialFarmers.forEach((f) => {
            if (!map.has(f.id)) map.set(f.id, f);
          });
          setFarmers(Array.from(map.values()));
        } else {
          setFarmers(initialFarmers);
        }
        setIsCloudSyncing(false);
      },
      (error) => {
        console.warn('Real-time admin sync fallback to local', error);
        setIsCloudSyncing(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen, initialFarmers]);

  if (!isOpen) return null;

  const handleInspectCustomer = async (farmer: FarmerUser) => {
    setInspectingCustomer(farmer);
    setLoadingEntries(true);
    try {
      const entries = await fetchCustomerEntriesOnce(farmer.id);
      setCustomerEntries(entries);
    } catch (e) {
      console.warn('Error fetching customer entries', e);
      setCustomerEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  };

  const filteredFarmers = farmers.filter(f => {
    if (cropFilter !== 'all' && (!f.cropsGrown || !f.cropsGrown.includes(cropFilter))) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = f.name.toLowerCase().includes(q);
      const matchMobile = f.mobile.includes(q);
      const matchUnique = (f.uniqueId || '').toLowerCase().includes(q);
      const matchVillage = f.village.toLowerCase().includes(q) || (f.tehsil && f.tehsil.toLowerCase().includes(q));
      const matchCrops = f.cropsGrown ? f.cropsGrown.some(c => c.toLowerCase().includes(q)) : false;
      return matchName || matchMobile || matchUnique || matchVillage || matchCrops;
    }
    return true;
  });

  const totalLand = farmers.reduce((sum, f) => sum + (f.totalLandBigha || 0), 0);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['यूनिक आईडी (Unique ID)', 'नाम (Name)', 'मोबाइल (Mobile)', 'गांव (Village)', 'तहसील (Tehsil)', 'प्रमुख फसलें (Crops)', 'रकबा बीघा (Land)', 'पंजीकरण तारीख (Date)'];
    const rows = filteredFarmers.map(f => [
      `"${f.uniqueId || `KISAN-${f.mobile}`}"`,
      `"${f.name}"`,
      `"${f.mobile}"`,
      `"${f.village}"`,
      `"${f.tehsil || ''}"`,
      `"${(f.cropsGrown || []).join(', ')}"`,
      `"${f.totalLandBigha || ''}"`,
      `"${f.registeredAt || new Date(f.loggedInAt).toLocaleDateString('hi-IN')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kisan_customers_realtime_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppFarmer = (farmer: FarmerUser) => {
    const text = `नमस्ते ${farmer.name} जी! किसान बही-खाता टीम (लोकेंद्र सिंह पंवार) से आपका स्वागत है। आपकी फसलों (${(farmer.cropsGrown || []).join(', ')}) या खाद-दवा के संबंध में कोई सहायता चाहिए हो तो बताएं।`;
    window.open(`https://api.whatsapp.com/send?phone=91${farmer.mobile}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmailAllDataToAdmin = () => {
    let body = `किसान बही-खाता - क्लाउड लाइव ग्राहक डेटाबेस (${filteredFarmers.length} ग्राहक):\n\n`;
    filteredFarmers.forEach((f, idx) => {
      body += `${idx + 1}. [${f.uniqueId || `KISAN-${f.mobile}`}] नाम: ${f.name}\n   मोबाइल: ${f.mobile}\n   पता: ${f.village}, ${f.tehsil || ''}\n   फसलें: ${(f.cropsGrown || []).join(', ')}\n   रकबा: ${f.totalLandBigha || '-'} बीघा\n   पंजीकरण: ${f.registeredAt || new Date(f.loggedInAt).toLocaleDateString('hi-IN')}\n\n`;
    });
    window.location.href = `mailto:shreeraj894@gmail.com?subject=${encodeURIComponent('किसान बही-खाता - लाइव कस्टमर डेटा')}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-6 overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 p-5 text-white flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-2xl shadow-md border-2 border-amber-300">
              👥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  व्यवस्थापक कंट्रोल रूम (Admin Live Control)
                </span>
                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  रियल-टाइम सिंक
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-0.5">
                ग्राहक व किसान क्लाउड डायरेक्टरी (Real-time Customer Data)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <span className="text-[11px] text-stone-500 font-semibold block">कुल सक्रिय ग्राहक</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-800">{farmers.length}</span>
              <span className="text-[10px] text-emerald-600 font-bold">क्लाउड कनेक्टेड</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <span className="text-[11px] text-stone-500 font-semibold block">कुल खेती रकबा</span>
            <span className="text-2xl font-black text-amber-800">{totalLand} <span className="text-xs">बीघा</span></span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <span className="text-[11px] text-stone-500 font-semibold block">एडमिन / स्वामी</span>
            <span className="text-xs font-black text-stone-900 block truncate">लोकेंद्र सिंह पंवार</span>
            <span className="text-[10px] text-stone-500 block truncate">shreeraj894@gmail.com</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              title="एक्सेल शीट डाउनलोड करें"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>CSV निर्यात</span>
            </button>

            <button
              onClick={handleEmailAllDataToAdmin}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center shadow-sm transition"
              title="ईमेल पर रिपोर्ट भेजें"
            >
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3 bg-white border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="नाम, मोबाइल, यूनिक आईडी (उदा: KISAN-9826...), या गांव से खोजें..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-stone-700"
            >
              <option value="all">सभी फसलें</option>
              <option value="लहसुन">लहसुन किसान</option>
              <option value="सोयाबीन">सोयाबीन किसान</option>
              <option value="गेहूं">गेहूं किसान</option>
              <option value="मैथी">मैथी किसान</option>
              <option value="चना">चना किसान</option>
            </select>
            <span className="text-xs text-stone-500 font-bold">
              दिखाया जा रहा: {filteredFarmers.length}
            </span>
          </div>
        </div>

        {/* Live Customer List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredFarmers.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs space-y-2">
              <div className="text-3xl">🌾</div>
              <p>कोई ग्राहक या किसान रिकॉर्ड नहीं मिला।</p>
            </div>
          ) : (
            filteredFarmers.map((farmer, idx) => {
              const uniqueIdStr = farmer.uniqueId || `KISAN-${farmer.mobile}`;
              return (
                <div
                  key={farmer.id || idx}
                  className="p-4 rounded-2xl border border-stone-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-extrabold text-stone-900 text-base">
                        {farmer.name}
                      </h4>
                      <span className="text-xs font-mono font-bold bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                        <IdCard className="w-3 h-3 text-amber-800" />
                        {uniqueIdStr}
                      </span>
                      {farmer.totalLandBigha && (
                        <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                          🚜 {farmer.totalLandBigha} बीघा
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 pl-8">
                      <span className="flex items-center gap-1 font-semibold text-stone-900">
                        <Phone className="w-3.5 h-3.5 text-emerald-700" />
                        <span>+91 {farmer.mobile}</span>
                      </span>

                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>ग्राम: <strong>{farmer.village}</strong> {farmer.tehsil ? `(तहसील: ${farmer.tehsil})` : ''}</span>
                      </span>

                      <span className="flex items-center gap-1 text-stone-400 text-[11px]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>पंजीकृत: {farmer.registeredAt || new Date(farmer.loggedInAt).toLocaleDateString('hi-IN')}</span>
                      </span>
                    </div>

                    {farmer.cropsGrown && farmer.cropsGrown.length > 0 && (
                      <div className="flex items-center gap-1.5 pl-8 pt-0.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-stone-500">फसलें:</span>
                        {farmer.cropsGrown.map((c, cIdx) => (
                          <span key={cIdx} className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                            🌱 {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions: View Live Ledger, Call, WhatsApp */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleInspectCustomer(farmer)}
                      className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs font-extrabold flex items-center gap-1 transition shadow-xs"
                      title="ग्राहक का लाइव बही-खाता देखें"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>लाइव बही-खाता</span>
                    </button>

                    <a
                      href={`tel:${farmer.mobile}`}
                      className="p-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs"
                      title="सीधे कॉल करें"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">कॉल</span>
                    </a>

                    <button
                      onClick={() => handleWhatsAppFarmer(farmer)}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                      title="व्हाट्सएप पर संदेश भेजें"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">व्हाट्सएप</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Customer Live Ledger Inspector Sub-Modal */}
        {inspectingCustomer && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-stone-200">
              <div className="p-4 bg-emerald-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-xl">
                    📖
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{inspectingCustomer.name} का लाइव बही-खाता</h3>
                    <p className="text-xs text-emerald-200">
                      यूनिक ID: <strong>{inspectingCustomer.uniqueId || `KISAN-${inspectingCustomer.mobile}`}</strong> • +91 {inspectingCustomer.mobile}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingCustomer(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {loadingEntries ? (
                  <div className="py-12 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>क्लाउड से लाइव बही-खाता रिकॉर्ड लोड हो रहे हैं...</span>
                  </div>
                ) : customerEntries.length === 0 ? (
                  <div className="py-12 text-center text-stone-400 text-xs">
                    <div className="text-3xl mb-1">📝</div>
                    <p>इस ग्राहक ने अभी तक कोई लेन-देन दर्ज नहीं किया है या नया खाता बनाया है।</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Summary Card */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                      <div>
                        <span className="text-[10px] text-stone-500 block">कुल आमदनी</span>
                        <span className="text-sm font-black text-emerald-700">
                          ₹{customerEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">कुल खर्च</span>
                        <span className="text-sm font-black text-rose-700">
                          ₹{customerEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">कुल प्रविष्टियां</span>
                        <span className="text-sm font-black text-stone-800">
                          {customerEntries.length}
                        </span>
                      </div>
                    </div>

                    {/* Entry list */}
                    {customerEntries.map((e) => (
                      <div
                        key={e.id}
                        className="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-stone-900">{e.itemDescription || e.crop}</div>
                          <div className="text-[11px] text-stone-500">
                            {e.date} • {e.partyName || 'नकद'} • {e.paymentStatus === 'paid' ? 'नकद' : 'उधार'}
                          </div>
                        </div>
                        <div className={`font-black text-sm ${e.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {e.type === 'income' ? '+ ₹' : '- ₹'}{e.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end shrink-0">
                <button
                  onClick={() => setInspectingCustomer(null)}
                  className="bg-stone-800 hover:bg-stone-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600 shrink-0">
          <span className="flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-emerald-700" />
            <span>लाइव क्लाउड डेटाबेस (Firestore) द्वारा संचालित • कोई भी ग्राहक कहीं से भी डेटा जोड़ेगा तो यहाँ तुरंत दिखेगा</span>
          </span>
          <button
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-700 text-white font-bold px-4 py-2 rounded-xl transition"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
