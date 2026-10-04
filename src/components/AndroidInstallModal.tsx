import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Check, 
  Copy, 
  Share2, 
  X, 
  ExternalLink, 
  Globe, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlayStoreModal?: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  onOpenPlayStoreModal,
}) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // The direct active live link that opens in Chrome:
  const appUrl = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost:3000'))
    ? window.location.origin
    : 'https://ais-dev-k7omrrwu6fybg7xk26c4mt-97351440826.asia-southeast1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `🌾 *किसान बही-खाता (Android App)*\nफसल, खाद, कीटनाशक खर्च का रोजाना हिसाब, मंदसौर मंडी भाव और मुनाफा कैलकुलेटर।\n\nसीधे गूगल क्रोम (Chrome) में खोलें व फोन में इंस्टॉल करें:\n🔗 ${appUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) onClose();
    } else {
      window.open(appUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full my-6 overflow-hidden border border-stone-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center text-3xl shadow-lg border-2 border-white/40 shrink-0">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Android App • PWA
                </span>
                <span className="text-xs text-emerald-200">100% फ्री</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                किसान बही-खाता Android App
              </h2>
              <p className="text-xs text-emerald-100">
                सीधे अपने मोबाइल फोन पर ऐप की तरह चलाएं
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Direct Chrome Link Box */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-700" />
                गूगल क्रोम (Google Chrome) डायरेक्ट लिंक:
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Live URL
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-700 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shrink-0 transition shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'कॉपी हुआ!' : 'कॉपी करें'}</span>
              </button>
            </div>
          </div>

          {/* Important troubleshooting box if link does not open */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 space-y-1.5">
            <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
              <span>⚠️</span>
              <span>अगर लिंक पर क्लिक करने पर नहीं खुल रहा है:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-900">
              <li>
                <strong>क्रोम में सीधे पेस्ट करें:</strong> व्हाट्सएप या अन्य ऐप के अंदर खोलने की बजाय, ऊपर <strong>'कॉपी करें'</strong> बटन दबाएं और गूगल क्रोम ऐप खोलकर सर्च बार (URL) में पेस्ट करें।
              </li>
              <li>
                <strong>Google Account लॉगिन:</strong> अपने क्रोम ब्राउज़र में अपनी वही जीमेल आईडी (<strong>ShreeRaj894@gmail.com</strong>) से लॉगिन रखें जिससे यह ऐप बनाया गया है।
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>फोन में सीधे इंस्टॉल करें</span>
              </button>
            ) : (
              <a
                href={appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition text-center"
              >
                <ExternalLink className="w-4 h-4 text-amber-300" />
                <span>क्रोम में सीधे खोलें</span>
              </a>
            )}

            <button
              onClick={handleShareWhatsApp}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Share2 className="w-4 h-4" />
              <span>व्हाट्सएप पर शेयर करें</span>
            </button>
          </div>

          {/* Google Play Store Publishing Card */}
          {onOpenPlayStoreModal && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-900 to-teal-950 rounded-2xl text-white flex items-center justify-between gap-3 shadow-sm border border-emerald-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                  ▶️
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-white">Google Play Store पर पब्लिश करना चाहते हैं?</h5>
                  <p className="text-[11px] text-emerald-200">1-क्लिक .AAB पैकेज डाउनलोड, प्राइवेसी पॉलिसी व विवरण</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenPlayStoreModal();
                }}
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-3.5 py-1.5 rounded-xl text-xs shrink-0 shadow-xs transition"
              >
                गाइड देखें →
              </button>
            </div>
          )}

          {/* How to Install Guide on Chrome Android */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              एंड्रॉइड फोन में इंस्टॉल करने का 1-मिनट तरीका:
            </h4>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  अपने फोन के <strong>Google Chrome</strong> ब्राउज़र में ऊपर दी गई लिंक को खोलें।
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  क्रोम में सबसे ऊपर दाईं तरफ <strong>⋮ (3 डॉट्स / तीन बिंदु)</strong> पर क्लिक करें।
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  मेनू में <strong>"Install app" (ऐप इंस्टॉल करें)</strong> या <strong>"Add to Home screen" (होम स्क्रीन पर जोड़ें)</strong> दबाएं।
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  4
                </span>
                <p>
                  आपके मोबाइल की स्क्रीन पर <strong>"किसान बही-खाता"</strong> का ओरिजिनल ऐप आइकन आ जाएगा, जिसे आप बिना इंटरनेट या धीमे नेटवर्क में भी आसानी से चला सकेंगे!
                </p>
              </div>
            </div>
          </div>

          {/* App Highlights */}
          <div className="grid grid-cols-3 gap-2 text-center text-stone-600 pt-1">
            <div className="p-2 bg-white rounded-xl border border-stone-200">
              <span className="text-base block mb-0.5">⚡</span>
              <span className="text-[11px] font-bold block text-stone-800">सुपर फास्ट</span>
              <span className="text-[9px] text-stone-400">बिना हैंग हुए चले</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-stone-200">
              <span className="text-base block mb-0.5">📶</span>
              <span className="text-[11px] font-bold block text-stone-800">ऑफलाइन चले</span>
              <span className="text-[9px] text-stone-400">खेत में भी काम करे</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-stone-200">
              <span className="text-base block mb-0.5">🔒</span>
              <span className="text-[11px] font-bold block text-stone-800">100% सुरक्षित</span>
              <span className="text-[9px] text-stone-400">आपका डेटा आपके फोन में</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <div className="text-[11px] text-stone-500 font-medium">
            डेवलपर: लोकेंद्र सिंह पंवार (shreeraj894@gmail.com)
          </div>
          <button
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
