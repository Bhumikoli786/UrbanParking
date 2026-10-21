import React, { useState, useMemo } from 'react';
import { ParkingFacility, Booking } from '../../types';
import { ParkingMap } from '../Map/ParkingMap';
import { aiPredictionService } from '../../services/aiPredictionService';
import { AndroidAppPromoCard } from '../PWA/AndroidAppPromoCard';
import { 
  Search, MapPin, Navigation, Star, Zap, Shield, Filter, 
  Sparkles, Radio, ArrowRight, Clock, Car, ChevronRight, CheckCircle2, SlidersHorizontal 
} from 'lucide-react';

interface DriverHomeProps {
  facilities: ParkingFacility[];
  activeBookings: Booking[];
  selectedFacility: ParkingFacility | null;
  onSelectFacility: (facility: ParkingFacility) => void;
  onReserveFacility: (facility: ParkingFacility) => void;
  onNavigateToFacility: (facility: ParkingFacility) => void;
  onViewBookingPass: (booking: Booking) => void;
  latestIotEvent: { facilityName: string; slotNumber: string; newStatus: string } | null;
  isPWAInstallable?: boolean;
  isPWAInstalled?: boolean;
  onInstallPWA?: () => Promise<boolean>;
  onOpenPWAGuide?: () => void;
}

export const DriverHome: React.FC<DriverHomeProps> = ({
  facilities,
  activeBookings,
  selectedFacility,
  onSelectFacility,
  onReserveFacility,
  onNavigateToFacility,
  onViewBookingPass,
  latestIotEvent,
  isPWAInstallable = false,
  isPWAInstalled = false,
  onInstallPWA = async () => false,
  onOpenPWAGuide = () => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Hubs');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [filterType, setFilterType] = useState<'all' | 'ev' | 'covered' | 'affordable' | 'valet'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'distance' | 'price' | 'rating' | 'available'>('recommended');

  const cityOptions = ['All Hubs', 'Mumbai', 'Bengaluru', 'Delhi NCR'];

  // Active / Upcoming booking highlight
  const primaryActiveBooking = activeBookings.find(b => b.bookingStatus === 'ACTIVE' || b.bookingStatus === 'CONFIRMED');

  // Filter & Search Logic
  const filteredFacilities = useMemo(() => {
    let result = facilities.filter(f => f.approved);

    // City filter
    if (selectedCity !== 'All Hubs') {
      result = result.filter(f => f.city.toLowerCase().includes(selectedCity.toLowerCase()));
    }

    // Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.landmark.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    }

    // Secondary filters
    if (filterType === 'ev') {
      result = result.filter(f => f.evChargingAvailable);
    } else if (filterType === 'covered') {
      result = result.filter(f => f.isCovered);
    } else if (filterType === 'affordable') {
      result = result.filter(f => f.pricePerHour <= 80);
    } else if (filterType === 'valet') {
      result = result.filter(f => f.hasValet);
    }

    // Sorting
    if (sortBy === 'distance') {
      result = [...result].sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'price') {
      result = [...result].sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'available') {
      result = [...result].sort((a, b) => b.availableSlots - a.availableSlots);
    }

    return result;
  }, [facilities, selectedCity, searchQuery, filterType, sortBy]);

  // AI Recommendation spotlight
  const aiRecommendations = useMemo(() => {
    return aiPredictionService.getRecommendations(facilities, filterType === 'ev');
  }, [facilities, filterType]);

  const topRecommendation = aiRecommendations.length > 0 ? aiRecommendations[0] : null;

  return (
    <div className="space-y-6">
      {/* Search & Location Bar */}
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Current City Hub:</span>
              <span className="font-semibold text-slate-900">Bandra Kurla Complex, Mumbai</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Find, Reserve & Park in Real Time
            </h1>
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto overflow-x-auto">
            {cityOptions.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedCity === city
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search destination, airport, mall, or landmark..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Map View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                List View
              </button>
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="recommended">AI Recommended</option>
              <option value="distance">Nearest</option>
              <option value="price">Cheapest</option>
              <option value="rating">Highest Rated</option>
              <option value="available">Most Available</option>
            </select>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Lots' },
            { id: 'ev', label: '⚡ Fast EV Charging' },
            { id: 'covered', label: 'Covered Parking' },
            { id: 'affordable', label: 'Budget (≤ ₹80/h)' },
            { id: 'valet', label: 'Valet Service' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                filterType === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Trip Banner (if user has an ongoing or confirmed booking) */}
      {primaryActiveBooking && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 rounded-3xl shadow-lg border border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-mono font-bold text-sm shrink-0">
              {primaryActiveBooking.slotNumber}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {primaryActiveBooking.bookingStatus} RESERVATION
                </span>
                <span className="text-xs font-mono text-slate-300">{primaryActiveBooking.bookingId}</span>
              </div>
              <h3 className="font-bold text-base">{primaryActiveBooking.facilityName}</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Vehicle: {primaryActiveBooking.vehicleNumber} · Valid until {primaryActiveBooking.endTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewBookingPass(primaryActiveBooking)}
              className="py-2.5 px-4 rounded-xl bg-white text-blue-950 font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm"
            >
              View Pass & QR
            </button>
          </div>
        </div>
      )}

      {/* Real-time IoT Sensor Event Feed (Quiet Anti-Slop Toast) */}
      {latestIotEvent && (
        <div className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-2xl flex items-center justify-between text-xs text-slate-600 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">IoT Telemetry:</span>
            <span>
              Bay {latestIotEvent.slotNumber} marked <strong className="font-bold">{latestIotEvent.newStatus}</strong> at {latestIotEvent.facilityName}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Just now</span>
        </div>
      )}

      {/* AI Recommendation Engine Card */}
      {topRecommendation && (
        <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-white p-5 rounded-3xl border border-indigo-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  AI Recommendation · {topRecommendation.score} Score
                </span>
                <span className="text-xs text-slate-400 font-mono">Real-time match</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{topRecommendation.facility.name}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{topRecommendation.reason}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectFacility(topRecommendation.facility)}
              className="py-2 px-3 rounded-xl border border-indigo-200 text-indigo-900 bg-white font-semibold text-xs hover:bg-indigo-50 transition-colors"
            >
              Details
            </button>
            <button
              onClick={() => onReserveFacility(topRecommendation.facility)}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm"
            >
              Reserve Bay (₹{topRecommendation.facility.pricePerHour}/h)
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Map or List View */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <ParkingMap
            facilities={filteredFacilities}
            selectedFacility={selectedFacility}
            onSelectFacility={onSelectFacility}
          />

          {/* Horizontal Facility Quick Cards Bar below Map */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Nearby Parking Facilities ({filteredFacilities.length})
              </h3>
              <button
                onClick={() => setViewMode('list')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Expand full list →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFacilities.slice(0, 3).map(fac => (
                <div
                  key={fac.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{fac.name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{fac.address}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold font-mono text-slate-900">₹{fac.pricePerHour}/h</div>
                        <div className="text-[10px] text-slate-500">{fac.distanceKm} km</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs my-2">
                      <span className="font-bold text-emerald-600 font-mono">
                        {fac.availableSlots} free bays
                      </span>
                      <span>·</span>
                      <span className="text-slate-500">{fac.drivingEtaMinutes}m drive</span>
                      <span>·</span>
                      <span className="flex items-center text-amber-500 font-semibold">
                        <Star className="w-3 h-3 fill-amber-500 mr-0.5" />
                        {fac.rating}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectFacility(fac)}
                      className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onReserveFacility(fac)}
                      className="py-1.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                    >
                      Reserve Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Full List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFacilities.map(fac => {
            const occupancyPercent = Math.round((fac.occupiedSlots / fac.totalSlots) * 100);

            return (
              <div
                key={fac.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          fac.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          fac.status === 'LIMITED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {fac.status}
                        </span>
                        {fac.evChargingAvailable && (
                          <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                            ⚡ EV Ready
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">{fac.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{fac.address}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold font-mono text-slate-900">
                        ₹{fac.pricePerHour} <span className="text-xs text-slate-400 font-normal">/h</span>
                      </div>
                      <div className="text-xs text-amber-500 font-semibold flex items-center justify-end gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{fac.rating} ({fac.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  <div className="my-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-600">
                        Live Availability: <strong className="font-mono text-emerald-600">{fac.availableSlots}</strong> of {fac.totalSlots} bays
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{occupancyPercent}% full</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                      <div className="bg-slate-700 h-full" style={{ width: `${occupancyPercent}%` }} />
                      <div className="bg-emerald-500 h-full flex-1" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span>📍 {fac.distanceKm} km away</span>
                    <span>🚗 {fac.drivingEtaMinutes} mins drive</span>
                    <span>🚶 {fac.walkingEtaMinutes} mins walk</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigateToFacility(fac)}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Directions</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectFacility(fac)}
                      className="py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onReserveFacility(fac)}
                      className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-md shadow-blue-600/20"
                    >
                      Reserve Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Android & Mobile App Download Feature Card */}
      <AndroidAppPromoCard
        onInstall={onInstallPWA}
        onOpenGuide={onOpenPWAGuide}
        isInstallable={isPWAInstallable}
        isInstalled={isPWAInstalled}
      />
    </div>
  );
};
