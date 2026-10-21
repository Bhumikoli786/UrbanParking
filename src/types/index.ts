export type UserRole = 'driver' | 'operator' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isPremium?: boolean;
  premiumPlan?: 'free' | 'pro' | 'elite';
  loyaltyPoints: number;
  homeAddress?: string;
  workAddress?: string;
}

export type VehicleType = 'car' | 'suv' | 'motorcycle' | 'ev' | 'other';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'cng' | 'hybrid';

export interface Vehicle {
  id: string;
  userId: string;
  nickname: string;
  vehicleNumber: string;
  type: VehicleType;
  makeModel: string;
  fuelType: FuelType;
  isDefault: boolean;
}

export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
export type SlotType = 'standard' | 'compact' | 'suv' | 'ev' | 'handicap' | 'two_wheeler';

export interface ParkingSlot {
  id: string;
  facilityId: string;
  slotNumber: string; // e.g. "A-12", "EV-04"
  floor: string; // "Ground", "Floor 1", "Basement 1"
  type: SlotType;
  status: SlotStatus;
  currentVehicleNumber?: string;
  sensorId?: string;
  lastUpdated: string;
}

export type FacilityStatus = 'AVAILABLE' | 'LIMITED' | 'FULL' | 'CLOSED';
export type FacilityCategory = 'mall' | 'airport' | 'hospital' | 'railway' | 'office' | 'commercial' | 'market';

export interface EVCharger {
  id: string;
  chargerType: 'DC Fast Charging (CCS2)' | 'AC Type 2' | 'GB/T Fast' | 'Tesla Supercharger Compatible';
  powerKw: number;
  availableUnits: number;
  totalUnits: number;
  pricePerKwh: number;
  estimatedFullChargeMinutes: number;
  status: 'available' | 'busy' | 'offline';
}

export interface ParkingFacility {
  id: string;
  name: string;
  tagline?: string;
  category: FacilityCategory;
  address: string;
  city: string;
  landmark: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  drivingEtaMinutes: number;
  walkingEtaMinutes: number;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  reservedSlots: number;
  pricePerHour: number;
  twoWheelerPricePerHour: number;
  rating: number;
  reviewCount: number;
  status: FacilityStatus;
  imageUrl: string;
  openingHours: string;
  evChargingAvailable: boolean;
  evChargers?: EVCharger[];
  isCovered: boolean;
  hasCctv: boolean;
  hasValet: boolean;
  hasAccessibleParking: boolean;
  hasCarWash: boolean;
  supportsAdvanceBooking: boolean;
  securityFeatures: string[];
  cancellationPolicy: string;
  operatorId: string;
  operatorName: string;
  operatorPhone: string;
  approved: boolean;
}

export type BookingStatus = 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface Booking {
  bookingId: string;
  userId: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  slotId: string;
  slotNumber: string;
  floor: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleModel: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  baseRate: number;
  subtotal: number;
  convenienceFee: number;
  taxAmount: number;
  discountAmount: number;
  promoCodeApplied?: string;
  totalAmount: number;
  paymentMethod: 'UPI' | 'Card' | 'Wallet' | 'NetBanking';
  paymentTransactionId: string;
  paymentStatus: 'PAID' | 'REFUNDED' | 'FAILED';
  bookingStatus: BookingStatus;
  checkInTime?: string;
  checkOutTime?: string;
  qrPayload: string;
  createdAt: string;
  ratingGiven?: number;
  reviewComment?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  facilityId: string;
  userId: string;
  userName: string;
  rating: number;
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'iot_alert' | 'payment' | 'ev' | 'promo' | 'reminder';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountPercentage: number;
  maxDiscount: number;
  minBookingHours: number;
  validUntil: string;
  isActive: boolean;
}

export interface SavedLocation {
  id: string;
  userId: string;
  name: string; // "Home", "Office", "Favorite Gym"
  address: string;
  latitude: number;
  longitude: number;
  iconType: 'home' | 'briefcase' | 'heart' | 'map-pin';
}

export interface AIPredictionResult {
  facilityId: string;
  targetHour: string;
  predictedAvailableSlots: number;
  occupancyProbability: number;
  confidenceScore: number;
  demandTrend: 'HIGH' | 'MODERATE' | 'LOW';
  recommendationReason: string;
  historicalTrend: { hour: string; expectedOccupancy: number }[];
}
