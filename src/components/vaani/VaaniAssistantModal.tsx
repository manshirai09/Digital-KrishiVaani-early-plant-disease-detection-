import React, { useState, useEffect, useRef } from 'react';
import { VaaniService } from '../../services/vaaniService';
import { I18nService } from '../../services/i18nService';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import {
  VaaniAssistantState,
  VaaniMessage,
  SupportedLanguageCode
} from '../../types';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  RotateCcw,
  Compass,
  ArrowRight,
  Globe,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';

interface VaaniAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, extra?: any) => void;
}

export const VaaniAssistantModal: React.FC<VaaniAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [state, setState] = useState<VaaniAssistantState>('idle');
  const [messages, setMessages] = useState<VaaniMessage[]>([]);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [activeLang, setActiveLang] = useState<SupportedLanguageCode>(I18nService.getCurrentLanguage());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const languages = I18nService.getSupportedLanguages();

  useEffect(() => {
    const unsubI18n = I18nService.subscribe(lang => {
      setActiveLang(lang);
    });

    const unsubVaani = VaaniService.subscribe((newState, data) => {
      setState(newState);
      if (newState === 'speaking') {
        setIsSpeaking(true);
      } else {
        setIsSpeaking(false);
      }
      if (newState === 'error' && typeof data === 'string') {
        setErrorMessage(data);
      }
    });

    return () => {
      unsubI18n();
      unsubVaani();
    };
  }, []);

  // On open, greet the farmer if message history is empty
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleSendPrompt(I18nService.t('vaaniTitle'));
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript, state]);

  if (!isOpen) return null;

  const handleStartListening = async () => {
    setErrorMessage(null);
    setTranscript('');
    try {
      const speechResult = await VaaniService.startListening(
        interim => setTranscript(interim),
        err => setErrorMessage(err)
      );

      if (speechResult) {
        handleProcessQuery(speechResult);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Could not listen. You can type your query below.');
    }
  };

  const handleStopListening = () => {
    VaaniService.stopListening();
  };

  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Add user message to state
    const userMsg: VaaniMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: activeLang
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setTranscript('');

    try {
      const response = await VaaniService.processUserQuery(queryText, activeLang);
      setMessages(prev => [...prev, response.message]);

      // Speak aloud in user's language
      VaaniService.speak(response.spokenText, activeLang);

      // If action is navigation and confidence is high, allow auto or click navigate
      if (response.actionType === 'NAVIGATE' && response.actionPayload) {
        // Provide visual direct action button
      }
    } catch (e: any) {
      setErrorMessage('Could not process agricultural advice. Please try again.');
    }
  };

  const handleSendPrompt = (promptText: string) => {
    handleProcessQuery(promptText);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleProcessQuery(inputText);
    }
  };

  const handleLanguageChange = (code: SupportedLanguageCode) => {
    I18nService.setLanguage(code);
    setActiveLang(code);
    VaaniService.stopSpeaking();
  };

  const handleReplayAudio = (text: string) => {
    VaaniService.speak(text, activeLang);
  };

  const handleStopAudio = () => {
    VaaniService.stopSpeaking();
  };

  const suggestedPrompts = [
    { label: I18nService.t('promptCropRisk'), key: 'risk' },
    { label: I18nService.t('promptWeather'), key: 'weather' },
    { label: I18nService.t('promptAdvisory'), key: 'advisory' },
    { label: I18nService.t('promptScan'), key: 'scan' },
    { label: I18nService.t('promptHistory'), key: 'history' },
    { label: I18nService.t('promptExpert'), key: 'expert' }
  ];

  return (
    <div id="vaani-assistant-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[85vh] max-h-[750px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-display font-extrabold text-xl shadow-lg shadow-emerald-400/30">
                🎙️
              </div>
              {state === 'listening' && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <KrishiRakshakLogo
                  size="sm"
                  theme="dark"
                  showTagline={false}
                />
                <span className="text-emerald-500">|</span>
                <h2 className="font-display font-extrabold text-base sm:text-lg text-white">
                  VAANI (वाणी)
                </h2>
              </div>
              <p className="text-[11px] text-emerald-200 line-clamp-1">
                “Aapka AI Krishi Saathi” • Multilingual Voice Guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <select
                value={activeLang}
                onChange={e => handleLanguageChange(e.target.value as SupportedLanguageCode)}
                className="px-2.5 py-1.5 bg-emerald-950/80 border border-emerald-700 rounded-xl text-xs font-bold text-emerald-200 outline-none hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                VaaniService.stopSpeaking();
                VaaniService.stopListening();
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audio Waveform Live Visualizer Bar */}
        {(state === 'listening' || isSpeaking) && (
          <div className="bg-emerald-950 px-4 py-2 flex items-center justify-between text-xs text-emerald-200 border-b border-emerald-800 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              {state === 'listening' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-rose-300 font-bold">LISTENING TO YOUR VOICE...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 font-bold">SPEAKING ADVISORY AUDIO...</span>
                </>
              )}
            </div>

            {/* Sound Wave Bars Animation */}
            <div className="flex items-center gap-1">
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_100ms] h-4" />
              <span className="w-1 bg-emerald-300 rounded-full animate-[bounce_1s_infinite_300ms] h-6" />
              <span className="w-1 bg-teal-400 rounded-full animate-[bounce_1s_infinite_150ms] h-3" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_250ms] h-5" />
              <span className="w-1 bg-teal-300 rounded-full animate-[bounce_1s_infinite_200ms] h-4" />
            </div>

            {isSpeaking && (
              <button
                type="button"
                onClick={handleStopAudio}
                className="px-2 py-0.5 rounded bg-emerald-800 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
              >
                Mute Audio
              </button>
            )}
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-sm font-bold">
              🌱
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">
                {I18nService.t('vaaniTitle')}
              </p>
              <p className="text-slate-600 leading-relaxed">
                {I18nService.t('vaaniSubtitle')} — Speak or type in any of the 11 Indian languages.
              </p>
            </div>
          </div>

          {/* Messages Flow */}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'vaani' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                  V
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-none font-medium'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line text-xs sm:text-[13px]">
                  {msg.text}
                </p>

                {/* VAANI Audio Controls & Action Buttons */}
                {msg.sender === 'vaani' && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleReplayAudio(msg.text)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{I18nService.t('vaaniPlayVoice')}</span>
                    </button>

                    {msg.actionType === 'NAVIGATE' && msg.actionPayload && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate(msg.actionPayload);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Open Screen</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                <div className={`text-[10px] ${msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                  👨‍🌾
                </div>
              )}
            </div>
          ))}

          {/* Active Listening / Interim Transcript Preview */}
          {transcript && (
            <div className="flex items-start gap-2.5 justify-end animate-in fade-in">
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl rounded-tr-none p-3 text-xs italic shadow-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>{transcript}...</span>
              </div>
            </div>
          )}

          {/* Processing State */}
          {state === 'processing' && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2 animate-in fade-in">
              <Radio className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>{I18nService.t('vaaniProcessing')}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Voice Suggestions Strip */}
        <div className="px-4 py-2.5 bg-slate-100/80 border-t border-slate-200 overflow-x-auto shrink-0 flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-700" />
            <span>Quick:</span>
          </span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendPrompt(p.label)}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-900 whitespace-nowrap shadow-2xs transition-all cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Bottom Input & Microphone Controls */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            
            {/* Big Microphone Push-to-Talk Button */}
            <button
              id="vaani-mic-trigger-btn"
              type="button"
              onClick={state === 'listening' ? handleStopListening : handleStartListening}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                state === 'listening'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse scale-105'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20'
              }`}
              title={state === 'listening' ? 'Stop Listening' : 'Tap to Speak'}
            >
              {state === 'listening' ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Text Input Fallback */}
            <form onSubmit={handleFormSubmit} className="flex-1 flex items-center gap-2">
              <input
                id="vaani-query-input"
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={I18nService.t('vaaniSpeakPrompt')}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-inner"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-11 h-11 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};
