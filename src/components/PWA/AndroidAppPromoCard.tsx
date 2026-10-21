import React from 'react';
import { Smartphone, Download, Star, ShieldCheck, Zap, ArrowRight, Check } from 'lucide-react';

interface AndroidAppPromoCardProps {
  onInstall: () => Promise<boolean>;
  onOpenGuide: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
}

export const AndroidAppPromoCard: React.FC<AndroidAppPromoCardProps> = ({
  onInstall,
  onOpenGuide,
  isInstallable,
  isInstalled,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 border border-slate-800 shadow-xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-lg shrink-0 flex items-center justify-center">
            <img 
              src="/pwa-192x192.png" 
              alt="UrbanPark App" 
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Android & Mobile PWA
              </span>
              <span className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>4.9 (12.4k drivers)</span>
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold tracking-tight">
              Get the UrbanPark Android App on Your Phone
            </h3>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl mt-1">
              Save time before you drive. Get instant 1-tap spot reservation, offline digital QR parking passes, and turn-by-turn navigation directly from your phone's home screen.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          {isInstalled ? (
            <div className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>Installed on Device</span>
            </div>
          ) : (
            <>
              <button
                onClick={onOpenGuide}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-semibold transition-colors text-center"
              >
                Installation Steps
              </button>

              <button
                onClick={async () => {
                  if (isInstallable) {
                    await onInstall();
                  } else {
                    onOpenGuide();
                  }
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install on Phone</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Feature Highlights bottom strip */}
      <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px]">Instant Home Screen Icon</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px]">No App Store Login Needed</span>
        </div>
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-[11px]">Full-Screen Standalone View</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-[11px]">Auto Updates in Background</span>
        </div>
      </div>
    </div>
  );
};
