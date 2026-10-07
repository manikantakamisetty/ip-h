import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  Truck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Flame,
  Scale,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { ZonalDumpYard, SmallTruckLog, WasteCategory } from '../types';
import { CapacityGauge } from '../components/CapacityGauge';

interface ZonalManagerViewProps {
  yards: ZonalDumpYard[];
  selectedYardId: string;
  onSelectYardId: (id: string) => void;
  logs: SmallTruckLog[];
  onLogSmallTruck: (
    logData: Omit<SmallTruckLog, 'id' | 'timestamp'>
  ) => Promise<{ updatedYard: ZonalDumpYard; isOverflowTriggered: boolean }>;
  isSubmitting: boolean;
}

export const ZonalManagerView: React.FC<ZonalManagerViewProps> = ({
  yards,
  selectedYardId,
  onSelectYardId,
  logs,
  onLogSmallTruck,
  isSubmitting
}) => {
  const currentYard = yards.find((y) => y.id === selectedYardId) || yards[0];

  // Small Truck Form State
  const [vehicleRegNumber, setVehicleRegNumber] = useState<string>('TS-07-UB-2849');
  const [driverName, setDriverName] = useState<string>('K. Ramesh');
  const [payloadTons, setPayloadTons] = useState<number>(4.2);
  const [wasteCategory, setWasteCategory] = useState<WasteCategory>('Wet');
  const [notes, setNotes] = useState<string>('Ward 14 commercial vegetable market collection');
  const [formFeedback, setFormFeedback] = useState<{
    type: 'success' | 'alert' | null;
    message: string;
  } | null>(null);

  // Search & Filter for Activity Table
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesYard = log.yardId === currentYard.id;
    const matchesSearch =
      log.vehicleRegNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      categoryFilter === 'ALL' || log.wasteCategory === categoryFilter;
    return matchesYard && matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleRegNumber.trim() || !driverName.trim() || payloadTons <= 0) return;

    try {
      const result = await onLogSmallTruck({
        yardId: currentYard.id,
        vehicleRegNumber: vehicleRegNumber.trim().toUpperCase(),
        driverName: driverName.trim(),
        payloadTons: Number(payloadTons.toFixed(2)),
        wasteCategory,
        managerId: currentYard.managerId,
        notes: notes.trim()
      });

      if (result.isOverflowTriggered) {
        setFormFeedback({
          type: 'alert',
          message: `🚨 OVERFLOW ALERT TRIGGERED! ${result.updatedYard.name} reached ${result.updatedYard.fillPercentage}% capacity. Priority dispatch notification transmitted to Big Truck Driver fleet!`
        });
      } else {
        setFormFeedback({
          type: 'success',
          message: `Vehicle ${vehicleRegNumber.toUpperCase()} successfully logged! Added +${payloadTons} Tons. New yard capacity: ${result.updatedYard.fillPercentage}%.`
        });
      }

      // Generate a new sample registration number for next entry convenience
      const randDigits = Math.floor(1000 + Math.random() * 9000);
      setVehicleRegNumber(`TS-08-FA-${randDigits}`);
    } catch (err: any) {
      setFormFeedback({
        type: 'alert',
        message: err?.message || 'Error logging truck entry'
      });
    }
  };

  // Quick stat summaries for this yard
  const yardLogs = logs.filter((l) => l.yardId === currentYard.id);
  const totalLoggedTonsToday = yardLogs
    .reduce((acc, curr) => acc + curr.payloadTons, 0)
    .toFixed(1);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Station Selector Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Active Zonal Transfer Station Selector
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch between Greater Hyderabad zonal collection yards to monitor intake gauges & record weighbridge manifests.
          </p>
        </div>

        {/* Yard Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {yards.map((yard) => {
            const isSelected = yard.id === currentYard.id;
            const isOverflow = yard.fillPercentage >= 80;
            return (
              <button
                key={yard.id}
                onClick={() => {
                  onSelectYardId(yard.id);
                  setFormFeedback(null);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{yard.name.replace(' Zonal Transfer Station', '').replace(' Zonal Yard', '')}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isOverflow
                      ? 'bg-red-500 text-white animate-pulse'
                      : yard.fillPercentage >= 50
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {Math.round(yard.fillPercentage)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left = Capacity Gauge & Details, Right = Small Truck Logging Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 5 Cols -> Live Capacity Gauge Widget & Metadata */}
        <div className="lg:col-span-5 space-y-6">
          <CapacityGauge yard={currentYard} />

          {/* Quick Municipal Metadata Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Station Operational Profile
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Station Manager</span>
                <span className="font-bold text-slate-800">{currentYard.managerName}</span>
                <span className="text-[10px] text-slate-500 block font-mono">{currentYard.managerId}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Today's Recorded Intake</span>
                <span className="font-bold text-slate-800 text-sm">{totalLoggedTonsToday} Tons</span>
                <span className="text-[10px] text-slate-500 block">{yardLogs.length} Small Trucks</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                <span className="text-slate-400 block text-[11px]">Geographical Facility Address</span>
                <span className="font-medium text-slate-700">{currentYard.location.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 7 Cols -> Small Truck Entry Logging Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Log Incoming Small Collection Truck
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Weighbridge intake terminal for 5-Ton door-to-door municipal collection vehicles.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                AUTO-CALC ON
              </span>
            </div>

            {formFeedback && (
              <div
                className={`mt-4 p-4 rounded-xl text-xs font-medium flex items-start gap-3 ${
                  formFeedback.type === 'alert'
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                }`}
              >
                {formFeedback.type === 'alert' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div>{formFeedback.message}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vehicle Registration Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Vehicle Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleRegNumber}
                    onChange={(e) => setVehicleRegNumber(e.target.value)}
                    placeholder="e.g. TS-07-UB-1234"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Format: TS-XX-YY-ZZZZ (Telangana Municipal Fleet)
                  </span>
                </div>

                {/* Driver Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Driver / Operator Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Ramu Naik"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Net Waste Payload (Tons) with Interactive Stepper/Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Net Waste Payload (Tons) *
                  </label>
                  <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {payloadTons.toFixed(1)} Tons
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={payloadTons}
                    onChange={(e) => setPayloadTons(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <input
                    type="number"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={payloadTons}
                    onChange={(e) => setPayloadTons(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm text-right font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Small municipal tipper trucks possess an OOP structural payload limit of 5.0 Tons.
                </p>
              </div>

              {/* Waste Category Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Segregated Waste Category *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Wet', 'Dry', 'E-Waste / Hazardous'] as WasteCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setWasteCategory(cat)}
                      className={`p-3 rounded-xl border text-xs font-bold transition text-left flex flex-col justify-between ${
                        wasteCategory === cat
                          ? cat === 'Wet'
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-400/20'
                            : cat === 'Dry'
                            ? 'bg-sky-50 border-sky-400 text-sky-800 ring-2 ring-sky-400/20'
                            : 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-400/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] font-normal text-slate-500 mt-1">
                        {cat === 'Wet'
                          ? 'Organic & Kitchen'
                          : cat === 'Dry'
                          ? 'Recyclable Packaging'
                          : 'Electronic / Toxic'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Collection Notes / Sub-Ward Sector
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ward 12 Residential Apartment Compacted Route"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>
                    {isSubmitting
                      ? 'Updating Yard Weighbridge...'
                      : `Log Arrival & Recalculate Capacity (+${payloadTons.toFixed(1)} T)`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Section 3: Recent Activity Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-700" />
              <h3 className="text-base font-bold text-slate-900">
                Recent Small Truck Arrivals at {currentYard.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified weighbridge logs with timestamps, category segregations, and digital inspector IDs.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search plate or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Wet">Wet Waste</option>
              <option value="Dry">Dry Waste</option>
              <option value="E-Waste / Hazardous">E-Waste / Hazardous</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Vehicle Number</th>
                <th className="py-3 px-4">Driver Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Net Payload</th>
                <th className="py-3 px-4">Manager ID</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No small truck logs recorded for this station yet. Log an entry above!
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600">{log.timestamp}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {log.vehicleRegNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{log.driverName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.wasteCategory === 'Wet'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.wasteCategory === 'Dry'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {log.wasteCategory}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      +{log.payloadTons} T
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{log.managerId}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
