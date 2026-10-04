/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BahiKhataLedger } from './components/BahiKhataLedger';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { MandsaurMandiBhav } from './components/MandsaurMandiBhav';
import { FasalCalculator } from './components/FasalCalculator';
import { EntryModal } from './components/EntryModal';
import { PrintSlipModal } from './components/PrintSlipModal';
import { LoginPage } from './components/LoginPage';
import { AdminKisanDirectoryModal } from './components/AdminKisanDirectoryModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { PlayStorePublishModal } from './components/PlayStorePublishModal';
import { LedgerEntry, FarmerUser } from './types';
import { SAMPLE_LEDGER_ENTRIES } from './data/sampleLedgerData';
import { 
  subscribeToCustomerEntries, 
  saveCustomerEntryToCloud, 
  deleteCustomerEntryFromCloud 
} from './services/customerSyncService';

const STORAGE_KEY = 'kisan_bahi_khata_v1';
const LANG_STORAGE_KEY = 'kisan_bahi_khata_lang';
const USER_STORAGE_KEY = 'kisan_farmer_user_v1';
const ALL_FARMERS_KEY = 'kisan_all_registered_farmers';

const DEFAULT_FARMERS: FarmerUser[] = [
  {
    id: 'kisan_9826154320',
    uniqueId: 'KISAN-9826154320',
    name: 'श्री रमेश पाटीदार',
    mobile: '9826154320',
    village: 'दलौदा',
    tehsil: 'मंदसौर',
    district: 'मंदसौर',
    state: 'मध्य प्रदेश',
    totalLandBigha: 8,
    cropsGrown: ['लहसुन', 'सोयाबीन', 'मैथी'],
    loggedInAt: Date.now() - 5 * 86400000,
    registeredAt: '28/09/2026',
  },
  {
    id: 'kisan_9425312890',
    uniqueId: 'KISAN-9425312890',
    name: 'श्री जगदीश धाकड़',
    mobile: '9425312890',
    village: 'सुरेल',
    tehsil: 'खाचरौद',
    district: 'उज्जैन / मंदसौर',
    state: 'मध्य प्रदेश',
    totalLandBigha: 12,
    cropsGrown: ['लहसुन', 'गेहूं', 'चना', 'इसबगोल'],
    loggedInAt: Date.now() - 3 * 86400000,
    registeredAt: '30/09/2026',
  }
];

export default function App() {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'ledger' | 'dashboard' | 'mandi' | 'calculator'>('ledger');

  // Farmer User Profile State
  const [currentUser, setCurrentUser] = useState<FarmerUser | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Error loading farmer user', e);
    }
    return null;
  });

  // Master Registered Farmers Directory for Admin
  const [registeredFarmers, setRegisteredFarmers] = useState<FarmerUser[]>(() => {
    try {
      const stored = localStorage.getItem(ALL_FARMERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading registered farmers', e);
    }
    return DEFAULT_FARMERS;
  });

  // Language state: 'hi' (Hindi) or 'hinglish'
  const [lang, setLang] = useState<'hi' | 'hinglish'>('hi');

  // Ledger entries state - loads personal entries if logged in
  const [entries, setEntries] = useState<LedgerEntry[]>(() => {
    try {
      const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUserStr) {
        const user = JSON.parse(savedUserStr);
        if (user?.mobile) {
          const userEntriesStr = localStorage.getItem(`kisan_entries_${user.mobile}`);
          if (userEntriesStr) {
            return JSON.parse(userEntriesStr);
          } else {
            return []; // Fresh interface for new logged-in customer
          }
        }
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading ledger data from localStorage', e);
    }
    return SAMPLE_LEDGER_ENTRIES;
  });

  // Modal states
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [prefillEntryData, setPrefillEntryData] = useState<{ partyName?: string; itemDescription?: string; category?: any } | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState(false);

  // States to pass from Mandi Bhav to Fasal Calculator
  const [calcCropName, setCalcCropName] = useState<string | undefined>();
  const [calcPrice, setCalcPrice] = useState<number | undefined>();

  // Quick add expense for Agro Store
  const handleQuickAddExpenseForShop = (shopName: string, pesticideName?: string) => {
    setPrefillEntryData({
      partyName: shopName,
      itemDescription: pesticideName ? `${pesticideName} कीटनाशक दवा` : 'कीटनाशक व खाद',
      category: 'kitnashak',
    });
    setEditingEntry(null);
    setIsEntryModalOpen(true);
  };

  // Real-time Cloud subscription for logged in customer
  useEffect(() => {
    if (!currentUser?.id) return;

    const unsubscribe = subscribeToCustomerEntries(
      currentUser.id,
      (cloudEntries) => {
        if (cloudEntries && cloudEntries.length > 0) {
          setEntries(cloudEntries);
        }
      },
      (err) => {
        console.warn('Realtime entries fallback', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.id]);

  // Persist entries to localStorage per user whenever they change
  useEffect(() => {
    try {
      const key = currentUser ? `kisan_entries_${currentUser.mobile}` : STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(entries));
    } catch (e) {
      console.error('Error saving ledger data', e);
    }
  }, [entries, currentUser]);

  // Persist current farmer user
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error saving farmer user profile', e);
    }
  }, [currentUser]);

  // New Customer Login Handler
  const handleLoginSuccess = (user: FarmerUser) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);

    // Save/Sync to Master Directory
    setRegisteredFarmers(prev => {
      const exists = prev.findIndex(f => f.mobile === user.mobile);
      let updated: FarmerUser[];
      if (exists >= 0) {
        updated = [...prev];
        updated[exists] = user;
      } else {
        updated = [user, ...prev];
      }
      try {
        localStorage.setItem(ALL_FARMERS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving registered farmers', e);
      }
      return updated;
    });

    const userKey = `kisan_entries_${user.mobile}`;
    const savedUserEntries = localStorage.getItem(userKey);

    if (savedUserEntries) {
      try {
        const parsed = JSON.parse(savedUserEntries);
        setEntries(Array.isArray(parsed) ? parsed : []);
      } catch {
        setEntries([]);
      }
    } else {
      // New Customer! Fresh clean ledger interface
      setEntries([]);
      localStorage.setItem(userKey, JSON.stringify([]));
      setActiveTab('ledger');
      // Prompt modal so they can immediately add their first entry
      setTimeout(() => {
        setEditingEntry(null);
        setPrefillEntryData(null);
        setIsEntryModalOpen(true);
      }, 450);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    // Restore default / sample entries
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setEntries(JSON.parse(saved));
      } else {
        setEntries(SAMPLE_LEDGER_ENTRIES);
      }
    } catch {
      setEntries(SAMPLE_LEDGER_ENTRIES);
    }
  };

  // Persist language
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
      if (savedLang === 'hi' || savedLang === 'hinglish') {
        setLang(savedLang);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSetLang = (newLang: 'hi' | 'hinglish') => {
    setLang(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch (e) {
      // ignore
    }
  };

  // Add / Edit Entry with real-time Cloud Sync
  const handleSaveEntry = async (entry: LedgerEntry) => {
    // 1. Optimistic UI update
    setEntries(prev => {
      const existsIndex = prev.findIndex(item => item.id === entry.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = entry;
        return updated;
      } else {
        return [entry, ...prev];
      }
    });

    // 2. Real-time Cloud Firestore write
    if (currentUser?.id) {
      try {
        await saveCustomerEntryToCloud(currentUser.id, {
          ...entry,
          customerId: currentUser.id,
          customerMobile: currentUser.mobile,
        });
      } catch (err) {
        console.error('Error saving entry to cloud', err);
      }
    }
  };

  // Delete Entry with real-time Cloud Sync
  const handleDeleteEntry = async (id: string) => {
    setEntries(prev => prev.filter(item => item.id !== id));
    if (currentUser?.id) {
      try {
        await deleteCustomerEntryFromCloud(currentUser.id, id);
      } catch (err) {
        console.error('Error deleting entry from cloud', err);
      }
    }
  };

  // Reset to initial realistic demo data
  const handleResetDemoData = () => {
    if (window.confirm('क्या आप डेमो डेटा दोबारा लोड करना चाहते हैं? इससे मंदसौर लहसुन, सोयाबीन व खाद के नमूना रिकॉर्ड आ जाएंगे।')) {
      setEntries(SAMPLE_LEDGER_ENTRIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_LEDGER_ENTRIES));
    }
  };

  // Navigation from Mandi Bhav directly into Calculator
  const handleSelectCropForCalculator = (cropName: string, price: number) => {
    setCalcCropName(cropName);
    setCalcPrice(price);
    setActiveTab('calculator');
  };

  // Overall Financial Totals
  const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-amber-50/30 text-stone-800 flex flex-col font-['Mukta',sans-serif]">
      {/* Header with Mandi Ticker, Navigation, Login & Quick Actions */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewEntry={() => {
          setEditingEntry(null);
          setIsEntryModalOpen(true);
        }}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        onResetDemoData={handleResetDemoData}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenPlayStoreModal={() => setIsPlayStoreModalOpen(true)}
        currentUser={currentUser}
        lang={lang}
        setLang={handleSetLang}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netProfit={netProfit}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-20">
        {activeTab === 'ledger' && (
          <BahiKhataLedger
            entries={entries}
            onOpenNewEntry={() => {
              setEditingEntry(null);
              setPrefillEntryData(null);
              setIsEntryModalOpen(true);
            }}
            onEditEntry={(entry) => {
              setEditingEntry(entry);
              setPrefillEntryData(null);
              setIsEntryModalOpen(true);
            }}
            onDeleteEntry={handleDeleteEntry}
            onQuickAddExpenseForShop={handleQuickAddExpenseForShop}
            onResetDemoData={handleResetDemoData}
            farmerName={currentUser?.name}
            lang={lang}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardAnalytics
            entries={entries}
            lang={lang}
            onNavigateToLedger={() => setActiveTab('ledger')}
          />
        )}

        {activeTab === 'mandi' && (
          <MandsaurMandiBhav
            onSelectCropForCalculator={handleSelectCropForCalculator}
            onQuickAddExpenseForShop={handleQuickAddExpenseForShop}
            lang={lang}
          />
        )}

        {activeTab === 'calculator' && (
          <FasalCalculator
            initialCropName={calcCropName}
            initialPrice={calcPrice}
            onAddProjectionToLedger={handleSaveEntry}
            lang={lang}
          />
        )}
      </main>

      {/* Bottom Developer Credits & Contact Footer */}
      <footer className="mt-auto bg-stone-900 text-stone-300 py-6 px-4 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-extrabold text-white text-sm">🌾 किसान बही-खाता</span>
              <span className="bg-amber-400 text-emerald-950 font-black px-2 py-0.5 rounded text-[10px] uppercase">
                मंदसौर मंडी
              </span>
            </div>
            <p className="text-stone-400 text-xs">
              रोजाना का फसल, खाद, कीटनाशक व मुनाफा हिसाब • मंदसौर मंडी भाव • फसल कैलकुलेटर
            </p>
          </div>

          <div className="p-3 bg-stone-800/90 rounded-2xl border border-stone-700/80 text-xs shadow-sm flex flex-col sm:items-end gap-1.5">
            <div className="font-extrabold text-amber-300 text-sm">
              Application Development By Lokendra Singh Panwar
            </div>
            <div className="text-stone-300 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
              <span>Contact:</span>
              <a 
                href="mailto:shreeraj894@gmail.com" 
                className="text-emerald-400 hover:text-emerald-300 font-bold underline transition"
              >
                shreeraj894@gmail.com
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 mt-2">
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition border border-emerald-400/40"
              >
                <span>📲</span>
                <span>एंड्रॉइड ऐप लिंक (Google Chrome)</span>
              </button>

              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-emerald-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <span>👥</span>
                <span>किसान डायरेक्टरी ({registeredFarmers.length})</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Sticky Bar for Mobile Navigation & Quick Add */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${
            activeTab === 'ledger' ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <span className="text-base">📖</span>
          <span>बही-खाता</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${
            activeTab === 'dashboard' ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <span className="text-base">📊</span>
          <span>डैशबोर्ड</span>
        </button>

        <button
          onClick={() => {
            setEditingEntry(null);
            setIsEntryModalOpen(true);
          }}
          className="flex flex-col items-center justify-center -mt-5 w-11 h-11 rounded-full bg-amber-400 text-emerald-950 shadow-lg border-2 border-white active:scale-95 transition"
        >
          <span className="text-2xl font-bold leading-none">+</span>
        </button>

        <button
          onClick={() => setActiveTab('mandi')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${
            activeTab === 'mandi' ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <span className="text-base">🏛️</span>
          <span>मंडी</span>
        </button>

        <button
          onClick={() => setIsInstallModalOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-emerald-800"
          title="एंड्रॉइड ऐप इंस्टॉल करें"
        >
          <span className="text-base">📲</span>
          <span className="font-bold">ऐप</span>
        </button>

        <button
          onClick={() => setIsLoginModalOpen(true)}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${
            currentUser ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <span className="text-base">👤</span>
          <span>{currentUser ? 'प्रोफाइल' : 'लॉगिन'}</span>
        </button>
      </div>

      {/* Add / Edit Entry Modal */}
      <EntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEditingEntry(null);
          setPrefillEntryData(null);
        }}
        onSave={handleSaveEntry}
        editingEntry={editingEntry}
        prefillData={prefillEntryData}
        lang={lang}
      />

      {/* Farmer Mobile Login Modal */}
      <LoginPage
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        lang={lang}
      />

      {/* Print Slip Modal */}
      <PrintSlipModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        entries={entries}
        farmerName={currentUser ? currentUser.name : 'श्री किसान जी'}
        villageName={currentUser ? `${currentUser.village}, ${currentUser.district}` : 'मंदसौर, मध्य प्रदेश'}
      />

      {/* Admin Kisan Directory Modal */}
      <AdminKisanDirectoryModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        registeredFarmers={registeredFarmers}
      />

      {/* Android PWA Install & Direct Chrome Link Modal */}
      <AndroidInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onOpenPlayStoreModal={() => setIsPlayStoreModalOpen(true)}
      />

      {/* Google Play Store Publishing Toolkit Modal */}
      <PlayStorePublishModal
        isOpen={isPlayStoreModalOpen}
        onClose={() => setIsPlayStoreModalOpen(false)}
        appUrl={
          typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost:3000')
            ? window.location.origin
            : 'https://ais-dev-k7omrrwu6fybg7xk26c4mt-97351440826.asia-southeast1.run.app'
        }
      />
    </div>
  );
}

