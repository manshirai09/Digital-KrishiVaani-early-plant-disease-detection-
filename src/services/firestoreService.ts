import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth, googleProvider, isFirebaseConnected } from '../firebase';
import { handleFirestoreError, OperationType } from './firebaseError';
import { UserAccount, CaseRecord, Farm } from '../types';

export interface FirestoreScanRecord {
  id: string;
  userId: string;
  cropName: string;
  diseaseName: string;
  pathogenType?: string;
  confidence?: number;
  severityPercent?: number;
  severityLevel: 'low' | 'moderate' | 'high' | 'critical';
  sampleImageUrl?: string;
  status?: 'active' | 'in_review' | 'resolved' | 'escalated';
  symptoms?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FirestoreFarmRecord {
  id: string;
  userId: string;
  name: string;
  village?: string;
  district?: string;
  state?: string;
  totalAreaAcres: number;
  soilType?: string;
  overallRisk?: 'low' | 'moderate' | 'high' | 'critical';
  createdAt: string;
  updatedAt?: string;
}

export interface FirestoreUserRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'farmer' | 'officer' | 'extension' | 'expert' | 'admin';
  state?: string;
  district?: string;
  village?: string;
  preferredLanguage?: string;
  createdAt: string;
  updatedAt?: string;
}

export const FirestoreService = {
  isAvailable(): boolean {
    return Boolean(db && auth);
  },

  isConnected(): boolean {
    return isFirebaseConnected();
  },

  // --------------------------------------------------------------------------
  // Authentication via Firebase Auth
  // --------------------------------------------------------------------------
  async signInWithGoogle(): Promise<UserAccount> {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;

      const userAccount: UserAccount = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Kisan User',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        role: 'farmer',
        state: 'Madhya Pradesh',
        district: 'Indore',
        village: 'Sanwer',
        preferredLanguage: 'hi',
        avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=250&q=80',
        voiceSettings: {
          enabled: true,
          rate: 0.95,
          pitch: 1.0,
          autoPlayVoice: true,
          guidedModeDefault: false,
          voiceGender: 'female'
        },
        createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      // Sync user profile to Firestore `/users/{uid}`
      await this.saveUser(userAccount);

      return userAccount;
    } catch (err) {
      console.error('Firebase Google Sign-In failed:', err);
      throw err;
    }
  },

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase sign out failed:', err);
    }
  },

  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // --------------------------------------------------------------------------
  // User Profile Collection (`/users/{userId}`)
  // --------------------------------------------------------------------------
  async saveUser(user: UserAccount): Promise<void> {
    const path = `users/${user.id}`;
    const payload: FirestoreUserRecord = {
      id: user.id,
      name: user.name.slice(0, 100),
      role: (['farmer', 'officer', 'extension', 'expert', 'admin'].includes(user.role)
        ? user.role
        : 'farmer') as any,
      state: user.state ? user.state.slice(0, 60) : 'Madhya Pradesh',
      district: user.district ? user.district.slice(0, 60) : 'Indore',
      village: user.village ? user.village.slice(0, 100) : 'Sanwer',
      preferredLanguage: user.preferredLanguage ? user.preferredLanguage.slice(0, 10) : 'hi',
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (user.email) payload.email = user.email.slice(0, 120);
    if (user.phone) payload.phone = user.phone.slice(0, 20);

    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getUser(userId: string): Promise<FirestoreUserRecord | null> {
    const path = `users/${userId}`;
    try {
      const userSnap = await getDoc(doc(db, 'users', userId));
      return userSnap.exists() ? (userSnap.data() as FirestoreUserRecord) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // --------------------------------------------------------------------------
  // Scans Collection (`/scans/{scanId}`)
  // --------------------------------------------------------------------------
  async saveScan(scan: CaseRecord, currentUserId: string): Promise<void> {
    const cleanScanId = scan.id.replace(/[^a-zA-Z0-9_-]/g, '_') || `scan_${Date.now()}`;
    const path = `scans/${cleanScanId}`;

    const effectiveUserId = auth.currentUser?.uid || currentUserId || 'usr-farmer-01';

    const severityLevel = (
      scan.riskScore?.riskLevel ||
      scan.urgency ||
      'moderate'
    ).toLowerCase() as 'low' | 'moderate' | 'high' | 'critical';

    const payload: FirestoreScanRecord = {
      id: cleanScanId,
      userId: effectiveUserId,
      cropName: (scan.cropName || 'Cotton').slice(0, 60),
      diseaseName: (scan.diseaseName || scan.diagnosis?.diseaseName || 'Crop Leaf Foliar Assessment').slice(0, 100),
      confidence: typeof scan.confidence === 'number' ? Math.min(100, Math.max(0, scan.confidence)) : 88,
      severityPercent: scan.diagnosis?.severityPercent || 25,
      severityLevel: ['low', 'moderate', 'high', 'critical'].includes(severityLevel) ? severityLevel : 'moderate',
      sampleImageUrl: (scan.imageUrl || scan.diagnosis?.sampleImageUrl || '').slice(0, 500),
      status: 'active',
      symptoms: (scan.diagnosis?.symptomPattern || scan.escalationReason || 'Foliar discoloration detected').slice(0, 500),
      notes: (scan.expertNotes || '').slice(0, 500),
      createdAt: scan.timestamp || scan.dateCreated || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (scan.diagnosis?.pathogenType) {
      payload.pathogenType = scan.diagnosis.pathogenType.slice(0, 50);
    }

    try {
      await setDoc(doc(db, 'scans', cleanScanId), payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteScan(scanId: string): Promise<void> {
    const path = `scans/${scanId}`;
    try {
      await deleteDoc(doc(db, 'scans', scanId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeToScans(
    userId: string,
    onData: (scans: FirestoreScanRecord[]) => void,
    onError?: (error: unknown) => void
  ) {
    const path = 'scans';
    const q = query(collection(db, 'scans'), where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const records: FirestoreScanRecord[] = [];
        snapshot.forEach((d) => records.push(d.data() as FirestoreScanRecord));
        onData(records);
      },
      (error) => {
        if (onError) {
          onError(error);
        }
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // --------------------------------------------------------------------------
  // Farms Collection (`/farms/{farmId}`)
  // --------------------------------------------------------------------------
  async saveFarm(farm: Farm, currentUserId: string): Promise<void> {
    const cleanFarmId = farm.id.replace(/[^a-zA-Z0-9_-]/g, '_') || `farm_${Date.now()}`;
    const path = `farms/${cleanFarmId}`;

    const effectiveUserId = auth.currentUser?.uid || currentUserId || 'usr-farmer-01';
    const risk = (farm.overallRisk || 'low').toLowerCase() as 'low' | 'moderate' | 'high' | 'critical';

    const payload: FirestoreFarmRecord = {
      id: cleanFarmId,
      userId: effectiveUserId,
      name: (farm.name || 'Primary Farm Plot').slice(0, 100),
      village: (farm.village || 'Sanwer').slice(0, 100),
      district: (farm.district || 'Indore').slice(0, 60),
      state: 'Madhya Pradesh',
      totalAreaAcres: farm.totalAreaAcres || 3.5,
      soilType: (farm.soilType || 'Black Clay Loam').slice(0, 60),
      overallRisk: ['low', 'moderate', 'high', 'critical'].includes(risk) ? risk : 'low',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'farms', cleanFarmId), payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeToFarms(
    userId: string,
    onData: (farms: FirestoreFarmRecord[]) => void,
    onError?: (error: unknown) => void
  ) {
    const path = 'farms';
    const q = query(collection(db, 'farms'), where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const records: FirestoreFarmRecord[] = [];
        snapshot.forEach((d) => records.push(d.data() as FirestoreFarmRecord));
        onData(records);
      },
      (error) => {
        if (onError) {
          onError(error);
        }
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }
};
