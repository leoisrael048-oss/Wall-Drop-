package com.iley.walldrop

import com.iley.walldrop.BuildConfig

/**
 * Centralized AdMob Configuration for Wall Drop.
 * 
 * IMPORTANT POLICY NOTICE:
 * Real ads (non-test) must only be requested and displayed in signed production builds
 * released to end users, never during manual testing, to prevent AdMob policy violations
 * (invalid impressions/clicks).
 *
 * Real Production IDs:
 * 1. App ID: ca-app-pub-4632188788602851~8680031794
 * 2. Interstitial ("Wall_Intercalar"): ca-app-pub-4632188788602851/4357643400
 * 3. Rewarded ("Drop_Permiados"): ca-app-pub-4632188788602851/8895654217
 */
object AdMobConfig {

    val isDebug: Boolean
        get() = BuildConfig.DEBUG

    // Real AdMob Application ID
    const val REAL_APP_ID: String = "ca-app-pub-4632188788602851~8680031794"

    // Real Interstitial Ad Unit ID (Wall_Intercalar)
    const val REAL_INTERSTITIAL_AD_ID: String = "ca-app-pub-4632188788602851/4357643400"

    // Real Rewarded Ad Unit ID (Drop_Permiados)
    const val REAL_REWARDED_AD_ID: String = "ca-app-pub-4632188788602851/8895654217"

    // App ID (injected from build or fallback to Real Production ID)
    val APP_ID: String
        get() = BuildConfig.ADMOB_APP_ID.ifEmpty { REAL_APP_ID }

    // Interstitial Ad Unit ID (Wall_Intercalar)
    val INTERSTITIAL_AD_ID: String
        get() = BuildConfig.INTERSTITIAL_AD_ID.ifEmpty { REAL_INTERSTITIAL_AD_ID }

    // Rewarded Ad Unit ID (Drop_Permiados)
    val REWARDED_AD_ID: String
        get() = BuildConfig.REWARDED_AD_ID.ifEmpty { REAL_REWARDED_AD_ID }
}
