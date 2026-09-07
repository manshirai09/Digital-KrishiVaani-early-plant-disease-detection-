import React, { useState } from 'react';
import { FieldVisit, UserRole } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { StorageService } from '../../services/storageService';
import {
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  Camera,
  Navigation,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface ExtensionDashboardProps {
  visits: FieldVisit[];
  onNavigate: (tab: string, extra?: any) => void;
  onSwitchRole?: (role: UserRole) => void;
}

export const ExtensionDashboard: React.FC<ExtensionDashboardProps> = ({
  visits,
  onNavigate,
  onSwitchRole
}) => {
  const [activeVisits, setActiveVisits] = useState<FieldVisit[]>(visits);
  const [completingVisitId, setCompletingVisitId] = useState<string | null>(null);

  const handleCompleteVisit = (visitId: string) => {
    setActiveVisits(prev =>
      prev.map(v => v.id === visitId ? { ...v, status: 'completed', inspectionNotes: 'Physical leaf symptoms verified. Pseudomonas bio-packet handed over to farmer.' } : v)
    );
    alert('Field inspection completed & geoverified on blockchain ledger.');
  };

  return (
    <div id="extension-dashboard-view" className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/30 text-sky-300 font-bold">
                KVK EXTENSION CONSOLE
              </span>
              <span className="text-xs text-slate-400">Vikram Singh (KVK Indore Lead)</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl text-white mt-1">
              Field Extension & Ground Verification
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Proximity-based farm inspection tasks dispatched by Agricultural Scientists and Automated Early Warning Hotspot Triggers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 text-center min-w-24">
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">Pending Visits</span>
            <span className="font-display font-extrabold text-2xl text-white">
              {activeVisits.filter(v => v.status === 'scheduled').length}
            </span>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 text-center min-w-24">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Completed</span>
            <span className="font-display font-extrabold text-2xl text-white">
              {activeVisits.filter(v => v.status === 'completed').length}
            </span>
          </div>
        </div>
      </div>

      {/* Proximity Hotspot Alert Banner */}
      <div className="p-4 bg-amber-500/10 border-2 border-amber-400 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-950">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500 text-slate-950 rounded-xl mt-0.5">
            <Navigation className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm">
              Proximity Alert: High Risk Plot within 2.4 km
            </h4>
            <p className="text-xs text-amber-900/90 mt-0.5 max-w-2xl leading-relaxed">
              <strong>Ramesh Patidar (Cotton Field 01)</strong> triggered a 78 Multi-Source Risk Score. Recommended action: Deliver bio-fungicide inoculum and verify sprayer nozzle calibration.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onSwitchRole) onSwitchRole('farmer');
            onNavigate('advisory');
          }}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          View Farmer Advisory
        </button>
      </div>

      {/* Field Visits Task List */}
      <div className="space-y-3">
        <h3 className="font-display font-extrabold text-lg text-slate-900">
          Assigned Ground Inspection Tasks
        </h3>

        {activeVisits.map(v => {
          const isDone = v.status === 'completed';
          return (
            <div
              key={v.id}
              className={`bg-white p-5 rounded-3xl border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isDone ? 'border-slate-200 opacity-90' : 'border-sky-300/80 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
                  isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                }`}>
                  {isDone ? <CheckCircle2 className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{v.farmerName}</span>
                    <span className="text-xs text-slate-500">({v.cropName})</span>
                    <RiskBadge level={v.riskLevel} size="sm" />
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold font-mono ${
                      isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {isDone ? 'COMPLETED ✓' : 'SCHEDULED TODAY'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1">
                    📍 <strong>{v.village}</strong> • Reason: <em>{v.reason}</em>
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-2">
                    <span>Assigned: {v.scheduledDate}</span>
                    <span>•</span>
                    <span>Distance: {v.distanceKm || '2.4'} km</span>
                  </div>

                  {v.inspectionNotes && (
                    <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200 mt-2">
                      📝 Verified Note: {v.inspectionNotes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {!isDone ? (
                  <button
                    onClick={() => handleCompleteVisit(v.id)}
                    className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Inspection</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono font-bold text-emerald-700">Verified by GPS ✓</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
