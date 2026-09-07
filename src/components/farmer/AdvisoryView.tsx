import React, { useState } from 'react';
import { AdvisoryPlan, CaseRecord } from '../../types';
import { VoicePlayer } from '../common/VoicePlayer';
import { StorageService } from '../../services/storageService';
import {
  ShieldCheck,
  Sprout,
  Bug,
  FlaskConical,
  AlertTriangle,
  Calendar,
  PhoneCall,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Tag,
  QrCode
} from 'lucide-react';

interface AdvisoryViewProps {
  advisory?: AdvisoryPlan;
  activeCase?: CaseRecord;
  onNavigate: (tab: string, extra?: any) => void;
  onOpenScheduleFollowUp?: () => void;
}

export const AdvisoryView: React.FC<AdvisoryViewProps> = ({
  advisory,
  activeCase,
  onNavigate
}) => {
  const [scheduledFollowUp, setScheduledFollowUp] = useState(false);
  const isLabPending = activeCase?.status === 'lab_investigation_pending' || activeCase?.status === 'lab_requested' || !!activeCase?.labReferral;
  const labDetails = activeCase?.labReferral;

  // Default demo advisory if none provided
  const currentAdvisory: AdvisoryPlan = advisory || {
    id: 'adv-01',
    caseId: activeCase?.id || 'KR-1024',
    diseaseName: 'Cotton Leaf Spot (Cercospora gossypina)',
    riskLevel: 'high',
    status: activeCase?.status === 'expert_approved' ? 'expert_approved' : 'pre_approved_ipm',
    expertConfirmedBy: activeCase?.expertNotes ? 'Dr. Ananya Sharma (Scientist, ZARS)' : undefined,
    approvalTimestamp: activeCase?.updatedAt || 'Today, 10:45 AM',
    culturalPractices: [
      'Prune and safely bury heavily infected lower canopy leaves to reduce inoculum load.',
      'Maintain field drainage to prevent root zone water stagnation during monsoon showers.',
      'Adjust nitrogen fertigation; avoid excess urea which creates soft, succulent tissue susceptible to fungi.'
    ],
    biologicalPractices: [
      'Foliar spray of *Pseudomonas fluorescens* (1% WP) @ 5g per litre of water during evening hours.',
      'Apply *Trichoderma viride* enriched neem cake @ 100 kg/acre around the root zone.',
      'Deploy 5 yellow sticky traps and 4 pheromone traps per acre for continuous pest monitoring.'
    ],
    chemicalGuidance: {
      allowed: true,
      activeIngredient: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
      dosagePerAcre: '200 ml in 200 L of water (1 ml/L)',
      applicationMethod: 'Fine mist knapsack sprayer covering both upper and lower leaf surfaces',
      waitingPeriodDays: 15,
      safetyPrecautions: [
        'Wear protective face mask, goggles, and nitrile gloves during preparation and spraying.',
        'Do not spray against the wind direction or during active honeybee foraging hours (morning).',
        'Strictly observe a 15-day pre-harvest interval (PHI) before boll picking.'
      ],
      cibrcApproved: true
    },
    audioAdvisoryText: 'नमस्ते किसान भाई, आपके कपास के खेत में पत्ती धब्बा रोग का जोखिम अधिक है। सबसे पहले नीचे की संक्रमित पत्तियों को हटाकर नष्ट करें। शाम के समय स्यूडोमोनास फ्लोरोसेंस का छिड़काव करें। यदि लक्षण बढ़ते हैं तो कृषि विश्वविद्यालय अनुशंसित कवकनाशी का सही मात्रा में उपयोग करें।'
  };

  const handleScheduleFollowUp = () => {
    setScheduledFollowUp(true);
    StorageService.addNotification({
      id: `notif-followup-${Date.now()}`,
      title: 'Follow-up Scan Scheduled',
      message: 'Reminder set for Day +7 to record treatment efficacy and log recovery verification.',
      timestamp: 'Just now',
      type: 'followup_reminder',
      riskLevel: 'low',
      read: false,
      targetRole: 'farmer',
      actionPath: 'follow-up'
    });
  };

  return (
    <div id="advisory-view" className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              Safe Agricultural Advisory (IPM)
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
              currentAdvisory.status === 'expert_approved'
                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {currentAdvisory.status === 'expert_approved' ? '✓ SCIENTIST VALIDATED' : '✓ PRE-APPROVED IPM'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Target: <strong>{currentAdvisory.diseaseName}</strong> • Integrated Pest & Disease Management
          </p>
        </div>

        {/* Action Header Button */}
        <button
          onClick={() => onNavigate('follow-up')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Before / After Follow-up</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Multilingual Voice Advisory Audio Player */}
      <VoicePlayer
        text={currentAdvisory.audioAdvisoryText}
        diseaseName={currentAdvisory.diseaseName}
        advisoryPlan={currentAdvisory}
        title="Voice-to-Speech Advisory Readout (किसान ऑडियो सलाहकार)"
      />

      {/* Laboratory Referral In Progress Banner */}
      {isLabPending && (
        <div className="p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white rounded-3xl border-2 border-amber-400 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    DIGITAL LAB ID: {labDetails?.labId || `LAB-2026-MP-${activeCase?.id.replace('KR-', '') || '1024'}`}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                    LABORATORY INVESTIGATION PENDING
                  </span>
                </div>
                <h4 className="font-display font-extrabold text-sm text-white mt-1">
                  Referred to: {labDetails?.labName || 'ICAR-IARI State Bio-Molecular Pathology Lab (Indore)'}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 rounded-xl border border-amber-400/30 text-[10px] font-mono text-amber-300">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Sample Tagged</span>
            </div>
          </div>

          <p className="text-xs text-amber-100/90 leading-relaxed">
            {labDetails?.referralReason ||
              'Case flagged by expert for molecular PCR / ELISA assay. Please practice cultural and bio-agent controls below while sample analysis is in progress.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
            <span>🔬 Test: <strong>{labDetails?.testRequested || 'Real-Time PCR DNA Assay'}</strong></span>
            <span>•</span>
            <span>Priority: <strong className="text-amber-300">{labDetails?.priority || 'Urgent (24h)'}</strong></span>
            <span>•</span>
            <span>Assigned Collector: <strong>{labDetails?.sampleCollector || 'Vikram Singh (Extension Worker)'}</strong></span>
          </div>
        </div>
      )}

      {/* Scientist Validation Badge Banner if approved */}
      {currentAdvisory.status === 'expert_approved' && (
        <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-3xl flex items-start justify-between gap-4 text-purple-950">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-700 text-white rounded-xl mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm">
                  Confirmed by Human Agricultural Scientist
                </h4>
                <span className="text-[10px] font-mono bg-purple-200/80 px-2 py-0.2 rounded font-bold">
                  {currentAdvisory.approvalTimestamp}
                </span>
              </div>
              <p className="text-xs text-purple-900 mt-0.5 leading-relaxed">
                <strong>{currentAdvisory.expertConfirmedBy}</strong> reviewed the leaf symptom segmentation alongside the 82% humidity telemetry and verified the IPM protocol.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3-Tier Safe IPM Hierarchy Container */}
      <div className="space-y-4">
        
        {/* Tier 1: Cultural Practices (First Line of Defense) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300/80 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                First Priority • Zero Chemical Cost
              </span>
              <h3 className="font-display font-extrabold text-base text-slate-900">
                Cultural & Mechanical Management
              </h3>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700 pl-10">
            {currentAdvisory.culturalPractices.map((prac, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{prac}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 2: Biological Management (Eco-Friendly Control) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-teal-300/80 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                Second Priority • Bio-Agents & Parasitoids
              </span>
              <h3 className="font-display font-extrabold text-base text-slate-900">
                Biological & Bio-Pesticide Intervention
              </h3>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700 pl-10">
            {currentAdvisory.biologicalPractices.map((prac, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: prac }} />
              </div>
            ))}
          </div>
        </div>

        {/* Tier 3: Regulated Chemical Guidance (Strict Label Compliance) */}
        {currentAdvisory.chemicalGuidance && (
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-300/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    Third Priority • Regulated Chemical Last Resort
                  </span>
                  <h3 className="font-display font-extrabold text-base text-slate-900">
                    Chemical Guidance (CIBRC Label Governed)
                  </h3>
                </div>
              </div>

              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold font-mono rounded-md border border-amber-200">
                CIBRC Approved ✓
              </span>
            </div>

            <div className="pl-10 space-y-3">
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Recommended Formulation:</span>
                  <span className="font-mono font-bold text-amber-950">{currentAdvisory.chemicalGuidance.activeIngredient}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Standard Dosage per Acre:</span>
                  <span className="font-mono font-semibold text-slate-900">{currentAdvisory.chemicalGuidance.dosagePerAcre}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Pre-Harvest Interval (Waiting Period):</span>
                  <span className="font-mono font-bold text-rose-700">{currentAdvisory.chemicalGuidance.waitingPeriodDays} Days Mandatory</span>
                </div>
              </div>

              {/* Safety Precautions */}
              <div className="space-y-1.5 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block">Mandatory Safety Precautions:</span>
                {currentAdvisory.chemicalGuidance.safetyPrecautions.map((sec, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed">{sec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Extension Support & Follow-up Action Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-white">Need On-Field Extension Assistance?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Connect with <strong>Vikram Singh</strong> (KVK Indore Extension Officer) or Kisan Call Center (1800-180-1551).
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleScheduleFollowUp}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              scheduledFollowUp
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{scheduledFollowUp ? 'Reminder Set for Day +7 ✓' : 'Schedule Day +7 Follow-up'}</span>
          </button>

          <button
            onClick={() => onNavigate('follow-up')}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
          >
            Follow-up Comparison
          </button>
        </div>
      </div>

      {/* Safety Guarantee Footer Banner */}
      <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-center text-xs text-slate-600">
        🛡️ <strong>Safety Guarantee:</strong> All chemical guidance adheres strictly to Central Insecticides Board & Registration Committee (CIBRC) and Jawaharlal Nehru Krishi Vishwa Vidyalaya (JNKVV) packages.
      </div>

    </div>
  );
};
