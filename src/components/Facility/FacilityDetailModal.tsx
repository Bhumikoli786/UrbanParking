import React, { useState } from 'react';
import { ParkingFacility } from '../../types';
import { aiPredictionService } from '../../services/aiPredictionService';
import { parkingService } from '../../services/parkingService';
import { 
  MapPin, Clock, Star, ShieldCheck, Zap, Navigation, Calendar, 
  Car, Info, Sparkles, Check, X, Phone, AlertTriangle, ArrowRight 
} from 'lucide-react';

interface FacilityDetailModalProps {
  facility: ParkingFacility;
  onClose: () => void;
  onReserve: (facility: ParkingFacility) => void;
  onNavigate: (facility: ParkingFacility) => void;
}

export const FacilityDetailModal: React.FC<FacilityDetailModalProps> = ({
  facility,
  onClose,
  onReserve,
  onNavigate,
}) => {
  const [selectedHourOffset, setSelectedHourOffset] = useState<number>(2);
  const reviews = parkingService.getReviewsForFacility(facility.id);

  // AI prediction
  const prediction = aiPredictionService.predictAvailability(facility, selectedHourOffset);

  const getStatusBadge = (status: ParkingFacility['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LIMITED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FULL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const occupancyPercent = Math.round((facility.occupiedSlots / facility.totalSlots) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Facility Media Hero */}
        <div className="relative h-60 w-full bg-slate-900 overflow-hidden">
          <img
            src={facility.imageUrl}
            alt={facility.name}
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

          {/* Close trigger */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/70 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Badges */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(facility.status)}`}>
                  {facility.status}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {facility.category.toUpperCase()} · {facility.city}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                {facility.name}
              </h2>
            </div>

            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-slate-900 shrink-0">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-bold text-sm">{facility.rating}</span>
              <span className="text-[11px] text-slate-500">({facility.reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 max-h-[calc(85vh-240px)] overflow-y-auto space-y-6">
          {/* Address & Meta bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 border-b border-slate-100 pb-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">{facility.address}</p>
                <p className="text-slate-400 mt-0.5">Near {facility.landmark}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0 font-medium">
              <div className="flex items-center gap-1 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{facility.openingHours}</span>
              </div>
              <div className="text-blue-600 font-semibold font-mono">
                {facility.distanceKm} km · {facility.drivingEtaMinutes}m drive
              </div>
            </div>
          </div>

          {/* Real-time Occupancy Metrics */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Live IoT Occupancy Snapshot
              </h4>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                  {facility.availableSlots}
                </div>
                <div className="text-[10px] font-medium text-emerald-600 uppercase mt-0.5">Available</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-2xl font-bold font-mono text-slate-700 tabular-nums">
                  {facility.occupiedSlots}
                </div>
                <div className="text-[10px] font-medium text-slate-500 uppercase mt-0.5">Occupied</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl">
                <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
                  {facility.reservedSlots}
                </div>
                <div className="text-[10px] font-medium text-amber-600 uppercase mt-0.5">Reserved</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl">
                <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums">
                  {facility.totalSlots}
                </div>
                <div className="text-[10px] font-medium text-blue-600 uppercase mt-0.5">Total Bays</div>
              </div>
            </div>

            {/* Occupancy Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Occupancy Rate</span>
                <span className="font-semibold">{occupancyPercent}% filled</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                <div className="bg-slate-700 h-full" style={{ width: `${occupancyPercent}%` }} />
                <div className="bg-amber-400 h-full" style={{ width: `${(facility.reservedSlots / facility.totalSlots) * 100}%` }} />
                <div className="bg-emerald-500 h-full flex-1" />
              </div>
            </div>
          </div>

          {/* AI Future Availability Prediction Engine */}
          <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-100 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Availability Forecast</span>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                {prediction.confidenceScore}% Confidence
              </span>
            </div>

            <p className="text-xs text-indigo-950/80 mb-3">
              Expected availability at <strong className="font-mono">{prediction.targetHour}</strong>: <strong className="text-indigo-900 font-mono">{prediction.predictedAvailableSlots} spaces</strong>.
              {' '}{prediction.demandTrend === 'HIGH' ? 'High peak congestion expected during this window.' : 'Smooth entry expected.'}
            </p>

            {/* Hourly offset tabs */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-indigo-800/80 font-medium">Predict for:</span>
              <div className="flex gap-1">
                {[1, 2, 4, 6].map(offset => (
                  <button
                    key={offset}
                    onClick={() => setSelectedHourOffset(offset)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      selectedHourOffset === offset
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-indigo-900 hover:bg-indigo-100/60'
                    }`}
                  >
                    +{offset}h
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 text-[10px] text-slate-500 italic">
              * Heuristic machine simulation grounded in diurnal traffic flows, day of week, and venue category.
            </div>
          </div>

          {/* EV Charging Station Details (If supported) */}
          {facility.evChargingAvailable && facility.evChargers && facility.evChargers.length > 0 && (
            <div className="p-4 bg-cyan-50/60 border border-cyan-100 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 font-bold text-sm text-cyan-950">
                  <Zap className="w-4 h-4 text-cyan-600" />
                  <span>On-Site EV Fast Charging Hub</span>
                </div>
                <span className="text-xs font-semibold text-cyan-700">Ultra-Speed Dispensers</span>
              </div>

              <div className="space-y-2">
                {facility.evChargers.map(charger => (
                  <div
                    key={charger.id}
                    className="p-3 bg-white rounded-xl border border-cyan-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{charger.chargerType}</div>
                      <div className="text-slate-500 mt-0.5">
                        {charger.powerKw} kW Power · ~{charger.estimatedFullChargeMinutes}m to 80%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-cyan-700">₹{charger.pricePerKwh}/kWh</div>
                      <div className="text-[11px] text-emerald-600 font-medium">
                        {charger.availableUnits} of {charger.totalUnits} Ready
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities & Security Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Facility Features & Amenities
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>{facility.isCovered ? 'Covered Parking' : 'Open Air Lot'}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>{facility.hasValet ? 'Valet Available' : 'Self Park'}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>{facility.hasCctv ? '24/7 CCTV & Guards' : 'Basic Security'}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>Accessible (ADA) Bays</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>ANPR Boom Barriers</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>{facility.hasCarWash ? 'Car Wash Bay' : 'No Wash Bay'}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Cancellation Policies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <h5 className="font-bold text-slate-900 mb-1.5">Tariff Structure</h5>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Cars & SUVs:</span>
                  <span className="font-mono font-bold text-slate-900">₹{facility.pricePerHour}/hour</span>
                </div>
                <div className="flex justify-between">
                  <span>Two-Wheelers:</span>
                  <span className="font-mono font-bold text-slate-900">₹{facility.twoWheelerPricePerHour}/hour</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <h5 className="font-bold text-slate-900 mb-1.5">Cancellation Policy</h5>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {facility.cancellationPolicy}
              </p>
            </div>
          </div>

          {/* Reviews List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Verified Commuter Reviews ({reviews.length})
            </h4>
            <div className="space-y-2">
              {reviews.map(rev => (
                <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900">{rev.userName}</span>
                    <div className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-500 mr-0.5" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-slate-600">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Starting from</div>
            <div className="text-xl font-bold font-mono text-slate-900">
              ₹{facility.pricePerHour} <span className="text-xs text-slate-500 font-normal">/ hour</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(facility)}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>Directions</span>
            </button>
            <button
              onClick={() => onReserve(facility)}
              className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
