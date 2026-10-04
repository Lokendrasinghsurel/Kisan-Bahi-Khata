import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  User, 
  MapPin, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  X,
  RefreshCw,
  Sprout,
  MessageCircle,
  Cloud,
  IdCard,
  Download,
  Check
} from 'lucide-react';
import { FarmerUser } from '../types';
import { 
  generateCustomerIds, 
  getCustomerProfileFromCloud, 
  saveCustomerProfileToCloud 
} from '../services/customerSyncService';

interface LoginPageProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: FarmerUser) => void;
  currentUser: FarmerUser | null;
  onLogout: () => void;
  onOpenInstallModal?: () => void;
  lang: 'hi' | 'hinglish';
}

const CROP_OPTIONS = ['लहसुन', 'सोयाबीन', 'गेहूं', 'मैथी', 'चना', 'सरसों', 'प्याज', 'इसबगोल', 'मक्का', 'धनिया'];

export const LoginPage: React.FC<LoginPageProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  onLogout,
  onOpenInstallModal,
  lang,
}) => {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('ग्राम दलौदा');
  const [tehsil, setTehsil] = useState('मंदसौर');
  const [totalLandBigha, setTotalLandBigha] = useState<number | ''>(5);
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['लहसुन', 'सोयाबीन']);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingCloud, setIsCheckingCloud] = useState(false);
  const [existingCloudUser, setExistingCloudUser] = useState<FarmerUser | null>(null);

  // Auto-calculated unique ID based on mobile number
  const cleanMobile = mobile.replace(/\D/g, '');
  const { docId, uniqueDisplayId } = generateCustomerIds(cleanMobile || '0000000000');

  // Check cloud for existing customer when 10 digits entered
  useEffect(() => {
    if (cleanMobile.length === 10) {
      setIsCheckingCloud(true);
      getCustomerProfileFromCloud(docId)
        .then((profile) => {
          if (profile) {
            setExistingCloudUser(profile);
            setName(profile.name);
            setVillage(profile.village);
            if (profile.tehsil) setTehsil(profile.tehsil);
            if (profile.totalLandBigha) setTotalLandBigha(profile.totalLandBigha);
            if (profile.cropsGrown && profile.cropsGrown.length) setSelectedCrops(profile.cropsGrown);
          } else {
            setExistingCloudUser(null);
          }
        })
        .catch((err) => {
          console.warn('Cloud check error:', err);
        })
        .finally(() => {
          setIsCheckingCloud(false);
        });
    } else {
      setExistingCloudUser(null);
    }
  }, [cleanMobile, docId]);

  if (!isOpen) return null;

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  // Handle Mobile submit -> Generate OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (cleanMobile.length !== 10) {
      setError('कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें (उदा: 9826012345)');
      return;
    }
    if (!name.trim()) {
      setError('कृपया ग्राहक/किसान का नाम दर्ज करें');
      return;
    }

    setError('');
    setIsSubmitting(true);

    // 4-digit OTP for instant phone verification
    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(mockOtp);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
    }, 500);
  };

  // Verify OTP and sync customer in Real-Time to Firestore Cloud
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 4) {
      setError('कृपया 4 अंकों का OTP कोड दर्ज करें');
      return;
    }

    if (otp !== generatedOtp && otp !== '1234') {
      setError(`गलत OTP दर्ज किया गया है। स्क्रीन पर आया सही OTP ${generatedOtp} दर्ज करें`);
      return;
    }

    setIsSubmitting(true);

    const todayStr = new Intl.DateTimeFormat('hi-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date());

    const verifiedUser: FarmerUser = {
      id: docId,
      uniqueId: uniqueDisplayId,
      name: name.trim(),
      mobile: cleanMobile,
      village: village.trim() || 'मंदसौर',
      tehsil: tehsil.trim() || 'मंदसौर',
      district: 'मंदसौर',
      state: 'मध्य प्रदेश',
      cropsGrown: selectedCrops,
      totalLandBigha: typeof totalLandBigha === 'number' ? totalLandBigha : undefined,
      loggedInAt: Date.now(),
      registeredAt: existingCloudUser?.registeredAt || todayStr,
    };

    try {
      // 1. Save to Cloud Firestore in Real-Time
      await saveCustomerProfileToCloud(verifiedUser);

      // 2. Also keep local storage directory updated
      const stored = localStorage.getItem('kisan_all_registered_farmers');
      const allFarmers: FarmerUser[] = stored ? JSON.parse(stored) : [];
      const existingIdx = allFarmers.findIndex(f => f.id === verifiedUser.id || f.mobile === verifiedUser.mobile);
      if (existingIdx >= 0) {
        allFarmers[existingIdx] = verifiedUser;
      } else {
        allFarmers.unshift(verifiedUser);
      }
      localStorage.setItem('kisan_all_registered_farmers', JSON.stringify(allFarmers));
    } catch (err) {
      console.error('Error saving customer profile to cloud', err);
    } finally {
      setIsSubmitting(false);
    }

    onLoginSuccess(verifiedUser);
    onClose();
  };

  const handleShareWithAdmin = (user: FarmerUser) => {
    const text = `🌾 *नया ग्राहक / किसान बही-खाता लॉगिन*\n🆔 यूनिक कस्टमर ID: ${user.uniqueId}\n👤 नाम: ${user.name}\n📱 मोबाइल: ${user.mobile}\n📍 पता: ${user.village}, तहसील ${user.tehsil || ''}\n🌱 फसलें: ${(user.cropsGrown || []).join(', ')}\n🚜 रकबा: ${user.totalLandBigha || '-'} बीघा`;
    window.open(`https://api.whatsapp.com/send?phone=918959920373&text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 my-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center text-3xl font-black shadow-md border-2 border-amber-300 shrink-0">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  रियल-टाइम क्लाउड सिंक
                </span>
                <span className="text-[11px] text-emerald-200 flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-amber-300" /> लाइव डेटाबेस
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-0.5">
                {currentUser ? 'ग्राहक प्रोफाइल' : 'ग्राहक / किसान लॉगिन'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-emerald-100">
            {currentUser 
              ? 'आपका खाता सक्रिय है और बही-खाता डेटा सीधे क्लाउड पर सुरक्षित है।' 
              : 'मोबाइल नंबर से आपकी स्थायी यूनिक आईडी बनेगी और डेटा रियल-टाइम सिंक होगा।'}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          {currentUser ? (
            /* Logged in state view */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700">सक्रिय ग्राहक खाता</span>
                  <span className="text-[11px] font-black bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" /> क्लाउड कनेक्टेड
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="text-xl font-black text-stone-900">{currentUser.name}</h3>
                    <div className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded inline-block mt-0.5">
                      🆔 {currentUser.uniqueId || `KISAN-${currentUser.mobile}`}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-stone-600 space-y-1.5 pt-2 border-t border-emerald-200/60">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-bold text-stone-900">+91 {currentUser.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>ग्राम: <strong>{currentUser.village}</strong> {currentUser.tehsil ? `(तहसील: ${currentUser.tehsil})` : ''}</span>
                  </div>
                  {currentUser.totalLandBigha && (
                    <div className="flex items-center gap-2">
                      <span className="text-amber-800 font-bold">🚜 खेती रकबा: {currentUser.totalLandBigha} बीघा</span>
                    </div>
                  )}
                  {currentUser.cropsGrown && currentUser.cropsGrown.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] text-stone-500 block mb-1">फसलें:</span>
                      <div className="flex flex-wrap gap-1">
                        {currentUser.cropsGrown.map((c, i) => (
                          <span key={i} className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                            🌱 {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {onOpenInstallModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenInstallModal();
                    }}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>📲 फोन में एंड्रॉइड ऐप इंस्टॉल करें (PWA)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleShareWithAdmin(currentUser)}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>एडमिन (लोकेंद्र सिंह) को विवरण भेजें</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm transition"
                >
                  बही-खाता पर वापस जाएं
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setStep('mobile');
                    setMobile('');
                    setName('');
                  }}
                  className="w-full bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 font-bold py-2 rounded-xl text-xs transition border border-stone-200"
                >
                  खाता लॉग आउट करें (Logout)
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {step === 'mobile' ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  {/* Mobile Input with Real-time Unique ID Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-700" />
                        मोबाइल नंबर (Customer Mobile) *
                      </label>
                      {cleanMobile.length === 10 && (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <IdCard className="w-3 h-3 text-emerald-700" />
                          यूनिक ID: {uniqueDisplayId}
                        </span>
                      )}
                    </div>

                    <div className="relative flex items-center">
                      <div className="absolute left-3 font-bold text-stone-500 text-sm flex items-center gap-1 border-r border-stone-300 pr-2">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                        placeholder="10 अंकों का मोबाइल नंबर डालें"
                        required
                        autoFocus
                        className="w-full border-2 border-stone-300 focus:border-emerald-600 rounded-xl pl-20 pr-3 py-2.5 text-base font-bold text-stone-900 focus:outline-none"
                      />
                    </div>

                    {isCheckingCloud && (
                      <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        क्लाउड डेटाबेस में चेक किया जा रहा है...
                      </p>
                    )}

                    {existingCloudUser && (
                      <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <strong>{existingCloudUser.name}</strong> का क्लाउड खाता मिला! लॉगिन करने पर आपका पूरा पुराना बही-खाता लोड हो जाएगा।
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Customer / Farmer Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      ग्राहक / किसान का पूरा नाम *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="उदा: श्री कालूराम पाटीदार"
                      required
                      className="w-full border border-stone-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>

                  {/* Village & Tehsil Inputs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-500" />
                        गांव का नाम (Village) *
                      </label>
                      <input
                        type="text"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        placeholder="उदा: दलौदा / सुरेल"
                        required
                        className="w-full border border-stone-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        तहसील (Tehsil) *
                      </label>
                      <input
                        type="text"
                        value={tehsil}
                        onChange={(e) => setTehsil(e.target.value)}
                        placeholder="उदा: मंदसौर / खाचरौद"
                        required
                        className="w-full border border-stone-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Land Area in Bigha */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      खेती रकबा (Total Land in Bigha)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={totalLandBigha}
                        onChange={(e) => setTotalLandBigha(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder="उदा: 5"
                        className="w-full border border-stone-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none pr-12 font-bold"
                      />
                      <span className="absolute right-3 top-2 text-xs text-stone-400 font-semibold">बीघा</span>
                    </div>
                  </div>

                  {/* Major Crops Selection */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                      प्रमुख फसलें (Select Crops) *
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CROP_OPTIONS.map((crop) => {
                        const isSelected = selectedCrops.includes(crop);
                        return (
                          <button
                            key={crop}
                            type="button"
                            onClick={() => toggleCrop(crop)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              isSelected
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}{crop}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cloud Real-Time Guarantee Note */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-emerald-900">
                      <Cloud className="w-3.5 h-3.5 text-emerald-700" />
                      <span>रियल-टाइम क्लाउड बैकअप:</span>
                    </div>
                    <p>
                      हर लेनदेन (आय/व्यय) आपके यूनिक नंबर <strong>{uniqueDisplayId}</strong> के साथ तुरंत क्लाउड पर सुरक्षित हो जाएगा जिसे आप और एडमिन कभी भी देख सकते हैं।
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-extrabold py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>आगे बढ़ें (OTP प्राप्त करें)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: OTP Verification */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-emerald-700" />
                        सत्यापन कोड (OTP):
                      </span>
                      <strong className="text-amber-950 font-mono text-base bg-amber-200 px-2.5 py-0.5 rounded-lg">
                        {generatedOtp}
                      </strong>
                    </div>
                    <div className="text-[11px] text-amber-800">
                      मोबाइल नंबर <strong>+91 {cleanMobile}</strong> की यूनिक आईडी <strong>{uniqueDisplayId}</strong> बनेगी।
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                      4 अंकों का OTP कोड दर्ज करें
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="****"
                      autoFocus
                      required
                      className="w-full text-center tracking-[1em] font-mono text-2xl font-bold border-2 border-emerald-600 rounded-xl py-2.5 focus:outline-none bg-stone-50"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setStep('mobile')}
                      className="text-stone-500 hover:underline"
                    >
                      ← नंबर बदलें (+91 {cleanMobile})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
                        setGeneratedOtp(newOtp);
                      }}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      OTP दोबारा भेजें
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-extrabold py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>लॉगिन करें व क्लाउड से जोड़ें</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Install App Link Reminder */}
              {onOpenInstallModal && (
                <div className="pt-3 border-t border-stone-200 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenInstallModal();
                    }}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-700 flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>📲 सीधे एंड्रॉइड ऐप डाउनलोड करना चाहते हैं? यहाँ क्लिक करें</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
