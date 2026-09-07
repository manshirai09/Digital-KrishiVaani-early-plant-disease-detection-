import React from 'react';
import { WeatherData } from '../../types';
import {
  CloudSun,
  Droplets,
  CloudRain,
  Wind,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface WeatherIntelligenceProps {
  weather: WeatherData;
  onNavigate: (tab: string) => void;
}

export const WeatherIntelligence: React.FC<WeatherIntelligenceProps> = ({
  weather,
  onNavigate
}) => {
  return (
    <div id="weather-intelligence-view" className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              Agro-Meteorological Intelligence
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold font-mono">
              IMD Doppler Radar Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Micro-climate forecasting calibrated for Madhya Pradesh Agro-Climatic Zone VII
          </p>
        </div>

        <button
          onClick={() => onNavigate('risk-forecast')}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View 7-Day Disease Risk Forecast</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Spray Window Safety Advisory Banner */}
      <div className="p-4 bg-amber-500/10 border-2 border-amber-300 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-950">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500 text-slate-950 rounded-xl mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm">
              Spray Advisory: Rain Wash-Off Risk in Next 36 Hours
            </h4>
            <p className="text-xs text-amber-900/90 mt-0.5 max-w-2xl leading-relaxed">
              Heavy rain spells (18-24mm) predicted. <strong>Do not apply foliar chemical sprays today</strong> to prevent chemical runoff and wasted inputs. Optimal spray window opens on Day +4.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-white rounded-xl border border-amber-300 font-mono text-xs font-bold text-amber-900 shrink-0">
          Spray Window: Closed
        </div>
      </div>

      {/* Current Real-Time Atmospheric Conditions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Surface Temp</span>
              <CloudSun className="w-5 h-5 text-amber-500" />
            </div>
            <span className="font-display font-extrabold text-3xl text-slate-900">
              {weather.temperature}°C
            </span>
            <span className="text-[11px] text-slate-500 mt-2">Dew Point: 24.2°C</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Relative Humidity</span>
              <Droplets className="w-5 h-5 text-sky-500" />
            </div>
            <span className="font-display font-extrabold text-3xl text-slate-900">
              {weather.humidity}%
            </span>
            <span className="text-[11px] text-rose-700 font-bold mt-2">Critical Disease Index</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">24h Rainfall</span>
              <CloudRain className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="font-display font-extrabold text-3xl text-slate-900">
              {weather.rainfallMm24h} mm
            </span>
            <span className="text-[11px] text-slate-500 mt-2">Rain Prob: {weather.rainProbability}%</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Wind Velocity</span>
              <Wind className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="font-display font-extrabold text-3xl text-slate-900">
              {weather.windSpeedKmH} <span className="text-xs font-sans text-slate-400">km/h</span>
            </span>
            <span className="text-[11px] text-slate-500 mt-2">Direction: {weather.windDirection}</span>
          </div>

        </div>
      </div>

      {/* 5-Day Weather Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-display font-extrabold text-lg text-slate-900 mb-4">
          5-Day Agro-Weather Outlook
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { day: 'Today', temp: '28° / 23°', rain: '18 mm', hum: '82%', icon: '🌧️', cond: 'Moderate Rain' },
            { day: 'Tomorrow', temp: '27° / 22°', rain: '24 mm', hum: '86%', icon: '⛈️', cond: 'Heavy Showers' },
            { day: 'Day +2', temp: '29° / 23°', rain: '12 mm', hum: '84%', icon: '🌦️', cond: 'Intermittent' },
            { day: 'Day +3', temp: '30° / 24°', rain: '4 mm', hum: '76%', icon: '⛅', cond: 'Partly Cloudy' },
            { day: 'Day +4', temp: '32° / 24°', rain: '0 mm', hum: '68%', icon: '☀️', cond: 'Sunny / Safe' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{item.day}</span>
                <span className="text-2xl my-2 block">{item.icon}</span>
                <span className="font-bold text-slate-800 block text-sm">{item.temp}</span>
                <span className="text-[11px] text-slate-500">{item.cond}</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 space-y-0.5 text-[11px] text-slate-600">
                <div>Rain: <strong>{item.rain}</strong></div>
                <div>Humidity: <strong>{item.hum}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
