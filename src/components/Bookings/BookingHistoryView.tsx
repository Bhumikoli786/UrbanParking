import React, { useState, useMemo } from 'react';
import { Booking, ParkingFacility } from '../../types';
import { bookingService } from '../../services/bookingService';
import { parkingService } from '../../services/parkingService';
import { 
  Calendar, Clock, MapPin, Car, Star, QrCode, Navigation, 
  RotateCcw, CheckCircle2, AlertCircle, FileText, ChevronRight, TrendingUp, IndianRupee 
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface BookingHistoryViewProps {
  bookings: Booking[];
  facilities: ParkingFacility[];
  onViewPass: (booking: Booking) => void;
  onNavigateToFacility: (facility: ParkingFacility) => void;
  onRebook: (facility: ParkingFacility) => void;
  onRefresh: () => void;
}

export const BookingHistoryView: React.FC<BookingHistoryViewProps> = ({
  bookings,
  facilities,
  onViewPass,
  onNavigateToFacility,
  onRebook,
  onRefresh,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'ACTIVE' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('all');
  const [ratingModalBooking, setRatingModalBooking] = useState<Booking | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewTags, setReviewTags] = useState<string[]>(['Smooth Entry', 'Clean Bay']);
  const [chartMetric, setChartMetric] = useState<'both' | 'spend' | 'duration'>('both');

  // Compute Weekly Trend Analytics for Line Chart
  const weeklyAnalytics = useMemo(() => {
    // Days of the week baseline
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Default baseline curve with realistic mobility usage
    const dataMap: Record<string, { day: string; expenditure: number; durationHours: number; trips: number }> = {
      Mon: { day: 'Mon', expenditure: 160, durationHours: 2, trips: 1 },
      Tue: { day: 'Tue', expenditure: 0, durationHours: 0, trips: 0 },
      Wed: { day: 'Wed', expenditure: 240, durationHours: 3, trips: 1 },
      Thu: { day: 'Thu', expenditure: 80, durationHours: 1, trips: 1 },
      Fri: { day: 'Fri', expenditure: 320, durationHours: 4, trips: 1 },
      Sat: { day: 'Sat', expenditure: 377.6, durationHours: 3, trips: 1 },
      Sun: { day: 'Sun', expenditure: 357.6, durationHours: 4, trips: 1 },
    };

    // If there are user bookings, incorporate their values
    bookings.forEach((b, idx) => {
      const dayKey = days[(idx * 2 + 1) % days.length];
      if (dataMap[dayKey]) {
        dataMap[dayKey].expenditure = Math.round((dataMap[dayKey].expenditure + b.totalAmount) / 2);
        dataMap[dayKey].durationHours = Math.round(((dataMap[dayKey].durationHours + b.durationHours) / 2) * 10) / 10;
        dataMap[dayKey].trips += 1;
      }
    });

    const trendList = days.map(d => dataMap[d]);
    const totalWeeklySpend = trendList.reduce((acc, curr) => acc + curr.expenditure, 0);
    const totalWeeklyHours = trendList.reduce((acc, curr) => acc + curr.durationHours, 0);
    const totalTrips = trendList.reduce((acc, curr) => acc + curr.trips, 0);

    return {
      trendList,
      totalWeeklySpend,
      totalWeeklyHours,
      totalTrips,
    };
  }, [bookings]);

  const filteredBookings = bookings.filter(b => {
    if (filterStatus === 'all') return true;
    return b.bookingStatus === filterStatus;
  });

  const handleRateSubmit = () => {
    if (!ratingModalBooking) return;
    bookingService.rateBooking(ratingModalBooking.bookingId, selectedRating, reviewComment);
    parkingService.addReview({
      bookingId: ratingModalBooking.bookingId,
      facilityId: ratingModalBooking.facilityId,
      userId: ratingModalBooking.userId,
      userName: 'Aarav Sharma',
      rating: selectedRating,
      tags: reviewTags,
      comment: reviewComment || 'Great parking experience, boom barrier opened instantly.',
    });
    setRatingModalBooking(null);
    setReviewComment('');
    onRefresh();
  };

  const getStatusBadge = (status: Booking['bookingStatus']) => {
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
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            My Parking Bookings
          </h2>
          <p className="text-xs text-slate-500">
            Active reservations, digital QR tickets, and historical trip receipts.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {(['all', 'ACTIVE', 'CONFIRMED', 'COMPLETED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'all' ? 'All Trips' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* RECHARTS WEEKLY TRENDS & EXPENDITURE LINE CHART */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Weekly Parking Expenditure & Usage Trends
              </h3>
              <p className="text-xs text-slate-500">
                Tracking daily spending (₹) alongside total parking duration (hours)
              </p>
            </div>
          </div>

          {/* Metric View Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setChartMetric('both')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                chartMetric === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Both Trends
            </button>
            <button
              onClick={() => setChartMetric('spend')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                chartMetric === 'spend' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Spend (₹)
            </button>
            <button
              onClick={() => setChartMetric('duration')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                chartMetric === 'duration' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Duration (Hrs)
            </button>
          </div>
        </div>

        {/* Quick KPI Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
            <div className="text-[11px] font-medium text-slate-500">Weekly Total Spend</div>
            <div className="text-lg font-bold font-mono text-blue-700 mt-0.5">
              ₹{weeklyAnalytics.totalWeeklySpend.toFixed(0)}
            </div>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <div className="text-[11px] font-medium text-slate-500">Total Parking Duration</div>
            <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
              {weeklyAnalytics.totalWeeklyHours} Hours
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500">Completed Trips</div>
            <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">
              {weeklyAnalytics.totalTrips} Trips
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500">Avg. Tariff / Hour</div>
            <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">
              ₹{weeklyAnalytics.totalWeeklyHours > 0 ? (weeklyAnalytics.totalWeeklySpend / weeklyAnalytics.totalWeeklyHours).toFixed(0) : 0}/h
            </div>
          </div>
        </div>

        {/* Recharts Interactive Line Chart */}
        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weeklyAnalytics.trendList}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              {(chartMetric === 'both' || chartMetric === 'spend') && (
                <YAxis
                  yAxisId="left"
                  stroke="#2563eb"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
              )}
              {(chartMetric === 'both' || chartMetric === 'duration') && (
                <YAxis
                  yAxisId="right"
                  orientation={chartMetric === 'duration' ? 'left' : 'right'}
                  stroke="#10b981"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}h`}
                />
              )}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-800 space-y-1">
                        <div className="font-bold text-slate-300">{label} Summary</div>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between gap-4 font-mono">
                            <span style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="font-bold">
                              {entry.dataKey === 'expenditure' ? `₹${entry.value}` : `${entry.value}h`}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              {(chartMetric === 'both' || chartMetric === 'spend') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="expenditure"
                  name="Expenditure (₹)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
                />
              )}
              {(chartMetric === 'both' || chartMetric === 'duration') && (
                <Line
                  yAxisId={chartMetric === 'duration' ? 'right' : 'right'}
                  type="monotone"
                  dataKey="durationHours"
                  name="Duration (Hours)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No bookings in this category</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Reserve parking spaces at smart facilities across the city and they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const fac = facilities.find(f => f.id === booking.facilityId);

            return (
              <div
                key={booking.bookingId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm font-mono shrink-0">
                      {booking.slotNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(booking.bookingStatus)}`}>
                          {booking.bookingStatus}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {booking.bookingId}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 line-clamp-1">
                        {booking.facilityName}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="line-clamp-1">{booking.facilityAddress}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold font-mono text-slate-900">
                      ₹{booking.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Paid via {booking.paymentMethod}
                    </div>
                  </div>
                </div>

                {/* Details Bar */}
                <div className="py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 font-medium block">Schedule</span>
                    <span className="font-semibold text-slate-800">{booking.date} · {booking.startTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Floor & Bay</span>
                    <span className="font-semibold font-mono text-blue-700">{booking.floor} ({booking.slotNumber})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Vehicle</span>
                    <span className="font-semibold text-slate-800 font-mono">{booking.vehicleNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Duration</span>
                    <span className="font-semibold text-slate-800">{booking.durationHours} Hours</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewPass(booking)}
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Digital Pass</span>
                    </button>

                    {booking.bookingStatus === 'CONFIRMED' && fac && (
                      <button
                        onClick={() => onNavigateToFacility(fac)}
                        className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.bookingStatus === 'COMPLETED' && (
                      <>
                        {!booking.ratingGiven ? (
                          <button
                            onClick={() => setRatingModalBooking(booking)}
                            className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs flex items-center gap-1 transition-colors"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Rate Trip</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Rated {booking.ratingGiven}★</span>
                          </span>
                        )}

                        {fac && (
                          <button
                            onClick={() => onRebook(fac)}
                            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Rebook</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating & Review Modal */}
      {ratingModalBooking && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-200">
            <h4 className="font-bold text-lg mb-1">Rate Your Parking Experience</h4>
            <p className="text-xs text-slate-500 mb-4">{ratingModalBooking.facilityName}</p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= selectedRating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Quick tags */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 block mb-2">What went well?</label>
              <div className="flex flex-wrap gap-1.5">
                {['Smooth Entry', 'Clean Bay', 'Fast Charger', 'Safe & Secure', 'Valet Service'].map(tag => {
                  const isSelected = reviewTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        setReviewTags(prev =>
                          isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review comment */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Add feedback (optional)</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Share details about barrier gates, cleanliness, lighting, or staff..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setRatingModalBooking(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRateSubmit}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
