import { ParkingFacility, ParkingSlot, Review } from '../types';
import { INITIAL_FACILITIES, generateFacilitySlots } from '../data/mockData';

const STORAGE_KEY_FACILITIES = 'urbanpark_facilities_v1';
const STORAGE_KEY_SLOTS = 'urbanpark_slots_v1';
const STORAGE_KEY_REVIEWS = 'urbanpark_reviews_v1';

class ParkingService {
  private facilities: ParkingFacility[] = [];
  private slotsByFacility: Record<string, ParkingSlot[]> = {};
  private reviews: Review[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedFacs = localStorage.getItem(STORAGE_KEY_FACILITIES);
      if (storedFacs) {
        this.facilities = JSON.parse(storedFacs);
      } else {
        this.facilities = [...INITIAL_FACILITIES];
        this.saveFacilities();
      }

      const storedSlots = localStorage.getItem(STORAGE_KEY_SLOTS);
      if (storedSlots) {
        this.slotsByFacility = JSON.parse(storedSlots);
      } else {
        this.facilities.forEach(f => {
          this.slotsByFacility[f.id] = generateFacilitySlots(f.id);
        });
        this.saveSlots();
      }

      const storedReviews = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (storedReviews) {
        this.reviews = JSON.parse(storedReviews);
      } else {
        this.reviews = [
          {
            id: 'rev_1',
            bookingId: 'UP-2026-77410',
            facilityId: 'fac_palladium_02',
            userId: 'usr_driver_01',
            userName: 'Aarav Sharma',
            rating: 5,
            tags: ['Clean', 'Fast Barrier Entry', 'Great EV Charger'],
            comment: 'Super fast ANPR boom gate entry. Spot F1-08 was reserved and completely clear when I pulled in!',
            createdAt: '28 Sep 2026',
          }
        ];
        this.saveReviews();
      }
    } catch {
      this.facilities = [...INITIAL_FACILITIES];
      this.facilities.forEach(f => {
        this.slotsByFacility[f.id] = generateFacilitySlots(f.id);
      });
    }
  }

  private saveFacilities() {
    try {
      localStorage.setItem(STORAGE_KEY_FACILITIES, JSON.stringify(this.facilities));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  private saveSlots() {
    try {
      localStorage.setItem(STORAGE_KEY_SLOTS, JSON.stringify(this.slotsByFacility));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  private saveReviews() {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(this.reviews));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  public getFacilities(): ParkingFacility[] {
    return this.facilities;
  }

  public getFacilityById(id: string): ParkingFacility | undefined {
    return this.facilities.find(f => f.id === id);
  }

  public getSlotsForFacility(facilityId: string): ParkingSlot[] {
    if (!this.slotsByFacility[facilityId]) {
      this.slotsByFacility[facilityId] = generateFacilitySlots(facilityId);
      this.saveSlots();
    }
    return this.slotsByFacility[facilityId];
  }

  public updateSlotStatus(facilityId: string, slotId: string, newStatus: ParkingSlot['status']): ParkingSlot | undefined {
    const slots = this.getSlotsForFacility(facilityId);
    const targetSlot = slots.find(s => s.id === slotId);
    if (!targetSlot) return undefined;

    targetSlot.status = newStatus;
    targetSlot.lastUpdated = 'Just now';
    this.saveSlots();

    // Recalculate facility available / occupied numbers
    this.recalculateFacilityOccupancy(facilityId);
    return targetSlot;
  }

  public recalculateFacilityOccupancy(facilityId: string) {
    const fac = this.getFacilityById(facilityId);
    const slots = this.getSlotsForFacility(facilityId);
    if (!fac || !slots.length) return;

    const availableCount = slots.filter(s => s.status === 'AVAILABLE').length;
    const occupiedCount = slots.filter(s => s.status === 'OCCUPIED').length;
    const reservedCount = slots.filter(s => s.status === 'RESERVED').length;

    fac.availableSlots = availableCount;
    fac.occupiedSlots = occupiedCount;
    fac.reservedSlots = reservedCount;

    if (fac.availableSlots === 0) fac.status = 'FULL';
    else if (fac.availableSlots < 6) fac.status = 'LIMITED';
    else fac.status = 'AVAILABLE';

    this.saveFacilities();
  }

  public addFacility(facilityData: Omit<ParkingFacility, 'id' | 'rating' | 'reviewCount'>): ParkingFacility {
    const newFacility: ParkingFacility = {
      ...facilityData,
      id: `fac_custom_${Date.now()}`,
      rating: 5.0,
      reviewCount: 1,
    };
    this.facilities.unshift(newFacility);
    this.slotsByFacility[newFacility.id] = generateFacilitySlots(newFacility.id);
    this.saveFacilities();
    this.saveSlots();
    return newFacility;
  }

  public updateFacility(id: string, updates: Partial<ParkingFacility>): ParkingFacility | undefined {
    const facIndex = this.facilities.findIndex(f => f.id === id);
    if (facIndex === -1) return undefined;

    this.facilities[facIndex] = { ...this.facilities[facIndex], ...updates };
    this.saveFacilities();
    return this.facilities[facIndex];
  }

  public approveFacility(id: string): boolean {
    const fac = this.getFacilityById(id);
    if (!fac) return false;
    fac.approved = true;
    this.saveFacilities();
    return true;
  }

  public addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Review {
    const newReview: Review = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      createdAt: 'Just now',
    };
    this.reviews.unshift(newReview);
    this.saveReviews();

    // Update facility rating
    const facilityReviews = this.reviews.filter(r => r.facilityId === reviewData.facilityId);
    const avgRating = facilityReviews.reduce((sum, r) => sum + r.rating, 0) / facilityReviews.length;
    const fac = this.getFacilityById(reviewData.facilityId);
    if (fac) {
      fac.rating = parseFloat(avgRating.toFixed(1));
      fac.reviewCount += 1;
      this.saveFacilities();
    }

    return newReview;
  }

  public getReviewsForFacility(facilityId: string): Review[] {
    return this.reviews.filter(r => r.facilityId === facilityId);
  }
}

export const parkingService = new ParkingService();
