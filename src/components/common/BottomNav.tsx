import React, { useState, useEffect } from 'react';
import { Home, Camera, Mic, MapPin, MoreHorizontal, User, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';
import { I18nService } from '../../services/i18nService';

interface BottomNavProps {
  currentRole: UserRole;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenVaani: () => void;
  onOpenMore?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentRole,
  activeTab,
  onNavigate,
  onOpenVaani,
  onOpenMore
}) => {
  const [langCode, setLangCode] = useState(I18nService.getCurrentLanguage());

  useEffect(() => {
    return I18nService.subscribe(code => setLangCode(code));
  }, []);

  // Only show simplified 4-tab mobile bar for farmer role
  if (currentRole !== 'farmer') return null;

  return (
    <nav
      id="farmer-bottom-navigation-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-2 py-1.5 flex items-center justify-around"
    >
      {/* 🏠 Home */}
      <button
        id="bottom-nav-home"
        type="button"
        onClick={() => onNavigate('farmer-dashboard')}
        className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors cursor-pointer ${
          activeTab === 'farmer-dashboard'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className={`p-1 rounded-lg ${activeTab === 'farmer-dashboard' ? 'bg-emerald-100' : ''}`}>
          <Home className="w-5 h-5" />
        </div>
        <span className="text-[11px] leading-tight font-medium">{I18nService.t('navHome')}</span>
      </button>

      {/* 📷 Scan Crop (Prominent center-left button) */}
      <button
        id="bottom-nav-scan"
        type="button"
        onClick={() => onNavigate('crop-scanner')}
        className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors cursor-pointer ${
          activeTab === 'crop-scanner'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className={`p-1 rounded-lg ${activeTab === 'crop-scanner' ? 'bg-emerald-100' : ''}`}>
          <Camera className="w-5 h-5" />
        </div>
        <span className="text-[11px] leading-tight font-medium">{I18nService.t('navScan')}</span>
      </button>

      {/* 🎙️ VAANI Voice (Prominent Highlighted Center Action) */}
      <button
        id="bottom-nav-vaani"
        type="button"
        onClick={onOpenVaani}
        className="flex-1 py-1 flex flex-col items-center justify-center gap-0.5 group cursor-pointer"
      >
        <div className="w-10 h-10 -mt-4 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 group-hover:scale-105 active:scale-95 transition-transform border-2 border-white">
          <Mic className="w-5 h-5 animate-pulse" />
        </div>
        <span className="text-[11px] font-extrabold text-emerald-800 leading-tight">{I18nService.t('navVaani')}</span>
      </button>

      {/* 🌾 My Farm */}
      <button
        id="bottom-nav-my-farm"
        type="button"
        onClick={() => onNavigate('my-fields')}
        className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors cursor-pointer ${
          activeTab === 'my-fields'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className={`p-1 rounded-lg ${activeTab === 'my-fields' ? 'bg-emerald-100' : ''}`}>
          <MapPin className="w-5 h-5" />
        </div>
        <span className="text-[11px] leading-tight font-medium">{I18nService.t('navMyFarm')}</span>
      </button>

      {/* ⚙️ More / Secondary services */}
      <button
        id="bottom-nav-more"
        type="button"
        onClick={() => {
          if (onOpenMore) onOpenMore();
          else onNavigate('profile');
        }}
        className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors cursor-pointer ${
          ['profile', 'weather-intel', 'pest-monitoring', 'iot-sensors', 'advisory'].includes(activeTab)
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="p-1 rounded-lg">
          <MoreHorizontal className="w-5 h-5" />
        </div>
        <span className="text-[11px] leading-tight font-medium">{I18nService.t('navMoreServices')}</span>
      </button>
    </nav>
  );
};
