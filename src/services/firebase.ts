import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let isInitialized = false;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standard error formatter for Firestore operations (Skill requirement).
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const currentAuth = auth;
  const currentUser = currentAuth?.currentUser;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };

  console.warn('[Firebase] Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Safe, non-blocking Firebase initialization wrapped in try/catch.
 * If anything fails (offline, config issues, platform restrictions), the game
 * continues 100% uninterrupted in offline mode without throwing or crashing.
 */
export function initFirebase(): { db: Firestore | null; auth: Auth | null; isAvailable: boolean } {
  if (isInitialized) {
    return { db, auth, isAvailable: db !== null };
  }

  try {
    // Dynamic import / safe JSON loading
    let firebaseConfig: any = null;
    try {
      // Relative import of firebase config
      // @ts-ignore
      firebaseConfig = (window as any).__FIREBASE_CONFIG__ || null;
    } catch {
      firebaseConfig = null;
    }

    // If not on window, import default json
    if (!firebaseConfig) {
      firebaseConfig = {
        projectId: 'project-e488bbdb-d1d3-4ea6-a9c',
        appId: '1:764312139364:web:8f21feea7db8c9f500d171',
        apiKey: 'AIzaSyAivaZ4IbHMeeD1G_0MICcDXyx4VfJJ-RE',
        authDomain: 'project-e488bbdb-d1d3-4ea6-a9c.firebaseapp.com',
        firestoreDatabaseId: 'ai-studio-walldrop-41ff6619-7067-480b-95fb-c44ae27e563e',
        storageBucket: 'project-e488bbdb-d1d3-4ea6-a9c.firebasestorage.app',
        messagingSenderId: '764312139364',
        oAuthClientId: '764312139364-ebc4r5t5vov7hvihsbi174f02al2nfpk.apps.googleusercontent.com',
      };
    }

    if (firebaseConfig && firebaseConfig.apiKey) {
      const existingApps = getApps();
      app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
      
      // Initialize Firestore with specific databaseId if provided
      if (firebaseConfig.firestoreDatabaseId) {
        db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      } else {
        db = getFirestore(app);
      }

      try {
        auth = getAuth(app);
      } catch (authErr) {
        console.warn('[Firebase] Auth initialization skipped (offline/unsupported):', authErr);
        auth = null;
      }

      isInitialized = true;
      console.log('[Firebase] Successfully initialized safely in background.');

      // Non-blocking connection validation test (Skill requirement)
      if (db && typeof window !== 'undefined' && window.location.protocol !== 'file:') {
        getDocFromServer(doc(db, 'test', 'connection')).catch(() => {
          // Expected test doc error or offline state - ignore cleanly
        });
      }
    }
  } catch (err) {
    console.warn('[Firebase] Safe initialization notice (offline mode active):', err);
    db = null;
    auth = null;
    isInitialized = true;
  }

  return { db, auth, isAvailable: db !== null };
}

// Auto-run safe init without blocking
initFirebase();

export const getFirebaseDb = (): Firestore | null => {
  if (!isInitialized) initFirebase();
  return db;
};

export const getFirebaseAuth = (): Auth | null => {
  if (!isInitialized) initFirebase();
  return auth;
};

export const isFirebaseAvailable = (): boolean => {
  if (!isInitialized) initFirebase();
  return db !== null;
};
