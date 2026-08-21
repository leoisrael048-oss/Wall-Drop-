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
 * Safe against thread exceptions and initialization crashes.
 */
class AdMobManager(private val activity: Activity) {

    private val TAG = "WallDropAdMob"

    private var interstitialAd: InterstitialAd? = null
    private var rewardedAd: RewardedAd? = null

    private var isInterstitialLoading = false
    private var isRewardedLoading = false
    private var isShowingAd = false

    fun initialize() {
        activity.runOnUiThread {
            try {
                MobileAds.initialize(activity) { initializationStatus ->
                    Log.d(TAG, "AdMob MobileAds initialized: ${initializationStatus.adapterStatusMap}")
                    activity.runOnUiThread {
                        loadInterstitialAd()
                        loadRewardedAd()
                    }
                }
            } catch (e: Throwable) {
                Log.e(TAG, "Error initializing AdMob (safely skipped): ${e.localizedMessage}")
            }
        }
    }

    // --- INTERSTITIAL AD ---
    fun loadInterstitialAd() {
        activity.runOnUiThread {
            try {
                if (interstitialAd != null || isInterstitialLoading) return@runOnUiThread
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
                                    loadInterstitialAd()
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
            } catch (e: Throwable) {
                Log.e(TAG, "InterstitialAd.load exception (caught safely): ${e.localizedMessage}")
                interstitialAd = null
                isInterstitialLoading = false
            }
        }
    }

    fun showInterstitial(onAdClosed: (() -> Unit)? = null) {
        activity.runOnUiThread {
            try {
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
                            loadInterstitialAd()
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
                    loadInterstitialAd()
                }
            } catch (e: Throwable) {
                Log.e(TAG, "showInterstitial exception (caught safely): ${e.localizedMessage}")
                onAdClosed?.invoke()
            }
        }
    }

    // --- REWARDED AD ---
    fun loadRewardedAd() {
        activity.runOnUiThread {
            try {
                if (rewardedAd != null || isRewardedLoading) return@runOnUiThread
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
            } catch (e: Throwable) {
                Log.e(TAG, "RewardedAd.load exception (caught safely): ${e.localizedMessage}")
                rewardedAd = null
                isRewardedLoading = false
            }
        }
    }

    fun showRewardedAd(onUserEarnedReward: (Boolean) -> Unit) {
        activity.runOnUiThread {
            try {
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
                            loadRewardedAd()
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
                    loadRewardedAd()
                }
            } catch (e: Throwable) {
                Log.e(TAG, "showRewardedAd exception (caught safely): ${e.localizedMessage}")
                onUserEarnedReward(false)
            }
        }
    }

    fun isInterstitialReady(): Boolean = interstitialAd != null
    fun isRewardedReady(): Boolean = rewardedAd != null
}
