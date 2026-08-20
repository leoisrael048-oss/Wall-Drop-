import React, { useEffect, useState } from 'react';
import { AchievementItem, GameSettings } from '../types';
import { Trophy, Sparkles, X } from 'lucide-react';
import { audio } from '../utils/audio';

interface AchievementToastProps {
  achievement: AchievementItem | null;
  settings: GameSettings;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  settings,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      audio.playSfx('achievement', settings);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 350);
      }, 3800);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [achievement]);

  if (!achievement) return null;

  const isBronze = achievement.id === 'ach_stubborn_supreme';

  return (
    <div
      id="achievement-live-toast"
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[92%] transition-all duration-400 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-xl border ${
          isBronze
            ? 'bg-gradient-to-r from-amber-950/95 via-stone-900/95 to-amber-950/95 border-amber-500/60 shadow-amber-950/80 text-amber-100'
            : 'bg-gradient-to-r from-slate-950/95 via-cyan-950/90 to-slate-950/95 border-cyan-400/60 shadow-cyan-950/80 text-white'
        }`}
      >
        {/* Shimmer light sweep */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
        </div>

        <div className="flex items-center gap-3.5 relative z-10">
          {/* Trophy Icon */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg animate-trophy-spin ${
              isBronze
                ? 'bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400/50 shadow-amber-700/50 text-amber-200'
                : 'bg-gradient-to-br from-amber-400 to-yellow-600 border border-yellow-300/50 shadow-yellow-500/50 text-yellow-950'
            }`}
          >
            <Trophy className="w-6 h-6 fill-current" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Conquista Desbloqueada!
              </span>
            </div>
            <h4 className="text-sm font-black tracking-wide truncate text-white drop-shadow">
              {achievement.title}
            </h4>
            <p className="text-[11px] text-slate-300 line-clamp-1 leading-tight mt-0.5">
              {achievement.desc}
            </p>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              🎁 {achievement.rewardText}
            </span>
          </div>

          {/* Close Button */}
          <button
            id="dismiss-achievement-toast-btn"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
