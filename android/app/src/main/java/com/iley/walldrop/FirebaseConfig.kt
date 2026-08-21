package com.iley.walldrop

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.database.FirebaseDatabase

/**
 * ==============================================================================
 * WALL DROP - CONFIGURAÇÃO DO FIREBASE (MODO HÍBRIDO OFFLINE-FIRST)
 * ==============================================================================
 * 
 * Totalmente seguro contra exceções de inicialização e falta de conectividade.
 */
object FirebaseConfig {

    private const val TAG = "WallDropFirebase"

    // URL do Firebase Realtime Database (Plano Spark Gratuito)
    const val DATABASE_URL = "https://walldrop-game-default-rtdb.firebaseio.com"

    private var isInitialized = false

    /**
     * Inicializa o Firebase com suporte a cache e persistência offline em disco
     */
    fun init(context: Context) {
        if (isInitialized) return

        try {
            if (FirebaseApp.getApps(context).isEmpty()) {
                FirebaseApp.initializeApp(context)
            }

            // Ativa persistência offline no Realtime Database se disponível
            try {
                val rtdb = FirebaseDatabase.getInstance(DATABASE_URL)
                try {
                    rtdb.setPersistenceEnabled(true)
                } catch (e: Throwable) {
                    Log.d(TAG, "Persistence notice: ${e.message}")
                }
                rtdb.getReference("leaderboard").keepSynced(true)
            } catch (e: Throwable) {
                Log.w(TAG, "Realtime Database initialization notice: ${e.message}")
            }

            isInitialized = true
            Log.i(TAG, "Firebase Leaderboard inicializado com sucesso.")
        } catch (e: Throwable) {
            Log.w(TAG, "Firebase rodando em fallback offline seguro: ${e.message}")
        }
    }

    /**
     * Verifica o estado da conexão de rede via ConnectivityManager
     */
    fun isNetworkAvailable(context: Context): Boolean {
        return try {
            val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
                ?: return false
            val network = cm.activeNetwork ?: return false
            val caps = cm.getNetworkCapabilities(network) ?: return false
            caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
            caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
        } catch (e: Throwable) {
            false
        }
    }

    /**
     * Envia uma pontuação para o Firebase em background de forma 100% assíncrona
     */
    fun submitScoreAsync(
        context: Context,
        score: Long,
        coins: Long,
        characterId: String,
        playerName: String,
        onComplete: ((Boolean) -> Unit)? = null
    ) {
        if (score <= 0) {
            onComplete?.invoke(true)
            return
        }

        try {
            init(context)
            val db = FirebaseDatabase.getInstance(DATABASE_URL)
            val ref = db.getReference("leaderboard").push()
            val cleanName = if (playerName.isBlank()) "Drop Player" else playerName.take(20)

            val payload = hashMapOf(
                "id" to (ref.key ?: "score_${System.currentTimeMillis()}"),
                "playerName" to cleanName,
                "score" to score,
                "coins" to coins,
                "characterId" to characterId,
                "timestamp" to System.currentTimeMillis(),
                "date" to java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()).format(java.util.Date())
            )

            ref.setValue(payload)
                .addOnSuccessListener {
                    Log.d(TAG, "Pontuação enviada com sucesso ao Firebase!")
                    onComplete?.invoke(true)
                }
                .addOnFailureListener { e ->
                    Log.w(TAG, "Falha no envio da pontuação (salva no cache local): ${e.message}")
                    onComplete?.invoke(false)
                }
        } catch (e: Throwable) {
            Log.w(TAG, "Erro assíncrono ao enviar pontuação (ignorado com segurança): ${e.message}")
            onComplete?.invoke(false)
        }
    }
}
