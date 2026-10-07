import React, { useState, useEffect } from 'react';
import { Header, ActiveRole } from './components/Header';
import { ZonalManagerView } from './views/ZonalManagerView';
import { DriverPortalView } from './views/DriverPortalView';
import { AnalyticsLabView } from './views/AnalyticsLabView';
import { StorageService } from './utils/storage';
import {
  ZonalDumpYard,
  MainDumpYard,
  SmallTruckLog,
  DriverLocation,
  BigTruckTransfer
} from './types';
import {
  INITIAL_DRIVER_LOCATION,
  INITIAL_ZONAL_YARDS,
  MAIN_DUMP_YARD,
  INITIAL_SMALL_TRUCK_LOGS
} from './data/mockData';
import { getDeviceGeolocation } from './utils/geolocation';
import { AlertTriangle, CheckCircle, ShieldCheck, Truck, Sparkles, MapPin } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation Role State (supports hash-based routing: #zonal-manager, #truck-driver, #analytics)
  const [activeRole, setActiveRole] = useState<ActiveRole>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'truck-driver' || hash === 'analytics' || hash === 'zonal-manager') {
      return hash as ActiveRole;
    }
    return 'zonal-manager';
  });

  // Data States
  const [yards, setYards] = useState<ZonalDumpYard[]>(INITIAL_ZONAL_YARDS);
  const [mainYard, setMainYard] = useState<MainDumpYard>(MAIN_DUMP_YARD);
  const [logs, setLogs] = useState<SmallTruckLog[]>(INITIAL_SMALL_TRUCK_LOGS);
  const [selectedYardId, setSelectedYardId] = useState<string>(INITIAL_ZONAL_YARDS[0].id);
  const [driverLocation, setDriverLocation] = useState<DriverLocation>(INITIAL_DRIVER_LOCATION);
  const [isAcquiringLocation, setIsAcquiringLocation] = useState<boolean>(false);

  // Loading & Action States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isSubmittingLog, setIsSubmittingLog] = useState<boolean>(false);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [globalBanner, setGlobalBanner] = useState<{ message: string; type: 'alert' | 'success' } | null>(
    null
  );

  // Sync hash when role changes
  const handleRoleChange = (role: ActiveRole) => {
    setActiveRole(role);
    window.location.hash = role;
  };

  // Listen to browser hash changes
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'truck-driver' || hash === 'analytics' || hash === 'zonal-manager') {
        setActiveRole(hash as ActiveRole);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Initial load from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [loadedYards, loadedMainYard, loadedLogs] = await Promise.all([
          StorageService.getYards(),
          StorageService.getMainYard(),
          StorageService.getSmallTruckLogs()
        ]);
        setYards(loadedYards);
        setMainYard(loadedMainYard);
        setLogs(loadedLogs);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle logging a new small truck
  const handleLogSmallTruck = async (
    logData: Omit<SmallTruckLog, 'id' | 'timestamp'>
  ) => {
    setIsSubmittingLog(true);
    try {
      const { updatedYard, newLog, isOverflowTriggered } =
        await StorageService.logSmallTruckEntry(logData);

      setYards((prev) =>
        prev.map((y) => (y.id === updatedYard.id ? updatedYard : y))
      );
      setLogs((prev) => [newLog, ...prev]);

      if (isOverflowTriggered) {
        setGlobalBanner({
          type: 'alert',
          message: `🚨 Critical Dispatch Notice: ${updatedYard.name} reached ${updatedYard.fillPercentage}% capacity! Automatic notification dispatched to Big Truck transfer fleet.`
        });
      }

      return { updatedYard, isOverflowTriggered };
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Handle big truck transfer dispatch
  const handleExecuteTransfer = async (
    transfer: Omit<BigTruckTransfer, 'id' | 'completedAt' | 'status'>
  ) => {
    setIsTransferring(true);
    try {
      const { updatedYards, updatedMainYard, transferRecord } =
        await StorageService.recordBigTruckTransfer(transfer);

      setYards(updatedYards);
      setMainYard(updatedMainYard);

      setGlobalBanner({
        type: 'success',
        message: `✅ Transfer Complete! BigTruck collected bulk waste from ${transfer.selectedYardIds.length} stations and offloaded at ${updatedMainYard.name}.`
      });

      return { updatedYards, updatedMainYard };
    } finally {
      setIsTransferring(false);
    }
  };

  // Use Live Device Geolocation as Starting Point
  const handleUseDeviceLocation = async () => {
    setIsAcquiringLocation(true);
    try {
      const deviceLoc = await getDeviceGeolocation();
      setDriverLocation(deviceLoc);
      setGlobalBanner({
        type: 'success',
        message: `📍 Route starting point updated to your device location: ${deviceLoc.address}!`
      });
    } catch (err: any) {
      alert(err?.message || 'Could not acquire device location.');
      setGlobalBanner({
        type: 'alert',
        message: err?.message || 'Failed to acquire device location. Please allow browser location permissions.'
      });
    } finally {
      setIsAcquiringLocation(false);
    }
  };

  // Reset Starting Point to Fleet Depot
  const handleResetDepotLocation = () => {
    setDriverLocation(INITIAL_DRIVER_LOCATION);
    setGlobalBanner({
      type: 'success',
      message: 'Route origin restored to GHMC Fleet Depot (Sanath Nagar).'
    });
  };

  // Reset Demo System
  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demo data back to default Greater Hyderabad seed state?')) {
      return;
    }
    setIsResetting(true);
    try {
      await StorageService.resetDemoSystem();
      setYards(INITIAL_ZONAL_YARDS);
      setMainYard(MAIN_DUMP_YARD);
      setLogs(INITIAL_SMALL_TRUCK_LOGS);
      setSelectedYardId(INITIAL_ZONAL_YARDS[0].id);
      setDriverLocation(INITIAL_DRIVER_LOCATION);
      setGlobalBanner({
        type: 'success',
        message: 'System demo reset successfully to initial state.'
      });
    } finally {
      setIsResetting(false);
    }
  };

  const overflowCount = yards.filter((y) => y.fillPercentage >= 80).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800">
      {/* Top Header */}
      <Header
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        yards={yards}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Global Alert Notification Bar if there are active overflows */}
      {overflowCount > 0 && (
        <div className="bg-red-600 text-white text-xs font-semibold py-2 px-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 animate-bounce flex-shrink-0" />
              <span>
                <strong>MUNICIPAL OVERFLOW ALERT:</strong> {overflowCount} zonal transfer station(s) currently exceed 80% capacity limit. Immediate BigTruck transfer dispatch advised.
              </span>
            </div>
            {activeRole !== 'truck-driver' && (
              <button
                onClick={() => handleRoleChange('truck-driver')}
                className="bg-white text-red-700 px-3 py-1 rounded-lg text-[11px] font-bold hover:bg-slate-100 transition whitespace-nowrap"
              >
                Open Driver Dispatch &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Transient Global Banner */}
      {globalBanner && (
        <div
          className={`py-2.5 px-4 text-xs font-medium border-b flex items-center justify-between ${
            globalBanner.type === 'alert'
              ? 'bg-red-50 text-red-900 border-red-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span>{globalBanner.message}</span>
            <button
              onClick={() => setGlobalBanner(null)}
              className="font-bold underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
          </div>
        ) : (
          <>
            {activeRole === 'zonal-manager' && (
              <ZonalManagerView
                yards={yards}
                selectedYardId={selectedYardId}
                onSelectYardId={setSelectedYardId}
                logs={logs}
                onLogSmallTruck={handleLogSmallTruck}
                isSubmitting={isSubmittingLog}
              />
            )}

            {activeRole === 'truck-driver' && (
              <DriverPortalView
                yards={yards}
                mainYard={mainYard}
                driverLocation={driverLocation}
                onExecuteTransfer={handleExecuteTransfer}
                isTransferring={isTransferring}
                onUseDeviceLocation={handleUseDeviceLocation}
                onResetDepotLocation={handleResetDepotLocation}
                isAcquiringLocation={isAcquiringLocation}
              />
            )}

            {activeRole === 'analytics' && <AnalyticsLabView />}
          </>
        )}
      </main>

      {/* Enterprise Municipal Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
              CT
            </div>
            <div>
              <span className="font-bold text-slate-800">CleanTrack Municipal Waste Logistics</span>
              <p className="text-[11px] text-slate-400">
                Greater Hyderabad Municipal Corporation (GHMC) • Smart Route Optimization Platform
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
              Engine: MaxHeap O(log N)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
              Routing: TSP Nearest Neighbor & Google Maps API
            </span>
            <span className="text-slate-400">
              CleanTrack v1.0.0 Enterprise Release
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
