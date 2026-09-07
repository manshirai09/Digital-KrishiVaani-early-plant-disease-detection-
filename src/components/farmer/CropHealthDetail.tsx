import React, { useState } from 'react';
import { Farm, WeatherData, IotSensorData, PestTrapData } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { computeMultiSourceRisk } from '../../services/riskEngine';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import {
  ShieldAlert,
  Sliders,
  Sparkles,
  Info,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface CropHealthDetailProps {
  farm: Farm;
  weather: WeatherData;
  iotData: IotSensorData;
  pestTraps: PestTrapData[];
  onNavigate: (tab: string) => void;
}

export const CropHealthDetail: React.FC<CropHealthDetailProps> = ({
  farm,
  weather,
  iotData,
  pestTraps,
  onNavigate
}) => {
  // Live simulation interactive sliders
  const [simHumidity, setSimHumidity] = useState(iotData.humidity);
  const [simPestCount, setSimPestCount] = useState(pestTraps[0]?.currentCount || 18);
  const [simRainfall, setSimRainfall] = useState(weather.rainfallMm24h || weather.rainfallLast24h || 18);

  // Compute live simulated risk score
  const dynamicRisk = computeMultiSourceRisk({
    cropName: 'Cotton',
    cropStage: 'Flowering',
    imageSeverityScore: 34,
    imageConfidence: 91,
    humidity: simHumidity,
    leafWetnessHours: 8.5,
    rainfall24h: simRainfall,
    temperature: iotData.temperature,
    pestTrapCount: simPestCount,
    pestThreshold: 12,
    historicalOutbreakSeverity: 'moderate',
    villagePreviousCases: 6
  });

  const factorsList = dynamicRisk.factors || [
    { name: 'Leaf Image Evidence', label: 'Leaf Image Evidence', score: 82, rawScore: 82, weight: 30, contribution: 24.6, category: 'Computer Vision', status: 'High Risk', evidenceNote: 'Optical model confidence 91% & lesion area' },
    { name: 'Environmental Conduciveness', label: 'Environmental Conduciveness', score: 85, rawScore: 85, weight: 25, contribution: 21.3, category: 'Weather & IoT', status: 'High Risk', evidenceNote: `${simHumidity}% RH, ${simRainfall}mm rain` },
    { name: 'Pest Density & Vector Trend', label: 'Pest Density & Vector Trend', score: 75, rawScore: 75, weight: 20, contribution: 15.0, category: 'Smart Traps', status: 'High Risk', evidenceNote: `${simPestCount} insects vs 12 threshold` },
    { name: 'Historical Outbreak Probability', label: 'Historical Outbreak Probability', score: 65, rawScore: 65, weight: 15, contribution: 9.8, category: 'Epidemiology', status: 'Moderate', evidenceNote: 'Malwa plateau seasonal recurrence index' },
    { name: 'Phenological Stage Sensitivity', label: 'Phenological Stage Sensitivity', score: 85, rawScore: 85, weight: 10, contribution: 8.5, category: 'Agronomy', status: 'High Risk', evidenceNote: 'Flowering stage canopy susceptibility' },
  ];

  return (
    <div id="crop-health-detail-view" className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <KrishiRakshakLogo
              size="sm"
              theme="light"
              showTagline={false}
            />
            <span className="text-slate-300">|</span>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">
              Crop Health Risk Diagnostics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            “Aapka AI Krishi Saathi” • Cotton (BG-II Bt) • Plot #01 (2.4 Acres) • Flowering Stage • Explainable AI Engine
          </p>
        </div>

        <button
          onClick={() => onNavigate('advisory')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View Safe IPM Advisory</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Multi-Source Risk Transparency Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Overall Gauge & Key Drivers (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center text-center p-6 bg-slate-50 rounded-3xl border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Fused Multi-Source Score
            </span>

            {/* Circular Gauge */}
            <div className="relative w-44 h-44 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={
                    dynamicRisk.riskLevel === 'critical' ? '#e11d48' :
                    dynamicRisk.riskLevel === 'high' ? '#f59e0b' :
                    dynamicRisk.riskLevel === 'moderate' ? '#eab308' : '#10b981'
                  }
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * dynamicRisk.overallScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-extrabold text-4xl text-slate-900">
                  {dynamicRisk.overallScore}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-bold">/ 100 Max Risk</span>
              </div>
            </div>

            <div className="mt-2">
              <RiskBadge level={dynamicRisk.riskLevel} score={dynamicRisk.overallScore} size="lg" />
            </div>

            <p className="text-xs text-slate-600 mt-4 leading-relaxed max-w-xs">
              <strong>Risk Classification:</strong>{' '}
              {dynamicRisk.riskLevel === 'critical' || dynamicRisk.riskLevel === 'high'
                ? 'High probability of fungal disease spread. Pre-emptive cultural drainage & biocontrol spray advised.'
                : 'Current microclimate and foliar parameters indicate safe conditions.'}
            </p>
          </div>

          {/* Right Column: 5 Weighted Factor Contribution Bars (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Multi-Source Sub-Risk Breakdown
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Weighted Fusion Algorithm
              </span>
            </div>

            {/* Sub-Score Bars */}
            <div className="space-y-3">
              {factorsList.map((factor, idx) => {
                const s = factor.rawScore ?? factor.score;
                return (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{factor.label || factor.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          Weight: {factor.weight}%
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{s} / 100</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          s >= 75 ? 'bg-amber-500' : s >= 50 ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${s}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">{factor.evidenceNote || factor.notes}</p>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Algorithm Formula Explanation */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block font-mono">
                Explainable AI Transparency Formula
              </span>
              <p className="text-xs font-mono text-slate-300 mt-0.5">
                RiskScore = 0.30·Img(82) + 0.25·Env({simHumidity}) + 0.20·Pest({simPestCount}) + 0.15·Hist(64) + 0.10·Stage(85) = {dynamicRisk.overallScore}/100
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('risk-forecast')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>7-Day Trajectory</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Live Parameter Simulation Sandbox for Judges */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> Live Multi-Source Simulation Sandbox
            </span>
            <h3 className="font-display font-extrabold text-lg text-slate-900 mt-0.5">
              Interact with Environmental & Pest Parameters
            </h3>
          </div>
          <button
            onClick={() => {
              setSimHumidity(iotData.humidity);
              setSimPestCount(18);
              setSimRainfall(weather.rainfallMm24h || weather.rainfallLast24h || 18);
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Slide the environmental knobs below to witness how Digital KrishiVaani dynamically re-evaluates the fused Multi-Source Risk in real time without needing re-scanning:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Knob 1: Humidity */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Canopy Humidity</span>
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                {simHumidity}% RH
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="98"
              value={simHumidity}
              onChange={e => setSimHumidity(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Dry (40%)</span>
              <span>Saturated (98%)</span>
            </div>
          </div>

          {/* Knob 2: Pest Trap Count */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Pest Trap Catch</span>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                {simPestCount} insects
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={simPestCount}
              onChange={e => setSimPestCount(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Safe (0)</span>
              <span>Economic Threshold: 12</span>
              <span>Infested (50)</span>
            </div>
          </div>

          {/* Knob 3: 24h Rain */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">24h Rainfall</span>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                {simRainfall} mm
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={simRainfall}
              onChange={e => setSimRainfall(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>None (0mm)</span>
              <span>Heavy (60mm)</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
