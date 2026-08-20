/// <reference types="vite/client" />

/**
 * AdMob Configuration for Wall Drop
 * 
 * IMPORTANT POLICY NOTICE:
 * Production AdMob IDs are used. Real ads should only be loaded and displayed in
 * signed production releases to prevent AdMob policy violations (invalid impressions/clicks).
 *
 * Real Production IDs:
 * 1. App ID: ca-app-pub-4632188788602851~8680031794
 * 2. Interstitial ("Wall_Intercalar"): ca-app-pub-4632188788602851/4357643400
 * 3. Rewarded ("Drop_Permiados"): ca-app-pub-4632188788602851/8895654217
 */

// Helper function to validate AdMob ID format
export function isValidAdMobAppId(id: string): boolean {
  return /^ca-app-pub-\d{16}~\d{10}$/.test(id.trim());
}

export function isValidAdMobUnitId(id: string): boolean {
  return /^ca-app-pub-\d{16}\/\d{10}$/.test(id.trim());
}

// -----------------------------------------------------------------
// Wall Drop Real Production AdMob IDs (Live Ads)
// -----------------------------------------------------------------
export const PRODUCTION_AD_UNITS = {
  appId: 'ca-app-pub-4632188788602851~8680031794',
  interstitial: 'ca-app-pub-4632188788602851/4357643400',
  rewarded: 'ca-app-pub-4632188788602851/8895654217',
  banner: 'ca-app-pub-4632188788602851/1234567890',
} as const;

export const RELEASE_AD_UNITS = PRODUCTION_AD_UNITS;

// Active Ad Units resolved according to environment mode and env overrides
const getActiveUnits = () => {
  const env = (import.meta as any)?.env || {};
  
  const customAppId = env.VITE_ADMOB_APP_ID;
  const customInterstitial = env.VITE_ADMOB_INTERSTITIAL_ID;
  const customRewarded = env.VITE_ADMOB_REWARDED_ID;

  return {
    appId: customAppId && isValidAdMobAppId(customAppId) ? customAppId : PRODUCTION_AD_UNITS.appId,
    interstitial: customInterstitial && isValidAdMobUnitId(customInterstitial) ? customInterstitial : PRODUCTION_AD_UNITS.interstitial,
    rewarded: customRewarded && isValidAdMobUnitId(customRewarded) ? customRewarded : PRODUCTION_AD_UNITS.rewarded,
    banner: PRODUCTION_AD_UNITS.banner,
  };
};

const activeUnits = getActiveUnits();

export const useTestAds = false;

export const AD_CONFIG = {
  isTestMode: false,
  useTestAds: false,

  // Resolved active AdMob IDs (Validated & Checked)
  appId: activeUnits.appId,
  interstitialAdUnitId: activeUnits.interstitial,
  rewardedAdUnitId: activeUnits.rewarded,
  bannerAdUnitId: activeUnits.banner,

  // Reference environments
  adUnits: PRODUCTION_AD_UNITS,
  releaseAdUnits: PRODUCTION_AD_UNITS,

  // Frequency Capping Settings (show interstitial every 3 games)
  defaultGamesUntilInterstitial: 3,

  // Helpers
  isValidAppId: isValidAdMobAppId(activeUnits.appId),
  isValidRewardedId: isValidAdMobUnitId(activeUnits.rewarded),
  isValidInterstitialId: isValidAdMobUnitId(activeUnits.interstitial),
};

