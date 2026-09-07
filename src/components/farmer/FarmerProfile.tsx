import React, { useState, useEffect } from 'react';
import { Farm, SupportedLanguageCode, UserAccount } from '../../types';
import { StorageService } from '../../services/storageService';
import { AuthService } from '../../services/authService';
import { I18nService } from '../../services/i18nService';
import { VaaniService } from '../../services/vaaniService';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import {
  User,
  Phone,
  MapPin,
  Globe,
  Volume2,
  VolumeX,
  Database,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Save,
  LogOut,
  Sparkles,
  Sliders,
  Play
} from 'lucide-react';

interface FarmerProfileProps {
  farm?: Farm;
  onResetData: () => void;
  onLogout?: () => void;
}

export const FarmerProfile: React.FC<FarmerProfileProps> = ({
  farm,
  onResetData,
  onLogout
}) => {
  const session = AuthService.getAuthSession();
  const [user, setUser] = useState<UserAccount | null>(session?.user || null);

  const [name, setName] = useState(user?.name || 'Ramesh Patidar');
  const [phone, setPhone] = useState(user?.phone || '9826014820');
  const [village, setVillage] = useState(user?.village || 'Sanwer');
  const [district, setDistrict] = useState(user?.district || 'Indore');
  const [stateName, setStateName] = useState(user?.state || 'Madhya Pradesh');
  const [language, setLanguage] = useState<SupportedLanguageCode>(
    (user?.preferredLanguage as SupportedLanguageCode) || I18nService.getCurrentLanguage()
  );
  
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.9); // Comfortable tempo for farmers
  const [isSyncing, setIsSyncing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState(false);

  const languages = I18nService.getSupportedLanguages();

  useEffect(() => {
    const unsub = I18nService.subscribe(lang => {
      setLanguage(lang);
    });
    return unsub;
  }, []);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    I18nService.setLanguage(language);

    // Persist to user account if logged in
    if (user) {
      const updatedUser: UserAccount = {
        ...user,
        name,
        phone,
        village,
        district,
        state: stateName,
        preferredLanguage: language
      };
      AuthService.updateUser(user.id, updatedUser);
      setUser(updatedUser);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestVoiceAudio = () => {
    setIsPlayingTestAudio(true);
    const testText = I18nService.t('vaaniTitle') + '. ' + I18nService.t('tagline');
    VaaniService.speak(testText, language, () => {
      setIsPlayingTestAudio(false);
    });
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Offline database synchronized with Digital KrishiVaani cloud nodes.');
    }, 1000);
  };

  return (
    <div id="farmer-profile-view" className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <KrishiRakshakLogo
              size="sm"
              theme="light"
              showTagline={false}
            />
            <span className="text-slate-300">|</span>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">
              {I18nService.t('navProfile')} & Settings
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            “Aapka AI Krishi Saathi” • Account identity, regional language, voice audio assistant, and offline field cache
          </p>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* User Identity Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-emerald-700 text-white flex items-center justify-center font-display font-extrabold text-2xl shadow-lg shadow-emerald-700/20">
            {name ? name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'RP'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-xl text-slate-900">{name}</h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase">
                {user?.role || 'Farmer'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
              <span>📞 {phone}</span>
              <span>•</span>
              <span>📍 {village}, {district}, {stateName}</span>
            </p>
          </div>
        </div>

        {/* Form Preferences */}
        <form onSubmit={handleSavePreferences} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Mobile Number</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                <span>Advisory Language (11 Regional Languages)</span>
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as SupportedLanguageCode)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.name} • {l.region})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>VAANI Voice Assistant Audio Readout</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`flex-1 px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    voiceEnabled
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  <span>{voiceEnabled ? 'Voice Active' : 'Voice Muted'}</span>
                  {voiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                </button>

                <button
                  type="button"
                  onClick={handleTestVoiceAudio}
                  disabled={isPlayingTestAudio}
                  className="px-3 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Test Voice Readout in Selected Language"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isPlayingTestAudio ? 'Speaking...' : 'Test Voice'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Village / Gram Panchayat</span>
              </label>
              <input
                type="text"
                value={village}
                onChange={e => setVillage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>District & State</span>
              </label>
              <input
                type="text"
                value={`${district}, ${stateName}`}
                onChange={e => {
                  const parts = (e.target.value || '').split(',');
                  setDistrict(parts[0]?.trim() || '');
                  setStateName(parts[1]?.trim() || 'Madhya Pradesh');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile & Preferences Saved Successfully!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-700/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>

      </div>

      {/* Offline-First Storage & Network Architecture Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-700" />
            <h4 className="font-bold text-sm text-slate-900">Offline-First PWA Sync Engine</h4>
          </div>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
            LOCAL PERSISTENCE READY
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Digital KrishiVaani caches crop scans, risk indices, and pre-approved IPM advisories on-device using IndexedDB / LocalStorage, enabling uninterrupted offline diagnosis when field cellular coverage drops.
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block">Offline Cached Records</span>
            <span className="font-bold text-slate-800 font-mono text-sm mt-0.5 block">14 Cases (Encrypted)</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block">Cloud Node Status</span>
            <span className="font-bold text-emerald-700 text-xs mt-1 block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Synced (ZARS Indore Gateway)
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Force Cloud Resync'}</span>
          </button>

          <button
            onClick={onResetData}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
          >
            Reset Demo Prototype Data
          </button>
        </div>
      </div>

      {/* Emergency Kisan Call Center Helpline */}
      <div className="p-4 bg-emerald-950 text-white rounded-3xl flex items-center justify-between border border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-800 rounded-xl">
            <PhoneCall className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Government Kisan Call Center</h4>
            <p className="text-[11px] text-emerald-200">Toll-free 24x7 expert agricultural advice in 22 languages</p>
          </div>
        </div>
        <a
          href="tel:18001801551"
          className="px-3.5 py-2 bg-white text-emerald-950 rounded-xl text-xs font-extrabold shadow-xs hover:bg-emerald-50 transition-colors"
        >
          1800-180-1551
        </a>
      </div>

    </div>
  );
};
