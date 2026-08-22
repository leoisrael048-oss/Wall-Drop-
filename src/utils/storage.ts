import { 
  CharacterId, 
  SkinId, 
  TrailId, 
  DeathEffectId, 
  ThemeId, 
  GameSettings, 
  GameStats, 
  HighScoreRecord, 
  DailyMission,
  AchievementItem,
  DailyRewardState,
  CustomCharacterConfig,
  CustomThemeConfig,
  PlayerUpgrades,
  PreviousRunData,
  CelebrationNotice
} from '../types';
import { 
  DEFAULT_SETTINGS, 
  DEFAULT_STATS, 
  INITIAL_CHARACTERS, 
  INITIAL_SKINS, 
  INITIAL_TRAILS, 
  INITIAL_DEATH_EFFECTS, 
  INITIAL_ACHIEVEMENTS,
  DEFAULT_CUSTOM_CHARACTER,
  DEFAULT_CUSTOM_THEME,
  DEFAULT_PLAYER_UPGRADES,
  generateDailyMissions
} from '../constants/gameData';
import { NARRATOR_SPEED } from '../services/narratorConfig';

const KEYS = {
  HIGH_SCORE: 'walldrop_highscore',
  DAILY_HIGH_SCORE: 'walldrop_daily_highscore',
  COINS: 'walldrop_coins',
  SELECTED_CHAR: 'walldrop_selected_char',
  UNLOCKED_CHARS: 'walldrop_unlocked_chars',
  SELECTED_SKIN: 'walldrop_selected_skin',
  UNLOCKED_SKINS: 'walldrop_unlocked_skins',
  SELECTED_TRAIL: 'walldrop_selected_trail',
  UNLOCKED_TRAILS: 'walldrop_unlocked_trails',
  SELECTED_DEATH_EFFECT: 'walldrop_selected_death_effect',
  UNLOCKED_DEATH_EFFECTS: 'walldrop_unlocked_death_effects',
  SELECTED_THEME: 'walldrop_selected_theme',
  UNLOCKED_THEMES: 'walldrop_unlocked_themes',
  CUSTOM_CHARACTER: 'walldrop_custom_character',
  CUSTOM_THEME: 'walldrop_custom_theme',
  PLAYER_UPGRADES: 'walldrop_player_upgrades',
  SETTINGS: 'walldrop_settings',
  STATS: 'walldrop_stats',
  RANKING: 'walldrop_ranking',
  DAILY_REWARD: 'walldrop_daily_reward',
  DAILY_MISSIONS: 'walldrop_daily_missions',
  DAILY_MISSIONS_DATE: 'walldrop_daily_missions_date',
  ACHIEVEMENTS: 'walldrop_achievements',
  PREVIOUS_RUN: 'walldrop_previous_run',
  CELEBRATION_NOTICE: 'walldrop_celebration_notice',
  NIGHT_MODE_STREAK: 'walldrop_night_mode_streak',
  NIGHT_MODE_UNLOCKED: 'walldrop_night_mode_unlocked',
  NIGHT_MODE_ACTIVE: 'walldrop_night_mode_active',
  NARRATOR_UNLOCKED: 'walldrop_narrator_unlocked',
};

// --- CELEBRATION NOTICES ---
export const getCelebrationNotice = (): CelebrationNotice | null => {
  try {
    const val = localStorage.getItem(KEYS.CELEBRATION_NOTICE);
    if (!val) return null;
    return JSON.parse(val) as CelebrationNotice;
  } catch {
    return null;
  }
};

export const saveCelebrationNotice = (notice: CelebrationNotice): void => {
  try {
    localStorage.setItem(KEYS.CELEBRATION_NOTICE, JSON.stringify(notice));
  } catch (e) {
    console.error('Failed to save celebration notice', e);
  }
};

export const clearCelebrationNotice = (): void => {
  try {
    localStorage.removeItem(KEYS.CELEBRATION_NOTICE);
  } catch (e) {
    console.error('Failed to clear celebration notice', e);
  }
};

// --- PREVIOUS RUN SUMMARY ---
export const getPreviousRun = (): PreviousRunData | null => {
  try {
    const val = localStorage.getItem(KEYS.PREVIOUS_RUN);
    if (!val) return null;
    return JSON.parse(val) as PreviousRunData;
  } catch {
    return null;
  }
};

export const savePreviousRun = (score: number, coins: number): void => {
  try {
    const data: PreviousRunData = {
      score,
      coins,
      timestamp: Date.now(),
    };
    localStorage.setItem(KEYS.PREVIOUS_RUN, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save previous run', e);
  }
};

// --- HIGH SCORE ---
export const getHighScore = (): number => {
  try {
    const val = localStorage.getItem(KEYS.HIGH_SCORE);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
};

export const saveHighScore = (score: number): void => {
  try {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem(KEYS.HIGH_SCORE, score.toString());
    }
  } catch (e) {
    console.error('Failed to save high score', e);
  }
};

// --- DAILY HIGH SCORE ---
export const getDailyHighScore = (): { score: number; date: string } => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const val = localStorage.getItem(KEYS.DAILY_HIGH_SCORE);
    if (!val) {
      return { score: 0, date: todayStr };
    }
    const parsed = JSON.parse(val);
    if (parsed.date !== todayStr) {
      // New day! Reset daily score
      return { score: 0, date: todayStr };
    }
    return { score: parsed.score || 0, date: todayStr };
  } catch {
    return { score: 0, date: new Date().toISOString().split('T')[0] };
  }
};

export const saveDailyHighScore = (score: number): boolean => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const current = getDailyHighScore();
    if (score > current.score) {
      localStorage.setItem(KEYS.DAILY_HIGH_SCORE, JSON.stringify({ score, date: todayStr }));
      return true; // Return true if a new daily record was achieved
    }
    return false;
  } catch (e) {
    console.error('Failed to save daily high score', e);
    return false;
  }
};

// --- SINGLE SOURCE OF TRUTH FOR COINS ---
export const getCoins = (): number => {
  try {
    const val = localStorage.getItem(KEYS.COINS);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
};

export const addCoins = (amount: number): number => {
  try {
    const current = getCoins();
    const updated = Math.max(0, current + amount);
    localStorage.setItem(KEYS.COINS, updated.toString());
    return updated;
  } catch {
    return getCoins();
  }
};

export const spendCoins = (amount: number): boolean => {
  try {
    const current = getCoins();
    if (current >= amount) {
      const updated = current - amount;
      localStorage.setItem(KEYS.COINS, updated.toString());
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// --- CHARACTERS ---
export const getSelectedCharacter = (): CharacterId => {
  try {
    return (localStorage.getItem(KEYS.SELECTED_CHAR) as CharacterId) || 'nox';
  } catch {
    return 'nox';
  }
};

export const setSelectedCharacter = (id: CharacterId): void => {
  try {
    localStorage.setItem(KEYS.SELECTED_CHAR, id);
  } catch (e) {
    console.error(e);
  }
};

export const getUnlockedCharacters = (): CharacterId[] => {
  try {
    const val = localStorage.getItem(KEYS.UNLOCKED_CHARS);
    const parsed = val ? JSON.parse(val) : ['nox'];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['nox'];
  } catch {
    return ['nox'];
  }
};

export const unlockCharacter = (id: CharacterId): void => {
  try {
    const list = getUnlockedCharacters();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(KEYS.UNLOCKED_CHARS, JSON.stringify(list));
    }
  } catch (e) {
    console.error(e);
  }
};

// --- SKINS ---
export const getSelectedSkin = (): SkinId => {
  try {
    return (localStorage.getItem(KEYS.SELECTED_SKIN) as SkinId) || 'skin_neon';
  } catch {
    return 'skin_neon';
  }
};

export const setSelectedSkin = (id: SkinId): void => {
  try {
    localStorage.setItem(KEYS.SELECTED_SKIN, id);
  } catch (e) {
    console.error(e);
  }
};

export const getUnlockedSkins = (): SkinId[] => {
  try {
    const val = localStorage.getItem(KEYS.UNLOCKED_SKINS);
    const parsed = val ? JSON.parse(val) : ['skin_neon'];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['skin_neon'];
  } catch {
    return ['skin_neon'];
  }
};

export const unlockSkin = (id: SkinId): void => {
  try {
    const list = getUnlockedSkins();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(KEYS.UNLOCKED_SKINS, JSON.stringify(list));
    }
  } catch (e) {
    console.error(e);
  }
};

// --- TRAILS ---
export const getSelectedTrail = (): TrailId => {
  try {
    return (localStorage.getItem(KEYS.SELECTED_TRAIL) as TrailId) || 'trail_energy';
  } catch {
    return 'trail_energy';
  }
};

export const setSelectedTrail = (id: TrailId): void => {
  try {
    localStorage.setItem(KEYS.SELECTED_TRAIL, id);
  } catch (e) {
    console.error(e);
  }
};

export const getUnlockedTrails = (): TrailId[] => {
  try {
    const val = localStorage.getItem(KEYS.UNLOCKED_TRAILS);
    const parsed = val ? JSON.parse(val) : ['trail_energy'];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['trail_energy'];
  } catch {
    return ['trail_energy'];
  }
};

export const unlockTrail = (id: TrailId): void => {
  try {
    const list = getUnlockedTrails();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(KEYS.UNLOCKED_TRAILS, JSON.stringify(list));
    }
  } catch (e) {
    console.error(e);
  }
};

// --- DEATH EFFECTS ---
export const getSelectedDeathEffect = (): DeathEffectId => {
  try {
    return (localStorage.getItem(KEYS.SELECTED_DEATH_EFFECT) as DeathEffectId) || 'death_explosion';
  } catch {
    return 'death_explosion';
  }
};

export const setSelectedDeathEffect = (id: DeathEffectId): void => {
  try {
    localStorage.setItem(KEYS.SELECTED_DEATH_EFFECT, id);
  } catch (e) {
    console.error(e);
  }
};

export const getUnlockedDeathEffects = (): DeathEffectId[] => {
  try {
    const val = localStorage.getItem(KEYS.UNLOCKED_DEATH_EFFECTS);
    const parsed = val ? JSON.parse(val) : ['death_explosion'];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['death_explosion'];
  } catch {
    return ['death_explosion'];
  }
};

export const unlockDeathEffect = (id: DeathEffectId): void => {
  try {
    const list = getUnlockedDeathEffects();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(KEYS.UNLOCKED_DEATH_EFFECTS, JSON.stringify(list));
    }
  } catch (e) {
    console.error(e);
  }
};

// --- THEMES ---
export const getSelectedTheme = (): ThemeId => {
  try {
    return (localStorage.getItem(KEYS.SELECTED_THEME) as ThemeId) || 'neon';
  } catch {
    return 'neon';
  }
};

export const setSelectedTheme = (id: ThemeId): void => {
  try {
    localStorage.setItem(KEYS.SELECTED_THEME, id);
  } catch (e) {
    console.error(e);
  }
};

export const getUnlockedThemes = (): ThemeId[] => {
  try {
    const val = localStorage.getItem(KEYS.UNLOCKED_THEMES);
    const parsed = val ? JSON.parse(val) : ['neon'];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['neon'];
  } catch {
    return ['neon'];
  }
};

export const unlockTheme = (id: ThemeId): void => {
  try {
    const list = getUnlockedThemes();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(KEYS.UNLOCKED_THEMES, JSON.stringify(list));
    }
  } catch (e) {
    console.error(e);
  }
};

// --- SETTINGS & STATS ---
export const getSettings = (): GameSettings => {
  try {
    const val = localStorage.getItem(KEYS.SETTINGS);
    if (!val) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(val);
    if (parsed.narratorSpeed === undefined || parsed.narratorSpeed > 1.8) {
      parsed.narratorSpeed = NARRATOR_SPEED;
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: GameSettings): void => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error(e);
  }
};

export const getStats = (): GameStats => {
  try {
    const val = localStorage.getItem(KEYS.STATS);
    return val ? { ...DEFAULT_STATS, ...JSON.parse(val) } : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
};

export const updateStats = (score: number, coins: number, combo: number): GameStats => {
  try {
    const current = getStats();
    const updated: GameStats = {
      totalGames: current.totalGames + 1,
      totalCoinsCollected: current.totalCoinsCollected + coins,
      highestCombo: Math.max(current.highestCombo, combo),
      bestScore: Math.max(current.bestScore, score),
    };
    localStorage.setItem(KEYS.STATS, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_STATS;
  }
};

// --- SESSION DEATHS TRACKING (Reset on page reload) ---
let inMemoryConsecutiveDeaths = 0;
let inMemoryTotalSessionDeaths = 0;

export const getSessionDeaths = (): { consecutive: number; total: number } => {
  return {
    consecutive: inMemoryConsecutiveDeaths,
    total: inMemoryTotalSessionDeaths,
  };
};

export const incrementSessionDeaths = (): {
  consecutive: number;
  total: number;
  shouldUnlockStubborn: boolean;
} => {
  inMemoryConsecutiveDeaths += 1;
  inMemoryTotalSessionDeaths += 1;

  const shouldUnlockStubborn = inMemoryTotalSessionDeaths >= 20;

  return {
    consecutive: inMemoryConsecutiveDeaths,
    total: inMemoryTotalSessionDeaths,
    shouldUnlockStubborn,
  };
};

export const resetSessionConsecutiveDeaths = (): void => {
  inMemoryConsecutiveDeaths = 0;
};

// --- DAILY REWARD ---
export const getDailyRewardState = (): DailyRewardState => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const raw = localStorage.getItem(KEYS.DAILY_REWARD);
    if (!raw) {
      return { streak: 1, lastClaimDate: null, canClaimToday: true, streakBroken: false };
    }
    const data = JSON.parse(raw);
    const lastClaim = data.lastClaimDate;

    if (lastClaim === todayStr) {
      return { streak: data.streak || 1, lastClaimDate: lastClaim, canClaimToday: false, streakBroken: false };
    }

    // Check if missed more than 1 day
    if (lastClaim) {
      const lastDate = new Date(lastClaim);
      const todayDate = new Date(todayStr);
      const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays > 1) {
        // Reset streak to day 1 and notify UI of broken streak
        return { streak: 1, lastClaimDate: lastClaim, canClaimToday: true, streakBroken: true };
      }
    }

    return { streak: data.streak || 1, lastClaimDate: lastClaim, canClaimToday: true, streakBroken: false };
  } catch {
    return { streak: 1, lastClaimDate: null, canClaimToday: true, streakBroken: false };
  }
};

export const claimDailyReward = (): { coinsEarned: number; newStreak: number; rewardItem?: string } => {
  const state = getDailyRewardState();
  if (!state.canClaimToday) {
    return { coinsEarned: 0, newStreak: state.streak };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const currentStreak = state.streak;

  const rewardValues: Record<number, number> = {
    1: 20,
    2: 30,
    3: 40,
    4: 50,
    5: 75,
    6: 100,
    7: 250,
  };

  const coinsEarned = rewardValues[currentStreak] || 20;
  addCoins(coinsEarned);

  let rewardItem: string | undefined = undefined;
  if (currentStreak === 7) {
    unlockSkin('skin_gold');
    rewardItem = 'Skin Ouro Lendário';
  }

  const nextStreak = currentStreak >= 7 ? 1 : currentStreak + 1;
  const newState = {
    streak: nextStreak,
    lastClaimDate: todayStr,
  };

  localStorage.setItem(KEYS.DAILY_REWARD, JSON.stringify(newState));
  return { coinsEarned, newStreak: nextStreak, rewardItem };
};

// --- DAILY MISSIONS ---
export const getDailyMissions = (): DailyMission[] => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem(KEYS.DAILY_MISSIONS_DATE);
    const savedMissionsRaw = localStorage.getItem(KEYS.DAILY_MISSIONS);

    if (savedDate !== todayStr || !savedMissionsRaw) {
      const freshMissions = generateDailyMissions();
      localStorage.setItem(KEYS.DAILY_MISSIONS_DATE, todayStr);
      localStorage.setItem(KEYS.DAILY_MISSIONS, JSON.stringify(freshMissions));
      return freshMissions;
    }

    return JSON.parse(savedMissionsRaw);
  } catch {
    return generateDailyMissions();
  }
};

export const saveDailyMissions = (missions: DailyMission[]): void => {
  try {
    localStorage.setItem(KEYS.DAILY_MISSIONS, JSON.stringify(missions));
  } catch (e) {
    console.error(e);
  }
};

export const updateDailyMissionsProgress = (score: number, coinsCollected: number, combo: number): DailyMission[] => {
  const missions = getDailyMissions();
  let updated = false;

  const newMissions = missions.map((m) => {
    if (m.completed) return m;

    let newProgress = m.progress;
    if (m.type === 'coins') {
      newProgress += coinsCollected;
    } else if (m.type === 'score') {
      newProgress = Math.max(m.progress, score);
    } else if (m.type === 'combo') {
      newProgress = Math.max(m.progress, combo);
    } else if (m.type === 'games') {
      newProgress += 1;
    }

    const isNowCompleted = newProgress >= m.target;
    if (newProgress !== m.progress || isNowCompleted !== m.completed) {
      updated = true;
    }

    return {
      ...m,
      progress: Math.min(m.target, newProgress),
      completed: isNowCompleted,
    };
  });

  if (updated) {
    saveDailyMissions(newMissions);
  }
  return newMissions;
};

export const claimMissionReward = (missionId: string): number => {
  const missions = getDailyMissions();
  const target = missions.find((m) => m.id === missionId);
  if (!target || !target.completed || target.claimed) return 0;

  target.claimed = true;
  addCoins(target.rewardCoins);
  saveDailyMissions(missions);
  return target.rewardCoins;
};

// --- ACHIEVEMENTS ---
export const getAchievements = (): AchievementItem[] => {
  try {
    const val = localStorage.getItem(KEYS.ACHIEVEMENTS);
    if (!val) {
      localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(INITIAL_ACHIEVEMENTS));
      return INITIAL_ACHIEVEMENTS;
    }
    const saved: AchievementItem[] = JSON.parse(val);

    // Merge with defaults in case new achievements were added
    return INITIAL_ACHIEVEMENTS.map((def) => {
      const found = saved.find((s) => s.id === def.id);
      return found ? { ...def, ...found } : def;
    });
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
};

export const saveAchievements = (achievements: AchievementItem[]): void => {
  try {
    localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (e) {
    console.error(e);
  }
};

export const updateAchievementsProgress = (
  score: number, 
  coinsCollected: number, 
  combo: number, 
  totalGames: number, 
  totalCoins: number,
  sessionDeaths: number = 0
): { achievements: AchievementItem[]; newlyUnlocked: AchievementItem[]; unlockedMystery: boolean } => {
  const achievements = getAchievements();
  let updated = false;
  let unlockedMystery = false;
  const newlyUnlocked: AchievementItem[] = [];

  const newAch = achievements.map((a) => {
    if (a.completed) return a;

    let currentVal = a.progress;
    if (a.type === 'games') {
      currentVal = totalGames;
    } else if (a.type === 'score') {
      currentVal = Math.max(a.progress, score);
    } else if (a.type === 'combo') {
      currentVal = Math.max(a.progress, combo);
    } else if (a.type === 'coins') {
      currentVal = totalCoins;
    } else if (a.type === 'session_deaths') {
      currentVal = Math.max(a.progress, sessionDeaths);
    }

    const isCompleted = currentVal >= a.target;

    if (isCompleted && !a.completed) {
      updated = true;
      const completedItem: AchievementItem = {
        ...a,
        progress: a.target,
        completed: true,
        unlockedAt: Date.now(),
      };
      newlyUnlocked.push(completedItem);

      // Grant reward directly
      if (a.rewardType === 'coins') {
        addCoins(a.rewardValue as number);
      } else if (a.rewardType === 'character' && a.rewardValue === 'mystery') {
        unlockCharacter('mystery');
        unlockedMystery = true;
      }

      return completedItem;
    }

    return {
      ...a,
      progress: Math.min(a.target, currentVal),
      completed: isCompleted,
    };
  });

  // Secret unlock check: combo >= 30 or score >= 1000 unlocks MYSTERY
  if ((combo >= 30 || score >= 1000) && !getUnlockedCharacters().includes('mystery')) {
    unlockCharacter('mystery');
    unlockedMystery = true;
  }

  if (updated) {
    saveAchievements(newAch);
  }

  return { achievements: newAch, newlyUnlocked, unlockedMystery };
};

// --- RANKING ---
export const getRanking = (): HighScoreRecord[] => {
  try {
    const val = localStorage.getItem(KEYS.RANKING);
    if (!val) {
      const defaultRecords: HighScoreRecord[] = [
        { id: 'rec-1', rank: 1, score: 25, coins: 14, date: '2026-08-01', characterId: 'nox' },
        { id: 'rec-2', rank: 2, score: 18, coins: 10, date: '2026-08-02', characterId: 'blaze' },
        { id: 'rec-3', rank: 3, score: 12, coins: 6, date: '2026-08-03', characterId: 'frost' },
        { id: 'rec-4', rank: 4, score: 8, coins: 4, date: '2026-08-04', characterId: 'volt' },
        { id: 'rec-5', rank: 5, score: 5, coins: 2, date: '2026-08-05', characterId: 'nox' },
      ];
      localStorage.setItem(KEYS.RANKING, JSON.stringify(defaultRecords));
      return defaultRecords;
    }
    return JSON.parse(val);
  } catch {
    return [];
  }
};

export const addRankingRecord = (score: number, coins: number, characterId: CharacterId): HighScoreRecord[] => {
  try {
    if (score <= 0) return getRanking();
    const records = getRanking();
    const today = new Date().toISOString().split('T')[0];
    
    records.push({
      id: `record-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      rank: 0,
      score,
      coins,
      date: today,
      characterId,
    });

    records.sort((a, b) => b.score - a.score);
    const top5 = records.slice(0, 5).map((rec, index) => ({
      ...rec,
      id: rec.id || `record-${index}-${rec.date}-${rec.score}`,
      rank: index + 1,
    }));

    localStorage.setItem(KEYS.RANKING, JSON.stringify(top5));
    return top5;
  } catch {
    return getRanking();
  }
};

// --- CUSTOM CHARACTER WORKSHOP (2000+ COINS) ---
export const getCustomCharacterConfig = (): CustomCharacterConfig => {
  try {
    const val = localStorage.getItem(KEYS.CUSTOM_CHARACTER);
    if (!val) return DEFAULT_CUSTOM_CHARACTER;
    const parsed = JSON.parse(val);
    const safePalettes = Array.isArray(parsed?.unlockedColorPalettes)
      ? parsed.unlockedColorPalettes
      : DEFAULT_CUSTOM_CHARACTER.unlockedColorPalettes;
    return { ...DEFAULT_CUSTOM_CHARACTER, ...parsed, unlockedColorPalettes: safePalettes };
  } catch {
    return DEFAULT_CUSTOM_CHARACTER;
  }
};

export const saveCustomCharacterConfig = (config: Partial<CustomCharacterConfig>): CustomCharacterConfig => {
  try {
    const current = getCustomCharacterConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(KEYS.CUSTOM_CHARACTER, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save custom character config', e);
    return getCustomCharacterConfig();
  }
};

export const unlockCustomPalette = (paletteId: string, cost: number): boolean => {
  try {
    const current = getCustomCharacterConfig();
    const safePalettes = Array.isArray(current?.unlockedColorPalettes)
      ? current.unlockedColorPalettes
      : DEFAULT_CUSTOM_CHARACTER.unlockedColorPalettes;
    if (safePalettes.includes(paletteId)) return true;
    if (spendCoins(cost)) {
      const updatedPalettes = [...safePalettes, paletteId];
      saveCustomCharacterConfig({ unlockedColorPalettes: updatedPalettes });
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// --- CUSTOM THEME WORKSHOP (2000+ COINS) ---
export const getCustomThemeConfig = (): CustomThemeConfig => {
  try {
    const val = localStorage.getItem(KEYS.CUSTOM_THEME);
    if (!val) return DEFAULT_CUSTOM_THEME;
    const parsed = JSON.parse(val);
    const safeBgs = Array.isArray(parsed?.unlockedBackgrounds)
      ? parsed.unlockedBackgrounds
      : DEFAULT_CUSTOM_THEME.unlockedBackgrounds;
    return { ...DEFAULT_CUSTOM_THEME, ...parsed, unlockedBackgrounds: safeBgs };
  } catch {
    return DEFAULT_CUSTOM_THEME;
  }
};

export const saveCustomThemeConfig = (config: Partial<CustomThemeConfig>): CustomThemeConfig => {
  try {
    const current = getCustomThemeConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(KEYS.CUSTOM_THEME, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save custom theme config', e);
    return getCustomThemeConfig();
  }
};

export const unlockCustomBackground = (bgId: string, cost: number): boolean => {
  try {
    const current = getCustomThemeConfig();
    const safeBgs = Array.isArray(current?.unlockedBackgrounds)
      ? current.unlockedBackgrounds
      : DEFAULT_CUSTOM_THEME.unlockedBackgrounds;
    if (safeBgs.includes(bgId)) return true;
    if (spendCoins(cost)) {
      const updatedBgs = [...safeBgs, bgId];
      saveCustomThemeConfig({ unlockedBackgrounds: updatedBgs });
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// --- PLAYER ABILITIES UPGRADES (APRIMORAR - 2000 COINS PER LEVEL) ---
export const getPlayerUpgrades = (): PlayerUpgrades => {
  try {
    const val = localStorage.getItem(KEYS.PLAYER_UPGRADES);
    if (!val) return DEFAULT_PLAYER_UPGRADES;
    const parsed = JSON.parse(val);
    return { ...DEFAULT_PLAYER_UPGRADES, ...parsed };
  } catch {
    return DEFAULT_PLAYER_UPGRADES;
  }
};

export const savePlayerUpgrades = (upgrades: Partial<PlayerUpgrades>): PlayerUpgrades => {
  try {
    const current = getPlayerUpgrades();
    const updated = { ...current, ...upgrades };
    localStorage.setItem(KEYS.PLAYER_UPGRADES, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save player upgrades', e);
    return getPlayerUpgrades();
  }
};

export const upgradePlayerAbility = (abilityKey: keyof PlayerUpgrades, cost: number, maxLevel: number = 5): boolean => {
  try {
    const current = getPlayerUpgrades();
    const currentLvl = current[abilityKey] || 0;
    if (currentLvl >= maxLevel) return false;
    if (spendCoins(cost)) {
      const updated = {
        ...current,
        [abilityKey]: currentLvl + 1,
      };
      savePlayerUpgrades(updated);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// --- SECRET NIGHT MODE (MODO NOTURNO) ---
export const getNightModeStatus = (): { consecutive500: number; unlocked: boolean; active: boolean } => {
  try {
    const streakStr = localStorage.getItem(KEYS.NIGHT_MODE_STREAK);
    const streak = streakStr ? parseInt(streakStr, 10) : 0;
    const unlocked = localStorage.getItem(KEYS.NIGHT_MODE_UNLOCKED) === 'true' || getUnlockedThemes().includes('noturno');
    const settings = getSettings();
    const active = settings.nightModeEnabled ?? (localStorage.getItem(KEYS.NIGHT_MODE_ACTIVE) === 'true');
    return { consecutive500: streak, unlocked, active };
  } catch {
    return { consecutive500: 0, unlocked: false, active: false };
  }
};

export const setNightModeActive = (active: boolean): void => {
  try {
    localStorage.setItem(KEYS.NIGHT_MODE_ACTIVE, active ? 'true' : 'false');
    const settings = getSettings();
    saveSettings({ ...settings, nightModeEnabled: active });
  } catch (e) {
    console.error('Failed to set night mode active', e);
  }
};

export const unlockNightMode = (): void => {
  try {
    localStorage.setItem(KEYS.NIGHT_MODE_UNLOCKED, 'true');
    unlockTheme('noturno');
    const achievements = getAchievements();
    const updated = achievements.map((a) => {
      if (a.id === 'ach_secret_night_mode') {
        return { ...a, progress: 3, completed: true, unlockedAt: Date.now() };
      }
      return a;
    });
    saveAchievements(updated);
  } catch (e) {
    console.error('Failed to unlock night mode', e);
  }
};

export const updateNightModeStreak = (score: number): {
  consecutive500: number;
  unlocked: boolean;
  newlyUnlocked: boolean;
  scoreQualified: boolean;
} => {
  try {
    const currentStatus = getNightModeStatus();
    let newStreak = currentStatus.consecutive500;
    let newlyUnlocked = false;
    const scoreQualified = score > 500;

    if (scoreQualified) {
      newStreak += 1;
    } else {
      newStreak = 0; // Reset streak if match score is <= 500
    }

    localStorage.setItem(KEYS.NIGHT_MODE_STREAK, newStreak.toString());

    let isUnlocked = currentStatus.unlocked;
    if (newStreak >= 3 && !isUnlocked) {
      isUnlocked = true;
      newlyUnlocked = true;
      unlockNightMode();
    }

    // Update achievement progress
    const achievements = getAchievements();
    const updated = achievements.map((a) => {
      if (a.id === 'ach_secret_night_mode') {
        const prog = Math.min(3, isUnlocked ? 3 : newStreak);
        return { ...a, progress: prog, completed: isUnlocked || prog >= 3 };
      }
      return a;
    });
    saveAchievements(updated);

    return {
      consecutive500: newStreak,
      unlocked: isUnlocked,
      newlyUnlocked,
      scoreQualified,
    };
  } catch (e) {
    console.error('Failed to update night mode streak', e);
    return { consecutive500: 0, unlocked: false, newlyUnlocked: false, scoreQualified: false };
  }
};

// --- NARRADOR VICIANTE VIP UNLOCK (3000 COINS) ---
export const getNarratorUnlocked = (): boolean => {
  try {
    return localStorage.getItem(KEYS.NARRATOR_UNLOCKED) === 'true';
  } catch {
    return false;
  }
};

export const setNarratorUnlocked = (unlocked: boolean): void => {
  try {
    localStorage.setItem(KEYS.NARRATOR_UNLOCKED, unlocked ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to set narrator unlocked state', e);
  }
};

export const unlockNarrator = (cost: number = 3000): boolean => {
  try {
    if (getNarratorUnlocked()) return true;
    if (spendCoins(cost)) {
      setNarratorUnlocked(true);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const resetAllData = (): void => {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error('Failed to reset storage', e);
  }
};



