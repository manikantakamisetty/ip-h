import React, { useState, useEffect } from 'react';
import {
  Truck,
  RotateCcw,
  Clock,
  MapPin,
  Building2,
  BarChart3,
  AlertTriangle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ZonalDumpYard } from '../types';

export type ActiveRole = 'zonal-manager' | 'truck-driver' | 'analytics';

interface HeaderProps {
  activeRole: ActiveRole;
  onRoleChange: (role: ActiveRole) => void;
  yards: ZonalDumpYard[];
  onResetDemo: () => Promise<void>;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  onRoleChange,
  yards,
  onResetDemo,
  isResetting
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
      setDateStr(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const overflowCount = yards.filter((y) => y.fillPercentage >= 80).length;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Operational Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between py-3.5 gap-3 border-b border-slate-100">
          {/* Logo & Metro Badge */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-100">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                    Clean<span className="text-emerald-600">Track</span>
                  </h1>
                  <span className="hidden sm:inline-block text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                    Municipal Waste Logistics
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Smart Transfer & Route Optimization Platform
                </p>
              </div>
            </div>

            {/* Mobile Reset CTA */}
            <div className="md:hidden">
              <button
                onClick={onResetDemo}
                disabled={isResetting}
                className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                title="Reset Demo Data"
              >
                <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Operational Metrics: District, Clock & Reset */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end text-xs">
            {/* Metro District Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Greater Hyderabad / City Metro</span>
            </div>

            {/* Live Clock */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-medium border border-slate-200/80">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{timeStr}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">{dateStr}</span>
            </div>

            {/* Reset System Demo Button */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <RotateCcw
                className={`w-3.5 h-3.5 text-slate-500 ${isResetting ? 'animate-spin text-emerald-600' : ''}`}
              />
              <span>{isResetting ? 'Resetting...' : 'Reset System Demo'}</span>
            </button>
          </div>
        </div>

        {/* Quick Switch Role Portal Navigation Tabs */}
        <div className="flex items-center justify-between py-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Role 1: Zonal Yard Manager */}
            <button
              onClick={() => onRoleChange('zonal-manager')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                activeRole === 'zonal-manager'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Zonal Dump Yard Manager</span>
            </button>

            {/* Role 2: Big Truck Driver */}
            <button
              onClick={() => onRoleChange('truck-driver')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                activeRole === 'truck-driver'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/25 ring-2 ring-slate-800/20'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Big Transfer Truck Driver</span>

              {overflowCount > 0 && (
                <span
                  className={`inline-flex items-center justify-center text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    activeRole === 'truck-driver'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}
                  title={`${overflowCount} yard(s) currently in OVERFLOW`}
                >
                  {overflowCount} CRITICAL
                </span>
              )}
            </button>

            {/* Role 3: Academic Lab / System Admin */}
            <button
              onClick={() => onRoleChange('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeRole === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/20'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Lab Academic Evaluator</span>
            </button>
          </div>

          {/* Quick status indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>GHMC IoT Gateway: Connected</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
};
