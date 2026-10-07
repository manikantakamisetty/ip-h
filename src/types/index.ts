export type WasteCategory = 'Wet' | 'Dry' | 'E-Waste / Hazardous';

export type YardStatus = 'NORMAL' | 'MODERATE' | 'OVERFLOW';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
}

export interface ZonalDumpYard {
  id: string;
  name: string;
  zoneCode: string;
  location: LocationCoordinates;
  maxCapacityTons: number;
  currentWasteTons: number;
  fillPercentage: number;
  status: YardStatus;
  priorityLevel: PriorityLevel;
  lastUpdated: string;
  managerName: string;
  managerId: string;
  contactNumber: string;
}

export interface MainDumpYard {
  id: string;
  name: string;
  location: LocationCoordinates;
  totalCapacityTons: number;
  currentWasteTons: number;
  operatingHours: string;
}

export interface SmallTruckLog {
  id: string;
  yardId: string;
  vehicleRegNumber: string;
  driverName: string;
  payloadTons: number;
  wasteCategory: WasteCategory;
  timestamp: string;
  managerId: string;
  notes?: string;
}

export interface BigTruckTransfer {
  id: string;
  truckRegNumber: string;
  driverName: string;
  selectedYardIds: string[];
  totalCollectedTons: number;
  distanceKm: number;
  travelTimeMins: number;
  fuelConsumedLiters: number;
  overflowCount: number;
  calculatedCost: number;
  completedAt: string;
  status: 'QUEUED' | 'IN_TRANSIT' | 'COMPLETED';
}

export interface DriverLocation {
  lat: number;
  lng: number;
  address: string;
  heading?: number;
  isDeviceLocation?: boolean;
  accuracyMeters?: number;
}

export interface RouteMetrics {
  totalDistanceKm: number;
  estimatedTravelTimeMins: number;
  fuelConsumedLiters: number;
  overflowCount: number;
  totalCost: number;
  fuelRatePerKm: number;
  timePenaltyPerOverflow: number;
  orderedStops: ZonalDumpYard[];
  googleMapsDeepLink: string;
}

// OOP Architecture Definitions for Academic Lab
export interface OOPClassDefinition {
  className: string;
  parentClass?: string;
  isAbstract?: boolean;
  description: string;
  attributes: { name: string; type: string; visibility: 'public' | 'protected' | 'private'; description: string }[];
  methods: { name: string; returns: string; parameters: string[]; description: string }[];
  polymorphicBehavior?: string;
  codeSnippet: string;
}

export interface HypothesisDataPoint {
  day: string;
  fixedRouteFuelLiters: number;
  dynamicRouteFuelLiters: number;
  fixedRouteCost: number;
  dynamicRouteCost: number;
  fixedOverflowIncidents: number;
  dynamicOverflowIncidents: number;
  savingsPercentage: number;
}

export interface LeverageScenario {
  id: string;
  scenarioName: string;
  difficulty: 'Low' | 'Medium' | 'High';
  difficultyScore: number; // 1-10
  fuelImpact: 'Moderate' | 'High' | 'Extreme';
  fuelImpactPercentage: number; // e.g. 24%
  overflowMitigationScore: string;
  description: string;
  bestStrategy: string;
}
