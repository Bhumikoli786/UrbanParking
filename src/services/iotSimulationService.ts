import { ParkingFacility, ParkingSlot } from '../types';

export interface IoTEvent {
  id: string;
  facilityId: string;
  facilityName: string;
  slotNumber: string;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
  sensorId: string;
}

type IoTListener = (event: IoTEvent, updatedFacility: ParkingFacility) => void;

class IoTSimulationService {
  private listeners: IoTListener[] = [];
  private intervalId: any = null;
  private isSimulating: boolean = true;

  constructor() {
    this.startAutoSimulation();
  }

  public subscribe(listener: IoTListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public setSimulationActive(active: boolean) {
    this.isSimulating = active;
    if (active && !this.intervalId) {
      this.startAutoSimulation();
    } else if (!active && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getIsSimulating(): boolean {
    return this.isSimulating;
  }

  private startAutoSimulation() {
    if (this.intervalId) clearInterval(this.intervalId);
    // Periodically simulate an IoT sensor reading every 12 seconds
    this.intervalId = setInterval(() => {
      if (!this.isSimulating) return;
      this.triggerRandomSensorEvent();
    }, 12000);
  }

  public triggerRandomSensorEvent(customFacility?: ParkingFacility, customSlot?: ParkingSlot) {
    // Notify listeners with simulated telemetry
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const sampleFacilities = ['BKC Smart Mobility Tower', 'Palladium Plaza Parking', 'CSMI Airport T2 AeroPark', 'Koramangala Tech Garage'];
    const randomFac = customFacility ? customFacility.name : sampleFacilities[Math.floor(Math.random() * sampleFacilities.length)];
    const randomSlotNum = customSlot ? customSlot.slotNumber : `B1-${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}`;
    const becomesOccupied = Math.random() > 0.45;

    const event: IoTEvent = {
      id: `IOT_EVT_${Date.now()}`,
      facilityId: customFacility ? customFacility.id : 'fac_bkc_01',
      facilityName: randomFac,
      slotNumber: randomSlotNum,
      previousStatus: becomesOccupied ? 'AVAILABLE' : 'OCCUPIED',
      newStatus: becomesOccupied ? 'OCCUPIED' : 'AVAILABLE',
      timestamp: timeStr,
      sensorId: `SNR_OPTICAL_BAY_${Math.floor(Math.random() * 899 + 100)}`,
    };

    // Construct mock facility delta
    const mockUpdatedFacility: ParkingFacility = customFacility || {
      id: 'fac_bkc_01',
      name: randomFac,
      category: 'office',
      address: 'Bandra Kurla Complex, Mumbai',
      city: 'Mumbai',
      landmark: 'BKC Hub',
      latitude: 19.0664,
      longitude: 72.8679,
      distanceKm: 0.8,
      drivingEtaMinutes: 4,
      walkingEtaMinutes: 10,
      totalSlots: 180,
      availableSlots: becomesOccupied ? 45 : 47,
      occupiedSlots: becomesOccupied ? 123 : 121,
      reservedSlots: 12,
      pricePerHour: 80,
      twoWheelerPricePerHour: 30,
      rating: 4.8,
      reviewCount: 428,
      status: 'AVAILABLE',
      imageUrl: '',
      openingHours: '24/7',
      evChargingAvailable: true,
      isCovered: true,
      hasCctv: true,
      hasValet: true,
      hasAccessibleParking: true,
      hasCarWash: true,
      supportsAdvanceBooking: true,
      securityFeatures: ['24x7 Guard', 'ANPR'],
      cancellationPolicy: 'Standard',
      operatorId: 'usr_operator_01',
      operatorName: 'Operator',
      operatorPhone: '9999999999',
      approved: true,
    };

    this.listeners.forEach(listener => {
      try {
        listener(event, mockUpdatedFacility);
      } catch (err) {
        console.error('Error in IoT listener:', err);
      }
    });

    return event;
  }
}

export const iotSimulationService = new IoTSimulationService();
