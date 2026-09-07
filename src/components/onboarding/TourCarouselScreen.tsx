import React, { useState, useEffect, useRef } from 'react';
import { I18nService } from '../../services/i18nService';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import {
  Camera,
  Mic,
  HeartPulse,
  CloudSun,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sprout,
  ShieldCheck
} from 'lucide-react';

interface TourCarouselScreenProps {
  onComplete: () => void;
  onBackToIntro?: () => void;
  onBackToAuth?: () => void;
}

export const TourCarouselScreen: React.FC<TourCarouselScreenProps> = ({
  onComplete,
  onBackToIntro,
  onBackToAuth
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const langMeta = I18nService.getCurrentLanguageMeta();

  // Localized Step definitions
  const steps = [
    {
      id: 'step-1',
      title: I18nService.t('tourStep1Title'),
      desc: I18nService.t('tourStep1Desc'),
      voice: I18nService.t('tourStep1Voice'),
      icon: Camera,
      badgeText: '1 / 5',
      illustration: (
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full border-2 border-dashed border-emerald-400/40 animate-spin-slow" />
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-xl shadow-emerald-950/40 border border-emerald-400/30">
            <Camera className="w-14 h-14 text-emerald-300 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
            🌱 1-Tap Photo
          </div>
        </div>
      )
    },
    {
      id: 'step-2',
      title: I18nService.t('tourStep2Title'),
      desc: I18nService.t('tourStep2Desc'),
      voice: I18nService.t('tourStep2Voice'),
      icon: Mic,
      badgeText: '2 / 5',
      illustration: (
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto flex items-center justify-center">
          <div className="absolute w-36 h-36 rounded-full bg-teal-500/15 animate-ping opacity-60" />
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-900 text-white flex items-center justify-center shadow-xl shadow-teal-950/40 border border-teal-400/30">
            <Mic className="w-14 h-14 text-teal-200" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-teal-300 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
            🎙️ VAANI
          </div>
        </div>
      )
    },
    {
      id: 'step-3',
      title: I18nService.t('tourStep3Title'),
      desc: I18nService.t('tourStep3Desc'),
      voice: I18nService.t('tourStep3Voice'),
      icon: HeartPulse,
      badgeText: '3 / 5',
      illustration: (
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto flex items-center justify-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-emerald-600 to-lime-700 text-white flex items-center justify-center shadow-xl shadow-emerald-950/40 border border-emerald-400/30">
            <Sprout className="w-14 h-14 text-emerald-100" />
          </div>
          <div className="absolute -bottom-2 bg-white text-emerald-900 font-extrabold text-xs px-3 py-1 rounded-full shadow-md border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{I18nService.t('cropHealthGood')}</span>
          </div>
        </div>
      )
    },
    {
      id: 'step-4',
      title: I18nService.t('tourStep4Title'),
      desc: I18nService.t('tourStep4Desc'),
      voice: I18nService.t('tourStep4Voice'),
      icon: CloudSun,
      badgeText: '4 / 5',
      illustration: (
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto flex items-center justify-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-sky-600 to-indigo-800 text-white flex items-center justify-center shadow-xl shadow-sky-950/40 border border-sky-400/30">
            <CloudSun className="w-14 h-14 text-sky-200" />
          </div>
          <div className="absolute -bottom-2 bg-sky-100 text-sky-900 font-extrabold text-xs px-3 py-1 rounded-full shadow-md border border-sky-300">
            🌦️ 28°C • {I18nService.t('rainChance')}
          </div>
        </div>
      )
    },
    {
      id: 'step-5',
      title: I18nService.t('tourStep5Title'),
      desc: I18nService.t('tourStep5Desc'),
      voice: I18nService.t('tourStep5Voice'),
      icon: HelpCircle,
      badgeText: '5 / 5',
      illustration: (
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto flex items-center justify-center">
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl flex flex-col items-center justify-center">
            <KrishiRakshakLogo
              size="lg"
              variant="vertical"
              theme="dark"
              showTagline={true}
              taglineText="Aapka AI Krishi Saathi"
            />
          </div>
        </div>
      )
    }
  ];

  const activeStep = steps[currentStep];

  // Voice narration for current step
  const handleSpeakCurrentStep = (overrideText?: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = overrideText || `${activeStep.title}. ${activeStep.voice || activeStep.desc}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    if (langMeta.voiceLangCode) {
      utterance.lang = langMeta.voiceLangCode;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speak step whenever step index changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSpeakCurrentStep();
    }, 300);

    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStep]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped Left -> Next Step
        if (currentStep < steps.length - 1) {
          setCurrentStep(s => s + 1);
        } else {
          onComplete();
        }
      } else {
        // Swiped Right -> Previous Step
        if (currentStep > 0) {
          setCurrentStep(s => s - 1);
        } else {
          if (onBackToAuth) onBackToAuth();
          else if (onBackToIntro) onBackToIntro();
        }
      }
    }
  };

  const handleNext = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    } else {
      if (onBackToAuth) onBackToAuth();
      else if (onBackToIntro) onBackToIntro();
    }
  };

  const handleSkip = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    onComplete();
  };

  return (
    <div
      id="tour-carousel-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen bg-gradient-to-b from-emerald-900 via-teal-950 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none"
    >
      {/* Header: Logo, Step 3 / 3 Badge & Skip Option */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <KrishiRakshakLogo
            size="sm"
            theme="dark"
            showTagline={false}
          />
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
            Step 3 / 3 • {activeStep.badgeText}
          </span>
          <div className="hidden sm:flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStep
                    ? 'w-6 bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleSkip}
          className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
        >
          {I18nService.t('btnSkip')} ✕
        </button>
      </div>

      {/* Main Single-Idea Card: Centered & Focused */}
      <div className="max-w-md mx-auto w-full my-auto text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 key={activeStep.id}">
        
        {/* Large Visual Illustration */}
        <div className="py-2">
          {activeStep.illustration}
        </div>

        {/* Step Title in Selected Language */}
        <div className="space-y-3">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
            {activeStep.title}
          </h2>
          <p className="text-base sm:text-lg text-emerald-100 font-medium leading-relaxed max-w-sm mx-auto">
            {activeStep.desc}
          </p>
        </div>

        {/* Audio Listen Button */}
        <div>
          <button
            onClick={() => handleSpeakCurrentStep()}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isSpeaking
                ? 'bg-amber-400 text-slate-950'
                : 'bg-white/15 hover:bg-white/25 text-emerald-200 border border-white/20'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>{I18nService.t('vaaniListeningNow')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>{I18nService.t('vaaniListenVoiceBtn')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Nav Controls: Previous & Next Buttons */}
      <div className="max-w-md mx-auto w-full pt-4 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>{I18nService.t('btnBack')}</span>
          </button>

          <button
            id="tour-next-btn"
            onClick={handleNext}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display font-black text-base shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>
              {currentStep === steps.length - 1
                ? I18nService.t('btnFinish')
                : I18nService.t('btnNext')}
            </span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
