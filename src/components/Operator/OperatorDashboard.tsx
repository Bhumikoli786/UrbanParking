import React, { useState, useEffect } from 'react';
import { ParkingFacility, ParkingSlot, Booking } from '../../types';
import { parkingService } from '../../services/parkingService';
import { bookingService } from '../../services/bookingService';
import { iotSimulationService } from '../../services/iotSimulationService';
import { 
  BarChart3, TrendingUp, Users, DollarSign, Clock, Zap, CheckCircle2, 
  AlertTriangle, Radio, Shield, Save, QrCode, Search, Wrench, RefreshCw 
} from 'lucide-react';

interface OperatorDashboardProps {
  onRefresh: () => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ onRefresh }) => {
  const [facilities, setFacilities] = useState<ParkingFacility[]>(parkingService.getFacilities());
  // Default to operator's facility (BKC Smart Mobility Tower)
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('fac_bkc_01');
  const facility = facilities.find(f => f.id === selectedFacilityId) || facilities[0];

  const [selectedFloor, setSelectedFloor] = useState<string>('Basement 1');
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>(bookingService.getBookings());
  
  // Gate check-in simulation input
  const [gateSearchQuery, setGateSearchQuery] = useState<string>('');
  const [gateFeedback, setGateFeedback] = useState<string | null>(null);

  // Facility rate edit state
  const [isEditingSettings, setIsEditingSettings] = useState<boolean>(false);
  const [editPricePerHour, setEditPricePerHour] = useState<number>(facility?.pricePerHour || 80);
  const [editHours, setEditHours] = useState<string>(facility?.openingHours || '24/7 All Days');

  useEffect(() => {
    if (facility) {
      setSlots(parkingService.getSlotsForFacility(facility.id));
      setEditPricePerHour(facility.pricePerHour);
      setEditHours(facility.openingHours);
    }
  }, [facility, selectedFacilityId]);

  const refreshDashboard = () => {
    setFacilities(parkingService.getFacilities());
    if (facility) {
      setSlots(parkingService.getSlotsForFacility(facility.id));
    }
    setAllBookings(bookingService.getBookings());
    onRefresh();
  };

  const handleToggleSlotStatus = (slot: ParkingSlot) => {
    const cycle: ParkingSlot['status'][] = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];
    const currentIndex = cycle.indexOf(slot.status);
    const nextStatus = cycle[(currentIndex + 1) % cycle.length];

    parkingService.updateSlotStatus(facility.id, slot.id, nextStatus);
    refreshDashboard();
  };

  const handleSimulateIotPulse = () => {
    const randomSlot = slots[Math.floor(Math.random() * slots.length)];
    const event = iotSimulationService.triggerRandomSensorEvent(facility, randomSlot);
    refreshDashboard();
    setGateFeedback(`IoT Event Broadcast: ${event.slotNumber} changed to ${event.newStatus} via ${event.sensorId}`);
    setTimeout(() => setGateFeedback(null), 4000);
  };

  const handleGateValidate = () => {
    const query = gateSearchQuery.trim().toUpperCase();
    if (!query) return;

    const matchedBooking = allBookings.find(
      b => b.facilityId === facility.id && 
      (b.bookingId.toUpperCase() === query || b.vehicleNumber.toUpperCase() === query)
    );

    if (matchedBooking) {
      if (matchedBooking.bookingStatus === 'CONFIRMED') {
        bookingService.checkIn(matchedBooking.bookingId);
        setGateFeedback(`ANPR Match: Vehicle ${matchedBooking.vehicleNumber} checked in. Boom Barrier Opened! Bay: ${matchedBooking.slotNumber}`);
      } else if (matchedBooking.bookingStatus === 'ACTIVE') {
        bookingService.checkOut(matchedBooking.bookingId);
        setGateFeedback(`Vehicle ${matchedBooking.vehicleNumber} checked out. Bay ${matchedBooking.slotNumber} released.`);
      } else {
        setGateFeedback(`Booking ${matchedBooking.bookingId} is already ${matchedBooking.bookingStatus}.`);
      }
      refreshDashboard();
      setGateSearchQuery('');
    } else {
      setGateFeedback(`No active reservation found for "${query}" at this facility.`);
    }

    setTimeout(() => setGateFeedback(null), 5000);
  };

  const handleSaveSettings = () => {
    parkingService.updateFacility(facility.id, {
      pricePerHour: editPricePerHour,
      openingHours: editHours,
    });
    setIsEditingSettings(false);
    refreshDashboard();
  };

  const facilityBookings = allBookings.filter(b => b.facilityId === facility.id);
  const todayRevenue = facilityBookings.reduce((sum, b) => sum + (b.paymentStatus === 'PAID' ? b.totalAmount : 0), 0);
  const occupancyPercent = facility ? Math.round((facility.occupiedSlots / facility.totalSlots) * 100) : 0;
  const floorSlots = slots.filter(s => s.floor === selectedFloor);

  return (
    <div className="space-y-6">
      {/* Operator Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              UrbanPark Operator Command Center
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {facility?.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operator: {facility?.operatorName} · Phone: {facility?.operatorPhone}
          </p>
        </div>

        {/* Facility Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedFacilityId}
            onChange={e => setSelectedFacilityId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {facilities.map(f => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSimulateIotPulse}
            className="py-2 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            title="Simulate an IoT sensor state change event"
          >
            <Radio className="w-3.5 h-3.5" /> Test IoT Event
          </button>
        </div>
      </div>

      {/* Real-time KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Available Bays</div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono mt-1 tabular-nums">
            {facility?.availableSlots}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            of {facility?.totalSlots} total bays
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Occupancy Rate</div>
          <div className="text-3xl font-extrabold text-slate-800 font-mono mt-1 tabular-nums">
            {occupancyPercent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {facility?.occupiedSlots} active bays
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Reserved Bays</div>
          <div className="text-3xl font-extrabold text-amber-600 font-mono mt-1 tabular-nums">
            {facility?.reservedSlots}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Incoming reservations
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Today's Revenue</div>
          <div className="text-3xl font-extrabold text-blue-600 font-mono mt-1 tabular-nums">
            ₹{Math.round(todayRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {facilityBookings.length} completed & active
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Hourly Tariff</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1 tabular-nums">
            ₹{facility?.pricePerHour}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1 cursor-pointer hover:underline" onClick={() => setIsEditingSettings(true)}>
            Edit tariffs & hours →
          </div>
        </div>
      </div>

      {/* ANPR & Manual Entry Barrier Validator */}
      <div className="p-5 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Automated Barrier Gate / ANPR Check-In Simulation</h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Scan QR code or enter vehicle plate (e.g. MH 02 EQ 7824 or UP-2026-88192)
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={gateSearchQuery}
            onChange={e => setGateSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGateValidate()}
            placeholder="Enter Plate Number or Booking ID to Simulate Boom Barrier Access..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs uppercase placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleGateValidate}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shrink-0 shadow-md shadow-blue-600/20"
          >
            Trigger Barrier Open
          </button>
        </div>

        {gateFeedback && (
          <div className="mt-3 p-3 rounded-xl bg-blue-950/80 border border-blue-500/40 text-xs font-mono text-blue-200">
            {gateFeedback}
          </div>
        )}
      </div>

      {/* Interactive Slot Management Grid */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              Interactive Bay Status Controller
            </h3>
            <p className="text-xs text-slate-500">
              Click any bay to cycle its state (Available → Occupied → Reserved → Maintenance).
            </p>
          </div>

          {/* Floor tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['Basement 1', 'Floor 1', 'Floor 2'].map(floor => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedFloor === floor
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {floor}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-400" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 text-white" /> Occupied
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400" /> Reserved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-400" /> Maintenance
          </span>
        </div>

        {/* Bays */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          {floorSlots.map(slot => {
            let bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100';
            if (slot.status === 'OCCUPIED') bgClass = 'bg-slate-800 border-slate-900 text-white hover:bg-slate-700';
            else if (slot.status === 'RESERVED') bgClass = 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100';
            else if (slot.status === 'MAINTENANCE') bgClass = 'bg-red-50 border-red-300 text-red-950 hover:bg-red-100';

            return (
              <button
                key={slot.id}
                onClick={() => handleToggleSlotStatus(slot)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs ${bgClass}`}
                title={`Bay ${slot.slotNumber} - Click to cycle status`}
              >
                <span className="text-sm font-bold font-mono">{slot.slotNumber}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                  {slot.status}
                </span>
                <span className="text-[9px] opacity-75 font-mono mt-1">
                  {slot.type.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming / Active Reservations at this facility */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900">
            Active & Upcoming Facility Reservations ({facilityBookings.length})
          </h3>
          <button
            onClick={refreshDashboard}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Booking ID</th>
                <th className="p-3">Slot</th>
                <th className="p-3">Vehicle Plate</th>
                <th className="p-3">Schedule</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {facilityBookings.map(b => (
                <tr key={b.bookingId} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-blue-600">{b.bookingId}</td>
                  <td className="p-3 font-bold text-slate-800">{b.slotNumber}</td>
                  <td className="p-3">{b.vehicleNumber}</td>
                  <td className="p-3 font-sans">{b.date} · {b.startTime} - {b.endTime}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.bookingStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                      b.bookingStatus === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold">₹{b.totalAmount}</td>
                  <td className="p-3 text-right font-sans">
                    {b.bookingStatus === 'CONFIRMED' && (
                      <button
                        onClick={() => {
                          bookingService.checkIn(b.bookingId);
                          refreshDashboard();
                        }}
                        className="text-emerald-600 hover:text-emerald-800 font-semibold"
                      >
                        Check-in
                      </button>
                    )}
                    {b.bookingStatus === 'ACTIVE' && (
                      <button
                        onClick={() => {
                          bookingService.checkOut(b.bookingId);
                          refreshDashboard();
                        }}
                        className="text-amber-600 hover:text-amber-800 font-semibold"
                      >
                        Check-out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Facility Settings Modal */}
      {isEditingSettings && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-200">
            <h4 className="font-bold text-lg mb-1">Configure Facility Settings</h4>
            <p className="text-xs text-slate-500 mb-4">{facility.name}</p>

            <div className="space-y-3 text-xs mb-6">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Car Tariff (₹ / Hour)</label>
                <input
                  type="number"
                  value={editPricePerHour}
                  onChange={e => setEditPricePerHour(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Operating Hours Schedule</label>
                <input
                  type="text"
                  value={editHours}
                  onChange={e => setEditHours(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingSettings(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
