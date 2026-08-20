// Centralized AdMob Configuration for Wall Drop (Flutter)
//
// IMPORTANT POLICY NOTICE:
// Production AdMob IDs are used. Real ads should only be loaded and displayed in
// signed production releases to prevent AdMob policy violations (invalid impressions/clicks).
//
// Real Production IDs:
// 1. App ID: ca-app-pub-4632188788602851~8680031794
// 2. Interstitial ("Wall_Intercalar"): ca-app-pub-4632188788602851/4357643400
// 3. Rewarded ("Drop_Permiados"): ca-app-pub-4632188788602851/8895654217

class AdConfig {
  static const bool useTestAds = false;

  // Real App ID
  static const String appId = 'ca-app-pub-4632188788602851~8680031794';

  // Real Rewarded Ad Unit ID (Drop_Permiados)
  static const String rewardedAdUnitId = 'ca-app-pub-4632188788602851/8895654217';

  // Real Interstitial Ad Unit ID (Wall_Intercalar)
  static const String interstitialAdUnitId = 'ca-app-pub-4632188788602851/4357643400';

  // Frequency capping settings (show interstitial every 3 games)
  static const int gamesUntilInterstitial = 3;
}

