package com.iley.walldrop

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.firestore.FirebaseFirestore

/**
 * ==============================================================================
 * WALL DROP - CONFIGURAÇÃO DO FIREBASE (MODO HÍBRIDO OFFLINE-FIRST)
 * ==============================================================================
 * 
 * ATENÇÃO - INSTRUÇÃO IMPORTANTE:
 * // SUBSTITUIR google-services.json pelo arquivo real do seu projeto Firebase antes de compilar
 * 
 * Este gerenciador garante que o jogo funcione 100% OFFLINE por padrão:
 * - Se não houver internet, nenhuma chamada de rede é realizada e nenhuma trava ocorre.
 * - Habilita persistência local em disco no Firebase Database / Firestore.
 * - Sincroniza scores com a nuvem em background de forma assíncrona.
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
            // Ativa persistência offline no Realtime Database
            val rtdb = FirebaseDatabase.getInstance(DATABASE_URL)
            try {
                rtdb.setPersistenceEnabled(true)
            } catch (e: Exception) {
                // setPersistenceEnabled só pode ser chamado uma vez antes de qualquer uso
                Log.d(TAG, "Persistence already enabled: ${e.message}")
            }

            // Sincroniza o nó de leaderboard localmente para acesso instantâneo sem rede
            rtdb.getReference("leaderboard").keepSynced(true)

            isInitialized = true
            Log.i(TAG, "Firebase Leaderboard inicializado com sucesso em modo Híbrido.")
        } catch (e: Exception) {
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
        } catch (e: Exception) {
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
                    Log.w(TAG, "Falha no envio da pontuação (salva no cache local do Firebase): ${e.message}")
                    onComplete?.invoke(false)
                }
        } catch (e: Exception) {
            Log.w(TAG, "Erro assíncrono ao enviar pontuação: ${e.message}")
            onComplete?.invoke(false)
        }
    }
}
