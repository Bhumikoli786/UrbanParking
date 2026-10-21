import React, { useState } from 'react';
import { Booking } from '../../types';
import { ShieldCheck, Download, Share2, MapPin, Calendar, Clock, Car, QrCode, ArrowLeft, Printer, CheckCircle2, AlertCircle } from 'lucide-react';

interface DigitalParkingPassProps {
  booking: Booking;
  onClose: () => void;
  onCheckIn?: (bookingId: string) => void;
  onCheckOut?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onNavigate?: () => void;
}

export const DigitalParkingPass: React.FC<DigitalParkingPassProps> = ({
  booking,
  onClose,
  onCheckIn,
  onCheckOut,
  onCancel,
  onNavigate,
}) => {
  const [showInvoice, setShowInvoice] = useState(false);

  const getStatusColor = (status: Booking['bookingStatus']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Pass Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                UP
              </span>
              <div>
                <h3 className="font-bold text-base tracking-tight leading-none">UrbanPark</h3>
                <span className="text-[10px] text-slate-400 font-medium">Smart Parking Pass</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium">Booking ID</div>
              <div className="text-xl font-mono font-bold tracking-wider text-blue-400">
                {booking.bookingId}
              </div>
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusColor(booking.bookingStatus)}`}>
              {booking.bookingStatus}
            </div>
          </div>
        </div>

        {/* Perforated Divider Visual */}
        <div className="relative h-6 bg-slate-100 flex items-center justify-between px-2">
          <div className="w-5 h-5 rounded-full bg-black/60 -ml-4" />
          <div className="flex-1 border-b-2 border-dashed border-slate-300 mx-2" />
          <div className="w-5 h-5 rounded-full bg-black/60 -mr-4" />
        </div>

        {/* Pass Body Content */}
        <div className="p-6 bg-white space-y-6">
          {/* Facility Info */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 line-clamp-1">{booking.facilityName}</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{booking.facilityAddress}</span>
            </div>
          </div>

          {/* Slot Bay Badge */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
            <div>
              <div className="text-xs text-slate-500 font-medium">Assigned Slot</div>
              <div className="text-2xl font-bold font-mono text-blue-900">{booking.slotNumber}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Floor Level</div>
              <div className="text-2xl font-bold text-slate-800">{booking.floor}</div>
            </div>
          </div>

          {/* Timing & Vehicle Details */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
            <div>
              <div className="text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </div>
              <div className="font-semibold text-slate-800 mt-0.5">{booking.date}</div>
            </div>

            <div>
              <div className="text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Duration
              </div>
              <div className="font-semibold text-slate-800 mt-0.5">
                {booking.startTime} – {booking.endTime} ({booking.durationHours}h)
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-medium flex items-center gap-1">
                <Car className="w-3 h-3" /> Vehicle Reg.
              </div>
              <div className="font-mono font-semibold text-slate-800 mt-0.5">{booking.vehicleNumber}</div>
            </div>

            <div>
              <div className="text-slate-400 font-medium">Amount Paid</div>
              <div className="font-mono font-bold text-emerald-600 mt-0.5 text-sm">
                ₹{booking.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Simulated QR Code */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 mb-2">
              {/* Crisp SVG QR code representation */}
              <svg width="128" height="128" viewBox="0 0 128 128" className="text-slate-900">
                <rect width="128" height="128" fill="#ffffff" />
                {/* Outer corners */}
                <rect x="12" y="12" width="32" height="32" fill="#0f172a" rx="4" />
                <rect x="18" y="18" width="20" height="20" fill="#ffffff" rx="2" />
                <rect x="23" y="23" width="10" height="10" fill="#0f172a" />

                <rect x="84" y="12" width="32" height="32" fill="#0f172a" rx="4" />
                <rect x="90" y="18" width="20" height="20" fill="#ffffff" rx="2" />
                <rect x="95" y="23" width="10" height="10" fill="#0f172a" />

                <rect x="12" y="84" width="32" height="32" fill="#0f172a" rx="4" />
                <rect x="18" y="90" width="20" height="20" fill="#ffffff" rx="2" />
                <rect x="23" y="95" width="10" height="10" fill="#0f172a" />

                {/* Random matrix modules */}
                <rect x="52" y="16" width="6" height="6" fill="#0f172a" />
                <rect x="64" y="24" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="36" width="12" height="6" fill="#0f172a" />
                <rect x="20" y="52" width="6" height="12" fill="#0f172a" />
                <rect x="36" y="60" width="14" height="6" fill="#0f172a" />
                <rect x="58" y="58" width="12" height="12" fill="#2563eb" rx="2" />
                <rect x="80" y="52" width="8" height="8" fill="#0f172a" />
                <rect x="100" y="64" width="10" height="6" fill="#0f172a" />
                <rect x="52" y="84" width="8" height="16" fill="#0f172a" />
                <rect x="72" y="92" width="18" height="6" fill="#0f172a" />
                <rect x="100" y="88" width="10" height="10" fill="#0f172a" />
              </svg>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Scan at the entry barrier or present to on-site operator for automated access.
            </p>
          </div>

          {/* Interactive Simulation Action Buttons */}
          <div className="space-y-2 pt-2">
            {booking.bookingStatus === 'CONFIRMED' && (
              <div className="flex gap-2">
                {onNavigate && (
                  <button
                    onClick={onNavigate}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
                  >
                    <MapPin className="w-4 h-4" /> Start Navigation
                  </button>
                )}
                {onCheckIn && (
                  <button
                    onClick={() => onCheckIn(booking.bookingId)}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Check In (Arrived)
                  </button>
                )}
              </div>
            )}

            {booking.bookingStatus === 'ACTIVE' && onCheckOut && (
              <button
                onClick={() => onCheckOut(booking.bookingId)}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                Check Out & Release Bay
              </button>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                onClick={() => setShowInvoice(true)}
                className="text-slate-600 hover:text-slate-900 font-medium underline flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> View Digital Tax Invoice
              </button>

              {booking.bookingStatus === 'CONFIRMED' && onCancel && (
                <button
                  onClick={() => onCancel(booking.bookingId)}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Digital Tax Invoice Modal */}
      {showInvoice && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h4 className="font-bold text-lg">TAX INVOICE</h4>
                <div className="text-xs text-slate-500">UrbanPark Solutions Pvt. Ltd.</div>
                <div className="text-[10px] text-slate-400">GSTIN: 27AABCU9920K1ZX</div>
              </div>
              <button
                onClick={() => setShowInvoice(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice No:</span>
                <span className="font-mono font-medium">INV-{booking.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Facility:</span>
                <span className="font-medium text-right max-w-[200px] truncate">{booking.facilityName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-mono font-medium">{booking.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-medium">{booking.durationHours} hours</span>
              </div>

              <div className="border-t border-slate-200 pt-2 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Parking Rate ({booking.durationHours}h @ ₹{booking.baseRate}/h):</span>
                  <span>₹{booking.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Convenience Fee:</span>
                  <span>₹{booking.convenienceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%):</span>
                  <span>₹{booking.taxAmount.toFixed(2)}</span>
                </div>
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({booking.promoCodeApplied}):</span>
                    <span>-₹{booking.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono">₹{booking.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-500">
                Paid via {booking.paymentMethod} · Ref: <span className="font-mono">{booking.paymentTransactionId}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-medium text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
              <button
                onClick={() => setShowInvoice(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
