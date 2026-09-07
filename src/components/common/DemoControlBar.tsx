import React, { useState } from 'react';
import { UserRole } from '../../types';
import { DEMO_SCENARIOS } from '../../data/mockData';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  ExternalLink
} from 'lucide-react';

interface DemoControlBarProps {
  currentRole: UserRole;
  activeTab: string;
  onNavigate: (role: UserRole, tab: string, extra?: any) => void;
  onSelectScenario: (scenarioId: string) => void;
  onResetData: () => void;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({
  currentRole,
  activeTab,
  onNavigate,
  onSelectScenario,
  onResetData
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const DEMO_STEPS = [
    {
      step: 1,
      title: 'Farmer Dashboard',
      role: 'farmer' as UserRole,
      tab: 'farmer-dashboard',
      desc: 'Namaste Farmer view with live weather & crop health risk status (72/100).'
    },
    {
      step: 2,
      title: 'Scan Crop Camera',
      role: 'farmer' as UserRole,
      tab: 'crop-scanner',
      desc: 'Open AI scanner with viewfinder, leaf quality validation, and voice notes.'
    },
    {
      step: 3,
      title: 'AI Screening (91%)',
      role: 'farmer' as UserRole,
      tab: 'crop-scanner',
      scenarioId: 'scenario-a',
      desc: 'Simulate MobileNet/ViT inference detecting Cotton Leaf Spot at 91% confidence.'
    },
    {
      step: 4,
      title: 'Multi-Source Risk Engine',
      role: 'farmer' as UserRole,
      tab: 'crop-health',
      desc: 'Fuses Leaf Image (30%) + IoT/Weather (25%) + Pest Trap (20%) + History (15%) = 78 HIGH.'
    },
    {
      step: 5,
      title: '7-Day Risk Forecast',
      role: 'farmer' as UserRole,
      tab: 'risk-forecast',
      desc: 'Risk trajectory increasing across +1 to +3 days driven by humidity and rainfall.'
    },
    {
      step: 6,
      title: 'Safe IPM Advisory',
      role: 'farmer' as UserRole,
      tab: 'advisory',
      desc: 'Cultural -> Biological -> Regulated Chemical guidance + multilingual audio playback.'
    },
    {
      step: 7,
      title: 'Low Confidence (62%) Escalation',
      role: 'farmer' as UserRole,
      tab: 'crop-scanner',
      scenarioId: 'scenario-b',
      desc: 'AI Confidence < 75% triggers safety guardrail, auto-routing case to Expert Queue.'
    },
    {
      step: 8,
      title: 'Expert Validation Queue',
      role: 'expert' as UserRole,
      tab: 'expert-queue',
      desc: 'Scientist view of pending high-stakes cases with telemetry evidence.'
    },
    {
      step: 9,
      title: 'Expert Case Review & Approval',
      role: 'expert' as UserRole,
      tab: 'expert-review',
      desc: 'Split comparison of farmer image, IoT telemetry, Confirm Diagnosis & Approve Advisory.'
    },
    {
      step: 10,
      title: 'Farmer Receives Confirmation',
      role: 'farmer' as UserRole,
      tab: 'advisory',
      desc: 'Shows "Expert Confirmed ✓" badge with tailored bio-agent recommendations.'
    },
    {
      step: 11,
      title: 'Before/After Follow-up Loop',
      role: 'farmer' as UserRole,
      tab: 'follow-up',
      desc: 'Post-treatment recovery image reduces risk from 78 to 39; logs to Retraining Queue.'
    },
    {
      step: 12,
      title: 'District GIS Hotspot Map',
      role: 'officer' as UserRole,
      tab: 'gis-map',
      desc: 'Government surveillance map showing Indore cluster cases, hotspots & outbreak containment.'
    },
    {
      step: 13,
      title: 'Outbreak Defense Command',
      role: 'officer' as UserRole,
      tab: 'outbreak-command',
      desc: 'Emergency biosecurity response, buffer zone cordons, drone spray dispatch & biocontrol mobilization.'
    },
    {
      step: 14,
      title: 'District Analytics & Epidemiology',
      role: 'officer' as UserRole,
      tab: 'district-analytics',
      desc: 'Block-level vulnerability hierarchy, 14-day AI epidemic forecast & official CSV report generation.'
    }
  ];

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleGoToStep = (index: number) => {
    setCurrentStepIndex(index);
    const target = DEMO_STEPS[index];
    onNavigate(target.role, target.tab, { scenarioId: target.scenarioId });
    if (target.scenarioId) {
      onSelectScenario(target.scenarioId);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      handleGoToStep(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      handleGoToStep(currentStepIndex - 1);
    }
  };

  if (!isExpanded) {
    return (
      <button
        id="demo-bar-collapsed-launcher"
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-full shadow-2xl border border-slate-700/80 text-xs font-bold hover:scale-105 transition-all cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
        <span>SIH 12-Step Demo Guide</span>
        <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] rounded-full">
          Step {currentStepIndex + 1}/12
        </span>
      </button>
    );
  }

  return (
    <div
      id="sih-demo-control-bar"
      className="bg-slate-950 text-white border-t border-slate-800 px-4 py-2.5 shadow-2xl z-30 sticky bottom-0"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Left: Step progress & Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-md">
              {currentStepIndex + 1}
            </span>
            <div className="hidden sm:block">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block leading-none">
                SIH DEMO STORYLINE
              </span>
              <span className="text-xs font-bold text-slate-100 truncate block">
                {currentStep?.title || 'SIH Demo Walkthrough'}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800/80 flex-1 truncate">
            <span className="font-semibold text-emerald-400">[{(currentStep?.role || 'demo').toUpperCase()}]: </span>
            <span>{currentStep?.desc || 'Interactive SIH demonstration'}</span>
          </div>
        </div>

        {/* Middle: Step Navigation Controls */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            id="demo-prev-step-btn"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800 transition-colors text-slate-300 cursor-pointer"
            title="Previous Demo Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-mono font-bold text-slate-400 px-1">
            {currentStepIndex + 1} / {DEMO_STEPS.length}
          </span>

          <button
            id="demo-next-step-btn"
            onClick={handleNextStep}
            disabled={currentStepIndex === DEMO_STEPS.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-900/40 transition-all cursor-pointer active:scale-95 disabled:opacity-40"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Quick Scenario Preset Dropdown */}
          <div className="relative group">
            <button
              id="demo-scenarios-btn"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium rounded-lg text-slate-200 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Scenarios</span>
            </button>
            <div className="absolute right-0 bottom-full mb-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Quick Scenario Jump
              </div>
              {DEMO_SCENARIOS.map(sc => (
                <button
                  key={sc.id}
                  onClick={() => {
                    onSelectScenario(sc.id);
                    if (sc.id === 'scenario-a' || sc.id === 'scenario-b' || sc.id === 'scenario-c') {
                      onNavigate('farmer', 'crop-scanner');
                    } else if (sc.id === 'scenario-d') {
                      onNavigate('farmer', 'follow-up');
                    }
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors text-xs flex flex-col gap-0.5 cursor-pointer"
                >
                  <span className="font-bold text-slate-200">{sc.name}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{sc.tag}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            id="demo-bar-minimize-btn"
            onClick={() => setIsExpanded(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Minimize Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
