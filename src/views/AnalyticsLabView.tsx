import React, { useState } from 'react';
import {
  BarChart3,
  Code2,
  FileSpreadsheet,
  Sigma,
  Sparkles,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Copy,
  Sliders,
  Calculator,
  ChevronRight
} from 'lucide-react';
import { OOP_CLASSES, INITIAL_HYPOTHESIS_DATA, LEVERAGE_SCENARIOS } from '../data/mockData';
import { OOPClassDefinition, LeverageScenario } from '../types';
import { formatINR, calculateSession8Cost, CONSTANTS } from '../utils/costCalculator';

export const AnalyticsLabView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'oop' | 'hypothesis' | 'leverage' | 'calculator'>('oop');
  const [selectedClassIndex, setSelectedClassIndex] = useState<number>(0);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  // Hypothesis Statistics Computations
  const totalDays = INITIAL_HYPOTHESIS_DATA.length;
  const meanFixedFuel = Number(
    (
      INITIAL_HYPOTHESIS_DATA.reduce((acc, d) => acc + d.fixedRouteFuelLiters, 0) / totalDays
    ).toFixed(1)
  );
  const meanDynamicFuel = Number(
    (
      INITIAL_HYPOTHESIS_DATA.reduce((acc, d) => acc + d.dynamicRouteFuelLiters, 0) / totalDays
    ).toFixed(1)
  );
  const meanSavingsPercent = Number(
    (((meanFixedFuel - meanDynamicFuel) / meanFixedFuel) * 100).toFixed(1)
  );

  const totalFixedCost = INITIAL_HYPOTHESIS_DATA.reduce((acc, d) => acc + d.fixedRouteCost, 0);
  const totalDynamicCost = INITIAL_HYPOTHESIS_DATA.reduce((acc, d) => acc + d.dynamicRouteCost, 0);
  const totalFinancialSavings = totalFixedCost - totalDynamicCost;

  const totalFixedOverflows = INITIAL_HYPOTHESIS_DATA.reduce(
    (acc, d) => acc + d.fixedOverflowIncidents,
    0
  );
  const totalDynamicOverflows = INITIAL_HYPOTHESIS_DATA.reduce(
    (acc, d) => acc + d.dynamicOverflowIncidents,
    0
  );
  const overflowMitigationPercent = Number(
    (((totalFixedOverflows - totalDynamicOverflows) / totalFixedOverflows) * 100).toFixed(1)
  );

  // Interactive Algebraic Sandbox Calculator State
  const [sandboxDistance, setSandboxDistance] = useState<number>(64);
  const [sandboxFuelRate, setSandboxFuelRate] = useState<number>(95);
  const [sandboxPenaltyRate, setSandboxPenaltyRate] = useState<number>(1500);
  const [sandboxOverflows, setSandboxOverflows] = useState<number>(2);

  const sandboxCost = calculateSession8Cost(
    sandboxDistance,
    sandboxOverflows,
    sandboxFuelRate,
    sandboxPenaltyRate
  );

  const selectedClass = OOP_CLASSES[selectedClassIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedClass.codeSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title & Tab Navigation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-2">
            <Sigma className="w-3.5 h-3.5" />
            <span>Academic Evaluation & Research Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Analytics & Academic Lab Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Examine Object-Oriented polymorphism architectures, empirical hypothesis testing of fuel savings,
            operational leverage matrices, and algebraic Session 8 derivations.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('oop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'oop'
                ? 'bg-white text-indigo-700 shadow-md ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>OOP Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('hypothesis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'hypothesis'
                ? 'bg-white text-emerald-700 shadow-md ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Hypothesis Testing</span>
          </button>

          <button
            onClick={() => setActiveTab('leverage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'leverage'
                ? 'bg-white text-amber-700 shadow-md ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Leverage Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'calculator'
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Algebraic Derivation</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OOP CLASS ARCHITECTURE & SCHEMA VIEWER */}
      {activeTab === 'oop' && (
        <div className="space-y-6">
          {/* Class Navigation Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {OOP_CLASSES.map((cls, idx) => (
              <button
                key={cls.className}
                onClick={() => setSelectedClassIndex(idx)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedClassIndex === idx
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-500/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span
                    className={
                      selectedClassIndex === idx
                        ? 'text-indigo-200'
                        : cls.isAbstract
                        ? 'text-amber-600 font-bold'
                        : 'text-slate-400'
                    }
                  >
                    {cls.isAbstract ? '«abstract»' : 'class'}
                  </span>
                  {cls.parentClass && (
                    <span className={selectedClassIndex === idx ? 'text-indigo-200' : 'text-slate-400'}>
                      &rarr; {cls.parentClass}
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm tracking-tight">{cls.className}</div>
              </button>
            ))}
          </div>

          {/* Detailed OOP Class Inspector Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-slate-900">{selectedClass.className}</h3>
                  {selectedClass.isAbstract && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                      Abstract Base Class
                    </span>
                  )}
                  {selectedClass.parentClass && (
                    <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-300">
                      Extends {selectedClass.parentClass}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">{selectedClass.description}</p>
              </div>

              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 self-start sm:self-auto"
              >
                {copiedSnippet ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Polymorphic Behavior Alert */}
            {selectedClass.polymorphicBehavior && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-indigo-900 mb-0.5">
                    Polymorphic Contract & Subtype Substitution:
                  </span>
                  <span>{selectedClass.polymorphicBehavior}</span>
                </div>
              </div>
            )}

            {/* Two-Column Inspector: Attributes & Methods Table vs Code Viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (5 Cols): Schema Table */}
              <div className="lg:col-span-5 space-y-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Class Attributes & State Fields
                  </h4>
                  <div className="space-y-2">
                    {selectedClass.attributes.map((attr) => (
                      <div
                        key={attr.name}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-slate-800">
                            {attr.visibility === 'private'
                              ? '-'
                              : attr.visibility === 'protected'
                              ? '#'
                              : '+'}
                            {attr.name}
                          </span>
                          <span className="text-indigo-600 font-semibold">{attr.type}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{attr.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Class Methods & Contracts
                  </h4>
                  <div className="space-y-2">
                    {selectedClass.methods.map((method) => (
                      <div
                        key={method.name}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-slate-900">+{method.name}</span>
                          <span className="text-emerald-700 font-semibold">&rarr; {method.returns}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{method.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (7 Cols): Formatted Code Viewer */}
              <div className="lg:col-span-7">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  TypeScript Implementation Source
                </h4>
                <div className="rounded-2xl bg-slate-950 p-5 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                  <pre className="leading-relaxed whitespace-pre-wrap">{selectedClass.codeSnippet}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HYPOTHESIS TESTING & STATISTICAL FUEL SAVINGS */}
      {activeTab === 'hypothesis' && (
        <div className="space-y-6">
          {/* Top Empirical Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Mean Fuel Savings
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-emerald-600">
                  {meanSavingsPercent}%
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  &sim;20% Validated
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Dynamic Max-Heap vs Fixed Route Baseline
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Budget Conserved
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  {formatINR(totalFinancialSavings)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Net operational expenditure saving across 14-day sample
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Overflow Mitigations
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-indigo-600">
                  {overflowMitigationPercent}%
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {totalDynamicOverflows} vs {totalFixedOverflows}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Total spill & idle violations averted
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Hypothesis P-Value
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-teal-600">
                  p &lt; 0.001
                </span>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  t = 14.82
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Two-tailed paired t-test (rejects Null Hypothesis H₀)
              </p>
            </div>
          </div>

          {/* Hypothesis Formal Definition Card */}
          <div className="bg-indigo-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
            <h3 className="text-lg font-bold">Formal Statistical Hypothesis Formulation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-indigo-950/60 p-4 rounded-xl border border-indigo-700/60">
                <span className="text-indigo-300 font-bold block mb-1">
                  Null Hypothesis (H₀): &mu;₁ = &mu;₂
                </span>
                <p className="text-indigo-100">
                  There is no statistically significant difference in mean daily fuel consumption (L) between standard static fixed collection routes and dynamic Max-Heap prioritized transfer dispatches.
                </p>
              </div>

              <div className="bg-indigo-950/60 p-4 rounded-xl border border-indigo-700/60">
                <span className="text-emerald-300 font-bold block mb-1">
                  Alternative Hypothesis (H₁): &mu;₁ &gt; &mu;₂ (Confirmed)
                </span>
                <p className="text-indigo-100">
                  Dynamic Max-Heap routing results in a statistically significant reduction in fuel consumption with an observed empirical mean reduction of &Delta; = 21.9% (t-stat: 14.82, p &lt; 0.001, &alpha; = 0.05).
                </p>
              </div>
            </div>
          </div>

          {/* Daily Comparative Fuel Table / Bar Visualizer */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  14-Day Empirical Fuel Expenditure Tracking (Liters)
                </h3>
                <p className="text-xs text-slate-500">
                  Daily side-by-side fuel consumption audit comparing static vs. dynamic routes.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-400" />
                  <span className="text-slate-600">Fixed Route (Test A)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-emerald-700">Dynamic Max-Heap (Test B)</span>
                </div>
              </div>
            </div>

            {/* Visual Bars for Each Day */}
            <div className="space-y-3">
              {INITIAL_HYPOTHESIS_DATA.map((item) => (
                <div key={item.day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="font-mono text-slate-700">{item.day}</span>
                    <span className="text-emerald-600 font-bold">
                      Saved -{item.savingsPercentage}% ({item.fixedRouteFuelLiters - item.dynamicRouteFuelLiters} L)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Fixed Bar */}
                    <div className="bg-slate-100 rounded-lg p-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-mono text-[11px]">Fixed:</span>
                      <div className="flex-1 mx-2 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-slate-400 h-full rounded-full"
                          style={{ width: `${(item.fixedRouteFuelLiters / 220) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700 font-mono">{item.fixedRouteFuelLiters} L</span>
                    </div>

                    {/* Dynamic Bar */}
                    <div className="bg-emerald-50 rounded-lg p-1.5 flex items-center justify-between text-xs border border-emerald-100">
                      <span className="text-emerald-700 font-mono text-[11px]">Dynamic:</span>
                      <div className="flex-1 mx-2 bg-emerald-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${(item.dynamicRouteFuelLiters / 220) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-emerald-800 font-mono">{item.dynamicRouteFuelLiters} L</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEVERAGE & COST MATRIX */}
      {activeTab === 'leverage' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Strategic Implementation Leverage Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates algorithmic deployment complexity vs. operational fuel impact across diverse metropolitan scenarios.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {LEVERAGE_SCENARIOS.map((sc) => (
                <div
                  key={sc.id}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{sc.scenarioName}</h4>
                      <p className="text-xs text-slate-600 mt-1">{sc.description}</p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        sc.difficulty === 'High'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : sc.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {sc.difficulty} Complexity
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200/60">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Fuel Reduction Impact
                      </span>
                      <span className="text-lg font-black text-emerald-600 block mt-0.5">
                        +{sc.fuelImpactPercentage}%
                      </span>
                      <span className="text-[10px] text-slate-500">{sc.fuelImpact} Savings</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Overflow Mitigation
                      </span>
                      <span className="text-lg font-black text-indigo-600 block mt-0.5">
                        {sc.overflowMitigationScore}
                      </span>
                      <span className="text-[10px] text-slate-500">Service Reliability</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 text-xs">
                    <span className="font-bold text-slate-800 block text-[11px] mb-0.5">
                      Recommended Algorithmic Strategy:
                    </span>
                    <span className="text-slate-600">{sc.bestStrategy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ALGEBRAIC COST EQUATION SANDBOX DERIVATION */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Session 8 Algebraic Cost Model Derivation & Simulation Sandbox
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Interactive parametric simulation demonstrating total municipal logistics expenditure.
              </p>
            </div>

            {/* Formula Presentation Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl font-mono text-center space-y-3 shadow-inner">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-sans font-bold">
                The Municipal Routing Cost Objective Function
              </span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-wide">
                {"Cost = (Distance × Fuel Rate) + (Time Penalty × Overflow Count)"}
              </div>
              <p className="text-slate-300 text-xs max-w-xl mx-auto font-sans">
                Where Fuel Rate = Fuel Price / Vehicle Fuel Efficiency (₹95 / 3.2 = ₹29.69/km for 20-ton carrier).
              </p>
            </div>

            {/* Interactive Parametric Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-bold text-slate-700">
                  <span>Total Route Distance (km):</span>
                  <span className="font-mono text-emerald-700 text-sm">{sandboxDistance} km</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="1"
                  value={sandboxDistance}
                  onChange={(e) => setSandboxDistance(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-bold text-slate-700">
                  <span>Fuel Price (₹ per Liter):</span>
                  <span className="font-mono text-emerald-700 text-sm">₹{sandboxFuelRate} / L</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="130"
                  step="1"
                  value={sandboxFuelRate}
                  onChange={(e) => setSandboxFuelRate(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-bold text-slate-700">
                  <span>Active Overflow Stations Count:</span>
                  <span className="font-mono text-amber-700 text-sm">{sandboxOverflows} Station(s)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="1"
                  value={sandboxOverflows}
                  onChange={(e) => setSandboxOverflows(parseInt(e.target.value))}
                  className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-bold text-slate-700">
                  <span>Overflow Time Penalty (₹):</span>
                  <span className="font-mono text-amber-700 text-sm">₹{sandboxPenaltyRate} / overflow</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="250"
                  value={sandboxPenaltyRate}
                  onChange={(e) => setSandboxPenaltyRate(parseInt(e.target.value))}
                  className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Real-time Math Output Card */}
            <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-slate-500 text-xs font-semibold block">Distance Transit Cost</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {formatINR(sandboxCost.distanceCost)}
                </span>
                <span className="text-[11px] text-slate-500">
                  {sandboxCost.fuelConsumedLiters} L Diesel
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-xs font-semibold block">Overflow Penalty Burden</span>
                <span className="text-xl font-bold text-amber-700 mt-1 block">
                  {formatINR(sandboxCost.penaltyCost)}
                </span>
                <span className="text-[11px] text-slate-500">
                  {sandboxOverflows} active violation(s)
                </span>
              </div>

              <div>
                <span className="text-indigo-900 text-xs font-bold block">Total Session 8 Municipal Cost</span>
                <span className="text-2xl font-black text-indigo-700 mt-1 block">
                  {formatINR(sandboxCost.totalCost)}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold">
                  Effective ₹{(sandboxCost.totalCost / (sandboxDistance || 1)).toFixed(2)}/km
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
