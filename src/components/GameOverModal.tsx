import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Home, Share2, Trophy, Coins, Flame, Sparkles, PlayCircle, Globe, WifiOff, Film, Skull, Loader2 } from 'lucide-react';
import { FUNNY_EXCUSES_BY_LANG, HIGH_SCORE_MEME_PHRASES } from '../constants/gameData';
import { audio } from '../utils/audio';
import { GameSettings, SocialComparisonData } from '../types';
import { getTranslation } from '../utils/i18n';
import { adService } from '../services/adService';
import { firebaseLeaderboard } from '../services/firebaseLeaderboard';
import { networkService } from '../services/networkService';
import { replayRecorder } from '../services/replayRecorder';
import { saveCelebrationNotice } from '../utils/storage';

interface GameOverModalProps {
  score: number;
  highScore: number;
  dailyHighScore: number;
  isNewRecord: boolean;
  isNewDailyRecord?: boolean;
  coinsEarned: number;
  totalCoins?: number;
  maxCombo: number;
  settings: GameSettings;
  onRestart: () => void;
  onHome: () => void;
  onShare: () => void;
  onDownloadFailure?: () => void;
  onWatchReplay?: () => void;
  onSecondChance?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  dailyHighScore,
  isNewRecord,
  isNewDailyRecord,
  coinsEarned,
  totalCoins,
  maxCombo,
  settings,
  onRestart,
  onHome,
  onShare,
  onDownloadFailure,
  onWatchReplay,
  onSecondChance,
}) => {
  const lang = settings?.language || 'pt';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, lang);

  const [funnyPhrase] = useState(() => {
    if (isNewRecord) {
      const hsList = HIGH_SCORE_MEME_PHRASES[lang] || HIGH_SCORE_MEME_PHRASES.pt;
      return hsList[Math.floor(Math.random() * hsList.length)];
    }
    const list = FUNNY_EXCUSES_BY_LANG[lang] || FUNNY_EXCUSES_BY_LANG.pt;
    return list[Math.floor(Math.random() * list.length)];
  });
  const [hasUsedSecondChance, setHasUsedSecondChance] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [adMessage, setAdMessage] = useState<string | null>(null);
  const [socialData, setSocialData] = useState<SocialComparisonData | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(networkService.isOnline());
  const [hasReplayAvailable] = useState<boolean>(() => replayRecorder.hasReplay());
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  // Animated coin tally counting effect on game over
  useEffect(() => {
    if (coinsEarned <= 0) {
      setDisplayedCoins(0);
      return;
    }
    let current = 0;
    const step = Math.max(1, Math.ceil(coinsEarned / 20));
    const timer = setInterval(() => {
      current += step;
      if (current >= coinsEarned) {
        setDisplayedCoins(coinsEarned);
        clearInterval(timer);
      } else {
        setDisplayedCoins(current);
      }
    }, 45);
    return () => clearInterval(timer);
  }, [coinsEarned]);

  useEffect(() => {
    // Increment game count for Interstitial ad frequency capping
    adService.incrementGamesPlayed();

    // Subscribe to verified network state changes
    const unsub = networkService.subscribe((online) => {
      setIsOnline(online);
    });

    // Asynchronously submit score to Firebase (auto-queued if offline)
    if (score > 0) {
      firebaseLeaderboard.submitScore(
        score,
        coinsEarned,
        settings.selectedCharacter || 'nox',
        settings.playerName || 'Jogador'
      ).then(() => {
        // Fetch percentile ranking comparison
        return firebaseLeaderboard.fetchSocialPercentile(score);
      }).then((social) => {
        if (social) {
          setSocialData(social);

          // If exceptional score, save celebration notice
          if (social.percentile >= 95) {
            saveCelebrationNotice({
              id: `celeb_${Date.now()}`,
              title: 'TOP 5% GLOBAL!',
              description: `Top ${100 - social.percentile}% Global alcançado com ${score} pts!`,
              score: score,
              percentile: social.percentile,
              timestamp: Date.now(),
              type: 'top_percentile',
            });
          }
        }
      }).catch((err) => {
        console.warn('Leaderboard sync note:', err);
      });
    }

    return () => unsub();
  }, [score, coinsEarned, settings.selectedCharacter, settings.playerName, settings.language]);

  const getFriendlyAdErrorMessage = (err: any): string => {
    const msg = String(err?.message || err || '').toLowerCase();
    if (msg.includes('no_fill') || msg.includes('sem anúncio') || msg.includes('no ad')) {
      return lang === 'pt' ? 'Anúncio indisponível no momento. Tente novamente mais tarde!' : 'Ad unavailable right now. Try again later!';
    }
    if (msg.includes('network') || msg.includes('conexão') || msg.includes('offline') || !navigator.onLine) {
      return lang === 'pt' ? 'Sem conexão com a internet para carregar o anúncio.' : 'No internet connection to load the ad.';
    }
    if (msg.includes('dismissed') || msg.includes('fechou') || msg.includes('skipped')) {
      return lang === 'pt' ? 'Você precisa assistir o anúncio até o final para reviver.' : 'You must watch the full ad to revive.';
    }
    return lang === 'pt' ? 'Não foi possível reproduzir o vídeo de recompensa.' : 'Could not play the rewarded video.';
  };

  const handleRewardedSecondChance = () => {
    if (hasUsedSecondChance || !onSecondChance) return;
    setIsLoadingAd(true);
    setAdMessage(null);

    adService.showRewardedAd(
      () => {
        setIsLoadingAd(false);
        setHasUsedSecondChance(true);
        audio.playSfx('powerup', settings);
        audio.speakNarrator('secondChance', settings);
        onSecondChance();
      },
      (err) => {
        setIsLoadingAd(false);
        setAdMessage(getFriendlyAdErrorMessage(err));
        setTimeout(() => setAdMessage(null), 3500);
      }
    );
  };

  const handleShareClick = () => {
    setProcessingKey('share');
    audio.playSfx('click', settings);
    setTimeout(() => {
      onShare();
      setProcessingKey(null);
    }, 120);
  };

  const handleRestartClick = () => {
    setProcessingKey('restart');
    audio.playSfx('click', settings);
    setTimeout(() => {
      onRestart();
    }, 120);
  };

  const handleHomeClick = () => {
    setProcessingKey('home');
    audio.playSfx('click', settings);
    audio.speakNarrator('returnMenu', settings);
    setTimeout(() => {
      onHome();
    }, 120);
  };

  const handleWatchReplayClick = () => {
    if (!onWatchReplay) return;
    setProcessingKey('replay');
    audio.playSfx('click', settings);
    setTimeout(() => {
      onWatchReplay();
      setProcessingKey(null);
    }, 120);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ scale: 0.82, y: 25, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.88, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 320 }}
        className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center text-center"
      >
        {/* Banner header badge */}
        {isNewRecord ? (
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-full shadow-lg shadow-amber-500/20 mb-3 animate-bounce">
            <Trophy className="w-4 h-4 fill-current" />
            <span>{t('newRecordBanner')}</span>
          </div>
        ) : (
          <div className="px-4 py-1 bg-slate-800 border border-slate-700 text-slate-400 font-extrabold text-[11px] rounded-full uppercase tracking-widest mb-3">
            GAME OVER
          </div>
        )}

        {/* Score Display */}
        <div className="flex flex-col items-center mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('finalScore')}</span>
          <span className="text-5xl font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            {score}
          </span>
        </div>

        {/* Real Cloud Social Comparison Card */}
        {socialData && (
          <div className="w-full bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 rounded-2xl p-2.5 mb-3 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-left">
              <span className="text-xl">{socialData.icon}</span>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white">{socialData.headline}</span>
                <span className="text-[10px] text-cyan-300 font-semibold">{socialData.badge}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Globe className="w-3.5 h-3.5 text-cyan-400" title="Comparação com dados globais em tempo real" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" title="Offline - Salvo na fila local" />
              )}
            </div>
          </div>
        )}

        {/* Meme Funny Phrase */}
        <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl p-2.5 mb-3 shadow-inner">
          <p className="text-xs font-bold text-cyan-300 italic leading-relaxed">
            "{funnyPhrase}"
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 w-full mb-3">
          <div className="bg-slate-950/60 border border-slate-800 p-2 rounded-xl flex flex-col items-center">
            <Trophy className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
            <span className="text-[9px] text-slate-400 uppercase font-semibold">{t('record')}</span>
            <span className="text-xs font-black text-white">{highScore}</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-2 rounded-xl flex flex-col items-center">
            <Flame className="w-3.5 h-3.5 text-rose-400 mb-0.5" />
            <span className="text-[9px] text-slate-400 uppercase font-semibold">{t('maxCombo')}</span>
            <span className="text-xs font-black text-white">{maxCombo}x</span>
          </div>

          <div className="bg-slate-950/60 border border-amber-500/40 p-2 rounded-xl flex flex-col items-center bg-gradient-to-b from-amber-500/10 to-transparent relative overflow-hidden">
            <Coins className="w-3.5 h-3.5 text-amber-400 mb-0.5 animate-bounce" />
            <span className="text-[9px] text-amber-300 uppercase font-semibold">{t('coins')}</span>
            <span className="text-xs font-black text-amber-300">+{displayedCoins}</span>
          </div>
        </div>

        {/* Total Bank Balance Indicator if available */}
        {totalCoins !== undefined && (
          <div className="w-full bg-slate-950/80 border border-amber-500/30 rounded-xl px-3 py-1.5 mb-3 flex items-center justify-between shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>{lang === 'pt' ? 'Saldo Total Atualizado' : lang === 'es' ? 'Saldo Total Actualizado' : 'Total Coins Balance'}:</span>
            </span>
            <span className="text-xs font-black text-amber-300 font-mono">
              {totalCoins} 🪙
            </span>
          </div>
        )}

        {/* Daily High Score Notification Banner */}
        {isNewDailyRecord && (
          <div className="w-full mb-3 p-2 bg-gradient-to-r from-cyan-950 to-purple-950 border border-cyan-400/40 rounded-xl flex items-center justify-center gap-2 text-cyan-300 text-xs font-bold shadow-md">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>RECORDE DO DIA SUPERADO! ({dailyHighScore} PTS)</span>
          </div>
        )}

        {/* Optional Rewarded Second Chance Button */}
        {onSecondChance && !hasUsedSecondChance && (
          <div className="w-full mb-3 flex flex-col gap-1">
            <motion.button
              type="button"
              disabled={isLoadingAd}
              whileHover={!isLoadingAd ? { scale: 1.03, y: -1 } : {}}
              whileTap={!isLoadingAd ? { scale: 0.94 } : {}}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              onClick={handleRewardedSecondChance}
              className={`w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all border border-emerald-300/40 cursor-pointer ${
                isLoadingAd ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isLoadingAd ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4 fill-current" />
              )}
              <span>{isLoadingAd ? t('loadingAd') : t('secondChanceAd')}</span>
            </motion.button>
            {adMessage && (
              <span className="text-[10px] font-bold text-amber-400 animate-pulse">
                {adMessage}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Main Restart / Play Again Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={handleRestartClick}
            className={`w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 transition-all border border-cyan-400/50 cursor-pointer ${
              processingKey === 'restart' ? 'ring-2 ring-cyan-300' : ''
            }`}
          >
            {processingKey === 'restart' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RotateCcw className="w-5 h-5" />
            )}
            <span>{processingKey === 'restart' ? 'REINICIANDO...' : t('playAgain')}</span>
          </motion.button>

          {/* Watch Death Replay Button */}
          {hasReplayAvailable && onWatchReplay && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              onClick={handleWatchReplayClick}
              className="w-full py-2.5 bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 border border-purple-500/40 text-purple-200 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {processingKey === 'replay' ? (
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              ) : (
                <Film className="w-4 h-4 text-purple-400" />
              )}
              <span>🎬 {lang === 'pt' ? 'Ver Replay da Morte' : lang === 'es' ? 'Ver Repetición' : 'Watch Death Replay'} (30 FPS)</span>
            </motion.button>
          )}

          <div className="grid grid-cols-2 gap-2.5 w-full">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              onClick={handleShareClick}
              className="py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/40 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              {processingKey === 'share' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 text-cyan-200" />
              )}
              <span>{t('share')}</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              onClick={handleHomeClick}
              className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600/70 text-slate-100 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              {processingKey === 'home' ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
              ) : (
                <Home className="w-4 h-4 text-slate-300" />
              )}
              <span>{processingKey === 'home' ? 'VOLTANDO...' : t('menu')}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
