import React from 'react';
import { Download, Smartphone, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  isInstallable: boolean;
  isInstalled: boolean;
  onInstall: () => Promise<boolean>;
  onOpenGuide: () => void;
  className?: string;
  showText?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  isInstallable,
  isInstalled,
  onInstall,
  onOpenGuide,
  className = '',
  showText = true,
}) => {
  if (isInstalled) {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 ${className}`}
        title="UrbanPark is installed as an app"
      >
        <Check className="w-3.5 h-3.5" />
        {showText && <span>App Installed</span>}
      </div>
    );
  }

  return (
    <button
      onClick={async () => {
        if (isInstallable) {
          await onInstall();
        } else {
          onOpenGuide();
        }
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 text-xs font-bold transition-all shadow-2xs group cursor-pointer ${className}`}
      title="Install UrbanPark on your phone"
      aria-label="Install UrbanPark App"
    >
      <Smartphone className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
      {showText && <span>Install App</span>}
    </button>
  );
};
