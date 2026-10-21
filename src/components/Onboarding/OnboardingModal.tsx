import React, { useState } from 'react';
import { Search, Radio, Calendar, Navigation, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { heroImg, mallImg, evImg, airportImg } from '../../data/mockData';

interface OnboardingModalProps {
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Find Parking Easily',
      subtitle: 'Eliminate city driving stress',
      description: 'Search destinations across urban hubs, commercial malls, hospitals, and transit hubs with instant GPS location awareness.',
      icon: Search,
      badge: 'Step 1 of 5',
      image: mallImg,
    },
    {
      title: 'See Live Availability',
      subtitle: 'IoT Sensor-Powered Telemetry',
      description: 'View real-time bay occupancy before you leave. Avoid full parking complexes with our live optical sensor network and predictive AI availability forecasts.',
      icon: Radio,
      badge: 'Step 2 of 5',
      image: heroImg,
    },
    {
      title: 'Reserve Your Spot',
      subtitle: 'Guaranteed parking waiting for you',
      description: 'Pick your exact preferred bay across Basement and Upper decks. Your spot is reserved and locked to your vehicle license plate.',
      icon: Calendar,
      badge: 'Step 3 of 5',
      image: airportImg,
    },
    {
      title: 'Navigate & Pay',
      subtitle: 'Contactless Digital Flow',
      description: 'Turn-by-turn guidance straight to the parking gate. Pay seamlessly with UPI, Card, or Wallet and receive a digital tax invoice.',
      icon: Navigation,
      badge: 'Step 4 of 5',
      image: evImg,
    },
    {
      title: 'Park and Go',
      subtitle: 'ANPR automated barrier entry',
      description: 'Barrier cameras recognize your license plate or scan your digital QR ticket. Pull straight in and go about your day.',
      icon: ShieldCheck,
      badge: 'Step 5 of 5',
      image: heroImg,
    },
  ];

  const stepData = steps[currentStep];
  const StepIcon = stepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media visual banner */}
        <div className="relative h-48 bg-slate-900 overflow-hidden">
          <img
            src={stepData.image}
            alt={stepData.title}
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          <div className="absolute bottom-4 left-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100/90 px-2 py-0.5 rounded-full">
                {stepData.badge}
              </span>
              <div className="text-xs font-semibold text-slate-800 mt-1">UrbanPark Solutions</div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 pt-2 space-y-4">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stepData.title}
            </h3>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-0.5">
              {stepData.subtitle}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              {stepData.description}
            </p>
          </div>

          {/* Stepper dots */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-600/30"
                >
                  <span>Find. Park. Go.</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
