import { NotificationItem } from '../types';
import { INITIAL_NOTIFICATIONS, INITIAL_PROMOTIONS } from '../data/mockData';
import { Promotion } from '../types';

const STORAGE_KEY_NOTIFS = 'urbanpark_notifs_v1';
const STORAGE_KEY_PROMOS = 'urbanpark_promos_v1';

class NotificationService {
  private notifications: NotificationItem[] = [];

  constructor() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (stored) {
        this.notifications = JSON.parse(stored);
      } else {
        this.notifications = [...INITIAL_NOTIFICATIONS];
        this.save();
      }
    } catch {
      this.notifications = [...INITIAL_NOTIFICATIONS];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('Failed to save notifications:', e);
    }
  }

  public getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public markAsRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
  }

  public markAllAsRead() {
    this.notifications.forEach(n => (n.read = true));
    this.save();
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}`,
      read: false,
      timestamp: 'Just now',
    };
    this.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }
}

export const notificationService = new NotificationService();

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
