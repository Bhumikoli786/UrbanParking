import React from 'react';
import { 
  X, Smartphone, Download, Share2, PlusSquare, MoreVertical, 
  CheckCircle, ShieldCheck, Zap, WifiOff, Sparkles, ExternalLink 
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<boolean>;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isInstallable,
  isInstalled,
  isIOS,
  isAndroid,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-md shrink-0 flex items-center justify-center">
              <img 
                src="/pwa-192x192.png" 
                alt="UrbanPark Icon" 
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  // Fallback in case icon path isn't loaded yet
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-100 text-[11px] font-semibold mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Official Mobile App</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">UrbanPark Android & Mobile App</h2>
              <p className="text-blue-100 text-xs">Fast, battery-optimized smart parking right from your home screen</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Advantages */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">1-Tap Launch</div>
              <div className="text-[10px] text-slate-500">No URL typing</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <WifiOff className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">Works Offline</div>
              <div className="text-[10px] text-slate-500">Cached gate QR</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">Zero Storage</div>
              <div className="text-[10px] text-slate-500">&lt; 1MB lightweight</div>
            </div>
          </div>

          {/* Direct Install Button if supported */}
          {isInstallable && !isInstalled && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-blue-950">Ready for 1-Click Install</div>
                <div className="text-[11px] text-blue-700">Your browser supports direct automatic download.</div>
              </div>
              <button
                onClick={async () => {
                  const res = await onInstall();
                  if (res) onClose();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install on Phone</span>
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Already Installed!</span> UrbanPark is installed on your device. You can launch it directly from your phone app drawer or home screen.
              </div>
            </div>
          )}

          {/* Platform Specific Step-by-Step Instructions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              How to Install On Any Mobile Phone
            </h3>

            {/* Android Instructions */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  🤖
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Android (Chrome / Samsung / Edge)</h4>
                  <p className="text-[11px] text-slate-500">For Samsung Galaxy, Pixel, OnePlus, Xiaomi, and all Android phones</p>
                </div>
              </div>

              <ol className="text-xs text-slate-600 space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Tap the <strong>three vertical dots menu (<MoreVertical className="w-3.5 h-3.5 inline text-slate-700" />)</strong> in the top-right corner of Chrome or your browser.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>Confirm by tapping <strong>Install</strong>. The UrbanPark icon will appear on your phone's home screen alongside your other apps.</span>
                </li>
              </ol>
            </div>

            {/* iOS Instructions */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                  🍎
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">iPhone & iPad (Safari)</h4>
                  <p className="text-[11px] text-slate-500">For Apple iOS devices</p>
                </div>
              </div>

              <ol className="text-xs text-slate-600 space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Tap the <strong>Share button (<Share2 className="w-3.5 h-3.5 inline text-blue-600" />)</strong> at the bottom of Safari.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Scroll down and tap <strong>"Add to Home Screen" (<PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />)</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>Tap <strong>Add</strong> in the top-right corner. UrbanPark runs in full-screen standalone mode without Safari address bars!</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            PWA Version 2.4.0 · Auto-Updates
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
