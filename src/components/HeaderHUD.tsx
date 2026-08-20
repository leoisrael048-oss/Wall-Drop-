import React from 'react';
import { Pause, Coins, Flame, Trophy, Zap, Crown } from 'lucide-react';

interface HeaderHUDProps {
  score: number;
  coins: number;
  combo: number;
  highScore?: number;
  dailyHighScore?: number;
  feedbackText?: string | null;
  onPause: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  score,
  coins,
  combo,
  highScore = 0,
  dailyHighScore = 0,
  feedbackText,
  onPause,
}) => {
  const isNewRecord = highScore > 0 && score > highScore;
  const isNewDaily = dailyHighScore > 0 && score > dailyHighScore;
  const effectiveDailyTop = Math.max(dailyHighScore, score);

  return (
    <div 
      id="header-hud-container" 
      className="absolute top-0 left-0 right-0 p-3 sm:p-4 pt-safe flex items-start justify-between pointer-events-none z-20 select-none"
    >
      {/* Top Left: Coins Counter, Daily Top & High Score Chip */}
      <div id="hud-left-stats" className="flex flex-col gap-1.5 items-start">
        {/* Coins Pill */}
        <div 
          id="hud-coins-counter" 
          className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-400/50 shadow-lg shadow-amber-500/10 transition-all transform active:scale-95"
        >
          <div className="w-5 h-5 rounded-full bg-amber-400/25 flex items-center justify-center animate-pulse">
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </div>
          <span id="hud-coins-text" className="text-amber-300 font-black text-xs sm:text-sm tracking-wide tabular-nums">
            {coins}
          </span>
        </div>

        {/* Dynamic & Subtle 'Top: X' Daily Counter */}
        <div 
          id="hud-daily-top-badge"
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black backdrop-blur-md border transition-all duration-300 ${
            isNewDaily 
              ? 'bg-amber-500/25 text-amber-300 border-amber-400/80 shadow-md shadow-amber-500/20 animate-pulse' 
              : 'bg-slate-900/85 text-cyan-300 border-cyan-500/40 shadow-sm'
          }`}
        >
          <Crown className={`w-3 h-3 shrink-0 ${isNewDaily ? 'text-amber-300 animate-bounce' : 'text-cyan-400'}`} />
          <span className="tracking-wider tabular-nums uppercase">
            {isNewDaily ? `Top: ${score} 👑` : `Top: ${effectiveDailyTop || highScore || 0}`}
          </span>
        </div>

        {/* Global Best Record */}
        {highScore > 0 && !isNewDaily && (
          <div 
            id="hud-record-target"
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold backdrop-blur-md border ${
              isNewRecord 
                ? 'bg-purple-500/20 text-purple-300 border-purple-400/60 animate-pulse shadow-md shadow-purple-500/20' 
                : 'bg-slate-900/70 text-slate-400 border-slate-700/40'
            }`}
          >
            <Trophy className="w-3 h-3 text-purple-400 shrink-0" />
            <span className="tabular-nums">
              {isNewRecord ? 'RECORDE GERAL!' : `BEST: ${highScore}`}
            </span>
          </div>
        )}
      </div>

      {/* Center Column: Big Dynamic Score, Multiplier Badge & Feedback Banner */}
      <div id="hud-score-column" className="flex flex-col items-center max-w-[55vw]">
        {/* Dynamic Score Display with Glow */}
        <div className="relative flex items-center justify-center">
          <span 
            id="hud-score-display" 
            className="text-4xl sm:text-6xl font-black text-white tracking-wider drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] tabular-nums transition-transform duration-75"
          >
            {score}
          </span>
          {isNewRecord && (
            <span className="absolute -top-1 -right-3 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          )}
        </div>

        {/* Dynamic Combo Fire Pill with Adrenaline Glow */}
        {combo > 1 && (
          <div
            id={`hud-combo-badge-${combo}`}
            key={`combo_${combo}`}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-white text-[11px] sm:text-xs font-black shadow-xl mt-1 border tracking-wider uppercase ${
              combo % 10 === 0 
                ? 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 border-amber-300 animate-bounce shadow-amber-500/60 scale-110'
                : 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 border-white/30 shadow-rose-500/40 animate-pulse'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-200 text-amber-200 shrink-0" />
            <span>{combo % 10 === 0 ? `🔥 HYPER x${combo} (50x)` : `COMBO x${combo}`}</span>
          </div>
        )}

        {/* Dynamic Feedback Banner */}
        {feedbackText && (
          <div
            id="hud-feedback-banner"
            key={`feedback_${feedbackText}`}
            className="mt-1 px-3.5 py-1 bg-slate-950/90 text-cyan-300 font-black text-[11px] sm:text-xs uppercase tracking-widest rounded-full shadow-2xl shadow-cyan-500/30 border border-cyan-400/60 backdrop-blur-md animate-bounce truncate max-w-[80vw]"
          >
            {feedbackText}
          </div>
        )}
      </div>

      {/* Top Right: Speed Status Indicator & Glassmorphic Pause Button */}
      <div id="hud-right-controls" className="flex items-center gap-2">
        {/* Dynamic Adrenaline Speed Indicator */}
        <div 
          id="hud-speed-gauge" 
          className="hidden xs:flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-cyan-500/30 shadow-md"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-black text-cyan-300 tracking-wider uppercase">
            {combo >= 10 && combo % 10 === 0 ? '⚡ 50x HYPER' : score >= 100 ? 'VELOCIDADE MÁX' : score >= 40 ? 'RÁPIDO' : 'NORMAL'}
          </span>
        </div>

        {/* Glassmorphic Pause Button */}
        <button
          id="hud-pause-button"
          onClick={(e) => {
            e.stopPropagation();
            onPause();
          }}
          className="pointer-events-auto p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-950/85 hover:bg-slate-900 active:scale-90 text-slate-300 hover:text-white rounded-full border border-slate-700/70 backdrop-blur-md shadow-lg shadow-black/40 transition-all cursor-pointer"
          aria-label="Pausar jogo"
        >
          <Pause className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
