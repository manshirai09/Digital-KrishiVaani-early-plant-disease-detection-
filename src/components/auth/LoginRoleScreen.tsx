import React, { useState } from 'react';
import { UserRole } from '../../types';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import {
  ShieldCheck,
  User,
  Users,
  Building2,
  GraduationCap,
  Sparkles,
  Phone,
  ArrowRight,
  CheckCircle2,
  Layers,
  Radio,
  CloudSun,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

interface LoginRoleScreenProps {
  onSelectRoleAndEnter: (role: UserRole) => void;
  onOpenArchitecture: () => void;
}

export const LoginRoleScreen: React.FC<LoginRoleScreenProps> = ({
  onSelectRoleAndEnter,
  onOpenArchitecture
}) => {
  const [phoneNumber, setPhoneNumber] = useState('9826014820');
  const [otpSent, setOtpSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');

  const roles = [
    {
      id: 'farmer' as UserRole,
      title: 'Farmer Persona',
      name: 'Ramesh Patidar',
      location: 'Sanwer, Indore, MP',
      badge: 'Crop Health & Scans',
      icon: User,
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-950',
      tagColor: 'bg-emerald-700 text-white',
      description: 'Upload leaf photos, monitor IoT sensor nodes, view 7-day risk forecasts & pre-approved IPM advisories.'
    },
    {
      id: 'extension' as UserRole,
      title: 'Extension Worker',
      name: 'Vikram Singh',
      location: 'Indore North Sub-Division',
      badge: 'Field Inspections',
      icon: Users,
      color: 'border-sky-500 bg-sky-50/50 text-sky-950',
      tagColor: 'bg-sky-700 text-white',
      description: 'Inspect proximity alerts, perform geoverified farm visits, and escalate suspect cases to Zonal Scientists.'
    },
    {
      id: 'officer' as UserRole,
      title: 'Agriculture Officer',
      name: 'Dr. Rajesh Mishra',
      location: 'District Agriculture Office, Indore',
      badge: 'GIS & Outbreak Analytics',
      icon: Building2,
      color: 'border-indigo-500 bg-indigo-50/50 text-indigo-950',
      tagColor: 'bg-indigo-700 text-white',
      description: 'District GIS hotspot surveillance map, cluster outbreak containment, and block-level vulnerability analytics.'
    },
    {
      id: 'expert' as UserRole,
      title: 'Expert / Scientist',
      name: 'Dr. Ananya Sharma',
      location: 'Zonal Agricultural Research Station (ZARS)',
      badge: 'Human Validation Queue',
      icon: GraduationCap,
      color: 'border-purple-500 bg-purple-50/50 text-purple-950',
      tagColor: 'bg-purple-700 text-white',
      description: 'Review confidence-gated low-certainty cases (<75%), confirm pathogen diagnoses, and approve tailored advisories.'
    }
  ];

  const handleSendOtp = () => {
    setOtpSent(true);
  };

  const handleEnterDemo = () => {
    onSelectRoleAndEnter(selectedRole);
  };

  return (
    <div id="login-role-screen" className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex items-center justify-between">
        <KrishiRakshakLogo
          size="md"
          theme="dark"
          showTagline={true}
          taglineText="Aapka AI Krishi Saathi"
        />

        <button
          id="login-arch-btn"
          onClick={onOpenArchitecture}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">System Architecture</span>
        </button>
      </div>

      {/* Hero Intro Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Multi-Source Crop Health Early Warning & Human-in-the-Loop Validation System</span>
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
          "See the risk <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">before</span> you see the damage."
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Combining <strong>AI leaf image analysis</strong>, <strong>ESP32 IoT telemetry</strong>, <strong>pheromone pest traps</strong>, <strong>weather forecasting</strong>, and <strong>district GIS intelligence</strong> — backed by mandatory scientist validation for high-risk interventions.
        </p>

        {/* 3 Core Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 text-left max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">1. Detect Early</h4>
            <p className="text-xs text-slate-400 mt-1">
              AI leaf segmentation & symptom pattern matching with confidence thresholds.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2.5">
              <CloudSun className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">2. Predict Risk</h4>
            <p className="text-xs text-slate-400 mt-1">
              Fuses relative humidity, rainfall, leaf wetness, and trap catch into a single 0-100 score.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">3. Validate & Respond</h4>
            <p className="text-xs text-slate-400 mt-1">
              Confidence-gated human scientist review ensures safe, pre-approved IPM advisories.
            </p>
          </div>
        </div>
      </div>

      {/* Persona Selection & Quick Demo Entry */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-12">
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                SIH Evaluation Gateway
              </span>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 mt-0.5">
                Select a Role to Experience the Live Prototype
              </h3>
            </div>

            {/* Simulated OTP login field */}
            <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <Phone className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="text"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="Mobile number"
                className="bg-transparent text-xs font-mono font-semibold text-slate-800 outline-none w-28"
              />
              <button
                id="login-otp-btn"
                onClick={handleSendOtp}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold cursor-pointer transition-colors"
              >
                {otpSent ? 'OTP Sent ✓' : 'Verify OTP'}
              </button>
            </div>
          </div>

          {/* 4 Role Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {roles.map(role => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  id={`login-role-card-${role.id}`}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-lg shadow-emerald-600/15 scale-[1.02]'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold shadow-xs">
                      SELECTED
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {role.location ? role.location.split(',')[0] : ''}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{role.title}</h4>
                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">{role.name}</p>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>Enter {role.title ? role.title.split(' ')[0] : 'Role'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enter Demo Action Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Demo environment loaded with realistic Indore/Madhya Pradesh agro-climatic data.</span>
            </div>

            <button
              id="enter-demo-btn"
              onClick={handleEnterDemo}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-800/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Enter Interactive Demo as {roles.find(r => r.id === selectedRole)?.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 border-t border-slate-800/60 text-center text-xs text-slate-500">
        <p>Smart India Hackathon 2026 Prototype — Digital KrishiVaani Early Warning System. Demo Data strictly simulated for judging workflow.</p>
      </div>

    </div>
  );
};
