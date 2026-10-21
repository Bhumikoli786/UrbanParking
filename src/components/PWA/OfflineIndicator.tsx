import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showRestored, setShowRestored] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true);
    } else if (hasBeenOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
        setHasBeenOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  if (isOnline && !showRestored) {
    return null;
  }

  if (showRestored) {
    return (
      <aside 
        aria-live="polite"
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
        <span>Connection restored. Live IoT bay sync active.</span>
      </aside>
    );
  }

  return (
    <aside 
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white border border-slate-700 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs backdrop-blur-md max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <WifiOff className="w-4 h-4" />
      </div>
      <div>
        <div className="font-bold text-slate-100">You are in Offline Mode</div>
        <div className="text-[11px] text-slate-400">Cached parking passes and saved garages remain accessible.</div>
      </div>
    </aside>
  );
};
