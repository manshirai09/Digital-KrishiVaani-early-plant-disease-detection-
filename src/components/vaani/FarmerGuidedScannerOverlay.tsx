import React, { useState, useEffect } from 'react';
import { I18nService } from '../../services/i18nService';
import { VaaniService } from '../../services/vaaniService';
import { GuidedScanStep, SupportedLanguageCode } from '../../types';
import {
  Volume2,
  VolumeX,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  X
} from 'lucide-react';

interface FarmerGuidedScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerCameraAction?: () => void;
}

export const FarmerGuidedScannerOverlay: React.FC<FarmerGuidedScannerOverlayProps> = ({
  isOpen,
  onClose,
  onTriggerCameraAction
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [currentLang, setCurrentLang] = useState<SupportedLanguageCode>(I18nService.getCurrentLanguage());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const steps = VaaniService.getGuidedSteps(currentLang);
  const activeStep = steps[currentStepIdx] || steps[0];

  useEffect(() => {
    const unsub = I18nService.subscribe(lang => setCurrentLang(lang));
    return unsub;
  }, []);

  // When step changes, read voice instruction aloud
  useEffect(() => {
    if (isOpen && activeStep) {
      playStepAudio(activeStep.voiceInstruction);
    }
  }, [currentStepIdx, isOpen]);

  if (!isOpen) return null;

  const playStepAudio = (text: string) => {
    setIsPlayingAudio(true);
    VaaniService.speak(text, currentLang, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const stepIcons = ['📷', '🍃', '⚙️', '🔍', '🛡️'];

  return (
    <div id="guided-scanner-overlay" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-950 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎙️</span>
            <div>
              <h3 className="font-display font-extrabold text-sm text-white">
                {I18nService.t('vaaniGuidedMode')}
              </h3>
              <p className="text-[10px] text-emerald-200">
                Step-by-step Voice & Visual Guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => playStepAudio(activeStep.voiceInstruction)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 hover:text-white transition-colors cursor-pointer"
              title="Replay Voice Guidance"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Indicators Bar */}
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-1">
          {steps.map((s, idx) => (
            <div key={idx} className="flex-1 flex items-center">
              <button
                type="button"
                onClick={() => setCurrentStepIdx(idx)}
                className={`w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  idx === currentStepIdx
                    ? 'bg-emerald-700 text-white shadow-xs font-extrabold'
                    : idx < currentStepIdx
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}
              >
                <span>{stepIcons[idx]}</span>
                <span className="hidden sm:inline">#{idx + 1}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Active Step Content */}
        <div className="p-6 text-center space-y-4">
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 border-2 border-emerald-200 text-4xl flex items-center justify-center shadow-inner">
            {stepIcons[currentStepIdx]}
          </div>

          <div>
            <span className="text-[11px] font-mono font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              STEP {currentStepIdx + 1} OF {steps.length}
            </span>
            <h4 className="font-display font-extrabold text-lg text-slate-900 mt-2">
              {activeStep.titleText}
            </h4>
            <p className="text-sm font-medium text-slate-700 mt-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 leading-relaxed">
              "{activeStep.voiceInstruction}"
            </p>
          </div>

          {/* Audio Visualizer Pill */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => playStepAudio(activeStep.voiceInstruction)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isPlayingAudio ? 'Speaking Voice...' : 'Replay Voice Instruction'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            💡 Tip: {activeStep.helperTip}
          </p>

        </div>

        {/* Step Navigation Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentStepIdx === 0}
            onClick={handlePrevStep}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{currentStepIdx === steps.length - 1 ? 'Finish Guide' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
