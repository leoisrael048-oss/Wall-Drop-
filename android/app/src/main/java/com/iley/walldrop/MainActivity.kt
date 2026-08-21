package com.iley.walldrop

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private val TAG = "MainActivity"
    private var webView: WebView? = null
    private var adMobManager: AdMobManager? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Global crash guard to prevent silent Android process death
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            Log.e("WallDropCrashGuard", "Uncaught exception in thread ${thread.name}:", throwable)
        }

        try {
            // Initialize AdMob safely
            val manager = AdMobManager(this)
            adMobManager = manager
            manager.initialize()
        } catch (e: Throwable) {
            Log.e(TAG, "AdMob initialization skipped safely: ${e.message}")
        }

        try {
            // Enable Immersive Fullscreen Mode
            hideSystemUI()
        } catch (e: Throwable) {
            Log.e(TAG, "hideSystemUI error: ${e.message}")
        }

        try {
            val wv = WebView(this)
            webView = wv
            setContentView(wv)

            configureWebView(wv)

            // Add JavaScript Interface Bridge
            val jsBridge = WebAppInterface(this, wv, adMobManager ?: AdMobManager(this))
            wv.addJavascriptInterface(jsBridge, "Android")
            wv.addJavascriptInterface(jsBridge, "AndroidBridge")

            // Load 100% offline standalone game from embedded APK assets
            val targetUrl = "file:///android_asset/www/index.html"
            Log.i(TAG, "Loading local game asset: $targetUrl")
            wv.loadUrl(targetUrl)
        } catch (e: Throwable) {
            Log.e(TAG, "WebView initialization error: ${e.message}")
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView(wv: WebView) {
        try {
            val settings = wv.settings
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.allowFileAccess = true
            settings.allowContentAccess = true
            settings.allowFileAccessFromFileURLs = true
            settings.allowUniversalAccessFromFileURLs = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.useWideViewPort = true
            settings.loadWithOverviewMode = true
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            
            // Cache settings for 100% offline play
            settings.cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK

            // Dark background matching the game theme
            wv.setBackgroundColor(Color.parseColor("#030712"))

            wv.webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(message: android.webkit.ConsoleMessage?): Boolean {
                    Log.d("WallDropJS", "${message?.message()} -- From line ${message?.lineNumber()} of ${message?.sourceId()}")
                    return true
                }
            }

            wv.webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    return false
                }

                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                    val failingUrl = request?.url?.toString() ?: ""
                    val errorDesc = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) error?.description?.toString() else "Unknown"
                    Log.e(TAG, "WebView Error on $failingUrl: $errorDesc")

                    if (request?.isForMainFrame == true) {
                        val fallbackHtml = """
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <style>
                                    body { background: #030712; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; }
                                    h1 { font-size: 24px; color: #38bdf8; margin-bottom: 8px; }
                                    p { font-size: 14px; color: #94a3b8; line-height: 1.5; }
                                    button { margin-top: 20px; padding: 12px 24px; background: #0284c7; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; }
                                </style>
                            </head>
                            <body>
                                <h1>WALL DROP</h1>
                                <p>Carregando recursos locais do jogo...</p>
                                <button onclick="window.location.reload()">Recarregar</button>
                            </body>
                            </html>
                        """.trimIndent()
                        view?.loadDataWithBaseURL("file:///android_asset/www/", fallbackHtml, "text/html", "UTF-8", null)
                    }
                }
            }

            // Hardware acceleration
            wv.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        } catch (e: Throwable) {
            Log.e(TAG, "configureWebView error: ${e.message}")
        }
    }

    private fun hideSystemUI() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                window.insetsController?.let { controller ->
                    controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
                    controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                }
            } else {
                @Suppress("DEPRECATION")
                window.decorView.systemUiVisibility = (
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_FULLSCREEN
                )
            }
        } catch (e: Throwable) {
            Log.e(TAG, "hideSystemUI exception: ${e.message}")
        }
    }

    override fun onResume() {
        super.onResume()
        try {
            webView?.onResume()
            hideSystemUI()
        } catch (e: Throwable) {
            Log.e(TAG, "onResume error: ${e.message}")
        }
    }

    override fun onPause() {
        try {
            webView?.onPause()
        } catch (e: Throwable) {
            Log.e(TAG, "onPause error: ${e.message}")
        }
        super.onPause()
    }

    override fun onDestroy() {
        try {
            webView?.let { wv ->
                (wv.parent as? ViewGroup)?.removeView(wv)
                wv.destroy()
            }
            webView = null
        } catch (e: Throwable) {
            Log.e(TAG, "onDestroy error: ${e.message}")
        }
        super.onDestroy()
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        try {
            if (webView?.canGoBack() == true) {
                webView?.goBack()
            } else {
                super.onBackPressed()
            }
        } catch (e: Throwable) {
            super.onBackPressed()
        }
    }
}
