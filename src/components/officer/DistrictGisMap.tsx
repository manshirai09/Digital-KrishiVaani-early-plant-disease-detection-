import React, { useState } from 'react';
import { GisHotspot } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { StorageService } from '../../services/storageService';
import {
  MapPin,
  Layers,
  Filter,
  ShieldAlert,
  Radio,
  Send,
  Download,
  AlertTriangle,
  Users,
  Sprout,
  Sparkles,
  Search,
  CheckCircle2,
  Flame,
  BarChart3
} from 'lucide-react';

interface DistrictGisMapProps {
  hotspots: GisHotspot[];
  onNavigate: (tab: string, extra?: any) => void;
}

export const DistrictGisMap: React.FC<DistrictGisMapProps> = ({
  hotspots,
  onNavigate
}) => {
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>(hotspots[0]?.id || 'hotspot-01');
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('all');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const selectedHotspot = hotspots.find(h => h.id === selectedHotspotId) || hotspots[0];

  const filteredHotspots = hotspots.filter(h => {
    if (selectedDiseaseFilter !== 'all' && !(h.primaryDisease || '').toLowerCase().includes(selectedDiseaseFilter.toLowerCase())) {
      return false;
    }
    if (selectedRiskFilter !== 'all' && h.riskLevel !== selectedRiskFilter) {
      return false;
    }
    return true;
  });

  const handleBroadcastAlert = () => {
    setBroadcastSent(true);
    StorageService.addNotification({
      id: `notif-broadcast-${Date.now()}`,
      title: `District Agricultural Advisory Broadcast for ${selectedHotspot.villageName}`,
      message: `Precautionary spray containment alert issued for ${selectedHotspot.affectedAcres} acres in ${selectedHotspot.block}.`,
      timestamp: 'Just now',
      type: 'risk_alert',
      riskLevel: selectedHotspot.riskLevel,
      read: false,
      targetRole: 'farmer',
      actionPath: 'advisory'
    });
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  return (
    <div id="district-gis-map-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              District GIS Surveillance & Outbreak Heatmap
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold font-mono">
              Indore District Lead
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time geospatial clustering across 5 agricultural blocks and 42 village polygons
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('outbreak-command')}
            className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-rose-300" />
            <span>Outbreak Defense</span>
          </button>
          <button
            onClick={() => onNavigate('district-analytics')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>District Analytics</span>
          </button>
          <button
            id="broadcast-alert-btn"
            onClick={handleBroadcastAlert}
            className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{broadcastSent ? 'Broadcast Dispatched ✓' : 'Broadcast Block Alert'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Map:
          </span>

          <select
            value={selectedDiseaseFilter}
            onChange={e => setSelectedDiseaseFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
          >
            <option value="all">All Pathogens</option>
            <option value="Cotton Leaf Spot">Cotton Leaf Spot</option>
            <option value="Soybean Rust">Soybean Rust</option>
            <option value="Aphids">Aphids & Sucking Pests</option>
          </select>

          <select
            value={selectedRiskFilter}
            onChange={e => setSelectedRiskFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk Hotspots</option>
            <option value="moderate">Moderate Risk</option>
            <option value="low">Low / Normal</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Showing <strong>{filteredHotspots.length}</strong> active clusters
        </div>
      </div>

      {/* Main Interactive Map Stage & Hotspot Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Simulated Vector Map Stage (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[460px]">
          
          {/* Map Top Metadata Overlay */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-white text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold">GIS Live Radar • Indore District (MP)</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-[10px] text-slate-300 font-mono">
              <span>Zoom: 11x</span>
              <span>•</span>
              <span>Projection: WGS84</span>
            </div>
          </div>

          {/* Graphical Map Canvas with Hotspot Pins & Heat Pulses */}
          <div className="relative w-full h-80 my-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 overflow-hidden flex items-center justify-center">
            
            {/* Grid Pattern & Agro Contour Lines */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px]" />
            <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" viewBox="0 0 500 300">
              <path d="M 50 120 Q 150 50 280 140 T 450 180" fill="none" stroke="#6366f1" strokeWidth="2" />
              <path d="M 30 200 Q 180 240 320 180 T 480 90" fill="none" stroke="#10b981" strokeWidth="2" />
              <polygon points="120,80 220,60 260,150 180,180 100,140" fill="#f59e0b" fillOpacity="0.1" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
            </svg>

            {/* Hotspot Pins positioned across map */}
            {filteredHotspots.map((h, i) => {
              const isSelected = selectedHotspot.id === h.id;
              // Deterministic spatial offsets
              const positions = [
                { top: '38%', left: '42%' }, // Sanwer
                { top: '55%', left: '25%' }, // Depalpur
                { top: '70%', left: '60%' }, // Mhow
                { top: '48%', left: '68%' }, // Indore Rural
                { top: '28%', left: '32%' }, // Hatod
              ];
              const pos = positions[i % positions.length];

              const isHigh = h.riskLevel === 'high' || h.riskLevel === 'critical';

              return (
                <div
                  key={h.id}
                  id={`gis-pin-${h.id}`}
                  style={{ top: pos.top, left: pos.left }}
                  onClick={() => setSelectedHotspotId(h.id)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                >
                  {/* Heat Pulse Ripple for High Risk Clusters */}
                  {isHigh && (
                    <span className="absolute -inset-3 rounded-full bg-rose-500/40 animate-ping pointer-events-none" />
                  )}

                  {/* Pin Node */}
                  <div className={`p-2 rounded-2xl flex items-center gap-1.5 shadow-2xl transition-all ${
                    isSelected
                      ? 'bg-white text-slate-950 scale-125 ring-4 ring-indigo-500/50'
                      : isHigh
                      ? 'bg-rose-600 text-white hover:scale-110'
                      : 'bg-indigo-600 text-white hover:scale-110'
                  }`}>
                    <MapPin className="w-4 h-4 fill-current" />
                    <span className="text-[10px] font-mono font-extrabold pr-1">
                      {h.villageName ? h.villageName.split(' ')[0] : 'Village'} ({h.caseCount})
                    </span>
                  </div>
                </div>
              );
            })}

          </div>

          {/* Map Legend Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 z-10 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Critical Hotspot (&gt;30 Cases)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Emerging Cluster
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Contained / Baseline
              </span>
            </div>
            <span className="font-mono text-slate-500">Agro-Climatic Zone VII (Malwa Plateau)</span>
          </div>

        </div>

        {/* Selected Hotspot Detailed Inspector Drawer (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Cluster Intelligence
              </span>
              <RiskBadge level={selectedHotspot.riskLevel} score={selectedHotspot.averageRiskScore} showScore />
            </div>

            <h3 className="font-display font-extrabold text-xl text-slate-900">
              {selectedHotspot.villageName}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{selectedHotspot.block} Block • Indore District</p>

            <div className="grid grid-cols-2 gap-2.5 my-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Active Diagnosed Cases</span>
                <span className="font-display font-extrabold text-2xl text-slate-900 mt-0.5 block">
                  {selectedHotspot.caseCount} <span className="text-xs font-sans text-slate-400">cases</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Vulnerable Crop Acreage</span>
                <span className="font-display font-extrabold text-2xl text-slate-900 mt-0.5 block">
                  {selectedHotspot.affectedAcres} <span className="text-xs font-sans text-slate-400">Acres</span>
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="text-slate-600">Dominant Pathogen:</span>
                <span className="font-bold text-slate-900">{selectedHotspot.primaryDisease}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="text-slate-600">Active Farmers Affected:</span>
                <span className="font-bold text-slate-900">{selectedHotspot.activeFarmers} Registered Kisans</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="text-slate-600">Containment Status:</span>
                <span className="font-bold text-amber-700">{(selectedHotspot.containmentStatus || 'Active').toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={handleBroadcastAlert}
              className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Advisory to {selectedHotspot.activeFarmers} Farmers</span>
            </button>

            <button
              onClick={() => onNavigate('outbreak-command')}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Launch Outbreak Defense Cordon</span>
            </button>

            <button
              onClick={() => onNavigate('district-analytics')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>District Epidemiological Analytics</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
