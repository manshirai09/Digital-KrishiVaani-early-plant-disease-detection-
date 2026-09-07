import React, { useState, useEffect } from 'react';
import { I18nService } from '../../services/i18nService';
import { StorageService } from '../../services/storageService';
import { UserAccount, Farm, Crop } from '../../types';
import {
  Sprout,
  MapPin,
  Maximize2,
  User,
  ArrowRight,
  Mic,
  Volume2,
  Check,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface FarmerSetupScreenProps {
  user: UserAccount;
  onComplete: () => void;
}

export const FarmerSetupScreen: React.FC<FarmerSetupScreenProps> = ({
  user,
  onComplete
}) => {
  const [step, setStep] = useState<number>(1);
  const [farmerName, setFarmerName] = useState(user.name || 'किसान जी');
  const [village, setVillage] = useState(user.village || 'सांवेर');
  const [selectedCrop, setSelectedCrop] = useState('सोयाबीन (Soybean)');
  const [landSize, setLandSize] = useState('2-5 एकड़');
  const [isListening, setIsListening] = useState(false);

  const langMeta = I18nService.getCurrentLanguageMeta();

  const speakQuestion = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    if (langMeta.voiceLangCode) utterance.lang = langMeta.voiceLangCode;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const questions: Record<number, string> = {
      1: I18nService.t('setupStep1Q'),
      2: I18nService.t('setupStep2Q'),
      3: I18nService.t('setupStep3Q'),
      4: I18nService.t('setupStep4Q')
    };

    const timer = setTimeout(() => {
      speakQuestion(questions[step]);
    }, 300);

    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [step]);

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = langMeta.voiceLangCode || 'hi-IN';
      recognition.interimResults = false;

      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (step === 1) setFarmerName(transcript);
        if (step === 2) setVillage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleFinish = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    // Create / update farm record in StorageService
    const existingFarms = StorageService.getFarms();
    const farmId = `farm-${Date.now()}`;
    const cleanCropName = selectedCrop.includes('Soybean') ? 'Soybean' : selectedCrop.includes('Cotton') ? 'Cotton' : selectedCrop.includes('Wheat') ? 'Wheat' : 'Soybean';

    const newCrop: Crop = {
      id: `crop-${Date.now()}`,
      farmId: farmId,
      cropName: cleanCropName,
      variety: 'JS-2034',
      areaAcres: 2.5,
      sowingDate: '2026-06-25',
      stage: 'Vegetative',
      riskLevel: 'low',
      riskScore: 24,
      lastScanDate: new Date().toISOString()
    };

    const newFarm: Farm = {
      id: farmId,
      name: `${farmerName} का खेत (${village})`,
      farmerName: farmerName,
      farmerPhone: user.phone || '+91 98260 14820',
      village: village,
      block: 'Sanwer',
      district: user.district || 'Indore',
      totalAreaAcres: landSize.includes('1') ? 1.5 : landSize.includes('5-10') ? 7 : 3.5,
      soilType: 'Deep Black Soil (Vertisol)',
      coordinates: {
        lat: 22.9734,
        lng: 75.8242
      },
      crops: [newCrop],
      overallRisk: 'low',
      overallRiskScore: 24
    };

    StorageService.saveFarms([newFarm, ...existingFarms]);
    onComplete();
  };

  const cropChips = [
    { label: 'गेहूं (Wheat)', icon: '🌾' },
    { label: 'कपास (Cotton)', icon: '☁️' },
    { label: 'सोयाबीन (Soybean)', icon: '🌱' },
    { label: 'आलू (Potato)', icon: '🥔' },
    { label: 'टमाटर (Tomato)', icon: '🍅' },
    { label: 'मक्का (Maize)', icon: '🌽' }
  ];

  const villageChips = ['सांवेर (Sanwer)', 'बेतमा (Betma)', 'देपालपुर (Depalpur)', 'महू (Mhow)', 'हातोद (Hatod)'];
  const landChips = ['1 एकड़ से कम', '1-2 एकड़', '2-5 एकड़', '5-10 एकड़', '10+ एकड़'];

  return (
    <div id="farmer-setup-screen" className="min-h-screen bg-gradient-to-b from-emerald-900 via-teal-950 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Header */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold">
            🌱
          </div>
          <span className="font-display font-extrabold text-lg text-white">
            {I18nService.t('setupTitle')}
          </span>
        </div>

        {/* Fill Later Button */}
        <button
          onClick={handleFinish}
          className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
        >
          {I18nService.t('setupFillLater')} ✕
        </button>
      </div>

      {/* Progress Dots */}
      <div className="max-w-md mx-auto w-full flex items-center justify-center gap-2 my-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              s === step
                ? 'w-8 bg-emerald-400 shadow-sm shadow-emerald-400/50'
                : s < step
                ? 'w-3 bg-emerald-600'
                : 'w-2 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Interactive Step Body */}
      <div className="max-w-md mx-auto w-full my-auto bg-white rounded-3xl p-6 shadow-2xl text-slate-900 border border-slate-100">
        
        {/* Step 1: Farmer Name */}
        {step === 1 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
              <User className="w-8 h-8 text-emerald-700" />
            </div>
            <h3 className="font-display font-extrabold text-xl text-slate-900">
              {I18nService.t('setupStep1Q')}
            </h3>
            <div className="relative flex items-center">
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="उदा. रमेश पाटीदार"
                className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold text-slate-900 text-center focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-emerald-700'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Village */}
        {step === 2 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto shadow-inner">
              <MapPin className="w-8 h-8 text-teal-700" />
            </div>
            <h3 className="font-display font-extrabold text-xl text-slate-900">
              {I18nService.t('setupStep2Q')}
            </h3>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {villageChips.map((v) => {
                const cleanV = v ? v.split(' ')[0] : '';
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVillage(cleanV)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      (village || '').includes(cleanV)
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    📍 {v}
                  </button>
                );
              })}
            </div>

            <div className="relative flex items-center pt-2">
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="या अपना गाँव लिखें..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 text-center"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-emerald-700'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Crop Selection */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
              <Sprout className="w-8 h-8 text-amber-700" />
            </div>
            <h3 className="font-display font-extrabold text-xl text-slate-900">
              {I18nService.t('setupStep3Q')}
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {cropChips.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setSelectedCrop(c.label)}
                  className={`p-3 rounded-2xl text-left font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer border ${
                    selectedCrop === c.label
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-2 ring-emerald-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl">{c.icon}</span>
                  <span className="leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Land Size */}
        {step === 4 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center mx-auto shadow-inner">
              <Maximize2 className="w-8 h-8 text-sky-700" />
            </div>
            <h3 className="font-display font-extrabold text-xl text-slate-900">
              {I18nService.t('setupStep4Q')}
            </h3>

            <div className="flex flex-col gap-2">
              {landChips.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLandSize(l)}
                  className={`py-3 px-4 rounded-2xl text-sm font-extrabold transition-all cursor-pointer border flex items-center justify-between ${
                    landSize === l
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{l}</span>
                  {landSize === l && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="max-w-md mx-auto w-full pt-4 pb-2">
        {step < 4 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display font-black text-base shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>{I18nService.t('btnNext')}</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        ) : (
          <button
            id="farmer-setup-finish-btn"
            onClick={handleFinish}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display font-black text-lg shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>{I18nService.t('setupSaveBtn')}</span>
            <CheckCircle2 className="w-6 h-6 text-slate-950 stroke-[3]" />
          </button>
        )}
      </div>
    </div>
  );
};
