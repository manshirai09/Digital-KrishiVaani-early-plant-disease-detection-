import React, { useState, useEffect } from 'react';
import { Farm, WeatherData, IotSensorData, PestTrapData, CaseRecord, SupportedLanguageCode } from '../../types';
import { AuthService } from '../../services/authService';
import { I18nService } from '../../services/i18nService';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import {
  Camera,
  Mic,
  CloudSun,
  HelpCircle,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Compass,
  Sprout,
  ShieldCheck,
  Bug,
  Radio,
  History,
  Layers,
  Volume2
} from 'lucide-react';

interface FarmerDashboardProps {
  farms: Farm[];
  weather: WeatherData;
  iotData: IotSensorData;
  pestTraps: PestTrapData[];
  cases: CaseRecord[];
  onNavigate: (tab: string, extra?: any) => void;
  onRefreshIot?: () => void;
  onOpenVaani?: () => void;
  onOpenGuidedScan?: () => void;
  onOpenTour?: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  farms,
  weather,
  iotData,
  pestTraps,
  cases,
  onNavigate,
  onRefreshIot,
  onOpenVaani,
  onOpenGuidedScan,
  onOpenTour
}) => {
  const session = AuthService.getAuthSession();
  const [currentLang, setCurrentLang] = useState<SupportedLanguageCode>(I18nService.getCurrentLanguage());

  useEffect(() => {
    const unsub = I18nService.subscribe(lang => setCurrentLang(lang));
    return unsub;
  }, []);

  const isEn = currentLang === 'en';
  const userName = session?.user?.name || (isEn ? 'Farmer Friend' : 'किसान जी');
  const userVillage = session?.user?.village || (isEn ? 'Sanwer' : 'सांवेर');
  const userDistrict = session?.user?.district || (isEn ? 'Indore' : 'इंदौर');

  const langMeta = I18nService.getCurrentLanguageMeta();
  return (
    <div id="simplified-farmer-dashboard" className="max-w-4xl mx-auto space-y-5 sm:space-y-6 pb-20 md:pb-8 animate-in fade-in duration-200">
      
      {/* ================= 1. GREETING & HEADER ================= */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        {/* Soft background glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            {/* Official Brand Identity */}
            <div className="mb-2">
              <KrishiRakshakLogo
                size="md"
                theme="dark"
                showTagline={true}
                taglineText="“Aapka AI Krishi Saathi”"
              />
            </div>

            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <MapPin className="w-3.5 h-3.5" />
                <span>{userVillage}, {userDistrict}</span>
              </span>
              <span className="text-xs text-emerald-300/80 font-medium">
                • {langMeta.nativeName}
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              {I18nService.t('farmerGreeting')}, {userName} 👋
            </h1>
            <p className="text-sm text-emerald-100/90">
              {I18nService.t('farmerHelpQuestion')}
            </p>
          </div>

          {/* Guide / How to use button */}
          {onOpenTour && (
            <button
              id="dashboard-open-tour-btn"
              type="button"
              onClick={onOpenTour}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/20 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{I18nService.t('tourStep5Title')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= 2. PRIMARY ACTIONS: SCAN CROP & ASK VAANI ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* HERO CTA 1: 📷 Scan My Crop (Primary Big Card) */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-7 shadow-lg shadow-emerald-700/20 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              {I18nService.t('actionScanTitle')}
            </h2>
            <p className="text-emerald-100 text-sm font-medium">
              {I18nService.t('actionScanDesc')}
            </p>
          </div>

          <div className="pt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              id="dashboard-primary-scan-btn"
              type="button"
              onClick={() => onNavigate('crop-scanner')}
              className="flex-1 px-5 py-3.5 bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer animate-pulse-subtle hover:animate-none"
            >
              <Camera className="w-5 h-5 text-emerald-700" />
              <span>{I18nService.t('actionScanBtn')}</span>
            </button>

            {onOpenGuidedScan && (
              <button
                id="dashboard-guided-scan-btn"
                type="button"
                onClick={onOpenGuidedScan}
                className="px-3.5 py-3 bg-emerald-900/40 hover:bg-emerald-900/60 text-white rounded-2xl text-xs font-bold border border-emerald-300/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title={I18nService.t('vaaniGuidedMode')}
              >
                <Compass className="w-4 h-4 text-emerald-300" />
                <span>{I18nService.t('vaaniGuidedMode')}</span>
              </button>
            )}
          </div>
        </div>

        {/* HERO CTA 2: 🎙️ Ask VAANI (Voice Assistant Card) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-700/60 flex flex-col justify-between relative overflow-hidden group hover:border-slate-600 transition-all">
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 backdrop-blur-xs flex items-center justify-center text-amber-300 shadow-inner mb-3 group-hover:scale-110 transition-transform">
              <Mic className="w-8 h-8 text-amber-300" />
            </div>
            
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              {I18nService.t('actionVaaniTitle')}
            </h2>
            <p className="text-slate-200 text-sm font-medium">
              {I18nService.t('actionVaaniDesc')}
            </p>
          </div>

          <div className="pt-5">
            <button
              id="dashboard-primary-vaani-btn"
              type="button"
              onClick={onOpenVaani}
              className="w-full px-5 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Mic className="w-5 h-5 text-slate-950" />
              <span>{I18nService.t('actionVaaniBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 4. QUICK HELP TILES ================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-extrabold text-base text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-700" />
            <span>{I18nService.t('quickHelpTitle')}</span>
          </h3>

          <span className="text-xs text-slate-500 font-semibold">
            {I18nService.t('vaaniSubtitle')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('crop-scanner')}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-left transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <p className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
              {I18nService.t('quickHelpCropDisease')}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('weather-intel')}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200/80 hover:border-sky-300 text-left transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CloudSun className="w-5 h-5" />
            </div>
            <p className="font-bold text-xs text-slate-900 group-hover:text-sky-900">
              {I18nService.t('quickHelpWeather')}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('pest-monitoring')}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200/80 hover:border-amber-300 text-left transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Bug className="w-5 h-5" />
            </div>
            <p className="font-bold text-xs text-slate-900 group-hover:text-amber-900">
              {I18nService.t('quickHelpPest')}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
