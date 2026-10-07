import React, { useState, useMemo } from 'react';
import {
  Truck,
  Route,
  Navigation,
  Fuel,
  Clock,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Sliders,
  Compass,
  ArrowRight,
  ShieldAlert,
  Layers,
  MapPin
} from 'lucide-react';
import {
  ZonalDumpYard,
  MainDumpYard,
  DriverLocation,
  RouteMetrics,
  BigTruckTransfer
} from '../types';
import { MaxHeap } from '../utils/maxHeap';
import {
  computeRouteMetrics,
  estimateRoadDistanceKm,
  formatINR,
  CONSTANTS
} from '../utils/costCalculator';
import { MapContainer } from '../components/MapContainer';

interface DriverPortalViewProps {
  yards: ZonalDumpYard[];
  mainYard: MainDumpYard;
  driverLocation: DriverLocation;
  onExecuteTransfer: (
    transfer: Omit<BigTruckTransfer, 'id' | 'completedAt' | 'status'>
  ) => Promise<{ updatedYards: ZonalDumpYard[]; updatedMainYard: MainDumpYard }>;
  isTransferring: boolean;
  onUseDeviceLocation?: () => void;
  onResetDepotLocation?: () => void;
  isAcquiringLocation?: boolean;
}

export const DriverPortalView: React.FC<DriverPortalViewProps> = ({
  yards,
  mainYard,
  driverLocation,
  onExecuteTransfer,
  isTransferring,
  onUseDeviceLocation,
  onResetDepotLocation,
  isAcquiringLocation = false
}) => {
  // Max-Heap: dynamically heapified by fillPercentage descending
  const sortedYards = useMemo(() => {
    const heap = new MaxHeap<ZonalDumpYard>((a, b) => a.fillPercentage - b.fillPercentage, yards);
    return heap.toSortedArray();
  }, [yards]);

  // Selected yards for route optimization
  // Default to pre-selecting the critical overflow yards
  const [selectedYardIds, setSelectedYardIds] = useState<string[]>(() => {
    const overflowYards = yards.filter((y) => y.fillPercentage >= 80).map((y) => y.id);
    return overflowYards.length > 0 ? overflowYards : [yards[0]?.id || ''];
  });

  // Cost Equation Parameters (Session 8 equation)
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(
    CONSTANTS.DEFAULT_FUEL_PRICE_PER_LITER
  );
  const [timePenaltyPerOverflow, setTimePenaltyPerOverflow] = useState<number>(
    CONSTANTS.DEFAULT_OVERFLOW_TIME_PENALTY
  );
  const [showEquationSliders, setShowEquationSliders] = useState<boolean>(false);
  const [transferSuccessMessage, setTransferSuccessMessage] = useState<string | null>(null);

  // Selected yards objects
  const selectedYards = useMemo(() => {
    return yards.filter((y) => selectedYardIds.includes(y.id));
  }, [yards, selectedYardIds]);

  // Route metrics derived from selection and algorithm
  const routeMetrics = useMemo(() => {
    return computeRouteMetrics(
      driverLocation,
      selectedYards,
      mainYard,
      fuelPricePerLiter,
      timePenaltyPerOverflow
    );
  }, [driverLocation, selectedYards, mainYard, fuelPricePerLiter, timePenaltyPerOverflow]);

  const toggleYardSelection = (id: string) => {
    setSelectedYardIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setTransferSuccessMessage(null);
  };

  const selectAllOverflow = () => {
    const overflowIds = yards.filter((y) => y.fillPercentage >= 80).map((y) => y.id);
    setSelectedYardIds(overflowIds);
    setTransferSuccessMessage(null);
  };

  const selectAllYards = () => {
    setSelectedYardIds(yards.map((y) => y.id));
    setTransferSuccessMessage(null);
  };

  const handleDispatch = async () => {
    if (selectedYardIds.length === 0 || !routeMetrics) return;

    try {
      const result = await onExecuteTransfer({
        truckRegNumber: 'TS-09-TRANSFER-9901',
        driverName: 'Mohd. Rafiq (Transfer Unit A)',
        selectedYardIds,
        totalCollectedTons: 0, // will be computed in storage service
        distanceKm: routeMetrics.totalDistanceKm,
        travelTimeMins: routeMetrics.estimatedTravelTimeMins,
        fuelConsumedLiters: routeMetrics.fuelConsumedLiters,
        overflowCount: routeMetrics.overflowCount,
        calculatedCost: routeMetrics.totalCost
      });

      setTransferSuccessMessage(
        `✅ Transfer Mission Executed! BigTruck collected bulk waste from ${selectedYardIds.length} stations and delivered payload to ${mainYard.name}. Visited stations reset to healthy safe operating thresholds!`
      );
      // Reset selection
      setSelectedYardIds([]);
    } catch (err: any) {
      alert(err?.message || 'Error executing transfer');
    }
  };

  const criticalOverflowCount = yards.filter((y) => y.fillPercentage >= 80).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Driver Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 skew-x-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-3">
              <Truck className="w-3.5 h-3.5" />
              <span>Heavy Vehicle Unit • 20-Ton Hydraulic Compactor Carrier</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Big Truck Driver Dispatch & Route Optimizer
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl">
              Live priority queue backed by custom <span className="text-emerald-400 font-mono font-bold">MaxHeap</span> binary sorting.
              Dynamically select high-overflow transfer points and evaluate fuel-optimized multi-stop trajectories ending at Jawaharnagar Mega Landfill.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {criticalOverflowCount > 0 && (
              <button
                onClick={selectAllOverflow}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <ShieldAlert className="w-4 h-4 animate-bounce" />
                <span>Auto-Select {criticalOverflowCount} Overflow Station(s)</span>
              </button>
            )}

            <button
              onClick={() => setShowEquationSliders(!showEquationSliders)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>{showEquationSliders ? 'Hide Cost Modifiers' : 'Cost Equation Variables'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Cost Equation Modifiers Drawer */}
        {showEquationSliders && (
          <div className="mt-6 pt-6 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/60 p-5 rounded-2xl">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Fuel Price Per Liter (Diesel):</span>
                <span className="font-mono font-bold text-emerald-400">₹{fuelPricePerLiter}/L</span>
              </div>
              <input
                type="range"
                min="70"
                max="130"
                step="1"
                value={fuelPricePerLiter}
                onChange={(e) => setFuelPricePerLiter(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                BigTruck baseline fuel efficiency: 3.2 km/L (~₹{(fuelPricePerLiter / 3.2).toFixed(2)}/km)
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Overflow Time Penalty:</span>
                <span className="font-mono font-bold text-amber-400">₹{timePenaltyPerOverflow} / incident</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={timePenaltyPerOverflow}
                onChange={(e) => setTimePenaltyPerOverflow(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Session 8 Environmental & municipal idle spill penalty assessed per active overflow
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Route Starting Point / Device GPS Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
              driverLocation.isDeviceLocation
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-4 ring-blue-100'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <MapPin
              className={`w-5 h-5 ${
                driverLocation.isDeviceLocation ? 'animate-bounce' : 'text-slate-500'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Route Origin / Starting Point
              </span>
              {driverLocation.isDeviceLocation ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                  Live Device GPS {driverLocation.accuracyMeters ? `(±${driverLocation.accuracyMeters}m)` : ''}
                </span>
              ) : (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Default Base
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
              {driverLocation.isDeviceLocation
                ? 'Current Device Geolocation (GPS)'
                : 'GHMC Central Heavy Fleet Depot (Sanath Nagar)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              {driverLocation.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {driverLocation.isDeviceLocation ? (
            <button
              onClick={onResetDepotLocation}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition active:scale-95 shadow-xs"
            >
              Reset to Fleet Depot
            </button>
          ) : (
            <button
              onClick={onUseDeviceLocation}
              disabled={isAcquiringLocation}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 ${isAcquiringLocation ? 'animate-spin' : ''}`} />
              <span>{isAcquiringLocation ? 'Acquiring GPS Signal...' : '📍 Take Location From Device'}</span>
            </button>
          )}
        </div>
      </div>

      {transferSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{transferSuccessMessage}</span>
          </div>
          <button
            onClick={() => setTransferSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left = Max-Heap Prioritized Queue (5 Cols), Right = GIS Map & Route Metrics (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Max-Heap Prioritized Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-base font-bold text-slate-900">
                    Max-Heap Prioritized Dispatch Queue
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordered dynamically in descending order by station fill percentage.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllYards}
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => setSelectedYardIds([])}
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Heap Queue Cards */}
            <div className="mt-4 space-y-3">
              {sortedYards.map((yard, idx) => {
                const isSelected = selectedYardIds.includes(yard.id);
                const isOverflow = yard.fillPercentage >= 80;
                const isModerate = yard.fillPercentage >= 50 && yard.fillPercentage < 80;
                const distFromDriver = estimateRoadDistanceKm(driverLocation, yard.location);

                return (
                  <div
                    key={yard.id}
                    onClick={() => toggleYardSelection(yard.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent onClick
                          className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black font-mono text-slate-400">
                              #{idx + 1}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm">{yard.name}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Zone: {yard.zoneCode} • {distFromDriver} km from Depot
                          </p>
                        </div>
                      </div>

                      {/* Priority Badge */}
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isOverflow
                            ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                            : isModerate
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {yard.priorityLevel}
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span
                          className={
                            isOverflow
                              ? 'text-red-700'
                              : isModerate
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }
                        >
                          {yard.fillPercentage}% Capacity
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {yard.currentWasteTons} / {yard.maxCapacityTons} Tons
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverflow
                              ? 'bg-red-500'
                              : isModerate
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, yard.fillPercentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: GIS Map, Routing Engine & Session 8 Cost Summary */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive GIS Map */}
          <MapContainer
            driverLocation={driverLocation}
            yards={yards}
            selectedYardIds={selectedYardIds}
            mainYard={mainYard}
            routeMetrics={routeMetrics}
            onSelectYard={toggleYardSelection}
            onUseDeviceLocation={onUseDeviceLocation}
            onResetDepotLocation={onResetDepotLocation}
            isAcquiringLocation={isAcquiringLocation}
          />

          {/* Route Optimization & Cost Calculation Panel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Route className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Multi-Stop Route Analysis & Session 8 Cost Metrics
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Path: {driverLocation.isDeviceLocation ? 'Device GPS' : 'Depot'} &rarr;{' '}
                  {selectedYards.length} Zonal Stops &rarr; Jawaharnagar Mega Landfill
                </p>
              </div>

              {selectedYards.length > 0 && (
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  Shortest TSP Waypoint Sequence Active
                </span>
              )}
            </div>

            {selectedYards.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Target Yards Selected</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Pick one or more stations from the Max-Heap queue to generate an optimized transfer route and calculate fuel expenditure.
                </p>
              </div>
            ) : (
              <>
                {/* 4 Core Route Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
                    <span className="text-slate-400 block text-[11px] font-bold uppercase">
                      Total Distance
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
                      {routeMetrics.totalDistanceKm} km
                    </span>
                    <span className="text-[10px] text-slate-500">Optimized Driving Leg</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
                    <span className="text-slate-400 block text-[11px] font-bold uppercase">
                      Travel Time
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
                      {routeMetrics.estimatedTravelTimeMins} min
                    </span>
                    <span className="text-[10px] text-slate-500">Incl. Weighbridge Dwell</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
                    <span className="text-slate-400 block text-[11px] font-bold uppercase">
                      Fuel Consumed
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5 block">
                      {routeMetrics.fuelConsumedLiters} L
                    </span>
                    <span className="text-[10px] text-slate-500">@ 3.2 km/L BigTruck</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
                    <span className="text-slate-400 block text-[11px] font-bold uppercase">
                      Total Cost
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-indigo-700 mt-0.5 block">
                      {formatINR(routeMetrics.totalCost)}
                    </span>
                    <span className="text-[10px] text-slate-500">Session 8 Formula</span>
                  </div>
                </div>

                {/* Session 8 Cost Equation Formula Card */}
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="uppercase font-bold tracking-wider">
                      Session 8 Algebraic Cost Breakdown
                    </span>
                    <span>Cost = (Distance × Fuel Rate) + (Time Penalty × Overflow Count)</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-slate-300">
                    <div>
                      <span>Distance Cost: </span>
                      <span className="text-white font-bold">
                        {routeMetrics.totalDistanceKm} km × ₹{routeMetrics.fuelRatePerKm}/km ={' '}
                        <span className="text-emerald-400">
                          {formatINR(routeMetrics.totalDistanceKm * routeMetrics.fuelRatePerKm)}
                        </span>
                      </span>
                    </div>

                    <div>
                      <span>Penalty Cost: </span>
                      <span className="text-white font-bold">
                        {routeMetrics.overflowCount} Overflows × ₹{routeMetrics.timePenaltyPerOverflow} ={' '}
                        <span className="text-amber-400">
                          {formatINR(routeMetrics.overflowCount * routeMetrics.timePenaltyPerOverflow)}
                        </span>
                      </span>
                    </div>

                    <div className="text-right w-full sm:w-auto font-black text-sm text-indigo-300">
                      Total = {formatINR(routeMetrics.totalCost)}
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Waypoint Timeline */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Turn-by-Turn Waypoint Sequence
                  </h4>
                  <div className="space-y-2">
                    {/* Origin */}
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${
                          driverLocation.isDeviceLocation ? 'bg-blue-600' : 'bg-slate-900'
                        }`}
                      >
                        {driverLocation.isDeviceLocation ? 'GPS' : 'S'}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-900">
                          Start: {driverLocation.isDeviceLocation ? '📍 Live Device GPS Location' : 'Driver Depot (Sanath Nagar)'}
                        </span>
                        <span className="text-slate-500 text-[11px] block">{driverLocation.address}</span>
                      </div>
                    </div>

                    {/* Zonal Stops */}
                    {routeMetrics.orderedStops.map((stop, idx) => (
                      <div
                        key={stop.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs pl-4 relative"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-slate-900">Stop {idx + 1}: {stop.name}</span>
                          <span className="text-slate-500 text-[11px] block">
                            Fill: {stop.fillPercentage}% ({stop.currentWasteTons} T) • {stop.priorityLevel}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Destination */}
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs">
                      <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[10px]">
                        E
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-teal-900">Final: {mainYard.name}</span>
                        <span className="text-teal-700 text-[11px] block">{mainYard.location.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action CTA Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleDispatch}
                    disabled={isTransferring}
                    className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xl shadow-slate-900/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>
                      {isTransferring
                        ? 'Executing Bulk Transfer...'
                        : `Execute Municipal Transfer Dispatch (${selectedYards.length} Stations)`}
                    </span>
                  </button>

                  <a
                    href={routeMetrics.googleMapsDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                    <span>Launch in Google Maps</span>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
