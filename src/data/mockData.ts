import {
  ZonalDumpYard,
  MainDumpYard,
  SmallTruckLog,
  DriverLocation,
  HypothesisDataPoint,
  LeverageScenario,
  OOPClassDefinition
} from '../types';

export const MAIN_DUMP_YARD: MainDumpYard = {
  id: 'main-jawaharnagar',
  name: 'Jawaharnagar Mega Municipal Dump Yard & Waste-to-Energy Plant',
  location: {
    lat: 17.5022,
    lng: 78.5864,
    address: 'Jawaharnagar Solid Waste Processing Facility, Outer Ring Road Sector 14, Greater Hyderabad'
  },
  totalCapacityTons: 10000,
  currentWasteTons: 6420,
  operatingHours: '24 Hours / 7 Days (Round-the-Clock Automated Weighbridges)'
};

export const INITIAL_DRIVER_LOCATION: DriverLocation = {
  lat: 17.4568,
  lng: 78.4432,
  address: 'GHMC Central Heavy Fleet Depot, Sanath Nagar Industrial Zone',
  heading: 45
};

export const INITIAL_ZONAL_YARDS: ZonalDumpYard[] = [
  {
    id: 'yard-kp-01',
    name: 'Kukatpally Zonal Transfer Station',
    zoneCode: 'KP-01',
    location: {
      lat: 17.4938,
      lng: 78.3995,
      address: 'Near Y-Junction Ring Road, Kukatpally, Zone 1'
    },
    maxCapacityTons: 120,
    currentWasteTons: 106.8, // 89% -> CRITICAL OVERFLOW
    fillPercentage: 89,
    status: 'OVERFLOW',
    priorityLevel: 'CRITICAL',
    lastUpdated: '5 mins ago',
    managerName: 'K. Rajeshwar Rao',
    managerId: 'MGR-KP-801',
    contactNumber: '+91 98490 12034'
  },
  {
    id: 'yard-ch-04',
    name: 'Charminar South Zonal Yard',
    zoneCode: 'CH-04',
    location: {
      lat: 17.3616,
      lng: 78.4747,
      address: 'Shahali Banda Road, Old City Basin, Charminar Zone 4'
    },
    maxCapacityTons: 100,
    currentWasteTons: 83.5, // 83.5% -> CRITICAL OVERFLOW
    fillPercentage: 83.5,
    status: 'OVERFLOW',
    priorityLevel: 'CRITICAL',
    lastUpdated: '12 mins ago',
    managerName: 'Mohammed Tariq',
    managerId: 'MGR-CH-412',
    contactNumber: '+91 98490 44521'
  },
  {
    id: 'yard-lb-03',
    name: 'LB Nagar East Transfer Yard',
    zoneCode: 'LB-03',
    location: {
      lat: 17.3578,
      lng: 78.5529,
      address: 'Inner Ring Road Cross, Kothapet - LB Nagar Zone 3'
    },
    maxCapacityTons: 110,
    currentWasteTons: 81.4, // 74% -> MODERATE
    fillPercentage: 74,
    status: 'MODERATE',
    priorityLevel: 'HIGH',
    lastUpdated: '18 mins ago',
    managerName: 'P. Venkat Reddy',
    managerId: 'MGR-LB-308',
    contactNumber: '+91 98490 89230'
  },
  {
    id: 'yard-sc-02',
    name: 'Secunderabad Junction Yard',
    zoneCode: 'SC-02',
    location: {
      lat: 17.4399,
      lng: 78.4983,
      address: 'Kalyan Nagar Logistics Hub, Secunderabad Zone 2'
    },
    maxCapacityTons: 130,
    currentWasteTons: 85.8, // 66% -> MODERATE
    fillPercentage: 66,
    status: 'MODERATE',
    priorityLevel: 'MEDIUM',
    lastUpdated: '25 mins ago',
    managerName: 'G. Sreenivas',
    managerId: 'MGR-SC-204',
    contactNumber: '+91 98490 67123'
  },
  {
    id: 'yard-hc-05',
    name: 'HITEC Cyber City Yard',
    zoneCode: 'HC-05',
    location: {
      lat: 17.4474,
      lng: 78.3762,
      address: 'Madhapur Bio-Diversity Parkway, Cyberabad Zone 5'
    },
    maxCapacityTons: 95,
    currentWasteTons: 42.75, // 45% -> NORMAL
    fillPercentage: 45,
    status: 'NORMAL',
    priorityLevel: 'LOW',
    lastUpdated: '40 mins ago',
    managerName: 'Anita Deshmukh',
    managerId: 'MGR-HC-591',
    contactNumber: '+91 98490 33902'
  },
  {
    id: 'yard-jh-06',
    name: 'Jubilee Hills Green Transfer Point',
    zoneCode: 'JH-06',
    location: {
      lat: 17.4319,
      lng: 78.4074,
      address: 'Road No. 36 Ecological Depot, Jubilee Hills Zone 6'
    },
    maxCapacityTons: 85,
    currentWasteTons: 28.9, // 34% -> NORMAL
    fillPercentage: 34,
    status: 'NORMAL',
    priorityLevel: 'LOW',
    lastUpdated: '1 hour ago',
    managerName: 'Sanjay Varma',
    managerId: 'MGR-JH-618',
    contactNumber: '+91 98490 55104'
  }
];

export const INITIAL_SMALL_TRUCK_LOGS: SmallTruckLog[] = [
  {
    id: 'log-001',
    yardId: 'yard-kp-01',
    vehicleRegNumber: 'TS-07-UB-1234',
    driverName: 'Ramu Naik',
    payloadTons: 4.8,
    wasteCategory: 'Wet',
    timestamp: '18:42:10 Today',
    managerId: 'MGR-KP-801',
    notes: 'Morning ward 12 kitchen waste round'
  },
  {
    id: 'log-002',
    yardId: 'yard-kp-01',
    vehicleRegNumber: 'TS-08-FA-5678',
    driverName: 'Mohan Lal',
    payloadTons: 3.9,
    wasteCategory: 'Dry',
    timestamp: '18:31:05 Today',
    managerId: 'MGR-KP-801',
    notes: 'Cardboard & paper packaging bundles'
  },
  {
    id: 'log-003',
    yardId: 'yard-ch-04',
    vehicleRegNumber: 'TS-09-GA-9012',
    driverName: 'Syed Arshad',
    payloadTons: 4.5,
    wasteCategory: 'Wet',
    timestamp: '18:22:40 Today',
    managerId: 'MGR-CH-412',
    notes: 'Vegetable market transit sweep'
  },
  {
    id: 'log-004',
    yardId: 'yard-ch-04',
    vehicleRegNumber: 'TS-10-KA-3456',
    driverName: 'Khaja Pasha',
    payloadTons: 2.1,
    wasteCategory: 'E-Waste / Hazardous',
    timestamp: '18:05:15 Today',
    managerId: 'MGR-CH-412',
    notes: 'Segregated electronics & tube-lights'
  },
  {
    id: 'log-005',
    yardId: 'yard-lb-03',
    vehicleRegNumber: 'TS-11-MA-7890',
    driverName: 'Krishna Das',
    payloadTons: 4.2,
    wasteCategory: 'Dry',
    timestamp: '17:50:00 Today',
    managerId: 'MGR-LB-308',
    notes: 'Residential society bulk pickup'
  },
  {
    id: 'log-006',
    yardId: 'yard-sc-02',
    vehicleRegNumber: 'TS-12-PA-2345',
    driverName: 'David Raju',
    payloadTons: 3.7,
    wasteCategory: 'Wet',
    timestamp: '17:35:12 Today',
    managerId: 'MGR-SC-204',
    notes: 'Cantonment residential sector 3'
  }
];

export const INITIAL_HYPOTHESIS_DATA: HypothesisDataPoint[] = [
  { day: 'Day 01', fixedRouteFuelLiters: 182, dynamicRouteFuelLiters: 144, fixedRouteCost: 21840, dynamicRouteCost: 17280, fixedOverflowIncidents: 4, dynamicOverflowIncidents: 0, savingsPercentage: 20.8 },
  { day: 'Day 02', fixedRouteFuelLiters: 195, dynamicRouteFuelLiters: 151, fixedRouteCost: 23400, dynamicRouteCost: 18120, fixedOverflowIncidents: 5, dynamicOverflowIncidents: 1, savingsPercentage: 22.5 },
  { day: 'Day 03', fixedRouteFuelLiters: 178, dynamicRouteFuelLiters: 139, fixedRouteCost: 21360, dynamicRouteCost: 16680, fixedOverflowIncidents: 3, dynamicOverflowIncidents: 0, savingsPercentage: 21.9 },
  { day: 'Day 04', fixedRouteFuelLiters: 205, dynamicRouteFuelLiters: 162, fixedRouteCost: 24600, dynamicRouteCost: 19440, fixedOverflowIncidents: 6, dynamicOverflowIncidents: 1, savingsPercentage: 20.9 },
  { day: 'Day 05', fixedRouteFuelLiters: 189, dynamicRouteFuelLiters: 148, fixedRouteCost: 22680, dynamicRouteCost: 17760, fixedOverflowIncidents: 4, dynamicOverflowIncidents: 0, savingsPercentage: 21.6 },
  { day: 'Day 06', fixedRouteFuelLiters: 210, dynamicRouteFuelLiters: 164, fixedRouteCost: 25200, dynamicRouteCost: 19680, fixedOverflowIncidents: 7, dynamicOverflowIncidents: 1, savingsPercentage: 21.9 },
  { day: 'Day 07', fixedRouteFuelLiters: 198, dynamicRouteFuelLiters: 155, fixedRouteCost: 23760, dynamicRouteCost: 18600, fixedOverflowIncidents: 5, dynamicOverflowIncidents: 0, savingsPercentage: 21.7 },
  { day: 'Day 08', fixedRouteFuelLiters: 184, dynamicRouteFuelLiters: 142, fixedRouteCost: 22080, dynamicRouteCost: 17040, fixedOverflowIncidents: 3, dynamicOverflowIncidents: 0, savingsPercentage: 22.8 },
  { day: 'Day 09', fixedRouteFuelLiters: 192, dynamicRouteFuelLiters: 150, fixedRouteCost: 23040, dynamicRouteCost: 18000, fixedOverflowIncidents: 4, dynamicOverflowIncidents: 0, savingsPercentage: 21.8 },
  { day: 'Day 10', fixedRouteFuelLiters: 204, dynamicRouteFuelLiters: 159, fixedRouteCost: 24480, dynamicRouteCost: 19080, fixedOverflowIncidents: 6, dynamicOverflowIncidents: 1, savingsPercentage: 22.0 },
  { day: 'Day 11', fixedRouteFuelLiters: 176, dynamicRouteFuelLiters: 138, fixedRouteCost: 21120, dynamicRouteCost: 16560, fixedOverflowIncidents: 3, dynamicOverflowIncidents: 0, savingsPercentage: 21.5 },
  { day: 'Day 12', fixedRouteFuelLiters: 215, dynamicRouteFuelLiters: 168, fixedRouteCost: 25800, dynamicRouteCost: 20160, fixedOverflowIncidents: 8, dynamicOverflowIncidents: 1, savingsPercentage: 21.8 },
  { day: 'Day 13', fixedRouteFuelLiters: 190, dynamicRouteFuelLiters: 147, fixedRouteCost: 22800, dynamicRouteCost: 17640, fixedOverflowIncidents: 4, dynamicOverflowIncidents: 0, savingsPercentage: 22.6 },
  { day: 'Day 14', fixedRouteFuelLiters: 187, dynamicRouteFuelLiters: 145, fixedRouteCost: 22440, dynamicRouteCost: 17400, fixedOverflowIncidents: 3, dynamicOverflowIncidents: 0, savingsPercentage: 22.4 }
];

export const LEVERAGE_SCENARIOS: LeverageScenario[] = [
  {
    id: 'sc-1',
    scenarioName: 'Standard Operations (Baseline Municipal Routine)',
    difficulty: 'Low',
    difficultyScore: 2,
    fuelImpact: 'Moderate',
    fuelImpactPercentage: 18.5,
    overflowMitigationScore: '99.4% Prevention',
    description: 'Evenly distributed waste generation across residential sub-wards with standard traffic flow.',
    bestStrategy: 'Batch single-pass Max-Heap priority dispatch queue.'
  },
  {
    id: 'sc-2',
    scenarioName: 'Localized Overflow Cluster (Monsoon / Weekend Market)',
    difficulty: 'Medium',
    difficultyScore: 5,
    fuelImpact: 'High',
    fuelImpactPercentage: 24.2,
    overflowMitigationScore: '98.1% Prevention',
    description: 'Extreme tonnage spikes (>85% fill) in Old City Charminar & Kukatpally fruit wholesale markets.',
    bestStrategy: 'Preemptive dynamic waypoint insertion with dual 20-Ton BigTruck dispatch.'
  },
  {
    id: 'sc-3',
    scenarioName: 'Peak Arterial Traffic Congestion (Cross-Metro Gridlock)',
    difficulty: 'High',
    difficultyScore: 8,
    fuelImpact: 'Extreme',
    fuelImpactPercentage: 31.0,
    overflowMitigationScore: '94.8% Prevention',
    description: 'Major arterial blockages along Outer Ring Road and Begumpet flyover extending travel time.',
    bestStrategy: 'Time-penalty weighted Dijkstra graph pathing prioritizing sub-arterials.'
  },
  {
    id: 'sc-4',
    scenarioName: 'Festival Waste Surge (Diwali / Ganesh Immersion Blitz)',
    difficulty: 'High',
    difficultyScore: 9,
    fuelImpact: 'Extreme',
    fuelImpactPercentage: 34.6,
    overflowMitigationScore: '96.2% Prevention',
    description: 'Simultaneous 3x surge across all 6 zonal transfer stations within a 12-hour window.',
    bestStrategy: 'Continuous round-robin Max-Heap with real-time payload offloading triggers.'
  }
];

export const OOP_CLASSES: OOPClassDefinition[] = [
  {
    className: 'Truck',
    isAbstract: true,
    description: 'Abstract base entity establishing core vehicular attributes, GPS telematics, and polymorphic discharge contracts.',
    attributes: [
      { name: 'registrationNumber', type: 'string', visibility: 'protected', description: 'Unique regional transport registration identifier' },
      { name: 'maxPayloadCapacityTons', type: 'number', visibility: 'protected', description: 'Maximum structural tare weight load limit' },
      { name: 'currentPayloadTons', type: 'number', visibility: 'protected', description: 'Current onboard waste tonnage' },
      { name: 'fuelEfficiencyKmPerLiter', type: 'number', visibility: 'protected', description: 'Engine fuel consumption baseline' }
    ],
    methods: [
      { name: 'loadWaste(tonnage: number)', returns: 'boolean', parameters: ['tonnage: number'], description: 'Validates and increments payload within structural payload thresholds' },
      { name: 'emptyWaste()', returns: 'number', parameters: [], description: 'Abstract polymorphic method executing unloading sequence at disposal site' },
      { name: 'calculateFuelCost(distanceKm: number)', returns: 'number', parameters: ['distanceKm: number'], description: 'Evaluates algebraic trip fuel expenditure' }
    ],
    polymorphicBehavior: 'Both SmallTruck and BigTruck inherit Truck but override emptyWaste() and payload verification according to distinct hydraulic equipment.',
    codeSnippet: `// Abstract Base Vehicle Class
export abstract class Truck {
  protected registrationNumber: string;
  protected maxPayloadCapacityTons: number;
  protected currentPayloadTons: number = 0;
  protected fuelEfficiencyKmPerLiter: number;

  constructor(regNum: string, maxCapacity: number, fuelEfficiency: number) {
    this.registrationNumber = regNum;
    this.maxPayloadCapacityTons = maxCapacity;
    this.fuelEfficiencyKmPerLiter = fuelEfficiency;
  }

  public loadWaste(tonnage: number): boolean {
    if (this.currentPayloadTons + tonnage > this.maxPayloadCapacityTons) {
      throw new Error(\`Overload error: exceeds \${this.maxPayloadCapacityTons} tons capacity.\`);
    }
    this.currentPayloadTons += tonnage;
    return true;
  }

  // Pure virtual method (Polymorphism)
  public abstract emptyWaste(): number;

  public calculateFuelCost(distanceKm: number, fuelRatePerLiter: number = 95): number {
    const litersNeeded = distanceKm / this.fuelEfficiencyKmPerLiter;
    return litersNeeded * fuelRatePerLiter;
  }
}`
  },
  {
    className: 'SmallTruck',
    parentClass: 'Truck',
    description: 'Localized door-to-door municipal collection vehicle designed for narrow urban lanes (5-Ton max capacity).',
    attributes: [
      { name: 'assignedWardSector', type: 'string', visibility: 'private', description: 'Designated ward sub-sector for door-to-door collection' },
      { name: 'wasteCategory', type: 'WasteCategory', visibility: 'private', description: 'Wet, Dry, or Hazardous segregation partition' }
    ],
    methods: [
      { name: 'emptyWaste()', returns: 'number', parameters: [], description: 'Discharges payload directly into designated Zonal Transfer Yard pit' },
      { name: 'recordWeighbridgeLog()', returns: 'SmallTruckLog', parameters: [], description: 'Emits cryptographically signed digital payload ticket' }
    ],
    polymorphicBehavior: 'Overrides emptyWaste() to offload at local Zonal Transfer Yards with hopper tipping gears.',
    codeSnippet: `// Local Door-to-Door Municipal Vehicle (5 Ton Limit)
export class SmallTruck extends Truck {
  private assignedWardSector: string;
  private wasteCategory: 'Wet' | 'Dry' | 'E-Waste / Hazardous';

  constructor(regNum: string, ward: string, category: 'Wet' | 'Dry' | 'E-Waste / Hazardous') {
    super(regNum, 5.0, 6.5); // 5 Tons max, 6.5 km/L
    this.assignedWardSector = ward;
    this.wasteCategory = category;
  }

  public override emptyWaste(): number {
    const dischargedWeight = this.currentPayloadTons;
    console.log(\`[SmallTruck] Offloading \${dischargedWeight}T of \${this.wasteCategory} waste at Zonal Yard pit.\`);
    this.currentPayloadTons = 0;
    return dischargedWeight;
  }
}`
  },
  {
    className: 'BigTruck',
    parentClass: 'Truck',
    description: 'Heavy multi-axle bulk transfer carrier with hydraulic compactor designed for inter-station transit (20-Ton max capacity).',
    attributes: [
      { name: 'compactorCompactionRatio', type: 'number', visibility: 'private', description: 'Volumetric compaction density multiplier (3.2x)' },
      { name: 'activeTransferManifest', type: 'string[]', visibility: 'private', description: 'Array of visited zonal yard dispatch tickets' }
    ],
    methods: [
      { name: 'emptyWaste()', returns: 'number', parameters: [], description: 'Executes high-tonnage hydraulic ejection at Jawaharnagar Mega Landfill' },
      { name: 'loadFromZonalYard(tons: number)', returns: 'boolean', parameters: ['tons: number'], description: 'Multi-stop bulk loading while updating compaction load' }
    ],
    polymorphicBehavior: 'Overrides emptyWaste() to interface with the Main Landfill Waste-to-Energy incinerator conveyor.',
    codeSnippet: `// Inter-Station Heavy Transfer Carrier (20 Ton Limit)
export class BigTruck extends Truck {
  private compactorCompactionRatio: number = 3.2;
  private activeTransferManifest: string[] = [];

  constructor(regNum: string) {
    super(regNum, 20.0, 3.2); // 20 Tons max, 3.2 km/L
  }

  public override emptyWaste(): number {
    const bulkDischarged = this.currentPayloadTons;
    console.log(\`[BigTruck \${this.registrationNumber}] Hydraulic ejection: \${bulkDischarged}T processed at Jawaharnagar.\`);
    this.currentPayloadTons = 0;
    this.activeTransferManifest = [];
    return bulkDischarged;
  }
}`
  },
  {
    className: 'ZoneManager',
    description: 'Supervisory controller representing a Zonal Yard supervisor managing weighbridge intake, capacity gauges, and dispatch alerts.',
    attributes: [
      { name: 'managerId', type: 'string', visibility: 'public', description: 'Employee credential badge identifier' },
      { name: 'yardReference', type: 'ZonalDumpYard', visibility: 'private', description: 'Associated physical municipal transfer yard' }
    ],
    methods: [
      { name: 'logIncomingSmallTruck(truck: SmallTruck)', returns: 'SmallTruckLog', parameters: ['truck: SmallTruck'], description: 'Logs incoming small truck, increments yard tonnage, and checks overflow' },
      { name: 'checkOverflowAlert()', returns: 'boolean', parameters: [], description: 'Triggers alert flag when capacity >= 80%' }
    ],
    codeSnippet: `// Zonal Yard Supervisory Entity
export class ZoneManager {
  public managerId: string;
  private yard: ZonalDumpYard;

  constructor(id: string, yard: ZonalDumpYard) {
    this.managerId = id;
    this.yard = yard;
  }

  public logSmallTruckPayload(weightTons: number): void {
    this.yard.currentWasteTons += weightTons;
    this.yard.fillPercentage = Math.round((this.yard.currentWasteTons / this.yard.maxCapacityTons) * 100);
    if (this.yard.fillPercentage >= 80) {
      this.yard.status = 'OVERFLOW';
      this.yard.priorityLevel = 'CRITICAL';
      this.dispatchOverflowAlert();
    }
  }

  private dispatchOverflowAlert(): void {
    console.warn(\`🚨 OVERFLOW DISPATCH TRIGGER: \${this.yard.name} is at \${this.yard.fillPercentage}%!\`);
  }
}`
  },
  {
    className: 'CollectionManager',
    description: 'Central fleet operations coordinator utilizing the MaxHeap priority queue to schedule BigTruck dispatch across Hyderabad.',
    attributes: [
      { name: 'priorityQueue', type: 'MaxHeap<ZonalDumpYard>', visibility: 'private', description: 'Binary Max-Heap maintained by yard fill percentage' },
      { name: 'availableBigTruckFleet', type: 'BigTruck[]', visibility: 'private', description: 'Pool of heavy transfer vehicles' }
    ],
    methods: [
      { name: 'rebuildHeap(yards: ZonalDumpYard[])', returns: 'void', parameters: ['yards: ZonalDumpYard[]'], description: 'Re-indexes priority queue in O(N) heapify time' },
      { name: 'popHighestPriorityYard()', returns: 'ZonalDumpYard | null', parameters: [], description: 'Pulls the most critical overflow station in O(log N)' }
    ],
    codeSnippet: `// Central Municipal Fleet Logistics Coordinator
export class CollectionManager {
  private priorityQueue: MaxHeap<ZonalDumpYard>;
  private bigTrucks: BigTruck[] = [];

  constructor() {
    this.priorityQueue = new MaxHeap<ZonalDumpYard>((a, b) => a.fillPercentage - b.fillPercentage);
  }

  public syncYardPriorities(yards: ZonalDumpYard[]): void {
    this.priorityQueue.buildHeap(yards);
  }

  public getDispatchRecommendations(topN: number = 3): ZonalDumpYard[] {
    const candidates: ZonalDumpYard[] = [];
    const tempHeap = this.priorityQueue.clone();
    while (!tempHeap.isEmpty() && candidates.length < topN) {
      const top = tempHeap.extractMax();
      if (top) candidates.push(top);
    }
    return candidates;
  }
}`
  }
];
