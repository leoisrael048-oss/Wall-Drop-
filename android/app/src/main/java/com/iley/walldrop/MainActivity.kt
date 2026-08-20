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
import android.widget.FrameLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private val TAG = "MainActivity"
    private lateinit var webView: WebView
    private lateinit var adMobManager: AdMobManager

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize AdMob
        adMobManager = AdMobManager(this)
        adMobManager.initialize()

        // Enable Immersive Fullscreen Mode
        hideSystemUI()

        webView = WebView(this)
        setContentView(webView)

        configureWebView()

        // Add JavaScript Interface Bridge under both "Android" and "AndroidBridge" for universal compatibility
        val jsBridge = WebAppInterface(this, webView, adMobManager)
        webView.addJavascriptInterface(jsBridge, "Android")
        webView.addJavascriptInterface(jsBridge, "AndroidBridge")

        // Load 100% offline standalone game from embedded APK assets
        val targetUrl = "file:///android_asset/www/index.html"
        Log.i(TAG, "Loading local game asset: $targetUrl")
        webView.loadUrl(targetUrl)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        val settings = webView.settings
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
        
        // Cache settings for 100% offline play (prioritize cache if offline)
        settings.cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK

        // Dark background matching the game theme during load
        webView.setBackgroundColor(Color.parseColor("#030712"))

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: android.webkit.ConsoleMessage?): Boolean {
                Log.d("WallDropJS", "${message?.message()} -- From line ${message?.lineNumber()} of ${message?.sourceId()}")
                return true
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: ""
                if (url.startsWith("file:///android_asset/")) {
                    return false
                }
                return false
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                val failingUrl = request?.url?.toString() ?: ""
                val errorDesc = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) error?.description?.toString() else "Unknown"
                Log.e(TAG, "WebView Error on $failingUrl: $errorDesc")

                // Only show custom error if the main page failed to load
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

        // Hardware acceleration for 60 FPS Canvas rendering
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
    }

    private fun hideSystemUI() {
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
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
        hideSystemUI()
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
