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
  speakingRate: number;
  pitch: number;
  useGoogleCloudApi: boolean;
  cacheEnabled: boolean;
}

// ============================================================
// 🔥 NOVO: Presets de Voz Viciante
// ============================================================
export const VICIANTE_VOICE_PRESETS = {
  // Voz padrão masculina - já existente
  male: {
    speakingRate: 1.35,
    pitch: -1.0,
    volume: 1.0,
    description: 'Voz masculina padrão'
  },
  
  // ⚡ VOZ VICIANTE - Profunda, impactante e com presença
  viciante: {
    speakingRate: 1.15,        // Mais lento para impacto dramático
    pitch: -2.5,               // MUITO grave (voz de trailer de cinema)
    volume: 1.4,               // Mais alto para presença
    description: 'Voz profunda e viciante - estilo locutor de trailer épico',
    effects: {
      reverb: 0.3,
      compression: 0.2,
      boost: 0.1,
    }
  },
  
  // 🥶 VOZ ARREPIANTE - Suspense e calafrio
  arrepiante: {
    speakingRate: 0.95,        // Bem lento para criar tensão
    pitch: -3.0,               // MUITO grave - arrepiante
    volume: 1.1,               // Controlado para mistério
    description: 'Voz arrepiante e misteriosa - estilo narrador de terror/suspense',
    effects: {
      reverb: 0.5,
      whisper: 0.3,
      echo: 0.2,
    }
  },
  
  // 🏆 VOZ ÉPICA - Locutor de estádio/eSports
  epico: {
    speakingRate: 1.4,         // Rápido para emoção
    pitch: -1.8,               // Grave com presença
    volume: 1.5,               // MUITO alto - locutor de estádio
    description: 'Voz épica de locutor - estilo eSports/estádio',
    effects: {
      compression: 0.4,
      boost: 0.3,
    }
  },
  
  // 🎬 VOZ CINEMATOGRÁFICA - Estilo filme de ação
  cinematic: {
    speakingRate: 1.05,        // Médio-lento para drama
    pitch: -2.0,               // Grave cinematográfico
    volume: 1.3,               // Alto e presente
    description: 'Voz cinematográfica - estilo filme de ação',
    effects: {
      reverb: 0.25,
      compression: 0.3,
    }
  },
};

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

// ============================================================
// 🔥 NOVO: Configuração de Vozes Femininas (opcional)
// ============================================================
export const GOOGLE_TTS_FEMALE_VOICES: Record<string, GoogleTTSVoiceConfig> = {
  pt: {
    languageCode: 'pt-BR',
    name: 'pt-BR-Neural2-A',
    ssmlGender: 'FEMALE',
  },
  en: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-F',
    ssmlGender: 'FEMALE',
  },
  es: {
    languageCode: 'es-ES',
    name: 'es-ES-Neural2-C',
    ssmlGender: 'FEMALE',
  },
};

export const DEFAULT_NARRATOR_CONFIG: NarratorConfigOptions = {
  apiEndpoint: typeof process !== 'undefined' && process.env?.GOOGLE_CLOUD_TTS_ENDPOINT 
    ? process.env.GOOGLE_CLOUD_TTS_ENDPOINT 
    : '/api/tts',
  apiKey: typeof process !== 'undefined' && process.env?.GOOGLE_CLOUD_TTS_API_KEY 
    ? process.env.GOOGLE_CLOUD_TTS_API_KEY 
    : '',
  speakingRate: NARRATOR_SPEED,
  pitch: -1.0,  // Padrão: voz masculina grave
  useGoogleCloudApi: false,
  cacheEnabled: true,
};

export class NarratorConfig {
  private static options: NarratorConfigOptions = { ...DEFAULT_NARRATOR_CONFIG };
  private static currentVoiceStyle: keyof typeof VICIANTE_VOICE_PRESETS = 'male';

  public static getOptions(): NarratorConfigOptions {
    return this.options;
  }

  public static updateOptions(newOptions: Partial<NarratorConfigOptions>) {
    this.options = { ...this.options, ...newOptions };
  }

  public static getVoiceForLanguage(lang: string): GoogleTTSVoiceConfig {
    return GOOGLE_TTS_MALE_VOICES[lang] || GOOGLE_TTS_MALE_VOICES.en || GOOGLE_TTS_MALE_VOICES.pt;
  }

  // ============================================================
  // 🔥 NOVOS MÉTODOS PARA VOZ VICIANTE
  // ============================================================

  // Obtém configuração de voz viciante
  public static getVicianteVoice(style: keyof typeof VICIANTE_VOICE_PRESETS = 'viciante'): any {
    return VICIANTE_VOICE_PRESETS[style] || VICIANTE_VOICE_PRESETS.viciante;
  }

  // Aplica estilo de voz às configurações
  public static applyVoiceStyle(style: keyof typeof VICIANTE_VOICE_PRESETS): void {
    this.currentVoiceStyle = style;
    const preset = this.getVicianteVoice(style);
    
    this.options.speakingRate = preset.speakingRate;
    this.options.pitch = preset.pitch;
    
    // Atualiza também para Google Cloud TTS se aplicável
    // Nota: volume e efeitos são tratados no narratorService
  }

  // Obtém o estilo de voz atual
  public static getCurrentVoiceStyle(): string {
    return this.currentVoiceStyle;
  }

  // Lista todos os estilos disponíveis
  public static getAvailableVoiceStyles(): string[] {
    return Object.keys(VICIANTE_VOICE_PRESETS);
  }

  // Obtém voz feminina por idioma
  public static getFemaleVoiceForLanguage(lang: string): GoogleTTSVoiceConfig {
    return GOOGLE_TTS_FEMALE_VOICES[lang] || GOOGLE_TTS_FEMALE_VOICES.en || GOOGLE_TTS_FEMALE_VOICES.pt;
  }

  // Configuração de voz por gênero
  public static getVoiceByGender(lang: string, gender: 'MALE' | 'FEMALE'): GoogleTTSVoiceConfig {
    if (gender === 'FEMALE') {
      return this.getFemaleVoiceForLanguage(lang);
    }
    return this.getVoiceForLanguage(lang);
  }

  // ============================================================
  // 🔥 SISTEMA DE VÍCIO - Frases de Recompensa
  // ============================================================
  
  private static addictionLevel: number = 0;
  private static maxAddictionLevel: number = 10;

  public static incrementAddiction(): void {
    this.addictionLevel = Math.min(this.addictionLevel + 1, this.maxAddictionLevel);
  }

  public static getAddictionLevel(): number {
    return this.addictionLevel;
  }

  public static resetAddiction(): void {
    this.addictionLevel = 0;
  }

  public static isAddicted(): boolean {
    return this.addictionLevel >= this.maxAddictionLevel;
  }

  // ============================================================
  // 🔥 CONFIGURAÇÕES PARA ANÚNCIOS
  // ============================================================
  
  public static getAdRewardConfig() {
    return {
      minAdsForReward: 3,
      minPhrasesForReward: 10,
      exclusivePhraseChance: 0.3, // 30% chance de frase exclusiva
    };
  }
}

// ============================================================
// 🔥 EXPORTAÇÃO DO NARRADOR VICIANTE
// ============================================================

// Exporta configuração pronta para uso
export const VICIANTE_CONFIG = {
  // Presets de voz
  voicePresets: VICIANTE_VOICE_PRESETS,
  
  // Métodos auxiliares
  getVoice: NarratorConfig.getVicianteVoice.bind(NarratorConfig),
  applyStyle: NarratorConfig.applyVoiceStyle.bind(NarratorConfig),
  
  // Sistema de vício
  addiction: {
    level: () => NarratorConfig.getAddictionLevel(),
    increment: NarratorConfig.incrementAddiction.bind(NarratorConfig),
    reset: NarratorConfig.resetAddiction.bind(NarratorConfig),
    isAddicted: NarratorConfig.isAddicted.bind(NarratorConfig),
  },
  
  // Configuração de anúncios
  adReward: NarratorConfig.getAdRewardConfig(),
};
