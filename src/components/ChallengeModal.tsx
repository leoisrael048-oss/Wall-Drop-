import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  Coins, 
  Gift, 
  Trophy, 
  Sparkles,
  Lock,
  X,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { 
  DailyMission, 
  AchievementItem, 
  DailyRewardState, 
  GameSettings 
} from '../types';
import { audio } from '../utils/audio';
import { 
  getTranslation, 
  getLocalizedMission, 
  getLocalizedAchievement 
} from '../utils/i18n';

interface ChallengeModalProps {
  coins: number;
  dailyMissions: DailyMission[];
  achievements: AchievementItem[];
  dailyRewardState: DailyRewardState;
  settings: GameSettings;
  onClaimDailyReward: () => { coinsEarned: number; newStreak: number; rewardItem?: string };
  onClaimMissionReward: (id: string) => number;
  onBack: () => void;
}

interface FlyingCoin {
  id: number;
  startX: number;
  startY: number;
  delay: number;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  coins,
  dailyMissions,
  achievements,
  dailyRewardState,
  settings,
  onClaimDailyReward,
  onClaimMissionReward,
  onBack,
}) => {
  const lang = settings?.language || 'pt';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, lang);

  const [activeTab, setActiveTab] = useState<'reward' | 'missions' | 'achievements'>('reward');
  const [rewardClaimMsg, setRewardClaimMsg] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementItem | null>(null);
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoin[]>([]);
  const [displayedCoins, setDisplayedCoins] = useState(coins);

  useEffect(() => {
    setDisplayedCoins(coins);
  }, [coins]);

  useEffect(() => {
    audio.speakNarrator('challengesOpen', settings);
  }, []);

  const streakRewards = [
    { day: 1, label: '+20', coins: 20 },
    { day: 2, label: '+30', coins: 30 },
    { day: 3, label: '+40', coins: 40 },
    { day: 4, label: '+50', coins: 50 },
    { day: 5, label: '+75', coins: 75 },
    { day: 6, label: '+100', coins: 100 },
    { day: 7, label: t('goldSkin'), coins: 250, special: true },
  ];

  const handleClaimReward = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!dailyRewardState.canClaimToday) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top;

    // Trigger flying coin particles
    const newCoins: FlyingCoin[] = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      startX: startX + (Math.random() - 0.5) * 60,
      startY: startY + (Math.random() - 0.5) * 20,
      delay: i * 0.08,
    }));
    setFlyingCoins(newCoins);

    audio.playSfx('coin', settings);
    audio.speakNarrator('missionComplete', settings);
    const res = onClaimDailyReward();

    if (res.coinsEarned > 0) {
      if (res.rewardItem) {
        setRewardClaimMsg(`+${res.coinsEarned} ${t('coins')} & ${res.rewardItem}!`);
      } else {
        setRewardClaimMsg(`+${res.coinsEarned} ${t('coins')}!`);
      }
    }

    setTimeout(() => {
      setFlyingCoins([]);
    }, 1200);
  };

  return (
    <div
      id="challenge-missions-modal"
      className="relative w-full h-full flex flex-col justify-between items-center p-4 sm:p-6 bg-slate-950 text-white overflow-hidden select-none"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Coin Burst Particles for Daily Reward */}
      {flyingCoins.map((coin) => (
        <div
          key={coin.id}
          className="fixed z-50 pointer-events-none flex items-center justify-center text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          style={{
            left: `${coin.startX}px`,
            top: `${coin.startY}px`,
            animation: `coinFly 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
            animationDelay: `${coin.delay}s`,
          }}
        >
          <Coins className="w-6 h-6 fill-amber-400 animate-spin" />
        </div>
      ))}

      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-2 shrink-0">
        <button
          id="challenge-back-btn"
          onClick={() => {
            audio.playSfx('click', settings);
            audio.speakNarrator('returnMenu', settings);
            onBack();
          }}
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 shadow-md flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('menu')}</span>
        </button>

        <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-3.5 py-1.5 rounded-full shadow-md">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-black text-amber-300">{displayedCoins}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-md flex flex-col items-center z-10 my-3 flex-1 overflow-hidden">
        <h2 className="text-xl font-black text-slate-200 uppercase tracking-widest mb-3 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]">
          {t('rewardsMissions')}
        </h2>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 w-full mb-3 shrink-0">
          <button
            id="tab-daily-reward-btn"
            onClick={() => {
              audio.playSfx('click', settings);
              setActiveTab('reward');
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'reward'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md scale-102'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4 shrink-0" />
            <span>{t('dailyRewardTab')}</span>
          </button>

          <button
            id="tab-missions-btn"
            onClick={() => {
              audio.playSfx('click', settings);
              setActiveTab('missions');
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'missions'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md scale-102'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>{t('missionsTab')}</span>
          </button>

          <button
            id="tab-achievements-btn"
            onClick={() => {
              audio.playSfx('click', settings);
              setActiveTab('achievements');
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'achievements'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md scale-102'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span>{t('achievementsTab')}</span>
          </button>
        </div>

        {/* TAB 1: DAILY REWARD STREAK */}
        {activeTab === 'reward' && (
          <div className="w-full flex flex-col items-center gap-3 overflow-y-auto flex-1 pr-1">
            {/* Broken Streak Notification if user missed a day */}
            {dailyRewardState.streakBroken && (
              <div className="w-full p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-2.5 text-rose-200 text-xs font-bold animate-chain-break shadow-md">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Sequência reiniciada por ausência. Volte todo dia para bônus maiores!</span>
              </div>
            )}

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 w-full flex flex-col items-center gap-3.5 shadow-md">
              <div className="flex items-center justify-between w-full text-xs font-extrabold text-amber-400 px-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>{t('dailyStreak')}: <strong className="text-white font-black">{dailyRewardState.streak} {t('days')}</strong></span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">Ciclo de 7 Dias</span>
              </div>

              {/* 7-Day Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 w-full">
                {streakRewards.map((item, idx) => {
                  const isDone = item.day < dailyRewardState.streak || (item.day === dailyRewardState.streak && !dailyRewardState.canClaimToday);
                  const isToday = item.day === dailyRewardState.streak && dailyRewardState.canClaimToday;

                  return (
                    <div
                      key={item.day}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      className={`animate-cascade flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all ${
                        isToday
                          ? 'bg-gradient-to-b from-amber-500/25 to-amber-950/40 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/30 scale-105 animate-golden-pulse ring-2 ring-amber-400/50'
                          : isDone
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400 opacity-90'
                          : 'bg-slate-950/70 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Dia {item.day}</span>
                      <span className="text-xs font-black my-1 text-white drop-shadow">{item.label}</span>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                      ) : isToday ? (
                        <Gift className="w-4 h-4 text-amber-300 animate-pulse" />
                      ) : (
                        <Coins className="w-3.5 h-3.5 text-amber-400/50" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Claim Button */}
              {rewardClaimMsg ? (
                <div className="w-full py-3 bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-extrabold text-xs rounded-2xl text-center animate-bounce shadow-md">
                  ✨ {rewardClaimMsg}
                </div>
              ) : (
                <button
                  id="claim-daily-reward-btn"
                  disabled={!dailyRewardState.canClaimToday}
                  onClick={handleClaimReward}
                  className={`w-full py-3.5 rounded-2xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg ${
                    dailyRewardState.canClaimToday
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-amber-500/30 animate-claim-breath'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>{dailyRewardState.canClaimToday ? t('claimDailyReward') : t('alreadyClaimed')}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DAILY MISSIONS */}
        {activeTab === 'missions' && (
          <div className="w-full flex flex-col gap-2.5 overflow-y-auto flex-1 pr-1">
            {dailyMissions.map((rawMission, idx) => {
              const mission = getLocalizedMission(rawMission, lang);
              const progressPercent = Math.min(100, Math.round((mission.progress / mission.target) * 100));
              const isReadyToClaim = mission.completed && !mission.claimed;

              return (
                <div
                  key={mission.id}
                  style={{ animationDelay: `${idx * 70}ms` }}
                  className={`animate-cascade rounded-2xl p-3.5 flex flex-col gap-2 shadow-md transition-all border ${
                    isReadyToClaim
                      ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-400/80 shadow-amber-500/20 animate-golden-pulse'
                      : mission.claimed
                      ? 'bg-slate-900/60 border-slate-800/60 opacity-80'
                      : 'bg-slate-900/90 border-slate-800/90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white tracking-wide">{mission.title}</span>
                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 shadow-sm">
                      +{mission.rewardCoins} 🪙
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-medium leading-tight">
                    {mission.desc}
                  </p>

                  <div className="flex items-center justify-between gap-3 mt-1">
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>{t('progress')}</span>
                        <span className="font-mono text-slate-200">{mission.progress}/{mission.target}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            isReadyToClaim
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                              : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {mission.claimed ? (
                      <span className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('claimed')}
                      </span>
                    ) : isReadyToClaim ? (
                      <button
                        id={`claim-mission-${mission.id}-btn`}
                        onClick={() => {
                          audio.playSfx('coin', settings);
                          audio.speakNarrator('missionComplete', settings);
                          onClaimMissionReward(mission.id);
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-amber-500/30 animate-claim-breath shrink-0 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        {t('claim')}
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-950 text-slate-400 border border-slate-800 rounded-xl text-[10px] font-bold shrink-0 font-mono">
                        {progressPercent}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <div className="w-full flex flex-col gap-2.5 overflow-y-auto flex-1 pr-1">
            {achievements.map((rawAch, idx) => {
              const ach = getLocalizedAchievement(rawAch, lang);
              const progressPercent = Math.min(100, Math.round((ach.progress / ach.target) * 100));
              const isSpecial = ach.id === 'ach_stubborn_supreme';

              return (
                <div
                  key={ach.id}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() => {
                    audio.playSfx('click', settings);
                    setSelectedAchievement(ach);
                  }}
                  className={`animate-cascade relative overflow-hidden rounded-2xl p-3.5 flex flex-col gap-2 shadow-md cursor-pointer transition-all active:scale-98 border ${
                    ach.completed
                      ? isSpecial
                        ? 'bg-gradient-to-r from-amber-950/50 via-stone-900 to-stone-900 border-amber-500/60 shadow-amber-900/30'
                        : 'bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border-purple-500/60 shadow-purple-900/30'
                      : 'bg-slate-900/80 border-slate-800/80 opacity-75 grayscale-[25%] hover:opacity-100 hover:grayscale-0'
                  }`}
                >
                  {/* Sweeping Ghost Shimmer Light Beam for locked cards */}
                  {!ach.completed && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/8 to-transparent animate-shimmer" />
                    </div>
                  )}

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          ach.completed
                            ? isSpecial
                              ? 'bg-amber-600/30 text-amber-400 border border-amber-500/50'
                              : 'bg-purple-600/30 text-purple-400 border border-purple-500/50'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {ach.completed ? (
                          <Trophy className="w-4 h-4 fill-current" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <span className="font-extrabold text-xs text-white tracking-wide">{ach.title}</span>
                    </div>

                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      {ach.rewardText}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-medium leading-tight relative z-10">
                    {ach.desc}
                  </p>

                  <div className="flex items-center gap-2 mt-1 relative z-10">
                    <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          ach.completed
                            ? isSpecial
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                              : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0 font-mono">
                      {ach.progress}/{ach.target}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Zoom Modal for Tapped Achievement */}
      {selectedAchievement && (
        <div
          id="achievement-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative w-full max-w-xs overflow-hidden rounded-3xl bg-slate-900 border-2 border-purple-500/60 p-5 text-center shadow-2xl shadow-purple-950/80 animate-cascade">
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/40 animate-trophy-spin text-white">
              <Trophy className="w-8 h-8 fill-current" />
            </div>

            <h3 className="text-base font-black text-white tracking-wide">
              {selectedAchievement.title}
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
              {selectedAchievement.desc}
            </p>

            <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-amber-300">
              🎁 Recompensa: {selectedAchievement.rewardText}
            </div>

            <div className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {selectedAchievement.completed
                  ? selectedAchievement.unlockedAt
                    ? `Desbloqueado em ${new Date(selectedAchievement.unlockedAt).toLocaleDateString()}`
                    : 'Status: Concluído! 🏆'
                  : `Progresso: ${selectedAchievement.progress}/${selectedAchievement.target}`}
              </span>
            </div>

            <button
              onClick={() => setSelectedAchievement(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
