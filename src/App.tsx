import React, { useState, useEffect } from 'react';
import { UserRole, ParkingFacility, Booking } from './types';
import { authService } from './services/authService';
import { parkingService } from './services/parkingService';
import { bookingService } from './services/bookingService';
import { notificationService } from './services/notificationService';
import { iotSimulationService, IoTEvent } from './services/iotSimulationService';

// Components
import { TopNavbar } from './components/Navigation/TopNavbar';
import { BottomTabBar } from './components/Navigation/BottomTabBar';
import { DriverHome } from './components/Home/DriverHome';
import { EVChargingHub } from './components/EV/EVChargingHub';
import { BookingHistoryView } from './components/Bookings/BookingHistoryView';
import { VehicleGarage } from './components/Profile/VehicleGarage';
import { PremiumSubscription } from './components/Subscription/PremiumSubscription';
import { OperatorDashboard } from './components/Operator/OperatorDashboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';

// Modals
import { FacilityDetailModal } from './components/Facility/FacilityDetailModal';
import { ReservationModal } from './components/Booking/ReservationModal';
import { DigitalParkingPass } from './components/Pass/DigitalParkingPass';
import { NavigationScreen } from './components/Navigation/NavigationScreen';
import { NotificationCenterModal } from './components/Notifications/NotificationCenterModal';
import { OnboardingModal } from './components/Onboarding/OnboardingModal';
import { StaffAuthModal } from './components/Auth/StaffAuthModal';
import { UserAuthModal } from './components/Auth/UserAuthModal';
import { Lock, LogIn, UserPlus } from 'lucide-react';

// PWA & Mobile Install Components & Hooks
import { usePWAInstall } from './hooks/usePWAInstall';
import { PWAInstallBanner } from './components/PWA/PWAInstallBanner';
import { PWAInstallModal } from './components/PWA/PWAInstallModal';
import { OfflineIndicator } from './components/PWA/OfflineIndicator';

export default function App() {
  // PWA & Mobile Installation state
  const pwa = usePWAInstall();

  // Global Role & User State
  const [currentRole, setCurrentRole] = useState<UserRole>(authService.getCurrentRole());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(notificationService.getUnreadCount());

  // Data State
  const [facilities, setFacilities] = useState<ParkingFacility[]>(parkingService.getFacilities());
  const [bookings, setBookings] = useState<Booking[]>(bookingService.getBookings());

  // Active Modals & Flow Overlays
  const [selectedFacilityForDetail, setSelectedFacilityForDetail] = useState<ParkingFacility | null>(null);
  const [reservingFacility, setReservingFacility] = useState<ParkingFacility | null>(null);
  const [viewingBookingPass, setViewingBookingPass] = useState<Booking | null>(null);
  const [navigatingFacility, setNavigatingFacility] = useState<ParkingFacility | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isStaffAuthOpen, setIsStaffAuthOpen] = useState<boolean>(false);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState<boolean>(false);
  const [userAuthMode, setUserAuthMode] = useState<'login' | 'signup'>('login');

  // Real-time IoT Event Ticker
  const [latestIotEvent, setLatestIotEvent] = useState<{ facilityName: string; slotNumber: string; newStatus: string } | null>(null);

  // Subscribe to IoT Sensor Stream
  useEffect(() => {
    const unsubscribe = iotSimulationService.subscribe((event: IoTEvent) => {
      setLatestIotEvent({
        facilityName: event.facilityName,
        slotNumber: event.slotNumber,
        newStatus: event.newStatus,
      });

      // Update facility in state
      setFacilities([...parkingService.getFacilities()]);

      // Add quiet alert to notification center if it was an occupied event
      if (event.newStatus === 'OCCUPIED') {
        notificationService.addNotification({
          userId: 'usr_driver_01',
          title: `IoT Sensor Bay Update`,
          message: `Bay ${event.slotNumber} at ${event.facilityName} was occupied.`,
          type: 'iot_alert',
        });
        setUnreadNotifCount(notificationService.getUnreadCount());
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRoleChange = (role: UserRole) => {
    authService.switchRole(role);
    setCurrentRole(role);
  };

  const refreshAllData = () => {
    setFacilities([...parkingService.getFacilities()]);
    setBookings([...bookingService.getBookings()]);
    setUnreadNotifCount(notificationService.getUnreadCount());
  };

  // Booking Flow handlers
  const handleBookingComplete = (newBooking: Booking) => {
    setReservingFacility(null);
    setViewingBookingPass(newBooking);
    refreshAllData();

    // Trigger notification
    notificationService.addNotification({
      userId: newBooking.userId,
      title: 'Booking Confirmed!',
      message: `Your spot ${newBooking.slotNumber} at ${newBooking.facilityName} is confirmed for ${newBooking.date}.`,
      type: 'booking',
    });
    setUnreadNotifCount(notificationService.getUnreadCount());
  };

  const handleCheckInBooking = (bookingId: string) => {
    bookingService.checkIn(bookingId);
    refreshAllData();
    const updated = bookingService.getBookingById(bookingId);
    if (updated) setViewingBookingPass(updated);
  };

  const handleCheckOutBooking = (bookingId: string) => {
    bookingService.checkOut(bookingId);
    refreshAllData();
    const updated = bookingService.getBookingById(bookingId);
    if (updated) setViewingBookingPass(updated);
  };

  const handleCancelBooking = (bookingId: string) => {
    bookingService.cancelBooking(bookingId);
    refreshAllData();
    setViewingBookingPass(null);
  };

  const handleStartNavigation = (facility: ParkingFacility) => {
    setSelectedFacilityForDetail(null);
    setViewingBookingPass(null);
    setNavigatingFacility(facility);
  };

  const handleArrivedAtFacility = () => {
    // Check if there is a matching confirmed booking for this facility
    const matched = bookings.find(
      b => b.facilityId === navigatingFacility?.id && b.bookingStatus === 'CONFIRMED'
    );
    if (matched) {
      bookingService.checkIn(matched.bookingId);
      refreshAllData();
    }
    setNavigatingFacility(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <TopNavbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadCount={unreadNotifCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenStaffAuth={() => setIsStaffAuthOpen(true)}
        onOpenUserAuth={mode => {
          setUserAuthMode(mode || 'login');
          setIsUserAuthOpen(true);
        }}
        onLogout={() => {
          authService.logout();
          refreshAllData();
        }}
        isPWAInstallable={pwa.isInstallable}
        isPWAInstalled={pwa.isInstalled}
        onInstallPWA={pwa.install}
        onOpenPWAGuide={() => pwa.setShowInstallGuide(true)}
      />

      {/* PWA Android & Mobile App Install Banner */}
      {currentRole === 'driver' && (
        <PWAInstallBanner
          isInstallable={pwa.isInstallable}
          isInstalled={pwa.isInstalled}
          isAndroid={pwa.isAndroid}
          isIOS={pwa.isIOS}
          onInstall={pwa.install}
          onOpenGuide={() => pwa.setShowInstallGuide(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {/* Role: OPERATOR */}
        {currentRole === 'operator' && (
          <OperatorDashboard onRefresh={refreshAllData} />
        )}

        {/* Role: ADMIN */}
        {currentRole === 'admin' && (
          <AdminDashboard onRefresh={refreshAllData} />
        )}

        {/* Role: DRIVER */}
        {currentRole === 'driver' && (
          <>
            {activeTab === 'home' && (
              <DriverHome
                facilities={facilities}
                activeBookings={bookings}
                selectedFacility={selectedFacilityForDetail}
                onSelectFacility={fac => setSelectedFacilityForDetail(fac)}
                onReserveFacility={fac => setReservingFacility(fac)}
                onNavigateToFacility={fac => handleStartNavigation(fac)}
                onViewBookingPass={b => setViewingBookingPass(b)}
                latestIotEvent={latestIotEvent}
                isPWAInstallable={pwa.isInstallable}
                isPWAInstalled={pwa.isInstalled}
                onInstallPWA={pwa.install}
                onOpenPWAGuide={() => pwa.setShowInstallGuide(true)}
              />
            )}

            {activeTab === 'ev' && (
              <EVChargingHub
                facilities={facilities}
                onSelectFacility={fac => setReservingFacility(fac)}
                onNavigate={fac => handleStartNavigation(fac)}
              />
            )}

            {activeTab === 'bookings' && (
              <BookingHistoryView
                bookings={bookings}
                facilities={facilities}
                onViewPass={b => setViewingBookingPass(b)}
                onNavigateToFacility={fac => handleStartNavigation(fac)}
                onRebook={fac => setReservingFacility(fac)}
                onRefresh={refreshAllData}
              />
            )}

            {activeTab === 'garage' && (
              <VehicleGarage
                onRefresh={refreshAllData}
                onSelectLocationForSearch={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'subscription' && (
              <PremiumSubscription onRefresh={refreshAllData} />
            )}
          </>
        )}
      </main>

      {/* Clean Corporate Footer (Driver mode) */}
      {currentRole === 'driver' && (
        <footer className="border-t border-slate-200 bg-white/80 py-6 px-4 sm:px-6 text-slate-500 text-xs hidden sm:block">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-700">UrbanPark Solutions Pvt. Ltd.</span>
              <span className="mx-2">·</span>
              <span>Find. Park. Go.</span>
              <span className="mx-2">·</span>
              <span>Smart Mobility & Real-Time Parking Grid</span>
            </div>

            {/* Subtle Staff / Enterprise Portal Entry */}
            <div className="flex items-center gap-4 text-slate-500">
              {!authService.isAuthenticated() && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setUserAuthMode('login');
                      setIsUserAuthOpen(true);
                    }}
                    className="hover:text-slate-900 transition-colors flex items-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-400" />
                    <span>Driver Sign In</span>
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => {
                      setUserAuthMode('signup');
                      setIsUserAuthOpen(true);
                    }}
                    className="hover:text-blue-600 transition-colors flex items-center gap-1 text-slate-600 font-medium"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                    <span>Register</span>
                  </button>
                  <span className="text-slate-300">|</span>
                </div>
              )}

              <button
                onClick={() => setIsStaffAuthOpen(true)}
                className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
                title="Restricted access for parking facility managers and administrators"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Facility Operator & Admin Portal</span>
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Mobile Ergonomic Bottom Tab Bar (Driver Mode) */}
      {currentRole === 'driver' && (
        <BottomTabBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentRole={currentRole}
          bookingBadgeCount={bookings.filter(b => b.bookingStatus === 'ACTIVE').length}
        />
      )}

      {/* MODAL 1: Facility Detail Modal */}
      {selectedFacilityForDetail && (
        <FacilityDetailModal
          facility={selectedFacilityForDetail}
          onClose={() => setSelectedFacilityForDetail(null)}
          onReserve={fac => {
            setSelectedFacilityForDetail(null);
            setReservingFacility(fac);
          }}
          onNavigate={fac => handleStartNavigation(fac)}
        />
      )}

      {/* MODAL 2: Reservation Multi-Step Modal */}
      {reservingFacility && (
        <ReservationModal
          facility={reservingFacility}
          onClose={() => setReservingFacility(null)}
          onBookingComplete={handleBookingComplete}
        />
      )}

      {/* MODAL 3: Digital Parking Pass & Tax Invoice Modal */}
      {viewingBookingPass && (
        <DigitalParkingPass
          booking={viewingBookingPass}
          onClose={() => setViewingBookingPass(null)}
          onCheckIn={handleCheckInBooking}
          onCheckOut={handleCheckOutBooking}
          onCancel={handleCancelBooking}
          onNavigate={() => {
            const fac = facilities.find(f => f.id === viewingBookingPass.facilityId);
            if (fac) handleStartNavigation(fac);
          }}
        />
      )}

      {/* MODAL 4: Full Screen Turn-By-Turn Navigation Simulation */}
      {navigatingFacility && (
        <NavigationScreen
          facility={navigatingFacility}
          activeBooking={bookings.find(
            b => b.facilityId === navigatingFacility.id && (b.bookingStatus === 'ACTIVE' || b.bookingStatus === 'CONFIRMED')
          )}
          onArrived={handleArrivedAtFacility}
          onExitNavigation={() => setNavigatingFacility(null)}
        />
      )}

      {/* MODAL 5: Notification Center */}
      {isNotificationOpen && (
        <NotificationCenterModal
          onClose={() => setIsNotificationOpen(false)}
          onRefresh={refreshAllData}
        />
      )}

      {/* MODAL 6: Onboarding Tour Walkthrough */}
      {isOnboardingOpen && (
        <OnboardingModal onClose={() => setIsOnboardingOpen(false)} />
      )}

      {/* MODAL 7: Enterprise Staff & Partner Authentication Portal */}
      {isStaffAuthOpen && (
        <StaffAuthModal
          onClose={() => setIsStaffAuthOpen(false)}
          onSuccess={role => {
            handleRoleChange(role);
            refreshAllData();
          }}
        />
      )}

      {/* MODAL 8: Driver Customer Authentication (Login, Signup, OTP) */}
      {isUserAuthOpen && (
        <UserAuthModal
          initialMode={userAuthMode}
          onClose={() => setIsUserAuthOpen(false)}
          onSuccess={_user => {
            refreshAllData();
          }}
        />
      )}

      {/* MODAL 9: Mobile App Installation Guide & 1-Click Trigger */}
      <PWAInstallModal
        isOpen={pwa.showInstallGuide}
        onClose={() => pwa.setShowInstallGuide(false)}
        onInstall={pwa.install}
        isInstallable={pwa.isInstallable}
        isInstalled={pwa.isInstalled}
        isIOS={pwa.isIOS}
        isAndroid={pwa.isAndroid}
      />

      {/* Real-Time Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}
