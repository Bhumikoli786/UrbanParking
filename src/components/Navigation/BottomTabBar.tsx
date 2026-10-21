import React from 'react';
import { Search, Zap, Calendar, Car, Shield, User } from 'lucide-react';
import { UserRole } from '../../types';

interface BottomTabBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: UserRole;
  bookingBadgeCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
  bookingBadgeCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] ${
            activeTab === 'home' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Explore</span>
        </button>

        <button
          onClick={() => onSelectTab('ev')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] ${
            activeTab === 'ev' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">EV Hub</span>
        </button>

        <button
          onClick={() => onSelectTab('bookings')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] relative ${
            activeTab === 'bookings' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-5 h-5" />
          {bookingBadgeCount > 0 && (
            <span className="absolute top-1.5 right-4 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
          <span className="text-[10px] mt-1 tracking-tight">Trips</span>
        </button>

        <button
          onClick={() => onSelectTab('garage')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] ${
            activeTab === 'garage' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Garage</span>
        </button>

        <button
          onClick={() => onSelectTab('subscription')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] ${
            activeTab === 'subscription' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Club</span>
        </button>
      </div>
    </nav>
  );
};
