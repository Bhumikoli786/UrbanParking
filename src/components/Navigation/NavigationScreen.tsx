import React, { useState, useEffect } from 'react';
import { ParkingFacility, Booking } from '../../types';
import { Navigation, ArrowUpRight, ArrowRight, CheckCircle2, Volume2, VolumeX, AlertTriangle, ShieldCheck, MapPin, X } from 'lucide-react';

interface NavigationScreenProps {
  facility: ParkingFacility;
  activeBooking?: Booking;
  onArrived: () => void;
  onExitNavigation: () => void;
}

export const NavigationScreen: React.FC<NavigationScreenProps> = ({
  facility,
  activeBooking,
  onArrived,
  onExitNavigation,
}) => {
  const [distanceRemaining, setDistanceRemaining] = useState(facility.distanceKm);
  const [etaMinutes, setEtaMinutes] = useState(facility.drivingEtaMinutes);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    { instruction: 'Head east on BKC Avenue toward G-Block', distance: '350 m' },
    { instruction: 'Turn right at Asian Heart Institute Signal', distance: '600 m' },
    { instruction: 'Keep left onto Smart Parking Approach Road', distance: '200 m' },
    { instruction: `Enter through Gate 1: ${facility.name}`, distance: '50 m' },
  ];

  // Progressive simulation of drive
  useEffect(() => {
    const timer = setInterval(() => {
      setDistanceRemaining(prev => {
        if (prev <= 0.1) return 0.1;
        return parseFloat((prev - 0.1).toFixed(1));
      });
      setEtaMinutes(prev => {
        if (prev <= 1) return 1;
        return prev - 1;
      });
      setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1));
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col justify-between">
      {/* Top Navigation HUD Banner */}
      <div className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700 px-4 py-3 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
              Next Turn in {steps[currentStepIndex].distance}
            </div>
            <div className="text-base font-bold text-white line-clamp-1">
              {steps[currentStepIndex].instruction}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVoiceMuted(!isVoiceMuted)}
            className="w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white"
            title="Toggle Voice Guidance"
            aria-label="Toggle voice guidance"
          >
            {isVoiceMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onExitNavigation}
            className="w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white"
            title="Exit Navigation"
            aria-label="Exit navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Nav Graphic HUD */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-6 text-center">
        {/* Animated Directional Compass */}
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full border-4 border-blue-500/30 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-blue-600/20 border-2 border-blue-500 flex items-center justify-center animate-pulse">
              <Navigation className="w-12 h-12 text-blue-400 transform rotate-45" />
            </div>
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Live Route
          </div>
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-white mb-1">
          {facility.name}
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
          {facility.address}
        </p>

        {activeBooking && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 max-w-sm w-full mx-auto flex items-center justify-between text-left mb-6">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Assigned Slot</div>
              <div className="text-base font-bold text-emerald-400 font-mono">
                {activeBooking.slotNumber} · {activeBooking.floor}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-medium">Plate</div>
              <div className="text-xs font-semibold text-slate-200">
                {activeBooking.vehicleNumber}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 text-slate-300 font-mono">
          <div>
            <div className="text-3xl font-extrabold text-white tabular-nums">{etaMinutes}</div>
            <div className="text-xs text-slate-400 uppercase font-sans">Mins Left</div>
          </div>
          <div className="w-px h-10 bg-slate-700" />
          <div>
            <div className="text-3xl font-extrabold text-white tabular-nums">{distanceRemaining}</div>
            <div className="text-xs text-slate-400 uppercase font-sans">Kilometers</div>
          </div>
          <div className="w-px h-10 bg-slate-700" />
          <div>
            <div className="text-3xl font-extrabold text-emerald-400 tabular-nums">Normal</div>
            <div className="text-xs text-slate-400 uppercase font-sans">Traffic</div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="bg-slate-800/95 backdrop-blur-md border-t border-slate-700 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Automated barrier scanner ready for vehicle entry.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onExitNavigation}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm transition-colors"
          >
            End Navigation
          </button>
          <button
            onClick={onArrived}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Have Arrived (Enter Bay)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
