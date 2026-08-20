// lib/services/storage_service.ts
// Local storage persistence service for Wall Drop

import { GameSettings, HighScoreRecord, DailyMission, DailyRewardState } from '../../src/types';
import { NARRATOR_SPEED } from '../../src/services/narratorConfig';

const STORAGE_KEYS = {
  SETTINGS: 'walldrop_settings_v2',
  COINS: 'walldrop_coins_v2',
  HIGH_SCORE: 'walldrop_highscore_v2',
  DAILY_HIGH_SCORE: 'walldrop_daily_highscore_v2',
  UNLOCKED_CHARS: 'walldrop_unlocked_chars_v2',
  SELECTED_CHAR: 'walldrop_selected_char_v2',
  UNLOCKED_SKINS: 'walldrop_unlocked_skins_v2',
  SELECTED_SKIN: 'walldrop_selected_skin_v2',
  UNLOCKED_TRAILS: 'walldrop_unlocked_trails_v2',
  SELECTED_TRAIL: 'walldrop_selected_trail_v2',
  UNLOCKED_EFFECTS: 'walldrop_unlocked_effects_v2',
  SELECTED_EFFECT: 'walldrop_selected_effect_v2',
  DAILY_REWARD: 'walldrop_daily_reward_v2',
  DAILY_MISSIONS: 'walldrop_daily_missions_v2',
  RANKING: 'walldrop_ranking_v2',
};

export class StorageService {
  private static instance: StorageService;

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  public setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  public getSettings(): GameSettings {
    const defaultVal: GameSettings = {
      musicVolume: 0.5,
      sfxVolume: 0.8,
      narratorEnabled: true,
      narratorVolume: 1.0,
      narratorSpeed: NARRATOR_SPEED,
      vibrationEnabled: true,
      language: 'pt',
      playerName: 'Léo',
      firstLaunchDone: false,
    };
    const settings = this.getItem<GameSettings>(STORAGE_KEYS.SETTINGS, defaultVal);
    if (settings && (settings.narratorSpeed === undefined || settings.narratorSpeed > 1.8)) {
      settings.narratorSpeed = NARRATOR_SPEED;
    }
    return settings;
  }

  public saveSettings(settings: GameSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  public getCoins(): number {
    return this.getItem<number>(STORAGE_KEYS.COINS, 0);
  }

  public saveCoins(coins: number): void {
    this.setItem(STORAGE_KEYS.COINS, coins);
  }

  public getHighScore(): number {
    return this.getItem<number>(STORAGE_KEYS.HIGH_SCORE, 0);
  }

  public saveHighScore(score: number): void {
    this.setItem(STORAGE_KEYS.HIGH_SCORE, score);
  }
}

export const storageService = StorageService.getInstance();
