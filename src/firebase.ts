import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
// Use experimentalForceLongPolling to ensure reliable connectivity inside sandboxed iframe previews
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true
  },
  firebaseConfig.firestoreDatabaseId
);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection readiness tracker
let isConnected = true;

export async function testConnection(): Promise<boolean> {
  return isConnected;
}

export function isFirebaseConnected(): boolean {
  return isConnected;
}
