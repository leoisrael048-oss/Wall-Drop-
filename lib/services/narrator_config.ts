// lib/services/narrator_config.ts
// Configuration settings for NarratorService using Web Speech API

// Central configuration for Wall Drop narrator speed
export const NARRATOR_SPEED = 1.35;

export interface NarratorSettings {
  language: string;
  narratorEnabled: boolean;
  narratorVolume: number; // 0.0 - 1.0
  narratorSpeed: number;  // Default 1.35x rate
  pitch: number;          // Default 1.0
  phrasePauseMs: number;  // Pause/cooldown between spoken phrases
  playerName?: string;
  voiceGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
}

export const DEFAULT_NARRATOR_SETTINGS: NarratorSettings = {
  language: 'pt',
  narratorEnabled: true,
  narratorVolume: 1.0,
  narratorSpeed: NARRATOR_SPEED, // Fast 1.35x arcade narrator rate
  pitch: 1.0,
  phrasePauseMs: 3000,    // 3.0s pause between phrases to avoid disturbing the player
  playerName: 'Jogador',
  voiceGender: 'MALE',
};

export interface VoiceMapping {
  lang: string;
  voiceNames: string[];
}

export const MALE_VOICES_BY_LANG: Record<string, VoiceMapping> = {
  pt: {
    lang: 'pt-BR',
    voiceNames: ['pt-BR-Neural2-B', 'Neural2-B', 'Felipe', 'Daniel', 'Lucas', 'Luciano', 'Ricardo', 'Google português', 'pt-PT'],
  },
  en: {
    lang: 'en-US',
    voiceNames: ['en-US-Neural2-D', 'Neural2-D', 'David', 'Guy', 'Alex', 'Google US English', 'en-GB'],
  },
  es: {
    lang: 'es-ES',
    voiceNames: ['es-ES-Neural2-B', 'Jorge', 'Diego', 'Google español', 'es-MX'],
  },
  fr: {
    lang: 'fr-FR',
    voiceNames: ['fr-FR-Neural2-B', 'Thomas', 'Google français'],
  },
  de: {
    lang: 'de-DE',
    voiceNames: ['de-DE-Neural2-B', 'Stefan', 'Google Deutsch'],
  },
  it: {
    lang: 'it-IT',
    voiceNames: ['it-IT-Neural2-C', 'Diego', 'Google italiano'],
  },
  ja: {
    lang: 'ja-JP',
    voiceNames: ['ja-JP-Neural2-C', 'Takumi', 'Google 日本語'],
  },
  zh: {
    lang: 'zh-CN',
    voiceNames: ['zh-CN-Neural2-B', 'Kangkang', 'Google 普通话'],
  },
};
