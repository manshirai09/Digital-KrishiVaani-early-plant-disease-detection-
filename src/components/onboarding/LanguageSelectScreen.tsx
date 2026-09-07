import React, { useState } from 'react';
import { SupportedLanguageCode } from '../../types';
import { I18nService } from '../../services/i18nService';
import { SUPPORTED_LANGUAGES } from '../../services/i18n/translations';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import { ShieldCheck, Check, Sparkles, Volume2 } from 'lucide-react';

interface LanguageSelectScreenProps {
  onLanguageSelected: (code: SupportedLanguageCode) => void;
}

export const LanguageSelectScreen: React.FC<LanguageSelectScreenProps> = ({
  onLanguageSelected
}) => {
  const [selected, setSelected] = useState<SupportedLanguageCode>(I18nService.getCurrentLanguage());
  const [isSpeaking, setIsSpeaking] = useState<SupportedLanguageCode | null>(null);

  const handleSelect = (code: SupportedLanguageCode) => {
    setSelected(code);
    I18nService.setLanguage(code);
    
    // Quick audio pronunciation of "Namaste" in selected language if supported
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const meta = SUPPORTED_LANGUAGES.find(l => l.code === code);
        const greetingText = code === 'hi' ? 'नमस्ते' :
                             code === 'mr' ? 'नमस्कार' :
                             code === 'gu' ? 'નમસ્તે' :
                             code === 'pa' ? 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ' :
                             code === 'bn' ? 'নমস্কার' :
                             code === 'te' ? 'నమస్కారం' :
                             code === 'ta' ? 'வணக்கம்' :
                             code === 'kn' ? 'ನಮಸ್ಕಾರ' : 'Namaste';
        const utterance = new SpeechSynthesisUtterance(greetingText);
        utterance.rate = 0.95;
        if (meta?.voiceLangCode) utterance.lang = meta.voiceLangCode;
        setIsSpeaking(code);
        utterance.onend = () => setIsSpeaking(null);
        utterance.onerror = () => setIsSpeaking(null);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Safe fallback
      }
    }

    // Advance immediately after selection with smooth transition
    setTimeout(() => {
      onLanguageSelected(code);
    }, 300);
  };

  return (
    <div id="language-selection-screen" className="min-h-screen bg-gradient-to-b from-emerald-900 via-teal-950 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Brand Logo */}
      <div className="pt-4 sm:pt-6 max-w-xl mx-auto w-full text-center flex flex-col items-center">
        <div className="mb-4">
          <KrishiRakshakLogo
            size="lg"
            variant="vertical"
            theme="dark"
            showTagline={true}
            taglineText="Aapka AI Krishi Saathi"
          />
        </div>

        {/* Heading in pure multiple native scripts so every farmer identifies their own */}
        <div className="mt-4 sm:mt-6 space-y-1.5 flex flex-col items-center">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30 mb-1">
            Step 1 / 3 • भाषा चयन (Choose Language)
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            अपनी भाषा चुनें
          </h2>
          <p className="text-sm sm:text-base text-emerald-200">
            कृपया अपनी पसंदीदा भाषा चुनें
          </p>
          <p className="text-xs text-slate-400">
            Choose your preferred language to start
          </p>
        </div>
      </div>

      {/* Language Grid: Large, high-contrast, touch-friendly cards */}
      <div className="max-w-2xl mx-auto w-full my-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <button
                key={lang.code}
                id={`lang-select-btn-${lang.code}`}
                onClick={() => handleSelect(lang.code)}
                className={`relative p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 border cursor-pointer flex flex-col justify-between min-h-[96px] sm:min-h-[110px] ${
                  isSelected
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-300 shadow-xl shadow-emerald-950/60 scale-[1.02] ring-2 ring-emerald-300'
                    : 'bg-white/10 hover:bg-white/15 text-white border-white/15 hover:border-white/30 backdrop-blur-sm'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <span className="font-display font-black text-xl sm:text-2xl tracking-wide leading-tight">
                    {lang.nativeName}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-white text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={isSelected ? 'text-emerald-100 font-semibold' : 'text-slate-300'}>
                    {lang.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-emerald-700/60 text-emerald-100' : 'bg-white/5 text-slate-400'}`}>
                    {lang.region ? lang.region.split(' ')[0] : ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer reassurance */}
      <div className="max-w-md mx-auto w-full text-center pb-4 text-xs text-slate-400">
        <p className="flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>भाषा बाद में कभी भी बदली जा सकती है (Change anytime later)</span>
        </p>
      </div>
    </div>
  );
};
