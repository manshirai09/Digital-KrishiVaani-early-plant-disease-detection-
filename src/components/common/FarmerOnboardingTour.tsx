import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Mic,
  HeartPulse,
  CloudSun,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Volume2,
  CheckCircle2,
  Sprout,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { I18nService } from '../../services/i18nService';

interface FarmerOnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onOpenScan?: () => void;
  onOpenVaani?: () => void;
}

export const FarmerOnboardingTour: React.FC<FarmerOnboardingTourProps> = ({
  isOpen,
  onClose,
  onComplete,
  onOpenScan,
  onOpenVaani
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const steps = [
    {
      stepNumber: 1,
      tag: 'Swagat / Welcome',
      title: 'Namaste! Digital KrishiVaani mein aapka swagat hai',
      subtitle: 'नमस्ते! डिजिटल कृषिवाणी में आपका स्वागत है',
      description:
        'Digital KrishiVaani helps you check crop health early, protect your yield from pests and diseases, and provides instant audio guidance in your own language.',
      hindiDescription:
        'यह ऐप आपकी फसल की सेहत की जांच करता है, बीमारी से बचाता है और आपकी अपनी भाषा में सही सलाह देता है।',
      icon: Sprout,
      color: 'from-emerald-700 to-teal-900',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      illustrationBg: 'bg-emerald-500/10 text-emerald-600',
      highlightBox: '🌱 "See the risk before you see the damage — बीमारी आने से पहले सतर्क रहें"'
    },
    {
      stepNumber: 2,
      tag: 'Step 1: Scan Crop / फसल की फोटो लें',
      title: 'Apni fasal ki photo lekar bimari check karein',
      subtitle: 'अपनी फसल की फोटो खींचें और तुरंत जांचें',
      description:
        'Just point your camera at any affected leaf or crop. The app quickly identifies possible diseases and tells you what to do.',
      hindiDescription:
        'पत्ती या पौधे की साफ फोटो लें। ऐप तुरंत बीमारी पहचानकर आपको सही उपाय बताएगा।',
      icon: Camera,
      color: 'from-teal-800 to-emerald-950',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
      illustrationBg: 'bg-teal-500/10 text-teal-600',
      highlightBox: '📷 1-Tap Camera Scan • Clear picture of leaf in daylight'
    },
    {
      stepNumber: 3,
      tag: 'Step 2: Voice Assistant / वाणी आवाज़ सहायक',
      title: 'Bolkar sawaal poochhein — Ask VAANI',
      subtitle: 'बोलकर सवाल पूछें, जवाब सुनें',
      description:
        'You do not need to type! Simply press the microphone button and ask any farming or crop question in Hindi or your regional language.',
      hindiDescription:
        'टाइप करने की कोई ज़रूरत नहीं! बस माइक का बटन दबाएं और अपनी भाषा में कोई भी सवाल पूछें।',
      icon: Mic,
      color: 'from-emerald-800 to-slate-900',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      illustrationBg: 'bg-amber-500/10 text-amber-600',
      highlightBox: '🎙️ Supports 11 Indian Languages: Hindi, Marathi, Gujarati, Punjabi & more'
    },
    {
      stepNumber: 4,
      tag: 'Step 3: Crop Health / फसल की सेहत',
      title: 'Apni fasal ki sehat dekhein',
      subtitle: 'फसल की स्थिति एक नज़र में देखें',
      description:
        'Get a clear, color-coded health summary: "Healthy" or "Needs Attention", with easy 1-2-3 action steps you can follow immediately.',
      hindiDescription:
        'हरा मतलब स्वस्थ, पीला मतलब ध्यान देने की ज़रूरत। साफ और आसान 1-2-3 कदम।',
      icon: HeartPulse,
      color: 'from-teal-900 to-slate-950',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      illustrationBg: 'bg-sky-500/10 text-sky-600',
      highlightBox: '🌱 Simple Status: "Needs Attention" or "Healthy" with clear action'
    },
    {
      stepNumber: 5,
      tag: 'Step 4: Weather & Risk / मौसम और अलर्ट',
      title: 'Mausam aur fasal ke risk ki jankari paayein',
      subtitle: 'मौसम और बारिश की सटीक जानकारी',
      description:
        'Know if rain or high humidity might cause disease in the next few days, so you know exactly when to spray or irrigate.',
      hindiDescription:
        'बारिश, नमी और बीमारी के खतरे की पहले से जानकारी पाएं ताकि सही समय पर स्प्रे कर सकें।',
      icon: CloudSun,
      color: 'from-emerald-900 to-slate-950',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      illustrationBg: 'bg-amber-500/10 text-amber-600',
      highlightBox: '🌦️ Rain Forecast • Best time to spray or water'
    },
    {
      stepNumber: 6,
      tag: 'Step 5: Get Help / हमेशा मदद उपलब्ध',
      title: 'Kisi bhi samay VAANI se madad lein',
      subtitle: 'किसी भी समय सहायता पाएं',
      description:
        'Whenever you need help, tap the floating green microphone or click Help. Your agricultural assistant is always ready!',
      hindiDescription:
        'कभी भी कोई समस्या हो, हरे माइक पर टैप करें। डिजिटल कृषिवाणी आपके साथ है।',
      icon: HelpCircle,
      color: 'from-emerald-800 via-teal-800 to-slate-950',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      illustrationBg: 'bg-emerald-500/10 text-emerald-600',
      highlightBox: '✨ Tap "Start Using Digital KrishiVaani" to begin right now!'
    }
  ];

  const activeStep = steps[currentStep];
  const StepIcon = activeStep.icon;

  // Speak current step aloud
  const handleSpeakStep = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const textToSpeak = `${activeStep.title}. ${activeStep.hindiDescription || activeStep.description}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      // Try Hindi or local voice
      const voices = window.speechSynthesis.getVoices();
      const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.lang.startsWith('mr') || v.lang.startsWith('gu'));
      if (hiVoice) utterance.voice = hiVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentStep, isOpen]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 50 && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (diff < -50 && currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
    touchStartXRef.current = null;
  };

  if (!isOpen) return null;

  return (
    <div
      id="farmer-onboarding-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="farmer-onboarding-card"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200 relative"
      >
        {/* Header Strip with Step Count & Skip */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold font-mono">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Farmer Guide (ऐप का उपयोग)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Listen Button */}
            <button
              type="button"
              onClick={handleSpeakStep}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSpeaking
                  ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Listen to this step"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden xs:inline">{isSpeaking ? 'Listening...' : 'Suno / सुनें'}</span>
            </button>

            {/* Skip Tour Button */}
            <button
              type="button"
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Skip Tour
            </button>
          </div>
        </div>

        {/* Dynamic Carousel Slide Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 flex flex-col justify-between space-y-4">
          
          {/* Visual Icon / Illustration Container */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3 sm:mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30">
                <StepIcon className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center border-2 border-white shadow-sm">
                {currentStep + 1}
              </span>
            </div>

            {/* Step Tag */}
            <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border mb-2 ${activeStep.badgeColor}`}>
              {activeStep.tag}
            </span>

            {/* Step Title in Roman Hindi + Hindi Script */}
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight leading-snug">
              {activeStep.title}
            </h2>
            <p className="text-sm font-semibold text-emerald-800 mt-1">
              {activeStep.subtitle}
            </p>

            {/* Descriptions */}
            <div className="mt-3.5 space-y-2 max-w-md text-slate-600 text-xs sm:text-sm leading-relaxed">
              <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {activeStep.hindiDescription}
              </p>
              <p className="text-slate-500 text-xs px-2">
                {activeStep.description}
              </p>
            </div>

            {/* Highlight Callout Box */}
            <div className="mt-3 w-full max-w-md px-3.5 py-2.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-left text-xs font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{activeStep.highlightBox}</span>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                aria-label={`Go to step ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  currentStep === idx
                    ? 'w-7 h-2.5 bg-emerald-600'
                    : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          
          {/* Back Button */}
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
                : 'text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Next / Start Button */}
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <span>Next (आगे)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-700/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Start Using Digital KrishiVaani</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
