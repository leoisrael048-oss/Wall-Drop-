// lib/services/narrator_service.ts
// Web Speech API Narrator Service with Queue Management and Multi-language Support

import { NarratorSettings, DEFAULT_NARRATOR_SETTINGS, MALE_VOICES_BY_LANG, NARRATOR_SPEED } from './narrator_config';

export interface SpeechQueueItem {
  id: string;
  text: string;
  settings?: Partial<NarratorSettings>;
  priority?: number; // Higher numbers = higher priority
  bypassPause?: boolean; // Force immediate speech
  resolve?: () => void;
  reject?: (error: any) => void;
}

export class NarratorService {
  private static instance: NarratorService | null = null;
  private synth: SpeechSynthesis | null = null;
  private queue: SpeechQueueItem[] = [];
  private isProcessing: boolean = false;
  private currentSpeakingPriority: number = 0;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private lastSpokenTimestamp: number = 0;
  private currentLanguage: string = 'pt';
  private currentSettings: NarratorSettings = { ...DEFAULT_NARRATOR_SETTINGS };
  private pauseTimer: any = null;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.synth.getVoices();
      if (typeof this.synth.addEventListener === 'function') {
        this.synth.addEventListener('voiceschanged', () => {
          this.synth?.getVoices();
        });
      }
    }
  }

  public static getInstance(): NarratorService {
    if (!NarratorService.instance) {
      NarratorService.instance = new NarratorService();
    }
    return NarratorService.instance;
  }

  public async initialize(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('Web Speech API is not supported in this environment.');
        resolve(false);
        return;
      }

      this.synth = window.speechSynthesis;
      let voices = this.synth.getVoices();

      if (voices.length > 0) {
        resolve(true);
        return;
      }

      const onVoicesChanged = () => {
        if (this.synth) {
          voices = this.synth.getVoices();
          if (voices.length > 0) {
            this.synth.removeEventListener('voiceschanged', onVoicesChanged);
            resolve(true);
            return;
          }
        }
      };

      this.synth.addEventListener('voiceschanged', onVoicesChanged);
      
      setTimeout(() => {
        resolve(!!this.synth);
      }, 1000);
    });
  }

  public setLanguage(lang: string) {
    this.currentLanguage = lang;
    this.currentSettings.language = lang;
  }

  public updateSettings(newSettings: Partial<NarratorSettings>) {
    this.currentSettings = {
      ...this.currentSettings,
      ...newSettings,
    };
    if (newSettings.language) {
      this.currentLanguage = newSettings.language;
    }
  }

  public getSettings(): NarratorSettings {
    return { ...this.currentSettings };
  }

  public speak(
    text: string,
    options?: Partial<NarratorSettings>,
    priority: number = 1,
    bypassPause: boolean = false
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const mergedSettings = { ...this.currentSettings, ...options };
      if (!mergedSettings.narratorEnabled || (mergedSettings.narratorVolume ?? 1) <= 0) {
        resolve();
        return;
      }

      const interpolatedText = this.interpolatePlayerName(text, mergedSettings.playerName);

      const item: SpeechQueueItem = {
        id: `speech_${Date.now()}_${Math.random()}`,
        text: interpolatedText,
        settings: mergedSettings,
        priority,
        bypassPause,
        resolve,
        reject,
      };

      // Stop ongoing lower or equal priority speech when high priority item arrives
      if (this.isProcessing && priority > this.currentSpeakingPriority) {
        this.stop();
      }

      this.queue.push(item);
      this.queue.sort((a, b) => (b.priority || 1) - (a.priority || 1));

      if (this.queue.length > 2) {
        const removed = this.queue.pop();
        removed?.resolve?.();
      }

      this.processQueue();
    });
  }

  public async speakAsync(
    text: string,
    options?: Partial<NarratorSettings>,
    priority: number = 1,
    bypassPause: boolean = false
  ): Promise<void> {
    return this.speak(text, options, priority, bypassPause);
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    const item = this.queue[0];
    const settings = { ...this.currentSettings, ...item.settings };
    const pauseMs = Math.max(3000, settings.phrasePauseMs ?? 3000);

    if (!item.bypassPause && (item.priority || 1) < 4 && this.lastSpokenTimestamp > 0) {
      const elapsed = Date.now() - this.lastSpokenTimestamp;
      if (elapsed < pauseMs) {
        const remaining = pauseMs - elapsed;
        if (this.pauseTimer) clearTimeout(this.pauseTimer);
        this.pauseTimer = setTimeout(() => {
          this.processQueue();
        }, remaining + 20);
        return;
      }
    }

    this.queue.shift();
    this.isProcessing = true;

    try {
      await this.executeSpeechUtterance(item.text, settings, item.priority || 1);
      this.lastSpokenTimestamp = Date.now();
      item.resolve?.();
    } catch (err) {
      item.reject?.(err);
    } finally {
      this.isProcessing = false;
      this.lastSpokenTimestamp = Date.now();
      if (this.queue.length > 0) {
        if (this.pauseTimer) clearTimeout(this.pauseTimer);
        this.pauseTimer = setTimeout(() => {
          this.processQueue();
        }, pauseMs);
      }
    }
  }

  private executeSpeechUtterance(
    text: string,
    settings: NarratorSettings,
    priority: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      try {
        if (this.synth.speaking || this.synth.pending) {
          this.synth.cancel();
        }
        if (this.synth.paused) {
          this.synth.resume();
        }

        const cleanText = text.replace(/<[^>]*>/g, '').trim();
        if (!cleanText) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);

        const isFemale = (settings as any).narratorVoiceGender === 'female' || settings.voiceGender === 'FEMALE';
        const basePitch = isFemale ? 1.2 : 0.75;
        const speed = settings.narratorSpeed ?? NARRATOR_SPEED;

        // Dynamic slight random variation (±10%) to make the soccer commentator voice sound alive and expressive
        const pitchVar = 0.95 + Math.random() * 0.1;
        const rateVar = 0.95 + Math.random() * 0.1;

        utterance.rate = Math.min(3.0, Math.max(0.5, speed * rateVar));
        utterance.pitch = (settings.pitch ?? basePitch) * pitchVar;
        utterance.volume = Math.min(1, Math.max(0.1, settings.narratorVolume ?? 1.0));

        const lang = settings?.language || this.currentLanguage || 'pt';
        const voiceMapping = MALE_VOICES_BY_LANG[lang] || MALE_VOICES_BY_LANG.en || MALE_VOICES_BY_LANG.pt || { lang: 'pt-BR', voiceNames: [] };
        utterance.lang = voiceMapping.lang || 'pt-BR';

        const voices = this.synth.getVoices() || [];
        const langPrefix = (voiceMapping.lang || 'pt').split('-')[0].toLowerCase();

        // 1. Gender-specific matching voice
        let suitableVoice = voices.find((v) => {
          if (!v) return false;
          const vLang = (v.lang || '').toLowerCase().replace('_', '-');
          const vName = (v.name || '').toLowerCase();
          if (!vLang.startsWith(langPrefix)) return false;
          if (isFemale) {
            return (
              vName.includes('female') ||
              vName.includes('maria') ||
              vName.includes('francisca') ||
              vName.includes('leticia') ||
              vName.includes('victoria') ||
              vName.includes('zira') ||
              vName.includes('samantha') ||
              vName.includes('karen') ||
              vName.includes('anna') ||
              vName.includes('eva') ||
              vName.includes('yuna')
            );
          } else {
            return (
              vName.includes('male') ||
              vName.includes('felipe') ||
              vName.includes('daniel') ||
              vName.includes('lucas') ||
              vName.includes('david') ||
              vName.includes('guy') ||
              vName.includes('jorge') ||
              vName.includes('diego') ||
              vName.includes('stefan')
            );
          }
        });

        // 2. Premium/Neural voice in target language
        if (!suitableVoice) {
          suitableVoice = voices.find((v) => {
            if (!v) return false;
            const vLang = (v.lang || '').toLowerCase().replace('_', '-');
            const vName = (v.name || '').toLowerCase();
            return (
              vLang.startsWith(langPrefix) &&
              (vName.includes('natural') || vName.includes('neural') || vName.includes('google') || vName.includes('online') || vName.includes('premium'))
            );
          });
        }

        // 3. Preferred voice names
        if (!suitableVoice) {
          suitableVoice = voices.find((v) => {
            if (!v) return false;
            const vLang = (v.lang || '').toLowerCase().replace('_', '-');
            const vName = (v.name || '').toLowerCase();
            return (
              vLang.startsWith(langPrefix) &&
              Array.isArray(voiceMapping.voiceNames) &&
              voiceMapping.voiceNames.some((name) => Boolean(name && vName.includes(name.toLowerCase())))
            );
          });
        }

        // 4. Any voice matching language prefix (e.g. 'en', 'es', 'fr', 'de', 'it', 'ja', 'zh', 'pt')
        if (!suitableVoice) {
          suitableVoice = voices.find((v) => {
            if (!v) return false;
            const vLang = (v.lang || '').toLowerCase().replace('_', '-');
            return vLang.startsWith(langPrefix);
          });
        }

        if (suitableVoice) {
          utterance.voice = suitableVoice;
        }

        this.currentSpeakingPriority = priority;

        utterance.onend = () => {
          this.currentUtterance = null;
          this.currentSpeakingPriority = 0;
          resolve();
        };

        utterance.onerror = (e) => {
          console.warn('NarratorSpeech error caught:', e);
          this.currentUtterance = null;
          this.currentSpeakingPriority = 0;
          resolve();
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis exception caught:', e);
        resolve();
      }
    });
  }

  public async testVoice(
    name: string,
    lang: string = 'pt',
    settings?: Partial<NarratorSettings>
  ): Promise<void> {
    const finalName = name.trim().slice(0, 20) || 'Jogador';
    const samplePhrases: Record<string, string> = {
      pt: `Bem-vindo ao Wall Drop, ${finalName}! Essa é a sua voz do narrador. Preparado?`,
      en: `Welcome to Wall Drop, ${finalName}! This is your narrator voice. Ready?`,
      es: `¡Bienvenido a Wall Drop, ${finalName}! Esta es la voz del narrador. ¿Preparado?`,
      fr: `Bienvenue sur Wall Drop, ${finalName} ! C'est la voix du narrateur. Prêt ?`,
      de: `Willkommen bei Wall Drop, ${finalName}! Das ist die Stimme des Erzählers. Bereit?`,
      it: `Benvenuto su Wall Drop, ${finalName}! Questa è la voce del narratore. Pronto?`,
      ja: `ウォールドロップへようこそ、${finalName}！これがナレーターの声だ。準備はいいか？`,
      zh: `欢迎来到 Wall Drop，${finalName}！这是解说员的声音。准备好了吗？`,
    };

    const text = samplePhrases[lang] || samplePhrases.en || samplePhrases.pt;
    const testSettings: Partial<NarratorSettings> = {
      ...settings,
      playerName: finalName,
      language: lang,
      narratorEnabled: true,
      narratorVolume: settings?.narratorVolume ?? 1.0,
      narratorSpeed: settings?.narratorSpeed ?? NARRATOR_SPEED,
      pitch: settings?.pitch ?? 1.0,
    };

    this.stop();
    return this.speak(text, testSettings, 10, true);
  }

  public stop() {
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
    this.queue = [];
    this.isProcessing = false;
    this.currentSpeakingPriority = 0;
    this.currentUtterance = null;
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn('Error stopping speech synthesis:', e);
      }
    }
  }

  private interpolatePlayerName(text: string, playerName?: string): string {
    const nameToUse = playerName?.trim() || this.currentSettings.playerName || 'Jogador';
    return text.replace(/\{name\}/g, nameToUse);
  }

  public resetHistory() {
    this.lastSpokenTimestamp = 0;
    this.stop();
  }
}

export const narratorService = NarratorService.getInstance();
