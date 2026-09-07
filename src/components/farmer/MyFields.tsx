import React, { useState } from 'react';
import { Farm, Crop } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import {
  Plus,
  MapPin,
  Camera,
  HeartPulse,
  Radio,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Sprout
} from 'lucide-react';

interface MyFieldsProps {
  farms: Farm[];
  onNavigate: (tab: string, extra?: any) => void;
  onOpenAddFarm: () => void;
  onOpenAddCrop: (farmId: string) => void;
}

export const MyFields: React.FC<MyFieldsProps> = ({
  farms,
  onNavigate,
  onOpenAddFarm,
  onOpenAddCrop
}) => {
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || '');

  const currentFarm = farms.find(f => f.id === selectedFarmId) || farms[0];

  return (
    <div id="my-fields-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & CTAs */}
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
              My Farm Fields (खेत और फसलें)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            “Aapka AI Krishi Saathi” • {farms.reduce((acc, f) => acc + f.crops.length, 0)} Active Plots • Georeferenced agricultural holdings
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="add-farm-btn"
            onClick={onOpenAddFarm}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>Add Farm</span>
          </button>

          <button
            id="add-crop-btn"
            onClick={() => onOpenAddCrop(currentFarm?.id || 'farm-01')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Crop</span>
          </button>
        </div>
      </div>

      {/* Farm Holdings Switcher Bar if multiple farms exist */}
      {farms.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {farms.map(farm => (
            <button
              key={farm.id}
              onClick={() => setSelectedFarmId(farm.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                currentFarm?.id === farm.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>{farm.name}</span>
              <span className="text-[10px] font-mono opacity-80">({farm.totalAreaAcres} acres)</span>
            </button>
          ))}
        </div>
      )}

      {/* Farm Overview Card */}
      {currentFarm && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-xl text-slate-900">
                  {currentFarm.name}
                </h3>
                <RiskBadge level={currentFarm.overallRisk} score={currentFarm.overallRiskScore} showScore />
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>📍 Village {currentFarm.village}, {currentFarm.block} Block, {currentFarm.district}</span>
                <span>•</span>
                <span>Soil: {currentFarm.soilType}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <span className="text-[10px] text-slate-400 block font-sans">Total Holding</span>
                <span className="font-bold text-sm">{currentFarm.totalAreaAcres} Acres</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <span className="text-[10px] text-slate-400 block font-sans">IoT Sensor Node</span>
                <span className="font-bold text-xs text-emerald-700 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" />
                  {currentFarm.sensorNodeId || 'ESP32 Online'}
                </span>
              </div>
            </div>
          </div>

          {/* Crops Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {currentFarm.crops.map((crop, idx) => {
              const isHigh = crop.riskLevel === 'high' || crop.riskLevel === 'critical';
              return (
                <div
                  key={crop.id}
                  id={`crop-card-${crop.id}`}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                    isHigh
                      ? 'border-amber-300 bg-amber-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Plot #{idx + 1}
                        </span>
                        <h4 className="font-display font-extrabold text-lg text-slate-900">
                          {crop.cropName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">{crop.variety}</p>
                      </div>
                      <RiskBadge level={crop.riskLevel} score={crop.riskScore} size="sm" showScore />
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-4 text-xs">
                      <div className="p-2 bg-white/80 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 block">Area</span>
                        <span className="font-bold text-slate-800">{crop.areaAcres} Acres</span>
                      </div>
                      <div className="p-2 bg-white/80 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 block">Phenology Stage</span>
                        <span className="font-bold text-slate-800 truncate block">{crop.stage}</span>
                      </div>
                    </div>

                    {crop.activeDisease && (
                      <div className={`p-2.5 rounded-xl text-xs mb-3 flex items-start gap-1.5 ${
                        isHigh ? 'bg-amber-100/70 text-amber-900' : 'bg-emerald-50 text-emerald-900'
                      }`}>
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">
                          {crop.activeDisease}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onNavigate('crop-health')}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      View Health
                    </button>
                    <button
                      onClick={() => onNavigate('crop-scanner', { cropName: crop.cropName, stage: crop.stage })}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Scan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
