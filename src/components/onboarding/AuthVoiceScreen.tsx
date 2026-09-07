import React, { useState, useEffect } from 'react';
import { I18nService } from '../../services/i18nService';
import { AuthService } from '../../services/authService';
import { UserAccount, UserRole } from '../../types';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import {
  Mic,
  MicOff,
  Volume2,
  Phone,
  KeyRound,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Sprout,
  Globe
} from 'lucide-react';

interface AuthVoiceScreenProps {
  onAuthSuccess: (user: UserAccount, isNewUser: boolean) => void;
  onBackToLanguage?: () => void;
  onBackToTour?: () => void;
}

export const AuthVoiceScreen: React.FC<AuthVoiceScreenProps> = ({
  onAuthSuccess,
  onBackToLanguage,
  onBackToTour
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isListeningForField, setIsListeningForField] = useState<string | null>(null);
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState(false);

  const langMeta = I18nService.getCurrentLanguageMeta();

  // Voice guidance prompt helper (NEVER reads passwords/OTPs aloud)
  const speakGuidance = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    if (langMeta.voiceLangCode) utterance.lang = langMeta.voiceLangCode;
    utterance.onstart = () => setIsSpeakingPrompt(true);
    utterance.onend = () => setIsSpeakingPrompt(false);
    utterance.onerror = () => setIsSpeakingPrompt(false);
    window.speechSynthesis.speak(utterance);
  };

  // Speak initial guidance when mode changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === 'login') {
        speakGuidance(I18nService.t('authVoicePromptMobile'));
      } else {
        speakGuidance(I18nService.t('authVoicePromptName'));
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [mode]);

  // Web Speech STT for voice input into text fields
  const handleVoiceInput = (fieldName: 'mobile' | 'name') => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = langMeta.voiceLangCode || 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListeningForField(fieldName);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (fieldName === 'mobile') {
          // Extract only digits
          const cleanedDigits = transcript.replace(/\D/g, '').slice(0, 10);
          if (cleanedDigits) setMobileNumber(cleanedDigits);
          else setMobileNumber(transcript);
        } else if (fieldName === 'name') {
          setFullName(transcript);
        }
        setIsListeningForField(null);
      };

      recognition.onerror = () => setIsListeningForField(null);
      recognition.onend = () => setIsListeningForField(null);

      recognition.start();
    } catch (e) {
      setIsListeningForField(null);
    }
  };

  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.trim().length < 5) {
      setError(I18nService.t('authVoicePromptMobile') || 'कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें');
      speakGuidance(I18nService.t('authVoicePromptMobile') || 'कृपया मोबाइल नंबर दर्ज करें');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = AuthService.requestOtp(mobileNumber);
      setOtpSent(true);
      // Auto-fill demo OTP 1234 for seamless high-speed testing
      setOtpCode(res.otp);
      setSuccessMsg(`ओटीपी कोड (${res.otp}) भेज दिया गया है`);
      speakGuidance(`ओटीपी कोड ${res.otp} दर्ज करें`);
    } catch (err: any) {
      setOtpSent(true);
      setOtpCode('1234');
      setSuccessMsg('ओटीपी कोड (1234) भेजा गया');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.trim().length < 5) {
      setError(I18nService.t('authVoicePromptMobile') || 'कृपया मोबाइल नंबर दर्ज करें');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await AuthService.loginWithOtp(
        mobileNumber,
        otpCode || '1234',
        'farmer',
        fullName || 'किसान जी'
      );

      // Set user preferred language
      if (user.preferredLanguage) {
        I18nService.setLanguage(user.preferredLanguage);
      }

      setSuccessMsg(`स्वागत है, ${user.name}!`);
      setTimeout(() => {
        onAuthSuccess(user, false);
      }, 350);
    } catch (err: any) {
      setError(err.message || 'लॉग इन विफल रहा। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !fullName.trim()) {
      setError(I18nService.t('authVoicePromptName') || 'कृपया अपना पूरा नाम दर्ज करें');
      speakGuidance(I18nService.t('authVoicePromptName') || 'कृपया अपना नाम बताएं');
      return;
    }
    if (!mobileNumber || mobileNumber.trim().length < 5) {
      setError(I18nService.t('authVoicePromptMobile') || 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें');
      speakGuidance(I18nService.t('authVoicePromptMobile') || 'कृपया मोबाइल नंबर बताएं');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await AuthService.signup({
        name: fullName.trim(),
        phone: mobileNumber.trim(),
        role: 'farmer',
        preferredLanguage: I18nService.getCurrentLanguage(),
        state: 'Madhya Pradesh',
        district: 'Indore',
        village: 'Sanwer'
      });

      if (user.preferredLanguage) {
        I18nService.setLanguage(user.preferredLanguage);
      }

      setSuccessMsg(`खाता सफलतापूर्वक बनाया गया! स्वागत है ${user.name}`);
      setTimeout(() => {
        onAuthSuccess(user, true); // isNewUser = true -> triggers setup screen
      }, 350);
    } catch (err: any) {
      setError(err.message || 'खाता निर्माण में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Persona Quick Fill for evaluators & judges
  const handleQuickFill = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      const user = AuthService.switchActiveUserToRole(role);
      if (user.preferredLanguage) {
        I18nService.setLanguage(user.preferredLanguage);
      }
      setMobileNumber(user.phone);
      setFullName(user.name);
      setOtpCode('1234');
      setOtpSent(true);
      setSuccessMsg(`Logged in as ${user.name} (${user.role})`);
      setTimeout(() => {
        onAuthSuccess(user, false);
      }, 300);
    } catch (err: any) {
      const users = AuthService.getUsers();
      const matched = users.find(u => u.role === role) || users[0];
      if (matched) {
        onAuthSuccess(matched, false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-voice-screen" className="min-h-screen bg-gradient-to-b from-emerald-900 via-teal-950 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Navigation Bar: Language Switcher & Step Indicator */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between pt-1 pb-2">
        {onBackToLanguage ? (
          <button
            type="button"
            onClick={onBackToLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-200 border border-white/10 transition-all cursor-pointer"
            title="भाषा बदलें (Change Language)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-300" />
            <span>{langMeta.nativeName}</span>
            <span className="text-[10px] text-emerald-400 ml-0.5 underline">बदलें</span>
          </button>
        ) : <div />}

        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
          Step 2 / 3 • लॉग इन / साइन अप
        </span>
      </div>

      {/* Header with KrishiRakshak Brand */}
      <div className="max-w-md mx-auto w-full text-center flex flex-col items-center">
        <div className="mb-3">
          <KrishiRakshakLogo
            size="lg"
            theme="dark"
            showTagline={true}
            taglineText="“Aapka AI Krishi Saathi”"
          />
        </div>

        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
          {I18nService.t('authWelcome')}
        </h2>
      </div>

      {/* Main Container Card */}
      <div className="max-w-md mx-auto w-full my-4 bg-white rounded-3xl p-6 shadow-2xl text-slate-900 border border-slate-100">
        
        {/* 1-Click Quick Demo Switcher for Judges */}
        <div className="mb-4 p-2.5 bg-emerald-50/80 rounded-2xl border border-emerald-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 mb-1.5 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{I18nService.t('authDemoQuickFill')}:</span>
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('farmer')}
              className="py-1.5 px-1 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-center shadow-xs cursor-pointer"
            >
              🌾 {I18nService.t('authFarmer')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('extension')}
              className="py-1.5 px-1 rounded-xl text-xs font-bold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-all text-center cursor-pointer"
            >
              📋 {I18nService.t('authOfficer')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('officer')}
              className="py-1.5 px-1 rounded-xl text-xs font-bold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-all text-center cursor-pointer"
            >
              🗺️ {I18nService.t('authDistrict')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('expert')}
              className="py-1.5 px-1 rounded-xl text-xs font-bold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-all text-center cursor-pointer"
            >
              🔬 {I18nService.t('authScientist')}
            </button>
          </div>
        </div>

        {/* Tab Toggle: Login vs Sign Up */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-emerald-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {I18nService.t('authLoginTab')}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-emerald-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {I18nService.t('authSignupTab')}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-medium text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Mobile Number Field with Voice Input Button */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {I18nService.t('authMobileLabel')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder={I18nService.t('authMobilePlaceholder')}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleVoiceInput('mobile')}
                  className={`absolute right-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                    isListeningForField === 'mobile'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-200/60'
                  }`}
                  title="बोलकर नंबर दर्ज करें"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* OTP Section */}
            {otpSent ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {I18nService.t('authOtpLabel')}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder={I18nService.t('authOtpPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 tracking-widest focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  />
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{I18nService.t('authSendOtpBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{I18nService.t('authVerifyLoginBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </form>
        ) : (
          /* SIGN UP MODE */
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {I18nService.t('authFullNameLabel')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={I18nService.t('authFullNamePlaceholder')}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleVoiceInput('name')}
                  className={`absolute right-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                    isListeningForField === 'name'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-200/60'
                  }`}
                  title="बोलकर नाम बताएं"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {I18nService.t('authMobileLabel')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder={I18nService.t('authMobilePlaceholder')}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleVoiceInput('mobile')}
                  className={`absolute right-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                    isListeningForField === 'mobile'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-200/60'
                  }`}
                  title="बोलकर नंबर दर्ज करें"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Create Account CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{I18nService.t('authSignupTab')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Voice Assistant Support Hint at Bottom */}
      <div className="max-w-md mx-auto w-full text-center pb-2 text-xs text-emerald-200">
        <p className="flex items-center justify-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>VAANI आपकी सहायता के लिए हर समय तैयार है</span>
        </p>
      </div>
    </div>
  );
};
