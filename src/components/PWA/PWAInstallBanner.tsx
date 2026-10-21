import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, HelpCircle, Check, Sparkles } from 'lucide-react';

interface PWAInstallBannerProps {
  isInstallable: boolean;
  isInstalled: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  onInstall: () => Promise<boolean>;
  onOpenGuide: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isInstallable,
  isInstalled,
  isAndroid,
  isIOS,
  onInstall,
  onOpenGuide,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('urbanpark_pwa_banner_dismissed') === 'true';
  });

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('urbanpark_pwa_banner_dismissed', 'true');
    }
  };

  return (
    <div className="relative z-30 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-3 shadow-md border-b border-blue-600/50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: App icon & messaging */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center shadow-xs">
            <img 
              src="/pwa-192x192.png" 
              alt="UrbanPark App" 
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                // If image fails, display initials fallback
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-200" />
                <span>Download UrbanPark Android & Mobile App</span>
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/40 text-blue-100 border border-blue-400/30">
                PWA Fast
              </span>
            </div>
            <p className="text-xs text-blue-100 truncate sm:text-clip">
              Install directly to your phone for instant booking, offline gate passes, and real-time bay alerts.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenGuide}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Installation Guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">How to </span>Install
          </button>

          <button
            onClick={async () => {
              if (isInstallable) {
                await onInstall();
              } else {
                onOpenGuide();
              }
            }}
            className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors ml-1"
            aria-label="Dismiss banner"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
