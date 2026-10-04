import React from 'react';
import { Smartphone, Download } from 'lucide-react';

interface PWAInstallButtonProps {
  onOpenInstallModal: () => void;
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenInstallModal,
  className = '',
  variant = 'compact'
}) => {
  if (variant === 'full') {
    return (
      <button
        onClick={onOpenInstallModal}
        className={`bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 ${className}`}
        title="एंड्रॉइड मोबाइल ऐप इंस्टॉल करें"
      >
        <Smartphone className="w-4 h-4 fill-emerald-950/20" />
        <span>📲 ऐप इंस्टॉल करें</span>
      </button>
    );
  }

  return (
    <button
      onClick={onOpenInstallModal}
      className={`bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 border border-amber-300 ${className}`}
      title="एंड्रॉइड मोबाइल ऐप इंस्टॉल करें / लिंक देखें"
    >
      <Smartphone className="w-3.5 h-3.5 fill-emerald-950/20" />
      <span className="hidden sm:inline">📲 ऐप डाउनलोड</span>
      <span className="sm:hidden">📲 ऐप</span>
    </button>
  );
};
