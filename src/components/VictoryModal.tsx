import React from 'react';
import { Trophy, Flame, Sparkles, Home, RotateCcw, Share2, Coins, Crown } from 'lucide-react';
import { GameSettings } from '../types';
import { getTranslation } from '../utils/i18n';
import { audio } from '../utils/audio';

interface VictoryModalProps {
  score: number;
  coinsEarned: number;
  maxCombo: number;
  totalCoins: number;
  settings: GameSettings;
  onRestart: () => void;
  onHome: () => void;
  onShare: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  coinsEarned,
  maxCombo,
  totalCoins,
  settings,
  onRestart,
  onHome,
  onShare,
}) => {
  const lang = settings?.language || 'pt';

  const victoryTitle = lang === 'en'
    ? 'GAME BEATEN! 🏆'
    : lang === 'es'
    ? '¡JUEGO COMPLETADO! 🏆'
    : 'JOGO ZERADO! 🏆';

  const victorySub = lang === 'en'
    ? 'SUPREME 7000 COMBO MASTER OF THE ABYSS'
    : lang === 'es'
    ? 'MAESTRO SUPREMO DE 7000 COMBOS DEL ABISMO'
    : 'MESTRE SUPREMO DE 7000 COMBOS DO ABISMO';

  const victoryDesc = lang === 'en'
    ? 'You reached the ultimate milestone of 7000 consecutive combos in a single game! You are a living legend of Wall Drop!'
    : lang === 'es'
    ? '¡Alcanzaste el hito definitivo de 7000 combos consecutivos en una sola partida! ¡Eres una leyenda viva de Wall Drop!'
    : 'Você alcançou a marca suprema de 7000 combos consecutivos em uma única partida! Você é uma lenda viva do Wall Drop!';

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl shadow-amber-500/20 text-center relative overflow-hidden flex flex-col items-center">
        {/* Glow ambient background halo */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Crown & Trophy Grand Icon */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/40 animate-pulse">
            <Trophy className="w-10 h-10 text-slate-950" />
          </div>
          <div className="absolute -top-3 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md">
            <Crown className="w-5 h-5 fill-slate-950" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 tracking-wider uppercase mb-1">
          {victoryTitle}
        </h2>
        <div className="px-3 py-1 bg-amber-500/20 border border-amber-400/50 rounded-full text-amber-300 font-extrabold text-[10px] tracking-widest uppercase mb-3">
          {victorySub}
        </div>

        <p className="text-slate-300 text-xs leading-relaxed mb-4 px-2">
          {victoryDesc}
        </p>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2 bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3 mb-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Combo</span>
            <div className="flex items-center gap-1 text-amber-400 font-black text-base mt-0.5">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{maxCombo}</span>
            </div>
          </div>
          <div className="flex flex-col items-center border-x border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pontos</span>
            <div className="flex items-center gap-1 text-cyan-300 font-black text-base mt-0.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{score}</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Bônus</span>
            <div className="flex items-center gap-1 text-yellow-400 font-black text-base mt-0.5">
              <Coins className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>+{coinsEarned}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={() => {
              audio.playSfx('click', settings);
              onRestart();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 uppercase tracking-wider"
          >
            <RotateCcw className="w-4 h-4" />
            {getTranslation('playAgain', lang)}
          </button>

          <div className="flex gap-2 w-full">
            <button
              onClick={() => {
                audio.playSfx('click', settings);
                onShare();
              }}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-2xl border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
            <button
              onClick={() => {
                audio.playSfx('click', settings);
                onHome();
              }}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Home className="w-4 h-4" />
              {getTranslation('menu', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
