import React, { useState } from 'react';
import { PestTrapData } from '../../types';
import {
  Bug,
  AlertTriangle,
  Plus,
  Camera,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Upload,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from 'recharts';

interface PestMonitoringProps {
  pestTraps: PestTrapData[];
  onNavigate: (tab: string) => void;
  onUpdateTrapCount: (trapId: string, newCount: number) => void;
}

export const PestMonitoring: React.FC<PestMonitoringProps> = ({
  pestTraps,
  onNavigate,
  onUpdateTrapCount
}) => {
  const getTrapId = (t: any) => t?.trapId || t?.id || 'trap-01';
  const getTrapName = (t: any) => t?.name || t?.trapName || 'Pheromone Trap';
  const getTrapPest = (t: any) => t?.pestType || t?.targetPest || 'Crop Pest';
  const getTrapThreshold = (t: any) => t?.threshold ?? t?.thresholdLimit ?? 12;
  const getTrapType = (t: any) => (t?.type || t?.pestType || 'Pheromone').toString().split(' ')[0];
  const getTrapHistory = (t: any) => t?.history || t?.historyTrend || [];

  const [selectedTrapId, setSelectedTrapId] = useState<string>(getTrapId(pestTraps[0]));
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCount, setManualCount] = useState('20');
  const [simAiAnalyzing, setSimAiAnalyzing] = useState(false);

  const selectedTrap = pestTraps.find(t => getTrapId(t) === selectedTrapId) || pestTraps[0] || {} as any;

  const handleSaveManualCount = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTrapCount(getTrapId(selectedTrap), parseInt(manualCount) || selectedTrap.currentCount || 0);
    setShowManualModal(false);
  };

  const handleSimulateTrapPhotoCount = () => {
    setSimAiAnalyzing(true);
    setTimeout(() => {
      setSimAiAnalyzing(false);
      onUpdateTrapCount(getTrapId(selectedTrap), 22);
    }, 1200);
  };

  return (
    <div id="pest-monitoring-view" className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              Pest & Trap Intelligence
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold font-mono">
              Economic Threshold Exceeded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pheromone lure density & insect counting to prevent exponential infestation spread
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManualModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            Enter Count
          </button>
          <button
            onClick={handleSimulateTrapPhotoCount}
            disabled={simAiAnalyzing}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            <span>{simAiAnalyzing ? 'Counting Pests...' : 'AI Trap Image Count'}</span>
          </button>
        </div>
      </div>

      {/* Threshold Warning Banner */}
      {selectedTrap.status === 'above_threshold' && (
        <div className="p-4 bg-rose-500/10 border-2 border-rose-400 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-950">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm">
                Action Required: {getTrapName(selectedTrap)} Exceeds Economic Threshold
              </h4>
              <p className="text-xs text-rose-900/90 mt-0.5 max-w-2xl leading-relaxed">
                Count of <strong>{selectedTrap.currentCount} {getTrapPest(selectedTrap)}</strong> exceeds economic threshold ({getTrapThreshold(selectedTrap)}). Biological biocontrol releases recommended within 24 hours.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('advisory')}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Bio-Control Protocol
          </button>
        </div>
      )}

      {/* Traps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pestTraps.map(trap => {
          const isAbove = trap.status === 'above_threshold';
          const isSelected = getTrapId(selectedTrap) === getTrapId(trap);
          return (
            <div
              key={getTrapId(trap)}
              onClick={() => setSelectedTrapId(getTrapId(trap))}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 shadow-md ring-2 ring-emerald-500/20 bg-white'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {getTrapType(trap).toUpperCase()} LURE
                    </span>
                    <h4 className="font-display font-extrabold text-lg text-slate-900 mt-0.5">
                      {getTrapName(trap)}
                    </h4>
                    <p className="text-xs text-slate-500">Target: {getTrapPest(trap)}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                    isAbove ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isAbove ? '🔴 ABOVE THRESHOLD' : '🟢 NORMAL'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-medium block">Current Trap Count</span>
                    <span className="font-display font-extrabold text-2xl text-slate-900 mt-0.5 block">
                      {trap.currentCount} <span className="text-xs font-sans text-slate-400">insects</span>
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-medium block">Economic Threshold</span>
                    <span className="font-display font-extrabold text-2xl text-slate-900 mt-0.5 block">
                      {getTrapThreshold(trap)} <span className="text-xs font-sans text-slate-400">insects</span>
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 flex items-center justify-between font-medium">
                  <span>Trend: <strong>{trap.currentCount > getTrapThreshold(trap) ? '↑ Rising Fast' : '→ Stable'}</strong></span>
                  <span className="text-[11px] text-slate-400 font-mono">Last checked: {trap.lastChecked || 'Today'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Trap Historical Catch Trend Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              5-Day Trap Count Trend
            </span>
            <h3 className="font-display font-extrabold text-lg text-slate-900 mt-0.5">
              {getTrapName(selectedTrap)} ({getTrapPest(selectedTrap)})
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              Catch Count
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-slate-400" />
              Threshold ({getTrapThreshold(selectedTrap)})
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getTrapHistory(selectedTrap)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 30]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-950 text-white p-2.5 rounded-xl text-xs font-sans">
                        <span className="text-rose-400 font-bold block">{d.date}</span>
                        <span>Caught: <strong>{d.count} insects</strong></span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={getTrapThreshold(selectedTrap)}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: `Economic Threshold (${getTrapThreshold(selectedTrap)})`, fill: '#ef4444', fontSize: 10, position: 'top' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#e11d48"
                strokeWidth={3}
                dot={{ r: 5, fill: '#e11d48', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Manual Count Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 mb-1">Enter Manual Trap Catch</h3>
            <p className="text-xs text-slate-500 mb-4">Record field inspection count for {getTrapName(selectedTrap)}</p>
            <form onSubmit={handleSaveManualCount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Pests Counted</label>
                <input
                  type="number"
                  required
                  value={manualCount}
                  onChange={e => setManualCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Count
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
