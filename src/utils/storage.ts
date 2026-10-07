import {
  ZonalDumpYard,
  MainDumpYard,
  SmallTruckLog,
  BigTruckTransfer,
  PriorityLevel,
  YardStatus
} from '../types';
import {
  INITIAL_ZONAL_YARDS,
  MAIN_DUMP_YARD,
  INITIAL_SMALL_TRUCK_LOGS
} from '../data/mockData';

const STORAGE_KEYS = {
  YARDS: 'cleantrack_zonal_yards_v1',
  MAIN_YARD: 'cleantrack_main_yard_v1',
  LOGS: 'cleantrack_small_truck_logs_v1',
  TRANSFERS: 'cleantrack_transfers_v1',
  ROLE: 'cleantrack_active_role_v1',
  LAST_ALERT: 'cleantrack_last_alert_v1'
};

const SIMULATED_LATENCY_MS = 150;

const delay = (ms: number = SIMULATED_LATENCY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function computePriorityAndStatus(fillPercentage: number): {
  status: YardStatus;
  priorityLevel: PriorityLevel;
} {
  if (fillPercentage >= 80) {
    return { status: 'OVERFLOW', priorityLevel: 'CRITICAL' };
  } else if (fillPercentage >= 50) {
    return { status: 'MODERATE', priorityLevel: fillPercentage >= 70 ? 'HIGH' : 'MEDIUM' };
  } else {
    return { status: 'NORMAL', priorityLevel: 'LOW' };
  }
}

export const StorageService = {
  async getYards(): Promise<ZonalDumpYard[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.YARDS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.YARDS, JSON.stringify(INITIAL_ZONAL_YARDS));
      return [...INITIAL_ZONAL_YARDS];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [...INITIAL_ZONAL_YARDS];
    }
  },

  async getMainYard(): Promise<MainDumpYard> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.MAIN_YARD);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.MAIN_YARD, JSON.stringify(MAIN_DUMP_YARD));
      return { ...MAIN_DUMP_YARD };
    }
    try {
      return JSON.parse(data);
    } catch {
      return { ...MAIN_DUMP_YARD };
    }
  },

  async getSmallTruckLogs(): Promise<SmallTruckLog[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_SMALL_TRUCK_LOGS));
      return [...INITIAL_SMALL_TRUCK_LOGS];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [...INITIAL_SMALL_TRUCK_LOGS];
    }
  },

  async getTransfers(): Promise<BigTruckTransfer[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  async logSmallTruckEntry(
    logData: Omit<SmallTruckLog, 'id' | 'timestamp'>
  ): Promise<{ updatedYard: ZonalDumpYard; newLog: SmallTruckLog; isOverflowTriggered: boolean }> {
    await delay();
    const yards = await this.getYards();
    const logs = await this.getSmallTruckLogs();

    const targetYardIndex = yards.findIndex((y) => y.id === logData.yardId);
    if (targetYardIndex === -1) {
      throw new Error(`Zonal Yard not found: ${logData.yardId}`);
    }

    const yard = { ...yards[targetYardIndex] };
    const prevFill = yard.fillPercentage;

    // Automatic Capacity Math: Increment waste tonnage & calculate new percentage
    const updatedWaste = Number((yard.currentWasteTons + logData.payloadTons).toFixed(2));
    const rawFill = (updatedWaste / yard.maxCapacityTons) * 100;
    const updatedFill = Number(Math.min(100, Math.max(0, rawFill)).toFixed(1));

    const { status, priorityLevel } = computePriorityAndStatus(updatedFill);

    yard.currentWasteTons = updatedWaste;
    yard.fillPercentage = updatedFill;
    yard.status = status;
    yard.priorityLevel = priorityLevel;
    yard.lastUpdated = 'Just now';

    yards[targetYardIndex] = yard;
    localStorage.setItem(STORAGE_KEYS.YARDS, JSON.stringify(yards));

    // Create new log record
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} Today`;

    const newLog: SmallTruckLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...logData,
      timestamp: timeString
    };

    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));

    const isOverflowTriggered = prevFill < 80 && updatedFill >= 80;
    if (isOverflowTriggered) {
      localStorage.setItem(
        STORAGE_KEYS.LAST_ALERT,
        JSON.stringify({
          yardName: yard.name,
          fillPercentage: updatedFill,
          timestamp: timeString
        })
      );
    }

    return { updatedYard: yard, newLog, isOverflowTriggered };
  },

  async recordBigTruckTransfer(
    transfer: Omit<BigTruckTransfer, 'id' | 'completedAt' | 'status'>
  ): Promise<{ updatedYards: ZonalDumpYard[]; updatedMainYard: MainDumpYard; transferRecord: BigTruckTransfer }> {
    await delay();
    const yards = await this.getYards();
    const mainYard = await this.getMainYard();
    const transfers = await this.getTransfers();

    let totalEmptiedTons = 0;

    // Empty visited yards (clear waste tonnage down to healthy baseline ~12-18%)
    const updatedYards = yards.map((yard) => {
      if (transfer.selectedYardIds.includes(yard.id)) {
        const removed = yard.currentWasteTons * 0.85; // Transfer 85% of bulk waste
        totalEmptiedTons += removed;
        const remainingWaste = Number((yard.currentWasteTons - removed).toFixed(2));
        const newFill = Number(((remainingWaste / yard.maxCapacityTons) * 100).toFixed(1));
        const { status, priorityLevel } = computePriorityAndStatus(newFill);

        return {
          ...yard,
          currentWasteTons: remainingWaste,
          fillPercentage: newFill,
          status,
          priorityLevel,
          lastUpdated: 'Transferred by Big Truck'
        };
      }
      return yard;
    });

    // Update main dump yard intake
    mainYard.currentWasteTons = Number(
      (mainYard.currentWasteTons + totalEmptiedTons).toFixed(2)
    );

    const now = new Date();
    const completedAt = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} Today`;

    const transferRecord: BigTruckTransfer = {
      id: `trf-${Date.now()}`,
      ...transfer,
      totalCollectedTons: Number(totalEmptiedTons.toFixed(2)),
      completedAt,
      status: 'COMPLETED'
    };

    transfers.unshift(transferRecord);

    localStorage.setItem(STORAGE_KEYS.YARDS, JSON.stringify(updatedYards));
    localStorage.setItem(STORAGE_KEYS.MAIN_YARD, JSON.stringify(mainYard));
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));

    return { updatedYards, updatedMainYard: mainYard, transferRecord };
  },

  async resetDemoSystem(): Promise<void> {
    await delay();
    localStorage.setItem(STORAGE_KEYS.YARDS, JSON.stringify(INITIAL_ZONAL_YARDS));
    localStorage.setItem(STORAGE_KEYS.MAIN_YARD, JSON.stringify(MAIN_DUMP_YARD));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_SMALL_TRUCK_LOGS));
    localStorage.removeItem(STORAGE_KEYS.TRANSFERS);
    localStorage.removeItem(STORAGE_KEYS.LAST_ALERT);
  }
};
