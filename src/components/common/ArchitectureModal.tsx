import React from 'react';
import {
  X,
  ShieldCheck,
  Cpu,
  Radio,
  CloudSun,
  MapPin,
  Users,
  GraduationCap,
  Sparkles,
  GitCompare,
  ArrowDown,
  ArrowRight,
  Database,
  Lock,
  Layers,
  FileCheck2
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div id="architecture-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-white">
                  Digital KrishiVaani Technical Architecture
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SIH 2026 ARCHITECTURE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                End-to-End Pipeline: AI Vision + IoT Telemetry + Multi-Source Risk Engine + Human Expert Gating
              </p>
            </div>
          </div>
          <button
            id="close-arch-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Diagram */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-50">

          {/* Core Innovation Callout */}
          <div className="p-4 bg-emerald-900/10 border border-emerald-600/30 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-700 shrink-0" />
              <div>
                <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                  The Core Safety & Architectural Innovation
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
                  We bridge the dangerous gap between pure AI image classification and real agricultural risk by combining <strong>multi-source physical telemetry</strong> with <strong>confidence-gated human expert validation</strong> before high-stakes interventions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs font-bold text-emerald-800">
                IPM First
              </span>
              <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs font-bold text-amber-800">
                &lt;75% Conf → Expert Review
              </span>
            </div>
          </div>

          {/* Visual Architecture Layers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Layer 1: Client Personas */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>1. User Tier (Role-Based)</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs">
                    <strong className="text-emerald-950 block">👨‍🌾 Farmer PWA</strong>
                    <span className="text-[11px] text-slate-600">Scan, risk gauge, multilingual voice advisory</span>
                  </div>
                  <div className="p-2.5 bg-sky-50/70 border border-sky-200/70 rounded-xl text-xs">
                    <strong className="text-sky-950 block">🛵 Extension Worker</strong>
                    <span className="text-[11px] text-slate-600">Proximity alerts, offline sync, farm check-ins</span>
                  </div>
                  <div className="p-2.5 bg-indigo-50/70 border border-indigo-200/70 rounded-xl text-xs">
                    <strong className="text-indigo-950 block">🏛️ Agri Officer</strong>
                    <span className="text-[11px] text-slate-600">District GIS surveillance & outbreak planner</span>
                  </div>
                  <div className="p-2.5 bg-purple-50/70 border border-purple-200/70 rounded-xl text-xs">
                    <strong className="text-purple-950 block">🔬 Expert / Scientist</strong>
                    <span className="text-[11px] text-slate-600">Confidence-gated review & advisory approval</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 2: Ingestion & Multi-Source Engine */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" />
                  <span>2. Data Ingestion Streams</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block">📷 AI Leaf Vision</span>
                    <span className="text-[11px] text-slate-500">30% Weight — Lesion & severity segmentation</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block">📡 IoT Node (ESP32)</span>
                    <span className="text-[11px] text-slate-500">25% Weight — Temp, RH%, Leaf Wetness, Soil</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block">🪤 Pest Trap Stream</span>
                    <span className="text-[11px] text-slate-500">20% Weight — Pheromone catch vs threshold</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block">🌦️ Weather & Phenology</span>
                    <span className="text-[11px] text-slate-500">25% Weight — 7-day forecast & stage sensitivity</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 3: Risk Engine & Safety Core */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>3. Decision & Gating Core</span>
                </div>
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs space-y-2 mb-2">
                  <span className="font-bold text-amber-950 block">Risk Calculation Algorithm</span>
                  <div className="font-mono text-[10px] text-slate-700 bg-white p-2 rounded-lg border border-amber-200">
                    Risk = 0.30·Img + 0.25·Env + 0.20·Pest + 0.15·Hist + 0.10·Stage
                  </div>
                </div>
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs">
                  <span className="font-bold text-rose-950 block">Confidence Safety Gating</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    If Confidence &lt; 75% or Severity &gt; 50% → Lock chemical prescriptions; route to Human Expert.
                  </p>
                </div>
              </div>
            </div>

            {/* Layer 4: Closed-Loop Follow-up & GIS */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>4. Feedback & Hotspot Surveillance</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="font-bold text-emerald-950 block">Before / After Follow-up</span>
                    <span className="text-[11px] text-slate-600">Farmer submits recovery scan; verifies 78 → 39 risk drop.</span>
                  </div>
                  <div className="p-2 bg-purple-50 border border-purple-200 rounded-xl">
                    <span className="font-bold text-purple-950 block">AI Retraining Queue</span>
                    <span className="text-[11px] text-slate-600">Ground-truth verified records feed continuous model tuning.</span>
                  </div>
                  <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <span className="font-bold text-indigo-950 block">District GIS Hotspot Heatmap</span>
                    <span className="text-[11px] text-slate-600">Village-level cluster mapping for containment.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Standards & Safety Note */}
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>
                <strong>Safety Guarantee:</strong> All chemical guidelines conform to CIBRC & state KVK packages. No generative LLM hallucination of active chemical dosages.
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">Govt of MP Agro-Climatic Zone VII</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
          <button
            id="arch-modal-done-btn"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close Architecture
          </button>
        </div>

      </div>
    </div>
  );
};
