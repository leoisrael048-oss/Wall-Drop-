import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Coins, 
  Sparkles, 
  Check, 
  Lock, 
  Palette, 
  Flame, 
  Zap, 
  Shield, 
  Clock, 
  Sliders, 
  Eye, 
  Sun,
  Layers,
  Crown,
  Undo2,
  Gem,
  Info,
  ChevronRight
} from 'lucide-react';
import { 
  CustomCharacterConfig, 
  CustomThemeConfig, 
  PlayerUpgrades, 
  GameSettings,
  CustomPaletteItem,
  CustomBackgroundItem,
  ItemRarity,
  UpgradeDefinition
} from '../types';
import { 
  CUSTOM_PALETTES, 
  CUSTOM_BACKGROUNDS, 
  CUSTOM_ACCESSORIES,
  CUSTOM_AURAS,
  UPGRADE_DEFINITIONS,
  DEFAULT_CUSTOM_CHARACTER,
  DEFAULT_CUSTOM_THEME
} from '../constants/gameData';
import { audio } from '../utils/audio';
import { getTranslation } from '../utils/i18n';

interface CustomizerModalProps {
  coins: number;
  customChar: CustomCharacterConfig;
  customTheme: CustomThemeConfig;
  upgrades: PlayerUpgrades;
  settings: GameSettings;
  onSaveCustomChar: (config: Partial<CustomCharacterConfig>) => void;
  onSaveCustomTheme: (config: Partial<CustomThemeConfig>) => void;
  onUnlockPalette: (paletteId: string, cost: number) => boolean;
  onUnlockBackground?: (bgId: string, cost: number) => boolean;
  onUnlockBg?: (bgId: string, cost: number) => boolean;
  onUpgradeAbility: (abilityKey: keyof PlayerUpgrades, cost: number, maxLevel?: number) => boolean;
  onBack: () => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  coins,
  customChar,
  customTheme,
  upgrades,
  settings,
  onSaveCustomChar,
  onSaveCustomTheme,
  onUnlockPalette,
  onUnlockBackground,
  onUnlockBg,
  onUpgradeAbility,
  onBack,
}) => {
  const lang = settings?.language || 'pt';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, lang);

  const [activeTab, setActiveTab] = useState<'character' | 'background' | 'upgrades'>('character');
  const [characterSubTab, setCharacterSubTab] = useState<'palettes' | 'accessories' | 'auras'>('palettes');
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<'ALL' | ItemRarity>('ALL');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Live Instant Preview Override States
  const [previewChar, setPreviewChar] = useState<Partial<CustomCharacterConfig> | null>(null);
  const [previewTheme, setPreviewTheme] = useState<Partial<CustomThemeConfig> | null>(null);
  const [previewUpgrades, setPreviewUpgrades] = useState<Partial<PlayerUpgrades> | null>(null);

  const isPreviewing = previewChar !== null || previewTheme !== null || previewUpgrades !== null;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Effective Active & Previewed Configurations
  const effectiveChar: CustomCharacterConfig = useMemo(() => ({
    ...customChar,
    ...(previewChar || {}),
    enabled: true,
  }), [customChar, previewChar]);

  const effectiveTheme: CustomThemeConfig = useMemo(() => ({
    ...customTheme,
    ...(previewTheme || {}),
    enabled: true,
  }), [customTheme, previewTheme]);

  const effectiveUpgrades: PlayerUpgrades = useMemo(() => ({
    ...upgrades,
    ...(previewUpgrades || {}),
  }), [upgrades, previewUpgrades]);

  // Unlock callback resolution
  const handleUnlockBackgroundAction = (bgId: string, price: number) => {
    if (onUnlockBackground) return onUnlockBackground(bgId, price);
    if (onUnlockBg) return onUnlockBg(bgId, price);
    return false;
  };

  // Play narrator greeting on open
  useEffect(() => {
    audio.speakNarrator('workshopOpen', settings);
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleResetPreview = () => {
    setPreviewChar(null);
    setPreviewTheme(null);
    setPreviewUpgrades(null);
    audio.playSfx('click', settings);
    showToast(lang === 'pt' ? 'Preview desfeito' : lang === 'es' ? 'Previsualización restablecida' : 'Preview reset', 'info');
  };

  // Live Canvas Rendering Loop for Stage Preview with Real Idle Animation
  useEffect(() => {
    let animFrameId: number;
    let startTime = performance.now();
    
    // Internal preview particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      life: number;
      maxLife: number;
      color: string;
      shape: 'circle' | 'spark' | 'star' | 'square';
    }> = [];

    const render = (now: number) => {
      const time = now - startTime;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Draw Background Preview
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, effectiveTheme.bgGradient[0]);
      bgGrad.addColorStop(1, effectiveTheme.bgGradient[1]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Grid / Speed Lines Style
      ctx.save();
      const gridStyle = effectiveTheme.gridStyle || 'cyber_grid';
      if (gridStyle === 'stardust_nebula') {
        // Floating nebula dust particles
        ctx.fillStyle = effectiveTheme.accentColor + '33';
        for (let i = 0; i < 18; i++) {
          const sx = ((i * 47 + time * 0.02) % w);
          const sy = ((i * 31 + Math.sin(time * 0.002 + i) * 15) % h);
          ctx.beginPath();
          ctx.arc(sx, sy, (i % 3) + 1, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (gridStyle === 'matrix_dots') {
        // Matrix dot matrix
        ctx.fillStyle = effectiveTheme.wallGlow + '25';
        for (let dx = 20; dx < w - 20; dx += 24) {
          const dyOffset = (time * 0.03) % 24;
          for (let dy = dyOffset; dy < h; dy += 24) {
            ctx.beginPath();
            ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        // Dynamic moving horizontal grid speed lines
        ctx.strokeStyle = effectiveTheme.wallGlow + '30';
        ctx.lineWidth = 1;
        const gridOffset = (time * 0.04) % 28;
        for (let gy = gridOffset; gy < h; gy += 28) {
          ctx.beginPath();
          ctx.moveTo(18, gy);
          ctx.lineTo(w - 18, gy);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Side Walls
      const wallW = 18;
      ctx.fillStyle = effectiveTheme.wallColor;
      ctx.fillRect(0, 0, wallW, h);
      ctx.fillRect(w - wallW, 0, wallW, h);

      // Wall Glow Highlight Lines
      ctx.strokeStyle = effectiveTheme.wallGlow;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(wallW, 0);
      ctx.lineTo(wallW, h);
      ctx.moveTo(w - wallW, 0);
      ctx.lineTo(w - wallW, h);
      ctx.stroke();

      // 2. Character Physics & Organic Jelly Idle Motion
      const charX = w / 2;
      const baseRadius = 20;
      const jellyLevel = effectiveUpgrades.jellyPulse || 0;
      
      // Floating bobbing motion
      const bobbing = Math.sin(time * 0.0035) * 6;
      const charY = h / 2 + bobbing;

      // Organic Squash and Stretch Gel breathing deformation
      const squashFactor = 0.06 + jellyLevel * 0.025;
      const scaleX = 1 + Math.sin(time * 0.005) * squashFactor;
      const scaleY = 1 - Math.sin(time * 0.005) * squashFactor;

      // Spawn trail particles based on trailIntensity upgrade
      const trailDensity = 0.55 + (effectiveUpgrades.trailIntensity || 0) * 0.1;
      if (Math.random() < trailDensity) {
        const pType = effectiveChar.particleType || 'cyan_glow';
        let pColor = effectiveChar.glowColor;
        let pShape: 'circle' | 'spark' | 'star' | 'square' = 'circle';
        let pSize = Math.random() * 4 + 2.5 + (effectiveUpgrades.trailIntensity || 0) * 0.8;
        let pLifeMax = 0.45 * (1 + (effectiveUpgrades.trailLength || 0) * 0.25);

        if (pType === 'fire') {
          const colors = ['#ff4500', '#ef4444', '#f59e0b', '#ffffff'];
          pColor = colors[Math.floor(Math.random() * colors.length)];
          pShape = Math.random() < 0.4 ? 'spark' : 'circle';
        } else if (pType === 'ice') {
          const colors = ['#38bdf8', '#7dd3fc', '#e0f2fe', '#ffffff'];
          pColor = colors[Math.floor(Math.random() * colors.length)];
          pShape = 'star';
        } else if (pType === 'electric') {
          pColor = Math.random() < 0.5 ? '#facc15' : '#38bdf8';
          pShape = 'spark';
        } else if (pType === 'stardust') {
          const colors = ['#f472b6', '#38bdf8', '#fbbf24', '#ffffff'];
          pColor = colors[Math.floor(Math.random() * colors.length)];
          pShape = 'star';
        } else if (pType === 'glitch_pixels') {
          pColor = Math.random() < 0.5 ? '#22c55e' : '#f43f5e';
          pShape = 'square';
        } else if (pType === 'void_shadow') {
          pColor = Math.random() < 0.5 ? '#a855f7' : '#7c3aed';
          pShape = 'circle';
        } else if (pType === 'toxic_plasma') {
          pColor = Math.random() < 0.5 ? '#10b981' : '#34d399';
          pShape = 'circle';
        }

        particles.push({
          x: charX + (Math.random() - 0.5) * 14,
          y: charY + baseRadius * 0.6,
          vx: (Math.random() - 0.5) * 26,
          vy: 25 + Math.random() * 35,
          size: pSize,
          alpha: 0.9,
          life: 0,
          maxLife: pLifeMax,
          color: pColor,
          shape: pShape,
        });
      }

      // Render Active Particles
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.life += 0.016;
        if (pt.life >= pt.maxLife) {
          particles.splice(p, 1);
          continue;
        }
        pt.x += pt.vx * 0.016;
        pt.y += pt.vy * 0.016;
        const progress = pt.life / pt.maxLife;
        const alpha = pt.alpha * (1 - progress);

        ctx.save();
        ctx.fillStyle = pt.color;
        ctx.strokeStyle = pt.color;
        ctx.globalAlpha = Math.max(0, alpha);

        if (pt.shape === 'star') {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * (1 - progress * 0.5), 0, Math.PI * 2);
          ctx.fill();
        } else if (pt.shape === 'square') {
          const sz = pt.size * (1 - progress * 0.4);
          ctx.fillRect(pt.x - sz / 2, pt.y - sz / 2, sz, sz);
        } else if (pt.shape === 'spark') {
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x - pt.vx * 0.03, pt.y - pt.vy * 0.03);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * (1 - progress * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Render Character Body
      ctx.save();
      ctx.translate(charX, charY);
      ctx.scale(scaleX, scaleY);

      const accType = effectiveChar.accessory || 'crown';
      const auraType = effectiveChar.auraEffect || 'cosmic_rings';

      // Live Preview: Cosmic Wings
      if (accType === 'wings') {
        const wingFlap = Math.sin(time * 0.006) * 6;
        ctx.save();
        ctx.fillStyle = effectiveChar.accentColor;
        // Asa Esquerda
        ctx.beginPath();
        ctx.moveTo(-baseRadius + 2, -2);
        ctx.quadraticCurveTo(-baseRadius - 16, -16 + wingFlap, -baseRadius - 26, -22 + wingFlap);
        ctx.quadraticCurveTo(-baseRadius - 12, -8 + wingFlap, -baseRadius + 2, 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Asa Direita
        ctx.beginPath();
        ctx.moveTo(baseRadius - 2, -2);
        ctx.quadraticCurveTo(baseRadius + 16, -16 + wingFlap, baseRadius + 26, -22 + wingFlap);
        ctx.quadraticCurveTo(baseRadius + 12, -8 + wingFlap, baseRadius - 2, 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }

      // Live Preview: Cosmic Rings Aura
      if (auraType === 'cosmic_rings' || auraType === 'diamond_prism') {
        const ringTime = time * 0.003;
        ctx.save();
        ctx.strokeStyle = effectiveChar.accentColor;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, baseRadius + 10, (baseRadius + 10) * 0.38, ringTime, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = effectiveChar.primaryColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, baseRadius + 12, (baseRadius + 12) * 0.38, -ringTime * 1.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (auraType === 'solar_flame') {
        const flameTime = time * 0.008;
        ctx.save();
        for (let f = 0; f < 6; f++) {
          const fAng = (f * Math.PI / 3) + Math.sin(flameTime + f) * 0.2;
          const fLen = baseRadius + 6 + Math.sin(flameTime * 2 + f) * 4;
          ctx.strokeStyle = f % 2 === 0 ? '#fbbf24' : '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(fAng) * baseRadius, Math.sin(fAng) * baseRadius);
          ctx.lineTo(Math.cos(fAng) * fLen, Math.sin(fAng) * fLen);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Character Glow Aura halo
      const glowBlur = Math.min(4, 2 + (effectiveUpgrades.glowIntensity || 0) * 0.5);
      ctx.shadowColor = effectiveChar.glowColor;
      ctx.shadowBlur = glowBlur;

      // Body Radial Gradient
      const grad = ctx.createRadialGradient(0, -3, 2, 0, 0, baseRadius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, effectiveChar.primaryColor);
      grad.addColorStop(1, effectiveChar.accentColor);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadow blur
      ctx.shadowBlur = 0;

      // Reactor Core Pulse in preview
      const corePulse = 1 + Math.sin(time * 0.008) * 0.25;
      ctx.fillStyle = effectiveChar.accentColor;
      ctx.beginPath();
      ctx.arc(0, 4, 4 * corePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Live Preview: Floating Crown
      if (accType === 'crown') {
        const crownFloat = Math.sin(time * 0.006) * 3;
        ctx.save();
        ctx.translate(0, -baseRadius - 10 + crownFloat);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(-10, 3);
        ctx.lineTo(-11, -6);
        ctx.lineTo(-5, -2);
        ctx.lineTo(0, -10);
        ctx.lineTo(5, -2);
        ctx.lineTo(11, -6);
        ctx.lineTo(10, 3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -3, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (accType === 'horns') {
        ctx.save();
        ctx.fillStyle = effectiveChar.accentColor;
        ctx.beginPath();
        ctx.moveTo(-baseRadius * 0.6, -3);
        ctx.quadraticCurveTo(-baseRadius * 0.9, -baseRadius * 0.9, -baseRadius * 1.1, -baseRadius * 1.2);
        ctx.quadraticCurveTo(-baseRadius * 0.5, -baseRadius * 0.8, -baseRadius * 0.3, -baseRadius * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(baseRadius * 0.6, -3);
        ctx.quadraticCurveTo(baseRadius * 0.9, -baseRadius * 0.9, baseRadius * 1.1, -baseRadius * 1.2);
        ctx.quadraticCurveTo(baseRadius * 0.5, -baseRadius * 0.8, baseRadius * 0.3, -baseRadius * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (accType === 'halo') {
        const haloFloat = Math.sin(time * 0.005) * 2;
        ctx.save();
        ctx.translate(0, -baseRadius - 8 + haloFloat);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 3.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Eye Animation / Hologram Visor
      if (accType === 'visor') {
        ctx.save();
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.roundRect(-baseRadius * 0.8 - 3, -5, baseRadius * 1.6, 8, 3);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      } else {
        const blinkCycle = (time % 3600);
        let eyeScaleY = 1;
        if (blinkCycle > 3400 && blinkCycle < 3560) {
          eyeScaleY = Math.max(0.1, Math.abs(Math.sin((blinkCycle - 3400) / 160 * Math.PI - Math.PI / 2)));
        }

        // Cyber Laser Eye
        ctx.save();
        ctx.scale(1, eyeScaleY);
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(-4, -4, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = effectiveChar.accentColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = effectiveChar.primaryColor;
        ctx.beginPath();
        ctx.arc(-4, -4, 2.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4.5, -4.8, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Orbital Sparks cosmetic effect if active
      const orbitalCount = effectiveUpgrades.orbitalSparks || 0;
      if (orbitalCount > 0) {
        const orbitTime = time * 0.0035;
        for (let oi = 0; oi < orbitalCount; oi++) {
          const ang = orbitTime + (oi * Math.PI * 2) / orbitalCount;
          const ox = Math.cos(ang) * (baseRadius + 10);
          const oy = Math.sin(ang) * (baseRadius + 10);
          ctx.save();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ox, oy, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [effectiveChar, effectiveTheme, effectiveUpgrades]);

  const unlockedPalettes = Array.isArray(customChar?.unlockedColorPalettes) 
    ? customChar.unlockedColorPalettes 
    : DEFAULT_CUSTOM_CHARACTER.unlockedColorPalettes;
  
  const unlockedAccessories = Array.isArray(customChar?.unlockedAccessories)
    ? customChar.unlockedAccessories
    : DEFAULT_CUSTOM_CHARACTER.unlockedAccessories;

  const unlockedAuras = Array.isArray(customChar?.unlockedAuras)
    ? customChar.unlockedAuras
    : DEFAULT_CUSTOM_CHARACTER.unlockedAuras;

  const unlockedBackgrounds = Array.isArray(customTheme?.unlockedBackgrounds) 
    ? customTheme.unlockedBackgrounds 
    : DEFAULT_CUSTOM_THEME.unlockedBackgrounds;

  // Palette Click / Preview Handler
  const handlePaletteClick = (pal: CustomPaletteItem) => {
    const isUnlocked = unlockedPalettes.includes(pal.id);
    
    // Always update live instant preview when clicking
    setPreviewChar({
      enabled: true,
      primaryColor: pal.primaryColor,
      glowColor: pal.glowColor,
      accentColor: pal.accentColor,
      trailColor: pal.trailColor,
      particleType: pal.particleType,
    });

    audio.playSfx('click', settings);
  };

  // Palette Purchase / Equip Handler
  const handlePaletteAction = (pal: CustomPaletteItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const isUnlocked = unlockedPalettes.includes(pal.id);

    if (isUnlocked) {
      // Equip unlocked palette
      onSaveCustomChar({
        enabled: true,
        primaryColor: pal.primaryColor,
        glowColor: pal.glowColor,
        accentColor: pal.accentColor,
        trailColor: pal.trailColor,
        particleType: pal.particleType,
      });
      setPreviewChar(null);
      audio.playSfx('coin', settings);
      showToast(`${pal.name} ${t('equipped') || 'EQUIPADO!'}`, 'success');
    } else {
      // Attempt Purchase
      if (coins >= pal.price) {
        const ok = onUnlockPalette(pal.id, pal.price);
        if (ok) {
          onSaveCustomChar({
            enabled: true,
            primaryColor: pal.primaryColor,
            glowColor: pal.glowColor,
            accentColor: pal.accentColor,
            trailColor: pal.trailColor,
            particleType: pal.particleType,
          });
          setPreviewChar(null);
          audio.playSfx('powerup', settings);
          audio.speakNarrator('customUnlock', settings);
          try {
            confetti({
              particleCount: 70,
              spread: 80,
              origin: { y: 0.6 },
              colors: [pal.primaryColor, pal.glowColor, '#fbbf24', '#ffffff'],
            });
          } catch {}
          showToast(`${pal.name} ${t('unlockedToast')?.replace('{item}', '') || 'DESBLOQUEADO!'}`, 'success');
        }
      } else {
        audio.playSfx('crash', settings);
        audio.speakNarrator('insufficientCoins', settings);
        showToast(lang === 'pt' ? 'Moedas insuficientes! Jogue partidas para ganhar mais.' : t('insufficientCoins'), 'error');
      }
    }
  };

  // Background Click / Preview Handler
  const handleBackgroundClick = (bg: CustomBackgroundItem) => {
    setPreviewTheme({
      enabled: true,
      bgGradient: bg.bgGradient,
      wallColor: bg.wallColor,
      wallGlow: bg.wallGlow,
      obstacleColor: bg.obstacleColor,
      accentColor: bg.accentColor,
      gridStyle: bg.gridStyle,
    });
    audio.playSfx('click', settings);
  };

  // Background Purchase / Equip Handler
  const handleBackgroundAction = (bg: CustomBackgroundItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const isUnlocked = unlockedBackgrounds.includes(bg.id);

    if (isUnlocked) {
      onSaveCustomTheme({
        enabled: true,
        bgGradient: bg.bgGradient,
        wallColor: bg.wallColor,
        wallGlow: bg.wallGlow,
        obstacleColor: bg.obstacleColor,
        accentColor: bg.accentColor,
        gridStyle: bg.gridStyle,
      });
      setPreviewTheme(null);
      audio.playSfx('coin', settings);
      showToast(`${bg.name} ${t('equipped') || 'EQUIPADO!'}`, 'success');
    } else {
      if (coins >= bg.price) {
        const ok = handleUnlockBackgroundAction(bg.id, bg.price);
        if (ok) {
          onSaveCustomTheme({
            enabled: true,
            bgGradient: bg.bgGradient,
            wallColor: bg.wallColor,
            wallGlow: bg.wallGlow,
            obstacleColor: bg.obstacleColor,
            accentColor: bg.accentColor,
            gridStyle: bg.gridStyle,
          });
          setPreviewTheme(null);
          audio.playSfx('powerup', settings);
          audio.speakNarrator('customUnlock', settings);
          try {
            confetti({
              particleCount: 70,
              spread: 80,
              origin: { y: 0.6 },
              colors: [bg.wallGlow, bg.accentColor, '#fbbf24', '#ffffff'],
            });
          } catch {}
          showToast(`${bg.name} ${t('unlockedToast')?.replace('{item}', '') || 'DESBLOQUEADO!'}`, 'success');
        }
      } else {
        audio.playSfx('crash', settings);
        audio.speakNarrator('insufficientCoins', settings);
        showToast(lang === 'pt' ? 'Moedas insuficientes! Jogue partidas para ganhar mais.' : t('insufficientCoins'), 'error');
      }
    }
  };

  // Upgrade Click & Purchase Handler
  const handleUpgradeAction = (def: UpgradeDefinition) => {
    const currentLvl = upgrades[def.id] || 0;
    if (currentLvl >= def.maxLevel) return;

    if (coins >= def.costPerLevel) {
      const ok = onUpgradeAbility(def.id, def.costPerLevel, def.maxLevel);
      if (ok) {
        audio.playSfx('powerup', settings);
        audio.speakNarrator('abilityUpgraded', settings);
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#fbbf24', '#00f2ff', '#ffffff'],
          });
        } catch {}
        showToast(`${def.name} -> ${t('level')} ${currentLvl + 1}!`, 'success');
      }
    } else {
      audio.playSfx('crash', settings);
      audio.speakNarrator('insufficientCoins', settings);
      showToast(lang === 'pt' ? 'Moedas insuficientes! Jogue partidas para ganhar mais.' : t('insufficientCoins'), 'error');
    }
  };

  // Rarity Badge & Theme Helper
  const getRarityBadge = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'COMMON':
        return {
          label: lang === 'pt' ? 'Comum' : lang === 'es' ? 'Común' : 'Common',
          color: 'text-slate-300 bg-slate-800 border-slate-700',
          borderColor: 'border-slate-700/80 hover:border-slate-600',
          icon: <Shield className="w-3 h-3 text-slate-400" />,
          cardBg: 'bg-slate-900/60',
        };
      case 'RARE':
        return {
          label: lang === 'pt' ? 'Rara' : lang === 'es' ? 'Rara' : 'Rare',
          color: 'text-sky-300 bg-sky-950/80 border-sky-500/50 shadow-[0_0_8px_rgba(56,189,248,0.2)]',
          borderColor: 'border-sky-500/40 hover:border-sky-400',
          icon: <Gem className="w-3 h-3 text-sky-400" />,
          cardBg: 'bg-slate-900/70',
        };
      case 'EPIC':
        return {
          label: lang === 'pt' ? 'Épica' : lang === 'es' ? 'Épica' : 'Epic',
          color: 'text-purple-300 bg-purple-950/80 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.25)]',
          borderColor: 'border-purple-500/40 hover:border-purple-400',
          icon: <Sparkles className="w-3 h-3 text-purple-400" />,
          cardBg: 'bg-slate-900/80',
        };
      case 'LEGENDARY':
      default:
        return {
          label: lang === 'pt' ? 'Lendária' : lang === 'es' ? 'Legendaria' : 'Legendary',
          color: 'text-amber-300 bg-amber-950/80 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
          borderColor: 'border-amber-500/50 hover:border-amber-400',
          icon: <Crown className="w-3 h-3 text-amber-400 animate-pulse" />,
          cardBg: 'bg-slate-900/90',
        };
    }
  };

  // Filtered lists
  const filteredPalettes = useMemo(() => {
    if (selectedRarityFilter === 'ALL') return CUSTOM_PALETTES;
    return CUSTOM_PALETTES.filter((p) => p.rarity === selectedRarityFilter);
  }, [selectedRarityFilter]);

  const filteredBackgrounds = useMemo(() => {
    if (selectedRarityFilter === 'ALL') return CUSTOM_BACKGROUNDS;
    return CUSTOM_BACKGROUNDS.filter((b) => b.rarity === selectedRarityFilter);
  }, [selectedRarityFilter]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="relative w-full h-full flex flex-col justify-between items-center p-3 sm:p-5 bg-slate-950 text-white overflow-hidden select-none"
    >
      {/* Ambient background lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation Bar */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-1 mb-1.5">
        <button
          onClick={() => {
            audio.playSfx('click', settings);
            onBack();
          }}
          className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 shadow-md flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/40 rounded-full shadow-sm">
          <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-[11px] font-black tracking-wider text-amber-300 uppercase">
            OFICINA VIP
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-3.5 py-1.5 rounded-2xl shadow-md">
          <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="text-sm font-black text-amber-300 font-mono">{coins}</span>
        </div>
      </div>

      {/* Cost Notification Pill */}
      <div className="w-full max-w-md z-10 mb-2 flex items-center justify-center">
        <div className="px-3 py-1 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-amber-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Custo por Customização VIP: <strong className="text-amber-200 font-extrabold">🪙 2.000 Moedas</strong></span>
        </div>
      </div>

      {/* Live Visual Stage Preview Card */}
      <div className="w-full max-w-md relative rounded-2xl overflow-hidden border border-cyan-500/40 shadow-2xl bg-slate-950 mb-2.5 z-10 aspect-[16/6.5] flex items-center justify-between px-3">
        <canvas
          ref={canvasRef}
          width={380}
          height={145}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Overlay Badges & Preview Reset Action */}
        <div className="relative z-10 flex flex-col justify-between h-full py-2 w-full pointer-events-none">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/40 text-[10px] font-bold text-cyan-300 shadow-md">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
              <span>PREVIEW AO VIVO (IDLE LOOP)</span>
            </div>

            {isPreviewing && (
              <div className="pointer-events-auto flex items-center gap-1">
                <button
                  onClick={handleResetPreview}
                  className="flex items-center gap-1 px-2.5 py-1 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg shadow-rose-600/30 active:scale-95 transition-all animate-pulse"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>Desfazer Preview</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded border backdrop-blur-md ${
                isPreviewing 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                  : 'bg-slate-950/80 text-slate-300 border-slate-700'
              }`}>
                {isPreviewing ? '👁️ MODO TESTE (PREVIEW)' : customChar.enabled ? '🎨 VISUAL EQUIPADO' : '⚙️ VISUAL PADRÃO'}
              </span>
            </div>

            <span className="text-[9px] font-semibold text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-sm">
              Toque em qualquer item para testar
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Personagem / Fundo do Abismo / Aprimorar) */}
      <div className="w-full max-w-md grid grid-cols-3 gap-1.5 z-10 mb-2">
        <button
          onClick={() => {
            audio.playSfx('click', settings);
            setActiveTab('character');
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
            activeTab === 'character'
              ? 'bg-cyan-500/20 border-cyan-400/70 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{t('characterCustom')}</span>
        </button>

        <button
          onClick={() => {
            audio.playSfx('click', settings);
            setActiveTab('background');
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
            activeTab === 'background'
              ? 'bg-purple-500/20 border-purple-400/70 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t('bgCustom')}</span>
        </button>

        <button
          onClick={() => {
            audio.playSfx('click', settings);
            setActiveTab('upgrades');
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
            activeTab === 'upgrades'
              ? 'bg-amber-500/20 border-amber-400/70 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{t('upgrades')}</span>
        </button>
      </div>

      {/* Rarity Filter Bar for Palettes and Backgrounds */}
      {activeTab !== 'upgrades' && (
        <div className="w-full max-w-md flex items-center justify-between gap-1 z-10 mb-2 px-0.5">
          {(['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const).map((r) => {
            const isSelected = selectedRarityFilter === r;
            const label = r === 'ALL' 
              ? (lang === 'pt' ? 'Todos' : lang === 'es' ? 'Todos' : 'All')
              : getRarityBadge(r).label;

            return (
              <button
                key={r}
                onClick={() => {
                  audio.playSfx('click', settings);
                  setSelectedRarityFilter(r);
                }}
                className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all border ${
                  isSelected
                    ? r === 'LEGENDARY'
                      ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-sm'
                      : r === 'EPIC'
                      ? 'bg-purple-500/30 border-purple-400 text-purple-300 shadow-sm'
                      : r === 'RARE'
                      ? 'bg-sky-500/30 border-sky-400 text-sky-300 shadow-sm'
                      : 'bg-slate-800 border-slate-600 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-md flex-1 overflow-y-auto z-10 pr-1 space-y-2.5 pb-2 custom-scrollbar">
        {/* TAB 1: CHARACTER CUSTOMIZATION (PALETAS COM RARIDADES) */}
        {activeTab === 'character' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2.5"
          >
            {/* Toggle Active Custom Character */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{t('enableCustomChar')}</span>
                <span className="text-[10px] text-slate-400">Aplica paleta, adornos e auras exclusivas</span>
              </div>
              <button
                onClick={() => {
                  audio.playSfx('click', settings);
                  onSaveCustomChar({ enabled: !customChar.enabled });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  customChar.enabled
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {customChar.enabled ? t('on') : t('off')}
              </button>
            </div>

            {/* Character Sub-Tabs Selector */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  audio.playSfx('click', settings);
                  setCharacterSubTab('palettes');
                }}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                  characterSubTab === 'palettes'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="w-3 h-3" />
                <span>Paletas</span>
              </button>

              <button
                onClick={() => {
                  audio.playSfx('click', settings);
                  setCharacterSubTab('accessories');
                }}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                  characterSubTab === 'accessories'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-3 h-3" />
                <span>Adornos VIP</span>
              </button>

              <button
                onClick={() => {
                  audio.playSfx('click', settings);
                  setCharacterSubTab('auras');
                }}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                  characterSubTab === 'auras'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Auras 3D</span>
              </button>
            </div>

            {/* SUB-TAB 1: PALETAS DE CORES */}
            {characterSubTab === 'palettes' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredPalettes.map((pal) => {
                    const isUnlocked = unlockedPalettes.includes(pal.id);
                    const isEquipped =
                      customChar.enabled &&
                      customChar.primaryColor === pal.primaryColor &&
                      customChar.glowColor === pal.glowColor;
                    const isCurrentlyPreviewed =
                      previewChar !== null &&
                      previewChar.primaryColor === pal.primaryColor &&
                      previewChar.glowColor === pal.glowColor;

                    const rarityMeta = getRarityBadge(pal.rarity);
                    const canAfford = coins >= pal.price;

                    return (
                      <div
                        key={pal.id}
                        onClick={() => handlePaletteClick(pal)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden cursor-pointer active:scale-[0.98] ${rarityMeta.cardBg} ${
                          isEquipped
                            ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                            : isCurrentlyPreviewed
                            ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-950/30'
                            : rarityMeta.borderColor
                        }`}
                      >
                        {/* Top Row: Rarity Badge and Swatches */}
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className="flex items-center gap-1">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 border ${rarityMeta.color}`}>
                              {rarityMeta.icon}
                              <span>{rarityMeta.label}</span>
                            </span>

                            {isCurrentlyPreviewed && (
                              <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 animate-pulse">
                                PREVIEW
                              </span>
                            )}
                          </div>

                          {/* Color Preview Orbs */}
                          <div className="flex items-center gap-1 bg-slate-950/80 px-1.5 py-0.5 rounded-full border border-slate-700">
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-sm"
                              style={{ backgroundColor: pal.primaryColor }}
                              title="Cor Principal"
                            />
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-sm"
                              style={{ backgroundColor: pal.glowColor }}
                              title="Cor do Halo Neon"
                            />
                          </div>
                        </div>

                        <span className="text-xs font-black text-white mb-0.5">
                          {pal.name}
                        </span>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mb-2 leading-tight">{pal.desc}</p>

                        {/* Bottom Action Footer */}
                        <div className="flex items-center justify-between w-full pt-1.5 border-t border-slate-800/80 mt-auto">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {pal.particleType.replace('_', ' ')}
                          </span>

                          {isEquipped ? (
                            <span className="text-[10px] font-black text-cyan-400 flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                              <Check className="w-3 h-3" /> {t('equipped')}
                            </span>
                          ) : isUnlocked ? (
                            <button
                              onClick={(e) => handlePaletteAction(pal, e)}
                              className="text-[10px] font-black text-slate-200 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-all active:scale-95"
                            >
                              {t('equip')}
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handlePaletteAction(pal, e)}
                              className={`text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all active:scale-95 ${
                                canAfford
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110'
                                  : 'bg-slate-800 text-amber-400/70 border border-amber-500/20'
                              }`}
                            >
                              <Lock className="w-3 h-3" />
                              <span>{pal.price === 0 ? 'GRÁTIS' : `${pal.price} 🪙`}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Precision Color Controls */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 shadow-sm">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ajuste Fino RGB Personalizado</span>
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold">{t('primaryColor')}</label>
                      <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                        <input
                          type="color"
                          value={effectiveChar.primaryColor}
                          onChange={(e) =>
                            onSaveCustomChar({ enabled: true, primaryColor: e.target.value })
                          }
                          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-[11px] font-mono text-slate-300 uppercase">
                          {effectiveChar.primaryColor}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold">{t('glowColor')}</label>
                      <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                        <input
                          type="color"
                          value={effectiveChar.glowColor}
                          onChange={(e) =>
                            onSaveCustomChar({ enabled: true, glowColor: e.target.value })
                          }
                          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-[11px] font-mono text-slate-300 uppercase">
                          {effectiveChar.glowColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* SUB-TAB 2: ADORNOS & ITENS VIP */}
            {characterSubTab === 'accessories' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CUSTOM_ACCESSORIES.map((acc) => {
                  const isEquipped = customChar.enabled && (customChar.accessory || 'crown') === acc.accessoryType;
                  const isCurrentlyPreviewed = previewChar?.accessory === acc.accessoryType;
                  const rarityMeta = getRarityBadge(acc.rarity);

                  return (
                    <div
                      key={acc.id}
                      onClick={() => {
                        setPreviewChar({
                          ...effectiveChar,
                          enabled: true,
                          accessory: acc.accessoryType,
                        });
                        audio.playSfx('click', settings);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden cursor-pointer active:scale-[0.98] ${rarityMeta.cardBg} ${
                        isEquipped
                          ? 'border-amber-400 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : isCurrentlyPreviewed
                          ? 'border-cyan-400 ring-2 ring-cyan-400/40 bg-cyan-950/30'
                          : rarityMeta.borderColor
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 border ${rarityMeta.color}`}>
                          {rarityMeta.icon}
                          <span>{rarityMeta.label}</span>
                        </span>

                        <span className="text-xl">{acc.icon}</span>
                      </div>

                      <span className="text-xs font-black text-white mb-0.5">{acc.name}</span>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mb-2 leading-tight">{acc.desc}</p>

                      <div className="flex items-center justify-between w-full pt-1.5 border-t border-slate-800/80 mt-auto">
                        <span className="text-[9px] font-bold text-amber-300 font-mono">
                          {acc.price === 0 ? 'VIP INCLUSO' : `${acc.price} 🪙`}
                        </span>

                        {isEquipped ? (
                          <span className="text-[10px] font-black text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                            <Check className="w-3 h-3" /> {t('equipped')}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSaveCustomChar({
                                enabled: true,
                                accessory: acc.accessoryType,
                              });
                              setPreviewChar(null);
                              audio.playSfx('powerup', settings);
                              showToast(`${acc.name} EQUIPADO!`, 'success');
                            }}
                            className="text-[10px] font-black text-slate-200 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-all active:scale-95"
                          >
                            {t('equip')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SUB-TAB 3: AURAS CÓSMICAS 3D */}
            {characterSubTab === 'auras' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CUSTOM_AURAS.map((aura) => {
                  const isEquipped = customChar.enabled && (customChar.auraEffect || 'cosmic_rings') === aura.auraType;
                  const isCurrentlyPreviewed = previewChar?.auraEffect === aura.auraType;
                  const rarityMeta = getRarityBadge(aura.rarity);

                  return (
                    <div
                      key={aura.id}
                      onClick={() => {
                        setPreviewChar({
                          ...effectiveChar,
                          enabled: true,
                          auraEffect: aura.auraType,
                        });
                        audio.playSfx('click', settings);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden cursor-pointer active:scale-[0.98] ${rarityMeta.cardBg} ${
                        isEquipped
                          ? 'border-purple-400 bg-purple-950/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                          : isCurrentlyPreviewed
                          ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-950/30'
                          : rarityMeta.borderColor
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 border ${rarityMeta.color}`}>
                          {rarityMeta.icon}
                          <span>{rarityMeta.label}</span>
                        </span>

                        <span className="text-xl">{aura.icon}</span>
                      </div>

                      <span className="text-xs font-black text-white mb-0.5">{aura.name}</span>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mb-2 leading-tight">{aura.desc}</p>

                      <div className="flex items-center justify-between w-full pt-1.5 border-t border-slate-800/80 mt-auto">
                        <span className="text-[9px] font-bold text-purple-300 font-mono">
                          {aura.price === 0 ? 'VIP INCLUSO' : `${aura.price} 🪙`}
                        </span>

                        {isEquipped ? (
                          <span className="text-[10px] font-black text-purple-400 flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/30">
                            <Check className="w-3 h-3" /> {t('equipped')}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSaveCustomChar({
                                enabled: true,
                                auraEffect: aura.auraType,
                              });
                              setPreviewChar(null);
                              audio.playSfx('powerup', settings);
                              showToast(`${aura.name} EQUIPADA!`, 'success');
                            }}
                            className="text-[10px] font-black text-slate-200 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-all active:scale-95"
                          >
                            {t('equip')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: ABYSS BACKGROUNDS (FUNDOS DO ABISMO COM RARIDADE) */}
        {activeTab === 'background' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2.5"
          >
            {/* Toggle Custom Theme */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{t('enableCustomBg')}</span>
                <span className="text-[10px] text-slate-400">Ativa o ambiente personalizado durante a partida</span>
              </div>
              <button
                onClick={() => {
                  audio.playSfx('click', settings);
                  onSaveCustomTheme({ enabled: !customTheme.enabled });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  customTheme.enabled
                    ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {customTheme.enabled ? t('on') : t('off')}
              </button>
            </div>

            {/* List of Abyss Arenas by Rarity */}
            <div className="grid grid-cols-1 gap-2">
              {filteredBackgrounds.map((bg) => {
                const isUnlocked = unlockedBackgrounds.includes(bg.id);
                const isEquipped =
                  customTheme.enabled &&
                  customTheme.bgGradient[0] === bg.bgGradient[0] &&
                  customTheme.wallGlow === bg.wallGlow;
                const isCurrentlyPreviewed =
                  previewTheme !== null &&
                  previewTheme.bgGradient &&
                  previewTheme.bgGradient[0] === bg.bgGradient[0] &&
                  previewTheme.wallGlow === bg.wallGlow;

                const rarityMeta = getRarityBadge(bg.rarity);
                const canAfford = coins >= bg.price;

                return (
                  <div
                    key={bg.id}
                    onClick={() => handleBackgroundClick(bg)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between relative overflow-hidden cursor-pointer active:scale-[0.98] ${rarityMeta.cardBg} ${
                      isEquipped
                        ? 'border-purple-400 bg-purple-950/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : isCurrentlyPreviewed
                        ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-950/30'
                        : rarityMeta.borderColor
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Mini Arena Preview Swatch */}
                      <div
                        className="w-12 h-12 rounded-xl border border-white/20 shadow-md flex items-center justify-center shrink-0 relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${bg.bgGradient[0]}, ${bg.bgGradient[1]})`,
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full shadow-lg"
                          style={{ backgroundColor: bg.wallGlow }}
                        />
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-1.5"
                          style={{ backgroundColor: bg.wallColor }}
                        />
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-1.5"
                          style={{ backgroundColor: bg.wallColor }}
                        />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 border ${rarityMeta.color}`}>
                            {rarityMeta.icon}
                            <span>{rarityMeta.label}</span>
                          </span>

                          {isCurrentlyPreviewed && (
                            <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 animate-pulse">
                              PREVIEW
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-black text-white">
                          {bg.name}
                        </span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{bg.desc}</span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="shrink-0 pl-2">
                      {isEquipped ? (
                        <span className="text-[10px] font-black text-purple-400 flex items-center gap-1 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/30">
                          <Check className="w-3 h-3" /> {t('equipped')}
                        </span>
                      ) : isUnlocked ? (
                        <button
                          onClick={(e) => handleBackgroundAction(bg, e)}
                          className="text-[10px] font-black text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-all active:scale-95"
                        >
                          {t('equip')}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleBackgroundAction(bg, e)}
                          className={`text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all active:scale-95 ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110'
                              : 'bg-slate-800 text-amber-400/70 border border-amber-500/20'
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          <span>{bg.price === 0 ? 'GRÁTIS' : `${bg.price} 🪙`}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 3: UPGRADES & COSMETIC PROGRESSION (APRIMORAR COSMÉTICOS) */}
        {activeTab === 'upgrades' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2.5"
          >
            {/* Informational reassurance notice on fair play */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/40 flex items-center gap-2.5 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-amber-300">
                  Aprimoramentos Cosméticos VIP
                </span>
                <span className="text-[10px] text-amber-200/90 font-medium">
                  Evolua a densidade do rastro, halos de luz e partículas orbitais. <strong>100% estético e sem vantagens desleais.</strong>
                </span>
              </div>
            </div>

            {UPGRADE_DEFINITIONS.map((def) => {
              const currentLvl = upgrades[def.id] || 0;
              const isMax = currentLvl >= def.maxLevel;
              const canAfford = coins >= def.costPerLevel;

              const getIcon = () => {
                switch (def.icon) {
                  case 'Sparkles':
                    return <Sparkles className="w-4 h-4 text-cyan-400" />;
                  case 'Sun':
                    return <Sun className="w-4 h-4 text-amber-400" />;
                  case 'Clock':
                    return <Clock className="w-4 h-4 text-purple-400" />;
                  case 'Sliders':
                    return <Sliders className="w-4 h-4 text-emerald-400" />;
                  case 'Zap':
                    return <Zap className="w-4 h-4 text-yellow-400" />;
                  default:
                    return <Sparkles className="w-4 h-4 text-cyan-400" />;
                }
              };

              return (
                <div
                  key={def.id}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 shadow-md hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/80 shadow-inner">
                        {getIcon()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white">{def.name}</span>
                        <span className="text-[10px] text-slate-400">{def.desc}</span>
                      </div>
                    </div>

                    {/* Level Badge */}
                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-700 shrink-0">
                      <span className="text-[10px] font-black text-amber-300">
                        NV {currentLvl}/{def.maxLevel}
                      </span>
                    </div>
                  </div>

                  {/* 5-Pip Progress Bar */}
                  <div className="flex items-center gap-1.5 w-full">
                    {Array.from({ length: def.maxLevel }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i < currentLvl
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Bottom Stats & Upgrade Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 mt-0.5">
                    <span className="text-[10px] font-bold text-cyan-300">
                      {def.getEffectDesc(currentLvl)}
                    </span>

                    <button
                      disabled={isMax}
                      onClick={() => handleUpgradeAction(def)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110'
                          : 'bg-slate-800 text-amber-400/60 border border-amber-500/20'
                      }`}
                    >
                      {isMax ? (
                        <span>{t('maxLevel')}</span>
                      ) : (
                        <>
                          <Coins className="w-3.5 h-3.5" />
                          <span>{def.costPerLevel} 🪙</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-2xl text-xs font-black tracking-wide flex items-center gap-2 backdrop-blur-md border ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/80 text-rose-200'
                : toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-400/80 text-emerald-200'
                : 'bg-slate-900/90 border-cyan-400/80 text-cyan-200'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <Info className="w-4 h-4 text-rose-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
