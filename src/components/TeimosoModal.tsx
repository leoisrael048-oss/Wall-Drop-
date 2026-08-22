import React from 'react';
import { Trophy, Share2, X, Sparkles, Skull, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { GameSettings } from '../types';
import { audio } from '../utils/audio';

interface TeimosoModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onClose: () => void;
  onShareShame: () => void;
}

export const TeimosoModal: React.FC<TeimosoModalProps> = ({
  isOpen,
  settings,
  onClose,
  onShareShame,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="teimoso-supremo-modal"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-amber-600/70 p-6 text-center shadow-2xl shadow-amber-950/80 animate-cascade">
        {/* Animated ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <motion.button
          id="close-teimoso-modal-btn"
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            audio.playSfx('click', settings);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Bronze Trophy / Skull Banner */}
        <div className="relative mx-auto mt-2 mb-4 w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 border-2 border-amber-400/80 flex items-center justify-center shadow-xl shadow-amber-900/60 animate-trophy-spin">
          <Trophy className="w-12 h-12 text-amber-300 fill-amber-400/30 drop-shadow" />
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-red-950 border border-red-500/80 text-red-400 shadow-md">
            <Skull className="w-5 h-5" />
          </div>
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          Conquista Lendária Desbloqueada
        </div>

        <h3 className="text-xl font-black text-white tracking-wide drop-shadow-md">
          TEIMOSO(A) SUPREMO(A) 🏆
        </h3>

        <p className="mt-3 text-sm text-stone-300 leading-relaxed px-2 font-medium">
          Perdeu <strong className="text-amber-400 font-black">20 vezes</strong> seguidas na mesma sessão sem desistir.
          Isso é dedicação ou teimosia? <span className="text-amber-300 font-bold">As duas coisas.</span>
        </p>

        <div className="my-4 py-2.5 px-4 rounded-xl bg-amber-950/40 border border-amber-600/30 text-amber-200 text-xs font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Recompensa: +150 Moedas de Honra!
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 mt-5">
          <motion.button
            id="share-shame-btn"
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              audio.playSfx('click', settings);
              onShareShame();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-amber-900/50 transition-all"
          >
            <Share2 className="w-4 h-4" />
            COMPARTILHAR ESSA VERGONHA 💀
          </motion.button>

          <motion.button
            id="continue-falling-btn"
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              audio.playSfx('click', settings);
              onClose();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white font-bold text-xs tracking-wider transition-colors"
          >
            Continuar caindo...
          </motion.button>
        </div>
      </div>
    </div>
  );
};
