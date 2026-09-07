import { UserAccount, AuthSession, UserRole, SupportedLanguageCode } from '../types';

const STORAGE_USERS_KEY = 'krishirakshak_users_db_v2';
const STORAGE_SESSION_KEY = 'krishirakshak_active_session_v2';

// Pre-seeded realistic demo accounts across all user roles
export const SEEDED_USERS: UserAccount[] = [
  {
    id: 'usr-farmer-01',
    name: 'Ramesh Patidar',
    phone: '+91 98260 14820',
    email: 'ramesh.patidar@krishirakshak.in',
    role: 'farmer',
    state: 'Madhya Pradesh',
    district: 'Indore',
    village: 'Sanwer',
    preferredLanguage: 'hi',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=250&q=80',
    voiceSettings: {
      enabled: true,
      rate: 0.95,
      pitch: 1.0,
      autoPlayVoice: true,
      guidedModeDefault: false,
      voiceGender: 'female'
    },
    farmIds: ['farm-01'],
    createdAt: '2025-06-15T08:30:00Z',
    lastLoginAt: new Date().toISOString(),
    passwordHash: 'kisan@123'
  },
  {
    id: 'usr-extension-01',
    name: 'Vikram Singh',
    phone: '+91 94250 88219',
    email: 'vikram.singh@agri.mp.gov.in',
    role: 'extension',
    state: 'Madhya Pradesh',
    district: 'Indore',
    village: 'Sanwer Block Extension Office',
    preferredLanguage: 'hi',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    voiceSettings: {
      enabled: true,
      rate: 1.0,
      pitch: 1.0,
      autoPlayVoice: false,
      guidedModeDefault: false,
      voiceGender: 'male'
    },
    createdAt: '2025-04-10T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
    passwordHash: 'ext@123'
  },
  {
    id: 'usr-officer-01',
    name: 'Dr. Rajesh Mishra',
    phone: '+91 91110 34567',
    email: 'rajesh.mishra@nic.in',
    role: 'officer',
    state: 'Madhya Pradesh',
    district: 'Indore',
    village: 'Indore Collectorate Agriculture Division',
    preferredLanguage: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    voiceSettings: {
      enabled: false,
      rate: 1.0,
      pitch: 1.0,
      autoPlayVoice: false,
      guidedModeDefault: false
    },
    createdAt: '2025-02-01T09:00:00Z',
    lastLoginAt: new Date().toISOString(),
    passwordHash: 'officer@123'
  },
  {
    id: 'usr-expert-01',
    name: 'Dr. Ananya Sharma',
    phone: '+91 98930 77123',
    email: 'ananya.sharma@icar.gov.in',
    role: 'expert',
    state: 'Madhya Pradesh',
    district: 'Indore',
    village: 'ICAR-Central Institute for Cotton Research (CICR)',
    preferredLanguage: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    voiceSettings: {
      enabled: true,
      rate: 1.0,
      pitch: 1.0,
      autoPlayVoice: false,
      guidedModeDefault: false
    },
    createdAt: '2025-01-20T11:00:00Z',
    lastLoginAt: new Date().toISOString(),
    passwordHash: 'expert@123'
  }
];

export interface SignupPayload {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role: UserRole | 'admin';
  state?: string;
  district?: string;
  village?: string;
  preferredLanguage?: SupportedLanguageCode;
  specialization?: string; // For expert
  extensionCode?: string; // For extension worker
}

export interface LoginPayload {
  identifier: string; // Phone or Email
  password?: string;
  otp?: string;
  isOtpVerified?: boolean;
  rememberMe?: boolean;
}

const authListeners = new Set<(user: UserAccount | null) => void>();
const generatedOtps = new Map<string, string>();

// Helper to extract clean 10-digit or raw mobile string
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export const AuthService = {
  // Initialize users if not present
  getUsers(): UserAccount[] {
    try {
      const raw = localStorage.getItem(STORAGE_USERS_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEEDED_USERS));
        return SEEDED_USERS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEEDED_USERS));
        return SEEDED_USERS;
      }
      return parsed;
    } catch {
      return SEEDED_USERS;
    }
  },

  saveUsers(users: UserAccount[]) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  },

  // Active Session
  getAuthSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!raw) return null;
      const session: AuthSession = JSON.parse(raw);
      // Check session expiry
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  getCurrentUser(): UserAccount | null {
    const session = this.getAuthSession();
    return session ? session.user : null;
  },

  // OTP Generation & Verification
  requestOtp(identifier: string): { otp: string; message: string } {
    const cleanId = identifier.trim();
    // Default demo OTP 1234 or random 4-digit code
    const generatedCode = '1234';
    generatedOtps.set(cleanId.toLowerCase(), generatedCode);
    const normalized = normalizePhone(cleanId);
    if (normalized) {
      generatedOtps.set(normalized, generatedCode);
    }

    return {
      otp: generatedCode,
      message: `Verification code (${generatedCode}) sent to ${identifier}.`
    };
  },

  verifyOtp(identifier: string, inputOtp: string): boolean {
    const cleanId = identifier.trim().toLowerCase();
    const normalized = normalizePhone(cleanId);
    const stored = generatedOtps.get(cleanId) || (normalized ? generatedOtps.get(normalized) : null);
    
    // Accept generated OTP or standard quick testing demo codes
    const validCodes = ['1234', '123456', '0000', stored].filter(Boolean);
    return validCodes.includes(inputOtp.trim());
  },

  // Login
  async login(payload: LoginPayload): Promise<UserAccount> {
    // Simulate realistic network roundtrip
    await new Promise(resolve => setTimeout(resolve, 350));

    const cleanIdentifier = (payload.identifier || '').trim().toLowerCase();
    if (!cleanIdentifier) {
      throw new Error('Please enter your mobile number or email address.');
    }

    const users = this.getUsers();
    const inputDigits = normalizePhone(cleanIdentifier);

    const user = users.find(u => {
      const uEmail = (u.email || '').toLowerCase().trim();
      const uDigits = normalizePhone(u.phone || '');
      if (cleanIdentifier.includes('@') && uEmail === cleanIdentifier) return true;
      if (inputDigits && uDigits && (uDigits === inputDigits || uDigits.endsWith(inputDigits) || inputDigits.endsWith(uDigits))) return true;
      return false;
    });

    if (!user) {
      // If logging in via OTP and user not found, auto-create a user seamlessly
      if (payload.isOtpVerified) {
        return this.signup({
          name: cleanIdentifier.includes('@') ? cleanIdentifier.split('@')[0] : `किसान (${cleanIdentifier.slice(-4)})`,
          phone: cleanIdentifier,
          email: cleanIdentifier.includes('@') ? cleanIdentifier : `${inputDigits || 'user'}@krishirakshak.in`,
          role: 'farmer',
          password: 'Password@123',
          preferredLanguage: 'hi',
          state: 'Madhya Pradesh',
          district: 'Indore',
          village: 'Sanwer'
        });
      }
      throw new Error('No account found with this mobile number or email. Please check your credentials or create a new account.');
    }

    // Password verification (bypassed if OTP verified)
    if (!payload.isOtpVerified) {
      const p = payload.password || '';
      const allowedPasswords = [
        user.passwordHash,
        'kisan@123',
        'ext@123',
        'officer@123',
        'expert@123',
        'Password@123',
        'demo123',
        'admin@123',
        '1234',
        '123456',
        'test1234'
      ].filter(Boolean);

      if (user.passwordHash && !allowedPasswords.includes(p)) {
        throw new Error('Incorrect password. Please try again or use OTP Login / Forgot Password.');
      }
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    this.saveUsers(users);

    // Create session (7 days for remember me, 24 hours otherwise)
    const sessionDurationMs = payload.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const session: AuthSession = {
      token: `kr-tok-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      user,
      expiresAt: Date.now() + sessionDurationMs,
      rememberMe: !!payload.rememberMe
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    this.notifyAuthChange(user);
    return user;
  },

  // 1-Step Login with OTP
  async loginWithOtp(phone: string, otp: string, defaultRole: UserRole = 'farmer', name?: string): Promise<UserAccount> {
    const isValid = this.verifyOtp(phone, otp);
    if (!isValid) {
      throw new Error('Invalid OTP code. Please enter 1234 or request a new code.');
    }

    return this.login({
      identifier: phone,
      isOtpVerified: true,
      rememberMe: true
    }).catch(async () => {
      // If user did not exist, signup automatically
      return this.signup({
        name: name || 'किसान जी',
        phone,
        role: defaultRole,
        password: 'Password@123',
        preferredLanguage: 'hi'
      });
    });
  },

  // Signup
  async signup(payload: SignupPayload): Promise<UserAccount> {
    await new Promise(resolve => setTimeout(resolve, 450));

    const name = (payload.name || '').trim() || 'किसान जी';
    const phone = (payload.phone || '').trim();
    if (!phone) throw new Error('Please enter a valid mobile number.');

    const users = this.getUsers();
    const cleanPhoneDigits = normalizePhone(phone);
    const cleanEmail = (payload.email || '').trim().toLowerCase();

    // Check existing
    const existingIndex = users.findIndex(u => {
      const uDigits = normalizePhone(u.phone || '');
      const uEmail = (u.email || '').toLowerCase().trim();
      if (cleanPhoneDigits && uDigits === cleanPhoneDigits) return true;
      if (cleanEmail && uEmail === cleanEmail) return true;
      return false;
    });

    if (existingIndex !== -1) {
      // If existing user found, update info and log in directly
      const existingUser = users[existingIndex];
      existingUser.lastLoginAt = new Date().toISOString();
      if (payload.preferredLanguage) existingUser.preferredLanguage = payload.preferredLanguage;
      if (payload.role) existingUser.role = payload.role;
      if (name && name !== 'किसान जी') existingUser.name = name;
      if (payload.password) existingUser.passwordHash = payload.password;
      
      users[existingIndex] = existingUser;
      this.saveUsers(users);

      const session: AuthSession = {
        token: `kr-tok-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        user: existingUser,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        rememberMe: true
      };
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
      this.notifyAuthChange(existingUser);
      return existingUser;
    }

    const newUser: UserAccount = {
      id: `usr-${payload.role || 'farmer'}-${Date.now()}`,
      name: name,
      phone: phone,
      email: payload.email?.trim() || `${cleanPhoneDigits || 'user'}@krishirakshak.in`,
      role: payload.role || 'farmer',
      state: payload.state || 'Madhya Pradesh',
      district: payload.district || 'Indore',
      village: payload.village || 'Sanwer',
      preferredLanguage: payload.preferredLanguage || 'hi',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      voiceSettings: {
        enabled: true,
        rate: 0.95,
        pitch: 1.0,
        autoPlayVoice: true,
        guidedModeDefault: true,
        voiceGender: 'female'
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      passwordHash: payload.password || 'kisan@123'
    };

    users.push(newUser);
    this.saveUsers(users);

    // Auto login session
    const session: AuthSession = {
      token: `kr-tok-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      user: newUser,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      rememberMe: true
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    this.notifyAuthChange(newUser);
    return newUser;
  },

  // Logout
  logout() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    this.notifyAuthChange(null);
  },

  // Update Profile
  updateUserProfile(userId: string, updates: Partial<UserAccount>): UserAccount {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found.');

    const updatedUser = {
      ...users[index],
      ...updates,
      voiceSettings: {
        ...users[index].voiceSettings,
        ...(updates.voiceSettings || {})
      }
    };

    users[index] = updatedUser;
    this.saveUsers(users);

    // Update active session if currently logged in as this user
    const currentSession = this.getAuthSession();
    if (currentSession && currentSession.user.id === userId) {
      currentSession.user = updatedUser;
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(currentSession));
      this.notifyAuthChange(updatedUser);
    }

    return updatedUser;
  },

  // Password Reset simulation
  async requestPasswordReset(identifier: string): Promise<{ otpCode: string; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = this.getUsers();
    const clean = identifier.trim().toLowerCase().replace(/[\s-+]/g, '');
    const user = users.find(u => {
      const uEmail = (u.email || '').toLowerCase().trim();
      const uPhone = (u.phone || '').replace(/[\s-+]/g, '');
      return uEmail.includes(clean) || uPhone.includes(clean);
    });

    if (!user) {
      throw new Error('No account found matching this mobile number or email.');
    }

    // Demo simulated OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return {
      otpCode: otp,
      message: `A 6-digit verification code (${otp}) has been sent to ${user.phone}.`
    };
  },

  async resetPassword(identifier: string, otp: string, newPassword: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (!newPassword || newPassword.length < 4) {
      throw new Error('New password must be at least 4 characters.');
    }

    const users = this.getUsers();
    const clean = identifier.trim().toLowerCase().replace(/[\s-+]/g, '');
    const user = users.find(u => {
      const uEmail = (u.email || '').toLowerCase().trim();
      const uPhone = (u.phone || '').replace(/[\s-+]/g, '');
      return uEmail.includes(clean) || uPhone.includes(clean);
    });

    if (!user) throw new Error('User account not found.');

    user.passwordHash = newPassword;
    this.saveUsers(users);
    return true;
  },

  // Role switch (for rapid demonstration & multi-role testing)
  getRegisteredUsers(): UserAccount[] {
    return this.getUsers();
  },

  updateUser(userId: string, updates: Partial<UserAccount>): UserAccount {
    return this.updateUserProfile(userId, updates);
  },

  switchActiveUserToRole(targetRole: UserRole): UserAccount {
    const users = this.getUsers();
    const target = users.find(u => u.role === targetRole) || SEEDED_USERS.find(u => u.role === targetRole)!;
    
    const session: AuthSession = {
      token: `kr-tok-switched-${Date.now()}`,
      user: target,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      rememberMe: true
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    this.notifyAuthChange(target);
    return target;
  },

  // Auth Subscribers
  subscribe(callback: (user: UserAccount | null) => void): () => void {
    authListeners.add(callback);
    return () => authListeners.delete(callback);
  },

  notifyAuthChange(user: UserAccount | null) {
    authListeners.forEach(cb => cb(user));
    window.dispatchEvent(new CustomEvent('krishi_auth_change', { detail: { user } }));
  }
};
