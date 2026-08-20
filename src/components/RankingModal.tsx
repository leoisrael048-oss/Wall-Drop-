import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Medal, Sparkles, Globe, Smartphone, RefreshCw, Wifi, WifiOff, CloudUpload, Crown, Zap, Flame } from 'lucide-react';
import { HighScoreRecord, GameSettings, CloudLeaderboardRecord } from '../types';
import { audio } from '../utils/audio';
import { getTranslation } from '../utils/i18n';
import { getDailyHighScore, getHighScore } from '../utils/storage';
import { firebaseLeaderboard } from '../services/firebaseLeaderboard';
import { networkService } from '../services/networkService';

interface RankingModalProps {
  ranking: HighScoreRecord[];
  settings: GameSettings;
  onBack: () => void;
}

export const RankingModal: React.FC<RankingModalProps> = ({
  ranking,
  settings,
  onBack,
}) => {
  const lang = settings?.language || 'pt';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, lang);
  const dailyRecord = getDailyHighScore();
  const personalHighScore = getHighScore();

  const [activeTab, setActiveTab] = useState<'global' | 'local'>('global');
  const [cloudScores, setCloudScores] = useState<CloudLeaderboardRecord[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!networkService.isOnline());
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const loadTop5CloudLeaderboard = async () => {
    setIsLoadingCloud(true);
    try {
      // Query precisely the TOP 5 records from Firebase Firestore to minimize latency and bandwidth
      const res = await firebaseLeaderboard.fetchTop5GlobalLeaderboard();
      setCloudScores(res.records);
      setIsOffline(res.isOffline);
      if (res.syncedAt) {
        setSyncedAt(res.syncedAt);
      }
      if (res.latencyMs !== undefined) {
        setLatencyMs(res.latencyMs);
      }
      setPendingQueueCount(firebaseLeaderboard.getOfflineQueue().length);
    } catch {
      setIsOffline(true);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  useEffect(() => {
    audio.speakNarrator('rankingOpen', settings);
    loadTop5CloudLeaderboard();

    // Subscribe to connection status changes
    const unsubscribe = networkService.subscribe((online) => {
      setIsOffline(!online);
      if (online) {
        loadTop5CloudLeaderboard();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSyncQueue = async () => {
    audio.playSfx('click', settings);
    setIsLoadingCloud(true);
    await firebaseLeaderboard.syncPendingScores();
    await loadTop5CloudLeaderboard();
  };

  // Rank badge decorator helper
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.6)]">
            <Crown className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 font-black shadow-sm">
            <Medal className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-black shadow-sm">
            <Medal className="w-3.5 h-3.5 text-amber-200 stroke-[2.5]" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-black">
            #{rank}
          </div>
        );
    }
  };

  // Calculate difference to #5 score
  const fifthPlaceScore = cloudScores.length >= 5 ? cloudScores[4].score : (cloudScores[cloudScores.length - 1]?.score || 0);
  const diffToTop5 = Math.max(0, fifthPlaceScore - personalHighScore + 1);
  const isPlayerInTop5 = cloudScores.some(
    (r) => r.playerName?.trim().toLowerCase() === settings.playerName?.trim().toLowerCase()
  );

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-4 sm:p-5 bg-slate-950 text-white overflow-hidden select-none">
      {/* Top Header */}
      <div className="w-full max-w-sm flex items-center justify-between z-10 pt-1">
        <button
          onClick={() => {
            audio.playSfx('click', settings);
            audio.speakNarrator('returnMenu', settings);
            onBack();
          }}
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 shadow-md flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        {/* Online / Offline Status & Latency Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-md transition-colors ${
          isOffline 
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' 
            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
        }`}>
          {isOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>OFFLINE</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>FIRESTORE</span>
              {latencyMs !== null && latencyMs > 0 && (
                <span className="text-[9px] bg-emerald-500/20 px-1 py-0.2 rounded font-mono text-emerald-200">
                  {latencyMs}ms
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Ranking Content Container */}
      <div className="w-full max-w-sm flex flex-col items-center my-auto z-10 w-full gap-2.5">
        {/* Navigation Tabs: Global vs Local */}
        <div className="w-full grid grid-cols-2 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-inner">
          <button
            onClick={() => {
              audio.playSfx('click', settings);
              setActiveTab('global');
              if (cloudScores.length === 0) loadTop5CloudLeaderboard();
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'global'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>TOP 5 GLOBAL</span>
          </button>
          <button
            onClick={() => {
              audio.playSfx('click', settings);
              setActiveTab('local');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'local'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>LOCAL (APARELHO)</span>
          </button>
        </div>

        {/* Offline Queued Scores Notification */}
        {pendingQueueCount > 0 && (
          <div className="w-full bg-indigo-950/40 border border-indigo-500/40 rounded-xl p-2.5 flex items-center justify-between text-xs animate-cascade">
            <div className="flex items-center gap-2 text-indigo-200">
              <CloudUpload className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>{pendingQueueCount} {pendingQueueCount === 1 ? 'partida pendente' : 'partidas pendentes'} de envio</span>
            </div>
            {!isOffline && (
              <button
                onClick={handleSyncQueue}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] active:scale-95 shadow transition-all"
              >
                Sincronizar
              </button>
            )}
          </div>
        )}

        {/* Global Ranking Tab (TOP 5 FIRESTORE) */}
        {activeTab === 'global' && (
          <div className="w-full bg-slate-900/85 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-xl animate-cascade">
            {/* Header with Title and Fast Refresh */}
            <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    TOP 5 MUNDIAL
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded">
                      FIRESTORE
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Buscando apenas os 5 maiores recordes
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  audio.playSfx('click', settings);
                  loadTop5CloudLeaderboard();
                }}
                disabled={isLoadingCloud}
                className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-700 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                title="Atualizar TOP 5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCloud ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>

            {/* Offline Fallback Warning Notice */}
            {isOffline && (
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-2 flex flex-col items-center text-center gap-1 animate-cascade">
                <span className="text-[11px] font-semibold text-amber-200">
                  📶 Modo Offline Ativo
                </span>
                <span className="text-[9px] text-slate-400">
                  Exibindo o último TOP 5 em cache local de resposta instantânea.
                </span>
              </div>
            )}

            {/* Records List (Strictly Top 5) */}
            <div className="flex flex-col gap-1.5">
              {isLoadingCloud && cloudScores.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold flex items-center justify-center gap-2 animate-cascade">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Consultando TOP 5 no Firestore...</span>
                </div>
              ) : cloudScores.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-semibold animate-cascade">
                  Nenhum registro global no momento. Jogue e envie seu primeiro recorde!
                </div>
              ) : (
                cloudScores.slice(0, 5).map((rec, idx) => {
                  const rank = idx + 1;
                  const isCurrent = rec.playerName?.trim().toLowerCase() === settings.playerName?.trim().toLowerCase();
                  
                  return (
                    <div
                      key={`top5-rec-${rec.id || idx}-${idx}`}
                      style={{ animationDelay: `${idx * 40}ms` }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all animate-cascade ${
                        rank === 1
                          ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : rank === 2
                          ? 'bg-gradient-to-r from-slate-700/30 to-slate-800/40 border-slate-600/80 text-slate-200'
                          : rank === 3
                          ? 'bg-gradient-to-r from-amber-900/30 to-amber-950/40 border-amber-800/60 text-amber-300'
                          : isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-950/70 border-slate-800/70 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center min-w-[28px]">
                          {getRankBadge(rank)}
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-black truncate max-w-[130px] ${
                              rank === 1 ? 'text-amber-300' : 'text-white'
                            }`}>
                              {rec.playerName || 'Jogador Drop'}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 bg-cyan-500/20 border border-cyan-400/40 text-[9px] font-extrabold text-cyan-300 rounded">
                                VOCÊ
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400">
                            <span>{rec.date || 'Hoje'}</span>
                            {rec.coins !== undefined && rec.coins > 0 && (
                              <span className="text-amber-400/80">🪙 {rec.coins}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-black tracking-tight ${
                          rank === 1 ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-white'
                        }`}>
                          {rec.score.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">PTS</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Motivation Comparison Banner */}
            {!isPlayerInTop5 && cloudScores.length >= 5 && (
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs mt-0.5">
                <div className="flex items-center gap-2 text-slate-300">
                  <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-amber-300">SEU RECORDE: {personalHighScore} PTS</span>
                    <span className="text-[9px] text-slate-400">
                      {diffToTop5 > 0 ? `Faltam ${diffToTop5} PTS para entrar no TOP 5!` : 'Próxima partida pode te colocar no topo!'}
                    </span>
                  </div>
                </div>
                <div className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-[9px] font-extrabold border border-amber-500/30">
                  DESAFIO
                </div>
              </div>
            )}

            {/* Sync & Latency Info */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 px-1 pt-0.5">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                Latência Baixa: Firestore Limit(5)
              </span>
              {syncedAt && (
                <span>Atualizado: {syncedAt}</span>
              )}
            </div>
          </div>
        )}

        {/* Local Ranking Tab */}
        {activeTab === 'local' && (
          <div className="w-full flex flex-col gap-2.5 animate-cascade">
            {/* Daily High Score Highlight Card */}
            <div className="w-full bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60 border border-cyan-500/40 rounded-2xl p-3 flex items-center justify-between shadow-lg relative overflow-hidden animate-cascade">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/20 border border-cyan-400/30 rounded-xl text-cyan-400">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-cyan-300/80 font-bold uppercase tracking-wider">⚡ RECORDE DO DIA</span>
                  <span className="text-[11px] text-slate-400 font-medium">{dailyRecord.date}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-lg font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                  {dailyRecord.score} PTS
                </span>
                <span className="text-[9px] text-slate-400 font-semibold uppercase">{settings.playerName}</span>
              </div>
            </div>

            {/* Local Ranking Records List */}
            <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2 shadow-md max-h-[40vh] overflow-y-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t('topRuns')} (Aparelho)
              </span>

              {ranking.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-semibold animate-cascade">
                  {t('noRecordsYet')}
                </div>
              ) : (
                ranking.slice(0, 10).map((rec, idx) => (
                  <div
                    key={`ranking-row-${rec.rank || idx + 1}-${rec.score}-${rec.date}-${idx}`}
                    style={{ animationDelay: `${Math.min(idx, 10) * 45}ms` }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all animate-cascade ${
                      idx === 0
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : idx === 1
                        ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                        : idx === 2
                        ? 'bg-amber-900/20 border-amber-800/40 text-amber-400'
                        : 'bg-slate-950/60 border-slate-800/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="font-extrabold text-xs w-5 text-center">
                        {idx === 0 ? <Medal className="w-4 h-4 text-amber-400 mx-auto" /> : `#${idx + 1}`}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{rec.playerName || settings.playerName}</span>
                        <span className="text-[9px] text-slate-400">{rec.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black">{rec.score} PTS</span>
                        <span className="text-[9px] text-amber-400 font-bold">+{rec.coins} 🪙</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

