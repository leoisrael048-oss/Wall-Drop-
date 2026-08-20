// Configuration for Google Cloud Text-to-Speech API and Narrator Engine
// Never hardcode secret API keys directly in client source code.

// Central configuration for Wall Drop narrator speed
export const NARRATOR_SPEED = 1.35;

export interface GoogleTTSVoiceConfig {
  languageCode: string;
  name: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
}

export interface NarratorConfigOptions {
  apiKey?: string;
  apiEndpoint?: string;
  speakingRate: number; // Recommended 1.15x - 1.25x
  pitch: number; // Deep male tone (-1.0 to -2.0)
  useGoogleCloudApi: boolean;
  cacheEnabled: boolean;
}

// Default male voice mappings per language for Google Cloud TTS
export const GOOGLE_TTS_MALE_VOICES: Record<string, GoogleTTSVoiceConfig> = {
  pt: {
    languageCode: 'pt-BR',
    name: 'pt-BR-Neural2-B',
    ssmlGender: 'MALE',
  },
  en: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-D',
    ssmlGender: 'MALE',
  },
  es: {
    languageCode: 'es-ES',
    name: 'es-ES-Neural2-B',
    ssmlGender: 'MALE',
  },
  fr: {
    languageCode: 'fr-FR',
    name: 'fr-FR-Neural2-B',
    ssmlGender: 'MALE',
  },
  de: {
    languageCode: 'de-DE',
    name: 'de-DE-Neural2-B',
    ssmlGender: 'MALE',
  },
  it: {
    languageCode: 'it-IT',
    name: 'it-IT-Neural2-C',
    ssmlGender: 'MALE',
  },
  ja: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-C',
    ssmlGender: 'MALE',
  },
  zh: {
    languageCode: 'zh-CN',
    name: 'zh-CN-Neural2-B',
    ssmlGender: 'MALE',
  },
};

export const DEFAULT_NARRATOR_CONFIG: NarratorConfigOptions = {
  apiEndpoint: typeof process !== 'undefined' && process.env?.GOOGLE_CLOUD_TTS_ENDPOINT 
    ? process.env.GOOGLE_CLOUD_TTS_ENDPOINT 
    : '/api/tts',
  apiKey: typeof process !== 'undefined' && process.env?.GOOGLE_CLOUD_TTS_API_KEY 
    ? process.env.GOOGLE_CLOUD_TTS_API_KEY 
    : '',
  speakingRate: NARRATOR_SPEED, // Fast 1.35x arcade commentator rate
  pitch: -1.0,
  useGoogleCloudApi: false, // Falls back smoothly to Web Speech API
  cacheEnabled: true,
};

export class NarratorConfig {
  private static options: NarratorConfigOptions = { ...DEFAULT_NARRATOR_CONFIG };

  public static getOptions(): NarratorConfigOptions {
    return this.options;
  }

  public static updateOptions(newOptions: Partial<NarratorConfigOptions>) {
    this.options = { ...this.options, ...newOptions };
  }

  public static getVoiceForLanguage(lang: string): GoogleTTSVoiceConfig {
    return GOOGLE_TTS_MALE_VOICES[lang] || GOOGLE_TTS_MALE_VOICES.en || GOOGLE_TTS_MALE_VOICES.pt;
  }
}
