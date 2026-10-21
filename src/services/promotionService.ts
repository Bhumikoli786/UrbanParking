import { Promotion } from '../types';
import { INITIAL_PROMOTIONS } from '../data/mockData';

const STORAGE_KEY_PROMOS = 'urbanpark_promos_v1';

class PromotionService {
  private promotions: Promotion[] = [];

  constructor() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROMOS);
      if (stored) {
        this.promotions = JSON.parse(stored);
      } else {
        this.promotions = [...INITIAL_PROMOTIONS];
        this.save();
      }
    } catch {
      this.promotions = [...INITIAL_PROMOTIONS];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(this.promotions));
    } catch (e) {
      console.warn('Failed to save promos:', e);
    }
  }

  public getPromotions(): Promotion[] {
    return this.promotions;
  }

  public getActivePromotions(): Promotion[] {
    return this.promotions.filter(p => p.isActive);
  }

  public applyCode(code: string): Promotion | undefined {
    const clean = code.trim().toUpperCase();
    return this.promotions.find(p => p.code.toUpperCase() === clean && p.isActive);
  }

  public togglePromo(id: string) {
    const p = this.promotions.find(item => item.id === id);
    if (p) {
      p.isActive = !p.isActive;
      this.save();
    }
  }

  public addPromo(promo: Omit<Promotion, 'id'>) {
    const newP: Promotion = {
      ...promo,
      id: `p_${Date.now()}`,
    };
    this.promotions.unshift(newP);
    this.save();
    return newP;
  }
}

export const promotionService = new PromotionService();
