import { ARROGANT_NARRATOR_PHRASES } from '../constants/gameData';
import { GameSettings } from '../types';
import { narratorService, NarratorEventCategory } from '../services/narratorService';

export type MusicMode = 'menu' | 'gameplay';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicMasterGain: GainNode | null = null;
  private duckingGain: GainNode | null = null;
  private sfxMasterGain: GainNode | null = null;

  private currentMusicMode: MusicMode | null = null;
  private isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private currentCombo: number = 0;

  // Dynamic Ambient Sound System (Wind & Obstacle Proximity Hum)
  private ambientWindOsc: OscillatorNode | null = null;
  private ambientWindGain: GainNode | null = null;
  private ambientWindFilter: BiquadFilterNode | null = null;

  private obstacleHumOsc: OscillatorNode | null = null;
  private obstacleHumGain: GainNode | null = null;
  private obstacleHumFilter: BiquadFilterNode | null = null;

  private isAmbientPlaying: boolean = false;

  // Narrator state
  private lastPhrase: string = '';
  private lastSpeechTime: number = 0;
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;

  private userInteracted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          try {
            window.speechSynthesis.getVoices();
          } catch {
            // Safe fallback
          }
        };
      }

      // Unlock AudioContext safely on the first user touch/click interaction
      const unlockAudio = () => {
        this.userInteracted = true;
        this.initCtx();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('click', unlockAudio);
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('click', unlockAudio, { passive: true });
    }
  }

  public initCtx() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();

          // Create Nodes
          this.musicMasterGain = this.ctx.createGain();
          this.duckingGain = this.ctx.createGain();
          this.sfxMasterGain = this.ctx.createGain();

          // Connect: musicMasterGain -> duckingGain -> destination
          this.musicMasterGain.connect(this.duckingGain);
          this.duckingGain.connect(this.ctx.destination);

          // Connect: sfxMasterGain -> destination
          this.sfxMasterGain.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('[AudioEngine initCtx caught silently]:', e);
    }
  }

  // Automatic music ducking when narrator speaks
  public duckMusic(durationMs: number = 2200) {
    try {
      if (!this.ctx || !this.duckingGain) return;
      const now = this.ctx.currentTime;
      // Quickly reduce music gain to 0.35
      this.duckingGain.gain.cancelScheduledValues(now);
      this.duckingGain.gain.setValueAtTime(this.duckingGain.gain.value, now);
      this.duckingGain.gain.linearRampToValueAtTime(0.35, now + 0.1);

      // Restore back to 1.0 after speech
      const durationSec = durationMs / 1000;
      this.duckingGain.gain.linearRampToValueAtTime(1.0, now + durationSec);
    } catch (e) {
      console.warn('[AudioEngine duckMusic caught silently]:', e);
    }
  }

  // Helper to safely schedule, start and auto-disconnect ephemeral audio nodes
  private playSafeNode(
    osc: OscillatorNode,
    gain: GainNode,
    targetGain: GainNode,
    startTime: number,
    stopTime: number,
    filter?: BiquadFilterNode
  ) {
    try {
      if (filter) {
        osc.connect(filter);
        filter.connect(gain);
      } else {
        osc.connect(gain);
      }
      gain.connect(targetGain);

      const cleanup = () => {
        try {
          osc.disconnect();
          filter?.disconnect();
          gain.disconnect();
        } catch (_) {}
      };

      osc.onended = cleanup;
      // Backup timeout in case onended doesn't trigger
      const delayMs = Math.max(30, Math.ceil((stopTime - startTime) * 1000) + 120);
      setTimeout(cleanup, delayMs);

      osc.start(startTime);
      osc.stop(stopTime);
    } catch (err) {
      console.warn('[AudioEngine playSafeNode caught silently]:', err);
    }
  }

  // Play procedural SFX using Web Audio synth with immediate memory release
  public playSfx(
    type: 
      | 'switch' 
      | 'coin' 
      | 'pass'
      | 'combo' 
      | 'nearmiss' 
      | 'crash' 
      | 'click' 
      | 'record' 
      | 'diff_up' 
      | 'unlock'
      | 'powerup'
      | 'slowmo'
      | 'achievement'
      | 'intro_beep'
      | 'intro_glitch'
      | 'intro_impact'
      // 7 Novos Efeitos Sonoros Viciantes
      | 'frenzy'
      | 'gold_rush'
      | 'wall_shock'
      | 'nearmiss'
      | 'near_miss'
      | 'nearmiss_extreme'
      | 'high_score_live'
      | 'shield_shatter'
      | 'rematch'
      | 'victory',
    settings: GameSettings,
    comboCount: number = 0
  ) {
    if (!settings || (settings.sfxVolume ?? 1) <= 0) return;
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain) return;

    const now = this.ctx.currentTime;
    this.sfxMasterGain.gain.setValueAtTime(settings.sfxVolume ?? 1, now);
    const targetGain = this.sfxMasterGain;

    try {
      if (type === 'switch') {
        // Fast, punchy pitch pop for immediate tactile touch feedback
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.06);

        gain.gain.setValueAtTime(0.48, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        this.playSafeNode(osc, gain, targetGain, now, now + 0.06);
      } else if (type === 'coin') {
        // Crisp dual-tone arcade chime with pitch escalation based on combo
        const pitchMultiplier = 1 + Math.min(comboCount, 40) * 0.025;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        const gain2 = this.ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';

        const baseFreq1 = 987.77 * pitchMultiplier;
        const baseFreq2 = 1318.51 * pitchMultiplier;

        osc1.frequency.setValueAtTime(baseFreq1, now);
        osc1.frequency.setValueAtTime(baseFreq2, now + 0.05);

        osc2.frequency.setValueAtTime(baseFreq2, now);
        osc2.frequency.setValueAtTime(1758.38 * pitchMultiplier, now + 0.05);

        gain1.gain.setValueAtTime(0.4, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        gain2.gain.setValueAtTime(0.3, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        this.playSafeNode(osc1, gain1, targetGain, now, now + 0.16);
        this.playSafeNode(osc2, gain2, targetGain, now, now + 0.16);
      } else if (type === 'pass') {
        // Subtle laser tick for passing obstacle
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        this.playSafeNode(osc, gain, targetGain, now, now + 0.05);
      } else if (type === 'combo') {
        // Escalating arpeggio chime
        const baseMult = 1 + Math.min(comboCount, 30) * 0.015;
        const freqs = [523.25 * baseMult, 659.25 * baseMult, 783.99 * baseMult, 1046.5 * baseMult];
        freqs.forEach((f, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.04);
          gain.gain.setValueAtTime(0.3, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.12);

          this.playSafeNode(osc, gain, targetGain, now + idx * 0.04, now + idx * 0.04 + 0.12);
        });
      } else if (type === 'nearmiss') {
        // Quick synth pulse
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(550, now + 0.09);

        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        this.playSafeNode(osc, gain, targetGain, now, now + 0.1);
      } else if (type === 'diff_up') {
        // Rising siren ping
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        this.playSafeNode(osc, gain, targetGain, now, now + 0.25);
      } else if (type === 'crash') {
        // Cinematic impact sub-bass drop + synth crash
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);

        gain.gain.setValueAtTime(0.85, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        this.playSafeNode(osc, gain, targetGain, now, now + 0.5);

        // Deep sub-bass rumble
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(100, now);
        subOsc.frequency.exponentialRampToValueAtTime(15, now + 0.55);

        subGain.gain.setValueAtTime(0.9, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        this.playSafeNode(subOsc, subGain, targetGain, now, now + 0.55);
      } else if (type === 'click') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(720, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.035);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        this.playSafeNode(osc, gain, targetGain, now, now + 0.035);
      } else if (type === 'unlock') {
        // Item/Shop purchase fanfare
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((f, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + idx * 0.05);
          gain.gain.setValueAtTime(0.38, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);

          this.playSafeNode(osc, gain, targetGain, now + idx * 0.05, now + idx * 0.05 + 0.22);
        });
      } else if (type === 'powerup') {
        // High-tech sci-fi powerup / upgrade activation sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1480, now + 0.18);
        gain.gain.setValueAtTime(0.42, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        this.playSafeNode(osc, gain, targetGain, now, now + 0.22);
      } else if (type === 'slowmo') {
        // Deep sci-fi bullet-time / time-warp resonance sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

        this.playSafeNode(osc, gain, targetGain, now, now + 0.38, filter);

        // Sub-harmonic shimmer
        const shimmer = this.ctx.createOscillator();
        const shimGain = this.ctx.createGain();
        shimmer.type = 'triangle';
        shimmer.frequency.setValueAtTime(440, now);
        shimmer.frequency.exponentialRampToValueAtTime(110, now + 0.3);
        shimGain.gain.setValueAtTime(0.3, now);
        shimGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        this.playSafeNode(shimmer, shimGain, targetGain, now, now + 0.32);
      } else if (type === 'record') {
        // Victory fanfare
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        notes.forEach((f, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + idx * 0.08);
          gain.gain.setValueAtTime(0.35, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

          this.playSafeNode(osc, gain, targetGain, now + idx * 0.08, now + idx * 0.08 + 0.3);
        });
      } else if (type === 'achievement') {
        // Triumphant multi-chord brass / chime arpeggio for in-game achievement unlock
        const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
        chords.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.42, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.45);

          this.playSafeNode(osc, gain, targetGain, now + idx * 0.06, now + idx * 0.06 + 0.45);
        });
      } else if (type === 'victory') {
        // Supreme 7000-combo grand victory fanfare & cosmic synth chorus
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          gain.gain.setValueAtTime(0.45, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.6);

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(3200, now + idx * 0.09);
          filter.frequency.exponentialRampToValueAtTime(800, now + idx * 0.09 + 0.6);

          this.playSafeNode(osc, gain, targetGain, now + idx * 0.09, now + idx * 0.09 + 0.6, filter);
        });
      } else if (type === 'intro_beep') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        this.playSafeNode(osc, gain, targetGain, now, now + 0.15);
      } else if (type === 'intro_glitch') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.setValueAtTime(600, now + 0.04);
        osc.frequency.setValueAtTime(200, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        this.playSafeNode(osc, gain, targetGain, now, now + 0.12);
      } else if (type === 'intro_impact') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        this.playSafeNode(osc, gain, targetGain, now, now + 0.35);
      } else if (type === 'frenzy') {
        // High-energy ascending arpeggio sweep + bass drop
        const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
        notes.forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.045);
          gain.gain.setValueAtTime(0.2, now + i * 0.045);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.18);

          this.playSafeNode(osc, gain, targetGain, now + i * 0.045, now + i * 0.045 + 0.18);
        });
      } else if (type === 'gold_rush') {
        // Sparkling cascade chime
        const freqs = [1046.50, 1318.51, 1567.98, 2093.00, 2637.02];
        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          gain.gain.setValueAtTime(0.3, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25);

          this.playSafeNode(osc, gain, targetGain, now + idx * 0.04, now + idx * 0.04 + 0.25);
        });
      } else if (type === 'wall_shock') {
        // Tactile punchy low thump + resonant ring
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(160, now);
        osc1.frequency.exponentialRampToValueAtTime(45, now + 0.08);
        gain1.gain.setValueAtTime(0.35, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        this.playSafeNode(osc1, gain1, targetGain, now, now + 0.08);
      } else if (type === 'nearmiss_extreme' || type === 'near_miss') {
        // Electric spark sizzle and crisp rewarding chime
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.linearRampToValueAtTime(2800, now + 0.08);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        this.playSafeNode(osc, gain, targetGain, now, now + 0.12);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2093.0, now + 0.02); // C7 note
        osc2.frequency.exponentialRampToValueAtTime(3135.96, now + 0.14); // G7 note
        gain2.gain.setValueAtTime(0.25, now + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        this.playSafeNode(osc2, gain2, targetGain, now + 0.02, now + 0.16);
      } else if (type === 'high_score_live') {
        // Triumphant live high-score horn fanfare
        const chord = [523.25, 659.25, 783.99, 1046.50];
        chord.forEach((f, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.06);
          gain.gain.setValueAtTime(0.35, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.45);

          this.playSafeNode(osc, gain, targetGain, now + i * 0.06, now + i * 0.06 + 0.45);
        });
      } else if (type === 'shield_shatter') {
        // Shattering crystal explosion
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        this.playSafeNode(osc, gain, targetGain, now, now + 0.22);
      } else if (type === 'rematch') {
        // High energy double rev-up beat
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.exponentialRampToValueAtTime(440, now + 0.08);
        gain1.gain.setValueAtTime(0.4, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        this.playSafeNode(osc1, gain1, targetGain, now, now + 0.09);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(440, now + 0.09);
        osc2.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain2.gain.setValueAtTime(0.45, now + 0.09);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

        this.playSafeNode(osc2, gain2, targetGain, now + 0.09, now + 0.20);
      }
    } catch (e) {
      console.warn('SFX playback error caught silently:', e);
    }
  }

  // Update combo count during gameplay to dynamically boost music intensity
  public setCombo(combo: number) {
    this.currentCombo = combo;
  }

  // Escalating suspense audio chime for dynamic combo multiplier increase (2x -> 3x -> 5x...)
  public playComboMultiplierSound(multiplier: number, settings?: GameSettings) {
    try {
      if (settings && (settings.sfxVolume ?? 1) <= 0) return;
      this.initCtx();
      if (!this.ctx || !this.sfxMasterGain) return;
      const targetGain = this.sfxMasterGain;
      const now = this.ctx.currentTime;

      // Base frequency scales upward with multiplier
      const baseFreq = 440 * Math.pow(1.18, Math.min(12, multiplier));
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.08, now + idx * 0.05 + 0.16);

        const volume = (settings?.sfxVolume ?? 1) * 0.38;
        gain.gain.setValueAtTime(volume, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);

        this.playSafeNode(osc, gain, targetGain, now + idx * 0.05, now + idx * 0.05 + 0.18);
      });
    } catch (e) {
      console.warn('Combo multiplier sound caught silently:', e);
    }
  }

  // Background procedural addicting arcade synth loop
  public startMusic(mode: MusicMode, settings: GameSettings) {
    try {
      if (!settings || (settings.musicVolume ?? 1) <= 0) {
        this.stopMusic();
        return;
      }

      this.initCtx();
      if (!this.ctx || !this.musicMasterGain) return;

      // Set volume level
      this.musicMasterGain.gain.setValueAtTime(settings.musicVolume ?? 1, this.ctx.currentTime);

      // If mode hasn't changed and music is already playing, keep loop running smoothly!
      if (this.isMusicPlaying && this.currentMusicMode === mode) {
        return;
      }

      this.stopMusic();
      this.isMusicPlaying = true;
      this.currentMusicMode = mode;

      const bpm = mode === 'gameplay' ? 144 : 96;
      const stepTime = 60 / bpm / 4; // 16th note timing
      let step = 0;

      // Menu: Deep mysterious haunting A minor chords & drone
      const menuBass = [55.0, 55.0, 55.0, 55.0, 65.41, 65.41, 58.27, 55.0];
      const menuEerieArp = [220, 261.63, 311.13, 440, 311.13, 261.63, 207.65, 220];

      // Gameplay: Intense, hair-raising driving arcade synthwave
      const gameplayBass = [
        87.31, 87.31, 110.0, 87.31, 130.81, 110.0, 98.0, 87.31,
        87.31, 110.0, 130.81, 146.83, 164.81, 146.83, 130.81, 98.0
      ];

      // Spine-tingling, intense thriller lead hook
      const thrillArp = [
        440.0, 466.16, 523.25, 659.25, 880.0, 932.33, 880.0, 659.25,
        523.25, 466.16, 523.25, 659.25, 880.0, 1046.5, 932.33, 880.0
      ];

      this.musicTimer = window.setInterval(() => {
        try {
          if (!this.ctx || !this.isMusicPlaying || !this.musicMasterGain) return;
          if (!settings || (settings.musicVolume ?? 1) <= 0) return;

          const now = this.ctx.currentTime;
          if (mode === 'menu') {
            // --- MENU MODE: Dark, Mysterious, Spine-Chilling Ambience ---
            const bassFreq = menuBass[Math.floor(step / 2) % menuBass.length];

            // 1. Deep Sub Drone
            if (step % 4 === 0) {
              const droneOsc = this.ctx.createOscillator();
              const droneGain = this.ctx.createGain();
              droneOsc.type = 'sawtooth';
              droneOsc.frequency.setValueAtTime(bassFreq, now);

              const filter = this.ctx.createBiquadFilter();
              filter.type = 'lowpass';
              filter.frequency.setValueAtTime(180, now);

              droneGain.gain.setValueAtTime(0.06, now);
              droneGain.gain.exponentialRampToValueAtTime(0.001, now + stepTime * 3.8);

              this.playSafeNode(droneOsc, droneGain, this.musicMasterGain, now, now + stepTime * 3.8, filter);
            }

            // 2. Haunting Eerie Ambient Arp
            if (step % 2 === 0) {
              const arpOsc = this.ctx.createOscillator();
              const arpGain = this.ctx.createGain();
              arpOsc.type = 'sine';

              const arpFreq = menuEerieArp[(Math.floor(step / 2)) % menuEerieArp.length];
              arpOsc.frequency.setValueAtTime(arpFreq, now);

              arpGain.gain.setValueAtTime(0.03, now);
              arpGain.gain.exponentialRampToValueAtTime(0.0005, now + stepTime * 2.5);

              this.playSafeNode(arpOsc, arpGain, this.musicMasterGain, now, now + stepTime * 2.5);
            }
          } else {
            // --- GAMEPLAY MODE: Intense, Hair-Raising Arcade Thriller ---
            const bassFreq = gameplayBass[step % gameplayBass.length];

            // 1. Punchy Sub-Kick (Driving 4-on-the-floor beat)
            if (step % 4 === 0) {
              const kickOsc = this.ctx.createOscillator();
              const kickGain = this.ctx.createGain();
              kickOsc.type = 'sine';
              kickOsc.frequency.setValueAtTime(180, now);
              kickOsc.frequency.exponentialRampToValueAtTime(28, now + 0.1);

              kickGain.gain.setValueAtTime(0.28, now);
              kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

              this.playSafeNode(kickOsc, kickGain, this.musicMasterGain, now, now + 0.11);
            }

            // 2. Crisp Snare / Tension Clap (Beats 4, 12 + thrilling fills)
            if (step % 8 === 4 || step % 16 === 14) {
              const snareOsc = this.ctx.createOscillator();
              const snareGain = this.ctx.createGain();
              snareOsc.type = 'triangle';
              snareOsc.frequency.setValueAtTime(320, now);
              snareOsc.frequency.exponentialRampToValueAtTime(90, now + 0.12);

              snareGain.gain.setValueAtTime(0.18, now);
              snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

              this.playSafeNode(snareOsc, snareGain, this.musicMasterGain, now, now + 0.12);
            }

            // 3. Driving Thriller Bass synth
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = 'sawtooth';
            bassOsc.frequency.setValueAtTime(bassFreq, now);

            const comboBoost = this.currentCombo >= 10 ? 0.04 : (this.currentCombo >= 5 ? 0.02 : 0);
            bassGain.gain.setValueAtTime(0.10 + comboBoost, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + stepTime * 0.9);

            this.playSafeNode(bassOsc, bassGain, this.musicMasterGain, now, now + stepTime * 0.9);

            // 4. Intense, Chilling Lead Hook (16th note thriller hook)
            if (step % 2 === 0) {
              const leadOsc = this.ctx.createOscillator();
              const leadGain = this.ctx.createGain();
              leadOsc.type = this.currentCombo >= 10 ? 'sawtooth' : 'triangle';

              const rawFreq = thrillArp[(Math.floor(step / 2)) % thrillArp.length];
              const pitchShift = this.currentCombo >= 20 ? 1.5 : (this.currentCombo >= 10 ? 1.25 : 1.0);
              leadOsc.frequency.setValueAtTime(rawFreq * pitchShift, now);

              leadGain.gain.setValueAtTime(0.06 + comboBoost * 0.5, now);
              leadGain.gain.exponentialRampToValueAtTime(0.001, now + stepTime * 1.5);

              this.playSafeNode(leadOsc, leadGain, this.musicMasterGain, now, now + stepTime * 1.5);
            }

            // 5. Adrenaline Sizzle Hi-Hats (16th notes)
            if (step % 2 === 1) {
              const hatOsc = this.ctx.createOscillator();
              const hatGain = this.ctx.createGain();
              hatOsc.type = 'square';
              hatOsc.frequency.setValueAtTime(5200, now);

              const hatVol = step % 4 === 2 ? 0.025 : 0.015;
              hatGain.gain.setValueAtTime(hatVol, now);
              hatGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

              this.playSafeNode(hatOsc, hatGain, this.musicMasterGain, now, now + 0.02);
            }
          }

          step++;
        } catch (e) {
          console.warn('Music synth step error caught silently:', e);
        }
      }, stepTime * 1000);
    } catch (err) {
      console.warn('[AudioEngine startMusic caught silently]:', err);
    }
  }

  public stopMusic() {
    try {
      this.isMusicPlaying = false;
      this.currentMusicMode = null;
      if (this.musicTimer !== null) {
        clearInterval(this.musicTimer);
        this.musicTimer = null;
      }
    } catch (e) {
      console.warn('[AudioEngine stopMusic caught silently]:', e);
    }
  }

  private currentPriority: number = 0;

  // Fast Arcade Commentator using narratorService & music ducking
  public speakComment(
    text: string,
    settings: GameSettings,
    priorityLevel: number = 1
  ) {
    try {
      if (!settings?.narratorEnabled || (settings?.narratorVolume ?? 0) <= 0) return;
      this.duckMusic(1200);
      narratorService.speakRaw(text, settings, priorityLevel);
    } catch (e) {
      console.warn('[AudioEngine speakComment caught silently]:', e);
    }
  }

  // Fast Arcade Narrator using NarratorService
  public speakIntroStep(step: 1 | 2 | 3 | 4, settings: GameSettings) {
    try {
      if (!settings?.narratorEnabled || (settings?.narratorVolume ?? 0) <= 0) return;
      this.duckMusic(1000);
      narratorService.speakIntroStep(step, settings);
    } catch (e) {
      console.warn('[AudioEngine speakIntroStep caught silently]:', e);
    }
  }

  public speakNarrator(
    category: NarratorEventCategory,
    settings: GameSettings
  ) {
    try {
      if (!settings?.narratorEnabled || (settings?.narratorVolume ?? 0) <= 0) return;
      this.duckMusic(1200);
      narratorService.speak(category, settings);
    } catch (e) {
      console.warn('[AudioEngine speakNarrator caught silently]:', e);
    }
  }

  // Encorajamentos específicos para marcos de combo (ex: 'Que sequência absurda!', 'Está imparável!')
  public speakComboMilestone(combo: number, settings: GameSettings, playerName?: string) {
    try {
      if (!settings?.narratorEnabled || (settings?.narratorVolume ?? 0) <= 0) return;
      const name = playerName || settings.playerName || 'Jogador';
      const lang = settings.language || 'pt';

      const ptComboPhrases: Record<number, string[]> = {
        3: [
          '3 seguidas! Boa, {name}!',
          '3 desvios perfeitos!',
          'No compasso certo, continua!',
        ],
        5: [
          'Que sequência absurda!',
          '5 seguidas! Você tá voando baixo!',
          '5 seguidas! Incrível, {name}!',
          'Ritmo impecável!',
        ],
        10: [
          'Está imparável!',
          'Está imparável, {name}!',
          'Que sequência absurda!',
          '10 seguidas! Modo demônio ativado!',
          'Reflexos sobre-humanos!',
          '10 desvios seguidos! Sensacional!',
        ],
        15: [
          'Está imparável!',
          '15 seguidas! Que ritmo monstruoso!',
          'Reflexos de aço puro, {name}!',
          'Que sequência absurda!',
        ],
        20: [
          'Está imparável, {name}!',
          '20 seguidas! Ninguém consegue te parar!',
          'Que sequência absurda!',
          'Reflexos cirúrgicos! Você é uma lenda!',
        ],
        25: [
          'Que sequência absurda!',
          '25 desvios sem errar! Tá imparável!',
          'Domínio total do abismo!',
        ],
        30: [
          'Está imparável, {name}!',
          '30 seguidas! Isso é arte pura!',
          'Nível mestre supremo!',
        ],
        50: [
          'INACREDITÁVEL! 50 COMBOS SEGUIDOS!',
          'ESTÁ IMPARÁVEL, {name}! LENDA VIVA!',
          'QUE SEQUÊNCIA ABSURDA!',
        ],
        100: [
          '100 COMBOS! VOCÊ É UM DEUS DA ESQUIVA!',
          'DOMÍNIO ABSOLUTO DO ESPAÇO-TEMPO, {name}!',
        ],
      };

      let phrase = '';
      if (lang === 'pt') {
        const candidates = ptComboPhrases[combo] || [
          'Que sequência absurda!',
          'Está imparável, {name}!',
          'Reflexos sobrenaturais!',
          'Você tá imparável!',
          'Que ritmo insano!',
        ];
        phrase = candidates[Math.floor(Math.random() * candidates.length)].replace('{name}', name);
      } else {
        if (combo <= 5) phrase = `Amazing ${combo} streak, ${name}!`;
        else if (combo <= 10) phrase = `You are unstoppable, ${name}! What an absurd streak!`;
        else phrase = `Insane ${combo} combo! Absolutely unstoppable!`;
      }

      if (phrase) {
        this.duckMusic(1400);
        narratorService.speakRaw(phrase, settings, 2);
      }
    } catch (e) {
      console.warn('[AudioEngine speakComboMilestone caught silently]:', e);
    }
  }

  public speakEncouragement(type: 'combo' | 'speed' | 'milestone' | 'nearmiss', settings: GameSettings) {
    try {
      if (!settings?.narratorEnabled || (settings?.narratorVolume ?? 0) <= 0) return;
      const name = settings.playerName || 'Jogador';
      const lang = settings.language || 'pt';

      if (lang === 'pt') {
        const pool = type === 'combo'
          ? ['Que sequência absurda!', 'Está imparável!', 'Está imparável, {name}!', 'Reflexos de aço!']
          : type === 'speed'
            ? ['Velocidade máxima!', 'Segura a aceleração!', 'Você tá voando!']
            : type === 'nearmiss'
              ? ['Passou raspando!', 'Por um fio!', 'Que reflexo absurdo!']
              : ['Excelente jogada, {name}!', 'Continua no foco!'];
        const chosen = pool[Math.floor(Math.random() * pool.length)].replace('{name}', name);
        this.duckMusic(1200);
        narratorService.speakRaw(chosen, settings, 2);
      } else {
        this.speakNarrator(type === 'combo' ? 'comboMilestone' : 'scoreMilestone', settings);
      }
    } catch (e) {
      console.warn('[AudioEngine speakEncouragement caught silently]:', e);
    }
  }

  public stopNarrator() {
    try {
      narratorService.stop();
    } catch (e) {
      console.warn('[AudioEngine stopNarrator caught silently]:', e);
    }
  }

  // --- Dynamic Ambient Sound System (Wind & Obstacle Proximity Hum) ---
  public startAmbientSound(settings: GameSettings) {
    if (!settings || (settings.sfxVolume ?? 1) <= 0) {
      this.stopAmbientSound();
      return;
    }

    this.initCtx();
    if (!this.ctx) return;
    if (this.isAmbientPlaying) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Wind/Speed Rumble Node
      this.ambientWindOsc = this.ctx.createOscillator();
      this.ambientWindFilter = this.ctx.createBiquadFilter();
      this.ambientWindGain = this.ctx.createGain();

      this.ambientWindOsc.type = 'sawtooth';
      this.ambientWindOsc.frequency.setValueAtTime(60, now);

      this.ambientWindFilter.type = 'lowpass';
      this.ambientWindFilter.frequency.setValueAtTime(120, now);

      const baseVolume = (settings.sfxVolume ?? 1) * 0.08;
      this.ambientWindGain.gain.setValueAtTime(0.001, now);
      this.ambientWindGain.gain.linearRampToValueAtTime(baseVolume, now + 0.3);

      this.ambientWindOsc.connect(this.ambientWindFilter);
      this.ambientWindFilter.connect(this.ambientWindGain);
      this.ambientWindGain.connect(this.ctx.destination);

      this.ambientWindOsc.start(now);

      // 2. Obstacle Proximity Buzzing Node
      this.obstacleHumOsc = this.ctx.createOscillator();
      this.obstacleHumFilter = this.ctx.createBiquadFilter();
      this.obstacleHumGain = this.ctx.createGain();

      this.obstacleHumOsc.type = 'triangle';
      this.obstacleHumOsc.frequency.setValueAtTime(140, now);

      this.obstacleHumFilter.type = 'bandpass';
      this.obstacleHumFilter.frequency.setValueAtTime(280, now);
      this.obstacleHumFilter.Q.setValueAtTime(3.0, now);

      this.obstacleHumGain.gain.setValueAtTime(0.0001, now);

      this.obstacleHumOsc.connect(this.obstacleHumFilter);
      this.obstacleHumFilter.connect(this.obstacleHumGain);
      this.obstacleHumGain.connect(this.ctx.destination);

      this.obstacleHumOsc.start(now);

      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('Ambient sound start error caught silently:', e);
    }
  }

  public updateAmbientSound(
    speed: number,
    minSpeed: number = 280,
    maxSpeed: number = 730,
    nearestObstacleDistanceY: number | null = null,
    settings: GameSettings = {} as GameSettings
  ) {
    try {
      if (!settings || (settings.sfxVolume ?? 1) <= 0) {
        this.stopAmbientSound();
        return;
      }

      if (!this.isAmbientPlaying) {
        this.startAmbientSound(settings);
      }

      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const sfxVol = settings.sfxVolume ?? 1;

      // 1. Dynamic Wind Updates based on Speed
      const speedRatio = Math.max(0, Math.min(1, (speed - minSpeed) / (maxSpeed - minSpeed)));

      if (this.ambientWindFilter && this.ambientWindGain && this.ambientWindOsc) {
        const windCutoff = 120 + speedRatio * 680; // Cutoff opens from 120Hz up to 800Hz as speed rises
        const windPitch = 55 + speedRatio * 48; // Pitch rises from 55Hz to 103Hz
        const windGainVal = (0.05 + speedRatio * 0.16) * sfxVol;

        this.ambientWindFilter.frequency.setTargetAtTime(windCutoff, now, 0.1);
        this.ambientWindOsc.frequency.setTargetAtTime(windPitch, now, 0.1);
        this.ambientWindGain.gain.setTargetAtTime(windGainVal, now, 0.1);
      }

      // 2. Dynamic Obstacle Proximity Hum ("zumbidos de obstáculos")
      if (this.obstacleHumGain && this.obstacleHumOsc && this.obstacleHumFilter) {
        if (nearestObstacleDistanceY !== null && nearestObstacleDistanceY >= 0 && nearestObstacleDistanceY < 180) {
          const proximity = 1 - (nearestObstacleDistanceY / 180); // 0 at 180px away, 1 at 0px away
          const humGainVal = Math.pow(proximity, 1.6) * 0.18 * sfxVol;
          const humPitch = 140 + proximity * 250 + speedRatio * 70; // Whooshes up as obstacle nears character
          const humFilterFreq = 260 + proximity * 520;

          this.obstacleHumGain.gain.setTargetAtTime(humGainVal, now, 0.05);
          this.obstacleHumOsc.frequency.setTargetAtTime(humPitch, now, 0.05);
          this.obstacleHumFilter.frequency.setTargetAtTime(humFilterFreq, now, 0.05);
        } else {
          this.obstacleHumGain.gain.setTargetAtTime(0.0001, now, 0.1);
        }
      }
    } catch (e) {
      console.warn('[AudioEngine updateAmbientSound caught silently]:', e);
    }
  }

  public stopAmbientSound() {
    this.isAmbientPlaying = false;
    try {
      if (this.ctx) {
        const now = this.ctx.currentTime;
        if (this.ambientWindGain) {
          try {
            this.ambientWindGain.gain.setValueAtTime(this.ambientWindGain.gain.value, now);
            this.ambientWindGain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
          } catch {}
        }
        if (this.obstacleHumGain) {
          try {
            this.obstacleHumGain.gain.setValueAtTime(this.obstacleHumGain.gain.value, now);
            this.obstacleHumGain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
          } catch {}
        }
        setTimeout(() => {
          try {
            if (this.ambientWindOsc) {
              this.ambientWindOsc.stop();
              this.ambientWindOsc.disconnect();
              this.ambientWindOsc = null;
            }
            if (this.obstacleHumOsc) {
              this.obstacleHumOsc.stop();
              this.obstacleHumOsc.disconnect();
              this.obstacleHumOsc = null;
            }
            this.ambientWindGain = null;
            this.ambientWindFilter = null;
            this.obstacleHumGain = null;
            this.obstacleHumFilter = null;
          } catch {
            // Cleanup error caught silently
          }
        }, 180);
      }
    } catch (e) {
      console.warn('[AudioEngine stopAmbientSound caught silently]:', e);
    }
  }
}

export const audio = new AudioEngine();
