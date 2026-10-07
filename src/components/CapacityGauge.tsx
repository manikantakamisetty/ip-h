import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { ZonalDumpYard } from '../types';

interface CapacityGaugeProps {
  yard: ZonalDumpYard;
  compact?: boolean;
}

export const CapacityGauge: React.FC<CapacityGaugeProps> = ({ yard, compact = false }) => {
  const percentage = Math.min(100, Math.max(0, yard.fillPercentage));

  let colorClasses = {
    bar: 'bg-emerald-500',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    label: 'Normal Capacity',
    icon: CheckCircle
  };

  if (percentage >= 80) {
    colorClasses = {
      bar: 'bg-red-500',
      text: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-800 border-red-300 animate-pulse',
      label: 'OVERFLOW ALERT',
      icon: AlertTriangle
    };
  } else if (percentage >= 50) {
    colorClasses = {
      bar: 'bg-amber-500',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      label: 'Moderate Fill',
      icon: AlertCircle
    };
  }

  const Icon = colorClasses.icon;
  const remainingHeadroom = Math.max(0, Number((yard.maxCapacityTons - yard.currentWasteTons).toFixed(1)));

  if (compact) {
    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                percentage >= 80 ? 'bg-red-500 animate-ping' : percentage >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span className={colorClasses.text}>{percentage}% Fill</span>
          </span>
          <span className="text-slate-500">
            {yard.currentWasteTons} / {yard.maxCapacityTons} T
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorClasses.bar}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-2xl border ${colorClasses.border} ${colorClasses.bg} transition-all duration-300 shadow-sm`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Zonal Transfer Station Status
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">{yard.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Zone Code: {yard.zoneCode} • Manager: {yard.managerName}</p>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colorClasses.badge}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{colorClasses.label}</span>
        </div>
      </div>

      {/* Primary Big Metric & Gauge Bar */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-extrabold tracking-tight ${colorClasses.text}`}>
              {percentage}%
            </span>
            <span className="text-sm font-semibold text-slate-600">Active Capacity</span>
          </div>
          <div className="text-right">
            <span className="text-base font-bold text-slate-800">
              {yard.currentWasteTons.toFixed(1)} T
            </span>
            <span className="text-xs text-slate-500"> / {yard.maxCapacityTons} Tons Max</span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-white/80 p-1 rounded-full border border-slate-200/60 shadow-inner">
          <div className="w-full bg-slate-200/80 rounded-full h-4 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${colorClasses.bar} relative`}
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* Threshold Indicators & Metric Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-white/80 rounded-lg p-2 border border-slate-200/40">
          <span className="text-slate-400 block text-[11px] font-medium">Headroom</span>
          <span className="font-bold text-slate-800 text-sm">{remainingHeadroom} T</span>
        </div>
        <div className="bg-white/80 rounded-lg p-2 border border-slate-200/40">
          <span className="text-slate-400 block text-[11px] font-medium">Priority Level</span>
          <span
            className={`font-bold text-sm ${
              yard.priorityLevel === 'CRITICAL'
                ? 'text-red-600'
                : yard.priorityLevel === 'HIGH'
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}
          >
            {yard.priorityLevel}
          </span>
        </div>
        <div className="bg-white/80 rounded-lg p-2 border border-slate-200/40">
          <span className="text-slate-400 block text-[11px] font-medium">Telemetry Sync</span>
          <span className="font-bold text-slate-700 text-sm">{yard.lastUpdated}</span>
        </div>
      </div>

      {percentage >= 80 && (
        <div className="mt-3.5 bg-red-600 text-white rounded-xl p-3 flex items-center justify-between text-xs font-semibold shadow-md shadow-red-500/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
            <span>High priority dispatch alert triggered to Big Truck Drivers</span>
          </div>
          <span className="bg-white text-red-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            Action Required
          </span>
        </div>
      )}
    </div>
  );
};
