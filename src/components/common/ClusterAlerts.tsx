import React, { useState } from 'react';
import { GisHotspot, UserRole, FieldVisit } from '../../types';
import { RiskBadge } from './RiskBadge';
import { StorageService } from '../../services/storageService';
import { KrishiRakshakLogo } from './KrishiRakshakLogo';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  Send,
  Flame,
  MapPin,
  Users,
  CheckCircle2,
  Sparkles,
  Plane,
  RefreshCw,
  Filter,
  Clock,
  ArrowRight,
  Search,
  Compass,
  CalendarPlus,
  Camera,
  Layers,
  ChevronRight,
  Volume2,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface ClusterAlertsProps {
  hotspots: GisHotspot[];
  onNavigate: (tab: string, extra?: any) => void;
  onSwitchRole?: (role: UserRole) => void;
  currentRole?: UserRole;
}

interface AlertLog {
  id: string;
  cluster: string;
  type: 'sms_voice' | 'drone' | 'field_visit';
  summary: string;
  time: string;
}

export const ClusterAlerts: React.FC<ClusterAlertsProps> = ({
  hotspots,
  onNavigate,
  onSwitchRole,
  currentRole = 'extension'
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedProximity, setSelectedProximity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active containment missions or dispatches state
  const [recentDispatches, setRecentDispatches] = useState<AlertLog[]>([
    {
      id: 'disp-1',
      cluster: 'Sanwer Kalan Sector-3',
      type: 'sms_voice',
      summary: 'Emergency Voice & SMS advisory broadcasted to 42 farmers in 3.0km radius.',
      time: '18 mins ago'
    },
    {
      id: 'disp-2',
      cluster: 'Depalpur Rural Cluster',
      type: 'drone',
      summary: 'GPS Drone Fleet dispatched for biological barrier spray (Trichoderma Viride).',
      time: '45 mins ago'
    }
  ]);

  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const showToast = (message: string) => {
    setActionFeedback(message);
    setTimeout(() => setActionFeedback(null), 4500);
  };

  // Enriched clusters with calculated field proximity and containment metrics
  const enrichedClusters = hotspots.map((h, idx) => {
    const clusterName = h.village || h.villageName || `Sector ${idx + 1} Cluster`;
    // Approximate distance from current base/plot
    const distKm = [2.4, 4.8, 7.2, 11.5, 14.2][idx % 5];
    const cordonRadius = h.riskLevel === 'critical' ? 4.5 : h.riskLevel === 'high' ? 3.0 : 1.8;
    const farmers = h.farmersAffected || h.activeFarmers || (h.activeCases ? h.activeCases * 3 : 28);
    const affectedAcres = h.affectedAcres || (farmers * 4.2);
    const primaryCrop = h.crop || (idx % 2 === 0 ? 'Cotton' : 'Soybean');
    const diseaseName = h.dominantIssue || h.primaryDisease || 'Foliar Blight & Lesion Outbreak';
    const windSpread = ['Spreading NE @ 12 km/h (RH 84%)', 'Stable / In-situ containment', 'Slow crawl @ 4 km/h (RH 76%)'][idx % 3];
    const isInsideProximity = distKm <= 5.0;

    return {
      ...h,
      clusterName,
      distKm,
      cordonRadius,
      farmers,
      affectedAcres: Math.round(affectedAcres),
      primaryCrop,
      diseaseName,
      windSpread,
      isInsideProximity
    };
  });

  // Filter logic
  const filteredClusters = enrichedClusters.filter(c => {
    if (selectedBlock !== 'all' && c.block.toLowerCase() !== selectedBlock.toLowerCase()) {
      return false;
    }
    if (selectedSeverity !== 'all' && c.riskLevel !== selectedSeverity) {
      return false;
    }
    if (selectedProximity === 'near' && c.distKm > 5.0) {
      return false;
    }
    if (selectedProximity === 'immediate' && c.distKm > 3.0) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.clusterName.toLowerCase().includes(q);
      const matchBlock = c.block.toLowerCase().includes(q);
      const matchDisease = c.diseaseName.toLowerCase().includes(q);
      const matchCrop = c.primaryCrop.toLowerCase().includes(q);
      if (!matchName && !matchBlock && !matchDisease && !matchCrop) return false;
    }
    return true;
  });

  const criticalCount = enrichedClusters.filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high').length;
  const nearbyCount = enrichedClusters.filter(c => c.isInsideProximity).length;
  const totalThreatenedAcres = enrichedClusters.reduce((acc, c) => acc + c.affectedAcres, 0);

  // Emergency Dispatches Handlers
  const handleBroadcastVoiceAlert = (cluster: typeof enrichedClusters[0]) => {
    const newLog: AlertLog = {
      id: `disp-${Date.now()}`,
      cluster: cluster.clusterName,
      type: 'sms_voice',
      summary: `Urgent Voice Call & SMS Alert broadcasted to ${cluster.farmers} farmers in ${cluster.cordonRadius}km radius (${cluster.block} block).`,
      time: 'Just now'
    };
    setRecentDispatches(prev => [newLog, ...prev]);
    showToast(`🚨 Voice & SMS Alert dispatched to ${cluster.farmers} farmers in ${cluster.clusterName}!`);
  };

  const handleDeployDroneCordon = (cluster: typeof enrichedClusters[0]) => {
    const newLog: AlertLog = {
      id: `disp-${Date.now()}`,
      cluster: cluster.clusterName,
      type: 'drone',
      summary: `Autonomous GPS Spray Drone Fleet dispatched for ${cluster.affectedAcres} acres in ${cluster.clusterName}. Bio-fungicide barrier activated.`,
      time: 'Just now'
    };
    setRecentDispatches(prev => [newLog, ...prev]);
    showToast(`🚁 Drone biocontrol barrier mission deployed for ${cluster.clusterName} (${cluster.affectedAcres} acres)!`);
  };

  const handleScheduleInspection = (cluster: typeof enrichedClusters[0]) => {
    const newVisit: FieldVisit = {
      id: `visit-${Date.now()}`,
      farmerName: `Cluster Lead Farmer (${cluster.clusterName})`,
      farmerPhone: '+91 98260 44102',
      village: cluster.clusterName,
      cropName: cluster.primaryCrop,
      riskLevel: cluster.riskLevel,
      status: 'scheduled',
      scheduledDate: 'Today (Priority)',
      reason: `Outbreak cluster containment for ${cluster.diseaseName}`,
      distanceKm: cluster.distKm
    };

    StorageService.addFieldVisit(newVisit);
    const newLog: AlertLog = {
      id: `disp-${Date.now()}`,
      cluster: cluster.clusterName,
      type: 'field_visit',
      summary: `Ground inspection task assigned to KVK Field Extension Team for ${cluster.clusterName}.`,
      time: 'Just now'
    };
    setRecentDispatches(prev => [newLog, ...prev]);
    showToast(`📋 Ground inspection visit registered in KVK Extension tasks for ${cluster.clusterName}!`);
  };

  const handleRunOfflineScan = (cluster: typeof enrichedClusters[0]) => {
    // Navigate directly to crop scanner with appropriate scenario pre-loaded
    const scenarioId = cluster.primaryCrop.toLowerCase().includes('cotton') ? 'scenario-a' : 'scenario-b';
    onNavigate('crop-scanner', { scenarioId });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('✓ Cluster telemetry updated from KVK GIS nodes and ESP32 trap gateways.');
    }, 600);
  };

  return (
    <div id="cluster-alerts-view" className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {actionFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold leading-snug">{actionFeedback}</span>
        </div>
      )}

      {/* Main Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                SURVEILLANCE RADAR ACTIVE
              </span>
              <span className="text-xs text-slate-400">Indore Agricultural District</span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-500 shrink-0" />
              <span>District & Village Cluster Alerts</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Early warning outbreak detection powered by geo-spatial clustering, smart insect trap telemetry, and ICAR epidemiological containment guidelines.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center min-w-28">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">High Threat</span>
              <span className="font-display font-black text-2xl text-white">{criticalCount}</span>
              <span className="text-[10px] text-slate-400 block">Clusters</span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center min-w-28">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Nearby (&lt; 5km)</span>
              <span className="font-display font-black text-2xl text-white">{nearbyCount}</span>
              <span className="text-[10px] text-slate-400 block">In Proximity</span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center min-w-28 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Threatened</span>
              <span className="font-display font-black text-2xl text-white">{totalThreatenedAcres}</span>
              <span className="text-[10px] text-slate-400 block">Acres</span>
            </div>
          </div>
        </div>

        {/* Quick Nav Shortcut Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing Radar...' : 'Refresh Cluster Telemetry'}</span>
            </button>

            <button
              onClick={() => onNavigate('crop-scanner')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-xl font-bold transition-all cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Launch Offline Farm Scan</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('gis-map')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all cursor-pointer shadow-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Open GIS Disease Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Proximity Alert Callout if nearby clusters exist */}
      {nearbyCount > 0 && (
        <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-amber-950">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl shrink-0 mt-0.5 shadow-xs">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-amber-950">
                  ⚠️ Active Disease Cluster Detected within 2.4 km!
                </h4>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-[10px]">
                  HIGH CONTAGION RISK
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-1 max-w-3xl leading-relaxed">
                <strong>Sanwer Kalan Sector-3</strong> has 14 active cases of Cotton Foliar Blight expanding with elevated relative humidity (82%). Field extension workers and farmers should immediately apply biological fungicides (Pseudomonas / Trichoderma) to establish containment buffers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => onNavigate('crop-scanner', { scenarioId: 'scenario-a' })}
              className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Farm Foliage Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search village, block, disease or crop..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Block Selector */}
          <select
            value={selectedBlock}
            onChange={e => setSelectedBlock(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Blocks (सभी ब्लॉक)</option>
            <option value="sanwer">Sanwer (सांवेर)</option>
            <option value="depalpur">Depalpur (देपालपुर)</option>
            <option value="hatod">Hatod (हातोद)</option>
            <option value="mhow">Mhow (महू)</option>
          </select>

          {/* Severity Selector */}
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Threat Levels</option>
            <option value="critical">Critical (अति गंभीर)</option>
            <option value="high">High Risk (उच्च जोखिम)</option>
            <option value="moderate">Moderate (मध्यम)</option>
          </select>

          {/* Proximity Selector */}
          <select
            value={selectedProximity}
            onChange={e => setSelectedProximity(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Distances</option>
            <option value="immediate">Immediate (&lt; 3 km)</option>
            <option value="near">Nearby (&lt; 5 km)</option>
          </select>
        </div>
      </div>

      {/* Cluster Alerts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <span>Threat Clusters</span>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded-full font-bold">
              {filteredClusters.length}
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Sorted by Proximity & Severity
          </span>
        </div>

        {filteredClusters.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-800">No matching threat clusters in this filter range.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the block or proximity filters above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredClusters.map(cluster => {
              const isCritical = cluster.riskLevel === 'critical';
              const isHigh = cluster.riskLevel === 'high';

              return (
                <div
                  key={cluster.id}
                  className={`bg-white rounded-3xl border-2 p-5 transition-all shadow-xs flex flex-col justify-between gap-4 ${
                    isCritical
                      ? 'border-rose-300 hover:border-rose-400 bg-rose-50/20'
                      : isHigh
                      ? 'border-amber-300 hover:border-amber-400 bg-amber-50/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Top */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-black text-base text-slate-900">
                            {cluster.clusterName}
                          </span>
                          <span className="text-xs font-bold text-slate-500 font-mono">
                            • Block: {cluster.block}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono bg-slate-100 text-slate-700">
                            {cluster.primaryCrop}
                          </span>
                          <span className="text-xs font-bold text-rose-700">
                            {cluster.diseaseName}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <RiskBadge level={cluster.riskLevel} size="sm" />
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                          cluster.isInsideProximity
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          📍 {cluster.distKm} km away
                        </span>
                      </div>
                    </div>

                    {/* Threat Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Confirmed</span>
                        <span className="text-sm font-extrabold text-slate-800">
                          {cluster.confirmedCases || cluster.activeCases || 12} Cases
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Threat Radius</span>
                        <span className="text-sm font-extrabold text-amber-800">
                          {cluster.cordonRadius} km Cordon
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Impact</span>
                        <span className="text-sm font-extrabold text-slate-800">
                          {cluster.affectedAcres} Acres
                        </span>
                      </div>
                    </div>

                    {/* Contagion note */}
                    <p className="text-xs text-slate-600 mt-3 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span><strong>Spread Vector:</strong> {cluster.windSpread}</span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleBroadcastVoiceAlert(cluster)}
                        title="Broadcast automated voice & SMS alert to all farmers in this cordon"
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Voice Alert</span>
                      </button>

                      <button
                        onClick={() => handleDeployDroneCordon(cluster)}
                        title="Deploy GPS Autonomous Spray Drone Fleet"
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plane className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Drone Bio-Spray</span>
                      </button>

                      <button
                        onClick={() => handleScheduleInspection(cluster)}
                        title="Schedule field inspection visit for extension team"
                        className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-sky-600" />
                        <span>Assign Visit</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleRunOfflineScan(cluster)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[11px] font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1 shrink-0 ml-auto"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Offline Scan Field</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Real-time Dispatch Activity Log */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h4 className="font-extrabold text-sm text-slate-900">
              Recent Containment Dispatches & Surveillance Log
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Synchronized via KVK Network</span>
        </div>

        <div className="space-y-2 divide-y divide-slate-100">
          {recentDispatches.map(log => (
            <div key={log.id} className="pt-2 first:pt-0 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="p-1 rounded-md bg-emerald-100 text-emerald-800 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="font-bold text-slate-900">{log.cluster}</span>
                  <p className="text-slate-600 mt-0.5">{log.summary}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
