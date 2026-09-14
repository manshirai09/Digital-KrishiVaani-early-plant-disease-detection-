import React, { useState } from 'react';
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
  ArrowRight,
  Flame,
  ThermometerSun,
  ShieldAlert,
  Info
} from 'lucide-react';

interface WeatherIntelligenceProps {
  weather: WeatherData;
  onNavigate: (tab: string) => void;
}

export const WeatherIntelligence: React.FC<WeatherIntelligenceProps> = ({
  weather: initialWeather,
  onNavigate
}) => {
  // Optional local simulation state so users can test both Heavy Rainfall and Heatwave alerts
  const [simulatedRisk, setSimulatedRisk] = useState<'actual' | 'heavy_rain' | 'heatwave' | 'fair'>('actual');

  // Compute active weather based on actual state or simulation
  const weather: WeatherData = React.useMemo(() => {
    if (simulatedRisk === 'heavy_rain') {
      return {
        ...initialWeather,
        temp: 26.2,
        temperature: 26.2,
        humidity: 92,
        rainfallLast24h: 36,
        rainfallMm24h: 36,
        rainProbability: 95,
        condition: 'Severe Monsoonal Downpour & Torrential Rain',
        leafWetness: 'Very High',
        windSpeedKmH: 28,
        forecast: [
          { day: 'Today', temp: 26.2, humidity: 92, rainMm: 36, risk: 'critical', riskScore: 92 },
          { day: 'Tomorrow', temp: 25.8, humidity: 94, rainMm: 42, risk: 'critical', riskScore: 95 },
          { day: 'Day +2', temp: 27.0, humidity: 90, rainMm: 28, risk: 'high', riskScore: 86 },
          { day: 'Day +3', temp: 28.5, humidity: 85, rainMm: 14, risk: 'high', riskScore: 78 },
          { day: 'Day +4', temp: 30.0, humidity: 75, rainMm: 2, risk: 'moderate', riskScore: 65 },
        ]
      };
    }
    if (simulatedRisk === 'heatwave') {
      return {
        ...initialWeather,
        temp: 41.5,
        temperature: 41.5,
        humidity: 32,
        rainfallLast24h: 0,
        rainfallMm24h: 0,
        rainProbability: 5,
        condition: 'Severe Heatwave & Scorching Solar Radiation',
        leafWetness: 'Low',
        windSpeedKmH: 22,
        forecast: [
          { day: 'Today', temp: 41.5, humidity: 32, rainMm: 0, risk: 'critical', riskScore: 91 },
          { day: 'Tomorrow', temp: 42.8, humidity: 28, rainMm: 0, risk: 'critical', riskScore: 94 },
          { day: 'Day +2', temp: 42.0, humidity: 30, rainMm: 0, risk: 'critical', riskScore: 92 },
          { day: 'Day +3', temp: 40.5, humidity: 34, rainMm: 0, risk: 'high', riskScore: 84 },
          { day: 'Day +4', temp: 38.0, humidity: 40, rainMm: 0, risk: 'high', riskScore: 76 },
        ]
      };
    }
    if (simulatedRisk === 'fair') {
      return {
        ...initialWeather,
        temp: 24.5,
        temperature: 24.5,
        humidity: 58,
        rainfallLast24h: 0,
        rainfallMm24h: 0,
        rainProbability: 10,
        condition: 'Clear Skies & Optimal Agro-Climate',
        leafWetness: 'Low',
        windSpeedKmH: 12,
        forecast: [
          { day: 'Today', temp: 24.5, humidity: 58, rainMm: 0, risk: 'low', riskScore: 25 },
          { day: 'Tomorrow', temp: 25.0, humidity: 55, rainMm: 0, risk: 'low', riskScore: 28 },
          { day: 'Day +2', temp: 26.0, humidity: 60, rainMm: 0, risk: 'low', riskScore: 30 },
          { day: 'Day +3', temp: 25.5, humidity: 58, rainMm: 2, risk: 'low', riskScore: 32 },
          { day: 'Day +4', temp: 26.5, humidity: 52, rainMm: 0, risk: 'low', riskScore: 26 },
        ]
      };
    }
    return initialWeather;
  }, [initialWeather, simulatedRisk]);

  const currentTemp = weather.temperature ?? weather.temp ?? 28.4;
  const currentRain = weather.rainfallMm24h ?? weather.rainfallLast24h ?? 0;
  const currentHumidity = weather.humidity ?? 82;
  const currentRainProb = weather.rainProbability ?? 70;
  const currentWind = weather.windSpeedKmH ?? 14;

  // Evaluate high-risk weather patterns directly from weather state
  const weatherAlert = React.useMemo(() => {
    // 1. Check for Heatwave condition
    const hasHeatwave = currentTemp >= 36 || 
      (weather.forecast && weather.forecast.some(f => (f.temp || 0) >= 38)) ||
      (weather.condition && weather.condition.toLowerCase().includes('heat'));

    if (hasHeatwave) {
      const isExtreme = currentTemp >= 40;
      return {
        type: 'heatwave' as const,
        severity: isExtreme ? ('critical' as const) : ('high' as const),
        badgeText: isExtreme ? 'CRITICAL HEATWAVE ALERT' : 'HEATWAVE ADVISORY',
        subBadge: `${currentTemp}°C Extreme Thermal Stress`,
        title: 'Thermal Spike & Heatwave Threat Detected',
        description: `Ambient daytime temperatures have reached ${currentTemp}°C. High risk of pollen desiccation, rapid soil moisture depletion, and vegetative wilting across field plots.`,
        action: 'Schedule light evening irrigation, apply protective kaolin clay spray, and suspend chemical applications during peak daylight.',
        icon: Flame,
        badgeClasses: 'bg-rose-100 text-rose-900 border-rose-300',
        pulseColor: 'bg-rose-500',
        cardBg: 'bg-gradient-to-r from-rose-50 to-amber-50 border-rose-300 text-rose-950',
        iconBg: 'bg-rose-600 text-white'
      };
    }

    // 2. Check for Heavy Rainfall condition
    const maxForecastRain = weather.forecast ? Math.max(0, ...weather.forecast.map(f => f.rainMm || 0)) : 0;
    const hasHeavyRain = currentRain >= 18 || 
      currentRainProb >= 70 || 
      maxForecastRain >= 20 ||
      (weather.condition && (weather.condition.toLowerCase().includes('rain') || weather.condition.toLowerCase().includes('downpour')));

    if (hasHeavyRain) {
      const isExtremeRain = currentRain >= 30 || maxForecastRain >= 35;
      return {
        type: 'heavy_rain' as const,
        severity: isExtremeRain ? ('critical' as const) : ('high' as const),
        badgeText: isExtremeRain ? 'CRITICAL HEAVY RAINFALL ALERT' : 'HEAVY RAINFALL WARNING',
        subBadge: `${Math.max(currentRain, maxForecastRain)} mm Inundation Risk`,
        title: 'High Precipitation & Root Asphyxiation Alert',
        description: `Significant rainfall detected (${currentRain} mm last 24h, up to ${Math.max(currentRain, maxForecastRain)} mm in forecast). High probability (${currentRainProb}%) of field waterlogging, nutrient leaching, and root rot.`,
        action: 'Open field drainage furrows immediately, avoid standing water around stem collars, and cease all foliar fertilizer/pesticide sprays.',
        icon: CloudRain,
        badgeClasses: 'bg-blue-100 text-blue-900 border-blue-300',
        pulseColor: 'bg-blue-500',
        cardBg: 'bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-300 text-sky-950',
        iconBg: 'bg-blue-600 text-white'
      };
    }

    // 3. Check for High Wind / Lodging Risk
    if (currentWind >= 28) {
      return {
        type: 'high_wind' as const,
        severity: 'high' as const,
        badgeText: 'STRONG GALE & WIND SQUALL ALERT',
        subBadge: `${currentWind} km/h Gust Velocity`,
        title: 'Crop Lodging & Physical Canopy Damage Risk',
        description: `Sustained wind velocities exceeding ${currentWind} km/h detected. Taller crops (Maize, Cotton, Sugarcane) are at risk of mechanical lodging and stem breakage.`,
        action: 'Stake fragile nursery plants, avoid flood irrigation which loosens anchorage soil, and delay high-pressure mist spraying.',
        icon: Wind,
        badgeClasses: 'bg-amber-100 text-amber-900 border-amber-300',
        pulseColor: 'bg-amber-500',
        cardBg: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-950',
        iconBg: 'bg-amber-600 text-white'
      };
    }

    // 4. Check for High Humidity & Foliar Pathogen risk
    if (currentHumidity >= 85 && (weather.leafWetness === 'High' || weather.leafWetness === 'Very High')) {
      return {
        type: 'high_humidity' as const,
        severity: 'high' as const,
        badgeText: 'FOLIAR MOISTURE & SPORE ALERT',
        subBadge: `${currentHumidity}% Critical Wetness`,
        title: 'Pathogen-Conducive Microclimate Detected',
        description: `Sustained relative humidity of ${currentHumidity}% with extended leaf surface wetness creates ideal conditions for fungal spore germination (Anthracnose, Blast, Blight).`,
        action: 'Improve inter-row aeration, scout lower canopy leaves for lesions, and prepare bio-fungicide treatments once leaf surfaces dry.',
        icon: Droplets,
        badgeClasses: 'bg-purple-100 text-purple-900 border-purple-300',
        pulseColor: 'bg-purple-500',
        cardBg: 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300 text-purple-950',
        iconBg: 'bg-purple-600 text-white'
      };
    }

    // 5. Normal / Fair Weather
    return {
      type: 'stable' as const,
      severity: 'low' as const,
      badgeText: 'WEATHER NOMINAL: LOW RISK',
      subBadge: 'Optimal Field Conditions',
      title: 'Stable Agro-Climatic Window',
      description: 'Atmospheric conditions and soil moisture indices remain within favorable ranges for crop development and field operations.',
      action: 'Safe window for scheduled field work, fertigation, and proactive crop health scouting.',
      icon: CheckCircle2,
      badgeClasses: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      pulseColor: 'bg-emerald-500',
      cardBg: 'bg-emerald-50/60 border-emerald-300 text-emerald-950',
      iconBg: 'bg-emerald-600 text-white'
    };
  }, [currentTemp, currentRain, currentHumidity, currentRainProb, currentWind, weather]);

  const AlertIcon = weatherAlert.icon;

  return (
    <div id="weather-intelligence-view" className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Header with Visual Alert Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              Agro-Meteorological Intelligence
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold font-mono">
              IMD Doppler Radar Sync
            </span>

            {/* Visual Alert Badge in Header */}
            <div
              id="weather-alert-badge"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-2xs border transition-all ${weatherAlert.badgeClasses}`}
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${weatherAlert.pulseColor}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${weatherAlert.pulseColor}`} />
              </span>
              <AlertIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{weatherAlert.badgeText}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Micro-climate forecasting calibrated for Madhya Pradesh Agro-Climatic Zone VII
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => onNavigate('risk-forecast')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View 7-Day Disease Risk Forecast</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prominent High-Risk Weather Pattern Alert Banner */}
      <div
        id="weather-high-risk-alert-banner"
        className={`p-5 rounded-3xl border-2 transition-all shadow-sm ${weatherAlert.cardBg}`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-2xl shrink-0 mt-0.5 shadow-2xs ${weatherAlert.iconBg}`}>
              <AlertIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider border shadow-2xs ${weatherAlert.badgeClasses}`}>
                  {weatherAlert.badgeText}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/80 border border-slate-300/80 text-[11px] font-bold text-slate-700">
                  {weatherAlert.subBadge}
                </span>
                {weatherAlert.severity === 'critical' && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                    IMMEDIATE ACTION REQUIRED
                  </span>
                )}
              </div>
              <h4 className="font-extrabold text-base sm:text-lg mt-1.5 font-display text-slate-900">
                {weatherAlert.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-3xl leading-relaxed">
                {weatherAlert.description}
              </p>
              <div className="mt-2.5 flex items-start gap-1.5 text-xs font-semibold text-slate-800 bg-white/70 p-2.5 rounded-xl border border-slate-200/80">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Agronomic Advisory:</strong> {weatherAlert.action}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Simulation Chips to Test High-Risk Weather Patterns */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Test Weather State Presets:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSimulatedRisk('actual')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer border ${
                simulatedRisk === 'actual'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
              }`}
            >
              Current Field State
            </button>
            <button
              type="button"
              onClick={() => setSimulatedRisk('heavy_rain')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer border flex items-center gap-1 ${
                simulatedRisk === 'heavy_rain'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                  : 'bg-white text-blue-800 hover:bg-blue-50 border-blue-300'
              }`}
            >
              <CloudRain className="w-3 h-3" />
              <span>Heavy Rain (36mm)</span>
            </button>
            <button
              type="button"
              onClick={() => setSimulatedRisk('heatwave')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer border flex items-center gap-1 ${
                simulatedRisk === 'heatwave'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                  : 'bg-white text-rose-800 hover:bg-rose-50 border-rose-300'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Heatwave (41.5°C)</span>
            </button>
            <button
              type="button"
              onClick={() => setSimulatedRisk('fair')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer border flex items-center gap-1 ${
                simulatedRisk === 'fair'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-white text-emerald-800 hover:bg-emerald-50 border-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Fair Weather</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spray Window Safety Advisory Banner */}
      <div className={`p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-2 ${
        currentRain >= 15 || weatherAlert.type === 'heavy_rain'
          ? 'bg-amber-500/10 border-amber-300 text-amber-950'
          : 'bg-emerald-50 border-emerald-300 text-emerald-950'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl mt-0.5 ${
            currentRain >= 15 || weatherAlert.type === 'heavy_rain'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-emerald-600 text-white'
          }`}>
            {currentRain >= 15 || weatherAlert.type === 'heavy_rain' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="font-extrabold text-sm">
              {currentRain >= 15 || weatherAlert.type === 'heavy_rain'
                ? 'Spray Advisory: Rain Wash-Off Risk in Next 36 Hours'
                : 'Spray Advisory: Optimal Chemical Application Window Open'}
            </h4>
            <p className="text-xs mt-0.5 max-w-2xl leading-relaxed text-slate-700">
              {currentRain >= 15 || weatherAlert.type === 'heavy_rain'
                ? `Heavy rain spells (${currentRain}mm recorded, up to 40mm predicted). Do not apply foliar chemical sprays today to prevent chemical runoff and wasted inputs.`
                : `Favorable atmospheric conditions with low rain probability (${currentRainProb}%). Foliar application window is open with safe adhesion.`}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1.5 bg-white rounded-xl border font-mono text-xs font-bold shrink-0 ${
          currentRain >= 15 || weatherAlert.type === 'heavy_rain'
            ? 'border-amber-300 text-amber-900'
            : 'border-emerald-300 text-emerald-900'
        }`}>
          {currentRain >= 15 || weatherAlert.type === 'heavy_rain' ? 'Spray Window: Closed' : 'Spray Window: Open'}
        </div>
      </div>

      {/* Current Real-Time Atmospheric Conditions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-extrabold text-lg text-slate-900">
            Current Micro-Climate Telemetry
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Updated: {weather.condition || 'Live Sensors'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
            currentTemp >= 36 ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Surface Temp</span>
              {currentTemp >= 36 ? (
                <Flame className="w-5 h-5 text-rose-600 animate-bounce" />
              ) : (
                <CloudSun className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display font-extrabold text-3xl text-slate-900">
                {currentTemp}°C
              </span>
              {currentTemp >= 36 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white uppercase">
                  Heatwave
                </span>
              )}
            </div>
            <span className={`text-[11px] mt-2 font-medium ${
              currentTemp >= 36 ? 'text-rose-700 font-bold' : 'text-slate-500'
            }`}>
              {currentTemp >= 36 ? 'Thermal Spike Alert' : 'Dew Point: 24.2°C'}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
            currentHumidity >= 80 ? 'bg-sky-50/70 border-sky-300' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Relative Humidity</span>
              <Droplets className="w-5 h-5 text-sky-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display font-extrabold text-3xl text-slate-900">
                {currentHumidity}%
              </span>
              {currentHumidity >= 80 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-sky-600 text-white uppercase">
                  Foliar Risk
                </span>
              )}
            </div>
            <span className="text-[11px] text-rose-700 font-bold mt-2">
              {currentHumidity >= 80 ? 'High Fungal Spore Pressure' : 'Normal Humidity'}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
            currentRain >= 18 ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">24h Rainfall</span>
              <CloudRain className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display font-extrabold text-3xl text-slate-900">
                {currentRain} mm
              </span>
              {currentRain >= 18 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white uppercase">
                  Heavy Rain
                </span>
              )}
            </div>
            <span className={`text-[11px] mt-2 font-medium ${
              currentRain >= 18 ? 'text-blue-700 font-bold' : 'text-slate-500'
            }`}>
              Rain Prob: {currentRainProb}%
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Wind Velocity</span>
              <Wind className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display font-extrabold text-3xl text-slate-900">
                {currentWind} <span className="text-xs font-sans text-slate-400">km/h</span>
              </span>
              {currentWind >= 28 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-600 text-white uppercase">
                  Squall
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 mt-2">
              Direction: {weather.windDirection || 'WSW (12°)'}
            </span>
          </div>

        </div>
      </div>

      {/* 5-Day Agro-Weather Outlook with Risk Badges */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-extrabold text-lg text-slate-900">
            5-Day Agro-Weather Outlook
          </h3>
          <span className="text-xs text-slate-500">
            Includes Precipitation & Temperature Risk Gating
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {(weather.forecast && weather.forecast.length >= 5 ? weather.forecast.slice(0, 5) : [
            { day: 'Today', temp: currentTemp, rainMm: currentRain, humidity: currentHumidity, risk: currentRain >= 18 ? 'critical' : 'high' },
            { day: 'Tomorrow', temp: 27, rainMm: 24, humidity: 86, risk: 'critical' },
            { day: 'Day +2', temp: 29, rainMm: 12, humidity: 84, risk: 'high' },
            { day: 'Day +3', temp: 30, rainMm: 4, humidity: 76, risk: 'moderate' },
            { day: 'Day +4', temp: 32, rainMm: 0, humidity: 68, risk: 'low' },
          ]).map((item, idx) => {
            const isItemHeavyRain = (item.rainMm || 0) >= 18;
            const isItemHeatwave = (item.temp || 0) >= 36;
            
            let iconText = '⛅';
            let condText = 'Partly Cloudy';
            if (isItemHeatwave) {
              iconText = '🔥';
              condText = 'Heatwave';
            } else if (isItemHeavyRain) {
              iconText = '⛈️';
              condText = 'Heavy Rain';
            } else if ((item.rainMm || 0) > 5) {
              iconText = '🌧️';
              condText = 'Showers';
            } else if ((item.temp || 0) > 28) {
              iconText = '☀️';
              condText = 'Sunny';
            }

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between transition-all ${
                  isItemHeatwave
                    ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-200'
                    : isItemHeavyRain
                    ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.day}</span>
                    {isItemHeatwave && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white uppercase">
                        Heat
                      </span>
                    )}
                    {isItemHeavyRain && !isItemHeatwave && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-600 text-white uppercase">
                        Rain
                      </span>
                    )}
                  </div>
                  <span className="text-2xl my-2 block">{iconText}</span>
                  <span className="font-bold text-slate-800 block text-sm">{item.temp}°C</span>
                  <span className={`text-[11px] font-medium ${
                    isItemHeatwave ? 'text-rose-700 font-bold' : isItemHeavyRain ? 'text-blue-700 font-bold' : 'text-slate-500'
                  }`}>
                    {condText}
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 space-y-0.5 text-[11px] text-slate-600">
                  <div>Rain: <strong className={isItemHeavyRain ? 'text-blue-700' : ''}>{item.rainMm} mm</strong></div>
                  <div>Humidity: <strong>{item.humidity}%</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
