import { UserProfile, UserRole, Vehicle, SavedLocation } from '../types';
import { DEMO_USERS, INITIAL_VEHICLES, INITIAL_SAVED_LOCATIONS } from '../data/mockData';

const STORAGE_KEY_AUTH_USER = 'urbanpark_auth_user_v1';
const STORAGE_KEY_AUTH_ROLE = 'urbanpark_auth_role_v1';
const STORAGE_KEY_AUTH_IS_LOGGED_IN = 'urbanpark_auth_is_logged_in_v1';
const STORAGE_KEY_USERS_LIST = 'urbanpark_registered_users_v1';
const STORAGE_KEY_VEHICLES = 'urbanpark_vehicles_v1';
const STORAGE_KEY_SAVED_LOCS = 'urbanpark_saved_locs_v1';

class AuthService {
  private currentUser: UserProfile | null = null;
  private currentRole: UserRole = 'driver';
  private isLoggedInState: boolean = true;
  private registeredUsers: UserProfile[] = [];
  private vehicles: Vehicle[] = [];
  private savedLocations: SavedLocation[] = [];

  constructor() {
    // 1. Registered Users list initialization
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS_LIST);
      if (storedUsers) {
        this.registeredUsers = JSON.parse(storedUsers);
      } else {
        this.registeredUsers = Object.values(DEMO_USERS);
        localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(this.registeredUsers));
      }
    } catch {
      this.registeredUsers = Object.values(DEMO_USERS);
    }

    // 2. Auth State restoration
    const storedLoggedIn = localStorage.getItem(STORAGE_KEY_AUTH_IS_LOGGED_IN);
    this.isLoggedInState = storedLoggedIn !== null ? storedLoggedIn === 'true' : true;

    const savedRole = (localStorage.getItem(STORAGE_KEY_AUTH_ROLE) as UserRole) || 'driver';
    this.currentRole = savedRole;

    const savedUser = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (savedUser && this.isLoggedInState) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch {
        this.currentUser = DEMO_USERS[savedRole] || DEMO_USERS.driver;
      }
    } else if (this.isLoggedInState) {
      this.currentUser = DEMO_USERS[savedRole] || DEMO_USERS.driver;
    } else {
      this.currentUser = null;
    }

    // 3. Vehicles restoration
    const savedVeh = localStorage.getItem(STORAGE_KEY_VEHICLES);
    if (savedVeh) {
      try {
        this.vehicles = JSON.parse(savedVeh);
      } catch {
        this.vehicles = [...INITIAL_VEHICLES];
      }
    } else {
      this.vehicles = [...INITIAL_VEHICLES];
      this.saveVehicles();
    }

    // 4. Saved Locations restoration
    const savedLocs = localStorage.getItem(STORAGE_KEY_SAVED_LOCS);
    if (savedLocs) {
      try {
        this.savedLocations = JSON.parse(savedLocs);
      } catch {
        this.savedLocations = [...INITIAL_SAVED_LOCATIONS];
      }
    } else {
      this.savedLocations = [...INITIAL_SAVED_LOCATIONS];
      this.saveSavedLocations();
    }
  }

  private saveSession() {
    try {
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(this.currentUser));
        localStorage.setItem(STORAGE_KEY_AUTH_ROLE, this.currentRole);
        localStorage.setItem(STORAGE_KEY_AUTH_IS_LOGGED_IN, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH_USER);
        localStorage.setItem(STORAGE_KEY_AUTH_IS_LOGGED_IN, 'false');
      }
    } catch (e) {
      console.warn('Failed to save session:', e);
    }
  }

  private saveRegisteredUsers() {
    try {
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(this.registeredUsers));
    } catch (e) {
      console.warn('Failed to save users list:', e);
    }
  }

  private saveVehicles() {
    try {
      localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(this.vehicles));
    } catch (e) {
      console.warn('Failed to save vehicles:', e);
    }
  }

  private saveSavedLocations() {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_LOCS, JSON.stringify(this.savedLocations));
    } catch (e) {
      console.warn('Failed to save saved locations:', e);
    }
  }

  public isAuthenticated(): boolean {
    return this.isLoggedInState && this.currentUser !== null;
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public getCurrentRole(): UserRole {
    return this.currentRole;
  }

  public login(emailOrPhone: string, _password?: string): { success: boolean; user?: UserProfile; message?: string } {
    const clean = emailOrPhone.trim().toLowerCase();
    
    // Look up in registered users or match demo driver
    let matched = this.registeredUsers.find(
      u => u.email.toLowerCase() === clean || u.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, '')
    );

    if (!matched) {
      // If logging in with demo or brand new credentials, support fallback demo user
      if (clean.includes('aarav') || clean.includes('driver') || clean === '9820144521' || clean === '+919820144521') {
        matched = DEMO_USERS.driver;
      } else {
        // Create user session for smooth demo onboarding
        matched = {
          id: `usr_${Date.now()}`,
          name: clean.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: clean.includes('@') ? clean : `${clean}@urbanpark.in`,
          phone: clean.includes('@') ? '+91 98200 12345' : clean,
          role: 'driver',
          isPremium: false,
          premiumPlan: 'free',
          loyaltyPoints: 100,
        };
        this.registeredUsers.push(matched);
        this.saveRegisteredUsers();
      }
    }

    this.currentUser = matched;
    this.currentRole = matched.role;
    this.isLoggedInState = true;
    this.saveSession();

    return { success: true, user: matched };
  }

  public signUp(params: {
    name: string;
    email: string;
    phone: string;
    vehiclePlate?: string;
    vehicleMake?: string;
  }): { success: boolean; user: UserProfile } {
    const cleanEmail = params.email.trim().toLowerCase();
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: params.name.trim(),
      email: cleanEmail,
      phone: params.phone.trim(),
      role: 'driver',
      isPremium: false,
      premiumPlan: 'free',
      loyaltyPoints: 150, // Welcome bonus points
    };

    this.registeredUsers.push(newUser);
    this.saveRegisteredUsers();

    // Auto-create vehicle if supplied
    if (params.vehiclePlate && params.vehiclePlate.trim()) {
      this.addVehicle({
        nickname: params.vehicleMake ? `${params.vehicleMake} (Primary)` : 'Primary Vehicle',
        vehicleNumber: params.vehiclePlate.toUpperCase().trim(),
        type: 'car',
        makeModel: params.vehicleMake ? params.vehicleMake.trim() : 'Sedan',
        fuelType: 'petrol',
      });
    }

    this.currentUser = newUser;
    this.currentRole = 'driver';
    this.isLoggedInState = true;
    this.saveSession();

    return { success: true, user: newUser };
  }

  public loginWithOtp(phone: string, otp: string): { success: boolean; user?: UserProfile; message?: string } {
    if (otp !== '1234' && otp.length !== 4) {
      return { success: false, message: 'Invalid OTP code. Please enter 1234 for demo verification.' };
    }

    return this.login(phone);
  }

  public logout(): void {
    this.currentUser = null;
    this.isLoggedInState = false;
    this.currentRole = 'driver';
    this.saveSession();
  }

  public switchRole(role: UserRole): UserProfile {
    this.currentRole = role;
    this.currentUser = DEMO_USERS[role];
    this.isLoggedInState = true;
    this.saveSession();
    return this.currentUser;
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    if (!this.currentUser) return null;
    this.currentUser = { ...this.currentUser, ...updates };
    this.saveSession();
    return this.currentUser;
  }

  public upgradeToPremium(plan: 'pro' | 'elite'): UserProfile | null {
    if (!this.currentUser) return null;
    this.currentUser.isPremium = true;
    this.currentUser.premiumPlan = plan;
    this.currentUser.loyaltyPoints += 250;
    this.saveSession();
    return this.currentUser;
  }

  // Vehicles
  public getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  public addVehicle(vData: Omit<Vehicle, 'id' | 'userId' | 'isDefault'>): Vehicle {
    const userId = this.currentUser ? this.currentUser.id : 'usr_driver_01';
    const newVeh: Vehicle = {
      ...vData,
      id: `veh_${Date.now()}`,
      userId,
      isDefault: this.vehicles.length === 0,
    };
    this.vehicles.push(newVeh);
    this.saveVehicles();
    return newVeh;
  }

  public removeVehicle(vehicleId: string): void {
    this.vehicles = this.vehicles.filter(v => v.id !== vehicleId);
    if (this.vehicles.length > 0 && !this.vehicles.some(v => v.isDefault)) {
      this.vehicles[0].isDefault = true;
    }
    this.saveVehicles();
  }

  public setDefaultVehicle(vehicleId: string): void {
    this.vehicles.forEach(v => {
      v.isDefault = v.id === vehicleId;
    });
    this.saveVehicles();
  }

  // Saved Locations
  public getSavedLocations(): SavedLocation[] {
    return this.savedLocations;
  }

  public addSavedLocation(loc: Omit<SavedLocation, 'id' | 'userId'>): SavedLocation {
    const userId = this.currentUser ? this.currentUser.id : 'usr_driver_01';
    const newLoc: SavedLocation = {
      ...loc,
      id: `loc_${Date.now()}`,
      userId,
    };
    this.savedLocations.push(newLoc);
    this.saveSavedLocations();
    return newLoc;
  }

  public removeSavedLocation(id: string): void {
    this.savedLocations = this.savedLocations.filter(l => l.id !== id);
    this.saveSavedLocations();
  }
}

export const authService = new AuthService();
