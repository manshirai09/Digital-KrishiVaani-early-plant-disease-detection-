import React, { useState, useEffect } from 'react';
import { I18nService } from '../../services/i18nService';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import { Mic, Volume2, VolumeX, ArrowRight, Sparkles, Globe } from 'lucide-react';

interface VaaniIntroScreenProps {
  onNext: () => void;
  onChangeLanguage: () => void;
}

export const VaaniIntroScreen: React.FC<VaaniIntroScreenProps> = ({
  onNext,
  onChangeLanguage
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const langMeta = I18nService.getCurrentLanguageMeta();

  // Intro text from dictionary in selected language
  const title = I18nService.t('vaaniIntroTitle');
  const subtitle = I18nService.t('vaaniIntroSubtitle');
  const speechText = I18nService.t('vaaniIntroSpeech');
  const listenBtn = I18nService.t('vaaniListenVoiceBtn');
  const nextBtn = I18nService.t('btnNext');

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
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

  // Auto-play voice greeting upon arrival after 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSpeak();
    }, 400);

    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div id="vaani-intro-screen" className="min-h-screen bg-gradient-to-b from-emerald-900 via-teal-950 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Bar with Language Indicator & Change Option */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between pt-2">
        <KrishiRakshakLogo
          size="sm"
          theme="dark"
          showTagline={false}
        />

        <button
          onClick={onChangeLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-200 border border-white/10 transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-300" />
          <span>{langMeta.nativeName}</span>
        </button>
      </div>

      {/* Center Content: Animated Microphone + Speech Card */}
      <div className="max-w-md mx-auto w-full my-auto text-center space-y-6">
        
        {/* Glowing Animated Microphone Orb */}
        <div className="relative inline-flex items-center justify-center">
          {/* Animated Pulsing Rings */}
          <div className={`absolute w-36 h-36 rounded-full bg-emerald-500/20 transition-all duration-700 ${isSpeaking ? 'animate-ping opacity-60 scale-125' : 'opacity-20 scale-100'}`} />
          <div className={`absolute w-28 h-28 rounded-full bg-teal-400/30 transition-all duration-500 ${isSpeaking ? 'animate-pulse scale-110' : 'opacity-40'}`} />
          
          <button
            onClick={handleSpeak}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer ${
              isSpeaking
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 scale-105 shadow-emerald-500/50'
                : 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white hover:scale-105 shadow-emerald-900/60'
            }`}
            title={listenBtn}
          >
            {isSpeaking ? (
              <Volume2 className="w-12 h-12 animate-bounce" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </button>
        </div>

        {/* Titles in Pure Selected Language */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{subtitle}</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            {title}
          </h2>
        </div>

        {/* Friendly speech bubble */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/15 text-emerald-50 shadow-xl relative text-left sm:text-center">
          <p className="text-base sm:text-lg font-medium leading-relaxed">
            "{speechText}"
          </p>
        </div>

        {/* Audio Listen Action Button */}
        <div>
          <button
            onClick={handleSpeak}
            className={`inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-md cursor-pointer ${
              isSpeaking
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{I18nService.t('vaaniListeningNow')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-300" />
                <span>{listenBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Main CTA: Next Step */}
      <div className="max-w-md mx-auto w-full pt-4 pb-2">
        <button
          id="vaani-intro-next-btn"
          onClick={() => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            onNext();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display font-black text-lg shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span>{nextBtn}</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
