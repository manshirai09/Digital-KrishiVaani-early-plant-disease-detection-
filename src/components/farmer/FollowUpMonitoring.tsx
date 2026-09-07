import React, { useState } from 'react';
import { FollowUpRecord, UserRole } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  GitCompare,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  Database,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Camera,
  History
} from 'lucide-react';

interface FollowUpMonitoringProps {
  followUpData?: FollowUpRecord;
  onNavigate: (tab: string, extra?: any) => void;
  onSwitchRole?: (role: UserRole) => void;
}

export const FollowUpMonitoring: React.FC<FollowUpMonitoringProps> = ({
  followUpData,
  onNavigate,
  onSwitchRole
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  const followUp: FollowUpRecord = followUpData || {
    id: 'fu-01',
    caseId: 'KR-1024',
    cropName: 'Cotton (BG-II Bt)',
    fieldLocation: 'Cotton Field 01, Sanwer Block',
    initialDate: 'August 22, 2026',
    followUpDate: 'August 29, 2026 (Today)',
    treatmentApplied: 'Pseudomonas fluorescens bio-spray + targeted Azoxystrobin/Difenoconazole mist',
    beforeImageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
    beforeRiskScore: 78,
    afterRiskScore: 39,
    beforeSeverityPercent: 34,
    afterSeverityPercent: 12,
    outcomeStatus: 'improved',
    addedToRetrainingQueue: true,
    retrainingQueueId: 'RETRAIN-2026-894',
    expertVerifiedBy: 'Dr. Ananya Sharma (Scientist, ZARS)'
  };

  const riskReduction = followUp.beforeRiskScore - followUp.afterRiskScore;
  const severityReduction = followUp.beforeSeverityPercent - followUp.afterSeverityPercent;

  return (
    <div id="follow-up-monitoring-view" className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              Treatment Efficacy & Follow-up Verification
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
              Status: Recovery Verified ✓
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Closed-loop validation: Before/After disease regression & AI Ground-Truth Retraining dataset
          </p>
        </div>

        <button
          onClick={() => onNavigate('crop-scanner', { scenarioId: 'scenario-d' })}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Upload New Follow-up Scan</span>
        </button>
      </div>

      {/* Before / After Metrics Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/30 text-emerald-300 font-bold">
              CASE #{followUp.caseId}
            </span>
            <span className="text-xs text-emerald-200">7-Day Post-Intervention Assessment</span>
          </div>
          <h3 className="font-display font-extrabold text-2xl text-white mt-1">
            Foliar Health Successfully Restored
          </h3>
          <p className="text-xs text-emerald-200/90 max-w-xl mt-1">
            Targeted biological spray and cultural pruning halted lesion spread. Fungal necrosis dried with vigorous new vegetative shoot growth.
          </p>
        </div>

        <div className="flex items-center gap-4 text-center shrink-0">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/10">
            <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-bold">Risk Reduction</span>
            <span className="font-display font-extrabold text-3xl text-emerald-400">-{riskReduction} pts</span>
            <span className="text-[10px] text-emerald-200 block font-mono">78 → 39 / 100</span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/10">
            <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-bold">Severity Drop</span>
            <span className="font-display font-extrabold text-3xl text-emerald-400">-{severityReduction}%</span>
            <span className="text-[10px] text-emerald-200 block font-mono">34% → 12%</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Visual Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BEFORE CARD */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-300/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Initial Detection (Before)
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">{followUp.initialDate}</span>
              </div>
              <RiskBadge level="high" score={followUp.beforeRiskScore} showScore />
            </div>

            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 mb-3">
              <img
                src={followUp.beforeImageUrl}
                alt="Before treatment"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-lg font-mono">
                Active Necrosis: {followUp.beforeSeverityPercent}%
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              <p>• Concentric brown lesions with chlorotic halos expanding.</p>
              <p>• High fungal sporulation pressure (82% RH + rain).</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Diagnosed: Cotton Leaf Spot</span>
            <span className="font-bold text-amber-700">Risk: 78/100</span>
          </div>
        </div>

        {/* AFTER CARD */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-400 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Follow-up Recovery (After 7 Days)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">{followUp.followUpDate}</span>
              </div>
              <RiskBadge level="low" score={followUp.afterRiskScore} showScore />
            </div>

            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 mb-3">
              <img
                src={followUp.afterImageUrl}
                alt="After treatment"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg font-mono">
                Healed Scars: {followUp.afterSeverityPercent}%
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              <p>• Lesion margins dried and sealed without new fungal rings.</p>
              <p>• Active chlorophyll recovery in surrounding foliage.</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Treatment: Bio + IPM Spray</span>
            <span className="font-bold text-emerald-700">Risk: 39/100 (Safe)</span>
          </div>
        </div>

      </div>

      {/* Case Progression Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="font-display font-extrabold text-lg text-slate-900 mb-4">
          End-to-End Case Progression Timeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 block mb-1">STEP 1 • DAY 0</span>
            <h4 className="font-bold text-slate-900">Leaf AI Screening</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Farmer scans leaf; AI flags 91% confidence with 78 multi-source risk score.
            </p>
          </div>

          <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-xs">
            <span className="text-[10px] font-mono font-bold text-purple-700 block mb-1">STEP 2 • DAY 1</span>
            <h4 className="font-bold text-purple-950">Expert Scientist Review</h4>
            <p className="text-[11px] text-purple-900 mt-1">
              Dr. Ananya Sharma verifies symptom pattern and confirms IPM advisory.
            </p>
          </div>

          <div className="p-3.5 bg-teal-50 rounded-2xl border border-teal-200 text-xs">
            <span className="text-[10px] font-mono font-bold text-teal-700 block mb-1">STEP 3 • DAY 2</span>
            <h4 className="font-bold text-teal-950">Safe Treatment Applied</h4>
            <p className="text-[11px] text-teal-900 mt-1">
              Farmer implements canopy pruning and evening biocontrol spray.
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
            <span className="text-[10px] font-mono font-bold text-emerald-700 block mb-1">STEP 4 • DAY 7</span>
            <h4 className="font-bold text-emerald-950">Follow-up Verified</h4>
            <p className="text-[11px] text-emerald-900 mt-1">
              Risk drops to 39; outcome logged to government retraining queue.
            </p>
          </div>

        </div>
      </div>

      {/* AI Retraining & Ground-Truth Dataset Queue Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-purple-300">
                Ground-Truth AI Retraining Queue: #{followUp.retrainingQueueId}
              </span>
              <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
                LOGGED ✓
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              This verified case record (paired before/after images, IoT weather logs, and scientist-confirmed diagnosis) is automatically indexed to continuously retrain and calibrate localized AI vision models for Madhya Pradesh agro-climatic conditions.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onSwitchRole) onSwitchRole('officer');
            onNavigate('gis-map');
          }}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <span>View District GIS Map</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
