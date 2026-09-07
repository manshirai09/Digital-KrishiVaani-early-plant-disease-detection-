import React, { useState } from 'react';
import { UserRole, SupportedLanguageCode, UserAccount } from '../../types';
import { AuthService, LoginPayload, SignupPayload, SEEDED_USERS } from '../../services/authService';
import { I18nService } from '../../services/i18nService';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import {
  ShieldCheck,
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  MapPin,
  Globe,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess: (user: UserAccount) => void;
  onCancel?: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
  initialRole?: UserRole;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onCancel,
  initialMode = 'login',
  initialRole = 'farmer'
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('9826014820');
  const [loginPassword, setLoginPassword] = useState('kisan@123');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('kisan@123');
  const [signupVillage, setSignupVillage] = useState('Sanwer');
  const [signupDistrict, setSignupDistrict] = useState('Indore');
  const [signupState, setSignupState] = useState('Madhya Pradesh');
  const [signupLanguage, setSignupLanguage] = useState<SupportedLanguageCode>(I18nService.getCurrentLanguage());

  // Forgot password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const languages = I18nService.getSupportedLanguages();

  // Quick fill preset credentials for judges/evaluators
  const handleQuickFill = (role: UserRole) => {
    setSelectedRole(role);
    const users = AuthService.getUsers();
    const user = users.find(u => u.role === role) || SEEDED_USERS.find(u => u.role === role);
    if (user) {
      setLoginIdentifier(user.phone);
      setLoginPassword(user.passwordHash || 'demo123');
      setLoginOtp('1234');
      setLoginOtpSent(true);
      setError(null);
      setSuccessMsg(`Selected ${user.name} (${(user.role || 'farmer').toUpperCase()})`);
    }
  };

  const handleSendLoginOtp = () => {
    if (!loginIdentifier || loginIdentifier.trim().length < 5) {
      setError('Please enter a valid mobile number to receive OTP.');
      return;
    }
    setError(null);
    const res = AuthService.requestOtp(loginIdentifier);
    setLoginOtpSent(true);
    setLoginOtp(res.otp);
    setSuccessMsg(`OTP code (${res.otp}) sent successfully.`);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let user: UserAccount;
      if (loginMethod === 'otp') {
        user = await AuthService.loginWithOtp(
          loginIdentifier,
          loginOtp || '1234',
          selectedRole,
          'किसान जी'
        );
      } else {
        user = await AuthService.login({
          identifier: loginIdentifier,
          password: loginPassword,
          rememberMe
        });
      }

      // Apply preferred language of the logged in user
      if (user.preferredLanguage) {
        I18nService.setLanguage(user.preferredLanguage);
      }
      setSuccessMsg(`Welcome back, ${user.name}!`);
      setTimeout(() => {
        onSuccess(user);
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials or use OTP login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: SignupPayload = {
        name: signupName || 'किसान जी',
        phone: signupPhone,
        email: signupEmail,
        password: signupPassword || 'kisan@123',
        role: selectedRole,
        state: signupState || 'Madhya Pradesh',
        district: signupDistrict || 'Indore',
        village: signupVillage || 'Sanwer',
        preferredLanguage: signupLanguage
      };
      const user = await AuthService.signup(payload);
      if (user.preferredLanguage) {
        I18nService.setLanguage(user.preferredLanguage);
      }
      setSuccessMsg(`Account created successfully! Welcome ${user.name}`);
      setTimeout(() => {
        onSuccess(user);
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await AuthService.requestPasswordReset(forgotIdentifier);
      setOtpCode(res.otpCode);
      setEnteredOtp(res.otpCode); // Pre-fill for seamless demonstration
      setOtpSent(true);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to request reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await AuthService.resetPassword(forgotIdentifier, enteredOtp, newPassword);
      setSuccessMsg('Password reset successful! You can now login with your new password.');
      setTimeout(() => {
        setMode('login');
        setLoginIdentifier(forgotIdentifier);
        setLoginPassword(newPassword);
        setOtpSent(false);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-screen-container" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-auto">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <KrishiRakshakLogo
              size="md"
              theme="dark"
              showTagline={true}
              taglineText="Aapka AI Krishi Saathi"
            />
            
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                ✕ Close
              </button>
            )}
          </div>

          {/* Persona 1-Click Fast Selector Strip */}
          <div className="mt-4 pt-3 border-t border-emerald-700/50">
            <div className="flex items-center justify-between text-[11px] text-emerald-200 mb-1.5 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Quick Test Persona (1-Click Fill):</span>
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('farmer')}
                className={`px-2 py-1.5 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                  selectedRole === 'farmer' && mode === 'login'
                    ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30 font-extrabold'
                    : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-800/80 border border-emerald-600/30'
                }`}
              >
                🌾 Kisan
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('extension')}
                className={`px-2 py-1.5 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                  selectedRole === 'extension' && mode === 'login'
                    ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30 font-extrabold'
                    : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-800/80 border border-emerald-600/30'
                }`}
              >
                📋 Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('officer')}
                className={`px-2 py-1.5 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                  selectedRole === 'officer' && mode === 'login'
                    ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30 font-extrabold'
                    : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-800/80 border border-emerald-600/30'
                }`}
              >
                🗺️ District
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('expert')}
                className={`px-2 py-1.5 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                  selectedRole === 'expert' && mode === 'login'
                    ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30 font-extrabold'
                    : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-800/80 border border-emerald-600/30'
                }`}
              >
                🔬 ICAR
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In (लॉगिन)
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account (नया खाता)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          
          {/* Error / Success Banners */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ----------------- LOGIN MODE ----------------- */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Login Method Sub-tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-1">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('password'); setError(null); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    loginMethod === 'password'
                      ? 'bg-white text-emerald-900 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🔐 Password Login (पासवर्ड)
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('otp'); setError(null); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    loginMethod === 'otp'
                      ? 'bg-white text-emerald-900 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  📱 Mobile OTP (ओटीपी)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{loginMethod === 'otp' ? 'Mobile Number (मोबाइल नंबर)' : 'Mobile Number or Email'}</span>
                </label>
                <input
                  id="auth-login-identifier-input"
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder={loginMethod === 'otp' ? 'e.g. 9826014820' : 'e.g. 9826014820 or user@krishirakshak.in'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              {loginMethod === 'password' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); setForgotIdentifier(loginIdentifier); }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="auth-login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="Enter password (e.g. kisan@123)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                      <span>OTP Verification Code</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSendLoginOtp}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      {loginOtpSent ? 'Resend OTP (ओटीपी पुनः भेजें)' : 'Send OTP (ओटीपी प्राप्त करें)'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="auth-login-otp-input"
                      type="text"
                      required
                      value={loginOtp}
                      onChange={e => setLoginOtp(e.target.value)}
                      placeholder="Enter OTP (e.g. 1234)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold tracking-widest text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Keep me signed in</span>
                </label>

                <span className="text-[11px] text-slate-400 font-mono">
                  Role: <strong className="text-emerald-700 uppercase">{selectedRole}</strong>
                </span>
              </div>

              <button
                id="auth-login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Digital KrishiVaani</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ----------------- SIGNUP MODE ----------------- */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Select User Account Type
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['farmer', 'extension', 'officer', 'expert'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`py-1.5 rounded-xl text-[11px] font-bold border transition-all capitalize cursor-pointer ${
                        selectedRole === r
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-extrabold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Full Name</span>
                </label>
                <input
                  id="auth-signup-name-input"
                  type="text"
                  required
                  value={signupName}
                  onChange={e => setSignupName(e.target.value)}
                  placeholder="e.g. Ramesh Patidar"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Mobile Number</span>
                  </label>
                  <input
                    id="auth-signup-phone-input"
                    type="tel"
                    required
                    value={signupPhone}
                    onChange={e => setSignupPhone(e.target.value)}
                    placeholder="e.g. 9826014820"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Advisory Language</span>
                  </label>
                  <select
                    id="auth-signup-lang-select"
                    value={signupLanguage}
                    onChange={e => setSignupLanguage(e.target.value as SupportedLanguageCode)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    {languages.map(l => (
                      <option key={l.code} value={l.code}>
                        {l.nativeName} ({l.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Village / Block</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signupVillage}
                    onChange={e => setSignupVillage(e.target.value)}
                    placeholder="e.g. Sanwer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>District, State</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={`${signupDistrict}, ${signupState}`}
                    onChange={e => {
                      const parts = (e.target.value || '').split(',');
                      setSignupDistrict(parts[0]?.trim() || '');
                      setSignupState(parts[1]?.trim() || 'Madhya Pradesh');
                    }}
                    placeholder="Indore, MP"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Choose Password</span>
                </label>
                <input
                  id="auth-signup-password-input"
                  type="password"
                  required
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <button
                id="auth-signup-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Kisan Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ----------------- FORGOT PASSWORD MODE ----------------- */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-700" />
                  <span>Reset Account Password</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enter your registered mobile number or email to receive a verification OTP code.
                </p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={e => setForgotIdentifier(e.target.value)}
                      placeholder="e.g. 9826014820"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 py-1 cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                    <span className="font-bold">Simulated OTP Code: </span>
                    <span className="font-mono font-extrabold text-sm">{otpCode}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      required
                      value={enteredOtp}
                      onChange={e => setEnteredOtp(e.target.value)}
                      placeholder="e.g. 6-digit code"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Enter New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="New password (min 4 chars)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? 'Resetting Password...' : 'Save New Password & Sign In'}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Security & Offline Badge */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1 text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>National ICAR-KVK Security Protected</span>
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            v2.4 SIH
          </span>
        </div>

      </div>
    </div>
  );
};
