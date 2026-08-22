import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, User, ShoppingBag, Award, Settings, Trophy, Coins, Sparkles, Crown, Palette, History, Flame, Target, Mic, Lock, Loader2 } from 'lucide-react';
import { GameScreen, GameSettings, PreviousRunData, CelebrationNotice } from '../types';
import { getTranslation } from '../utils/i18n';
import { audio } from '../utils/audio';
import { getCelebrationNotice, clearCelebrationNotice, getNarratorUnlocked } from '../utils/storage';
import { CelebrationNotification } from './CelebrationNotification';
import { DustParticles } from './DustParticles';

interface MainMenuProps {
  highScore: number;
  dailyHighScore: number;
  coins: number;
  settings: GameSettings;
  previousRun?: PreviousRunData | null;
  onNavigate: (screen: GameScreen) => void;
  onStartGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  highScore,
  dailyHighScore,
  coins,
  settings,
  previousRun,
  onNavigate,
  onStartGame,
}) => {
  const lang = settings?.language || 'pt';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, lang);
  const [celebrationNotice, setCelebrationNotice] = useState<CelebrationNotice | null>(null);
  const [processingBtn, setProcessingBtn] = useState<string | null>(null);

  // Trigger welcome narrator and load celebration notice
  useEffect(() => {
    audio.speakNarrator('welcome', settings);

    const savedNotice = getCelebrationNotice();
    if (savedNotice) {
      setCelebrationNotice(savedNotice);
    } else if (highScore >= 20 && previousRun && previousRun.score >= highScore) {
      // Automatic celebration card if player just set their record on recent run
      setCelebrationNotice({
        id: `auto_rec_${Date.now()}`,
        type: 'new_record',
        title: '🎉 NOVO RECORDE PESSOAL!',
        description: `Sua marca de ${highScore} pts te colocou em destaque no ranking global!`,
        score: highScore,
        timestamp: Date.now(),
      });
    }
  }, [highScore, previousRun, settings]);

  const handleDismissNotice = () => {
    setCelebrationNotice(null);
    clearCelebrationNotice();
  };

  const handleStart = () => {
    if (processingBtn) return;
    setProcessingBtn('play');
    audio.playSfx('click', settings);
    audio.speakNarrator('start', settings);
    setTimeout(() => {
      onStartGame();
    }, 120);
  };

  const handleNav = (screen: GameScreen) => {
    if (processingBtn) return;
    setProcessingBtn(screen);
    audio.playSfx('click', settings);
    if (screen === 'characters') audio.speakNarrator('selectCharacter', settings);
    if (screen === 'shop') audio.speakNarrator('shopOpen', settings);
    if (screen === 'challenge') audio.speakNarrator('challengesOpen', settings);
    if (screen === 'ranking') audio.speakNarrator('rankingOpen', settings);
    if (screen === 'settings') audio.speakNarrator('settingsOpen', settings);
    if (screen === 'workshop') audio.speakNarrator('workshopOpen', settings);
    setTimeout(() => {
      onNavigate(screen);
    }, 120);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-full flex flex-col justify-between items-center p-4 sm:p-6 bg-slate-950 text-white overflow-hidden select-none"
    >
      {/* Ambient Floating Dust and Embers System */}
      <DustParticles density={30} speed={0.5} />

      {/* Dynamic Animated Background Shaft Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/40 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Best Score & Coins */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, type: 'spring' }}
        className="w-full max-w-sm flex items-center justify-between z-10 pt-1"
      >
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-2xl backdrop-blur-md shadow-md">
          <Trophy className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{t('bestScore')}</span>
            <span className="text-sm font-bold text-white">{highScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-amber-500/30 px-3 py-1.5 rounded-2xl backdrop-blur-md shadow-md">
          <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-300/80 uppercase tracking-wider font-medium">{t('coins')}</span>
            <span className="text-sm font-bold text-amber-300">{coins}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Center Content (Brand Title, Notification, Previous Run) */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: -15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 120 }}
        className="flex flex-col items-center my-auto z-10 text-center w-full max-w-sm"
      >
        <div className="relative mb-1">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 blur-xl opacity-75 animate-pulse" />
          <h1 className="relative text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]">
            WALL<span className="text-cyan-400">DROP</span>
          </h1>
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-300 font-bold mt-0.5">
          {t('subtitle')}
        </p>

        {/* Celebration Notification Banner for Record Breaks & Ranking Climbs */}
        <AnimatePresence>
          {celebrationNotice && (
            <CelebrationNotification
              notice={celebrationNotice}
              settings={settings}
              onDismiss={handleDismissNotice}
              onOpenRanking={() => handleNav('ranking')}
            />
          )}
        </AnimatePresence>

        {/* Daily High Score Badge */}
        {!celebrationNotice && (
          <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-cyan-500/30 rounded-full text-cyan-300 text-[11px] font-bold shadow-md backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>RECORDE DO DIA: <span className="text-white font-extrabold">{dailyHighScore}</span></span>
          </div>
        )}

        {/* Previous Run Summary Display */}
        {previousRun && previousRun.score !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="mt-2.5 w-full max-w-[260px] bg-gradient-to-r from-slate-900/95 via-indigo-950/80 to-slate-900/95 border border-indigo-500/40 rounded-2xl p-2.5 shadow-lg shadow-indigo-950/50 backdrop-blur-md flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <History className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider text-indigo-300 font-bold">Última Partida</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white flex items-center gap-0.5">
                    <Target className="w-3 h-3 text-cyan-400 inline" />
                    {previousRun.score} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2 py-1 rounded-xl text-amber-300 font-extrabold text-xs shrink-0">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>+{previousRun.coins}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Main Action Group */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="w-full max-w-xs flex flex-col items-center gap-2.5 z-10 mb-2"
      >
        {/* Big Play Action Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className={`group relative w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xl tracking-wider shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-200 flex items-center justify-center gap-3 border border-cyan-400/40 overflow-hidden ${
            processingBtn === 'play' ? 'brightness-125 shadow-cyan-400/70' : ''
          }`}
        >
          {processingBtn === 'play' ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-white" />
              <span className="animate-pulse tracking-widest">INICIANDO...</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
              <span>{t('play')}</span>
            </>
          )}
        </motion.button>

        {/* Workshop VIP Button (Customização & Aprimoramento 2000 Moedas) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleNav('workshop')}
          className={`relative w-full py-2.5 px-3.5 rounded-xl border transition-all flex items-center justify-between shadow-lg overflow-hidden group ${
            processingBtn === 'workshop'
              ? 'bg-amber-500/30 border-amber-400 ring-2 ring-amber-400/50'
              : coins >= 2000
              ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-purple-500/20 border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
              : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0">
              {processingBtn === 'workshop' ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <Crown className="w-4 h-4 animate-bounce" />
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-amber-300 group-hover:text-amber-200 transition-colors flex items-center gap-1.5">
                <span>{t('workshop')}</span>
                {processingBtn === 'workshop' && (
                  <span className="text-[9px] font-extrabold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full animate-pulse">
                    CARREGANDO...
                  </span>
                )}
                {processingBtn !== 'workshop' && coins >= 2000 && (
                  <span className="text-[9px] font-extrabold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full">
                    DISPONÍVEL
                  </span>
                )}
              </span>
              <span className="text-[10px] text-slate-400">Customizar Cores & Aprimorar</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-black text-amber-400 bg-slate-950/80 px-2 py-1 rounded-lg border border-amber-500/30 shrink-0">
            <Palette className="w-3 h-3 text-amber-400" />
            <span>2.000 🪙</span>
          </div>
        </motion.button>

        {/* Secondary Menu Buttons Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={() => handleNav('characters')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-md active:shadow-none cursor-pointer border ${
              processingBtn === 'characters'
                ? 'bg-cyan-950 border-cyan-400 text-white ring-1 ring-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            {processingBtn === 'characters' ? (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : (
              <User className="w-4 h-4 text-cyan-400" />
            )}
            <span>{processingBtn === 'characters' ? 'CARREGANDO...' : t('characters')}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={() => handleNav('shop')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-md active:shadow-none cursor-pointer border ${
              processingBtn === 'shop'
                ? 'bg-purple-950 border-purple-400 text-white ring-1 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            {processingBtn === 'shop' ? (
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            ) : (
              <ShoppingBag className="w-4 h-4 text-purple-400" />
            )}
            <span>{processingBtn === 'shop' ? 'CARREGANDO...' : t('shop')}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={() => handleNav('challenge')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-md active:shadow-none cursor-pointer border ${
              processingBtn === 'challenge'
                ? 'bg-amber-950 border-amber-400 text-white ring-1 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            {processingBtn === 'challenge' ? (
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
            ) : (
              <Award className="w-4 h-4 text-amber-400" />
            )}
            <span>{processingBtn === 'challenge' ? 'CARREGANDO...' : t('challenge')}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={() => handleNav('ranking')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-md active:shadow-none cursor-pointer border ${
              processingBtn === 'ranking'
                ? 'bg-yellow-950 border-yellow-400 text-white ring-1 ring-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            {processingBtn === 'ranking' ? (
              <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
            ) : (
              <Trophy className="w-4 h-4 text-yellow-400" />
            )}
            <span>{processingBtn === 'ranking' ? 'CARREGANDO...' : t('ranking')}</span>
          </motion.button>
        </div>

        {/* Bottom Actions Row: Settings & Narrador Viciante */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={() => handleNav('narrator')}
            className={`flex items-center justify-between py-2 px-3 rounded-xl border text-xs font-bold tracking-wider transition-all shadow-md cursor-pointer ${
              processingBtn === 'narrator'
                ? 'bg-purple-950 border-purple-400 ring-1 ring-purple-400 text-white'
                : getNarratorUnlocked()
                ? 'bg-gradient-to-r from-purple-950/90 via-purple-900/80 to-slate-900/90 hover:from-purple-900 hover:to-slate-850 border-purple-500/50 text-purple-200 shadow-purple-950/50'
                : 'bg-slate-950/90 hover:bg-slate-900 border-purple-500/30 text-purple-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {processingBtn === 'narrator' ? (
                <Loader2 className="w-3.5 h-3.5 text-pink-400 animate-spin" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              )}
              <span>{processingBtn === 'narrator' ? 'ABRINDO...' : 'NARRADOR VIP'}</span>
            </div>
            {!getNarratorUnlocked() ? (
              <span className="flex items-center gap-1 text-[9px] font-black text-amber-400 bg-slate-900/90 px-1.5 py-0.5 rounded-md border border-amber-500/40 shrink-0">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                <span>3.000 🪙</span>
              </span>
            ) : (
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-500/40 shrink-0">
                VIP ✓
              </span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={() => handleNav('settings')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer border ${
              processingBtn === 'settings'
                ? 'bg-slate-800 border-cyan-400 text-white ring-1 ring-cyan-400'
                : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            {processingBtn === 'settings' ? (
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            ) : (
              <Settings className="w-3.5 h-3.5" />
            )}
            <span>{processingBtn === 'settings' ? 'CARREGANDO...' : t('settings')}</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
