import React, { useState } from 'react';
import { ParkingFacility, Promotion } from '../../types';
import { parkingService } from '../../services/parkingService';
import { promotionService } from '../../services/promotionService';
import { 
  Building2, Users, ShieldCheck, TrendingUp, AlertTriangle, 
  CheckCircle2, Plus, Tag, Trash2, DollarSign, Award, Target, Check, X 
} from 'lucide-react';

interface AdminDashboardProps {
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onRefresh }) => {
  const [facilities, setFacilities] = useState<ParkingFacility[]>(parkingService.getFacilities());
  const [promotions, setPromotions] = useState<Promotion[]>(promotionService.getPromotions());

  // New Promo form modal
  const [isAddPromoOpen, setIsAddPromoOpen] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newDiscountPct, setNewDiscountPct] = useState(20);
  const [newMaxDiscount, setNewMaxDiscount] = useState(100);

  const handleApproveFacility = (id: string) => {
    parkingService.approveFacility(id);
    setFacilities([...parkingService.getFacilities()]);
    onRefresh();
  };

  const handleTogglePromo = (id: string) => {
    promotionService.togglePromo(id);
    setPromotions([...promotionService.getPromotions()]);
    onRefresh();
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    promotionService.addPromo({
      code: newPromoCode.trim().toUpperCase(),
      title: newPromoTitle.trim() || `${newDiscountPct}% Discount`,
      description: `Special promotion created by UrbanPark Admin.`,
      discountPercentage: Number(newDiscountPct),
      maxDiscount: Number(newMaxDiscount),
      minBookingHours: 2,
      validUntil: '31 Dec 2026',
      isActive: true,
    });

    setPromotions([...promotionService.getPromotions()]);
    setIsAddPromoOpen(false);
    setNewPromoCode('');
    setNewPromoTitle('');
    onRefresh();
  };

  const pendingFacilities = facilities.filter(f => !f.approved);

  return (
    <div className="space-y-8">
      {/* Admin Title Header */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>UrbanPark Platform Admin</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              UrbanPark Solutions Command HQ
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Startup performance metrics against annual commercial targets, partner approvals, and monetization streams.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Platform Status: Healthy (99.98% SLA)</span>
          </div>
        </div>
      </div>

      {/* Startup Target Milestones & KPIs Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-base text-slate-900">
            Startup Milestone Tracker (FY 2026 Targets)
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Registered Users</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1 tabular-nums">5,240</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">104% of 5,000 target</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Partner Lots</div>
            <div className="text-2xl font-extrabold text-blue-600 font-mono mt-1 tabular-nums">152</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">Surpassed 150 milestone</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Search Time Reduced</div>
            <div className="text-2xl font-extrabold text-purple-600 font-mono mt-1 tabular-nums">-62%</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">Exceeds 60% goal</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Annual Revenue</div>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1 tabular-nums">₹9.84 L</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">In ₹8–10 Lakh band</div>
          </div>
        </div>
      </div>

      {/* Facility Approval Queue */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              Commercial Facility Onboarding Approvals
            </h3>
            <p className="text-xs text-slate-500">
              Review and authorize operator parking complexes to go live on the driver map.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {pendingFacilities.length} Pending
          </span>
        </div>

        {pendingFacilities.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
            All submitted operator facilities are currently verified and active on the network.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingFacilities.map(fac => (
              <div
                key={fac.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{fac.name}</h4>
                  <p className="text-xs text-slate-500">{fac.address}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1 font-mono">
                    <span>{fac.totalSlots} Bays</span>
                    <span>·</span>
                    <span>₹{fac.pricePerHour}/h</span>
                    <span>·</span>
                    <span>Operator: {fac.operatorName}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleApproveFacility(fac.id)}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" /> Approve & Publish
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Promotions & Offers Management */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              Marketing Promotions & Campaign Discounts
            </h3>
            <p className="text-xs text-slate-500">
              Create and toggle user promo coupon codes applied at checkout.
            </p>
          </div>
          <button
            onClick={() => setIsAddPromoOpen(true)}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Promo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {promotions.map(promo => (
            <div
              key={promo.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                promo.isActive
                  ? 'border-blue-200 bg-blue-50/30'
                  : 'border-slate-200 bg-slate-50/50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-sm text-blue-700 bg-blue-100 px-2 py-0.5 rounded-lg">
                    {promo.code}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    promo.isActive ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    {promo.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900">{promo.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1">{promo.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-600">
                  Max ₹{promo.maxDiscount} off
                </span>
                <button
                  onClick={() => handleTogglePromo(promo.id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  {promo.isActive ? 'Deactivate' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Alerts & Sensor Health Feed */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-lg text-slate-900">
          Real-time System Health & City Sensor Logs
        </h3>
        <div className="space-y-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-700">ANPR OCR Gate Camera Service (Mumbai Metro Cluster)</span>
            <span className="text-emerald-600 font-bold">OPERATIONAL · 12ms</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-700">IoT Sensor Mesh Gateway (MQTT Broker)</span>
            <span className="text-emerald-600 font-bold">CONNECTED · 1,480 NODES</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-700">Unified Payment Gateway Handshake (UPI / NPCI)</span>
            <span className="text-emerald-600 font-bold">SUCCESS RATE 99.4%</span>
          </div>
        </div>
      </div>

      {/* Add Promo Modal */}
      {isAddPromoOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreatePromo} className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-bold text-lg">Create New Promotion</h4>
              <button type="button" onClick={() => setIsAddPromoOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MONSOON25"
                  value={newPromoCode}
                  onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Promotion Title</label>
                <input
                  type="text"
                  placeholder="e.g. 25% Monsoon Parking Cashback"
                  value={newPromoTitle}
                  onChange={e => setNewPromoTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Discount %</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={newDiscountPct}
                    onChange={e => setNewDiscountPct(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    min="20"
                    max="500"
                    value={newMaxDiscount}
                    onChange={e => setNewMaxDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsAddPromoOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
              >
                Create Promo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
