import React, { useState } from 'react';
import { ParkingFacility } from '../../types';
import { Zap, Navigation, BatteryCharging, Clock, ShieldCheck, Sparkles, Sliders } from 'lucide-react';
import { evImg } from '../../data/mockData';

interface EVChargingHubProps {
  facilities: ParkingFacility[];
  onSelectFacility: (facility: ParkingFacility) => void;
  onNavigate: (facility: ParkingFacility) => void;
}

export const EVChargingHub: React.FC<EVChargingHubProps> = ({
  facilities,
  onSelectFacility,
  onNavigate,
}) => {
  const [filterChargerType, setFilterChargerType] = useState<string>('all');
  const [batteryCurrent, setBatteryCurrent] = useState<number>(20);
  const [batteryTarget, setBatteryTarget] = useState<number>(85);

  const evFacilities = facilities.filter(f => f.evChargingAvailable && f.evChargers && f.evChargers.length > 0);

  // Estimator math
  const batteryDelta = Math.max(0, batteryTarget - batteryCurrent);
  const averagePackKwh = 45; // e.g. Tata Nexon EV Max / MG ZS EV pack
  const kwhNeeded = parseFloat(((batteryDelta / 100) * averagePackKwh).toFixed(1));
  const estimatedCost = Math.round(kwhNeeded * 18);
  const estimatedMinutes = Math.round((kwhNeeded / 50) * 60);

  return (
    <div className="space-y-6">
      {/* EV Hero Spotlight Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-6 md:p-8 border border-slate-800 shadow-xl">
        <img
          src={evImg}
          alt="EV Super-Station"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4" />
            <span>UrbanPark Clean Mobility Grid</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            Fast EV Charging & Park-While-You-Charge
          </h2>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-6">
            Locate high-power 60kW to 150kW DC fast chargers with live bay availability. Reserve parking and charging together so you never wait in line.
          </p>

          {/* Quick interactive EV Battery Time & Cost Calculator */}
          <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span className="flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4" /> Smart Charging Estimator (45 kWh Pack)
              </span>
              <span className="text-slate-400 font-mono">{batteryCurrent}% → {batteryTarget}%</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Current State of Charge</label>
                <input
                  type="range"
                  min="5"
                  max="70"
                  value={batteryCurrent}
                  onChange={e => setBatteryCurrent(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target State of Charge</label>
                <input
                  type="range"
                  min="75"
                  max="100"
                  value={batteryTarget}
                  onChange={e => setBatteryTarget(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs font-mono">
              <div className="text-slate-300">
                ⚡ <strong className="text-white font-bold">{kwhNeeded} kWh</strong> needed
              </div>
              <div className="text-slate-300">
                ⏱ ~<strong className="text-cyan-400 font-bold">{estimatedMinutes} mins</strong> on 60kW DC
              </div>
              <div className="text-emerald-400 font-bold">
                ₹{estimatedCost} est. cost
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Verified EV Charging Facilities ({evFacilities.length})
        </h3>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterChargerType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterChargerType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Speeds
          </button>
          <button
            onClick={() => setFilterChargerType('fast')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterChargerType === 'fast'
                ? 'bg-white text-cyan-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fast DC (60kW+)
          </button>
        </div>
      </div>

      {/* Facility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evFacilities.map(fac => {
          const mainCharger = fac.evChargers ? fac.evChargers[0] : null;

          return (
            <div
              key={fac.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-cyan-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                      {mainCharger?.powerKw || 60} kW High Speed
                    </span>
                    <h4 className="font-bold text-base text-slate-900 mt-1 line-clamp-1">
                      {fac.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{fac.address}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-bold font-mono text-cyan-800">
                      ₹{mainCharger?.pricePerKwh || 18} <span className="text-[10px] font-normal text-slate-500">/ kWh</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      + ₹{fac.pricePerHour}/h park
                    </div>
                  </div>
                </div>

                {/* Live Stall Availability */}
                {mainCharger && (
                  <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100 my-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-600" />
                      <span className="font-medium text-slate-800">{mainCharger.chargerType}</span>
                    </div>
                    <span className="font-semibold text-emerald-700">
                      {mainCharger.availableUnits} of {mainCharger.totalUnits} Ready
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-mono">
                  {fac.distanceKm} km · {fac.drivingEtaMinutes}m drive
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate(fac)}
                    className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Navigate</span>
                  </button>
                  <button
                    onClick={() => onSelectFacility(fac)}
                    className="py-2 px-4 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold transition-colors"
                  >
                    Reserve Stall
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
