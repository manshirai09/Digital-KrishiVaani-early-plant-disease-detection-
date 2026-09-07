import React, { useState, useEffect } from 'react';
import { I18nService } from '../../services/i18nService';
import { VaaniService } from '../../services/vaaniService';
import { VaaniAssistantState } from '../../types';
import { Mic, Radio, Volume2 } from 'lucide-react';

interface VaaniFloatingButtonProps {
  onClick: () => void;
}

export const VaaniFloatingButton: React.FC<VaaniFloatingButtonProps> = ({ onClick }) => {
  const [state, setState] = useState<VaaniAssistantState>('idle');
  const [currentLang, setCurrentLang] = useState(I18nService.getCurrentLanguage());

  useEffect(() => {
    const unsubLang = I18nService.subscribe(lang => setCurrentLang(lang));
    const unsubVaani = VaaniService.subscribe(s => setState(s));
    return () => {
      unsubLang();
      unsubVaani();
    };
  }, []);

  const meta = I18nService.getCurrentLanguageMeta();

  return (
    <div id="vaani-floating-trigger-container" className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 group">
      
      {/* Speech prompt bubble on hover */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 text-white text-xs font-bold shadow-lg shadow-slate-900/20 backdrop-blur-xs border border-slate-800 transition-all duration-200 opacity-90 group-hover:opacity-100">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Ask VAANI</span>
        <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono">
          {meta.nativeName}
        </span>
      </div>

      {/* Floating Action Button */}
      <button
        id="vaani-floating-action-btn"
        type="button"
        onClick={onClick}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-700/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer relative"
        title="VAANI Multilingual Voice Guide"
      >
        {/* Glow pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm pointer-events-none animate-pulse" />
        
        {state === 'listening' ? (
          <Radio className="w-7 h-7 text-white animate-spin" />
        ) : state === 'speaking' ? (
          <Volume2 className="w-7 h-7 text-white animate-bounce" />
        ) : (
          <Mic className="w-7 h-7 text-white" />
        )}

        {/* Small language badge pill */}
        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-slate-950 text-emerald-300 font-mono text-[9px] font-extrabold rounded-full border border-emerald-500/40">
          {(currentLang || 'hi').toUpperCase()}
        </span>
      </button>
    </div>
  );
};
