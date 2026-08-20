import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Crown, Flame, Sparkles, X, ChevronRight, Share2, PartyPopper } from 'lucide-react';
import { CelebrationNotice, GameSettings } from '../types';
import { audio } from '../utils/audio';

interface CelebrationNotificationProps {
  notice: CelebrationNotice;
  settings: GameSettings;
  onDismiss: () => void;
  onOpenRanking: () => void;
}

export const CelebrationNotification: React.FC<CelebrationNotificationProps> = ({
  notice,
  settings,
  onDismiss,
  onOpenRanking,
}) => {
  const triggerCelebration = () => {
    audio.playSfx('record', settings);
  };

  useEffect(() => {
    triggerCelebration();
  }, [notice.id]);

  const getIcon = () => {
    if (notice.type === 'rank_up' || (notice.rank && notice.rank <= 10)) {
      return <Crown className="w-5 h-5 text-amber-300 animate-bounce" />;
    }
    if (notice.type === 'top_percentile') {
      return <Flame className="w-5 h-5 text-orange-400 animate-pulse" />;
    }
    return <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />;
  };

  const getBadgeStyle = () => {
    if (notice.type === 'rank_up') {
      return 'from-amber-500/30 via-yellow-500/20 to-purple-600/30 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.35)]';
    }
    if (notice.type === 'top_percentile') {
      return 'from-orange-500/30 via-rose-500/20 to-purple-600/30 border-orange-400/80 shadow-[0_0_25px_rgba(249,115,22,0.35)]';
    }
    return 'from-cyan-500/30 via-blue-500/20 to-purple-600/30 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.35)]';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -25, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
      className={`relative w-full max-w-sm my-2 p-3.5 rounded-2xl bg-gradient-to-r ${getBadgeStyle()} border backdrop-blur-xl z-20 overflow-hidden group`}
    >
      {/* Animated Light Sweep Line */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-950/80 border border-amber-400/40 shadow-inner shrink-0">
            {getIcon()}
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white tracking-wide flex items-center gap-1">
                {notice.title}
              </span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider animate-pulse">
                AO VIVO
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
              {notice.description}
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0"
          title="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Motivational Retention Action Bar */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
        <button
          onClick={triggerCelebration}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-white/10 text-amber-300 text-[10px] font-black transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <PartyPopper className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>Comemorar! 🎉</span>
        </button>

        <button
          onClick={() => {
            audio.playSfx('click', settings);
            onOpenRanking();
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-[11px] transition-all hover:scale-105 active:scale-95 shadow-md shadow-amber-500/30 ml-auto"
        >
          <span>Ver Ranking</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
