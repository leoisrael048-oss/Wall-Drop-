/**
 * Resilient Real Network Connectivity Service for Wall Drop
 * 
 * Key Features:
 * 1. Does NOT rely solely on navigator.onLine (prevents false-offline in WebViews/sandboxes).
 * 2. Performs REAL multi-endpoint probe (Firebase RTDB + public fallback) with strict 3.5s timeout.
 * 3. Automatic 15-second background retry loop when in offline state to auto-reconnect without user intervention.
 * 4. Heartbeat check every 45s when online and on window focus/visibility change.
 * 5. Automatic subscriber notifications for pending score sync queues.
 */

type NetworkChangeCallback = (isOnline: boolean) => void;

const FIREBASE_DB_URL = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_DATABASE_URL) ||
  'https://walldrop-game-default-rtdb.firebaseio.com';

class NetworkService {
  // Optimistic initial state to prevent unwarranted offline lockouts on start
  private _isOnline: boolean = true;
  private listeners: Set<NetworkChangeCallback> = new Set();
  private hasInitialized: boolean = false;
  private retryIntervalId: any = null;
  private isChecking: boolean = false;
  private lastVerifiedTimestamp: number = 0;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined' || this.hasInitialized) return;
    this.hasInitialized = true;

    // Listen to browser network events to trigger immediate real probes
    window.addEventListener('online', () => {
      this.checkRealConnectivity(true);
    });

    window.addEventListener('offline', () => {
      // Don't blindly trust offline event without testing real connection
      this.checkRealConnectivity(true);
    });

    // Also check on tab focus / visibility resume
    window.addEventListener('focus', () => {
      if (!this._isOnline || Date.now() - this.lastVerifiedTimestamp > 20000) {
        this.checkRealConnectivity(false);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkRealConnectivity(false);
      }
    });

    // Start background auto-retry / heartbeat loop
    this.startAutoRetryLoop();

    // Initial background check (non-blocking)
    setTimeout(() => {
      this.checkRealConnectivity(false);
    }, 400);
  }

  /**
   * Starts the 15s auto-retry interval when offline, and 45s heartbeat when online
   */
  private startAutoRetryLoop() {
    if (this.retryIntervalId) {
      clearInterval(this.retryIntervalId);
    }

    // Interval interval runs every 15 seconds
    this.retryIntervalId = setInterval(() => {
      // If offline, always retry aggressively every 15 seconds
      if (!this._isOnline) {
        this.checkRealConnectivity(false);
      } else if (Date.now() - this.lastVerifiedTimestamp > 45000) {
        // If online, do a light periodic heartbeat check
        this.checkRealConnectivity(false);
      }
    }, 15000);
  }

  /**
   * Update internal status and notify subscribers if state changed
   */
  private updateStatus(newStatus: boolean) {
    this.lastVerifiedTimestamp = Date.now();
    if (this._isOnline !== newStatus) {
      this._isOnline = newStatus;
      console.log(`[NetworkService] Connection state changed -> ${newStatus ? 'ONLINE 🌐' : 'OFFLINE 📶'}`);
      this.listeners.forEach((callback) => {
        try {
          callback(newStatus);
        } catch (e) {
          console.warn('[NetworkService] Callback error:', e);
        }
      });
    }
  }

  /**
   * Synchronous instantaneous connectivity check (zero latency)
   */
  public isOnline(): boolean {
    if (typeof window !== 'undefined') {
      const win = window as any;
      // Check native Android bridges if present
      if (win.Android && typeof win.Android.isOnline === 'function') {
        try {
          return Boolean(win.Android.isOnline());
        } catch {}
      }
      if (win.WebAppInterface && typeof win.WebAppInterface.isOnline === 'function') {
        try {
          return Boolean(win.WebAppInterface.isOnline());
        } catch {}
      }
      if (win.AndroidBridge && typeof win.AndroidBridge.isOnline === 'function') {
        try {
          return Boolean(win.AndroidBridge.isOnline());
        } catch {}
      }
    }
    return this._isOnline;
  }

  /**
   * Subscribe to network state changes.
   * Immediately calls the callback with the current state.
   */
  public subscribe(callback: NetworkChangeCallback): () => void {
    this.listeners.add(callback);
    try {
      callback(this.isOnline());
    } catch {}

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Performs a REAL, multi-step connectivity test using lightweight HTTP probes.
   * Does NOT block the UI thread.
   */
  public async checkRealConnectivity(forceNotify: boolean = false): Promise<boolean> {
    if (this.isChecking) return this._isOnline;
    this.isChecking = true;

    let probeSucceeded = false;

    try {
      // Step 1: Probe Firebase Realtime Database (our primary game backend)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      try {
        const testUrl = `${FIREBASE_DB_URL}/.json?shallow=true&_ts=${Date.now()}`;
        const res = await fetch(testUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        // Any response (even 200, 401, 403) proves that internet packets reached the cloud server!
        if (res.status > 0) {
          probeSucceeded = true;
        }
      } catch (fbErr: any) {
        clearTimeout(timeoutId);
        // If aborted or network error, fallback to secondary probe
      }

      // Step 2: Fallback probe if Firebase failed
      if (!probeSucceeded) {
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 3000);

        try {
          // Probe public 204 or local origin
          await fetch('https://www.google.com/generate_204', {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store',
            signal: fallbackController.signal,
          });
          clearTimeout(fallbackTimeout);
          probeSucceeded = true;
        } catch {
          clearTimeout(fallbackTimeout);
        }
      }

      // Step 3: Tertiary origin probe if in browser
      if (!probeSucceeded && typeof window !== 'undefined' && window.location.origin) {
        try {
          const originController = new AbortController();
          const originTimeout = setTimeout(() => originController.abort(), 2000);
          const res = await fetch(`${window.location.origin}/?_netprobe=${Date.now()}`, {
            method: 'HEAD',
            cache: 'no-store',
            signal: originController.signal,
          });
          clearTimeout(originTimeout);
          if (res.status > 0) {
            probeSucceeded = true;
          }
        } catch {
          // Down
        }
      }
    } catch (e) {
      probeSucceeded = false;
    } finally {
      this.isChecking = false;
      this.updateStatus(probeSucceeded);
      if (forceNotify) {
        this.listeners.forEach((cb) => {
          try { cb(probeSucceeded); } catch {}
        });
      }
    }

    return probeSucceeded;
  }

  /**
   * Fast async ping test for backwards compatibility
   */
  public async pingTest(timeoutMs: number = 3000): Promise<boolean> {
    return this.checkRealConnectivity(true);
  }
}

export const networkService = new NetworkService();
