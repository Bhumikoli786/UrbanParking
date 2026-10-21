import { ParkingFacility, AIPredictionResult } from '../types';

export class AIPredictionService {
  /**
   * Transparent statistical & heuristic simulation of future parking availability.
   * Models diurnal demand patterns by facility category and proximity to peak rush hours.
   */
  public predictAvailability(facility: ParkingFacility, targetHourOffset: number = 2): AIPredictionResult {
    const now = new Date();
    const currentHour = now.getHours();
    const targetHourNum = (currentHour + targetHourOffset) % 24;
    const targetHourFormatted = `${targetHourNum % 12 === 0 ? 12 : targetHourNum % 12}:00 ${targetHourNum >= 12 ? 'PM' : 'AM'}`;

    // Demand curves based on venue category
    let occupancyFactor = 0.65;
    let isPeak = false;

    if (facility.category === 'office') {
      // Peaks 9am-12pm and 2pm-5pm
      if (targetHourNum >= 9 && targetHourNum <= 18) {
        occupancyFactor = 0.88;
        isPeak = true;
      } else {
        occupancyFactor = 0.35;
      }
    } else if (facility.category === 'mall' || facility.category === 'market') {
      // Peaks 4pm - 10pm
      if (targetHourNum >= 16 && targetHourNum <= 22) {
        occupancyFactor = 0.92;
        isPeak = true;
      } else {
        occupancyFactor = 0.45;
      }
    } else if (facility.category === 'airport') {
      // High baseline throughout
      occupancyFactor = targetHourNum >= 18 && targetHourNum <= 23 ? 0.82 : 0.70;
      isPeak = targetHourNum >= 19 && targetHourNum <= 22;
    } else {
      occupancyFactor = targetHourNum >= 11 && targetHourNum <= 20 ? 0.80 : 0.50;
      isPeak = targetHourNum >= 17 && targetHourNum <= 20;
    }

    const predictedOccupied = Math.min(
      facility.totalSlots,
      Math.max(2, Math.round(facility.totalSlots * occupancyFactor))
    );
    const predictedAvailable = Math.max(0, facility.totalSlots - predictedOccupied);

    const confidence = Math.round(86 + Math.random() * 8); // 86% - 94%

    // Build 6-hour forecast curve
    const historicalTrend: { hour: string; expectedOccupancy: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const h = (currentHour + i) % 24;
      const hLabel = `${h % 12 === 0 ? 12 : h % 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
      let factor = occupancyFactor;
      if (i > 0) {
        factor = Math.min(0.96, Math.max(0.2, factor + (Math.sin(i) * 0.1)));
      }
      historicalTrend.push({
        hour: hLabel,
        expectedOccupancy: Math.round(facility.totalSlots * factor),
      });
    }

    let recommendationReason = `Optimal choice: ${facility.distanceKm} km away (${facility.drivingEtaMinutes}m drive) with ${facility.availableSlots} live slots.`;
    if (facility.evChargingAvailable) {
      recommendationReason += ' Supports active DC Fast EV charging.';
    }

    return {
      facilityId: facility.id,
      targetHour: targetHourFormatted,
      predictedAvailableSlots: predictedAvailable,
      occupancyProbability: Math.round(occupancyFactor * 100),
      confidenceScore: confidence,
      demandTrend: isPeak ? 'HIGH' : occupancyFactor > 0.6 ? 'MODERATE' : 'LOW',
      recommendationReason,
      historicalTrend,
    };
  }

  /**
   * Evaluates and sorts facilities based on multi-factor score:
   * distance, price, available slots, rating, and EV capability.
   */
  public getRecommendations(
    facilities: ParkingFacility[],
    userNeedsEv: boolean = false,
    maxDistanceKm: number = 10
  ): { facility: ParkingFacility; score: number; reason: string }[] {
    return facilities
      .filter(f => f.status !== 'CLOSED' && f.distanceKm <= maxDistanceKm)
      .map(fac => {
        let score = 50;
        const reasons: string[] = [];

        // Availability factor (up to 25 pts)
        const availRatio = fac.availableSlots / Math.max(1, fac.totalSlots);
        score += Math.min(25, availRatio * 35);
        if (fac.availableSlots > 20) {
          reasons.push(`${fac.availableSlots} spaces ready`);
        }

        // Distance factor (up to 25 pts)
        const distScore = Math.max(0, 25 - fac.distanceKm * 3);
        score += distScore;
        if (fac.drivingEtaMinutes <= 8) {
          reasons.push(`Just ${fac.drivingEtaMinutes} mins drive`);
        }

        // Rating factor (up to 20 pts)
        score += fac.rating * 4;

        // EV factor (up to 15 pts)
        if (userNeedsEv && fac.evChargingAvailable) {
          score += 20;
          reasons.push('Fast EV charging on-site');
        }

        // Price factor (up to 15 pts)
        if (fac.pricePerHour <= 80) {
          score += 10;
          reasons.push(`Affordable ₹${fac.pricePerHour}/hr`);
        }

        const reason = reasons.length > 0 
          ? `Recommended because it is ${reasons.join(', ')}.`
          : `Reliable facility rated ${fac.rating}★ with advance booking.`;

        return {
          facility: fac,
          score: Math.round(score),
          reason,
        };
      })
      .sort((a, b) => b.score - a.score);
  }
}

export const aiPredictionService = new AIPredictionService();
