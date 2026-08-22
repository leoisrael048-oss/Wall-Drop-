import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GameScreen, 
  CharacterId, 
  SkinId, 
  TrailId, 
  DeathEffectId, 
  GameSettings, 
  DailyMission, 
  AchievementItem, 
  DailyRewardState, 
  HighScoreRecord,
  Language,
  CustomCharacterConfig,
  CustomThemeConfig,
  PlayerUpgrades,
  PreviousRunData
} from './types';
import { 
  INITIAL_CHARACTERS, 
  INITIAL_SKINS, 
  INITIAL_TRAILS, 
  INITIAL_DEATH_EFFECTS 
} from './constants/gameData';
import { 
  getHighScore, 
  saveHighScore, 
  getCoins, 
  addCoins, 
  getSelectedCharacter, 
  setSelectedCharacter, 
  getUnlockedCharacters, 
  unlockCharacter, 
  getSelectedSkin, 
  setSelectedSkin, 
  getUnlockedSkins, 
  unlockSkin, 
  getSelectedTrail, 
  setSelectedTrail, 
  getUnlockedTrails, 
  unlockTrail, 
  getSelectedDeathEffect, 
  setSelectedDeathEffect, 
  getUnlockedDeathEffects, 
  unlockDeathEffect, 
  getDailyRewardState, 
  claimDailyReward, 
  getDailyMissions, 
  claimMissionReward, 
  updateDailyMissionsProgress, 
  getAchievements, 
  updateAchievementsProgress, 
  getSettings, 
  saveSettings, 
  getRanking, 
  addRankingRecord, 
  updateStats, 
  getDailyHighScore,
  saveDailyHighScore,
  resetAllData,
  getCustomCharacterConfig,
  saveCustomCharacterConfig,
  unlockCustomPalette,
  getCustomThemeConfig,
  saveCustomThemeConfig,
  unlockCustomBackground,
  getPlayerUpgrades,
  upgradePlayerAbility,
  getPreviousRun,
  savePreviousRun,
  updateNightModeStreak,
  getNarratorUnlocked,
  unlockNarrator
} from './utils/storage';
import { audio } from './utils/audio';

// Components
import { MainMenu } from './components/MainMenu';
import { CanvasGame } from './components/CanvasGame';
import { HeaderHUD } from './components/HeaderHUD';
import { CharacterSelect } from './components/CharacterSelect';
import { ShopModal } from './components/ShopModal';
import { ChallengeModal } from './components/ChallengeModal';
import { RankingModal } from './components/RankingModal';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { PauseModal } from './components/PauseModal';
import { ShareCardModal } from './components/ShareCardModal';
import { OnboardingModal } from './components/OnboardingModal';
import { IntroAnimation } from './components/IntroAnimation';
import { CustomizerModal } from './components/CustomizerModal';
import { ReplayModal } from './components/ReplayModal';
import { NarratorVicianteModal } from './components/NarratorVicianteModal';
import { ScreenTransitionParticles } from './components/ScreenTransitionParticles';
import { replayRecorder } from './services/replayRecorder';
import { firebaseLeaderboard } from './services/firebaseLeaderboard';

export default function App() {
  // Show cinematic intro animation every time the player enters the game session
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    const initialSettings = getSettings();
    return Boolean(initialSettings.firstLaunchDone && initialSettings.playerName && initialSettings.playerName.trim() !== '');
  });
  const [screen, setScreen] = useState<GameScreen>('menu');

  // Stored state
  const [highScore, setHighScoreState] = useState<number>(0);
  const [dailyHighScore, setDailyHighScoreState] = useState<number>(0);
  const [coins, setCoinsState] = useState<number>(0);

  const [selectedCharId, setSelectedCharState] = useState<CharacterId>('nox');
  const [unlockedChars, setUnlockedCharsState] = useState<CharacterId[]>(['nox']);

  const [selectedSkinId, setSelectedSkinState] = useState<SkinId>('skin_neon');
  const [unlockedSkins, setUnlockedSkinsState] = useState<SkinId[]>(['skin_neon']);

  const [selectedTrailId, setSelectedTrailState] = useState<TrailId>('trail_standard');
  const [unlockedTrails, setUnlockedTrailsState] = useState<TrailId[]>(['trail_standard']);

  const [selectedDeathEffectId, setSelectedDeathEffectState] = useState<DeathEffectId>('effect_explosion');
  const [unlockedDeathEffects, setUnlockedDeathEffectsState] = useState<DeathEffectId[]>(['effect_explosion']);

  const [settings, setSettingsState] = useState<GameSettings>(getSettings());
  const [dailyMissions, setDailyMissionsState] = useState<DailyMission[]>(getDailyMissions());
  const [dailyRewardState, setDailyRewardState] = useState<DailyRewardState>(getDailyRewardState());
  const [achievements, setAchievementsState] = useState<AchievementItem[]>(getAchievements());
  const [ranking, setRankingState] = useState<HighScoreRecord[]>(getRanking());

  // Customization & VIP Upgrades state (2000 Moedas)
  const [customChar, setCustomCharState] = useState<CustomCharacterConfig>(getCustomCharacterConfig());
  const [customTheme, setCustomThemeState] = useState<CustomThemeConfig>(getCustomThemeConfig());
  const [playerUpgrades, setPlayerUpgradesState] = useState<PlayerUpgrades>(getPlayerUpgrades());
  const [previousRun, setPreviousRun] = useState<PreviousRunData | null>(() => getPreviousRun());
  const [narratorUnlocked, setNarratorUnlockedState] = useState<boolean>(() => getNarratorUnlocked());

  const handleUnlockNarrator = (): boolean => {
    if (coins < 3000) return false;
    const success = unlockNarrator(3000);
    if (success) {
      setNarratorUnlockedState(true);
      setCoinsState(getCoins());
      return true;
    }
    return false;
  };

  // In-Game state
  const [gameKey, setGameKey] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentCoins, setCurrentCoins] = useState<number>(0);
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [isNewDailyRecord, setIsNewDailyRecord] = useState<boolean>(false);
  const [coinsEarnedThisRun, setCoinsEarnedThisRun] = useState<number>(0);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showReplayModal, setShowReplayModal] = useState<boolean>(false);
  const [secondChanceTrigger, setSecondChanceTrigger] = useState<number>(0);

  const handleSecondChance = () => {
    setSecondChanceTrigger((prev) => prev + 1);
    setScreen('playing');
  };

  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRecordFeedback = useRef(false);
  const hasTriggeredDailyRecordFeedback = useRef(false);
  const gameStartTimeRef = useRef<number>(0);

  // Load initial local data
  useEffect(() => {
    setHighScoreState(getHighScore());
    setDailyHighScoreState(getDailyHighScore().score);
    setCoinsState(getCoins());
    setSelectedCharState(getSelectedCharacter());
    setUnlockedCharsState(getUnlockedCharacters());
    setSelectedSkinState(getSelectedSkin());
    setUnlockedSkinsState(getUnlockedSkins());
    setSelectedTrailState(getSelectedTrail());
    setUnlockedTrailsState(getUnlockedTrails());
    setSelectedDeathEffectState(getSelectedDeathEffect());
    setUnlockedDeathEffectsState(getUnlockedDeathEffects());
    setDailyMissionsState(getDailyMissions());
    setDailyRewardState(getDailyRewardState());
    setAchievementsState(getAchievements());
    setSettingsState(getSettings());
    setRankingState(getRanking());
  }, []);

  // Sync BGM with settings & screen state
  useEffect(() => {
    if (showIntro) return; // IntroAnimation controls music start during intro
    if (screen === 'playing' && !isPaused) {
      audio.startMusic('gameplay', settings);
    } else {
      audio.startMusic('menu', settings);
    }
  }, [screen, isPaused, settings, showIntro]);

  const handleFeedback = (text: string) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setFeedbackText(text);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedbackText(null);
    }, 750);
  };

  const handleStartGame = () => {
    gameStartTimeRef.current = performance.now();
    setCurrentScore(0);
    setCurrentCoins(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setIsNewRecord(false);
    setIsNewDailyRecord(false);
    setCoinsEarnedThisRun(0);
    setIsPaused(false);
    setFeedbackText(null);
    hasTriggeredRecordFeedback.current = false;
    hasTriggeredDailyRecordFeedback.current = false;

    setGameKey((prev) => prev + 1);
    setScreen('playing');
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const handleScoreUpdate = (score: number, sessionCoins: number, combo: number) => {
    setCurrentScore(score);
    setCurrentCoins(sessionCoins);
    setCurrentCombo(combo);
    setMaxCombo((prev) => Math.max(prev, combo));

    // Live feedback when breaking overall record mid-game
    if (score > highScore && highScore > 0 && !hasTriggeredRecordFeedback.current) {
      hasTriggeredRecordFeedback.current = true;
      handleFeedback('NOVO RECORDE HISTÓRICO!');
      audio.speakNarrator('highScore', settings);
    } else if (score > dailyHighScore && dailyHighScore > 0 && !hasTriggeredDailyRecordFeedback.current && !hasTriggeredRecordFeedback.current) {
      // Live feedback when breaking daily record mid-game
      hasTriggeredDailyRecordFeedback.current = true;
      handleFeedback('RECORDE DO DIA!');
      audio.speakNarrator('highScore', settings);
    }
  };

  const handleGameOver = (finalScore: number, finalCoins: number, peakCombo: number) => {
    const durationMs = performance.now() - gameStartTimeRef.current;
    const durationSec = durationMs / 1000;

    // Prioritize narrator commentary over other ambient audio
    if (durationSec < 5) {
      audio.speakNarrator('deathFast', settings);
    } else {
      audio.speakNarrator('deathUnexpected', settings);
    }

    const previousBest = getHighScore();
    const isNewBest = finalScore > previousBest;

    if (isNewBest && finalScore > 0) {
      saveHighScore(finalScore);
      setHighScoreState(finalScore);
      setIsNewRecord(true);
    } else {
      setIsNewRecord(false);
    }

    // Save & update Daily High Score
    const isNewDaily = saveDailyHighScore(finalScore);
    if (isNewDaily && finalScore > 0) {
      setDailyHighScoreState(finalScore);
      setIsNewDailyRecord(true);
    } else {
      setIsNewDailyRecord(false);
    }

    // Add coins earned
    if (finalCoins > 0) {
      const updatedTotalCoins = addCoins(finalCoins);
      setCoinsState(updatedTotalCoins);
    }
    setCoinsEarnedThisRun(finalCoins);

    // Save local ranking record
    const updatedRanking = addRankingRecord(finalScore, finalCoins, selectedCharId);
    setRankingState(updatedRanking);

    // Update Daily Missions Progress
    const updatedMissions = updateDailyMissionsProgress(finalScore, finalCoins, peakCombo);
    setDailyMissionsState(updatedMissions);

    // Update Achievements Progress
    const stats = updateStats(finalScore, finalCoins, peakCombo);
    const { achievements: updatedAch } = updateAchievementsProgress(
      finalScore, 
      finalCoins, 
      peakCombo, 
      stats.totalGames, 
      stats.totalCoinsCollected
    );

    // Update Night Mode secret challenge streak (3 consecutive games > 500)
    const nightModeResult = updateNightModeStreak(finalScore);
    if (nightModeResult.newlyUnlocked) {
      audio.speakNarrator('unlock', settings);
    }
    const finalAch = getAchievements();
    setAchievementsState(finalAch);

    // Save and update previous run summary for Main Menu
    savePreviousRun(finalScore, finalCoins);
    setPreviousRun({
      score: finalScore,
      coins: finalCoins,
      timestamp: Date.now(),
    });

    // Background cloud backup synchronization (silent, non-blocking)
    const completedAchCount = updatedAch.filter((a) => a.completed).length;
    firebaseLeaderboard.syncUserBackup({
      playerName: settings.playerName || 'Player',
      highScore: Math.max(highScore, finalScore),
      coins: getCoins(),
      achievementsCount: completedAchCount,
    }).catch(() => {});

    setScreen('gameover');
  };

  const handleVictory = (finalScore: number, finalCoins: number, peakCombo: number) => {
    const previousBest = getHighScore();
    const isNewBest = finalScore > previousBest;

    if (isNewBest && finalScore > 0) {
      saveHighScore(finalScore);
      setHighScoreState(finalScore);
      setIsNewRecord(true);
    } else {
      setIsNewRecord(false);
    }

    const isNewDaily = saveDailyHighScore(finalScore);
    if (isNewDaily && finalScore > 0) {
      setDailyHighScoreState(finalScore);
      setIsNewDailyRecord(true);
    } else {
      setIsNewDailyRecord(false);
    }

    if (finalCoins > 0) {
      const updatedTotalCoins = addCoins(finalCoins);
      setCoinsState(updatedTotalCoins);
    }
    setCoinsEarnedThisRun(finalCoins);

    const updatedRanking = addRankingRecord(finalScore, finalCoins, selectedCharId);
    setRankingState(updatedRanking);

    const updatedMissions = updateDailyMissionsProgress(finalScore, finalCoins, peakCombo);
    setDailyMissionsState(updatedMissions);

    const stats = updateStats(finalScore, finalCoins, peakCombo);
    const { achievements: updatedAch } = updateAchievementsProgress(
      finalScore, 
      finalCoins, 
      peakCombo, 
      stats.totalGames, 
      stats.totalCoinsCollected
    );

    // Update Night Mode secret challenge streak (3 consecutive games > 500)
    const nightModeResult = updateNightModeStreak(finalScore);
    if (nightModeResult.newlyUnlocked) {
      audio.speakNarrator('unlock', settings);
    }
    const finalAch = getAchievements();
    setAchievementsState(finalAch);

    savePreviousRun(finalScore, finalCoins);
    setPreviousRun({
      score: finalScore,
      coins: finalCoins,
      timestamp: Date.now(),
    });

    // Sync victory score to Firebase cloud leaderboard
    const playerName = settings.playerName || 'Jogador';
    firebaseLeaderboard.submitScore(
      finalScore,
      finalCoins,
      selectedCharId,
      playerName
    ).catch(() => {});

    setScreen('victory');
  };

  // Character Handlers
  const handleSelectCharacter = (id: CharacterId) => {
    setSelectedCharacter(id);
    setSelectedCharState(id);
  };

  const handleUnlockCharacter = (id: CharacterId, price: number): boolean => {
    if (coins >= price) {
      addCoins(-price);
      unlockCharacter(id);
      setCoinsState(getCoins());
      setUnlockedCharsState(getUnlockedCharacters());
      return true;
    }
    return false;
  };

  // Skin Handlers
  const handleSelectSkin = (id: SkinId) => {
    setSelectedSkin(id);
    setSelectedSkinState(id);
  };

  const handleUnlockSkin = (id: SkinId, price: number): boolean => {
    if (coins >= price) {
      addCoins(-price);
      unlockSkin(id);
      setCoinsState(getCoins());
      setUnlockedSkinsState(getUnlockedSkins());
      return true;
    }
    return false;
  };

  // Trail Handlers
  const handleSelectTrail = (id: TrailId) => {
    setSelectedTrail(id);
    setSelectedTrailState(id);
  };

  const handleUnlockTrail = (id: TrailId, price: number): boolean => {
    if (coins >= price) {
      addCoins(-price);
      unlockTrail(id);
      setCoinsState(getCoins());
      setUnlockedTrailsState(getUnlockedTrails());
      return true;
    }
    return false;
  };

  // Death Effect Handlers
  const handleSelectDeathEffect = (id: DeathEffectId) => {
    setSelectedDeathEffect(id);
    setSelectedDeathEffectState(id);
  };

  const handleUnlockDeathEffect = (id: DeathEffectId, price: number): boolean => {
    if (coins >= price) {
      addCoins(-price);
      unlockDeathEffect(id);
      setCoinsState(getCoins());
      setUnlockedDeathEffectsState(getUnlockedDeathEffects());
      return true;
    }
    return false;
  };

  // Claim Rewards Handlers
  const handleClaimDailyReward = () => {
    const res = claimDailyReward();
    setCoinsState(getCoins());
    setDailyRewardState(getDailyRewardState());
    setUnlockedSkinsState(getUnlockedSkins());
    return res;
  };

  const handleClaimMissionReward = (id: string) => {
    const reward = claimMissionReward(id);
    setCoinsState(getCoins());
    setDailyMissionsState(getDailyMissions());
    return reward;
  };

  // Customization & Upgrade Handlers
  const handleSaveCustomChar = (cfg: Partial<CustomCharacterConfig>) => {
    const updated = saveCustomCharacterConfig(cfg);
    setCustomCharState(updated);
  };

  const handleUnlockCustomPalette = (paletteId: string, cost: number): boolean => {
    if (coins >= cost) {
      const success = unlockCustomPalette(paletteId, cost);
      if (success) {
        setCoinsState(getCoins());
        setCustomCharState(getCustomCharacterConfig());
        return true;
      }
    }
    return false;
  };

  const handleSaveCustomTheme = (cfg: Partial<CustomThemeConfig>) => {
    const updated = saveCustomThemeConfig(cfg);
    setCustomThemeState(updated);
  };

  const handleUnlockCustomBg = (bgId: string, cost: number): boolean => {
    if (coins >= cost) {
      const success = unlockCustomBackground(bgId, cost);
      if (success) {
        setCoinsState(getCoins());
        setCustomThemeState(getCustomThemeConfig());
        return true;
      }
    }
    return false;
  };

  const handleUpgradePlayerAbility = (abilityKey: keyof PlayerUpgrades, cost: number): boolean => {
    if (coins >= cost) {
      const success = upgradePlayerAbility(abilityKey, cost);
      if (success) {
        setCoinsState(getCoins());
        setPlayerUpgradesState(getPlayerUpgrades());
        return true;
      }
    }
    return false;
  };

  // Settings Handlers
  const handleUpdateSettings = (newSettings: GameSettings) => {
    saveSettings(newSettings);
    setSettingsState(newSettings);
  };

  const handleResetData = () => {
    resetAllData();
    setHighScoreState(0);
    setCoinsState(0);
    setSelectedCharState('nox');
    setUnlockedCharsState(['nox']);
    setSelectedSkinState('skin_neon');
    setUnlockedSkinsState(['skin_neon']);
    setSelectedTrailState('trail_standard');
    setUnlockedTrailsState(['trail_standard']);
    setSelectedDeathEffectState('effect_explosion');
    setUnlockedDeathEffectsState(['effect_explosion']);
    setDailyMissionsState(getDailyMissions());
    setDailyRewardState(getDailyRewardState());
    setAchievementsState(getAchievements());
    setSettingsState(getSettings());
    setRankingState([]);
    setCustomCharState(getCustomCharacterConfig());
    setCustomThemeState(getCustomThemeConfig());
    setPlayerUpgradesState(getPlayerUpgrades());
    setScreen('menu');
  };

  // Quick mute toggle for Pause menu
  const handleToggleMute = () => {
    const isCurrentlyMuted = settings.sfxVolume === 0 && settings.musicVolume === 0;
    const newSettings: GameSettings = {
      ...settings,
      musicVolume: isCurrentlyMuted ? 0.5 : 0,
      sfxVolume: isCurrentlyMuted ? 0.8 : 0,
    };
    handleUpdateSettings(newSettings);
  };

  const handleOnboardingComplete = (name: string, lang: Language) => {
    const updated: GameSettings = {
      ...settings,
      playerName: name,
      language: lang,
      narratorEnabled: true,
      firstLaunchDone: true,
    };
    saveSettings(updated);
    setSettingsState(updated);
    setShowIntro(true);
  };

  const showOnboardingModal = !settings.firstLaunchDone && (!settings.playerName || settings.playerName.trim() === '');

  // Get current active character
  const activeCharacter = INITIAL_CHARACTERS.find((c) => c.id === selectedCharId) || INITIAL_CHARACTERS[0];
  const activeSkin = INITIAL_SKINS.find((s) => s.id === selectedSkinId) || INITIAL_SKINS[0];

  const handleEarnCoinsAd = (amount: number) => {
    const updatedTotal = addCoins(amount);
    setCoinsState(updatedTotal);
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.96, y: 12 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        duration: 0.28, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 1.03, 
      y: -10, 
      transition: { 
        duration: 0.22, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    },
  };

  const gameContainerVariants = {
    initial: { opacity: 0, scale: 0.94 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.32, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 1.05, 
      transition: { 
        duration: 0.24 
      } 
    },
  };

  return (
    <div className="w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden font-sans select-none">
      {/* Mobile Device Frame Container */}
      <div className="relative w-full max-w-md h-full max-h-[900px] bg-slate-950 shadow-2xl overflow-hidden flex flex-col border border-slate-800/80 rounded-none sm:rounded-3xl">
        {/* Dynamic Screen Transition & Ambient Particles */}
        <ScreenTransitionParticles currentScreen={screen} />

        {/* Intro Animation Overlay */}
        {showIntro && (
          <IntroAnimation
            settings={settings}
            onComplete={() => setShowIntro(false)}
          />
        )}

        {/* Animated Screen Routing with Framer Motion */}
        <AnimatePresence mode="wait">
          {/* Main Menu Screen */}
          {screen === 'menu' && (
            <motion.div
              key="menu"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full relative z-10"
            >
              <MainMenu
                highScore={highScore}
                dailyHighScore={dailyHighScore}
                coins={coins}
                settings={settings}
                previousRun={previousRun}
                onNavigate={(sc) => setScreen(sc)}
                onStartGame={() => setScreen('characters')}
              />
            </motion.div>
          )}

          {/* Gameplay Screen Container */}
          {(screen === 'playing' || screen === 'gameover' || screen === 'victory') && (
            <motion.div
              key="gameplay"
              variants={gameContainerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative w-full h-full overflow-hidden z-10"
            >
              <HeaderHUD
                score={currentScore}
                coins={coins + currentCoins}
                combo={currentCombo}
                highScore={highScore}
                dailyHighScore={dailyHighScore}
                feedbackText={feedbackText}
                onPause={handlePauseToggle}
              />

              <CanvasGame
                key={gameKey}
                character={activeCharacter}
                skin={activeSkin}
                customChar={customChar}
                customTheme={customTheme}
                upgrades={playerUpgrades}
                settings={settings}
                highScore={highScore}
                onGameOver={handleGameOver}
                onVictory={handleVictory}
                onScoreUpdate={handleScoreUpdate}
                onFeedback={handleFeedback}
                isPaused={isPaused}
                triggerSecondChanceResume={secondChanceTrigger}
              />

              {/* Pause Modal Overlay */}
              <AnimatePresence>
                {isPaused && (
                  <PauseModal
                    settings={settings}
                    onResume={handlePauseToggle}
                    onRestart={handleStartGame}
                    onHome={() => {
                      setIsPaused(false);
                      audio.speakNarrator('returnMenu', settings);
                      setScreen('menu');
                    }}
                    onToggleMute={handleToggleMute}
                  />
                )}
              </AnimatePresence>

              {/* Game Over Modal Overlay */}
              <AnimatePresence>
                {screen === 'gameover' && (
                  <GameOverModal
                    score={currentScore}
                    highScore={highScore}
                    dailyHighScore={dailyHighScore}
                    isNewRecord={isNewRecord}
                    isNewDailyRecord={isNewDailyRecord}
                    coinsEarned={coinsEarnedThisRun}
                    totalCoins={coins}
                    maxCombo={maxCombo}
                    settings={settings}
                    onRestart={handleStartGame}
                    onHome={() => {
                      audio.speakNarrator('returnMenu', settings);
                      setScreen('menu');
                    }}
                    onShare={() => setShowShareModal(true)}
                    onWatchReplay={() => setShowReplayModal(true)}
                    onSecondChance={handleSecondChance}
                  />
                )}
              </AnimatePresence>

              {/* Victory Modal Overlay (7000 Combos) */}
              <AnimatePresence>
                {screen === 'victory' && (
                  <VictoryModal
                    score={currentScore}
                    combo={maxCombo || currentCombo || 7000}
                    coinsEarned={coinsEarnedThisRun || 7000}
                    totalCoins={coins}
                    characterName={activeCharacter.name}
                    settings={settings}
                    onRestart={handleStartGame}
                    onHome={() => {
                      audio.speakNarrator('returnMenu', settings);
                      setScreen('menu');
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Share Card Modal Overlay */}
              <AnimatePresence>
                {showShareModal && (
                  <ShareCardModal
                    score={currentScore}
                    highScore={highScore}
                    characterName={activeCharacter.name}
                    settings={settings}
                    onBack={() => setShowShareModal(false)}
                  />
                )}
              </AnimatePresence>

              {/* Death Replay Modal Overlay */}
              <AnimatePresence>
                {showReplayModal && (
                  <ReplayModal
                    replayData={replayRecorder.getDeathReplay()}
                    settings={settings}
                    onClose={() => setShowReplayModal(false)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Workshop VIP Screen (Customizer & Upgrades) */}
          {screen === 'workshop' && (
            <motion.div
              key="workshop"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full relative z-10"
            >
              <CustomizerModal
                coins={coins}
                customChar={customChar}
                customTheme={customTheme}
                upgrades={playerUpgrades}
                settings={settings}
                onSaveCustomChar={handleSaveCustomChar}
                onUnlockPalette={handleUnlockCustomPalette}
                onSaveCustomTheme={handleSaveCustomTheme}
                onUnlockBg={handleUnlockCustomBg}
                onUpgradeAbility={handleUpgradePlayerAbility}
                onBack={() => setScreen('menu')}
              />
            </motion.div>
          )}

          {/* Character Selection Screen */}
          {screen === 'characters' && (
            <motion.div
              key="characters"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full relative z-10"
            >
              <CharacterSelect
                unlockedChars={unlockedChars}
                selectedCharId={selectedCharId}
                coins={coins}
                settings={settings}
                customChar={customChar}
                onToggleCustomChar={(enabled) => handleSaveCustomChar({ enabled })}
                onOpenWorkshop={() => setScreen('workshop')}
                onSelectCharacter={handleSelectCharacter}
                onUnlockCharacter={handleUnlockCharacter}
                onBack={() => setScreen('menu')}
                onStartGame={handleStartGame}
              />
            </motion.div>
          )}

          {/* Shop Screen */}
          {screen === 'shop' && (
            <motion.div
              key="shop"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full relative z-10"
            >
              <ShopModal
                coins={coins}
                unlockedCharacters={unlockedChars}
                selectedCharacterId={selectedCharId}
                unlockedSkins={unlockedSkins}
                selectedSkinId={selectedSkinId}
                unlockedTrails={unlockedTrails}
                selectedTrailId={selectedTrailId}
                unlockedDeathEffects={unlockedDeathEffects}
                selectedDeathEffectId={selectedDeathEffectId}
                settings={settings}
                onSelectCharacter={handleSelectCharacter}
                onUnlockCharacter={handleUnlockCharacter}
                onSelectSkin={handleSelectSkin}
                onUnlockSkin={handleUnlockSkin}
                onSelectTrail={handleSelectTrail}
                onUnlockTrail={handleUnlockTrail}
                onSelectDeathEffect={handleSelectDeathEffect}
                onUnlockDeathEffect={handleUnlockDeathEffect}
                onEarnCoinsAd={handleEarnCoinsAd}
                onBack={() => setScreen('menu')}
              />
            </motion.div>
          )}

          {/* Daily Reward / Challenge / Missions / Achievements Screen */}
          {screen === 'challenge' && (
            <motion.div
              key="challenge"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full relative z-10"
            >
              <ChallengeModal
                coins={coins}
                dailyMissions={dailyMissions}
                achievements={achievements}
                dailyRewardState={dailyRewardState}
                settings={settings}
                onClaimDailyReward={handleClaimDailyReward}
                onClaimMissionReward={handleClaimMissionReward}
                onBack={() => setScreen('menu')}
              />
            </motion.div>
          )}

          {/* Ranking Screen */}
          {screen === 'ranking' && (
            <motion.div
              key="ranking"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full relative z-10"
            >
              <RankingModal
                ranking={ranking}
                settings={settings}
                onBack={() => setScreen('menu')}
              />
            </motion.div>
          )}

          {/* Settings Screen */}
          {screen === 'settings' && (
            <motion.div
              key="settings"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full relative z-10"
            >
              <SettingsModal
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onResetData={handleResetData}
                onBack={() => setScreen('menu')}
              />
            </motion.div>
          )}

          {/* Narrador Viciante Soundboard & Screen */}
          {screen === 'narrator' && (
            <motion.div
              key="narrator"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full relative z-10"
            >
              <NarratorVicianteModal
                settings={settings}
                coins={coins}
                isUnlocked={narratorUnlocked}
                onUnlock={handleUnlockNarrator}
                onBack={() => setScreen('menu')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Startup Onboarding Modal Overlay */}
        <AnimatePresence>
          {showOnboardingModal && (
            <OnboardingModal
              settings={settings}
              onComplete={handleOnboardingComplete}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

