import React, { useState } from 'react';
import { CaseRecord, UserRole } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  GraduationCap,
  Clock,
  AlertTriangle,
  FileCheck2,
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  MapPin,
  FlaskConical,
  Tag
} from 'lucide-react';

interface ExpertQueueProps {
  cases: CaseRecord[];
  onSelectCase: (caseRecord: CaseRecord) => void;
  onNavigate: (tab: string, extra?: any) => void;
}

export const ExpertQueue: React.FC<ExpertQueueProps> = ({
  cases,
  onSelectCase,
  onNavigate
}) => {
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'lab_pending' | 'low_confidence' | 'approved'>('needs_review');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = cases.filter(c => {
    if (filter === 'needs_review') return c.status === 'needs_expert_review' || c.status === 'pending_expert';
    if (filter === 'lab_pending') return c.status === 'lab_investigation_pending' || c.status === 'lab_requested' || !!c.labReferral;
    if (filter === 'low_confidence') return (c.diagnosis?.confidence ?? c.confidence ?? 0) < 75;
    if (filter === 'approved') return c.status === 'expert_approved' || c.status === 'expert_confirmed';
    return true;
  }).filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const disease = (c.diagnosis?.diseaseName || c.diseaseName || '').toLowerCase();
    const labTag = (c.labReferral?.labId || '').toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.cropName.toLowerCase().includes(q) ||
      disease.includes(q) ||
      c.farmerName.toLowerCase().includes(q) ||
      c.village.toLowerCase().includes(q) ||
      labTag.includes(q)
    );
  });

  const pendingCount = cases.filter(c => c.status === 'needs_expert_review' || c.status === 'pending_expert').length;
  const labPendingCount = cases.filter(c => c.status === 'lab_investigation_pending' || c.status === 'lab_requested' || !!c.labReferral).length;
  const approvedCount = cases.filter(c => c.status === 'expert_approved' || c.status === 'expert_confirmed').length;

  return (
    <div id="expert-queue-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/30 text-purple-300 font-bold">
                HUMAN-IN-THE-LOOP SAFETY CORE
              </span>
              <span className="text-xs text-slate-400">Dr. Ananya Sharma (Lead Scientist)</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl text-white mt-1">
              Expert Scientist Validation Queue
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Cases where AI confidence is sub-threshold (&lt;75%) or foliar severity is high are held here for human expert verification or laboratory molecular referral before chemical prescriptions unlock.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 text-center min-w-24">
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">Pending Review</span>
            <span className="font-display font-extrabold text-2xl text-white">{pendingCount}</span>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-2xl border border-amber-500/40 text-center min-w-24">
            <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider block flex items-center justify-center gap-1">
              <FlaskConical className="w-3 h-3 text-amber-400" /> In Lab Test
            </span>
            <span className="font-display font-extrabold text-2xl text-amber-300">{labPendingCount}</span>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 text-center min-w-24">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Validated</span>
            <span className="font-display font-extrabold text-2xl text-white">{approvedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilter('needs_review')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filter === 'needs_review'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Needs Review ({pendingCount})
          </button>

          <button
            onClick={() => setFilter('lab_pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              filter === 'lab_pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Lab Pending ({labPendingCount})</span>
          </button>

          <button
            onClick={() => setFilter('low_confidence')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filter === 'low_confidence'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Confidence &lt; 75%
          </button>

          <button
            onClick={() => setFilter('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filter === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Approved ({approvedCount})
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Cases ({cases.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search crop, farmer, Lab ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-600"
          />
        </div>

      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            <FileCheck2 className="w-12 h-12 mx-auto mb-2 opacity-30 text-purple-600" />
            <p className="text-sm font-bold text-slate-700">All cases in this view have been processed.</p>
            <p className="text-xs text-slate-400 mt-1">No pending validations match the active filter criteria.</p>
          </div>
        ) : (
          filteredCases.map(c => {
            const isLabCase = c.status === 'lab_investigation_pending' || c.status === 'lab_requested' || !!c.labReferral;
            const isPending = c.status === 'needs_expert_review' || c.status === 'pending_expert';
            const riskLevel = c.diagnosis?.riskScore?.riskLevel || c.riskScore?.riskLevel || 'low';
            const riskScore = c.diagnosis?.riskScore?.overallScore ?? c.riskScore?.overallScore ?? 50;
            const confidence = c.diagnosis?.confidence ?? c.confidence ?? 75;
            const diseaseName = c.diagnosis?.diseaseName || c.diseaseName || 'Crop Disease Observation';
            const imageUrl = c.diagnosis?.sampleImageUrl || c.imageUrl || 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80';
            const timestamp = c.dateCreated || c.timestamp || 'Today';
            const escalationReason = c.diagnosis?.escalationReason || c.escalationReason;
            const labTagId = c.labReferral?.labId || (isLabCase ? `LAB-2026-MP-${c.id.replace('KR-', '')}` : null);

            return (
              <div
                key={c.id}
                id={`case-card-${c.id}`}
                className={`bg-white p-5 rounded-3xl border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
                  isLabCase
                    ? 'border-amber-400/90 bg-amber-50/20 shadow-xs'
                    : isPending
                    ? 'border-amber-300/90 hover:border-amber-400 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                    <img
                      src={imageUrl}
                      alt={c.cropName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-slate-950/80 text-amber-300 text-[9px] font-mono font-bold rounded">
                      {confidence}% Conf
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-slate-400">
                        #{c.id}
                      </span>

                      {isLabCase ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500 text-slate-950 flex items-center gap-1 shadow-2xs">
                          <FlaskConical className="w-3 h-3" />
                          <span>LABORATORY INVESTIGATION PENDING</span>
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          isPending ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {isPending ? 'PENDING SCIENTIST' : 'APPROVED ✓'}
                        </span>
                      )}

                      {labTagId && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-amber-400" />
                          <span>Lab ID: {labTagId}</span>
                        </span>
                      )}

                      <RiskBadge level={riskLevel} score={riskScore} size="sm" showScore />
                    </div>

                    <h4 className="font-display font-extrabold text-base text-slate-900 mt-1">
                      {c.cropName} — {diseaseName}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Farmer: <strong>{c.farmerName}</strong></span>
                      <span>•</span>
                      <span>📍 Village {c.village} ({c.block})</span>
                      <span>•</span>
                      <span className="font-mono">{timestamp}</span>
                    </div>

                    {isLabCase && c.labReferral && (
                      <p className="text-xs font-medium text-amber-950 mt-2 bg-amber-100/90 px-3 py-1 rounded-xl border border-amber-300 inline-flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Referred to {c.labReferral.labName} ({c.labReferral.priority})</span>
                      </p>
                    )}

                    {!isLabCase && escalationReason && (
                      <p className="text-xs font-semibold text-amber-900 mt-2 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                        ⚠️ Gating Trigger: {escalationReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Action Button */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <button
                    id={`review-case-btn-${c.id}`}
                    onClick={() => {
                      onSelectCase(c);
                      onNavigate('expert-review', { caseId: c.id });
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                      isLabCase
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : isPending
                        ? 'bg-purple-700 hover:bg-purple-800 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>{isLabCase ? 'Inspect Lab Tag & Status' : isPending ? 'Review & Validate Case' : 'View Audit Log'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
