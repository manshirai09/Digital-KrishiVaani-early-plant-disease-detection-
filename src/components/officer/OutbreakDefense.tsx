import React, { useState } from 'react';
import { GisHotspot } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  Flame,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Send,
  Plane,
  Radio,
  RefreshCw,
  CheckCircle2,
  MapPin,
  Users,
  Sparkles,
  Download,
  Box,
  BarChart3,
  Map,
  Clock,
  Crosshair,
  ChevronRight,
  Info
} from 'lucide-react';

interface OutbreakDefenseProps {
  hotspots: GisHotspot[];
  onNavigate: (tab: string) => void;
}

interface ActiveMission {
  id: string;
  code: string;
  cluster: string;
  block: string;
  targetPest: string;
  radiusKm: number;
  farmersCount: number;
  acresCovered: number;
  type: 'drone_spray' | 'bio_release' | 'sms_broadcast' | 'quarantine';
  status: 'deploying' | 'in_progress' | 'buffer_secured' | 'contained';
  progress: number;
  startedAt: string;
}

interface DepotItem {
  id: string;
  name: string;
  category: 'Bio-Fungicide' | 'Bio-Pesticide' | 'Pheromone Trap' | 'Machinery';
  stock: string;
  location: string;
  status: 'Ready' | 'Low Stock' | 'Dispatched';
  reorderMin: string;
}

export const OutbreakDefense: React.FC<OutbreakDefenseProps> = ({
  hotspots,
  onNavigate
}) => {
  // State for interactive operations
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>(hotspots[0]?.id || 'HOT-01');
  const [containmentRadius, setContainmentRadius] = useState<2 | 5 | 10>(5);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isSimulatingDrill, setIsSimulatingDrill] = useState(false);
  const [drillActive, setDrillActive] = useState(false);

  // Active missions
  const [missions, setMissions] = useState<ActiveMission[]>([
    {
      id: 'MIS-101',
      code: 'MISSION-IND-01',
      cluster: 'Sanwer Kalan Sector-3',
      block: 'Sanwer',
      targetPest: 'Cotton Leaf Spot & Sucking Pest',
      radiusKm: 5,
      farmersCount: 42,
      acresCovered: 180,
      type: 'drone_spray',
      status: 'in_progress',
      progress: 68,
      startedAt: '08:30 AM Today'
    },
    {
      id: 'MIS-102',
      code: 'MISSION-IND-02',
      cluster: 'Depalpur Rural Cluster',
      block: 'Depalpur',
      targetPest: 'Soybean Aerial Blight',
      radiusKm: 5,
      farmersCount: 68,
      acresCovered: 240,
      type: 'bio_release',
      status: 'buffer_secured',
      progress: 100,
      startedAt: 'Yesterday'
    },
    {
      id: 'MIS-103',
      code: 'MISSION-IND-03',
      cluster: 'Hatod Khurd Peripheral',
      block: 'Hatod',
      targetPest: 'Aphid Colony Incursion',
      radiusKm: 2,
      farmersCount: 31,
      acresCovered: 95,
      type: 'sms_broadcast',
      status: 'buffer_secured',
      progress: 100,
      startedAt: '09:45 AM Today'
    }
  ]);

  // Inventory items
  const [depotItems, setDepotItems] = useState<DepotItem[]>([
    {
      id: 'DEP-01',
      name: 'Trichoderma viride 1% WP (Bio-Fungicide)',
      category: 'Bio-Fungicide',
      stock: '1,450 Litres',
      location: 'KVK Kasturbagram Central Hub',
      status: 'Ready',
      reorderMin: '500 L'
    },
    {
      id: 'DEP-02',
      name: 'Pheromone Lures (Helicoverpa / Spodoptera)',
      category: 'Pheromone Trap',
      stock: '820 Units',
      location: 'Sanwer Agro Service Depot',
      status: 'Ready',
      reorderMin: '200 Units'
    },
    {
      id: 'DEP-03',
      name: 'Neem Seed Kernel Extract 10,000 PPM',
      category: 'Bio-Pesticide',
      stock: '380 Litres',
      location: 'Depalpur Extension Depot',
      status: 'Low Stock',
      reorderMin: '400 L'
    },
    {
      id: 'DEP-04',
      name: 'GPS Autonomous Spray Drones (16L Payload)',
      category: 'Machinery',
      stock: '6 Operational Units',
      location: 'Indore Agricultural Fleet Base',
      status: 'Ready',
      reorderMin: '2 Units'
    }
  ]);

  const selectedHotspot = hotspots.find(h => h.id === selectedHotspotId) || hotspots[0];

  // Handlers for defense actions
  const handleTriggerAction = (actionType: 'broadcast' | 'drone' | 'bio' | 'quarantine') => {
    const clusterName = selectedHotspot?.village || selectedHotspot?.villageName || selectedHotspot?.block || 'Selected Cluster';
    const farmers = (selectedHotspot?.farmersAffected || selectedHotspot?.activeFarmers || 35) * (containmentRadius === 2 ? 1 : containmentRadius === 5 ? 2 : 4);
    
    let label = '';
    let missionType: ActiveMission['type'] = 'sms_broadcast';

    if (actionType === 'broadcast') {
      label = `🚨 High-priority Voice & SMS Emergency Advisory dispatched to ${farmers} farmers in ${containmentRadius}km radius around ${clusterName}.`;
      missionType = 'sms_broadcast';
    } else if (actionType === 'drone') {
      label = `🚁 3 GPS Autonomous Drones dispatched for aerial biological barrier spraying across ${containmentRadius * 35} acres in ${clusterName}.`;
      missionType = 'drone_spray';
    } else if (actionType === 'bio') {
      label = `🧪 450L Trichoderma Viride and 200 Pheromone Lures requisitioned from KVK depot for immediate community deployment in ${clusterName}.`;
      missionType = 'bio_release';
    } else if (actionType === 'quarantine') {
      label = `🛑 Plant quarantine cordon activated for ${containmentRadius}km zone around ${clusterName}. Mandi inspectors alerted against transit of infected haulms.`;
      missionType = 'quarantine';
    }

    const newMission: ActiveMission = {
      id: `MIS-${Date.now().toString().slice(-3)}`,
      code: `MISSION-IND-${missions.length + 1}`,
      cluster: `${clusterName} (${containmentRadius}km Cordon)`,
      block: selectedHotspot?.block || 'Indore District',
      targetPest: selectedHotspot?.dominantIssue || selectedHotspot?.primaryDisease || 'General Pathogen',
      radiusKm: containmentRadius,
      farmersCount: farmers,
      acresCovered: containmentRadius * 35,
      type: missionType,
      status: 'in_progress',
      progress: 25,
      startedAt: 'Just Now'
    };

    setMissions([newMission, ...missions]);
    setActionSuccessMsg(label);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 6000);
  };

  const handleUpdateMissionStatus = (missionId: string) => {
    setMissions(prev =>
      prev.map(m => {
        if (m.id === missionId) {
          if (m.status === 'in_progress') {
            return { ...m, status: 'buffer_secured', progress: 100 };
          }
          if (m.status === 'buffer_secured') {
            return { ...m, status: 'contained', progress: 100 };
          }
        }
        return m;
      })
    );
  };

  const handleRunSimulatedDrill = () => {
    setIsSimulatingDrill(true);
    setTimeout(() => {
      setIsSimulatingDrill(false);
      setDrillActive(true);
      setActionSuccessMsg('⚠️ Simulated Outbreak Escalation Drill active: 85% RH anomaly in Depalpur triggered automated Tier-2 defense alerts and mobilized 4 drone squadrons.');
    }, 1200);
  };

  const handleIndentDepot = (itemId: string) => {
    setDepotItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, stock: 'Replenished (+500)', status: 'Ready' }
          : item
      )
    );
    setActionSuccessMsg('📦 Emergency stock replenishment indent sent to State Agricultural Supplies Board.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div id="outbreak-defense-view" className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200 pb-16">
      
      {/* Top Command Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 text-white rounded-3xl p-6 sm:p-8 border border-rose-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-extrabold border border-rose-400/30 flex items-center gap-1.5 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                DEFCON TIER-2: ACTIVE EPIDEMIC CONTAINMENT
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Indore District Command HQ
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              District Outbreak Defense & Containment Command
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Rapid response dispatch for early crop disease suppression. Deploy multi-hazard buffer cordons, drone biocontrol spraying fleets, and multi-lingual voice alerts across threatened agricultural clusters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('gis-map')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Map className="w-4 h-4 text-emerald-400" />
              <span>GIS Hotspot Map</span>
            </button>
            <button
              onClick={() => onNavigate('district-analytics')}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-rose-900/30"
            >
              <BarChart3 className="w-4 h-4 text-white" />
              <span>District Analytics</span>
            </button>
          </div>
        </div>

        {/* Live Defense KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-black/30 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">Active Threat Clusters</span>
            <span className="font-display font-extrabold text-2xl text-white mt-0.5 block">3 Blocks</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Sanwer, Depalpur, Hatod</span>
          </div>

          <div className="bg-black/30 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">Farmers in Alert Zone</span>
            <span className="font-display font-extrabold text-2xl text-white mt-0.5 block">141 Holdings</span>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">94% SMS Advisory Delivered</span>
          </div>

          <div className="bg-black/30 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">Buffer Zone Protected</span>
            <span className="font-display font-extrabold text-2xl text-white mt-0.5 block">515 Acres</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Pre-emptive Bio-Barrier</span>
          </div>

          <div className="bg-black/30 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">Active Containment Rate</span>
            <span className="font-display font-extrabold text-2xl text-white mt-0.5 block">91.4%</span>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">Spread Arrested &lt;48h</span>
          </div>
        </div>
      </div>

      {/* Interactive Drill and Notice Banner */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-950 text-emerald-100 border border-emerald-700/60 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-xs text-emerald-300 hover:text-white underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Protocol Dispatcher + Quick Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Rapid Cordon & Tactical Dispatch (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-900">
                    Emergency Containment Protocol Dispatcher
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select epicenter and deploy preventative biosecurity measures
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunSimulatedDrill}
                disabled={isSimulatingDrill}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isSimulatingDrill ? 'Simulating...' : 'Run Outbreak Drill'}</span>
              </button>
            </div>

            {/* Target Epicenter Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>1. Target Hotspot Epicenter:</span>
                <span className="text-[11px] text-indigo-700 font-semibold font-mono">
                  {hotspots.length} Clusters in District Database
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {hotspots.slice(0, 3).map(h => {
                  const isSelected = selectedHotspot?.id === h.id;
                  const name = h.village || h.villageName || h.block;
                  return (
                    <div
                      key={h.id}
                      onClick={() => setSelectedHotspotId(h.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50/50 shadow-xs ring-2 ring-rose-500/20'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-xs text-slate-900">{name}</span>
                        <RiskBadge level={h.riskLevel} size="sm" />
                      </div>
                      <span className="text-[11px] text-slate-600 font-medium mt-1 truncate">
                        {h.dominantIssue || h.primaryDisease || 'Infection Alert'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1">
                        {h.farmersAffected || h.activeFarmers || 30} farmers • {h.block}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Containment Radius Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>2. Defense Perimeter & Cordon Radius:</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {containmentRadius === 2 && 'Inner Epicenter Cordon'}
                  {containmentRadius === 5 && 'Standard KVK Protective Buffer'}
                  {containmentRadius === 10 && 'District Multi-Village Early Warning Ring'}
                </span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[2, 5, 10].map(rad => (
                  <button
                    key={rad}
                    type="button"
                    onClick={() => setContainmentRadius(rad as any)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      containmentRadius === rad
                        ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>{rad} km Buffer</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tactical Action Grid */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                3. Dispatch Immediate Defensive Action:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Action 1: Advisory Broadcast */}
                <button
                  type="button"
                  onClick={() => handleTriggerAction('broadcast')}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <Radio className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      Immediate
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-800">
                    Broadcast Voice & SMS Red Alert
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Multilingual IVR phone calls and SMS with curative biopesticide dosage sent to all farmers in {containmentRadius}km radius.
                  </p>
                </button>

                {/* Action 2: Drone Spray Fleet */}
                <button
                  type="button"
                  onClick={() => handleTriggerAction('drone')}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                      <Plane className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                      High Impact
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-800">
                    Deploy Drone Micro-Spraying Fleet
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Auto-generates GPS boundary routes for 16L spray drones to apply biological protective barriers along perimeter borders.
                  </p>
                </button>

                {/* Action 3: Bio-input Depot Mobilization */}
                <button
                  type="button"
                  onClick={() => handleTriggerAction('bio')}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Box className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Depot Mobilize
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                    Issue Bio-Agent Distribution Order
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Releases pre-authorized Trichoderma WP and pheromone lures through village societies at 80% state subsidy.
                  </p>
                </button>

                {/* Action 4: Quarantine Checkpoint */}
                <button
                  type="button"
                  onClick={() => handleTriggerAction('quarantine')}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      Containment
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                    Enforce Crop Transport Checkpoint
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Notifies regional APMC Mandis to inspect and isolate infected seedling trailers moving across block boundaries.
                  </p>
                </button>

              </div>
            </div>

          </div>

          {/* District Bio-Defense Depot Inventory */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-base text-slate-900">
                  District Bio-Defense Depot Stock Readiness
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time stock of non-chemical biological inputs across Indore KVK depots
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                100% Organic Biosecurity
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {depotItems.map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{item.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Ready'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Location: {item.location} • Minimum buffer: {item.reorderMin}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-extrabold text-xs text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      {item.stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIndentDepot(item.id)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Indent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Active Missions & Live Response Tracker (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Missions Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>Active Defense Operations</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {missions.filter(m => m.status !== 'contained').length} missions underway in field
                </p>
              </div>

              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>

            <div className="space-y-3">
              {missions.map(m => {
                const isComplete = m.status === 'buffer_secured' || m.status === 'contained';
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{m.code}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.status === 'in_progress'
                              ? 'bg-rose-100 text-rose-800'
                              : m.status === 'buffer_secured'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {m.status === 'in_progress' && '⚡ In Progress'}
                            {m.status === 'buffer_secured' && '✓ Buffer Secured'}
                            {m.status === 'contained' && '★ Contained'}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mt-1">
                          {m.cluster}
                        </h4>
                        <p className="text-[11px] text-slate-500">Target: {m.targetPest}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold text-slate-700 block font-mono">
                          {m.acresCovered} Acres
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {m.farmersCount} Farmers
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Perimeter Execution</span>
                        <span>{m.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isComplete ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400 font-mono text-[10px]">
                        Started: {m.startedAt}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleUpdateMissionStatus(m.id)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 transition-colors cursor-pointer text-[10px]"
                      >
                        {m.status === 'in_progress' ? 'Mark Buffer Secured' : 'Update Status'}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* Standard Operating Biosecurity Protocol Checklist */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>District Biosecurity Standard Operating Procedure (SOP)</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-white block font-semibold">T+0 Hours (Early Warning Alert)</strong>
                  AI multi-source radar triggers alert upon &gt;70 risk index or 12+ pests in trap.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-white block font-semibold">T+2 Hours (Automated Advisory)</strong>
                  Direct voice call + SMS sent to farmers in 5km buffer with crop-stage specific biocontrol advisory.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-white block font-semibold">T+12 Hours (Ground Verification)</strong>
                  Extension workers dispatched with geo-tagged verification tasks to ground-zero field.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-white block font-semibold">T+24 Hours (Containment Cordon)</strong>
                  Autonomous drone sprays and subsidised Trichoderma releases deployed along outer perimeter.
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('district-analytics')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View District Epidemiological Impact</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
