import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { authService } from '../../services/authService';
import { DEMO_USERS } from '../../data/mockData';
import { Crown, Sparkles, Check, Zap, Shield, Gift, ArrowRight } from 'lucide-react';

interface PremiumSubscriptionProps {
  onRefresh: () => void;
}

export const PremiumSubscription: React.FC<PremiumSubscriptionProps> = ({ onRefresh }) => {
  const [user, setUser] = useState<UserProfile>(authService.getCurrentUser() || DEMO_USERS.driver);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpgrade = (plan: 'pro' | 'elite') => {
    setUpgradingPlan(plan);
    setTimeout(() => {
      authService.upgradeToPremium(plan);
      setUser(authService.getCurrentUser() || DEMO_USERS.driver);
      setUpgradingPlan(null);
      setSuccessMessage(`Congratulations! You are now an UrbanPark ${plan.toUpperCase()} member.`);
      onRefresh();
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Loyalty Points Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Gift className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-amber-100">
              UrbanPark Loyalty Rewards
            </div>
            <div className="text-2xl font-extrabold font-mono tabular-nums">
              {user.loyaltyPoints} ParkPoints
            </div>
            <div className="text-xs text-amber-100 mt-0.5">
              Redeemable for ₹{(user.loyaltyPoints * 0.5).toFixed(0)} off any smart parking reservation.
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            alert(`Applied ₹${(user.loyaltyPoints * 0.5).toFixed(0)} credit voucher to your active wallet balance!`);
          }}
          className="py-2.5 px-4 rounded-xl bg-white text-amber-900 font-bold text-xs hover:bg-amber-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          Redeem for Parking Credits
        </button>
      </div>

      {/* Subscription Plans */}
      <div className="text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <Crown className="w-3.5 h-3.5" /> UrbanPark Club
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          Elevate Your Daily Urban Commute
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Guaranteed bays during peak rush hours, valet fast-track passes, and special EV charging rates.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 text-center">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FREE PLAN */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h4 className="font-bold text-lg text-slate-900">Standard Free</h4>
            <p className="text-xs text-slate-500 mt-1">Essential smart parking for occasional city drivers.</p>
            <div className="text-3xl font-extrabold text-slate-900 my-4 font-mono">
              ₹0 <span className="text-xs text-slate-400 font-normal">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Real-time parking availability</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Digital ticket & QR check-in</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Up to 2 registered vehicles</span>
              </li>
            </ul>
          </div>

          <div className="py-2.5 text-center text-xs font-semibold text-slate-500 bg-slate-50 rounded-xl">
            {user.premiumPlan === 'free' || !user.isPremium ? 'Current Plan' : 'Free Tier'}
          </div>
        </div>

        {/* PRO COMMUTER PLAN */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl relative border border-blue-500">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
            Most Popular
          </div>

          <div>
            <h4 className="font-bold text-lg text-white">UrbanPark Pro</h4>
            <p className="text-xs text-slate-400 mt-1">For daily city commuters & office parkers.</p>
            <div className="text-3xl font-extrabold text-white my-4 font-mono">
              ₹299 <span className="text-xs text-slate-400 font-normal">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Priority Bay reservations during rush hour</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Zero convenience fees on all bookings</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>10% discount on DC Fast EV charging</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>2x Loyalty ParkPoints per trip</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade('pro')}
            disabled={user.premiumPlan === 'pro'}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md disabled:opacity-60"
          >
            {user.premiumPlan === 'pro' ? 'Active Membership' : upgradingPlan === 'pro' ? 'Activating...' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* ELITE MOBILITY PASS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h4 className="font-bold text-lg text-slate-900">Elite Corporate</h4>
            <p className="text-xs text-slate-500 mt-1">Multi-city priority parking & airport valet pass.</p>
            <div className="text-3xl font-extrabold text-slate-900 my-4 font-mono">
              ₹699 <span className="text-xs text-slate-400 font-normal">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All Pro benefits included</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Complimentary Airport Valet Service</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited registered garage vehicles</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>VIP dedicated customer hotline</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade('elite')}
            disabled={user.premiumPlan === 'elite'}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors disabled:opacity-60"
          >
            {user.premiumPlan === 'elite' ? 'Active Membership' : upgradingPlan === 'elite' ? 'Activating...' : 'Upgrade to Elite'}
          </button>
        </div>
      </div>
    </div>
  );
};
