import React, { useState } from 'react';
import { CaseRecord, UserRole, LabReferralDetails } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { StorageService } from '../../services/storageService';
import {
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Droplets,
  CloudRain,
  Bug,
  Thermometer,
  ShieldCheck,
  Send,
  UserCheck,
  RotateCcw,
  FlaskConical,
  QrCode,
  Tag,
  Building2,
  TestTube,
  Microscope,
  Clock,
  Check,
  X,
  ExternalLink,
  Printer
} from 'lucide-react';

interface ExpertCaseReviewProps {
  caseRecord: CaseRecord;
  onNavigate: (tab: string, extra?: any) => void;
  onSwitchRole?: (role: UserRole) => void;
  onApproveSuccess: () => void;
}

export const ExpertCaseReview: React.FC<ExpertCaseReviewProps> = ({
  caseRecord,
  onNavigate,
  onSwitchRole,
  onApproveSuccess
}) => {
  const currentDisease = caseRecord.diagnosis?.diseaseName || caseRecord.diseaseName || 'Cotton Leaf Spot (Cercospora)';
  const currentRiskLevel = caseRecord.diagnosis?.riskScore?.riskLevel || caseRecord.riskScore?.riskLevel || 'high';
  const currentRiskScore = caseRecord.diagnosis?.riskScore?.overallScore ?? caseRecord.riskScore?.overallScore ?? 78;
  const currentConfidence = caseRecord.diagnosis?.confidence ?? caseRecord.confidence ?? 62;
  const currentImageUrl = caseRecord.diagnosis?.sampleImageUrl || caseRecord.imageUrl || 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80';
  const currentTimestamp = caseRecord.dateCreated || caseRecord.timestamp || 'Today';

  const [decision, setDecision] = useState<'confirmed' | 'refined' | 'overruled' | 'lab_referral'>('confirmed');
  const [selectedPathogen, setSelectedPathogen] = useState(currentDisease);
  const [scientistNotes, setScientistNotes] = useState(
    'Foliar lesion morphology indicates Cercospora leaf spot. Micro-climate humidity (82%) provides strong secondary corroboration. Recommend immediate cultural leaf stripping followed by Pseudomonas biocontrol foliar spray. If symptoms intensify past 30% threshold, follow standard CIBRC triazole spray schedule.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvedDone, setApprovedDone] = useState(false);

  // Laboratory Referral Workflow State
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [labReferralDone, setLabReferralDone] = useState(false);
  const [labId, setLabId] = useState(`LAB-2026-MP-${caseRecord.id.replace('KR-', '') || Math.floor(1000 + Math.random() * 9000)}`);
  const [labName, setLabName] = useState('ICAR-IARI State Diagnostic & Bio-Molecular Pathology Lab (Indore)');
  const [sampleType, setSampleType] = useState('Fresh foliar leaf tissue with active margin lesions');
  const [testRequested, setTestRequested] = useState('Real-Time PCR Pathogen DNA Sequencing & ELISA Viral Screen');
  const [priority, setPriority] = useState<'Urgent (24h)' | 'High (48h)' | 'Standard (72h)'>('Urgent (24h)');
  const [referralReason, setReferralReason] = useState(
    `Atypical concentric chlorosis with ambiguous optical AI confidence (${currentConfidence}%). High micro-climate humidity (82% RH) indicates potential virulent fungal or viral co-infection. Flagging for molecular PCR assay before prescribing Schedule-H chemical fungicides.`
  );

  const isLabPending = caseRecord.status === 'lab_investigation_pending' || caseRecord.status === 'lab_requested' || labReferralDone;
  const activeLabDetails = caseRecord.labReferral || (labReferralDone ? {
    labId,
    labName,
    sampleType,
    testRequested,
    priority,
    suspectedPathogen: selectedPathogen,
    referralDate: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    referralReason,
    referredByExpert: 'Dr. Ananya Sharma (Lead Agronomist & Pathologist)',
    sampleDispatchStatus: 'Dispatched with Field Agent' as const,
    sampleCollector: 'Vikram Singh (Extension Worker - Sanwer Block)',
    estimatedReportDate: priority.includes('24h') ? 'Tomorrow, 10:00 AM' : 'In 48 Hours'
  } : null);

  const handleApproveCase = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      StorageService.updateCaseStatus(caseRecord.id, 'expert_approved', scientistNotes);
      StorageService.addNotification({
        id: `notif-approved-${Date.now()}`,
        title: `Expert Confirmed Advisory for Case #${caseRecord.id}`,
        message: `Dr. Ananya Sharma validated your crop scan. Pre-approved IPM & bio-treatment protocol unlocked.`,
        timestamp: 'Just now',
        type: 'expert_update',
        riskLevel: currentRiskLevel,
        read: false,
        targetRole: 'farmer',
        actionPath: 'advisory'
      });
      setIsSubmitting(false);
      setApprovedDone(true);
      onApproveSuccess();
    }, 600);
  };

  const handleConfirmLabReferral = () => {
    setIsSubmitting(true);
    const referralData: LabReferralDetails = {
      labId,
      labName,
      sampleType,
      testRequested,
      priority,
      suspectedPathogen: selectedPathogen,
      referralDate: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      referralReason,
      referredByExpert: 'Dr. Ananya Sharma (Lead Scientist & Pathologist)',
      sampleDispatchStatus: 'Dispatched with Field Agent',
      sampleCollector: 'Vikram Singh (Extension Agent - Sanwer)',
      digitalBarcodeTag: `TAG-${labId}-${Date.now().toString().slice(-4)}`,
      estimatedReportDate: priority.includes('24h') ? 'Tomorrow, 10:00 AM' : 'Within 48 Hours'
    };

    setTimeout(() => {
      StorageService.referCaseToLab(caseRecord.id, referralData);
      setIsSubmitting(false);
      setLabReferralDone(true);
      setIsLabModalOpen(false);
      onApproveSuccess();
    }, 600);
  };

  const handleRequestFieldVisit = () => {
    StorageService.addNotification({
      id: `notif-field-visit-${Date.now()}`,
      title: `Field Inspection Requested: Case #${caseRecord.id}`,
      message: `Scientist requested physical ground verification at ${caseRecord.village} (${caseRecord.farmerName}).`,
      timestamp: 'Just now',
      type: 'general',
      riskLevel: currentRiskLevel,
      read: false,
      targetRole: 'extension',
      actionPath: 'field-visits'
    });
    alert(`Ground verification task dispatched to Extension Worker Vikram Singh.`);
  };

  return (
    <div id="expert-case-review-view" className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('expert-queue')}
            className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Back to Queue"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-extrabold text-2xl text-slate-900">
                Case Diagnostic Console
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-100 text-purple-900 border border-purple-300">
                #{caseRecord.id}
              </span>
              {isLabPending && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>LAB INVESTIGATION PENDING</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Farmer: <strong>{caseRecord.farmerName}</strong> • Village {caseRecord.village}, {caseRecord.block} Block • {currentTimestamp}
            </p>
          </div>
        </div>

        <RiskBadge level={currentRiskLevel} score={currentRiskScore} showScore />
      </div>

      {/* Case Approved Success Banner */}
      {approvedDone && (
        <div className="p-6 bg-emerald-950 text-white rounded-3xl border border-emerald-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                Diagnosis Validated & Advisory Pushed to Farmer!
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                Ramesh Patidar received the verified prescription. You can now switch back to the Farmer Persona to inspect the updated advisory.
              </p>
            </div>
          </div>

          <button
            id="view-as-farmer-btn"
            onClick={() => {
              if (onSwitchRole) onSwitchRole('farmer');
              onNavigate('advisory');
            }}
            className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer shrink-0"
          >
            Switch to Farmer Persona & View
          </button>
        </div>
      )}

      {/* Active Laboratory Referral Tag Banner if Case is Under Lab Testing */}
      {isLabPending && activeLabDetails && (
        <div
          id="lab-referral-active-banner"
          className="p-5 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 text-white rounded-3xl border-2 border-amber-400 shadow-xl space-y-4 animate-in fade-in"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-md">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-xs font-extrabold border border-amber-400/40">
                    DIGITAL LAB ID: {activeLabDetails.labId}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30">
                    {activeLabDetails.priority}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    Status: Laboratory Investigation Pending
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-base text-white mt-1">
                  Referral Testing Facility: {activeLabDetails.labName}
                </h3>
              </div>
            </div>

            {/* Print / Barcode Digital Tag */}
            <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-amber-500/30">
              <QrCode className="w-8 h-8 text-amber-400" />
              <div className="text-[10px] font-mono leading-tight">
                <span className="text-slate-400 block">DIGITAL SAMPLE TAG</span>
                <span className="text-amber-300 font-bold">{activeLabDetails.labId}</span>
              </div>
            </div>
          </div>

          {/* Referral Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Assay / Test Ordered</span>
              <span className="font-bold text-amber-200 mt-0.5 block">{activeLabDetails.testRequested}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sample Specimen</span>
              <span className="font-bold text-slate-200 mt-0.5 block">{activeLabDetails.sampleType}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Field Dispatch Agent</span>
              <span className="font-bold text-emerald-400 mt-0.5 block">{activeLabDetails.sampleCollector || 'Vikram Singh (Sanwer)'}</span>
            </div>
          </div>

          {/* Clinical Rationale */}
          <div className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-amber-400 mr-1">Scientist Referral Note:</span>
            {activeLabDetails.referralReason}
          </div>

          {/* Live Investigation Pipeline Tracker */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-bold mb-2">
              <span className="text-slate-400">Sample Tracking Pipeline:</span>
              <span className="text-amber-300 font-mono">Estimated Report: {activeLabDetails.estimatedReportDate || 'Tomorrow 10:00 AM'}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-center">
              <div className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-500 text-emerald-300">
                <span>1. Tag Generated ✓</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-900/60 border border-amber-500 text-amber-200 animate-pulse">
                <span>2. Field Pickup 🚚</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                <span>3. Lab Check-In</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                <span>4. Molecular Report</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Diagnostic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Multi-View Image Inspection Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-700" />
                <span>Optical Evidence Comparison</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                AI Confidence: {currentConfidence}%
              </span>
            </div>

            {/* Split Comparison Image Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Farmer Sample */}
              <div className="p-3 bg-slate-900 rounded-2xl text-white">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1.5">
                  <span>1. Farmer Camera Scan</span>
                  <span className="text-emerald-400">1080p Clear</span>
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={currentImageUrl}
                    alt="Farmer upload"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-amber-400/70 m-4 rounded-xl pointer-events-none" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Concentric foliar lesions present</span>
              </div>

              {/* ICAR Reference Standard */}
              <div className="p-3 bg-slate-900 rounded-2xl text-white">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1.5">
                  <span>2. ICAR Reference Atlas</span>
                  <span className="text-purple-300">Ground Truth</span>
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80"
                    alt="Reference standard"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Typical Cercospora gossypina</span>
              </div>

            </div>

            {/* Voice Note Player if farmer recorded one */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Farmer Voice Note Attached:</span>
                <span className="text-slate-500 text-[11px]">"Brown spots appeared 3 days ago after the heavy rain on south block..."</span>
              </div>
              <span className="px-2 py-1 bg-white rounded-lg border border-slate-200 font-mono text-[10px] font-bold text-emerald-800">
                0:14 Audio ✓
              </span>
            </div>

          </div>

          {/* Physical IoT Telemetry Corroboration */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Physical Micro-Climate Telemetry Corroboration
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Canopy Humidity</span>
                <span className="font-bold text-sky-700 mt-0.5 block flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" /> 82% RH
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Leaf Wetness</span>
                <span className="font-bold text-rose-700 mt-0.5 block">8.5 Hours</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">24h Rainfall</span>
                <span className="font-bold text-indigo-700 mt-0.5 block flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5" /> 18 mm
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Pheromone Trap</span>
                <span className="font-bold text-amber-700 mt-0.5 block flex items-center gap-1">
                  <Bug className="w-3.5 h-3.5" /> 18 insects
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Scientist Decision & Action Console (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                  Scientist Validation Gate
                </span>
                <h3 className="font-display font-extrabold text-lg text-slate-900 mt-0.5">
                  Diagnostic Decision
                </h3>
              </div>

              {/* Lab Referral Quick Badge */}
              <button
                id="open-lab-referral-quick-btn"
                type="button"
                onClick={() => setIsLabModalOpen(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Lab Referral</span>
              </button>
            </div>

            {/* Decision Radio Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision('confirmed')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  decision === 'confirmed'
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ✓ Confirmed
              </button>

              <button
                type="button"
                onClick={() => setDecision('refined')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  decision === 'refined'
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Refined
              </button>

              <button
                type="button"
                onClick={() => setDecision('overruled')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  decision === 'overruled'
                    ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Overruled
              </button>
            </div>

            {/* Pathogen Classification Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Verified Scientific Pathogen
              </label>
              <select
                value={selectedPathogen}
                onChange={e => setSelectedPathogen(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-purple-600 cursor-pointer"
              >
                <option value="Cotton Leaf Spot (Cercospora gossypina)">Cotton Leaf Spot (Cercospora gossypina)</option>
                <option value="Alternaria Leaf Blight (Alternaria macrospora)">Alternaria Leaf Blight (Alternaria macrospora)</option>
                <option value="Bacterial Blight / Angular Spot (Xanthomonas malvacearum)">Bacterial Blight (Xanthomonas malvacearum)</option>
                <option value="Grey Mildew / Dahiya (Ramularia areola)">Grey Mildew (Ramularia areola)</option>
                <option value="Tobacco Streak Virus / Necrosis (TSV)">Tobacco Streak Virus / Necrosis (TSV)</option>
              </select>
            </div>

            {/* Custom Scientist Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Scientist Prescription & Clinical Notes *
              </label>
              <textarea
                rows={4}
                value={scientistNotes}
                onChange={e => setScientistNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed outline-none focus:border-purple-600 focus:bg-white resize-none"
              />
            </div>

            {/* Actions: Approve, Lab Referral & Extension Dispatch */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              
              {/* Confirm & Approve Button */}
              <button
                id="approve-diagnosis-btn"
                onClick={handleApproveCase}
                disabled={isSubmitting || approvedDone}
                className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Validating & Broadcasting...' : approvedDone ? 'Case Approved ✓' : 'Confirm Diagnosis & Approve Advisory'}</span>
              </button>

              {/* Dedicated Lab Referral Button */}
              <button
                id="flag-laboratory-referral-btn"
                type="button"
                onClick={() => setIsLabModalOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-2xl text-xs font-extrabold shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FlaskConical className="w-4 h-4 text-slate-950" />
                <span>🧪 Flag for Laboratory Investigation (Attach Lab ID)</span>
              </button>

              {/* Dispatch Field Visit */}
              <button
                type="button"
                onClick={handleRequestFieldVisit}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-700" />
                <span>Dispatch Extension Worker Ground Visit</span>
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ================= LABORATORY REFERRAL WORKFLOW MODAL ================= */}
      {isLabModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            id="lab-referral-modal"
            className="bg-slate-900 text-white max-w-2xl w-full rounded-3xl border-2 border-amber-500/50 shadow-2xl p-6 space-y-5 my-8"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-md">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-extrabold text-lg text-white">
                      Laboratory Referral & Digital Sample Tagging
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Flag Case #{caseRecord.id} for diagnostic PCR/ELISA bio-assay & update status to 'Laboratory Investigation Pending'
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsLabModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Referral Form */}
            <div className="space-y-4 text-xs">
              
              {/* Digital Lab ID Tag Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Digital 'Lab ID' Tag (Barcode Identifier)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setLabId(`LAB-2026-MP-${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Regenerate Tag ID
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="digital-lab-id-input"
                    type="text"
                    value={labId}
                    onChange={e => setLabId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono font-extrabold text-amber-300 outline-none focus:border-amber-400"
                  />
                  <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>Barcode Ready</span>
                  </div>
                </div>
              </div>

              {/* Target Diagnostic Laboratory Facility */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Accredited Testing Facility / Pathology Center *
                </label>
                <select
                  id="lab-facility-select"
                  value={labName}
                  onChange={e => setLabName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="ICAR-IARI State Diagnostic & Bio-Molecular Pathology Lab (Indore)">
                    ICAR-IARI State Diagnostic & Bio-Molecular Pathology Lab (Indore)
                  </option>
                  <option value="JNKVV Department of Plant Pathology & Tissue Diagnostics (Jabalpur)">
                    JNKVV Department of Plant Pathology & Tissue Diagnostics (Jabalpur)
                  </option>
                  <option value="National Bureau of Agricultural Insect Resources (NBAIR) Molecular Bio-Assay Lab">
                    National Bureau of Agricultural Insect Resources (NBAIR) Molecular Bio-Assay Lab
                  </option>
                  <option value="State Agriculture University (SAU) Integrated Bio-Assay Testing Center">
                    State Agriculture University (SAU) Integrated Bio-Assay Testing Center
                  </option>
                </select>
              </div>

              {/* Test Assay & Sample Specimen Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Diagnostic Assay / Test Requested *
                  </label>
                  <select
                    id="lab-test-select"
                    value={testRequested}
                    onChange={e => setTestRequested(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Real-Time PCR Pathogen DNA Sequencing & ELISA Viral Screen">
                      Real-Time PCR Pathogen DNA Sequencing & ELISA Screen
                    </option>
                    <option value="Fungal Spore Isolation, Culturing & Microscopic Morphology">
                      Fungal Spore Isolation & Morphology Culture
                    </option>
                    <option value="Bacterial 16S rRNA Sequencing & Pathogenicity Assay">
                      Bacterial 16S rRNA Sequencing & Assay
                    </option>
                    <option value="Fungicide Resistance & Molecule Sensitivity Bio-Assay">
                      Fungicide Resistance & Molecule Sensitivity Test
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Sample Specimen Type *
                  </label>
                  <select
                    id="lab-sample-type-select"
                    value={sampleType}
                    onChange={e => setSampleType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Fresh foliar leaf tissue with active margin lesions">
                      Fresh foliar leaf tissue with active margin lesions
                    </option>
                    <option value="Root vascular tissue & rhizosphere soil sample">
                      Root vascular tissue & rhizosphere soil
                    </option>
                    <option value="Stem vascular core & petiole scraping">
                      Stem vascular core & petiole scraping
                    </option>
                    <option value="Live pest nymph specimen in sterile alcohol vial">
                      Live pest nymph specimen in sterile vial
                    </option>
                  </select>
                </div>

              </div>

              {/* Turnaround Priority Selection */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Investigation Priority & SLA *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Urgent (24h)', desc: 'High Outbreak Risk' },
                    { label: 'High (48h)', desc: 'Moderate Spread' },
                    { label: 'Standard (72h)', desc: 'Baseline Routine' }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPriority(p.label as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        priority === p.label
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs">{p.label}</div>
                      <div className="text-[10px] opacity-80">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rationale & Clinical Reason */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Clinical Reason for Lab Referral *
                </label>
                <textarea
                  id="lab-referral-reason-input"
                  rows={3}
                  value={referralReason}
                  onChange={e => setReferralReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 leading-relaxed outline-none focus:border-amber-400 resize-none"
                  placeholder="State why optical AI diagnosis is insufficient and laboratory testing is necessary..."
                />
              </div>

              {/* Automatic Workflow Actions Summary */}
              <div className="p-3 bg-amber-950/40 rounded-2xl border border-amber-500/30 text-[11px] text-amber-200/90 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>On Referral Confirmation:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[10px]">
                  <li>Case status updates to <strong>'Laboratory Investigation Pending'</strong>.</li>
                  <li>Digital Lab Tag <strong>{labId}</strong> is pinned to the case record and farmer dashboard.</li>
                  <li>Sample collection task is dispatched to Extension Worker Vikram Singh.</li>
                  <li>Farmer receives interim safe biological/cultural advisory while lab results are in progress.</li>
                </ul>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsLabModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                id="submit-lab-referral-btn"
                type="button"
                onClick={handleConfirmLabReferral}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <FlaskConical className="w-4 h-4" />
                <span>{isSubmitting ? 'Tagging & Dispatching...' : `Confirm Referral & Attach Tag (${labId})`}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
