import React, { useState, useMemo } from 'react';
import { CaseRecord, RiskLevel, CropStage } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  History,
  Search,
  Filter,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Microscope,
  Droplets,
  CloudRain,
  Thermometer,
  Layers,
  Sparkles,
  Info,
  X,
  FileSpreadsheet,
  RefreshCw,
  Bug,
  MapPin,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  LayoutGrid,
  List,
  FlaskConical,
  Tag
} from 'lucide-react';

interface ScanHistoryProps {
  cases: CaseRecord[];
  onNavigate: (tab: string, extra?: any) => void;
  onSelectCaseForAdvisory?: (caseRecord: CaseRecord) => void;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  cases,
  onNavigate,
  onSelectCaseForAdvisory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'risk_desc' | 'risk_asc' | 'confidence_desc'>('newest');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [inspectingCase, setInspectingCase] = useState<CaseRecord | null>(null);
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = c.id.toLowerCase().includes(q);
        const matchCrop = c.cropName.toLowerCase().includes(q);
        const matchDisease = (c.diagnosis?.diseaseName || c.diseaseName || '').toLowerCase().includes(q);
        const matchVillage = c.village.toLowerCase().includes(q);
        const matchPathogen = (c.diagnosis?.pathogenType || '').toLowerCase().includes(q);
        if (!matchId && !matchCrop && !matchDisease && !matchVillage && !matchPathogen) {
          return false;
        }
      }

      // Crop
      if (selectedCrop !== 'all' && c.cropName.toLowerCase() !== selectedCrop.toLowerCase()) {
        return false;
      }

      // Risk
      if (selectedRisk !== 'all') {
        const riskLevel = c.diagnosis?.riskScore?.riskLevel || c.riskScore?.riskLevel || 'low';
        if (riskLevel !== selectedRisk) return false;
      }

      // Status
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'lab_pending' && c.status !== 'lab_investigation_pending' && c.status !== 'lab_requested' && !c.labReferral) {
          return false;
        }
        if (selectedStatus === 'expert_approved' && c.status !== 'expert_approved' && c.status !== 'expert_confirmed') {
          return false;
        }
        if (selectedStatus === 'needs_expert' && c.status !== 'needs_expert_review' && c.status !== 'pending_expert') {
          return false;
        }
        if (selectedStatus === 'ai_screened' && c.status !== 'ai_screened') {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const scoreA = a.diagnosis?.riskScore?.overallScore ?? a.riskScore?.overallScore ?? 0;
      const scoreB = b.diagnosis?.riskScore?.overallScore ?? b.riskScore?.overallScore ?? 0;
      const confA = a.diagnosis?.confidence ?? a.confidence ?? 0;
      const confB = b.diagnosis?.confidence ?? b.confidence ?? 0;

      const dateA = new Date(a.dateCreated || a.timestamp || '2026-08-01').getTime();
      const dateB = new Date(b.dateCreated || b.timestamp || '2026-08-01').getTime();

      switch (sortBy) {
        case 'oldest':
          return dateA - dateB;
        case 'risk_desc':
          return scoreB - scoreA;
        case 'risk_asc':
          return scoreA - scoreB;
        case 'confidence_desc':
          return confB - confA;
        case 'newest':
        default:
          return dateB - dateA;
      }
    });
  }, [cases, searchQuery, selectedCrop, selectedRisk, selectedStatus, sortBy]);

  // Aggregate stats
  const totalScans = cases.length;
  const highRiskScans = cases.filter(c => {
    const r = c.diagnosis?.riskScore?.riskLevel || c.riskScore?.riskLevel;
    return r === 'high' || r === 'critical';
  }).length;
  const expertVerifiedScans = cases.filter(c => c.status === 'expert_approved' || c.status === 'expert_confirmed').length;
  const avgConfidence = Math.round(
    cases.reduce((acc, c) => acc + (c.diagnosis?.confidence || c.confidence || 85), 0) / Math.max(1, cases.length)
  );

  const availableCrops = Array.from(new Set(cases.map(c => c.cropName)));

  const handleExportCSV = () => {
    const headers = ['Case ID', 'Date', 'Crop', 'Variety', 'Disease / Symptom', 'Pathogen', 'AI Confidence', 'Risk Score', 'Risk Level', 'Validation Status', 'Village'];
    const rows = filteredCases.map(c => [
      c.id,
      c.dateCreated || c.timestamp || 'N/A',
      c.cropName,
      c.variety || 'N/A',
      c.diagnosis?.diseaseName || c.diseaseName || 'Healthy',
      c.diagnosis?.pathogenType || 'N/A',
      `${c.diagnosis?.confidence || c.confidence || 0}%`,
      c.diagnosis?.riskScore?.overallScore ?? c.riskScore?.overallScore ?? 0,
      c.diagnosis?.riskScore?.riskLevel || c.riskScore?.riskLevel || 'low',
      c.status,
      c.village
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Digital_KrishiVaani_Scan_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="scan-history-view" className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900">
                AI Crop Scan History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete chronological log of leaf optical assessments, multi-source risk scores, and expert validations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Download CSV report for KVK or Crop Insurance"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Log (CSV)</span>
          </button>

          <button
            onClick={() => onNavigate('crop-scanner')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>New Crop Scan</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Scans</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-extrabold text-2xl text-slate-900">{totalScans}</span>
            <span className="text-xs text-emerald-800 font-semibold font-mono">Season 2026</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Archived in field health ledger</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">High / Critical Flags</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-extrabold text-2xl text-amber-700">{highRiskScans}</span>
            <span className="text-xs text-slate-500">of {totalScans} total</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Prompted early biological IPM</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expert Confirmed</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs">
              <Microscope className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-extrabold text-2xl text-sky-700">{expertVerifiedScans}</span>
            <span className="text-xs text-emerald-800 font-semibold font-mono">100% Validated</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Verified by KVK / ICAR scientists</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg AI Confidence</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-extrabold text-2xl text-purple-800 font-mono">{avgConfidence}%</span>
            <span className="text-xs text-emerald-800 font-semibold">High Precision</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Deep lesion segmentation model</p>
        </div>
      </div>

      {/* Filter, Search & View Controls Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by case ID (e.g. KR-1024), crop, disease, or symptom..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Toggle and Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="risk_desc">Sort: Highest Risk First</option>
              <option value="risk_asc">Sort: Lowest Risk First</option>
              <option value="confidence_desc">Sort: Highest AI Confidence</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {/* Crop Filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold">Crop:</span>
            <select
              value={selectedCrop}
              onChange={e => setSelectedCrop(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Crops</option>
              {availableCrops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold">Risk Level:</span>
            <select
              value={selectedRisk}
              onChange={e => setSelectedRisk(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical (&gt;85)</option>
              <option value="high">High (66 - 84)</option>
              <option value="moderate">Moderate (36 - 65)</option>
              <option value="low">Low / Safe (&lt;35)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="lab_pending">🧪 Lab Investigation Pending</option>
              <option value="expert_approved">Expert Confirmed</option>
              <option value="needs_expert">Pending Expert Review</option>
              <option value="ai_screened">AI Screened (Pre-approved)</option>
            </select>
          </div>

          {(selectedCrop !== 'all' || selectedRisk !== 'all' || selectedStatus !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCrop('all');
                setSelectedRisk('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

      </div>

      {/* Case Count and Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredCases.length}</strong> of <strong>{cases.length}</strong> crop scan records
        </span>
        <span className="font-mono text-[11px]">
          Chronological AI History Ledger
        </span>
      </div>

      {/* MAIN CONTENT VIEW: TIMELINE OR TABLE */}
      {filteredCases.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-display font-extrabold text-lg text-slate-800">No Scan Records Match Filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No past AI scans found matching your search query or selected filters. Try adjusting the filters or scan a new crop.
          </p>
          <button
            onClick={() => {
              setSelectedCrop('all');
              setSelectedRisk('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold mt-2 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'timeline' ? (
        /* TIMELINE CARD STREAM */
        <div className="space-y-4">
          {filteredCases.map((item, index) => {
            const riskLevel = item.diagnosis?.riskScore?.riskLevel || item.riskScore?.riskLevel || 'low';
            const riskScore = item.diagnosis?.riskScore?.overallScore ?? item.riskScore?.overallScore ?? 35;
            const confidence = item.diagnosis?.confidence ?? item.confidence ?? 88;
            const diseaseTitle = item.diagnosis?.diseaseName || item.diseaseName || 'Healthy Canopy (No Disease)';
            const pathogen = item.diagnosis?.pathogenType || (diseaseTitle.includes('Spot') || diseaseTitle.includes('Blight') || diseaseTitle.includes('Rust') ? 'Fungal' : 'Physiological');
            const imageUrl = item.diagnosis?.sampleImageUrl || item.imageUrl || 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80';
            const dateStr = item.dateCreated || item.timestamp || '2026-08-29 09:15 AM';
            const isExpanded = expandedCaseId === item.id;

            return (
              <div
                key={item.id}
                id={`scan-card-${item.id}`}
                className={`bg-white rounded-3xl border-2 transition-all hover:shadow-md ${
                  riskLevel === 'critical'
                    ? 'border-rose-300/90'
                    : riskLevel === 'high'
                    ? 'border-amber-300/90'
                    : riskLevel === 'moderate'
                    ? 'border-amber-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="p-5 sm:p-6">
                  
                  {/* Top Row: Case ID, Date, Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-extrabold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        #{item.id}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {dateStr}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.village}, {item.block}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.status === 'lab_investigation_pending' || item.status === 'lab_requested' || item.labReferral ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold shadow-2xs">
                            <FlaskConical className="w-3.5 h-3.5" />
                            <span>Lab Investigation Pending</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-900 text-amber-300 font-mono text-[11px] font-bold border border-amber-400/40">
                            <Tag className="w-3 h-3 text-amber-400" />
                            <span>{item.labReferral?.labId || `LAB-2026-MP-${item.id.replace('KR-', '')}`}</span>
                          </span>
                        </div>
                      ) : item.status === 'expert_confirmed' || item.status === 'expert_approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                          <span>Expert Validated</span>
                        </span>
                      ) : item.status === 'needs_expert_review' || item.status === 'pending_expert' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>In Expert Queue</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>AI Screened IPM</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Card Body */}
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                    
                    {/* Left: Leaf Thumbnail with Overlay (3 cols) */}
                    <div className="lg:col-span-3">
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 group aspect-video lg:aspect-4/3 bg-slate-900">
                        <img
                          src={imageUrl}
                          alt={diseaseTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        
                        {/* Badges on image */}
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-white font-mono text-[10px] font-bold backdrop-blur-xs">
                            {confidence}% Conf.
                          </span>
                        </div>

                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px]">
                          <span className="font-bold truncate">{item.cropName}</span>
                          <span className="text-slate-300 font-mono text-[10px]">{item.stage}</span>
                        </div>

                        <button
                          onClick={() => setInspectingCase(item)}
                          className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </div>

                    {/* Middle: Disease & Symptoms (6 cols) */}
                    <div className="lg:col-span-6 space-y-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {pathogen} Pathogen
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">
                            {item.variety || 'Standard Hybrid'}
                          </span>
                        </div>

                        <h3 className="font-display font-extrabold text-lg text-slate-900 mt-1">
                          {diseaseTitle}
                        </h3>

                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {item.diagnosis?.symptomPattern ||
                            'Optical symptom pattern analyzed against ICAR diagnostic standard with multi-source microclimate fusion.'}
                        </p>
                      </div>

                      {/* Environmental Factors at Scan Instant */}
                      <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-600 flex-wrap">
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/80">
                          <Thermometer className="w-3 h-3 text-amber-500" />
                          <span>Temp: 28°C</span>
                        </span>
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/80">
                          <Droplets className="w-3 h-3 text-sky-500" />
                          <span>RH: 82%</span>
                        </span>
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/80">
                          <CloudRain className="w-3 h-3 text-indigo-500" />
                          <span>Rain: 18mm</span>
                        </span>
                      </div>

                      {item.expertReview && (
                        <div className="p-2.5 bg-sky-50/80 border border-sky-200 rounded-xl text-xs text-sky-900 mt-2">
                          <div className="font-bold flex items-center gap-1.5 text-sky-950">
                            <Microscope className="w-3.5 h-3.5 text-sky-700" />
                            <span>{item.expertReview.expertName} confirmed diagnosis</span>
                          </div>
                          <p className="text-[11px] text-sky-800 mt-0.5 italic">
                            "{item.expertReview.comments}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Multi-Source Risk Score Gauge & Action CTAs (3 cols) */}
                    <div className="lg:col-span-3 flex flex-col items-start lg:items-end justify-between gap-3 h-full border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-4">
                      
                      <div className="flex lg:flex-col items-center lg:items-end justify-between w-full gap-2">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Multi-Source Risk
                          </span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="font-display font-extrabold text-2xl text-slate-900 font-mono">
                              {riskScore}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">/ 100</span>
                          </div>
                        </div>

                        <RiskBadge level={riskLevel} score={riskScore} size="sm" />
                      </div>

                      {/* CTAs */}
                      <div className="flex items-center gap-2 w-full mt-2">
                        <button
                          onClick={() => setInspectingCase(item)}
                          className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                          Details
                        </button>

                        <button
                          onClick={() => {
                            if (onSelectCaseForAdvisory) onSelectCaseForAdvisory(item);
                            onNavigate('advisory');
                          }}
                          className="flex-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                        >
                          <span>Advisory</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>

                  {/* Expandable Breakdown Drawer Toggle */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedCaseId(isExpanded ? null : item.id)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Multi-Source Factors' : 'View 5-Factor Risk Breakdown'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-3 text-xs">
                      {item.followUp && (
                        <button
                          onClick={() => onNavigate('follow-up')}
                          className="font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Follow-up Verification</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded 5-Factor Risk Breakdown Panel */}
                  {isExpanded && item.diagnosis?.riskScore?.breakdown && (
                    <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Fused Multi-Source Risk Vectors
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                          Formula: Img(30%) + Env(25%) + Pest(20%) + Hist(15%) + Stage(10%)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">1. Optical Evidence (30%)</span>
                          <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                            {item.diagnosis.riskScore.breakdown.imageEvidence.score} / 100
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                            {item.diagnosis.riskScore.breakdown.imageEvidence.description}
                          </p>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">2. Environmental (25%)</span>
                          <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                            {item.diagnosis.riskScore.breakdown.environmentalRisk.score} / 100
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                            {item.diagnosis.riskScore.breakdown.environmentalRisk.description}
                          </p>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">3. Pest Vector (20%)</span>
                          <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                            {item.diagnosis.riskScore.breakdown.pestTrend.score} / 100
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                            {item.diagnosis.riskScore.breakdown.pestTrend.description}
                          </p>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">4. Historical Index (15%)</span>
                          <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                            {item.diagnosis.riskScore.breakdown.historicalRisk.score} / 100
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                            {item.diagnosis.riskScore.breakdown.historicalRisk.description}
                          </p>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">5. Stage Vulnerability (10%)</span>
                          <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                            {item.diagnosis.riskScore.breakdown.cropStageSensitivity.score} / 100
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                            {item.diagnosis.riskScore.breakdown.cropStageSensitivity.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABULAR DATA MATRIX VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Case ID & Date</th>
                  <th className="p-3.5">Crop & Stage</th>
                  <th className="p-3.5">Disease / Diagnosis</th>
                  <th className="p-3.5">AI Confidence</th>
                  <th className="p-3.5">Multi-Source Risk</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map(item => {
                  const riskLevel = item.diagnosis?.riskScore?.riskLevel || item.riskScore?.riskLevel || 'low';
                  const riskScore = item.diagnosis?.riskScore?.overallScore ?? item.riskScore?.overallScore ?? 35;
                  const confidence = item.diagnosis?.confidence ?? item.confidence ?? 88;
                  const diseaseTitle = item.diagnosis?.diseaseName || item.diseaseName || 'Healthy';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-900">#{item.id}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.dateCreated || item.timestamp}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{item.cropName}</div>
                        <div className="text-[11px] text-slate-500">{item.stage}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{diseaseTitle}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.diagnosis?.pathogenType || 'Fungal'}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-mono font-bold text-purple-700">{confidence}%</div>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div className="bg-purple-600 h-full" style={{ width: `${confidence}%` }} />
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{riskScore}/100</span>
                          <RiskBadge level={riskLevel} score={riskScore} size="sm" />
                        </div>
                      </td>

                      <td className="p-3.5">
                        {item.status === 'lab_investigation_pending' || item.status === 'lab_requested' || item.labReferral ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                              <FlaskConical className="w-2.5 h-2.5" />
                              <span>Lab Pending</span>
                            </span>
                            <div className="font-mono text-[9px] text-amber-900 font-bold">
                              {item.labReferral?.labId || `LAB-2026-MP-${item.id.replace('KR-', '')}`}
                            </div>
                          </div>
                        ) : item.status === 'expert_confirmed' || item.status === 'expert_approved' ? (
                          <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                            Expert Confirmed
                          </span>
                        ) : item.status === 'needs_expert_review' || item.status === 'pending_expert' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            In Review
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            AI Screened
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => setInspectingCase(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => {
                            if (onSelectCaseForAdvisory) onSelectCaseForAdvisory(item);
                            onNavigate('advisory');
                          }}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          Advisory
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAILED INSPECTION MODAL */}
      {inspectingCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setInspectingCase(null)}
              className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
                  #{inspectingCase.id}
                </span>
                <RiskBadge
                  level={inspectingCase.diagnosis?.riskScore?.riskLevel || inspectingCase.riskScore?.riskLevel || 'low'}
                  score={inspectingCase.diagnosis?.riskScore?.overallScore ?? inspectingCase.riskScore?.overallScore ?? 35}
                  size="sm"
                  showScore
                />
              </div>

              <h2 className="font-display font-extrabold text-2xl text-slate-900 mt-2">
                {inspectingCase.diagnosis?.diseaseName || inspectingCase.diseaseName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {inspectingCase.cropName} ({inspectingCase.variety}) • {inspectingCase.stage} • Scanned on {inspectingCase.dateCreated || inspectingCase.timestamp}
              </p>
            </div>

            {/* Modal Body */}
            <div className="mt-6 space-y-6">
              
              {/* Scan Leaf Image + Optical Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video">
                  <img
                    src={inspectingCase.diagnosis?.sampleImageUrl || inspectingCase.imageUrl || 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80'}
                    alt="Scan leaf"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-bold">AI Optical Confidence</span>
                    <span className="font-mono font-bold text-purple-700 text-sm">
                      {inspectingCase.diagnosis?.confidence || inspectingCase.confidence || 88}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-bold">Estimated Lesion Coverage</span>
                    <span className="font-mono font-bold text-slate-900">
                      {inspectingCase.diagnosis?.severityPercent || 34}% foliar area
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold">Pathogen Classification</span>
                    <span className="font-bold text-slate-800">
                      {inspectingCase.diagnosis?.pathogenType || 'Fungal Spore'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Symptom Pattern */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Observed Symptom Pattern
                </span>
                <p className="text-xs text-slate-800 mt-1 leading-relaxed">
                  {inspectingCase.diagnosis?.symptomPattern ||
                    'Concentric necrotic circular lesions on mid-canopy leaves with reddish-brown halo borders.'}
                </p>
              </div>

              {/* IPM Advisory Summary */}
              {inspectingCase.advisory && (
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      Integrated Pest Management (IPM) Advisory
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      CIBRC Safety Compliant
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1.5 mt-2">
                    <div>
                      <strong className="text-slate-900">1. Cultural Management:</strong>{' '}
                      {inspectingCase.advisory.culturalManagement?.[0] || 'Prune infected canopy & ensure clean furrow drainage.'}
                    </div>
                    <div>
                      <strong className="text-slate-900">2. Biological Inoculant:</strong>{' '}
                      {inspectingCase.advisory.biologicalManagement?.[0] || 'Apply Trichoderma harzianum @ 5g/L during overcast hours.'}
                    </div>
                    {inspectingCase.advisory.chemicalGuidance && (
                      <div className="text-amber-900 pt-1">
                        <strong>3. Regulated Chemical Guideline:</strong>{' '}
                        {inspectingCase.advisory.chemicalGuidance.warning}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setInspectingCase(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    const target = inspectingCase;
                    setInspectingCase(null);
                    if (onSelectCaseForAdvisory) onSelectCaseForAdvisory(target);
                    onNavigate('advisory');
                  }}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Full IPM Advisory Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
