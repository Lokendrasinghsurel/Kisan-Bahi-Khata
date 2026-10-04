export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 
  | 'khad' // खाद / उर्वरक (DAP, Urea, NPK, Potash, etc.)
  | 'kitnashak' // कीटनाशक / फफूंदनाशक / खरपतवार
  | 'beej' // बीज (Seed)
  | 'mazdoori' // मजदूरी (Labor)
  | 'diesel_tractor' // डीजल / ट्रैक्टर / जुताई / हकाई
  | 'sinchai_bijli' // सिंचाई / बिजली बिल / पानी
  | 'katai_thrasher' // कटाई / थ्रेशर / ग्रेडिंग
  | 'transport_bhada' // परिवहन / मंडी भाड़ा / तुलाई
  | 'mandi_tax_hamali' // हम्माली / पल्लेदारी / मंडी टैक्स
  | 'other_expense'; // अन्य खर्च

export type IncomeCategory =
  | 'fasal_bikri' // फसल बिक्री (Mandi / Vyapari sale)
  | 'bhusa_chara' // भूसा / चारा / पैरा बिक्री
  | 'sarkari_yojana' // सरकारी योजना (PM Kisan, भावांतर, बीमा)
  | 'other_income'; // अन्य आमदनी

export type AllCategory = ExpenseCategory | IncomeCategory;

export interface LedgerEntry {
  id: string;
  customerId?: string; // ID of the customer (e.g. kisan_9826154320)
  customerMobile?: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  crop: string; // लहसुन, सोयाबीन, गेहूं, etc.
  category: AllCategory;
  categoryLabel?: string;
  itemDescription: string; // e.g. "DAP 2 बोरी", "कोराजन स्प्रे", "सोयाबीन 15 क्विंटल"
  amount: number; // in ₹
  quantity?: number; // e.g. 5
  unit?: string; // बोरी, क्विंटल, किग्रा, लीटर, एकड़, दिन
  ratePerUnit?: number; // ₹ per unit
  partyName?: string; // व्यापारी / दुकानदार / मजदूर का नाम
  paymentStatus: 'paid' | 'pending' | 'partial'; // नकद/चुकाया, उधार/बाकी
  paidAmount?: number;
  notes?: string;
  createdAt: number;
}

export interface MandiRate {
  id: string;
  commodityHi: string;
  commodityEn: string;
  variety?: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number; // मॉडल भाव (average/most traded)
  arrivalBags: number; // आवक (बोरी)
  unit: string; // ₹/क्विंटल
  trend: 'up' | 'down' | 'stable';
  changeAmount: number;
  category: 'spices' | 'oilseeds' | 'grains' | 'pulses' | 'vegetables' | 'commercial';
  date: string;
  mandiName: string;
}

export interface CropCostPreset {
  id: string;
  cropNameHi: string;
  cropNameEn: string;
  icon: string;
  season: 'खरीफ' | 'रबी' | 'जायद' | 'रबी/खरीफ';
  seedCostPerBigha: number;
  fertilizerCostPerBigha: number;
  pesticideCostPerBigha: number;
  laborCostPerBigha: number;
  tractorMachineryCostPerBigha: number;
  irrigationCostPerBigha: number;
  otherCostPerBigha: number;
  averageYieldPerBigha: number; // क्विंटल
  typicalPricePerQuintal: number; // ₹
  recommendedKhad: {
    dapKgPerBigha: number;
    ureaKgPerBigha: number;
    potashKgPerBigha: number;
    zincKgPerBigha: number;
  };
}

export interface FarmerUser {
  id: string;
  uniqueId: string; // e.g. KISAN-9826154320
  name: string;
  mobile: string;
  village: string;
  tehsil?: string;
  district: string;
  state: string;
  cropsGrown?: string[];
  totalLandBigha?: number;
  loggedInAt: number;
  registeredAt?: string;
}

export type LanguageMode = 'hi' | 'hinglish';
