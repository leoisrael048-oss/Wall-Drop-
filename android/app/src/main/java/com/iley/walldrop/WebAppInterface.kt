package com.iley.walldrop

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.util.Log

class WebAppInterface(
    private val context: Context,
    private val webView: WebView,
    private val adMobManager: AdMobManager
) {

    private val TAG = "WallDropBridge"

    @JavascriptInterface
    fun showInterstitial() {
        Log.d(TAG, "JS Bridge requested showInterstitial()")
        adMobManager.showInterstitial()
    }

    @JavascriptInterface
    fun showInterstitial(callbackJsMethod: String) {
        Log.d(TAG, "JS Bridge requested showInterstitial() with callback: $callbackJsMethod")
        adMobManager.showInterstitial {
            webView.post {
                if (callbackJsMethod.isNotBlank()) {
                    val jsCall = "javascript:$callbackJsMethod(true)"
                    webView.evaluateJavascript(jsCall, null)
                }
            }
        }
    }

    @JavascriptInterface
    fun showRewardedAd() {
        showRewardedAd("__admob_reward_cb")
    }

    @JavascriptInterface
    fun showRewardedAd(callbackJsMethod: String) {
        Log.d(TAG, "JS Bridge requested showRewardedAd(), callback: $callbackJsMethod")
        adMobManager.showRewardedAd { success ->
            webView.post {
                if (callbackJsMethod.isNotBlank()) {
                    val jsCall = "javascript:$callbackJsMethod($success)"
                    webView.evaluateJavascript(jsCall, null)
                }
            }
        }
    }

    @JavascriptInterface
    fun share(text: String) {
        shareWithTitle(text, "Wall Drop")
    }

    @JavascriptInterface
    fun share(text: String, title: String) {
        shareWithTitle(text, title)
    }

    @JavascriptInterface
    fun shareImage(base64Data: String, caption: String) {
        shareMedia(base64Data, "image/png", caption, "Wall Drop Replay")
    }

    @JavascriptInterface
    fun shareMedia(base64Data: String, mimeType: String, text: String, title: String) {
        Log.d(TAG, "JS Bridge requested shareMedia (mime: $mimeType)")
        try {
            val cleanBase64 = if (base64Data.contains(",")) {
                base64Data.substringAfter(",")
            } else {
                base64Data
            }
            val decodedBytes = android.util.Base64.decode(cleanBase64, android.util.Base64.DEFAULT)

            val extension = when {
                mimeType.contains("gif") -> "gif"
                mimeType.contains("jpeg") || mimeType.contains("jpg") -> "jpg"
                mimeType.contains("mp4") -> "mp4"
                else -> "png"
            }

            val cachePath = java.io.File(context.cacheDir, "shared_replays")
            cachePath.mkdirs()
            val file = java.io.File(cachePath, "walldrop_replay_${System.currentTimeMillis()}.$extension")
            java.io.FileOutputStream(file).use { it.write(decodedBytes) }

            val uri = androidx.core.content.FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )

            val sendIntent = Intent(Intent.ACTION_SEND).apply {
                type = mimeType
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_TEXT, text)
                putExtra(Intent.EXTRA_TITLE, title)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            val shareIntent = Intent.createChooser(sendIntent, title).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(shareIntent)
        } catch (e: Exception) {
            Log.e(TAG, "shareMedia failed, falling back to text share: ${e.localizedMessage}")
            shareWithTitle(text, title)
        }
    }

    @JavascriptInterface
    fun shareWithTitle(text: String, title: String) {
        Log.d(TAG, "JS Bridge requested native share: $text")
        try {
            val sendIntent: Intent = Intent().apply {
                action = Intent.ACTION_SEND
                putExtra(Intent.EXTRA_TEXT, text)
                putExtra(Intent.EXTRA_TITLE, title)
                type = "text/plain"
            }
            val shareIntent = Intent.createChooser(sendIntent, title).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(shareIntent)
        } catch (e: Exception) {
            Log.e(TAG, "Native share failed: ${e.localizedMessage}")
        }
    }

    @JavascriptInterface
    fun vibrate(milliseconds: Long) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                val vibrator = vibratorManager.defaultVibrator
                vibrator.vibrate(VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(milliseconds)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Vibration failed: ${e.localizedMessage}")
        }
    }

    @JavascriptInterface
    fun isInterstitialReady(): Boolean = adMobManager.isInterstitialReady()

    @JavascriptInterface
    fun isRewardedReady(): Boolean = adMobManager.isRewardedReady()

    @JavascriptInterface
    fun getAppVersion(): String = "1.0.0"

    @JavascriptInterface
    fun logEvent(name: String, params: String) {
        Log.d(TAG, "Event logged: $name -> $params")
    }
}
