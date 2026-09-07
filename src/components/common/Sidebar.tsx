import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import { I18nService } from '../../services/i18nService';
import { KrishiRakshakLogo } from './KrishiRakshakLogo';
import {
  Home,
  Camera,
  Mic,
  MapPin,
  ChevronDown,
  ChevronUp,
  History,
  HeartPulse,
  TrendingUp,
  CloudSun,
  Bug,
  Radio,
  ShieldAlert,
  User,
  Users,
  Building2,
  GraduationCap,
  ListTodo,
  Microscope,
  Map,
  Compass,
  FileCheck2,
  CalendarCheck,
  Flame,
  BarChart3,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onSelectTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onOpenVaani?: () => void;
  onOpenTour?: () => void;
  pendingExpertCount?: number;
  pendingExpertCasesCount?: number;
  urgentAlertsCount?: number;
  activeAlertsCount?: number;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  onNavigate,
  onOpenVaani,
  onOpenTour,
  pendingExpertCount = 0,
  pendingExpertCasesCount = 0,
  urgentAlertsCount = 0,
  activeAlertsCount = 0,
  isCollapsed = false
}) => {
  const [showMoreFarmerTools, setShowMoreFarmerTools] = useState(false);
  const [langCode, setLangCode] = useState(I18nService.getCurrentLanguage());

  useEffect(() => {
    return I18nService.subscribe(code => setLangCode(code));
  }, []);

  const expertPending = pendingExpertCasesCount || pendingExpertCount;
  const urgentAlerts = activeAlertsCount || urgentAlertsCount;

  const handleTabClick = (tabId: string) => {
    if (tabId === 'open-vaani' && onOpenVaani) {
      onOpenVaani();
      return;
    }
    if (typeof onSelectTab === 'function') {
      onSelectTab(tabId);
    } else if (typeof onNavigate === 'function') {
      onNavigate(tabId);
    }
  };

  // Farmer Primary 4-Tab Navigation
  const farmerPrimaryItems = [
    { id: 'farmer-dashboard', label: I18nService.t('navHome'), icon: Home },
    { id: 'crop-scanner', label: I18nService.t('navScanCrop'), icon: Camera, highlight: true },
    { id: 'open-vaani', label: I18nService.t('navVaani'), icon: Mic, isVaani: true },
    { id: 'my-fields', label: I18nService.t('navMyFarm'), icon: MapPin },
  ];

  // Secondary Farmer Tools (Accessible under "More")
  const farmerSecondaryItems = [
    { id: 'crop-health', label: I18nService.t('navCropHealth'), icon: HeartPulse },
    { id: 'risk-forecast', label: I18nService.t('navRiskForecast'), icon: TrendingUp },
    { id: 'scan-history', label: I18nService.t('navScanHistory'), icon: History },
    { id: 'weather-intel', label: I18nService.t('navWeatherIntel'), icon: CloudSun },
    { id: 'pest-monitoring', label: I18nService.t('navPestMonitoring'), icon: Bug },
    { id: 'iot-sensors', label: I18nService.t('navIotSensors'), icon: Radio },
    { id: 'advisory', label: I18nService.t('navAdvisory'), icon: ShieldAlert },
    { id: 'profile', label: I18nService.t('navProfile'), icon: User },
  ];

  return (
    <aside
      id="app-sidebar"
      className={`hidden md:flex flex-col justify-between bg-slate-900 text-slate-200 shrink-0 transition-all duration-200 border-r border-slate-800 rounded-3xl p-3 my-2 shadow-xl ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        {!isCollapsed ? (
          <div className="px-3 pt-2 pb-3 mb-2 border-b border-slate-800">
            <KrishiRakshakLogo
              size="sm"
              theme="dark"
              showTagline={true}
              taglineText="Aapka AI Krishi Saathi"
            />
          </div>
        ) : (
          <div className="flex justify-center pt-2 pb-3 mb-2 border-b border-slate-800">
            <KrishiRakshakLogo
              size="xs"
              variant="icon-only"
              theme="dark"
            />
          </div>
        )}

        {/* Role Header Info */}
        <div className="p-3 mb-2 bg-slate-950/60 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              {currentRole === 'farmer' && <User className="w-5 h-5" />}
              {currentRole === 'extension' && <Users className="w-5 h-5" />}
              {currentRole === 'officer' && <Building2 className="w-5 h-5" />}
              {currentRole === 'expert' && <GraduationCap className="w-5 h-5" />}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h3 className="text-xs font-bold text-white truncate">
                  {currentRole === 'farmer' ? I18nService.t('authFarmer') : currentRole === 'expert' ? I18nService.t('authScientist') : currentRole === 'officer' ? I18nService.t('authDistrict') : I18nService.t('authOfficer')}
                </h3>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentRole === 'farmer' ? 'Digital KrishiVaani' : 'Surveillance Active'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ================= FARMER NAVIGATION ================= */}
        {currentRole === 'farmer' && (
          <nav className="space-y-1.5">
            {farmerPrimaryItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-link-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : item.highlight
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/90'
                      : item.isVaani
                      ? 'bg-gradient-to-r from-teal-900/60 to-emerald-900/60 text-emerald-200 border border-teal-500/30 hover:border-teal-400'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${item.isVaani ? 'text-amber-400 animate-pulse' : ''}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}

            {/* Secondary Tools Collapsible Tray */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowMoreFarmerTools(!showMoreFarmerTools)}
                className="w-full flex items-center justify-between px-3.5 py-2 text-[11px] font-bold text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <span>{I18nService.t('navMoreServices')}</span>
                {showMoreFarmerTools ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showMoreFarmerTools && (
                <div className="space-y-1 mt-1 pl-2 border-l-2 border-slate-800">
                  {farmerSecondaryItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer text-left ${
                          isActive
                            ? 'bg-emerald-700/60 text-white font-bold'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        )}

        {/* ================= EXTENSION WORKER NAVIGATION ================= */}
        {currentRole === 'extension' && (
          <nav className="space-y-1.5">
            <button
              onClick={() => handleTabClick('field-visits')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                activeTab === 'field-visits' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Field Visits</span>
            </button>
            <button
              onClick={() => handleTabClick('crop-scanner')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                activeTab === 'crop-scanner' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Offline Farm Scan</span>
            </button>
            <button
              onClick={() => handleTabClick('open-vaani')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-teal-950/60 text-teal-300 border border-teal-500/30 hover:bg-teal-900/60 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span>VAANI Field Assistant</span>
            </button>
            <button
              onClick={() => handleTabClick('crop-health')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                activeTab === 'crop-health' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>Cluster Alerts</span>
            </button>
          </nav>
        )}

        {/* ================= DISTRICT OFFICER NAVIGATION ================= */}
        {currentRole === 'officer' && (
          <nav className="space-y-1.5">
            <button
              onClick={() => handleTabClick('gis-map')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                activeTab === 'gis-map' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>GIS Disease Hotspots</span>
            </button>
            <button
              onClick={() => handleTabClick('outbreak-command')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                activeTab === 'outbreak-command' || activeTab === 'outbreak-defense' ? 'bg-rose-700 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Outbreak Defense</span>
            </button>
            <button
              onClick={() => handleTabClick('district-analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                activeTab === 'district-analytics' || activeTab === 'outbreak-analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>District Analytics</span>
            </button>
          </nav>
        )}

        {/* ================= SCIENTIST / EXPERT NAVIGATION ================= */}
        {currentRole === 'expert' && (
          <nav className="space-y-1.5">
            <button
              onClick={() => handleTabClick('expert-queue')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                activeTab === 'expert-queue' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Microscope className="w-4 h-4" />
                <span>Verification Queue</span>
              </div>
              {expertPending > 0 && (
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-extrabold text-[10px] rounded-full">
                  {expertPending}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabClick('crop-scanner')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                activeTab === 'crop-scanner' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>AI Model Validation</span>
            </button>
          </nav>
        )}
      </div>

      {/* Bottom Help / Guided Tour Launcher */}
      {onOpenTour && (
        <div className="pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onOpenTour}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-emerald-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{I18nService.t('tourStep5Title')}</span>
          </button>
        </div>
      )}
    </aside>
  );
};
