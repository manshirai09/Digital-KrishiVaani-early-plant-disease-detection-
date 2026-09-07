import React from 'react';
import { IotSensorData } from '../../types';
import {
  Radio,
  RefreshCw,
  Droplets,
  Thermometer,
  CloudRain,
  Sprout,
  BatteryCharging,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

interface IotSensorMonitorProps {
  iotData: IotSensorData;
  onRefreshIot: () => void;
  onNavigate: (tab: string) => void;
}

export const IotSensorMonitor: React.FC<IotSensorMonitorProps> = ({
  iotData,
  onRefreshIot,
  onNavigate
}) => {
  return (
    <div id="iot-sensor-monitor-view" className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              Field IoT Micro-Climate Telemetry
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              ESP32 Node Online
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time canopy sensors streaming temperature, leaf wetness, humidity, and soil moisture
          </p>
        </div>

        <button
          id="refresh-iot-telemetry-btn"
          onClick={onRefreshIot}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Live Telemetry Ping</span>
        </button>
      </div>

      {/* Sensor Node Hardware Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono font-bold text-base text-white">{iotData.nodeId}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                MQTT over LoRaWAN / Cellular
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Deployed in: <strong>Cotton Field 01 (Canopy Height: 65cm)</strong> • Last sync: {iotData.lastUpdated}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
            <span>Solar Battery: {iotData.batteryPercent}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Signal: -68 dBm</span>
          </div>
        </div>
      </div>

      {/* 4 Core Sensor Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Relative Humidity */}
        <div className="bg-white p-5 rounded-3xl border-2 border-amber-300 bg-amber-50/20 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Canopy Humidity</span>
              <Droplets className="w-5 h-5 text-sky-500" />
            </div>
            <span className="font-display font-extrabold text-3xl text-slate-900">
              {iotData.humidity}% <span className="text-xs font-sans text-slate-400">RH</span>
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded mt-2 inline-block">
              Fungal Conducive (&gt;80%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
            High vapor pressure deficit promotes spore germination
          </p>
        </div>

        {/* Leaf Wetness Duration */}
        <div className="bg-white p-5 rounded-3xl border-2 border-rose-300 bg-rose-50/20 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Leaf Wetness</span>
              <Activity className="w-5 h-5 text-rose-500" />
            </div>
            <span className="font-display font-extrabold text-3xl text-slate-900">
              {iotData.leafWetnessHours} <span className="text-xs font-sans text-slate-400">Hours</span>
            </span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded mt-2 inline-block">
              Status: {iotData.leafWetnessLabel}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
            Foliar surface film exceeds the 6-hour spore threshold
          </p>
        </div>

        {/* Temperature */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Canopy Temp</span>
              <Thermometer className="w-5 h-5 text-amber-500" />
            </div>
            <span className="font-display font-extrabold text-3xl text-slate-900">
              {iotData.temperature}°C
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mt-2 inline-block">
              Optimal Crop Growth
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
            Diurnal range: 23.5°C min / 31.0°C max
          </p>
        </div>

        {/* Soil Moisture */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Soil Moisture</span>
              <Sprout className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="font-display font-extrabold text-3xl text-slate-900">
              {iotData.soilMoisture}% <span className="text-xs font-sans text-slate-400">VWC</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mt-2 inline-block">
              Adequate Root Moisture
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
            Root zone depth 15cm capacitive sensor
          </p>
        </div>

      </div>

      {/* Sensor -> Risk Engine Mathematical Pipeline Card */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-sm text-white">How IoT Telemetry Feeds the Multi-Source Risk Engine</h4>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">Live Risk Influence: +25%</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
            <span className="font-bold text-sky-400 block">1. RH &gt; 80% Detection</span>
            <p className="text-[11px] text-slate-300 mt-1">
              Provides constant moisture environment necessary for Cercospora & fungal sporulation.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
            <span className="font-bold text-rose-400 block">2. Leaf Wetness &gt; 6h</span>
            <p className="text-[11px] text-slate-300 mt-1">
              Water film allows germ tubes to penetrate stomatal leaf openings without drying out.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
            <span className="font-bold text-amber-400 block">3. Multi-Source Fusion</span>
            <p className="text-[11px] text-slate-300 mt-1">
              Engine shifts overall field status from LOW (24) to HIGH (78) even before heavy leaf necrosis spreads.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
