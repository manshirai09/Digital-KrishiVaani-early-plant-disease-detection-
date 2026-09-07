import React, { useState, useEffect } from 'react';
import { UserRole, UserAccount, SupportedLanguageCode } from '../../types';
import { I18nService } from '../../services/i18nService';
import { KrishiRakshakLogo } from './KrishiRakshakLogo';
import { BrandAssetsModal } from './BrandAssetsModal';
import {
  ShieldCheck,
  User,
  Users,
  Building2,
  GraduationCap,
  Bell,
  Globe,
  Wifi,
  WifiOff,
  Layers,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Volume2,
  Mic,
  LogOut,
  Settings,
  LogIn,
  Menu,
  X,
  Home,
  Camera,
  CloudSun,
  Bug,
  Landmark,
  MapPin,
  Activity,
  FileCheck2,
  HelpCircle,
  Download
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  currentUser?: UserAccount | null;
  onSelectRole?: (role: UserRole) => void;
  onRoleChange?: (role: UserRole) => void;
  onOpenArchitecture?: () => void;
  onOpenDemoGuide?: () => void;
  onOpenVaani?: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  unreadNotifsCount?: number;
  unreadNotificationCount?: number;
  onOpenNotifications?: () => void;
  isOffline?: boolean;
  onToggleOffline?: () => void;
  selectedLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
  onResetData?: () => void;
  onResetDemoData?: () => void;
  onSelectTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentUser,
  onSelectRole,
  onRoleChange,
  onOpenArchitecture,
  onOpenDemoGuide,
  onOpenVaani,
  onOpenAuth,
  onLogout,
  unreadNotifsCount,
  unreadNotificationCount,
  onOpenNotifications,
  isOffline = false,
  onToggleOffline,
  selectedLanguage = 'English',
  onSelectLanguage,
  onResetData,
  onResetDemoData,
  onSelectTab,
  onNavigate
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [activeLangCode, setActiveLangCode] = useState<SupportedLanguageCode>(I18nService.getCurrentLanguage());

  const effectiveUnreadCount = unreadNotifsCount ?? unreadNotificationCount ?? 0;
  const supportedLanguages = I18nService.getSupportedLanguages();

  useEffect(() => {
    const unsub = I18nService.subscribe(lang => setActiveLangCode(lang));
    return unsub;
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    if (typeof onSelectRole === 'function') onSelectRole(role);
    if (typeof onRoleChange === 'function') onRoleChange(role);
    setShowRoleMenu(false);
  };

  const handleReset = () => {
    if (typeof onResetData === 'function') onResetData();
    if (typeof onResetDemoData === 'function') onResetDemoData();
  };

  const handleLanguagePick = (langCode: SupportedLanguageCode) => {
    I18nService.setLanguage(langCode);
    const meta = supportedLanguages.find(l => l.code === langCode);
    if (meta && typeof onSelectLanguage === 'function') {
      onSelectLanguage(meta.name);
    }
    setShowLangMenu(false);
  };

  const roles = [
    { id: 'farmer', label: 'Farmer', icon: User, desc: 'Crop scans, IoT & IPM advisory', color: 'text-emerald-700' },
    { id: 'extension', label: 'Extension Worker', icon: Users, desc: 'Field alerts & farmer visits', color: 'text-sky-700' },
    { id: 'officer', label: 'Agriculture Officer', icon: Building2, desc: 'District GIS & outbreak intelligence', color: 'text-indigo-700' },
    { id: 'expert', label: 'Expert / Scientist', icon: GraduationCap, desc: 'Validation queue & diagnosis approval', color: 'text-purple-700' }
  ];

  const currentRoleObj = roles.find(r => r.id === currentRole) || roles[0];
  const CurrentRoleIcon = currentRoleObj.icon;
  const currentLangMeta = I18nService.getCurrentLanguageMeta();

  return (
    <header id="main-header" className="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          
          {/* Hamburger Menu & Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="header-hamburger-menu-btn"
              type="button"
              onClick={() => setShowHamburger(!showHamburger)}
              className="p-2 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Open Navigation Menu"
            >
              {showHamburger ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
            </button>

            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                if (onNavigate) onNavigate(currentRole === 'farmer' ? 'farmer-dashboard' : 'overview');
              }}
            >
              <KrishiRakshakLogo
                size="md"
                theme="light"
                showTagline={false}
              />
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5">

            {/* 🎙️ VAANI Voice Assistant Launcher Button */}
            <button
              id="header-vaani-voice-btn"
              onClick={onOpenVaani}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-extrabold shadow-sm shadow-emerald-700/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Open VAANI Multilingual Voice Guide"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>VAANI (वाणी)</span>
            </button>

            {/* SIH Demo Walkthrough Button */}
            <button
              id="header-sih-demo-guide-btn"
              onClick={onOpenDemoGuide}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Launch SIH Judge Guided Demo Tour"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden lg:inline">Judge Demo Tour</span>
              <span className="lg:hidden">Demo</span>
            </button>

            {/* Architecture Modal Button */}
            <button
              id="header-architecture-btn"
              onClick={onOpenArchitecture}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="View Technical System Architecture"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>Architecture</span>
            </button>

            {/* Brand Assets & Logo Button */}
            <button
              id="header-brand-assets-btn"
              onClick={() => setShowBrandModal(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200/80 transition-colors cursor-pointer"
              title="Official Digital KrishiVaani Cleaned Vector Logo & Brand Assets"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Logo & Assets</span>
            </button>

            {/* Offline Simulator Switch */}
            <button
              id="header-offline-toggle"
              onClick={onToggleOffline}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isOffline
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              }`}
              title={isOffline ? 'Offline Mode Active — Click to switch Online' : 'Online — Click to simulate Offline Field Mode'}
            >
              {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* 11 Indian Languages Dropdown Selector */}
            <div className="relative">
              <button
                id="header-language-btn"
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowRoleMenu(false);
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden md:inline">{currentLangMeta.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div
                  id="header-language-menu"
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-80 overflow-y-auto"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Select Advisory Language (11)
                  </div>
                  {supportedLanguages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguagePick(lang.code)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        activeLangCode === lang.code ? 'font-extrabold text-emerald-800 bg-emerald-50/80' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400">{lang.name} • {lang.region}</span>
                      </div>
                      {activeLangCode === lang.code && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <button
              id="header-notifications-btn"
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="View Notifications & Risk Alerts"
            >
              <Bell className="w-4 h-4" />
              {effectiveUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                  {effectiveUnreadCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="header-user-profile-btn"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowRoleMenu(false);
                    setShowLangMenu(false);
                  }}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-bold text-slate-900 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px]">
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-[10px] text-slate-500 leading-none">Signed in:</div>
                    <div className="font-bold text-xs max-w-[90px] truncate">{currentUser.name}</div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                          {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{currentUser.phone || currentUser.email}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md uppercase">
                          {currentUser.role}
                        </span>
                        <span className="text-slate-400 font-medium">📍 {currentUser.village || 'Sanwer'}</span>
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onNavigate) onNavigate('profile');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-500" />
                        <span>Profile & Voice Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign Out (लॉग आउट)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-signin-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Role Switcher Button & Dropdown */}
            <div className="relative">
              <button
                id="header-role-switcher-btn"
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowLangMenu(false);
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                  <CurrentRoleIcon className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[10px] text-slate-300 leading-none">Role:</div>
                  <div className="font-bold text-xs">{currentRoleObj.label}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {showRoleMenu && (
                <div
                  id="header-role-menu"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Switch Persona for SIH Demo</p>
                    <p className="text-[11px] text-slate-500">Each role has specific views and permissions</p>
                  </div>
                  <div className="py-1 space-y-1">
                    {roles.map(r => {
                      const Icon = r.icon;
                      const isSelected = currentRole === r.id;
                      return (
                        <button
                          key={r.id}
                          id={`role-select-${r.id}`}
                          onClick={() => handleRoleSelect(r.id as UserRole)}
                          className={`w-full p-2.5 rounded-xl flex items-start gap-3 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50/80 border border-emerald-200/80'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                                {r.label}
                              </span>
                              {isSelected && (
                                <span className="px-1.5 py-0.2 bg-emerald-200/70 text-emerald-800 text-[9px] font-extrabold rounded">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                              {r.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between px-2">
                    <button
                      id="reset-demo-state-btn"
                      onClick={() => {
                        if (confirm('Reset prototype to original seeded demo state?')) {
                          handleReset();
                          setShowRoleMenu(false);
                        }
                      }}
                      className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-rose-600 transition-colors cursor-pointer py-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Demo Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Slide-out Hamburger Navigation Drawer */}
      {showHamburger && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowHamburger(false)}
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Top */}
              <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-950 text-white flex items-center justify-between">
                <KrishiRakshakLogo
                  size="md"
                  theme="dark"
                  showTagline={true}
                  taglineText="“Aapka AI Krishi Saathi”"
                />
                <button
                  onClick={() => setShowHamburger(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="p-3 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Farmer Navigation (मुख्य सुविधाएं)
                </div>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('farmer-dashboard');
                    setShowHamburger(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 font-bold text-xs transition-colors cursor-pointer text-left"
                >
                  <Home className="w-4 h-4 text-emerald-700" />
                  <span>Home (मुख्य पृष्ठ)</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('crop-scanner');
                    setShowHamburger(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-emerald-50 text-emerald-950 font-extrabold text-xs transition-colors cursor-pointer text-left border border-emerald-200"
                >
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>Scan My Crop (फसल स्कैन करें)</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenVaani) onOpenVaani();
                    setShowHamburger(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-amber-50 text-amber-950 font-extrabold text-xs transition-colors cursor-pointer text-left border border-amber-200"
                >
                  <Mic className="w-4 h-4 text-amber-700 animate-pulse" />
                  <span>Ask VAANI (वाणी से बोलकर पूछें)</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('crop-health');
                    setShowHamburger(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors cursor-pointer text-left"
                >
                  <Activity className="w-4 h-4 text-emerald-700" />
                  <span>Crop Health Status (फसल स्वास्थ्य)</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('weather-intel');
                    setShowHamburger(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors cursor-pointer text-left"
                >
                  <CloudSun className="w-4 h-4 text-sky-700" />
                  <span>Weather & Rain Risk (मौसम व वर्षा जोखिम)</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('pest-monitoring');
                    setShowHamburger(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors cursor-pointer text-left"
                >
                  <Bug className="w-4 h-4 text-amber-700" />
                  <span>Pest & Disease Traps (कीट निगरानी)</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('government-schemes');
                    setShowHamburger(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-teal-50 text-slate-800 hover:text-teal-950 font-bold text-xs transition-colors cursor-pointer text-left"
                >
                  <Landmark className="w-4 h-4 text-teal-700" />
                  <span>Government Schemes (सरकारी योजनाएं व सब्सिडी)</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('my-fields');
                    setShowHamburger(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors cursor-pointer text-left"
                >
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>My Farm & Geo-Plots (मेरा खेत)</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('gis-hotspots');
                    setShowHamburger(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors cursor-pointer text-left"
                >
                  <Layers className="w-4 h-4 text-indigo-700" />
                  <span>District GIS Hotspot Map (जिला प्रकोप नक्शा)</span>
                </button>

                <div className="pt-2 border-t border-slate-100 px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Settings & Assistance
                </div>

                <button
                  onClick={() => {
                    setShowHamburger(false);
                    setShowLangMenu(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    <span>भाषा (Language): {currentLangMeta.nativeName}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    if (onOpenDemoGuide) onOpenDemoGuide();
                    setShowHamburger(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>SIH Judge Demo Walkthrough</span>
                </button>

                <button
                  onClick={() => {
                    setShowBrandModal(true);
                    setShowHamburger(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl hover:bg-emerald-50 text-emerald-900 font-semibold text-xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Brand Assets & Clean Logo (लोगो डाउनलोड)</span>
                </button>
              </div>
            </div>

            {/* Drawer Bottom */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">v2.4 Production • Offline-First</span>
                <button
                  onClick={() => {
                    if (confirm('Reset prototype demo state?')) {
                      handleReset();
                      setShowHamburger(false);
                    }
                  }}
                  className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Demo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Brand Assets & Logo Modal */}
      <BrandAssetsModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
      />
    </header>
  );
};

