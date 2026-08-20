package com.iley.walldrop

import android.app.Activity
import android.util.Log
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback

/**
 * AdMobManager - Manages Google Mobile Ads (Interstitial and Rewarded Ads).
 *
 * POLICY NOTICE:
 * Production AdMob Ad Unit IDs are used. Real ads must only be loaded and viewed
 * in released, signed production builds by genuine users to comply with AdMob policy
 * against invalid traffic and self-clicking.
 */
class AdMobManager(private val activity: Activity) {

    private val TAG = "WallDropAdMob"

    private var interstitialAd: InterstitialAd? = null
    private var rewardedAd: RewardedAd? = null

    private var isInterstitialLoading = false
    private var isRewardedLoading = false
    private var isShowingAd = false

    fun initialize() {
        try {
            MobileAds.initialize(activity) { initializationStatus ->
                Log.d(TAG, "AdMob MobileAds initialized successfully: ${initializationStatus.adapterStatusMap}")
                loadInterstitialAd()
                loadRewardedAd()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing AdMob: ${e.localizedMessage}")
        }
    }

    // --- INTERSTITIAL AD ---
    fun loadInterstitialAd() {
        if (interstitialAd != null || isInterstitialLoading) return
        isInterstitialLoading = true

        val adRequest = AdRequest.Builder().build()
        val adUnitId = AdMobConfig.INTERSTITIAL_AD_ID

        Log.d(TAG, "Loading Interstitial Ad with ID: $adUnitId")
        InterstitialAd.load(
            activity,
            adUnitId,
            adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialAd = ad
                    isInterstitialLoading = false
                    Log.d(TAG, "Interstitial Ad loaded successfully")

                    ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                        override fun onAdDismissedFullScreenContent() {
                            Log.d(TAG, "Interstitial Ad dismissed")
                            interstitialAd = null
                            isShowingAd = false
                            loadInterstitialAd() // Reload for next time
                        }

                        override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                            Log.e(TAG, "Interstitial Ad failed to show: ${adError.message}")
                            interstitialAd = null
                            isShowingAd = false
                            loadInterstitialAd()
                        }

                        override fun onAdShowedFullScreenContent() {
                            isShowingAd = true
                            Log.d(TAG, "Interstitial Ad displayed on screen")
                        }
                    }
                }

                override fun onAdFailedToLoad(adError: LoadAdError) {
                    Log.w(TAG, "Interstitial Ad failed to load: ${adError.message}")
                    interstitialAd = null
                    isInterstitialLoading = false
                }
            }
        )
    }

    fun showInterstitial(onAdClosed: (() -> Unit)? = null) {
        activity.runOnUiThread {
            if (isShowingAd) {
                Log.w(TAG, "Ad is already currently showing")
                onAdClosed?.invoke()
                return@runOnUiThread
            }

            val ad = interstitialAd
            if (ad != null) {
                ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                    override fun onAdDismissedFullScreenContent() {
                        Log.d(TAG, "Interstitial Ad dismissed")
                        interstitialAd = null
                        isShowingAd = false
                        loadInterstitialAd() // Reload for next time
                        onAdClosed?.invoke()
                    }

                    override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                        Log.e(TAG, "Interstitial Ad failed to show: ${adError.message}")
                        interstitialAd = null
                        isShowingAd = false
                        loadInterstitialAd()
                        onAdClosed?.invoke()
                    }

                    override fun onAdShowedFullScreenContent() {
                        isShowingAd = true
                        Log.d(TAG, "Interstitial Ad displayed on screen")
                    }
                }
                ad.show(activity)
            } else {
                Log.w(TAG, "Interstitial Ad not ready, proceeding without blocking player")
                onAdClosed?.invoke()
                loadInterstitialAd() // Try preloading again
            }
        }
    }

    // --- REWARDED AD ---
    fun loadRewardedAd() {
        if (rewardedAd != null || isRewardedLoading) return
        isRewardedLoading = true

        val adRequest = AdRequest.Builder().build()
        val adUnitId = AdMobConfig.REWARDED_AD_ID

        Log.d(TAG, "Loading Rewarded Ad with ID: $adUnitId")
        RewardedAd.load(
            activity,
            adUnitId,
            adRequest,
            object : RewardedAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedAd) {
                    rewardedAd = ad
                    isRewardedLoading = false
                    Log.d(TAG, "Rewarded Ad loaded successfully")
                }

                override fun onAdFailedToLoad(adError: LoadAdError) {
                    Log.w(TAG, "Rewarded Ad failed to load: ${adError.message}")
                    rewardedAd = null
                    isRewardedLoading = false
                }
            }
        )
    }

    fun showRewardedAd(onUserEarnedReward: (Boolean) -> Unit) {
        activity.runOnUiThread {
            if (isShowingAd) {
                Log.w(TAG, "Ad is already currently showing")
                onUserEarnedReward(false)
                return@runOnUiThread
            }

            val ad = rewardedAd
            if (ad != null) {
                var rewardEarned = false
                ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                    override fun onAdDismissedFullScreenContent() {
                        Log.d(TAG, "Rewarded Ad dismissed, earned: $rewardEarned")
                        rewardedAd = null
                        isShowingAd = false
                        loadRewardedAd() // Reload for next time
                        onUserEarnedReward(rewardEarned)
                    }

                    override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                        Log.e(TAG, "Rewarded Ad failed to show: ${adError.message}")
                        rewardedAd = null
                        isShowingAd = false
                        loadRewardedAd()
                        onUserEarnedReward(false)
                    }

                    override fun onAdShowedFullScreenContent() {
                        isShowingAd = true
                        Log.d(TAG, "Rewarded Ad displayed on screen")
                    }
                }
                ad.show(activity) { rewardItem ->
                    Log.d(TAG, "User earned reward: ${rewardItem.amount} ${rewardItem.type}")
                    rewardEarned = true
                }
            } else {
                Log.w(TAG, "Rewarded Ad not ready")
                onUserEarnedReward(false)
                loadRewardedAd() // Try preloading again
            }
        }
    }

    fun isInterstitialReady(): Boolean = interstitialAd != null
    fun isRewardedReady(): Boolean = rewardedAd != null
}
