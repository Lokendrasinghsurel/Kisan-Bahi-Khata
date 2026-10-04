import React, { useState } from 'react';
import { 
  Play, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Download, 
  X, 
  FileText, 
  Layers, 
  Sparkles,
  Info,
  Smartphone
} from 'lucide-react';

interface PlayStorePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const PlayStorePublishModal: React.FC<PlayStorePublishModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const appTitle = "किसान बही-खाता - मंदसौर मंडी भाव";
  const shortDescription = "किसानों के लिए रोजाना का डिजिटल बही-खाता, खाद-कीटनाशक खर्च, मंदसौर मंडी भाव व फसल मुनाफा कैलकुलेटर।";
  const fullDescription = `🌾 किसान बही-खाता (Kisan Bahi Khata) - मध्य प्रदेश व मालवा क्षेत्र के किसानों के लिए समर्पित डिजिटल बही-खाता ऐप।

प्रमुख विशेषताएं:
✅ रोजाना की आय व खर्च (खाद, बीज, कीटनाशक, मजदूरी, डीजल, जुताई) का संपूर्ण हिसाब
✅ मंदसौर मंडी के रोजाना के ताजा भाव (लहसुन, सोयाबीन, गेहूं, मैथी, चना, सरसों, इसबगोल आदि)
✅ फसल लागत व शुद्ध मुनाफा कैलकुलेटर (प्रति बीघा व प्रति एकड़)
✅ खाद व दवा स्प्रे का वैज्ञानिक शेड्यूलर (फसल चक्र)
✅ किसान पर्ची (Receipt Slip) बनाएं और 1-क्लिक में WhatsApp पर भेजें या प्रिंट करें
✅ 100% सुरक्षित क्लाउड बैकअप और ऑफलाइन सपोर्ट (बिना इंटरनेट के भी चलता है)

संचालक व संपर्क: लोकेंद्र सिंह पंवार (shreeraj894@gmail.com)`;

  const privacyPolicy = `गोपनीयता नीति (Privacy Policy) - किसान बही-खाता:
1. किसान बही-खाता ऐप केवल किसान का नाम, मोबाइल नंबर और उनके द्वारा दर्ज फसल आय-व्यय के रिकॉर्ड को सुरक्षित रखने के लिए उपयोग करता है।
2. किसान का डेटा पूरी तरह निजी और सुरक्षित है। इसे किसी भी तीसरे पक्ष के साथ साझा या बेचा नहीं जाता है।
3. उपयोगकर्ता किसी भी समय अपना खाता या डेटा हटाने का अनुरोध कर सकते हैं।
संपर्क: shreeraj894@gmail.com`;

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-6 overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-2xl shadow-md border-2 border-amber-300">
              ▶️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Google Play Store
                </span>
                <span className="text-xs text-emerald-200 font-semibold">TWA पब्लिशिंग गाइड</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-0.5">
                गूगल प्ले स्टोर पर ऐप कैसे पब्लिश करें
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick Notice */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1.5">
            <div className="font-extrabold flex items-center gap-1.5 text-amber-900 text-sm">
              <Info className="w-4 h-4 text-amber-700" />
              <span>प्ले स्टोर पर पब्लिश करने के 4 आसान चरण:</span>
            </div>
            <p className="text-stone-700 leading-relaxed">
              यह ऐप एक आधुनिक <strong>PWA (Progressive Web App)</strong> है जिसे Google की आधिकारिक तकनीक <strong>TWA (Trusted Web Activity)</strong> के माध्यम से सीधे प्ले स्टोर के लिए <strong>.aab (Android App Bundle)</strong> में बदला जा सकता है।
            </p>
          </div>

          {/* 4 Steps Timeline */}
          <div className="space-y-3">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center">1</span>
                  <span>Google Play Console डेवलपर अकाउंट बनाएं</span>
                </div>
                <a
                  href="https://play.google.com/console/signup"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>Play Console खोलें</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-stone-600 pl-8">
                यदि आपके पास पहले से गूगल डेवलपर खाता है तो सीधा लॉगिन करें। नए खाते के लिए Google का एकमुश्त (one-time) $25 शुल्क लगता है।
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center">2</span>
                  <span>1-क्लिक में .AAB (Android App Bundle) जनरेट करें</span>
                </div>
                <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                  PWABuilder
                </span>
              </div>
              <p className="text-xs text-stone-700 pl-8">
                गूगल और माइक्रोसॉफ्ट के आधिकारिक टूल <strong>PWABuilder</strong> पर यह यूआरएल डालकर सीधे <strong>Android .aab पैकेज</strong> डाउनलोड कर सकते हैं:
              </p>
              <div className="pl-8 flex flex-col sm:flex-row gap-2">
                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  <span>PWABuilder पर पैकेज बनाएं (AAB Download)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center">3</span>
                <span>प्ले स्टोर लिस्टिंग विवरण (कॉपी करके पेस्ट करें)</span>
              </div>

              <div className="pl-8 space-y-2.5 pt-1 text-xs">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between text-stone-500 mb-0.5">
                    <span className="font-bold">ऐप का नाम (App Title):</span>
                    <button
                      onClick={() => handleCopy(appTitle, 'title')}
                      className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'title' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'title' ? 'कॉपी हो गया' : 'कॉपी करें'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-stone-300 font-semibold text-stone-800">
                    {appTitle}
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <div className="flex items-center justify-between text-stone-500 mb-0.5">
                    <span className="font-bold">संक्षिप्त विवरण (Short Description):</span>
                    <button
                      onClick={() => handleCopy(shortDescription, 'short')}
                      className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'short' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'short' ? 'कॉपी हो गया' : 'कॉपी करें'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-stone-300 text-stone-800">
                    {shortDescription}
                  </div>
                </div>

                {/* Full Description */}
                <div>
                  <div className="flex items-center justify-between text-stone-500 mb-0.5">
                    <span className="font-bold">पूरा विवरण (Full Description):</span>
                    <button
                      onClick={() => handleCopy(fullDescription, 'full')}
                      className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'full' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'full' ? 'कॉपी हो गया' : 'कॉपी करें'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-stone-300 text-stone-800 max-h-24 overflow-y-auto whitespace-pre-line text-[11px]">
                    {fullDescription}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Privacy Policy */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center">4</span>
                  <span>प्राइवेसी पॉलिसी (Privacy Policy)</span>
                </div>
                <button
                  onClick={() => handleCopy(privacyPolicy, 'privacy')}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'privacy' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'privacy' ? 'कॉपी हो गया' : 'कॉपी करें'}</span>
                </button>
              </div>
              <p className="text-xs text-stone-600 pl-8">
                गूगल प्ले स्टोर वित्तीय/खाता ऐप्स के लिए प्राइवेसी पॉलिसी अनिवार्य करता है। आप ऊपर दिया गया विवरण सीधे अपनी प्राइवेसी पॉलिसी में पेस्ट कर सकते हैं।
              </p>
            </div>
          </div>

          {/* Direct Install Advantage */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5">बिना प्ले स्टोर के भी किसान तुरंत इंस्टॉल कर सकते हैं:</strong>
              <span>
                प्ले स्टोर रिव्यू में 2-3 दिन लग सकते हैं, परंतु इस ऐप की लिंक से कोई भी किसान तुरंत अपने फोन में ओरिजिनल ऐप की तरह <strong>'Add to Home Screen'</strong> दबाकर अभी से उपयोग कर सकता है!
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600 shrink-0">
          <span>पैकेज आईडी: <strong>com.kisan.bahikhata</strong></span>
          <button
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-700 text-white font-bold px-4 py-2 rounded-xl transition"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
