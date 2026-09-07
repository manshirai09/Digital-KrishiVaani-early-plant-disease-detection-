import React from 'react';
import { ForecastDay } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  CloudSun,
  Droplets,
  CloudRain,
  ShieldCheck,
  ArrowRight,
  Info,
  Calendar
} from 'lucide-react';

interface RiskForecastProps {
  forecast?: ForecastDay[];
  onNavigate: (tab: string) => void;
}

const DEFAULT_FORECAST: ForecastDay[] = [
  { day: 'Today', dayName: 'Today', date: 'Aug 29', temp: 28, tempHigh: 28, humidity: 82, rainMm: 18, rainfallMm: 18, risk: 'high', riskLevel: 'high', riskScore: 78, predictedRiskScore: 78, conduciveConditions: 'Active sporulation window', recommendedAction: 'Prune infected canopy' },
  { day: 'Day +1', dayName: 'Sat (Day +1)', date: 'Aug 30', temp: 29, tempHigh: 29, humidity: 85, rainMm: 24, rainfallMm: 24, risk: 'high', riskLevel: 'high', riskScore: 82, predictedRiskScore: 82, conduciveConditions: 'Rain showers & wet leaf canopy', recommendedAction: 'Deploy bio-fungicide' },
  { day: 'Day +2', dayName: 'Sun (Day +2)', date: 'Aug 31', temp: 27, tempHigh: 27, humidity: 88, rainMm: 32, rainfallMm: 32, risk: 'critical', riskLevel: 'critical', riskScore: 89, predictedRiskScore: 89, conduciveConditions: 'Extreme fungal germination pressure', recommendedAction: 'Hold foliar spray (rain)' },
  { day: 'Day +3', dayName: 'Mon (Day +3)', date: 'Sep 01', temp: 26, tempHigh: 26, humidity: 90, rainMm: 28, rainfallMm: 28, risk: 'critical', riskLevel: 'critical', riskScore: 92, predictedRiskScore: 92, conduciveConditions: 'Peak infection risk window', recommendedAction: 'Targeted spot inspection' },
  { day: 'Day +4', dayName: 'Tue (Day +4)', date: 'Sep 02', temp: 28, tempHigh: 28, humidity: 84, rainMm: 12, rainfallMm: 12, risk: 'high', riskLevel: 'high', riskScore: 84, predictedRiskScore: 84, conduciveConditions: 'Weather clearing begins', recommendedAction: 'Optimal spray window' },
  { day: 'Day +5', dayName: 'Wed (Day +5)', date: 'Sep 03', temp: 31, tempHigh: 31, humidity: 72, rainMm: 2, rainfallMm: 2, risk: 'moderate', riskLevel: 'moderate', riskScore: 56, predictedRiskScore: 56, conduciveConditions: 'Sunlight halts secondary spores', recommendedAction: 'Follow-up foliar count' },
  { day: 'Day +6', dayName: 'Thu (Day +6)', date: 'Sep 04', temp: 32, tempHigh: 32, humidity: 65, rainMm: 0, rainfallMm: 0, risk: 'low', riskLevel: 'low', riskScore: 38, predictedRiskScore: 38, conduciveConditions: 'Dry micro-climate, stable canopy', recommendedAction: 'Log recovery scan' },
];

export const RiskForecast: React.FC<RiskForecastProps> = ({
  forecast = DEFAULT_FORECAST,
  onNavigate
}) => {
  const dataList = forecast && forecast.length > 0 ? forecast : DEFAULT_FORECAST;

  const chartData = dataList.map(d => ({
    name: d.dayName || d.day || 'Day',
    date: d.date || d.day || '',
    score: d.predictedRiskScore ?? d.riskScore ?? 50,
    humidity: d.humidity,
    rainfall: d.rainfallMm ?? d.rainMm ?? 0,
    temp: d.tempHigh ?? d.temp ?? 28,
    level: d.riskLevel ?? d.risk ?? 'moderate'
  }));

  const maxRiskDay = [...dataList].sort((a, b) => (b.predictedRiskScore ?? b.riskScore ?? 0) - (a.predictedRiskScore ?? a.riskScore ?? 0))[0];

  return (
    <div id="risk-forecast-view" className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
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
              Early Warning & 7-Day Risk Forecast
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            “Aapka AI Krishi Saathi” • Predictive disease trajectory synthesized from IMD Numerical Weather Prediction + IoT Microclimate
          </p>
        </div>

        <button
          onClick={() => onNavigate('crop-scanner')}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Perform Crop Scan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Predictive Warning Banner */}
      <div className="p-5 bg-gradient-to-r from-amber-500/15 to-rose-500/15 border-2 border-amber-300 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl shrink-0 mt-0.5">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-display font-extrabold text-base text-slate-900">
              High Risk Outbreak Window Predicted in 48-72 Hours
            </h4>
            <p className="text-xs text-slate-700 mt-1 max-w-2xl leading-relaxed">
              Combination of continuous precipitation (32mm) and extreme canopy humidity (&gt;88%) on <strong>Sunday and Monday</strong> creates optimal incubation for <em>Cercospora</em> spore spread. Pre-emptive cultural drainage and biocontrol spray strongly recommended before Day +2.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('advisory')}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          View IPM Advisory
        </button>
      </div>

      {/* 7-Day Risk Trajectory Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Risk Projection Model</span>
            <h3 className="font-display font-extrabold text-lg text-slate-900 mt-0.5">
              7-Day Disease Pressure Curve
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              Critical Risk (&gt;80)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              High Risk (60-79)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Safe / Low (&lt;40)
            </span>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-950 text-white p-3.5 rounded-2xl shadow-xl text-xs font-sans space-y-1.5 border border-slate-800">
                        <div className="font-display font-bold text-sm text-emerald-400">{d.name} ({d.date})</div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-400">Risk Score:</span>
                          <span className="font-bold text-white font-mono">{d.score} / 100</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-400">Canopy Humidity:</span>
                          <span className="font-bold text-sky-300">{d.humidity}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-400">Rainfall:</span>
                          <span className="font-bold text-indigo-300">{d.rainfall} mm</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Action Threshold', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#e11d48"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#riskGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7-Day Day-by-Day Forecast Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {dataList.map((day, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition-all ${
              (day.predictedRiskScore ?? day.riskScore ?? 0) >= 80
                ? 'bg-rose-50/60 border-rose-300'
                : (day.predictedRiskScore ?? day.riskScore ?? 0) >= 60
                ? 'bg-amber-50/60 border-amber-300'
                : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 text-xs">{day.dayName || day.day}</span>
                <span className="text-[10px] font-mono text-slate-500">{day.date}</span>
              </div>

              <div className="my-2">
                <RiskBadge
                  level={(day.riskLevel || day.risk || 'low') as any}
                  score={day.predictedRiskScore ?? day.riskScore}
                  size="sm"
                  showScore
                />
              </div>

              <div className="space-y-1 text-[11px] text-slate-600 mt-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500"><Droplets className="w-3 h-3 text-sky-500" /> Hum:</span>
                  <span className="font-mono font-bold text-slate-800">{day.humidity}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500"><CloudRain className="w-3 h-3 text-indigo-500" /> Rain:</span>
                  <span className="font-mono font-bold text-slate-800">{day.rainfallMm ?? day.rainMm}mm</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
              <span className="font-bold text-slate-700 block truncate">{day.conduciveConditions || 'Normal'}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
