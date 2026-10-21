import React, { useState, useRef, useEffect } from 'react';
import { UserRole, UserProfile } from '../../types';
import { 
  Bell, Shield, User, Car, Zap, Sparkles, LogOut, Lock, 
  ChevronDown, UserCheck, Calendar, Bookmark, Crown, LogIn, Smartphone 
} from 'lucide-react';
import { authService } from '../../services/authService';
import { PWAInstallButton } from '../PWA/PWAInstallButton';

interface TopNavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenOnboarding: () => void;
  onOpenStaffAuth: () => void;
  onOpenUserAuth: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  isPWAInstallable?: boolean;
  isPWAInstalled?: boolean;
  onInstallPWA?: () => Promise<boolean>;
  onOpenPWAGuide?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onSelectTab,
  unreadCount,
  onOpenNotifications,
  onOpenOnboarding,
  onOpenStaffAuth,
  onOpenUserAuth,
  onLogout,
  isPWAInstallable = false,
  isPWAInstalled = false,
  onInstallPWA = async () => false,
  onOpenPWAGuide = () => {},
}) => {
  const currentUser: UserProfile | null = authService.getCurrentUser();
  const isStaff = currentRole === 'operator' || currentRole === 'admin';
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Elevated Staff Session Bar (ONLY visible when authenticated as Operator or Admin) */}
      {isStaff && currentUser && (
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-2 text-xs flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-slate-300">
              {currentRole === 'operator' ? 'Commercial Parking Operator Session' : 'UrbanPark Platform Administrator Session'}
            </span>
            <span className="text-slate-400 hidden sm:inline">({currentUser.name})</span>
          </div>

          <button
            onClick={() => onRoleChange('driver')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Staff Mode (Return to Driver App)</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              onSelectTab('home');
            }}
            className="flex items-center gap-2 group"
          >
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm tracking-tight shadow-xs group-hover:bg-blue-700 transition-colors">
              UP
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              UrbanPark
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Links (Customer view vs Staff Console) */}
        {!isStaff ? (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('home')}
              className={`hover:text-slate-900 transition-colors ${
                activeTab === 'home' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Find Parking
            </button>
            <button
              onClick={() => onSelectTab('ev')}
              className={`hover:text-slate-900 transition-colors ${
                activeTab === 'ev' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              EV Fast Hub
            </button>
            <button
              onClick={() => onSelectTab('bookings')}
              className={`hover:text-slate-900 transition-colors ${
                activeTab === 'bookings' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => onSelectTab('garage')}
              className={`hover:text-slate-900 transition-colors ${
                activeTab === 'garage' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Garage & Places
            </button>
            <button
              onClick={() => onSelectTab('subscription')}
              className={`hover:text-slate-900 transition-colors ${
                activeTab === 'subscription' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              UrbanPark Pass
            </button>
            <button
              onClick={onOpenOnboarding}
              className="hover:text-slate-900 transition-colors text-slate-400 text-xs"
            >
              Tour
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800">
              {currentRole === 'operator' ? 'Facility Manager Console' : 'HQ Global Console'}
            </span>
          </div>
        )}

        {/* Zone 3: 1–2 Primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button (For all users / mobile devices) */}
          {!isStaff && (
            <PWAInstallButton
              isInstallable={isPWAInstallable}
              isInstalled={isPWAInstalled}
              onInstall={onInstallPWA}
              onOpenGuide={onOpenPWAGuide}
              className="hidden sm:inline-flex"
            />
          )}

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-700 hover:text-slate-950 transition-colors"
            title="Open Notifications"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Logged In: Profile Menu Dropdown */}
          {!isStaff && currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 cursor-pointer transition-colors text-left"
                aria-expanded={isUserMenuOpen}
              >
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {getInitials(currentUser.name)}
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold text-slate-900 leading-none line-clamp-1 max-w-[100px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-amber-600 font-mono font-bold mt-0.5">
                    ★ {currentUser.loyaltyPoints} pts
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                    <div className="text-xs text-slate-500 font-mono truncate">{currentUser.email}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{currentUser.phone}</div>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{currentUser.loyaltyPoints} ParkPoints Balance</span>
                    </div>
                  </div>

                  <div className="py-1 text-xs text-slate-700">
                    <button
                      onClick={() => {
                        onSelectTab('bookings');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>My Bookings & Tickets</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectTab('garage');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Car className="w-4 h-4 text-slate-400" />
                      <span>My Vehicle Garage</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectTab('subscription');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Crown className="w-4 h-4 text-slate-400" />
                      <span>UrbanPark Club Membership</span>
                    </button>
                    {!isPWAInstalled && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (isPWAInstallable) {
                            onInstallPWA();
                          } else {
                            onOpenPWAGuide();
                          }
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 text-blue-700 font-semibold flex items-center gap-2"
                      >
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        <span>Download Phone App</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !isStaff ? (
            /* User NOT Logged In: Sign In & Sign Up buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenUserAuth('login')}
                className="py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => onOpenUserAuth('signup')}
                className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Sign Up
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
