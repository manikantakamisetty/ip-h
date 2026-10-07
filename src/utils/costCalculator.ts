import { RouteMetrics, ZonalDumpYard, LocationCoordinates, DriverLocation, MainDumpYard } from '../types';

export const CONSTANTS = {
  BIG_TRUCK_FUEL_EFFICIENCY_KM_PER_L: 3.2, // km per liter for 20-ton heavy transfer truck
  DEFAULT_FUEL_PRICE_PER_LITER: 95, // INR per liter (Diesel)
  DEFAULT_OVERFLOW_TIME_PENALTY: 1500, // INR penalty per active overflow station
  AVG_CITY_SPEED_KMH: 28, // km/h realistic urban transit speed including signals & weighbridges
  CIRCUITY_FACTOR: 1.28 // Real-world urban road circuity factor over straight-line Haversine
};

/**
 * Calculates straight-line Haversine distance between two coordinates in kilometers.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates estimated driving road distance between two coordinates in km.
 */
export function estimateRoadDistanceKm(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const straightLine = haversineDistance(coord1.lat, coord1.lng, coord2.lat, coord2.lng);
  return Number((straightLine * CONSTANTS.CIRCUITY_FACTOR).toFixed(1));
}

/**
 * Calculates Session 8 Municipal Cost Equation:
 * Cost = (Distance * Fuel Rate) + (Time Penalty * Overflow Count)
 */
export function calculateSession8Cost(
  distanceKm: number,
  overflowCount: number,
  fuelPricePerLiter: number = CONSTANTS.DEFAULT_FUEL_PRICE_PER_LITER,
  overflowPenalty: number = CONSTANTS.DEFAULT_OVERFLOW_TIME_PENALTY
): {
  distanceCost: number;
  penaltyCost: number;
  totalCost: number;
  fuelConsumedLiters: number;
  effectiveFuelRatePerKm: number;
} {
  const fuelConsumedLiters = Number(
    (distanceKm / CONSTANTS.BIG_TRUCK_FUEL_EFFICIENCY_KM_PER_L).toFixed(2)
  );
  const effectiveFuelRatePerKm = fuelPricePerLiter / CONSTANTS.BIG_TRUCK_FUEL_EFFICIENCY_KM_PER_L;
  const distanceCost = Number((distanceKm * effectiveFuelRatePerKm).toFixed(2));
  const penaltyCost = Number((overflowPenalty * overflowCount).toFixed(2));
  const totalCost = Number((distanceCost + penaltyCost).toFixed(2));

  return {
    distanceCost,
    penaltyCost,
    totalCost,
    fuelConsumedLiters,
    effectiveFuelRatePerKm: Number(effectiveFuelRatePerKm.toFixed(2))
  };
}

/**
 * Computes the multi-stop route metrics across selected Zonal Yards ending at Main Dump Yard.
 */
export function computeRouteMetrics(
  driverLoc: DriverLocation,
  selectedYards: ZonalDumpYard[],
  mainYard: MainDumpYard,
  fuelPricePerLiter: number = CONSTANTS.DEFAULT_FUEL_PRICE_PER_LITER,
  timePenalty: number = CONSTANTS.DEFAULT_OVERFLOW_TIME_PENALTY
): RouteMetrics {
  if (selectedYards.length === 0) {
    return {
      totalDistanceKm: 0,
      estimatedTravelTimeMins: 0,
      fuelConsumedLiters: 0,
      overflowCount: 0,
      totalCost: 0,
      fuelRatePerKm: Number((fuelPricePerLiter / CONSTANTS.BIG_TRUCK_FUEL_EFFICIENCY_KM_PER_L).toFixed(2)),
      timePenaltyPerOverflow: timePenalty,
      orderedStops: [],
      googleMapsDeepLink: ''
    };
  }

  // Greedy Nearest Neighbor ordering for waypoints starting from driver location
  const unvisited = [...selectedYards];
  const orderedStops: ZonalDumpYard[] = [];
  let currentPos = { lat: driverLoc.lat, lng: driverLoc.lng };
  let totalDistance = 0;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = estimateRoadDistanceKm(currentPos, unvisited[i].location);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const [nearestYard] = unvisited.splice(nearestIndex, 1);
    orderedStops.push(nearestYard);
    totalDistance += minDistance;
    currentPos = { lat: nearestYard.location.lat, lng: nearestYard.location.lng };
  }

  // Final leg: from last yard to Main Dump Yard
  const finalLeg = estimateRoadDistanceKm(currentPos, mainYard.location);
  totalDistance += finalLeg;
  totalDistance = Number(totalDistance.toFixed(1));

  // Count active overflow yards among selected
  const overflowCount = selectedYards.filter((y) => y.fillPercentage >= 80).length;

  const costData = calculateSession8Cost(totalDistance, overflowCount, fuelPricePerLiter, timePenalty);

  // Urban travel time = (Distance / Speed) * 60 + (15 mins per stop unloading/loading buffer)
  const travelTimeMins = Math.round(
    (totalDistance / CONSTANTS.AVG_CITY_SPEED_KMH) * 60 + orderedStops.length * 15
  );

  // Generate Google Maps Deep Link
  const originStr = `${driverLoc.lat},${driverLoc.lng}`;
  const destStr = `${mainYard.location.lat},${mainYard.location.lng}`;
  const waypointsStr = orderedStops
    .map((y) => `${y.location.lat},${y.location.lng}`)
    .join('|');

  const googleMapsDeepLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    originStr
  )}&destination=${encodeURIComponent(destStr)}&waypoints=${encodeURIComponent(
    waypointsStr
  )}&travelmode=driving`;

  return {
    totalDistanceKm: totalDistance,
    estimatedTravelTimeMins: travelTimeMins,
    fuelConsumedLiters: costData.fuelConsumedLiters,
    overflowCount,
    totalCost: costData.totalCost,
    fuelRatePerKm: costData.effectiveFuelRatePerKm,
    timePenaltyPerOverflow: timePenalty,
    orderedStops,
    googleMapsDeepLink
  };
}

export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
}
