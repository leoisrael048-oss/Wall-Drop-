import React, { useEffect, useRef, useState } from 'react';
import { 
  Character, 
  GameSkin, 
  GameTheme, 
  GameSettings, 
  CustomCharacterConfig, 
  CustomThemeConfig, 
  PlayerUpgrades 
} from '../types';
import { audio } from '../utils/audio';

interface CanvasGameProps {
  character: Character;
  skin?: GameSkin;
  theme?: GameTheme;
  customChar?: CustomCharacterConfig;
  customTheme?: CustomThemeConfig;
  upgrades?: PlayerUpgrades;
  settings: GameSettings;
  highScore?: number;
  onGameOver: (score: number, coins: number, maxCombo: number) => void;
  onVictory?: (score: number, coins: number, maxCombo: number) => void;
  onScoreUpdate: (score: number, coins: number, combo: number) => void;
  onFeedback?: (text: string) => void;
  isPaused: boolean;
  triggerSecondChanceResume?: number;
}

type ObstaclePattern = 
  | 'left' 
  | 'right' 
  | 'center' 
  | 'zigzag' 
  | 'diagonal_left' 
  | 'diagonal_right' 
  | 'arc_swoop' 
  | 'spinner' 
  | 'wave_drift';

interface EmojiObstacle {
  id: number;
  pattern: ObstaclePattern;
  emoji: string;
  label: string;
  y: number;
  xOffset: number;
  baseX: number;
  radius: number;
  passed: boolean;
  nearMissChecked: boolean;
  pulsePhase: number;
  rotationAngle: number;
  wobbleSpeed: number;
  spinSpeed: number;
  arcDirection: number;
}

interface CollectibleCoin {
  id: number;
  active: boolean;
  x: number;
  y: number;
  radius: number;
  side: 'left' | 'right' | 'center';
  spinPhase: number;
  collected: boolean;
  collectAnim: number;
}

interface FloatingTextPoolItem {
  active: boolean;
  text: string;
  x: number;
  y: number;
  alpha: number;
  vy: number;
  color: string;
}

const EMOJI_MEME_LIST = [
  { emoji: '📞', label: 'Chamada da Mãe' },
  { emoji: '🔋', label: 'Bateria 1%' },
  { emoji: '💳', label: 'Fatura do Cartão' },
  { emoji: '🤡', label: 'Mensagem do Ex' },
  { emoji: '🚨', label: 'Trabalho' },
  { emoji: '🧾', label: 'Boleto Vencido' },
  { emoji: '💸', label: 'Pix Errado' },
  { emoji: '⏰', label: 'Alarme 06:00' },
  { emoji: '📶', label: 'Wi-Fi Caiu' },
  { emoji: '☕', label: 'Acabou o Café' },
  { emoji: '💻', label: 'Update Windows' },
  { emoji: '📦', label: 'Entrega Atrasada' },
  { emoji: '🛞', label: 'Pneu Furado' },
  { emoji: '👀', label: 'Visto e Ignorado' },
  { emoji: '💣', label: 'Taxa Surpresa' },
  { emoji: '🔥', label: 'Bug em Produção' },
  { emoji: '😱', label: 'Zero na Prova' },
];

const TIER_PALETTES = [
  { name: 'NORMAL', wallGlow: '#06b6d4', obstacleColor: '#f43f5e', accentBg: '#090d16', tagColor: '#f43f5e' },
  { name: 'TURBO (+15%)', wallGlow: '#eab308', obstacleColor: '#f59e0b', accentBg: '#171204', tagColor: '#f59e0b' },
  { name: 'HIPER (+30%)', wallGlow: '#ec4899', obstacleColor: '#f43f5e', accentBg: '#180410', tagColor: '#ec4899' },
  { name: 'ULTRA (+45%)', wallGlow: '#a855f7', obstacleColor: '#c084fc', accentBg: '#12041d', tagColor: '#a855f7' },
  { name: 'INSANO (+60%)', wallGlow: '#ef4444', obstacleColor: '#ff2d55', accentBg: '#1c0404', tagColor: '#ef4444' },
  { name: 'OVERCLOCK (+75%)', wallGlow: '#00f0ff', obstacleColor: '#39ff14', accentBg: '#02181a', tagColor: '#00f0ff' },
];

// Trava Rígida Anti-Crash & Zero GC: Limites estritos
const MAX_OBSTACLES = 5;
const COIN_POOL_SIZE = 5;
const FLOATING_POOL_SIZE = 6;
const GLOBAL_SPEED_FACTOR = 2.0; // Multiplicador de velocidade global 2x
const BASE_SPEED = 230; // Velocidade base calculada para atingir 460-500 px/s com LERP suave
const MAX_SPEED_CAP = 500; // Teto Máximo Absoluto para Velocidade (500 px/s)
const MAX_COMBO_CAP = 50; // Teto Máximo Absoluto para Combo (50x)
const BASE_SPACING = 310;

export const CanvasGame: React.FC<CanvasGameProps> = ({
  character,
  skin,
  theme,
  customChar,
  customTheme,
  upgrades,
  settings,
  highScore = 0,
  onGameOver,
  onVictory,
  onScoreUpdate,
  onFeedback,
  isPaused,
  triggerSecondChanceResume,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasTapped, setHasTapped] = useState(false);

  // Fallback theme resolution
  const baseTheme = theme || {
    id: 'neon',
    name: 'Neon',
    desc: 'Neon',
    price: 0,
    bgGradient: skin?.bgGradient || ['#020617', '#0f172a'],
    wallColor: skin?.wallColor || '#1e293b',
    wallGlow: skin?.glowColor || '#06b6d4',
    obstacleColor: skin?.obstacleColor || '#f43f5e',
  };

  const activeVisualTheme = customTheme?.enabled
    ? {
        id: 'custom_theme',
        name: 'Custom Abyss',
        desc: 'Custom Theme',
        price: 0,
        bgGradient: customTheme.bgGradient,
        wallColor: customTheme.wallColor,
        wallGlow: customTheme.wallGlow,
        obstacleColor: customTheme.obstacleColor,
      }
    : baseTheme;

  const activeCharColors = customChar?.enabled
    ? {
        primaryColor: customChar.primaryColor,
        glowColor: customChar.glowColor,
        accentColor: customChar.accentColor,
        eyeColor: customChar.eyeColor,
      }
    : {
        primaryColor: character.primaryColor,
        glowColor: character.glowColor,
        accentColor: character.accentColor,
        eyeColor: '#ffffff',
      };

  // Mutable Props Ref para desacoplar re-renders do loop do Canvas
  const propsRef = useRef({
    settings,
    character,
    skin,
    onGameOver,
    onVictory,
    onScoreUpdate,
    onFeedback,
    isPaused,
    activeVisualTheme,
    activeCharColors,
    hasTapped,
  });

  useEffect(() => {
    propsRef.current = {
      settings,
      character,
      skin,
      onGameOver,
      onVictory,
      onScoreUpdate,
      onFeedback,
      isPaused,
      activeVisualTheme,
      activeCharColors,
      hasTapped,
    };
  });

  // State Ref - Zero alocações dinâmicas durante o loop de jogo (Pool Fixo de 5 Obstáculos)
  const stateRef = useRef({
    score: 0,
    coins: 0,
    combo: 0,
    maxCombo: 0,
    comboMultiplier: 1,
    comboTimer: 0,
    multiplierPulse: 1.0,
    charRotation: 0,
    currentSide: 'left' as 'left' | 'right',
    currentX: 0,
    targetX: 0,
    y: 0,
    radius: 22,
    wallWidth: 20,
    corridorLeft: 0,
    corridorRight: 0,
    squashX: 1,
    squashY: 1,
    eyeLookX: 0,
    eyeBlink: 0,
    isGameOver: false,
    isGameWon: false,
    hasStarted: false,
    currentSpeed: BASE_SPEED * GLOBAL_SPEED_FACTOR,
    speedMultiplier: GLOBAL_SPEED_FACTOR,
    currentTier: 0,
    zoomFactor: 1.0,
    intensityFlash: 0,
    hyperRushTimer: 0,
    hyperRushActive: false,
    shieldTimer: (upgrades?.shieldStart || 0) > 0 ? 3.0 : 0,
    shieldOrbPhase: 0,
    scarfWavePhase: 0,
    // Animação de Colisão Precisa e Nítida (Zero ShadowBlur / Zero GC)
    impactFlash: 0,
    impactRingRadius: 0,
    impactRingAlpha: 0,
    impactRing2Radius: 0,
    impactRing2Alpha: 0,
    impactX: 0,
    impactY: 0,
    charImpactScale: 1.0,
    charImpactAlpha: 1.0,
    // Dinamismo de Câmera Físico
    camTilt: 0,
    camTiltVel: 0,
    camOffsetX: 0,
    camOffsetY: 0,
    camTrauma: 0,
    camShakeX: 0,
    camShakeY: 0,
    currentCamZoom: 1.0,
    // Arrays Pré-Alocados (Trava de no máximo 5 obstáculos)
    obstacles: [] as EmojiObstacle[],
    coinsList: [] as CollectibleCoin[],
    floatingTexts: [] as FloatingTextPoolItem[],
    lastTime: 0,
    animFrameId: 0,
    memeIndex: 0,
    lastMilestoneReached: 0,
    lastCombo10Trigger: 0,
  });

  const snapshotRef = useRef<{
    score: number;
    coins: number;
    combo: number;
    maxCombo: number;
    currentSide: 'left' | 'right';
    currentX: number;
  } | null>(null);

  // Helper para spawnar Floating Text no pool pré-alocado (Zero .push/.splice)
  const spawnFloatingText = (text: string, x: number, y: number, color: string = '#facc15') => {
    const s = stateRef.current;
    let slot = s.floatingTexts.find((f) => !f.active);
    if (!slot) {
      slot = s.floatingTexts[0];
    }
    if (slot) {
      slot.active = true;
      slot.text = text;
      slot.x = x;
      slot.y = y;
      slot.alpha = 0.98;
      slot.vy = 75;
      slot.color = color;
    }
  };

  // Handle Revive / Second Chance
  useEffect(() => {
    if (triggerSecondChanceResume && triggerSecondChanceResume > 0 && snapshotRef.current) {
      const snap = snapshotRef.current;
      const s = stateRef.current;
      s.score = snap.score;
      s.coins = snap.coins;
      s.combo = Math.min(snap.combo, MAX_COMBO_CAP);
      s.maxCombo = Math.min(snap.maxCombo, MAX_COMBO_CAP);
      s.currentSide = snap.currentSide;
      s.currentX = snap.currentX;
      s.targetX = snap.currentX;
      s.shieldTimer = 3.0; // 3.0s invulnerabilidade
      s.isGameOver = false;
      s.charImpactScale = 1.0;
      s.charImpactAlpha = 1.0;
      s.impactFlash = 0;
      s.impactRingAlpha = 0;
      s.impactRing2Alpha = 0;
      s.lastTime = performance.now();

      try {
        audio.speakNarrator('secondChance', settings);
      } catch (e) {
        console.warn('[Audio catch on secondChance]:', e);
      }
      onFeedback?.('SEGUNDA CHANCE! 🛡️');
    }
  }, [triggerSecondChanceResume]);

  // Handle Instant Wall Switch (Mecânica Ágil de 1 Toque)
  const switchWall = () => {
    const s = stateRef.current;
    if (s.isGameOver || s.isGameWon) return;

    if (!hasTapped) {
      setHasTapped(true);
      s.hasStarted = true;
    }

    const previousSide = s.currentSide;

    // Instant snappy switch to opposite wall
    if (previousSide === 'left') {
      s.currentSide = 'right';
      s.targetX = s.corridorRight - s.radius;
      s.currentX = s.corridorRight - s.radius;
      s.eyeLookX = -1;
      s.camTiltVel = 1.35;
      s.camOffsetX = -9;
    } else {
      s.currentSide = 'left';
      s.targetX = s.corridorLeft + s.radius;
      s.currentX = s.corridorLeft + s.radius;
      s.eyeLookX = 1;
      s.camTiltVel = -1.35;
      s.camOffsetX = 9;
    }

    // Camera punch e micro-trauma no impacto de troca de parede
    s.camTrauma = Math.min(0.5, s.camTrauma + 0.2);
    s.zoomFactor = Math.min(1.12, s.zoomFactor + 0.03);

    // Snappy comic squash effect
    s.squashX = 0.55;
    s.squashY = 1.45;

    // Safe lightweight audio call
    try {
      audio.playSfx('switch', propsRef.current.settings);
    } catch (e) {
      console.warn('[Audio catch on switch]:', e);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'Enter') {
        e.preventDefault();
        switchWall();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasTapped]);

  // Main Canvas Lifecycle - Runs ONCE on mount and runs uninterrupted
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Prevenção Rígida Anti-Crash: Zero shadowBlur e zero shadowColor
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      const s = stateRef.current;
      s.wallWidth = Math.max(18, width * 0.06);
      s.corridorLeft = s.wallWidth;
      s.corridorRight = width - s.wallWidth;
      s.y = height * 0.32;
      s.currentX = s.currentSide === 'left' ? s.corridorLeft + s.radius : s.corridorRight - s.radius;
      s.targetX = s.currentX;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const s = stateRef.current;
    s.y = height * 0.32;
    s.currentX = s.currentSide === 'left' ? s.corridorLeft + s.radius : s.corridorRight - s.radius;
    s.targetX = s.currentX;
    s.lastTime = performance.now();
    s.currentSpeed = Math.min(MAX_SPEED_CAP, BASE_SPEED * GLOBAL_SPEED_FACTOR);
    s.speedMultiplier = GLOBAL_SPEED_FACTOR;
    s.combo = 0;
    s.maxCombo = 0;
    s.currentTier = 0;
    s.zoomFactor = 1.0;
    s.intensityFlash = 0;
    s.hyperRushTimer = 0;
    s.hyperRushActive = false;
    s.impactFlash = 0;
    s.impactRingRadius = 0;
    s.impactRingAlpha = 0;
    s.impactRing2Radius = 0;
    s.impactRing2Alpha = 0;
    s.charImpactScale = 1.0;
    s.charImpactAlpha = 1.0;

    // Sorteador de padrões de movimento dinâmicos e imprevisíveis
    const getRandomPattern = (index: number): ObstaclePattern => {
      if (index === 0) return 'left';
      if (index === 1) return 'right';
      const rand = Math.random();
      if (rand < 0.22) return 'left';
      if (rand < 0.44) return 'right';
      if (rand < 0.58) return 'center';
      if (rand < 0.70) return 'zigzag';
      if (rand < 0.80) return 'diagonal_left';
      if (rand < 0.88) return 'diagonal_right';
      if (rand < 0.94) return 'arc_swoop';
      return 'spinner';
    };

    // =========================================================================
    // INICIALIZAÇÃO & LIMPEZA DO POOL FIXO DE OBSTÁCULOS (Trava Rígida em 5 Objetos)
    // =========================================================================
    s.obstacles = [];
    for (let i = 0; i < MAX_OBSTACLES; i++) {
      if (s.obstacles.length >= 5) break; // Trava estrita de segurança
      const meme = EMOJI_MEME_LIST[i % EMOJI_MEME_LIST.length];
      const pattern = getRandomPattern(i);
      s.obstacles.push({
        id: i,
        pattern,
        emoji: meme.emoji,
        label: meme.label,
        y: height + 120 + i * BASE_SPACING,
        xOffset: 0,
        baseX: (s.corridorLeft + s.corridorRight) / 2,
        radius: 28,
        passed: false,
        nearMissChecked: false,
        pulsePhase: i * 1.4,
        rotationAngle: 0,
        wobbleSpeed: 2.5 + (i % 3) * 0.9,
        spinSpeed: pattern === 'spinner' ? 7.2 : (Math.random() - 0.5) * 1.8,
        arcDirection: i % 2 === 0 ? 1 : -1,
      });
    }
    s.memeIndex = MAX_OBSTACLES;

    // Inicialização do Pool Fixo de Moedas Colecionáveis
    s.coinsList = [];
    for (let i = 0; i < COIN_POOL_SIZE; i++) {
      const isLeft = i % 3 === 0;
      const isRight = i % 3 === 1;
      const side = isLeft ? 'left' : isRight ? 'right' : 'center';
      s.coinsList.push({
        id: i,
        active: true,
        side,
        x: isLeft 
          ? s.corridorLeft + s.radius + 8 
          : isRight 
            ? s.corridorRight - s.radius - 8 
            : (s.corridorLeft + s.corridorRight) / 2,
        y: height + 180 + i * (BASE_SPACING * 0.85),
        radius: 15,
        spinPhase: i * 1.1,
        collected: false,
        collectAnim: 0,
      });
    }

    // Floating text pool (Zero GC)
    s.floatingTexts = [];
    for (let i = 0; i < FLOATING_POOL_SIZE; i++) {
      s.floatingTexts.push({
        active: false,
        text: '',
        x: 0,
        y: 0,
        alpha: 0,
        vy: 75,
        color: '#facc15',
      });
    }

    // =========================================================================
    // GAME LOOP COM DELTA TIME TRAVADO & LERP PROGRESSIVO
    // =========================================================================
    const loop = (currentTime: number) => {
      if (!s.lastTime) s.lastTime = currentTime;
      const frameDt = (currentTime - s.lastTime) / 1000;
      s.lastTime = currentTime;

      const currentProps = propsRef.current;
      const currentTierIndex = Math.min(s.currentTier, TIER_PALETTES.length - 1);
      const activeTierPalette = TIER_PALETTES[currentTierIndex];

      // Prevenção Rígida Anti-Crash: Trava estrita de safeDt
      const safeDt = Math.min(frameDt, 0.016);

      // Trava de integridade de obstáculos em caso de anomalia (nunca excede 5)
      if (s.obstacles.length > 5) {
        s.obstacles = s.obstacles.slice(0, 5);
      }

      // =========================================================================
      // ANIMAÇÃO DE IMPACTO/COLISÃO EM CASO DE GAME OVER (Zero ShadowBlur / Vetores Nítidos)
      // =========================================================================
      if (s.isGameOver) {
        if (s.impactFlash > 0) {
          s.impactFlash = Math.max(0, s.impactFlash - safeDt * 3.5);
        }
        if (s.impactRingAlpha > 0) {
          s.impactRingRadius += safeDt * 350;
          s.impactRingAlpha = Math.max(0, s.impactRingAlpha - safeDt * 2.6);
        }
        if (s.impactRing2Alpha > 0) {
          s.impactRing2Radius += safeDt * 240;
          s.impactRing2Alpha = Math.max(0, s.impactRing2Alpha - safeDt * 2.3);
        }
        if (s.charImpactScale > 0.05) {
          s.charImpactScale = Math.max(0.05, s.charImpactScale - safeDt * 2.6);
          s.charImpactAlpha = Math.max(0, s.charImpactAlpha - safeDt * 2.4);
        }
        if (s.camTrauma > 0) {
          s.camTrauma = Math.max(0, s.camTrauma - safeDt * 2.8);
          const shakeIntensity = s.camTrauma * s.camTrauma;
          s.camShakeX = (Math.sin(currentTime * 0.07) * 15) * shakeIntensity;
          s.camShakeY = (Math.cos(currentTime * 0.075) * 13) * shakeIntensity;
        } else {
          s.camShakeX = 0;
          s.camShakeY = 0;
        }
      }

      if (!currentProps.isPaused && !s.isGameOver && !s.isGameWon) {
        // =========================================================================
        // 1. SISTEMA DE VELOCIDADE 2X COM LERP GRADUAL & TETO MÁXIMO DE 500 PX/S
        // =========================================================================
        const tier = Math.floor(s.score / 50);
        let targetMultiplier = Math.pow(1.10, Math.min(tier, 5)) * GLOBAL_SPEED_FACTOR;

        // Ativação do HYPER RUSH com teto de combo
        if (s.combo >= 10 && s.combo % 10 === 0 && s.combo !== s.lastCombo10Trigger) {
          s.lastCombo10Trigger = s.combo;
          s.hyperRushTimer = 3.2;
          s.hyperRushActive = true;
          s.zoomFactor = 1.12;
          s.intensityFlash = 1.0;

          try {
            audio.playSfx('diff_up', currentProps.settings);
            audio.playSfx('record', currentProps.settings);
          } catch (e) {
            console.warn('[Audio catch on hyperRush]:', e);
          }
          currentProps.onFeedback?.(`🔥 HYPER RUSH x${s.combo}! VELOCIDADE MÁXIMA! ⚡`);
        }

        // Manutenção do timer do Hyper Rush
        if (s.hyperRushTimer > 0) {
          s.hyperRushTimer = Math.max(0, s.hyperRushTimer - safeDt);
          s.hyperRushActive = true;
          targetMultiplier *= 1.45;
        } else {
          s.hyperRushActive = false;
        }

        // Rotação suave do personagem
        s.charRotation += safeDt * (4.2 + (s.currentSide === 'left' ? 1.5 : -1.5) * s.speedMultiplier);

        // =========================================================================
        // COMBO MULTIPLIER DINÂMICO COM TETO MÁXIMO (s.combo <= 50)
        // =========================================================================
        if (s.hasStarted && !s.isGameOver) {
          s.comboTimer += safeDt;
          if (s.comboTimer >= 4.0) {
            s.comboTimer = 0;
            s.comboMultiplier = Math.min(8, s.comboMultiplier + 1);
            s.multiplierPulse = 1.8;
            s.camTrauma = Math.min(0.4, s.camTrauma + 0.12);

            try {
              audio.playComboMultiplierSound(s.comboMultiplier, currentProps.settings);
            } catch (e) {
              console.warn('[Audio catch on comboMultiplier]:', e);
            }
            currentProps.onFeedback?.(`⚡ MULTIPLICADOR ${s.comboMultiplier}x ATIVO! 🔥`);
          }
        }

        // Suave recuperação do pulso do multiplicador
        if (s.multiplierPulse > 1.0) {
          s.multiplierPulse = Math.max(1.0, s.multiplierPulse - safeDt * 3.8);
        }

        // =========================================================================
        // ALGORITMO LERP (Linear Interpolation) DE VELOCIDADE SEM SALTOS BRUSCOS
        // =========================================================================
        const rawTargetSpeed = BASE_SPEED * targetMultiplier;
        const targetSpeed = Math.min(MAX_SPEED_CAP, rawTargetSpeed); // Teto rígido em 500 px/s

        const lerpFactor = 3.5;
        s.currentSpeed += (targetSpeed - s.currentSpeed) * Math.min(1.0, lerpFactor * safeDt);
        s.currentSpeed = Math.min(MAX_SPEED_CAP, Math.max(120, s.currentSpeed));
        s.speedMultiplier = s.currentSpeed / BASE_SPEED;
        s.currentTier = tier;

        // Disparo do Marco de 50 Pontos
        if (s.score > 0 && s.score % 50 === 0 && s.score !== s.lastMilestoneReached) {
          s.lastMilestoneReached = s.score;
          s.zoomFactor = 1.08;
          s.intensityFlash = 0.9;

          const tierInfo = TIER_PALETTES[Math.min(tier, TIER_PALETTES.length - 1)];
          try {
            audio.playSfx('diff_up', currentProps.settings);
          } catch (e) {
            console.warn('[Audio catch on diff_up]:', e);
          }
          currentProps.onFeedback?.(`⚡ ACELERAÇÃO! [NÍVEL ${tier + 1}: ${tierInfo.name}] 🔥`);
        }

        // Recuperação suave do efeito de Zoom Punch
        if (s.zoomFactor > 1.0) {
          s.zoomFactor += (1.0 - s.zoomFactor) * (6.0 * safeDt);
          if (s.zoomFactor < 1.002) s.zoomFactor = 1.0;
        }

        // Decay do flash de intensidade
        if (s.intensityFlash > 0) {
          s.intensityFlash = Math.max(0, s.intensityFlash - safeDt * 2.5);
        }

        const corridorCenterX = (s.corridorLeft + s.corridorRight) / 2;
        const corridorWidth = s.corridorRight - s.corridorLeft;

        // =========================================================================
        // DINAMISMO DA CÂMARA (Física de Mola, Inclinação e Trauma Leve)
        // =========================================================================
        const springK = 85;
        const damping = 12;
        const tiltForce = (0 - s.camTilt) * springK;
        s.camTiltVel += (tiltForce - s.camTiltVel * damping) * safeDt;
        s.camTilt += s.camTiltVel * safeDt;

        const targetCamOffsetX = ((s.currentX - corridorCenterX) / (corridorWidth * 0.5 || 1)) * 9;
        s.camOffsetX += (targetCamOffsetX - s.camOffsetX) * (9 * safeDt);

        const targetCamOffsetY = (s.speedMultiplier - GLOBAL_SPEED_FACTOR) * 6 + Math.sin(currentTime * 0.0035) * 2;
        s.camOffsetY += (targetCamOffsetY - s.camOffsetY) * (6 * safeDt);

        if (s.camTrauma > 0) {
          s.camTrauma = Math.max(0, s.camTrauma - safeDt * 2.6);
          const shakeIntensity = s.camTrauma * s.camTrauma;
          s.camShakeX = (Math.sin(currentTime * 0.06) * 11 + Math.cos(currentTime * 0.085) * 5) * shakeIntensity;
          s.camShakeY = (Math.cos(currentTime * 0.065) * 9 + Math.sin(currentTime * 0.09) * 4) * shakeIntensity;
        } else {
          s.camShakeX = 0;
          s.camShakeY = 0;
        }

        const targetBaseZoom = s.hyperRushActive ? 1.06 : 1.0 - Math.min(0.04, s.currentTier * 0.006);
        s.currentCamZoom += (targetBaseZoom * s.zoomFactor - s.currentCamZoom) * (10 * safeDt);

        // Update Invulnerability Shield
        if (s.shieldTimer > 0) {
          s.shieldTimer = Math.max(0, s.shieldTimer - safeDt);
        }
        s.shieldOrbPhase += safeDt * 6;

        // Return squash to normal smoothly
        s.squashX += (1 - s.squashX) * (20 * safeDt);
        s.squashY += (1 - s.squashY) * (20 * safeDt);

        // Character Eye Blink animation
        s.eyeBlink += safeDt * 3.5;
        if (s.eyeBlink > Math.PI * 2) s.eyeBlink = 0;

        // Update Floating Texts (Zero .splice)
        for (let f = 0; f < s.floatingTexts.length; f++) {
          const ft = s.floatingTexts[f];
          if (ft.active) {
            ft.y -= ft.vy * safeDt;
            ft.alpha -= safeDt * 1.6;
            if (ft.alpha <= 0) {
              ft.active = false;
            }
          }
        }

        // Position Character Strictly at Current Wall
        s.currentX = s.currentSide === 'left' ? s.corridorLeft + s.radius : s.corridorRight - s.radius;

        // =========================================================================
        // 2. ATUALIZAÇÃO DAS MOEDAS COLECIONÁVEIS NA PISTA (🪙)
        // =========================================================================
        for (let c = 0; c < s.coinsList.length; c++) {
          const coin = s.coinsList[c];
          if (!coin.active) continue;

          // Rotação visual da moeda
          coin.spinPhase += safeDt * 4.5;

          // Movimento ascendente na pista com velocidade interpolada
          coin.y -= s.currentSpeed * safeDt;

          // Animação de coleta (se acabou de ser coletada)
          if (coin.collected) {
            coin.collectAnim += safeDt * 4.0;
            if (coin.collectAnim >= 1.0) {
              coin.active = false;
            }
          } else if (s.hasStarted && !s.isGameOver && !s.isGameWon) {
            // Detecção de coleta pelo jogador
            const cdx = s.currentX - coin.x;
            const cdy = s.y - coin.y;
            const coinDist = Math.hypot(cdx, cdy);
            const collectRadius = s.radius + coin.radius + 16;

            if (coinDist < collectRadius) {
              coin.collected = true;
              coin.collectAnim = 0.05;
              const earnedCoins = 1 * s.comboMultiplier;
              s.coins += earnedCoins;

              try {
                audio.playSfx('coin', currentProps.settings, s.combo);
              } catch (e) {
                console.warn('[Audio catch on coin]:', e);
              }

              spawnFloatingText(`+${earnedCoins} 🪙`, coin.x, coin.y - 15, '#facc15');
              currentProps.onScoreUpdate(s.score, s.coins, s.combo);
            }
          }

          // Quando a moeda passa do topo da tela, reposiciona no fundo
          if (coin.y < -60) {
            let maxY = height;
            for (let j = 0; j < s.coinsList.length; j++) {
              if (s.coinsList[j].y > maxY) {
                maxY = s.coinsList[j].y;
              }
            }
            coin.y = Math.max(height + 80, maxY + BASE_SPACING * 0.75);
            coin.collected = false;
            coin.collectAnim = 0;
            coin.active = true;

            const rSide = Math.random();
            if (rSide < 0.42) {
              coin.side = 'left';
              coin.x = s.corridorLeft + s.radius + 6;
            } else if (rSide < 0.84) {
              coin.side = 'right';
              coin.x = s.corridorRight - s.radius - 6;
            } else {
              coin.side = 'center';
              coin.x = corridorCenterX;
            }
          }
        }

        // =========================================================================
        // 3. ATUALIZAÇÃO DOS 5 OBSTÁCULOS FIXOS (Zero GC, Padrões Matemáticos)
        // =========================================================================
        const numObs = Math.min(s.obstacles.length, 5);
        for (let i = 0; i < numObs; i++) {
          const obs = s.obstacles[i];

          // Animação de pulso e rotação
          obs.pulsePhase += safeDt * obs.wobbleSpeed * (1 + tier * 0.12);
          obs.rotationAngle += safeDt * obs.spinSpeed;

          // Movimento ascendente contínuo e fluido
          obs.y -= s.currentSpeed * safeDt;

          const verticalProgress = Math.max(0, Math.min(1, obs.y / height));

          // Cálculo da posição horizontal de acordo com o padrão
          let obsCenterX = s.corridorLeft + obs.radius + 12;

          if (obs.pattern === 'right') {
            obsCenterX = s.corridorRight - obs.radius - 12;
          } else if (obs.pattern === 'center') {
            obsCenterX = corridorCenterX + Math.sin(obs.pulsePhase * 1.5) * 12;
          } else if (obs.pattern === 'zigzag') {
            const swayAmplitude = corridorWidth * 0.38;
            obsCenterX = corridorCenterX + Math.sin(obs.pulsePhase * 2.8) * swayAmplitude;
          } else if (obs.pattern === 'diagonal_left') {
            const startX = s.corridorLeft + obs.radius + 10;
            const endX = s.corridorRight - obs.radius - 10;
            obsCenterX = startX + (endX - startX) * Math.abs(Math.sin(obs.pulsePhase * 1.4));
          } else if (obs.pattern === 'diagonal_right') {
            const startX = s.corridorRight - obs.radius - 10;
            const endX = s.corridorLeft + obs.radius + 10;
            obsCenterX = startX + (endX - startX) * Math.abs(Math.sin(obs.pulsePhase * 1.4));
          } else if (obs.pattern === 'arc_swoop') {
            const arcSway = Math.sin(verticalProgress * Math.PI) * (corridorWidth * 0.36) * obs.arcDirection;
            obsCenterX = corridorCenterX + arcSway;
          } else if (obs.pattern === 'spinner') {
            const orbitR = (corridorWidth * 0.32);
            obsCenterX = corridorCenterX + Math.cos(obs.rotationAngle) * orbitR;
          } else if (obs.pattern === 'wave_drift') {
            const wave = (Math.sin(obs.pulsePhase * 2.0) + Math.cos(obs.pulsePhase * 3.2) * 0.5) / 1.5;
            obsCenterX = corridorCenterX + wave * (corridorWidth * 0.35);
          }

          obs.xOffset = obsCenterX;

          // Passagem do obstáculo pelo jogador (Score e Combo com teto estrito de 50)
          if (!obs.passed && obs.y < s.y - s.radius - 20) {
            obs.passed = true;
            s.score += 1 * s.comboMultiplier;
            s.combo = Math.min(MAX_COMBO_CAP, s.combo + 1); // Trava Rígida no Teto de 50
            if (s.combo > s.maxCombo) {
              s.maxCombo = s.combo;
            }

            // Disparo de Encorajamento Narrado de Combo
            if (
              s.combo === 3 ||
              s.combo === 5 ||
              s.combo === 10 ||
              s.combo === 15 ||
              s.combo === 20 ||
              s.combo === 25 ||
              s.combo === 30 ||
              s.combo === 40 ||
              s.combo === 50
            ) {
              try {
                audio.speakComboMilestone(s.combo, currentProps.settings, currentProps.settings?.playerName);
              } catch (e) {
                console.warn('[Audio catch on speakComboMilestone]:', e);
              }
              s.zoomFactor = Math.min(1.15, s.zoomFactor + 0.04);
              s.camTrauma = Math.min(0.5, s.camTrauma + 0.18);
            }

            // Moeda bônus a cada 4 obstáculos superados
            if (s.combo % 4 === 0) {
              s.coins += 1;
            }

            currentProps.onScoreUpdate(s.score, s.coins, s.combo);

            try {
              audio.playSfx('pass', currentProps.settings);
            } catch (e) {
              console.warn('[Audio catch on pass]:', e);
            }

            // Condição de Vitória Suprema
            if (s.combo >= 7000 && !s.isGameWon) {
              s.isGameWon = true;
              try {
                audio.playSfx('victory', currentProps.settings);
                audio.speakComment('🏆 INACREDITÁVEL! VOCÊ ZEROU O WALL DROP COM 7000 COMBOS!', currentProps.settings, 3);
              } catch (e) {
                console.warn('[Audio catch on victory]:', e);
              }
              currentProps.onFeedback?.('🏆 VITÓRIA SUPREMA! 7000 COMBOS!');

              setTimeout(() => {
                currentProps.onVictory?.(s.score, s.coins + 7000, s.combo);
              }, 800);
            }
          }

          // Desvio Perigoso ("QUASE! +50")
          if (!s.isGameOver && !s.isGameWon && !obs.nearMissChecked && s.hasStarted) {
            const dx = s.currentX - obsCenterX;
            const dy = s.y - obs.y;
            const dist = Math.hypot(dx, dy);
            const collisionRadius = (s.radius + obs.radius) * 0.78;
            const nearMissThreshold = collisionRadius + 38;

            if (dist >= collisionRadius && dist <= nearMissThreshold && Math.abs(dy) < 34) {
              obs.nearMissChecked = true;
              const bonusScore = 50 * s.comboMultiplier;
              s.score += bonusScore;
              currentProps.onScoreUpdate(s.score, s.coins, s.combo);

              spawnFloatingText('QUASE! +50', s.currentX, s.y - 20, '#facc15');

              try {
                audio.playSfx('near_miss', currentProps.settings);
              } catch (e) {
                console.warn('[Audio catch on near_miss]:', e);
              }
              currentProps.onFeedback?.('QUASE! +50 PTS! 🔥');
            }
          }

          // =========================================================================
          // DETECÇÃO DE COLISÃO PRECISA & FEEDBACK VISUAL INSTANTÂNEO
          // =========================================================================
          if (!s.isGameOver && !s.isGameWon && s.shieldTimer <= 0) {
            const dx = s.currentX - obsCenterX;
            const dy = s.y - obs.y;
            const dist = Math.hypot(dx, dy);
            // Hitbox justa e precisa (78% da soma dos raios)
            const collisionRadius = (s.radius + obs.radius) * 0.78;

            if (dist < collisionRadius) {
              s.isGameOver = true;
              s.impactFlash = 1.0;
              s.impactRingRadius = s.radius * 0.6;
              s.impactRingAlpha = 1.0;
              s.impactRing2Radius = s.radius * 0.3;
              s.impactRing2Alpha = 0.9;
              s.impactX = (s.currentX + obsCenterX) * 0.5;
              s.impactY = (s.y + obs.y) * 0.5;
              s.camTrauma = 0.95; // Screenshake nítido
              s.charImpactScale = 1.4;
              s.charImpactAlpha = 1.0;

              snapshotRef.current = {
                score: s.score,
                coins: s.coins,
                combo: s.combo,
                maxCombo: s.maxCombo,
                currentSide: s.currentSide,
                currentX: s.currentX,
              };

              try {
                audio.playSfx('crash', currentProps.settings);
              } catch (e) {
                console.warn('[Audio catch on crash]:', e);
              }

              setTimeout(() => {
                currentProps.onGameOver(s.score, s.coins, s.maxCombo);
              }, 480);
              break;
            }
          }

          // =========================================================================
          // GARBAGE COLLECTION ZERO (Pool Fixo de 5 Obstáculos):
          // Reposiciona no fundo quando passar do topo (obs.y < -80)
          // =========================================================================
          if (obs.y < -80) {
            let maxY = height;
            for (let j = 0; j < s.obstacles.length; j++) {
              if (s.obstacles[j].y > maxY) {
                maxY = s.obstacles[j].y;
              }
            }

            const dynamicSpacing = Math.max(220, BASE_SPACING - Math.min(60, tier * 10));
            obs.y = Math.max(height + 100, maxY + dynamicSpacing);
            
            // Reaproveita a mesma instância sem recriar objetos
            obs.pattern = getRandomPattern(s.memeIndex);
            obs.spinSpeed = obs.pattern === 'spinner' ? 7.8 : (Math.random() - 0.5) * 1.8;
            obs.arcDirection = s.memeIndex % 2 === 0 ? 1 : -1;
            
            const meme = EMOJI_MEME_LIST[s.memeIndex % EMOJI_MEME_LIST.length];
            s.memeIndex++;
            obs.emoji = meme.emoji;
            obs.label = meme.label;
            obs.passed = false;
            obs.nearMissChecked = false;
          }
        }
      }

      // =========================================================================
      // ZERO SHADOW-BLUR HIGH-PERFORMANCE RENDERER (Zero GPU Context Loss)
      // =========================================================================
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      const themeToDraw = currentProps.activeVisualTheme;
      const charColorsToDraw = currentProps.activeCharColors;

      ctx.save();
      ctx.translate(width / 2 + s.camOffsetX + s.camShakeX, height / 2 + s.camOffsetY + s.camShakeY);
      if (s.camTilt !== 0) {
        ctx.rotate(s.camTilt * 0.045);
      }
      if (s.currentCamZoom !== 1.0) {
        ctx.scale(s.currentCamZoom, s.currentCamZoom);
      }
      ctx.translate(-width / 2, -height / 2);

      // 1. Solid Clean Background com tonalidade dinâmica
      ctx.fillStyle = s.hyperRushActive 
        ? '#1a0404' 
        : s.currentTier === 0 
          ? (themeToDraw.bgGradient[0] || '#090d16') 
          : activeTierPalette.accentBg;
      ctx.fillRect(0, 0, width, height);

      // Flash visual de aceleração ou colisão
      if (s.impactFlash > 0) {
        ctx.fillStyle = `rgba(239, 68, 68, ${s.impactFlash * 0.4})`;
        ctx.fillRect(0, 0, width, height);
      } else if (s.intensityFlash > 0) {
        ctx.fillStyle = s.hyperRushActive 
          ? `rgba(255, 60, 0, ${s.intensityFlash * 0.32})`
          : `rgba(255, 255, 255, ${s.intensityFlash * 0.2})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Linhas de velocidade centrais (estáticas/leves)
      const speedFactor = s.speedMultiplier;
      const t = currentTime * 0.55 * speedFactor;
      const lineCount = s.hyperRushActive ? 22 : 12;
      const step = (s.corridorRight - s.corridorLeft - 30) / lineCount;

      ctx.fillStyle = s.hyperRushActive ? 'rgba(255, 200, 50, 0.22)' : 'rgba(255, 255, 255, 0.07)';
      for (let lx = s.corridorLeft + 15; lx < s.corridorRight - 15; lx += step) {
        const ly = ((t * 3.2 + lx * 15) % height);
        const lHeight = s.hyperRushActive ? 75 * speedFactor : 34 * speedFactor;
        ctx.fillRect(lx, ly, s.hyperRushActive ? 2.8 : 2, lHeight);
      }

      // 2. Paredes Sólidas do Corredor com Bordas Nítidas (Zero ShadowBlur)
      ctx.fillStyle = themeToDraw.wallColor || '#1e293b';
      ctx.fillRect(0, 0, s.corridorLeft, height);
      ctx.fillRect(s.corridorRight, 0, width - s.corridorRight, height);

      ctx.strokeStyle = s.hyperRushActive ? '#ff0055' : activeTierPalette.wallGlow;
      ctx.lineWidth = s.hyperRushActive ? 4.5 : 3.5;
      ctx.beginPath();
      ctx.moveTo(s.corridorLeft, 0);
      ctx.lineTo(s.corridorLeft, height);
      ctx.moveTo(s.corridorRight, 0);
      ctx.lineTo(s.corridorRight, height);
      ctx.stroke();

      // =========================================================================
      // 3. RENDERIZAÇÃO DAS MOEDAS COLECIONÁVEIS (🪙) - Efeito 3D Vetorial de Ouro
      // =========================================================================
      for (let c = 0; c < s.coinsList.length; c++) {
        const coin = s.coinsList[c];
        if (!coin.active || coin.y > height + 80 || coin.y < -60) continue;

        ctx.save();
        ctx.translate(coin.x, coin.y);

        if (coin.collected) {
          const scale = 1.0 + coin.collectAnim * 1.5;
          const alpha = Math.max(0, 1.0 - coin.collectAnim);
          ctx.scale(scale, scale);
          ctx.globalAlpha = alpha;
        }

        const spinScaleX = Math.cos(coin.spinPhase);
        const absSpin = Math.max(0.18, Math.abs(spinScaleX));

        // Sombra da Moeda
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(3, 6, coin.radius * absSpin, coin.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Borda dourada externa
        ctx.fillStyle = spinScaleX >= 0 ? '#d97706' : '#b45309';
        ctx.beginPath();
        ctx.ellipse(0, 0, coin.radius * absSpin, coin.radius, 0, 0, Math.PI * 2);
        ctx.fill();

        // Face principal com gradiente dourado
        const coinGrad = ctx.createRadialGradient(0, -coin.radius * 0.3, 1, 0, 0, coin.radius);
        coinGrad.addColorStop(0, '#fef08a');
        coinGrad.addColorStop(0.5, '#facc15');
        coinGrad.addColorStop(1, '#eab308');
        ctx.fillStyle = coinGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, (coin.radius - 2.5) * absSpin, coin.radius - 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Anel interno e brilho
        ctx.strokeStyle = '#fef9c3';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, (coin.radius - 4.5) * absSpin, coin.radius - 4.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Símbolo central '★'
        if (absSpin > 0.5) {
          ctx.fillStyle = '#854d0e';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', 0, 1);
        }

        ctx.restore();
      }

      // =========================================================================
      // 4. RENDERIZAÇÃO DOS OBSTÁCULOS EMOJIS (Máximo 5 Objetos)
      // =========================================================================
      const activeObstacleCount = Math.min(s.obstacles.length, 5);
      for (let i = 0; i < activeObstacleCount; i++) {
        const obs = s.obstacles[i];
        if (obs.y > height + 160 || obs.y < -100) continue;

        const emojiCenterX = obs.xOffset;
        const emojiCenterY = obs.y;

        const isCenter = obs.pattern === 'center';
        const isSpinner = obs.pattern === 'spinner';
        const isZigzag = obs.pattern === 'zigzag';
        const isDiagLeft = obs.pattern === 'diagonal_left';
        const isDiagRight = obs.pattern === 'diagonal_right';
        const isArc = obs.pattern === 'arc_swoop';
        
        const wobbleAngle = isSpinner 
          ? obs.rotationAngle 
          : Math.sin(obs.pulsePhase) * 0.18;
        const scalePulse = 1 + Math.sin(obs.pulsePhase * 2) * 0.08;
        const ringProgress = (obs.pulsePhase * 0.9) % 1;
        const ringRadius = obs.radius + ringProgress * 16;
        const ringAlpha = (1 - ringProgress) * 0.45;

        // 4.1. Sombra Projetada Simples e Otimizada
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(
          emojiCenterX + 8, 
          emojiCenterY + 12, 
          (obs.radius + 4) * scalePulse, 
          (obs.radius + 1) * scalePulse * 0.8, 
          wobbleAngle * 0.5, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();

        // 4.2. Anel de Alerta Simples (Zero ShadowBlur)
        ctx.strokeStyle = isCenter 
          ? `rgba(234, 179, 8, ${ringAlpha})` 
          : isSpinner 
            ? `rgba(168, 85, 247, ${ringAlpha})` 
            : isZigzag || isDiagLeft || isDiagRight
              ? `rgba(6, 182, 212, ${ringAlpha})`
              : isArc
                ? `rgba(236, 72, 153, ${ringAlpha})`
                : `rgba(239, 68, 68, ${ringAlpha})`;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(emojiCenterX, emojiCenterY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.translate(emojiCenterX, emojiCenterY);
        ctx.rotate(wobbleAngle);
        ctx.scale(scalePulse, scalePulse);

        // 4.3. Fundo Sólido Circular com Gradiente Suave
        const sphereGrad = ctx.createRadialGradient(
          -obs.radius * 0.35, 
          -obs.radius * 0.35, 
          2, 
          0, 
          0, 
          obs.radius + 6
        );

        if (isCenter) {
          sphereGrad.addColorStop(0, '#fef08a');
          sphereGrad.addColorStop(0.5, '#eab308');
          sphereGrad.addColorStop(1, '#713f12');
        } else if (isSpinner) {
          sphereGrad.addColorStop(0, '#f3e8ff');
          sphereGrad.addColorStop(0.5, '#c084fc');
          sphereGrad.addColorStop(1, '#581c87');
        } else if (isZigzag || isDiagLeft || isDiagRight) {
          sphereGrad.addColorStop(0, '#cffafe');
          sphereGrad.addColorStop(0.5, '#06b6d4');
          sphereGrad.addColorStop(1, '#155e75');
        } else if (isArc) {
          sphereGrad.addColorStop(0, '#fce7f3');
          sphereGrad.addColorStop(0.5, '#ec4899');
          sphereGrad.addColorStop(1, '#831843');
        } else {
          sphereGrad.addColorStop(0, '#fee2e2');
          sphereGrad.addColorStop(0.5, '#ef4444');
          sphereGrad.addColorStop(1, '#7f1d1d');
        }

        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        // Borda simples e nítida
        ctx.strokeStyle = isCenter ? '#fef08a' : isSpinner ? '#e9d5ff' : isArc ? '#fbcfe8' : (isZigzag || isDiagLeft || isDiagRight) ? '#a5f3fc' : '#fecaca';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius + 5, 0, Math.PI * 2);
        ctx.stroke();

        // 4.4. Renderização Centralizada do Emoji (50px sans-serif)
        ctx.font = '50px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obs.emoji, 0, 2);

        ctx.restore();

        // 4.5. Etiqueta de Texto Simples e Nítida Abaixo do Emoji
        ctx.save();
        ctx.translate(emojiCenterX, emojiCenterY + obs.radius + 16);

        ctx.font = 'bold 11px sans-serif';
        const labelText = isCenter 
          ? `⚠️ MEIO: ${obs.label}` 
          : isSpinner 
            ? `🌪️ GIRO: ${obs.label}` 
            : isZigzag 
              ? `⚡ ZIGZAG: ${obs.label}` 
              : isDiagLeft || isDiagRight
                ? `↘️ DIAGONAL: ${obs.label}`
                : isArc
                  ? `🌀 ARCO: ${obs.label}`
                  : obs.label;

        const labelMetrics = ctx.measureText(labelText);
        const badgeW = labelMetrics.width + 14;
        const badgeH = 18;

        ctx.fillStyle = '#090d16';
        ctx.fillRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH);

        ctx.strokeStyle = isCenter 
          ? '#eab308' 
          : isSpinner 
            ? '#c084fc' 
            : isArc
              ? '#ec4899'
              : (isZigzag || isDiagLeft || isDiagRight)
                ? '#06b6d4'
                : activeTierPalette.tagColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, 0, 1);

        ctx.restore();
      }

      // =========================================================================
      // 5. ANIMAÇÃO DE COLISÃO: ONDAS DE CHOQUE VETORIAIS (Zero ShadowBlur)
      // =========================================================================
      if (s.impactRingAlpha > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(239, 68, 68, ${s.impactRingAlpha})`;
        ctx.lineWidth = 3.8;
        ctx.beginPath();
        ctx.arc(s.impactX, s.impactY, s.impactRingRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${s.impactRingAlpha * 0.75})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(s.impactX, s.impactY, Math.max(0, s.impactRingRadius - 8), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (s.impactRing2Alpha > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(250, 204, 21, ${s.impactRing2Alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(s.impactX, s.impactY, s.impactRing2Radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // =========================================================================
      // 6. PERSONAGEM (ESFERA COM ANÉIS, OLHO CIBERNÉTICO OU SKIN EMOJI)
      // =========================================================================
      ctx.save();
      ctx.translate(s.currentX, s.y);
      if (s.isGameOver) {
        ctx.scale(s.charImpactScale, s.charImpactScale);
        ctx.globalAlpha = Math.max(0, s.charImpactAlpha);
      } else {
        ctx.scale(s.squashX, s.squashY);
      }

      const accessoryType = currentProps.customChar?.accessory || 'crown';

      // Anéis Orbitais Cruzados
      const ringTime = currentTime * 0.0035;
      ctx.save();
      ctx.strokeStyle = charColorsToDraw.accentColor || '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, s.radius + 10, (s.radius + 10) * 0.38, ringTime, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = charColorsToDraw.primaryColor || '#00f2ff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(0, 0, s.radius + 12, (s.radius + 12) * 0.38, -ringTime * 1.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Escudo de Invulnerabilidade (Se ativo)
      if (s.shieldTimer > 0) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(0, 0, s.radius + 8, 0, Math.PI * 2);
        ctx.stroke();

        for (let orb = 0; orb < 3; orb++) {
          const orbAngle = s.shieldOrbPhase + (orb * (Math.PI * 2 / 3));
          const orbDist = s.radius + 9;
          ctx.fillStyle = '#67e8f9';
          ctx.beginPath();
          ctx.arc(Math.cos(orbAngle) * orbDist, Math.sin(orbAngle) * orbDist, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Corpo do Personagem: Skin Emoji ou Esfera Volumétrica
      if (currentProps.skin?.emoji) {
        ctx.save();
        ctx.rotate(s.charRotation);

        const emojiGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, s.radius + 3);
        emojiGrad.addColorStop(0, currentProps.skin.primaryColor || '#ffffff');
        emojiGrad.addColorStop(0.7, currentProps.skin.glowColor || '#38bdf8');
        emojiGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        ctx.fillStyle = emojiGrad;
        ctx.beginPath();
        ctx.arc(0, 0, s.radius + 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(currentProps.skin.emoji, 0, 1);
        ctx.restore();
      } else {
        const ballGrad = ctx.createRadialGradient(-s.radius * 0.3, -s.radius * 0.35, 2, 0, 0, s.radius);
        ballGrad.addColorStop(0, '#ffffff');
        ballGrad.addColorStop(0.45, charColorsToDraw.primaryColor || '#e2e8f0');
        ballGrad.addColorStop(1, charColorsToDraw.accentColor || '#94a3b8');

        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Brilho Especular no topo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(-s.radius * 0.32, -s.radius * 0.35, s.radius * 0.28, 0, Math.PI * 2);
        ctx.fill();

        // Olho Cibernético Central
        const isBlinking = Math.sin(s.eyeBlink) > 0.95;
        const eyeDirX = s.currentSide === 'left' ? 2.5 : -2.5;

        if (!isBlinking) {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(eyeDirX, -2, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = charColorsToDraw.accentColor || '#38bdf8';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(eyeDirX, -2, 4.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(eyeDirX - 2.2, -4.2, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(eyeDirX + 2, -0.6, 1.1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(eyeDirX - 6, -2);
          ctx.quadraticCurveTo(eyeDirX, 1, eyeDirX + 6, -2);
          ctx.stroke();
        }

        // Adorno VIP: Coroa
        if (accessoryType === 'crown' || !currentProps.customChar?.enabled) {
          const crownFloat = Math.sin(currentTime * 0.006) * 3;
          ctx.save();
          ctx.translate(0, -s.radius - 12 + crownFloat);
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(-11, 4);
          ctx.lineTo(-12, -7);
          ctx.lineTo(-6, -2);
          ctx.lineTo(0, -11);
          ctx.lineTo(6, -2);
          ctx.lineTo(12, -7);
          ctx.lineTo(11, 4);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, -3, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.restore();

      // =========================================================================
      // 7. RENDERIZAÇÃO DOS TEXTOS FLUTUANTES ("+1 🪙", "QUASE! +50") - Zero GC
      // =========================================================================
      for (let f = 0; f < s.floatingTexts.length; f++) {
        const ft = s.floatingTexts[f];
        if (ft.active) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, ft.alpha));
          ctx.fillStyle = ft.color;
          ctx.font = '900 14px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
        }
      }

      // =========================================================================
      // 8. HUD: MULTIPLICADOR DE COMBO DINÂMICO & VELOCIDADE (Cap 50x / 500 px/s)
      // =========================================================================
      if (s.hasStarted && s.comboMultiplier > 1 && !s.isGameOver) {
        const centerHudX = (s.corridorLeft + s.corridorRight) * 0.5;
        ctx.save();
        ctx.translate(centerHudX, 38);
        ctx.scale(s.multiplierPulse, s.multiplierPulse);
        ctx.fillStyle = s.comboMultiplier >= 5 ? '#f43f5e' : s.comboMultiplier >= 3 ? '#ec4899' : '#f59e0b';
        ctx.font = '900 14px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`⚡ MULTIPLICADOR ${s.comboMultiplier}x`, 0, 0);
        ctx.restore();
      }

      // Badge de Nível / Velocidade no HUD
      ctx.fillStyle = s.hyperRushActive ? '#ff0055' : activeTierPalette.wallGlow;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      const speedPct = Math.round((s.speedMultiplier - 1) * 100);
      const speedText = s.hyperRushActive
        ? `🔥 HYPER RUSH x${s.combo} | ${Math.round(s.currentSpeed)} px/s`
        : speedPct > 0 
          ? `⚡ LVL ${s.currentTier + 1} (+${speedPct}%) | ${Math.round(s.currentSpeed)} px/s`
          : `⚡ ${Math.round(s.currentSpeed)} px/s`;
      ctx.fillText(speedText, width - s.corridorLeft - 10, 10);

      // Tap to Start / Switch Hint
      if (!currentProps.hasTapped) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TOQUE PARA DESVIAR E COLETAR MOEDAS! 🪙⚡', width * 0.5, height * 0.22);
      }

      ctx.restore(); // Fecha o ctx.save da câmara

      s.animFrameId = requestAnimationFrame(loop);
    };

    s.animFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(s.animFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      className="relative w-full h-full select-none cursor-pointer overflow-hidden touch-none"
      onClick={switchWall}
      onTouchStart={(e) => {
        e.preventDefault();
        switchWall();
      }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
      />
    </div>
  );
};
