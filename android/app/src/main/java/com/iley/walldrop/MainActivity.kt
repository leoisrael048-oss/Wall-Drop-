package com.iley.walldrop

import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import java.util.Locale

class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {

    private lateinit var tts: TextToSpeech
    private lateinit var webView: WebView
    private var ttsReady = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Inicializar a voz do Android
        tts = TextToSpeech(this, this)

        // Configurar a WebView (onde seu jogo roda)
        webView = findViewById(R.id.webView)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.allowFileAccess = true
        webView.settings.allowContentAccess = true
        webView.settings.setSupportZoom(false)
        
        // Adicionar a ponte para o JavaScript
        webView.addJavascriptInterface(AndroidTTSBridge(tts), "Android")

        // Carregar seu jogo
        webView.loadUrl("file:///android_asset/index.html")
    }

    // Quando a voz estiver pronta
    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.language = Locale("pt", "BR")
            ttsReady = true
            println("✅ TTS inicializado com sucesso!")
        } else {
            println("❌ Falha ao inicializar TTS")
        }
    }

    // A ponte entre o JavaScript e o TTS
    inner class AndroidTTSBridge(private val tts: TextToSpeech) {

        @JavascriptInterface
        fun speak(text: String) {
            if (ttsReady) {
                // Parar qualquer voz anterior
                tts.stop()
                // Falar o texto
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
            }
        }

        @JavascriptInterface
        fun stop() {
            tts.stop()
        }

        @JavascriptInterface
        fun setLanguage(lang: String) {
            val locale = when (lang) {
                "pt" -> Locale("pt", "BR")
                "en" -> Locale.US
                "es" -> Locale("es", "ES")
                "fr" -> Locale.FRANCE
                "de" -> Locale.GERMANY
                "it" -> Locale.ITALY
                "ja" -> Locale.JAPAN
                "zh" -> Locale.CHINA
                else -> Locale.getDefault()
            }
            tts.language = locale
        }

        @JavascriptInterface
        fun setSpeed(speed: Float) {
            // Velocidade da voz (0.5 a 2.0)
            tts.setSpeechRate(speed)
        }

        @JavascriptInterface
        fun setPitch(pitch: Float) {
            // Tom da voz (0.5 a 2.0)
            tts.setPitch(pitch)
        }
    }

    override fun onDestroy() {
        if (::tts.isInitialized) {
            tts.shutdown()
        }
        super.onDestroy()
    }
}
