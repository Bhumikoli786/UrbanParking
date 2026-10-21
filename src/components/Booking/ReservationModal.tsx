import React, { useState, useEffect } from 'react';
import { ParkingFacility, ParkingSlot, Vehicle, Promotion, Booking } from '../../types';
import { parkingService } from '../../services/parkingService';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { promotionService } from '../../services/promotionService';
import { authService } from '../../services/authService';
import { 
  Car, Calendar, Clock, CheckCircle2, ChevronRight, ArrowLeft, 
  CreditCard, Smartphone, Wallet, Building2, Tag, ShieldCheck, Zap, X, AlertCircle, Loader2 
} from 'lucide-react';

interface ReservationModalProps {
  facility: ParkingFacility;
  onClose: () => void;
  onBookingComplete: (booking: Booking) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  facility,
  onClose,
  onBookingComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const currentUser = authService.getCurrentUser();
  const user = currentUser || {
    id: 'usr_guest',
    name: 'Driver Guest',
    email: 'guest@urbanpark.in',
    phone: '+91 98200 12345',
    role: 'driver' as const,
    loyaltyPoints: 0,
  };
  const vehicles = authService.getVehicles();

  // Booking Form State
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(vehicles[0] || {
    id: 'veh_temp',
    userId: user.id,
    nickname: 'My Car',
    vehicleNumber: 'MH 02 EQ 7824',
    type: 'car',
    makeModel: 'Sedan',
    fuelType: 'petrol',
    isDefault: true,
  });

  const [date, setDate] = useState<string>('Today');
  const [startTime, setStartTime] = useState<string>('11:00 AM');
  const [durationHours, setDurationHours] = useState<number>(3);
  const [selectedFloor, setSelectedFloor] = useState<string>('Basement 1');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  
  // Promo state
  const [promoInput, setPromoInput] = useState<string>('FIRSTPARK50');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | undefined>(
    promotionService.applyCode('FIRSTPARK50')
  );
  const [promoMessage, setPromoMessage] = useState<string>('₹50 introductory discount applied!');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Wallet' | 'NetBanking'>('UPI');
  const [upiId, setUpiId] = useState<string>('aarav@okhdfcbank');
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 9924');
  const [cardExpiry, setCardExpiry] = useState<string>('08/29');
  const [cardCvv, setCardCvv] = useState<string>('•••');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Slots for the facility
  const [allSlots, setAllSlots] = useState<ParkingSlot[]>([]);

  useEffect(() => {
    const slots = parkingService.getSlotsForFacility(facility.id);
    setAllSlots(slots);
    // Auto-select first available slot on current floor
    const firstAvail = slots.find(s => s.status === 'AVAILABLE' && s.floor === selectedFloor) 
      || slots.find(s => s.status === 'AVAILABLE');
    if (firstAvail) setSelectedSlot(firstAvail);
  }, [facility.id, selectedFloor]);

  const handleApplyPromo = () => {
    const p = promotionService.applyCode(promoInput);
    if (p) {
      setAppliedPromo(p);
      setPromoMessage(`Coupon applied: ${p.title}`);
    } else {
      setAppliedPromo(undefined);
      setPromoMessage('Invalid or expired coupon code.');
    }
  };

  const pricing = bookingService.calculateFee(
    facility,
    selectedVehicle,
    durationHours,
    appliedPromo
  );

  const handleProcessPayment = async () => {
    if (!selectedSlot) {
      setPaymentError('Please choose a valid parking slot.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const payRes = await paymentService.processPayment({
        bookingId: `UP-${Date.now()}`,
        amount: pricing.totalAmount,
        currency: 'INR',
        method: paymentMethod,
        methodDetails: {
          upiId: paymentMethod === 'UPI' ? upiId : undefined,
          cardNumberLast4: paymentMethod === 'Card' ? '9924' : undefined,
        },
      });

      if (payRes.success) {
        const createdBooking = bookingService.createBooking({
          userId: user.id,
          facility,
          slot: selectedSlot,
          vehicle: selectedVehicle,
          date,
          startTime,
          durationHours,
          paymentMethod,
          paymentTransactionId: payRes.transactionId,
          promo: appliedPromo,
        });

        setIsProcessingPayment(false);
        onBookingComplete(createdBooking);
      } else {
        setIsProcessingPayment(false);
        setPaymentError(payRes.errorMessage || 'Payment could not be completed.');
      }
    } catch {
      setIsProcessingPayment(false);
      setPaymentError('Network handshake timeout. Please retry.');
    }
  };

  const floors = ['Basement 1', 'Floor 1', 'Floor 2'];
  const floorSlots = allSlots.filter(s => s.floor === selectedFloor);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(prev => prev - 1)}
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-bold text-base line-clamp-1">{facility.name}</h3>
              <p className="text-xs text-slate-400">Step {step} of 6 · Reserve Smart Bay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* STEP 1: Select Vehicle */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-lg">Select Your Vehicle</h4>
              <p className="text-xs text-slate-500">
                Choose the registered car, SUV, or EV that will access the barrier gate.
              </p>

              <div className="space-y-2.5">
                {vehicles.map(v => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicle(v)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedVehicle.id === v.id
                        ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        v.type === 'ev' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {v.type === 'ev' ? <Zap className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          {v.nickname}
                          {v.type === 'ev' && (
                            <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-medium">
                              EV
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {v.vehicleNumber} · {v.makeModel}
                        </div>
                      </div>
                    </div>
                    {selectedVehicle.id === v.id && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                Continue to Date & Time <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-lg">Select Date & Arrival Time</h4>
              <p className="text-xs text-slate-500">Pick when you plan to pull into the parking lot.</p>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Date</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Today', 'Tomorrow', 'This Weekend'].map(d => (
                    <button
                      key={d}
                      onClick={() => setDate(d)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                        date === d
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Arrival Time Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', '07:00 PM', '09:00 PM', '11:00 PM'].map(t => (
                    <button
                      key={t}
                      onClick={() => setStartTime(t)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-medium border transition-colors ${
                        startTime === t
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 font-medium text-xs text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  Choose Duration <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Duration */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-lg">Select Parking Duration</h4>
              <p className="text-xs text-slate-500">How many hours will you need this parking bay?</p>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center">
                <div className="flex items-center gap-6 mb-4">
                  <button
                    onClick={() => setDurationHours(prev => Math.max(1, prev - 1))}
                    className="w-12 h-12 rounded-2xl bg-white border border-slate-300 text-slate-800 font-bold text-xl hover:bg-slate-100 flex items-center justify-center shadow-sm"
                  >
                    -
                  </button>
                  <div className="text-center">
                    <div className="text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
                      {durationHours}
                    </div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                      Hours Reserved
                    </div>
                  </div>
                  <button
                    onClick={() => setDurationHours(prev => Math.min(12, prev + 1))}
                    className="w-12 h-12 rounded-2xl bg-white border border-slate-300 text-slate-800 font-bold text-xl hover:bg-slate-100 flex items-center justify-center shadow-sm"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  Rate: ₹{selectedVehicle.type === 'motorcycle' ? facility.twoWheelerPricePerHour : facility.pricePerHour} / hour
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 font-medium text-xs text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  Choose Parking Bay <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Choose Parking Bay */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Pick Your Spot</h4>
                  <p className="text-xs text-slate-500">Live IoT occupancy map for this facility.</p>
                </div>
                {/* Floor Picker */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {floors.map(floor => (
                    <button
                      key={floor}
                      onClick={() => setSelectedFloor(floor)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        selectedFloor === floor
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {floor === 'Basement 1' ? 'B1' : floor === 'Floor 1' ? 'F1' : 'F2'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slot Legend */}
              <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-500" /> Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-slate-200 border border-slate-400" /> Occupied
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-amber-100 border border-amber-500" /> Reserved
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-cyan-100 border border-cyan-500" /> EV Bay
                </span>
              </div>

              {/* Bay Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 bg-slate-100 rounded-2xl max-h-56 overflow-y-auto">
                {floorSlots.map(slot => {
                  const isAvail = slot.status === 'AVAILABLE';
                  const isSelected = selectedSlot?.id === slot.id;
                  const isEv = slot.type === 'ev';

                  return (
                    <button
                      key={slot.id}
                      disabled={!isAvail}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 scale-105'
                          : isAvail
                          ? isEv
                            ? 'bg-cyan-50 border border-cyan-400 text-cyan-900 hover:bg-cyan-100'
                            : 'bg-emerald-50 border border-emerald-400 text-emerald-900 hover:bg-emerald-100'
                          : 'bg-slate-200/80 border border-slate-300 text-slate-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span className="text-xs font-bold font-mono">{slot.slotNumber}</span>
                      <span className="text-[9px] uppercase font-medium mt-0.5">
                        {isEv ? 'EV' : slot.type === 'handicap' ? 'ADA' : isAvail ? 'Open' : 'Busy'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedSlot && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Selected Bay: </span>
                    <span className="font-bold text-blue-900 font-mono">{selectedSlot.slotNumber} ({selectedSlot.floor})</span>
                  </div>
                  <span className="text-emerald-700 font-medium">IoT Sensor Active</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 font-medium text-xs text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  disabled={!selectedSlot}
                  onClick={() => setStep(5)}
                  className="flex-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  Review Summary <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Booking Summary & Coupon */}
          {step === 5 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-lg">Booking Summary</h4>
              <p className="text-xs text-slate-500">Review your reservation details before digital payment.</p>

              {/* Summary Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Facility:</span>
                  <span className="font-semibold text-slate-900 text-right max-w-[220px] truncate">{facility.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Bay:</span>
                  <span className="font-mono font-bold text-blue-600">{selectedSlot?.slotNumber} ({selectedSlot?.floor})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-mono font-medium">{selectedVehicle.vehicleNumber} ({selectedVehicle.makeModel})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Schedule:</span>
                  <span className="font-medium">{date} · {startTime} ({durationHours} hours)</span>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon (e.g. WEEKEND20)"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className={`text-[11px] ${appliedPromo ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-1.5 border-t border-slate-200 pt-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Parking Subtotal ({durationHours}h × ₹{pricing.baseRate}):</span>
                  <span className="font-mono">₹{pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>UrbanPark Platform Convenience Fee:</span>
                  <span className="font-mono">₹{pricing.convenienceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%):</span>
                  <span className="font-mono">₹{pricing.taxAmount.toFixed(2)}</span>
                </div>
                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Applied:</span>
                    <span className="font-mono">-₹{pricing.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total Payable:</span>
                  <span className="font-mono text-base text-blue-600">₹{pricing.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 font-medium text-xs text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="flex-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  Proceed to Payment <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Payment Simulation */}
          {step === 6 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-lg">Digital Payment</h4>
              <p className="text-xs text-slate-500">Secure end-to-end simulated transaction gateway.</p>

              {/* Payment Methods */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                  { id: 'Card', label: 'Cards', icon: CreditCard },
                  { id: 'Wallet', label: 'Wallet', icon: Wallet },
                  { id: 'NetBanking', label: 'NetBank', icon: Building2 },
                ].map(m => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[11px]">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Method Fields */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                {paymentMethod === 'UPI' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">UPI ID / VPA</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                    />
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Instant verification with Google Pay, PhonePe, Paytm, or BHIM.
                    </div>
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">CVV</label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Wallet' && (
                  <div className="text-xs text-slate-700 space-y-2">
                    <p className="font-medium">Select linked wallet:</p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1.5 rounded-lg bg-white border border-blue-500 text-blue-700 font-semibold">
                        Paytm Wallet (₹1,420 balance)
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NetBanking' && (
                  <div className="text-xs text-slate-700 space-y-2">
                    <p className="font-medium">Popular Banks:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India'].map(b => (
                        <div key={b} className="p-2 text-center bg-white rounded-lg border border-slate-200 font-medium">
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {paymentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Total amount highlight */}
              <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs">
                <span className="font-medium text-slate-700">Total Charged:</span>
                <span className="text-lg font-bold font-mono text-blue-700">₹{pricing.totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  disabled={isProcessingPayment}
                  onClick={() => setStep(5)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 font-medium text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  disabled={isProcessingPayment}
                  onClick={handleProcessPayment}
                  className="flex-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-60"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming Bank Handshake...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pay ₹{pricing.totalAmount.toFixed(2)} & Reserve</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
