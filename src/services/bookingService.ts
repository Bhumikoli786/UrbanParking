import { Booking, BookingStatus, ParkingFacility, ParkingSlot, Vehicle, Promotion } from '../types';
import { INITIAL_BOOKINGS } from '../data/mockData';
import { parkingService } from './parkingService';

const STORAGE_KEY_BOOKINGS = 'urbanpark_bookings_v1';

class BookingService {
  private bookings: Booking[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (stored) {
        this.bookings = JSON.parse(stored);
      } else {
        this.bookings = [...INITIAL_BOOKINGS];
        this.save();
      }
    } catch {
      this.bookings = [...INITIAL_BOOKINGS];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(this.bookings));
    } catch (e) {
      console.warn('Failed to save bookings:', e);
    }
  }

  public getBookings(userId?: string): Booking[] {
    if (userId) {
      return this.bookings.filter(b => b.userId === userId);
    }
    return this.bookings;
  }

  public getBookingById(bookingId: string): Booking | undefined {
    return this.bookings.find(b => b.bookingId === bookingId);
  }

  public calculateFee(
    facility: ParkingFacility,
    vehicle: Vehicle,
    durationHours: number,
    promo?: Promotion
  ) {
    const rate = vehicle.type === 'motorcycle' 
      ? facility.twoWheelerPricePerHour 
      : facility.pricePerHour;

    const subtotal = rate * durationHours;
    const convenienceFee = 20; // Flat ₹20 platform fee
    const taxAmount = parseFloat(((subtotal + convenienceFee) * 0.18).toFixed(2)); // 18% GST

    let discountAmount = 0;
    if (promo && promo.isActive && durationHours >= promo.minBookingHours) {
      if (promo.discountPercentage > 0) {
        const calculated = (subtotal * promo.discountPercentage) / 100;
        discountAmount = Math.min(calculated, promo.maxDiscount);
      } else {
        discountAmount = Math.min(promo.maxDiscount, subtotal);
      }
    }

    const totalAmount = Math.max(0, parseFloat((subtotal + convenienceFee + taxAmount - discountAmount).toFixed(2)));

    return {
      baseRate: rate,
      durationHours,
      subtotal,
      convenienceFee,
      taxAmount,
      discountAmount,
      totalAmount,
    };
  }

  public createBooking(params: {
    userId: string;
    facility: ParkingFacility;
    slot: ParkingSlot;
    vehicle: Vehicle;
    date: string;
    startTime: string;
    durationHours: number;
    paymentMethod: 'UPI' | 'Card' | 'Wallet' | 'NetBanking';
    paymentTransactionId: string;
    promo?: Promotion;
  }): Booking {
    const { facility, slot, vehicle, durationHours, promo } = params;
    const pricing = this.calculateFee(facility, vehicle, durationHours, promo);
    
    // Calculate end time
    const startHourNum = parseInt(params.startTime.split(':')[0], 10);
    const isPm = params.startTime.includes('PM');
    let normalizedStart = startHourNum;
    if (isPm && startHourNum !== 12) normalizedStart += 12;
    if (!isPm && startHourNum === 12) normalizedStart = 0;
    
    const endHourNum = (normalizedStart + durationHours) % 24;
    const endHourFormatted = `${endHourNum % 12 === 0 ? 12 : endHourNum % 12}:00 ${endHourNum >= 12 ? 'PM' : 'AM'}`;

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const bookingId = `UP-2026-${randomNum}`;

    const newBooking: Booking = {
      bookingId,
      userId: params.userId,
      facilityId: facility.id,
      facilityName: facility.name,
      facilityAddress: facility.address,
      slotId: slot.id,
      slotNumber: slot.slotNumber,
      floor: slot.floor,
      vehicleId: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      vehicleModel: vehicle.makeModel,
      date: params.date,
      startTime: params.startTime,
      endTime: endHourFormatted,
      durationHours,
      baseRate: pricing.baseRate,
      subtotal: pricing.subtotal,
      convenienceFee: pricing.convenienceFee,
      taxAmount: pricing.taxAmount,
      discountAmount: pricing.discountAmount,
      promoCodeApplied: promo?.code,
      totalAmount: pricing.totalAmount,
      paymentMethod: params.paymentMethod,
      paymentTransactionId: params.paymentTransactionId,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      qrPayload: `URBANPARK://TICKET/${bookingId}/${facility.id}/${slot.slotNumber}/CONFIRMED`,
      createdAt: 'Just now',
    };

    // Mark slot as RESERVED in parking service
    parkingService.updateSlotStatus(facility.id, slot.id, 'RESERVED');

    this.bookings.unshift(newBooking);
    this.save();
    return newBooking;
  }

  public checkIn(bookingId: string): Booking | undefined {
    const booking = this.getBookingById(bookingId);
    if (!booking) return undefined;

    booking.bookingStatus = 'ACTIVE';
    booking.checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    booking.qrPayload = `URBANPARK://TICKET/${booking.bookingId}/${booking.facilityId}/${booking.slotNumber}/ACTIVE`;
    
    // Update slot to OCCUPIED
    parkingService.updateSlotStatus(booking.facilityId, booking.slotId, 'OCCUPIED');
    this.save();
    return booking;
  }

  public checkOut(bookingId: string): Booking | undefined {
    const booking = this.getBookingById(bookingId);
    if (!booking) return undefined;

    booking.bookingStatus = 'COMPLETED';
    booking.checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    booking.qrPayload = `URBANPARK://TICKET/${booking.bookingId}/${booking.facilityId}/${booking.slotNumber}/COMPLETED`;
    
    // Release slot back to AVAILABLE
    parkingService.updateSlotStatus(booking.facilityId, booking.slotId, 'AVAILABLE');
    this.save();
    return booking;
  }

  public cancelBooking(bookingId: string): Booking | undefined {
    const booking = this.getBookingById(bookingId);
    if (!booking) return undefined;

    booking.bookingStatus = 'CANCELLED';
    booking.paymentStatus = 'REFUNDED';
    booking.qrPayload = `URBANPARK://TICKET/${booking.bookingId}/${booking.facilityId}/${booking.slotNumber}/CANCELLED`;

    // Free the slot
    parkingService.updateSlotStatus(booking.facilityId, booking.slotId, 'AVAILABLE');
    this.save();
    return booking;
  }

  public rateBooking(bookingId: string, rating: number, comment?: string): Booking | undefined {
    const booking = this.getBookingById(bookingId);
    if (!booking) return undefined;

    booking.ratingGiven = rating;
    booking.reviewComment = comment;
    this.save();
    return booking;
  }
}

export const bookingService = new BookingService();
