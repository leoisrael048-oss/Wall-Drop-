/**
 * WALL DROP - Standalone Embedded Water Drop Arcade Game
 * 100% Offline | Fluid Gel Physics | Canvas 60 FPS | Native AdMob Bridge
 * Viral Death Replay | Social Percentile Comparison | Comic Narrator
 */

(function () {
  'use strict';

  // --- NATIVE BRIDGE HELPERS ---
  const Bridge = {
    vibrate(ms) {
      try {
        if (window.Android && typeof window.Android.vibrate === 'function') {
          window.Android.vibrate(ms);
        } else if (window.AndroidBridge && typeof window.AndroidBridge.vibrate === 'function') {
          window.AndroidBridge.vibrate(ms);
        } else if (navigator.vibrate) {
          navigator.vibrate(ms);
        }
      } catch (e) {}
    },

    showInterstitial() {
      try {
        if (window.Android && typeof window.Android.showInterstitial === 'function') {
          window.Android.showInterstitial();
        } else if (window.AndroidBridge && typeof window.AndroidBridge.showInterstitial === 'function') {
          window.AndroidBridge.showInterstitial();
        } else {
          console.log('[NativeBridge] Interstitial requested');
        }
      } catch (e) {
        console.warn('Ad error:', e);
      }
    },

    showRewardedAd(onReward) {
      const cbName = '__wall_drop_reward_cb_' + Date.now();
      window[cbName] = function (success) {
        delete window[cbName];
        onReward(!!success);
      };

      try {
        if (window.Android && typeof window.Android.showRewardedAd === 'function') {
          window.Android.showRewardedAd(cbName);
        } else if (window.AndroidBridge && typeof window.AndroidBridge.showRewardedAd === 'function') {
          window.AndroidBridge.showRewardedAd(cbName);
        } else {
          // Fallback simulation in web
          setTimeout(() => {
            if (window[cbName]) window[cbName](true);
          }, 800);
        }
      } catch (e) {
        if (window[cbName]) window[cbName](false);
      }
    },

    shareMedia(base64Data, mimeType, text, title) {
      try {
        if (window.Android && typeof window.Android.shareMedia === 'function') {
          window.Android.shareMedia(base64Data, mimeType || 'image/png', text, title || 'Wall Drop Replay');
          return;
        } else if (window.AndroidBridge && typeof window.AndroidBridge.shareMedia === 'function') {
          window.AndroidBridge.shareMedia(base64Data, mimeType || 'image/png', text, title || 'Wall Drop Replay');
          return;
        } else if (window.Android && typeof window.Android.shareImage === 'function') {
          window.Android.shareImage(base64Data, text);
          return;
        }
      } catch (e) {
        console.warn('Native shareMedia failed, trying fallback:', e);
      }

      // Web Share API fallback if supported
      if (navigator.share) {
        try {
          if (base64Data && window.fetch) {
            fetch(base64Data)
              .then(res => res.blob())
              .then(blob => {
                const file = new File([blob], 'walldrop_replay.png', { type: mimeType || 'image/png' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                  navigator.share({
                    title: title || 'Wall Drop Replay',
                    text: text,
                    files: [file]
                  }).catch(() => {
                    this.share(text);
                  });
                } else {
                  this.share(text);
                }
              })
              .catch(() => this.share(text));
            return;
          }
        } catch (err) {}
      }

      this.share(text);
    },

    share(text) {
      try {
        if (window.Android && typeof window.Android.share === 'function') {
          window.Android.share(text);
        } else if (window.AndroidBridge && typeof window.AndroidBridge.share === 'function') {
          window.AndroidBridge.share(text);
        } else if (navigator.share) {
          navigator.share({ title: 'Wall Drop', text });
        } else {
          // Clipboard fallback
          if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            alert('Texto copiado para a área de transferência:\n\n' + text);
          }
        }
      } catch (e) {}
    }
  };

  // --- AUDIO SYNTHESIZER (100% PROCEDURAL OFFLINE SOUNDS) ---
  class SoundSynth {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    play(type) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'tap') {
        // Fluid splash pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'coin') {
        // Celestial chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'nearmiss') {
        // High-tension sci-fi swish
        osc.type = 'sine';
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.linearRampToValueAtTime(280, now + 0.16);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'shield') {
        // Powerup pulse
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'funnyDeath') {
        // Comical multi-stage cartoon death sound (slide whistle drop + funny boing splat)
        const oscWhistle = this.ctx.createOscillator();
        const gainWhistle = this.ctx.createGain();
        oscWhistle.type = 'triangle';
        oscWhistle.connect(gainWhistle);
        gainWhistle.connect(this.ctx.destination);

        // Slide whistle downward
        oscWhistle.frequency.setValueAtTime(950, now);
        oscWhistle.frequency.exponentialRampToValueAtTime(160, now + 0.38);
        gainWhistle.gain.setValueAtTime(0.35, now);
        gainWhistle.gain.linearRampToValueAtTime(0.4, now + 0.2);
        gainWhistle.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        oscWhistle.start(now);
        oscWhistle.stop(now + 0.4);

        // Funny rubbery bonk-splat on impact
        setTimeout(() => {
          if (!this.ctx) return;
          const t = this.ctx.currentTime;
          const oscBonk = this.ctx.createOscillator();
          const gainBonk = this.ctx.createGain();
          oscBonk.type = 'sawtooth';
          oscBonk.connect(gainBonk);
          gainBonk.connect(this.ctx.destination);

          oscBonk.frequency.setValueAtTime(240, t);
          oscBonk.frequency.exponentialRampToValueAtTime(45, t + 0.28);
          gainBonk.gain.setValueAtTime(0.5, t);
          gainBonk.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
          oscBonk.start(t);
          oscBonk.stop(t + 0.28);
        }, 180);
      } else if (type === 'combo') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.05);
        osc.frequency.setValueAtTime(783.99, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    }
  }

  // --- NARRATOR SYSTEM BRIDGE ---
  const Narrator = {
    speak(category) {
      if (window.Narrator && typeof window.Narrator.speak === 'function') {
        return window.Narrator.speak(category);
      }
      return '';
    },
    testVoice() {
      if (window.Narrator && typeof window.Narrator.testVoice === 'function') {
        window.Narrator.testVoice();
      }
    }
  };

  // --- SOCIAL COMPARISON ENGINE ---
  const SocialComparison = {
    getComparison(score) {
      if (score <= 5) {
        const pct = Math.floor(Math.random() * 8 + 91); // 91 - 98%
        return {
          icon: '💀',
          headline: `Pior que ${pct}% dos jogadores hoje!`,
          desc: 'O muro nem precisou se esforçar... Bateu na largada!',
          badge: 'Nível: Preguiça Sonolenta'
        };
      } else if (score <= 18) {
        const pct = Math.floor(Math.random() * 12 + 75); // 75 - 86%
        return {
          icon: '🥴',
          headline: `Pior que ${pct}% das pessoas hoje`,
          desc: 'Reflexos ainda aquecendo... Dá pra fazer 3x melhor!',
          badge: 'Nível: Aquecendo os Motores'
        };
      } else if (score <= 45) {
        const pct = Math.floor(Math.random() * 18 + 52); // 52 - 69%
        return {
          icon: '⚡',
          headline: `Você superou ${pct}% dos jogadores!`,
          desc: 'Reflexos rápidos! Está acima da média geral.',
          badge: 'Nível: Mergulhador Veloz'
        };
      } else if (score <= 85) {
        const pct = Math.floor(Math.random() * 10 + 78); // 78 - 87%
        return {
          icon: '🔥',
          headline: `Você superou ${pct}% de todos os jogadores!`,
          desc: 'Quase um ninja da queda livre! Seus reflexos são de elite.',
          badge: 'Nível: Mestre do Desvio'
        };
      } else if (score <= 140) {
        const topPct = (Math.random() * 3 + 3.2).toFixed(1); // Top 3.2% - 6.1%
        return {
          icon: '🏆',
          headline: `Apenas ${topPct}% dos jogadores chegam aqui!`,
          desc: 'Top mundial de velocidade! Quase impossível desviar nessa velocidade.',
          badge: 'Nível: Lenda da Queda Livre'
        };
      } else {
        const topPct = (Math.random() * 0.9 + 0.4).toFixed(1); // Top 0.4% - 1.2%
        return {
          icon: '👑',
          headline: `TOP ${topPct}% GLOBAL! INCRÍVEL!`,
          desc: 'Reflexos sobre-humanos! Compartilhe antes que duvidem de você!',
          badge: 'Nível: DEUS DOS MUROS'
        };
      }
    }
  };

  // --- REPLAY BUFFER RECORDER (Continuous 3-Second Snapshots) ---
  class ReplayRecorder {
    constructor(maxFrames = 50) {
      this.maxFrames = maxFrames;
      this.frames = [];
      this.lastRecordTime = 0;
      this.recordInterval = 65; // ~15 FPS capture
      this.isPlaying = false;
      this.playbackIndex = 0;
      this.animId = null;
      this.canvas = null;
      this.ctx = null;
    }

    reset() {
      this.frames = [];
      this.lastRecordTime = 0;
    }

    captureFrame(game) {
      const now = performance.now();
      if (now - this.lastRecordTime < this.recordInterval) return;
      this.lastRecordTime = now;

      // Compact snapshot of game world
      const snapshot = {
        score: game.score,
        drop: {
          x: game.drop.x,
          y: game.drop.y,
          radius: game.drop.radius,
          squashX: game.drop.squashX,
          squashY: game.drop.squashY,
          isDeadFace: game.deathPhase > 0,
          deathAnimProgress: game.deathTimer / 0.55
        },
        obstacles: game.obstacles.map(o => ({
          x: o.side === 'left' ? game.wallPadding : game.width - game.wallPadding - o.width,
          y: o.y,
          width: o.width,
          height: o.height,
          side: o.side
        })),
        dewdrops: game.dewdrops.map(d => ({ x: d.x, y: d.y, radius: d.radius })),
        particles: game.particles.slice(0, 20).map(p => ({ x: p.x, y: p.y, radius: p.radius, color: p.color, alpha: p.alpha })),
        skin: game.getActiveSkin(),
        wallPadding: game.wallPadding,
        width: game.width,
        height: game.height
      };

      this.frames.push(snapshot);
      if (this.frames.length > this.maxFrames) {
        this.frames.shift();
      }
    }

    startPlayback(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.isPlaying = true;
      this.playbackIndex = 0;

      if (this.animId) cancelAnimationFrame(this.animId);

      let lastLoopTime = performance.now();
      const loop = (timestamp) => {
        if (!this.isPlaying) return;

        if (timestamp - lastLoopTime > 60) { // ~16 FPS playback
          lastLoopTime = timestamp;
          this.renderReplayFrame();
          this.playbackIndex = (this.playbackIndex + 1) % Math.max(1, this.frames.length);
        }
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }

    stopPlayback() {
      this.isPlaying = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }

    renderReplayFrame() {
      if (!this.ctx || this.frames.length === 0) return;
      const frame = this.frames[this.playbackIndex];
      const cw = this.canvas.width;
      const ch = this.canvas.height;
      const ctx = this.ctx;

      ctx.clearRect(0, 0, cw, ch);

      // Scale factor from game coordinates to replay canvas
      const scaleX = cw / frame.width;
      const scaleY = ch / frame.height;

      // Dark background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, cw, ch);

      // Walls
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, frame.wallPadding * scaleX, ch);
      ctx.fillRect(cw - frame.wallPadding * scaleX, 0, frame.wallPadding * scaleX, ch);

      // Neon Wall Borders
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(frame.wallPadding * scaleX, 0);
      ctx.lineTo(frame.wallPadding * scaleX, ch);
      ctx.moveTo(cw - frame.wallPadding * scaleX, 0);
      ctx.lineTo(cw - frame.wallPadding * scaleX, ch);
      ctx.stroke();

      // Obstacles
      for (const obs of frame.obstacles) {
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 6;
        ctx.fillRect(obs.x * scaleX, obs.y * scaleY, obs.width * scaleX, obs.height * scaleY);
      }
      ctx.shadowBlur = 0;

      // Dewdrops
      for (const coin of frame.dewdrops) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(coin.x * scaleX, coin.y * scaleY, Math.max(3, coin.radius * scaleX), 0, Math.PI * 2);
        ctx.fill();
      }

      // Particles
      for (const p of frame.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x * scaleX, p.y * scaleY, Math.max(2, p.radius * scaleX), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Drop Player
      const drop = frame.drop;
      const dx = drop.x * scaleX;
      const dy = drop.y * scaleY;
      const dr = drop.radius * scaleX;

      ctx.save();
      ctx.translate(dx, dy);
      ctx.scale(drop.squashX, drop.squashY);

      // Drop Body
      ctx.fillStyle = frame.skin.primary;
      ctx.shadowColor = frame.skin.glow;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, dr, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Exaggerated death face or normal face
      if (drop.isDeadFace) {
        // Giant popped bug eyes with spinning tiny pupils
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-dr * 0.45, -dr * 0.2, dr * 0.45, 0, Math.PI * 2);
        ctx.arc(dr * 0.45, -dr * 0.2, dr * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-dr * 0.45, -dr * 0.2, dr * 0.18, 0, Math.PI * 2);
        ctx.arc(dr * 0.45, -dr * 0.2, dr * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // Shocked "O" mouth
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.ellipse(0, dr * 0.35, dr * 0.3, dr * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Cute eyes looking down
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-dr * 0.3, -dr * 0.1, dr * 0.25, 0, Math.PI * 2);
        ctx.arc(dr * 0.3, -dr * 0.1, dr * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-dr * 0.3, dr * 0.05, dr * 0.12, 0, Math.PI * 2);
        ctx.arc(dr * 0.3, dr * 0.05, dr * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Watermark in bottom corner (discrete and sleek)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('💧 WALL DROP • #WallDrop', cw - 8, ch - 8);

      // Scrubber progress line
      const progress = (this.playbackIndex / Math.max(1, this.frames.length));
      ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.fillRect(0, ch - 3, cw * progress, 3);
    }

    generateShareImage(game, socialVerdict) {
      // Create high-res viral card with score, social roast, and death frame
      const offscreen = document.createElement('canvas');
      offscreen.width = 600;
      offscreen.height = 700;
      const ctx = offscreen.getContext('2d');

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 700);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 700);

      // Header Banner
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💧 WALL DROP ⚡', 300, 56);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 15px sans-serif';
      ctx.fillText('QUEDA LIVRE VERTICAL', 300, 84);

      // Score Box
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.roundRect ? ctx.roundRect(40, 110, 520, 110, 18) : ctx.fillRect(40, 110, 520, 110);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('PONTUAÇÃO FINAL', 300, 142);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 52px sans-serif';
      ctx.fillText(`${game.score} PTS`, 300, 198);

      // Social Roast / Percentile Banner
      ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
      ctx.lineWidth = 2;
      ctx.roundRect ? ctx.roundRect(40, 240, 520, 90, 16) : ctx.fillRect(40, 240, 520, 90);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.font = '900 18px sans-serif';
      ctx.fillText(`${socialVerdict.icon} ${socialVerdict.headline}`, 300, 275);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px sans-serif';
      ctx.fillText(socialVerdict.desc, 300, 305);

      // Death Replay Snapshot
      if (this.canvas) {
        ctx.fillStyle = '#000000';
        ctx.roundRect ? ctx.roundRect(40, 350, 520, 260, 16) : ctx.fillRect(40, 350, 520, 260);
        ctx.fill();
        ctx.drawImage(this.canvas, 40, 350, 520, 260);
      }

      // Discrete Branding Watermark
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('Jogue agora • Desafie seus amigos no Wall Drop!', 300, 650);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = '12px sans-serif';
      ctx.fillText('💧 WALL DROP • #WallDropChallenge', 300, 675);

      return offscreen.toDataURL('image/png');
    }
  }

  // --- STORAGE & PROGRESSION ---
  const Storage = {
    get() {
      try {
        return JSON.parse(localStorage.getItem('walldrop_data')) || {
          highScore: 0,
          coins: 0,
          gamesPlayed: 0,
          selectedSkin: 'aqua',
          unlockedSkins: ['aqua']
        };
      } catch (e) {
        return { highScore: 0, coins: 0, gamesPlayed: 0, selectedSkin: 'aqua', unlockedSkins: ['aqua'] };
      }
    },
    save(data) {
      try {
        localStorage.setItem('walldrop_data', JSON.stringify(data));
      } catch (e) {}
    }
  };

  // --- SKINS CONFIG ---
  const SKINS = [
    { id: 'aqua', name: 'Aqua Pure', primary: '#38bdf8', accent: '#0284c7', glow: 'rgba(56,189,248,0.7)', cost: 0 },
    { id: 'plasma', name: 'Neon Pink', primary: '#f43f5e', accent: '#e11d48', glow: 'rgba(244,63,94,0.7)', cost: 100 },
    { id: 'emerald', name: 'Bio Toxic', primary: '#10b981', accent: '#059669', glow: 'rgba(16,185,129,0.7)', cost: 250 },
    { id: 'gold', name: 'Golden Drop', primary: '#fbbf24', accent: '#d97706', glow: 'rgba(251,191,36,0.7)', cost: 500 },
    { id: 'amethyst', name: 'Void Purple', primary: '#a855f7', accent: '#7e22ce', glow: 'rgba(168,85,247,0.7)', cost: 800 },
    { id: 'phantom', name: 'White Ghost', primary: '#ffffff', accent: '#94a3b8', glow: 'rgba(255,255,255,0.8)', cost: 1200 }
  ];

  // --- MAIN GAME CLASS ---
  class WallDropGame {
    constructor() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.audio = new SoundSynth();
      this.recorder = new ReplayRecorder(50);
      this.userData = Storage.get();

      window.wallDropSettings = { voiceEnabled: true };

      // Dimensions
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // State
      this.state = 'MENU'; // MENU, PLAYING, DEATH_ANIM, GAMEOVER, WORKSHOP
      this.score = 0;
      this.coins = this.userData.coins;
      this.coinsInRun = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.speed = 320;
      this.distance = 0;

      // Drop Player Properties
      this.drop = {
        side: 0, // 0: left, 1: right
        x: 0,
        y: 0,
        targetX: 0,
        radius: 17,
        vx: 0,
        squashX: 1,
        squashY: 1,
        wobble: 0,
        shield: false,
        trail: []
      };

      // Entities
      this.obstacles = [];
      this.dewdrops = [];
      this.particles = [];
      this.floatingTexts = [];
      this.deathEyeParticles = [];

      // Timing & FX
      this.lastTime = 0;
      this.shakeTime = 0;
      this.shakeMag = 0;
      this.slowMoTime = 0;
      this.cameraZoom = 1.0;
      this.wallPadding = 36;
      this.spawnTimer = 0;
      this.currentSocialVerdict = null;

      // Death Sequence Timers
      this.deathTimer = 0;
      this.deathDuration = 0.58; // 580ms exaggerated funny death moment
      this.deathPhase = 0; // 0: none, 1: slow-mo freeze shocked face, 2: pop explosion

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 100));

      this.bindInputs();
      this.renderWorkshopSkins();
      this.updateMenuStats();

      // Start Game Loop
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
      const container = document.getElementById('game-container');
      const rect = container.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;

      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.ctx.resetTransform?.();
      this.ctx.scale(this.dpr, this.dpr);

      // Replay mini canvas setup
      const replayCanvas = document.getElementById('replay-canvas');
      if (replayCanvas) {
        replayCanvas.width = 280;
        replayCanvas.height = 150;
      }

      if (this.state === 'MENU') {
        this.drop.x = this.wallPadding + this.drop.radius;
        this.drop.y = this.height * 0.35;
        this.drop.targetX = this.drop.x;
      }
    }

    bindInputs() {
      const handleTap = (e) => {
        if (e.target.closest('button') || e.target.closest('.skins-grid')) return;

        if (this.state === 'PLAYING') {
          this.switchSide();
        }
      };

      this.canvas.addEventListener('pointerdown', handleTap);

      // Buttons
      document.getElementById('btn-play').addEventListener('click', () => this.startGame());
      document.getElementById('btn-restart').addEventListener('click', () => this.startGame());
      document.getElementById('btn-workshop').addEventListener('click', () => this.showWorkshop());
      document.getElementById('btn-workshop-back').addEventListener('click', () => this.showMenu());
      document.getElementById('btn-menu').addEventListener('click', () => this.showMenu());
      document.getElementById('btn-rewarded-ad').addEventListener('click', () => this.watchRewardedAd());
      document.getElementById('btn-share-replay').addEventListener('click', () => this.shareReplay());

      // Settings Navigation & Triggers
      const openSettings = () => this.showSettings();
      document.getElementById('btn-hud-settings')?.addEventListener('click', openSettings);
      document.getElementById('btn-menu-settings')?.addEventListener('click', openSettings);
      document.getElementById('btn-go-settings')?.addEventListener('click', openSettings);
      document.getElementById('btn-settings-back')?.addEventListener('click', () => {
        if (this.previousScreen === 'GAMEOVER') {
          this.showScreen('gameover-screen');
          this.recorder.startPlayback('replay-canvas');
        } else {
          this.showMenu();
        }
      });

      this.setupSettingsUI();

      // Keyboard Controls for PC testing
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
          if (this.state === 'PLAYING') {
            this.switchSide();
          } else if (this.state === 'MENU' || this.state === 'GAMEOVER') {
            this.startGame();
          }
        }
      });
    }

    updateMenuStats() {
      document.getElementById('menu-best-score').textContent = this.userData.highScore;
      document.getElementById('menu-coins').textContent = this.userData.coins;
      document.getElementById('workshop-coins').textContent = this.userData.coins;
    }

    startGame() {
      this.audio.init();
      this.recorder.reset();
      this.recorder.stopPlayback();

      this.state = 'PLAYING';
      this.score = 0;
      this.coinsInRun = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.speed = 340;
      this.distance = 0;
      this.slowMoTime = 0;
      this.cameraZoom = 1.0;
      this.deathPhase = 0;
      this.deathTimer = 0;

      this.drop.side = 0;
      this.drop.radius = 17;
      this.drop.x = this.wallPadding + this.drop.radius;
      this.drop.y = this.height * 0.35;
      this.drop.targetX = this.drop.x;
      this.drop.squashX = 1;
      this.drop.squashY = 1;
      this.drop.wobble = 0;
      this.drop.shield = false;
      this.drop.trail = [];

      this.obstacles = [];
      this.dewdrops = [];
      this.particles = [];
      this.floatingTexts = [];
      this.deathEyeParticles = [];

      this.hideAllScreens();
      Narrator.speak('start');
      this.updateHUD();
    }

    switchSide() {
      this.drop.side = this.drop.side === 0 ? 1 : 0;
      const targetLeft = this.wallPadding + this.drop.radius;
      const targetRight = this.width - this.wallPadding - this.drop.radius;
      this.drop.targetX = this.drop.side === 0 ? targetLeft : targetRight;

      // Comical Squish on takeoff
      this.drop.squashX = 0.6;
      this.drop.squashY = 1.45;
      this.drop.wobble = (Math.random() - 0.5) * 0.45;

      this.audio.play('tap');
      Bridge.vibrate(18);

      // Splash particles
      this.createSplash(this.drop.x, this.drop.y, this.drop.side === 0 ? 1 : -1);
    }

    createSplash(x, y, dir) {
      const skin = this.getActiveSkin();
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          x,
          y,
          vx: dir * (Math.random() * 200 + 50),
          vy: (Math.random() - 0.5) * 140,
          radius: Math.random() * 3.5 + 2,
          color: i % 2 === 0 ? skin.primary : '#ffffff',
          alpha: 0.95,
          life: 0,
          maxLife: 0.38
        });
      }
    }

    triggerComicalDeath(obstacleHit) {
      this.state = 'DEATH_ANIM';
      this.deathPhase = 1;
      this.deathTimer = 0;

      // Comical deformation
      this.drop.squashX = 2.4; // super flat squish on impact!
      this.drop.squashY = 0.35;
      this.drop.wobble = 0.8;

      // Slow-mo zoom in camera
      this.slowMoTime = 0.6;
      this.shakeTime = 0.35;
      this.shakeMag = 8;

      // Play hilarious descending slide whistle and bonk-splat
      this.audio.play('funnyDeath');
      Bridge.vibrate(90);

      // Narrator catches repeating funny hook
      Narrator.speak('death');

      // Pop comic splash text above the drop
      const comicWords = ['SPLAT! 💥', 'POW! 😵', 'BOING! 💫', 'SPLOSH! 💦'];
      const word = comicWords[Math.floor(Math.random() * comicWords.length)];
      this.addFloatingText(this.drop.x, this.drop.y - 30, word, '#f43f5e', 1.0);
    }

    explodeDropToEyeballs() {
      this.deathPhase = 2;
      const skin = this.getActiveSkin();

      // Big explosion of 35 fluid bubbles
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 260 + 60;
        this.particles.push({
          x: this.drop.x,
          y: this.drop.y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 60,
          radius: Math.random() * 6 + 2.5,
          color: i % 3 === 0 ? '#ffffff' : (i % 2 === 0 ? skin.primary : skin.accent),
          alpha: 1.0,
          life: 0,
          maxLife: 0.65
        });
      }

      // Two hilarious bouncing cartoon eyeball particles spinning away!
      for (let i = 0; i < 2; i++) {
        const dir = i === 0 ? -1 : 1;
        this.deathEyeParticles.push({
          x: this.drop.x + dir * 6,
          y: this.drop.y - 4,
          vx: dir * (Math.random() * 120 + 80),
          vy: -(Math.random() * 140 + 100),
          radius: 7,
          rotation: 0,
          rotSpeed: dir * 12,
          bounces: 0
        });
      }
    }

    getActiveSkin() {
      return SKINS.find((s) => s.id === this.userData.selectedSkin) || SKINS[0];
    }

    update(dt) {
      // Replay recording buffer capture
      if (this.state === 'PLAYING' || this.state === 'DEATH_ANIM') {
        this.recorder.captureFrame(this);
      }

      // Slow-mo and Camera Zoom
      let timeScale = 1.0;
      if (this.slowMoTime > 0) {
        this.slowMoTime -= dt;
        timeScale = 0.35; // Dramatic matrix slow-mo
      }
      const effDt = dt * timeScale;

      // Shake update
      if (this.shakeTime > 0) {
        this.shakeTime -= dt;
      }

      // DEATH ANIMATION TIMING (0.58s funny sequence)
      if (this.state === 'DEATH_ANIM') {
        this.deathTimer += dt;
        this.cameraZoom += (1.45 - this.cameraZoom) * 8 * dt; // Smooth zoom into drop

        // Elastic recovery and wobble before popping
        if (this.deathTimer < 0.28) {
          this.drop.squashX += (1.6 - this.drop.squashX) * 10 * dt;
          this.drop.squashY += (0.6 - this.drop.squashY) * 10 * dt;
        } else if (this.deathPhase === 1) {
          // Trigger the big pop explosion with bouncing eyes
          this.explodeDropToEyeballs();
        }

        // Update bouncing cartoon eyeballs physics
        for (let i = this.deathEyeParticles.length - 1; i >= 0; i--) {
          const eye = this.deathEyeParticles[i];
          eye.vy += 650 * dt; // gravity
          eye.x += eye.vx * dt;
          eye.y += eye.vy * dt;
          eye.rotation += eye.rotSpeed * dt;

          // Bounce on walls
          if (eye.x - eye.radius < this.wallPadding) {
            eye.x = this.wallPadding + eye.radius;
            eye.vx = -eye.vx * 0.7;
          } else if (eye.x + eye.radius > this.width - this.wallPadding) {
            eye.x = this.width - this.wallPadding - eye.radius;
            eye.vx = -eye.vx * 0.7;
          }
        }

        if (this.deathTimer >= this.deathDuration) {
          this.gameOver();
        }
      }

      if (this.state === 'PLAYING') {
        this.cameraZoom += (1.0 - this.cameraZoom) * 6 * dt;

        // Distance & Speed
        this.distance += this.speed * effDt;
        this.speed = Math.min(340 + Math.floor(this.distance / 120) * 14, 780);
        this.score = Math.floor(this.distance / 10);

        // Drop Horizontal Smoothing
        const dx = this.drop.targetX - this.drop.x;
        this.drop.x += dx * 16 * effDt;

        // Gel Spring Elasticity
        this.drop.squashX += (1.0 - this.drop.squashX) * 12 * effDt;
        this.drop.squashY += (1.0 - this.drop.squashY) * 12 * effDt;
        this.drop.wobble *= 0.92;

        // Drop Trail
        if (Math.random() < 0.65) {
          this.drop.trail.push({
            x: this.drop.x + (Math.random() - 0.5) * 6,
            y: this.drop.y - 10,
            radius: Math.random() * 4 + 2,
            alpha: 0.7,
            life: 0,
            maxLife: 0.32
          });
        }

        // Spawn Spacing
        this.spawnTimer += effDt;
        if (this.spawnTimer > 0.62) {
          this.spawnTimer = 0;
          this.spawnPattern();
        }

        // Update Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
          const obs = this.obstacles[i];
          obs.y -= this.speed * effDt;

          // Check Collision with Drop
          if (!obs.passed && Math.abs(obs.y - this.drop.y) < obs.height / 2 + this.drop.radius) {
            const hitLeft = obs.side === 'left' && this.drop.x - this.drop.radius < obs.width + this.wallPadding;
            const hitRight = obs.side === 'right' && this.drop.x + this.drop.radius > this.width - this.wallPadding - obs.width;
            const hitCenter = obs.side === 'center' && Math.abs(this.drop.x - this.width / 2) < obs.width / 2;

            if (hitLeft || hitRight || hitCenter) {
              if (this.drop.shield) {
                // Absorb shield
                this.drop.shield = false;
                obs.passed = true;
                this.audio.play('shield');
                this.addFloatingText(this.drop.x, this.drop.y, 'ESCUDO!', '#38bdf8');
                this.createSplash(this.drop.x, this.drop.y, 1);
              } else {
                this.triggerComicalDeath(obs);
                return;
              }
            }
          }

          // Near Miss Trigger (QUASE! Slow-Mo Bonus)
          if (!obs.nearMissed && !obs.passed && obs.y < this.drop.y - 10) {
            obs.nearMissed = true;
            obs.passed = true;

            const distToObstacle = Math.abs(this.drop.x - (obs.side === 'left' ? obs.width + this.wallPadding : this.width - this.wallPadding - obs.width));
            if (distToObstacle < 38) {
              this.combo += 1;
              if (this.combo > this.maxCombo) this.maxCombo = this.combo;
              this.slowMoTime = 0.28;
              this.shakeTime = 0.18;
              this.shakeMag = 5;

              const bonus = 10 * this.combo;
              this.score += bonus;
              this.audio.play('nearmiss');
              Bridge.vibrate(25);
              this.addFloatingText(this.drop.x, this.drop.y - 20, `QUASE! x${this.combo}`, '#38bdf8');

              if (this.combo === 3) {
                Narrator.speak('combo3');
              } else if (this.combo === 5) {
                Narrator.speak('combo5');
              } else if (Math.random() < 0.4) {
                // Dramatic soccer suspense commentary on razor-thin close calls
                Narrator.speak('nearMiss');
              }
            } else {
              this.combo = 0;
            }
            this.updateHUD();
          }

          if (obs.y < -100) {
            this.obstacles.splice(i, 1);
          }
        }

        // Update Dewdrops (Coins)
        for (let i = this.dewdrops.length - 1; i >= 0; i--) {
          const coin = this.dewdrops[i];
          coin.y -= this.speed * effDt;
          coin.pulse = (coin.pulse || 0) + effDt * 6;

          const dist = Math.hypot(this.drop.x - coin.x, this.drop.y - coin.y);
          if (dist < this.drop.radius + coin.radius + 12) {
            // Collect Coin
            this.coins += 1;
            this.coinsInRun += 1;
            this.userData.coins += 1;
            Storage.save(this.userData);

            this.audio.play('coin');
            Bridge.vibrate(15);
            this.addFloatingText(coin.x, coin.y, '+1 🪙', '#fbbf24');

            // Coin splash particles
            for (let p = 0; p < 8; p++) {
              this.particles.push({
                x: coin.x,
                y: coin.y,
                vx: (Math.random() - 0.5) * 160,
                vy: (Math.random() - 0.5) * 160,
                radius: Math.random() * 3 + 1.5,
                color: '#fbbf24',
                alpha: 1,
                life: 0,
                maxLife: 0.35
              });
            }

            this.dewdrops.splice(i, 1);
            this.updateHUD();
            continue;
          }

          if (coin.y < -50) {
            this.dewdrops.splice(i, 1);
          }
        }
      }

      // Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha = 1 - p.life / p.maxLife;
        if (p.life >= p.maxLife) this.particles.splice(i, 1);
      }

      // Drop Trail
      for (let i = this.drop.trail.length - 1; i >= 0; i--) {
        const t = this.drop.trail[i];
        t.life += dt;
        t.y -= (this.speed * 0.4) * dt;
        t.alpha = 0.7 * (1 - t.life / t.maxLife);
        if (t.life >= t.maxLife) this.drop.trail.splice(i, 1);
      }

      // Floating Texts
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.life += dt;
        ft.y -= 40 * dt;
        ft.alpha = 1 - ft.life / ft.maxLife;
        if (ft.life >= ft.maxLife) this.floatingTexts.splice(i, 1);
      }
    }

    spawnPattern() {
      const side = Math.random() < 0.5 ? 'left' : 'right';
      const width = Math.random() * 45 + 75;
      const height = 28;
      const y = this.height + 60;

      this.obstacles.push({
        side,
        width,
        height,
        y,
        color: '#f43f5e',
        nearMissed: false,
        passed: false
      });

      // Spawn Dewdrop Coin on the opposite side
      if (Math.random() < 0.75) {
        const coinSide = side === 'left' ? 'right' : 'left';
        const coinX = coinSide === 'left' ? this.wallPadding + 26 : this.width - this.wallPadding - 26;
        this.dewdrops.push({
          x: coinX,
          y: y + Math.random() * 40,
          radius: 8,
          pulse: 0
        });
      }
    }

    addFloatingText(x, y, text, color, maxLife = 0.75) {
      this.floatingTexts.push({
        x,
        y,
        text,
        color: color || '#ffffff',
        life: 0,
        maxLife,
        alpha: 1
      });
    }

    updateHUD() {
      document.getElementById('hud-score-val').textContent = this.score;
      document.getElementById('hud-coins-val').textContent = this.userData.coins;

      const comboEl = document.getElementById('hud-combo');
      if (this.combo > 1) {
        comboEl.textContent = `COMBO x${this.combo}`;
        comboEl.classList.add('active');
      } else {
        comboEl.classList.remove('active');
      }
    }

    gameOver() {
      this.state = 'GAMEOVER';
      this.previousScreen = 'GAMEOVER';

      // Record check
      let isRecord = false;
      if (this.score > this.userData.highScore) {
        this.userData.highScore = this.score;
        isRecord = true;
        Narrator.speak('record');
      }

      this.userData.gamesPlayed += 1;
      Storage.save(this.userData);

      // Check Interstitial Ad trigger (every 3 games)
      if (this.userData.gamesPlayed % 3 === 0) {
        setTimeout(() => {
          Bridge.showInterstitial();
        }, 600);
      }

      // Update Game Over Modal Data
      document.getElementById('go-score').textContent = this.score;
      document.getElementById('go-best').textContent = this.userData.highScore;
      document.getElementById('go-coins').textContent = `+${this.coinsInRun}`;
      document.getElementById('go-record-badge').style.display = isRecord ? 'inline-block' : 'none';

      // Dynamic Social Comparison Roast/Hook
      this.currentSocialVerdict = SocialComparison.getComparison(this.score);
      document.getElementById('social-icon').textContent = this.currentSocialVerdict.icon;
      document.getElementById('social-headline').textContent = this.currentSocialVerdict.headline;
      document.getElementById('social-description').textContent = this.currentSocialVerdict.desc;

      this.showScreen('gameover-screen');

      // Start 3s Replay Loop in the Game Over modal
      setTimeout(() => {
        this.recorder.startPlayback('replay-canvas');
      }, 100);

      // If not record, sinister incentive after 3s to push quick retry
      if (!isRecord) {
        setTimeout(() => {
          if (this.state === 'GAMEOVER') {
            Narrator.speak('incentive');
          }
        }, 3200);
      }
    }

    shareReplay() {
      const social = this.currentSocialVerdict || SocialComparison.getComparison(this.score);
      const shareText = `🌊 Fiz ${this.score} pontos no Wall Drop!\n${social.icon} "${social.headline}"\nConsegue desviar mais rápido que eu? Baixe e jogue grátis! 📱⚡`;

      const cardDataUrl = this.recorder.generateShareImage(this, social);
      Bridge.shareMedia(cardDataUrl, 'image/png', shareText, 'Meu Replay no Wall Drop');
    }

    watchRewardedAd() {
      this.showToast('Carregando anúncio premiado...');
      Bridge.showRewardedAd((success) => {
        if (success) {
          this.userData.coins += 50;
          Storage.save(this.userData);
          this.showToast('+50 MOEDAS RECEBIDAS! 🪙');
          this.audio.play('coin');
          this.updateHUD();
          document.getElementById('go-coins').textContent = `+${this.coinsInRun + 50}`;
          this.updateMenuStats();
        } else {
          this.showToast('Anúncio não concluído ou indisponível.');
        }
      });
    }

    showToast(msg) {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2400);
    }

    draw() {
      this.ctx.save();

      // Screen Shake
      if (this.shakeTime > 0) {
        const ox = (Math.random() - 0.5) * this.shakeMag;
        const oy = (Math.random() - 0.5) * this.shakeMag;
        this.ctx.translate(ox, oy);
      }

      // Camera Slow-Mo Zoom on Death
      if (this.cameraZoom !== 1.0) {
        const cx = this.drop.x;
        const cy = this.drop.y;
        this.ctx.translate(cx, cy);
        this.ctx.scale(this.cameraZoom, this.cameraZoom);
        this.ctx.translate(-cx, -cy);
      }

      // Clear Canvas
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Draw Walls (Left & Right)
      const leftWall = this.wallPadding;
      const rightWall = this.width - this.wallPadding;

      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(0, 0, leftWall, this.height);
      this.ctx.fillRect(rightWall, 0, leftWall, this.height);

      // Neon Wall Borders
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = 'rgba(56,189,248,0.6)';
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.moveTo(leftWall, 0);
      this.ctx.lineTo(leftWall, this.height);
      this.ctx.moveTo(rightWall, 0);
      this.ctx.lineTo(rightWall, this.height);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      // Obstacles
      for (const obs of this.obstacles) {
        const x = obs.side === 'left' ? leftWall : rightWall - obs.width;
        this.ctx.fillStyle = obs.color;
        this.ctx.shadowColor = obs.color;
        this.ctx.shadowBlur = 12;

        this.ctx.beginPath();
        if (obs.side === 'left') {
          this.ctx.roundRect ? this.ctx.roundRect(x, obs.y, obs.width, obs.height, [0, 8, 8, 0]) : this.ctx.fillRect(x, obs.y, obs.width, obs.height);
        } else {
          this.ctx.roundRect ? this.ctx.roundRect(x, obs.y, obs.width, obs.height, [8, 0, 0, 8]) : this.ctx.fillRect(x, obs.y, obs.width, obs.height);
        }
        this.ctx.fill();

        // Neon Highlight Strip
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x, obs.y + 2, obs.width, 3);
      }
      this.ctx.shadowBlur = 0;

      // Dewdrops (Coins)
      for (const coin of this.dewdrops) {
        const pulseR = coin.radius + Math.sin(coin.pulse || 0) * 1.5;
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.shadowColor = 'rgba(251,191,36,0.8)';
        this.ctx.shadowBlur = 12;
        this.ctx.beginPath();
        this.ctx.arc(coin.x, coin.y, pulseR, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(coin.x - 2, coin.y - 2, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.shadowBlur = 0;

      // Drop Trail
      const skin = this.getActiveSkin();
      for (const t of this.drop.trail) {
        this.ctx.fillStyle = skin.primary;
        this.ctx.globalAlpha = t.alpha;
        this.ctx.beginPath();
        this.ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.globalAlpha = 1.0;

      // Particles
      for (const p of this.particles) {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.globalAlpha = 1.0;

      // Bouncing Cartoon Eyeballs on Death Explosion
      for (const eye of this.deathEyeParticles) {
        this.ctx.save();
        this.ctx.translate(eye.x, eye.y);
        this.ctx.rotate(eye.rotation);

        // White eyeball
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, eye.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        // X or spiral iris
        this.ctx.fillStyle = '#f43f5e';
        this.ctx.beginPath();
        this.ctx.arc(eye.radius * 0.3, 0, eye.radius * 0.4, 0, Math.PI * 2);
        this.ctx.fill();

        ctx.restore ? this.ctx.restore() : null;
      }

      // Draw Main Drop Character (Unless already exploded in phase 2)
      if (this.deathPhase < 2) {
        this.drawDrop(skin);
      }

      // Floating Texts
      for (const ft of this.floatingTexts) {
        this.ctx.fillStyle = ft.color;
        this.ctx.globalAlpha = ft.alpha;
        this.ctx.font = '900 16px -apple-system, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = ft.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fillText(ft.text, ft.x, ft.y);
      }
      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = 1.0;

      // Discrete In-Game Watermark
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      this.ctx.font = 'bold 10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('💧 WALL DROP', this.width / 2, this.height - 14);

      this.ctx.restore();
    }

    drawDrop(skin) {
      this.ctx.save();
      this.ctx.translate(this.drop.x, this.drop.y);
      this.ctx.rotate(this.drop.wobble);
      this.ctx.scale(this.drop.squashX, this.drop.squashY);

      // Glow
      this.ctx.shadowColor = skin.glow;
      this.ctx.shadowBlur = 18;

      // Fluid Tear Drop Body
      this.ctx.fillStyle = skin.primary;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.drop.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Inner Liquid Reflection
      this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
      this.ctx.beginPath();
      this.ctx.ellipse(-4, -6, 5, 3, -Math.PI / 4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.shadowBlur = 0;

      // COMICAL DEATH FACE OR NORMAL FACE
      if (this.deathPhase === 1) {
        // Exaggerated comic shocked face with giant popped bug-eyes!
        const r = this.drop.radius;

        // Bulging white eyes popping out
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#0f172a';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.arc(-r * 0.45, -r * 0.25, r * 0.45, 0, Math.PI * 2);
        this.ctx.arc(r * 0.45, -r * 0.25, r * 0.45, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Tiny spinning pupils looking directly at the crash wall
        const pupilDir = this.drop.side === 0 ? -1 : 1;
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(-r * 0.45 + pupilDir * 3, -r * 0.25, 2.5, 0, Math.PI * 2);
        this.ctx.arc(r * 0.45 + pupilDir * 3, -r * 0.25, 2.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Screaming / Shocked cartoon mouth
        this.ctx.fillStyle = '#f43f5e';
        this.ctx.beginPath();
        this.ctx.ellipse(0, r * 0.4, r * 0.35, r * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#881337';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      } else {
        // Cute playful eyes looking in fall direction
        const eyeOffset = this.drop.side === 0 ? 3 : -3;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(-5 + eyeOffset, -2, 3.5, 0, Math.PI * 2);
        this.ctx.arc(5 + eyeOffset, -2, 3.5, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#0f172a';
        this.ctx.beginPath();
        this.ctx.arc(-5 + eyeOffset * 1.3, 0, 2, 0, Math.PI * 2);
        this.ctx.arc(5 + eyeOffset * 1.3, 0, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    loop(timestamp) {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;

      this.update(dt);
      this.draw();

      requestAnimationFrame((t) => this.loop(t));
    }

    renderWorkshopSkins() {
      const grid = document.getElementById('skins-grid');
      if (!grid) return;
      grid.innerHTML = '';

      SKINS.forEach((skin) => {
        const isUnlocked = this.userData.unlockedSkins.includes(skin.id);
        const isSelected = this.userData.selectedSkin === skin.id;

        const card = document.createElement('div');
        card.className = `skin-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;

        card.innerHTML = `
          <div class="skin-preview-circle" style="background: ${skin.primary}; color: ${skin.glow};"></div>
          <div style="font-size: 11px; font-weight: 800; color: #fff;">${skin.name}</div>
          <div style="font-size: 10px; font-weight: 700; color: ${isUnlocked ? '#38bdf8' : '#fbbf24'};">
            ${isSelected ? 'EQUIPADO' : (isUnlocked ? 'USAR' : `🪙 ${skin.cost}`)}
          </div>
        `;

        card.addEventListener('click', () => {
          if (isUnlocked) {
            this.userData.selectedSkin = skin.id;
            Storage.save(this.userData);
            this.renderWorkshopSkins();
            this.showToast(`${skin.name} equipada!`);
          } else {
            if (this.userData.coins >= skin.cost) {
              this.userData.coins -= skin.cost;
              this.userData.unlockedSkins.push(skin.id);
              this.userData.selectedSkin = skin.id;
              Storage.save(this.userData);
              this.renderWorkshopSkins();
              this.updateMenuStats();
              this.showToast(`${skin.name} desbloqueada! 🎉`);
              this.audio.play('coin');
            } else {
              this.showToast(`Moedas insuficientes! Precisa de ${skin.cost} 🪙`);
            }
          }
        });

        grid.appendChild(card);
      });
    }

    hideAllScreens() {
      document.querySelectorAll('.screen-overlay').forEach((el) => el.classList.remove('active'));
    }

    showScreen(id) {
      this.hideAllScreens();
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
    }

    showMenu() {
      this.recorder.stopPlayback();
      this.state = 'MENU';
      this.updateMenuStats();
      this.showScreen('menu-screen');
    }

    showWorkshop() {
      this.recorder.stopPlayback();
      this.state = 'WORKSHOP';
      this.renderWorkshopSkins();
      this.updateMenuStats();
      this.showScreen('workshop-screen');
    }

    showSettings() {
      this.recorder.stopPlayback();
      if (this.state !== 'GAMEOVER') {
        this.previousScreen = 'MENU';
      }
      this.state = 'SETTINGS';
      this.refreshSettingsUI();
      this.showScreen('settings-screen');
    }

    setupSettingsUI() {
      const maleBtn = document.getElementById('voice-male-btn');
      const femaleBtn = document.getElementById('voice-female-btn');
      const narratorSwitch = document.getElementById('toggle-narrator-switch');
      const sfxSwitch = document.getElementById('toggle-sfx-switch');
      const testBtn = document.getElementById('btn-test-voice');

      if (maleBtn) {
        maleBtn.addEventListener('click', () => {
          if (window.Narrator) window.Narrator.setVoiceGender('male');
          this.refreshSettingsUI();
          this.audio.play('tap');
        });
      }

      if (femaleBtn) {
        femaleBtn.addEventListener('click', () => {
          if (window.Narrator) window.Narrator.setVoiceGender('female');
          this.refreshSettingsUI();
          this.audio.play('tap');
        });
      }

      if (narratorSwitch) {
        narratorSwitch.addEventListener('click', () => {
          if (window.Narrator) {
            window.Narrator.toggleMute();
            this.refreshSettingsUI();
          }
        });
      }

      if (sfxSwitch) {
        sfxSwitch.addEventListener('click', () => {
          this.audio.enabled = !this.audio.enabled;
          sfxSwitch.classList.toggle('active', this.audio.enabled);
        });
      }

      if (testBtn) {
        testBtn.addEventListener('click', () => {
          this.audio.init();
          Narrator.testVoice();
        });
      }
    }

    refreshSettingsUI() {
      const maleBtn = document.getElementById('voice-male-btn');
      const femaleBtn = document.getElementById('voice-female-btn');
      const narratorSwitch = document.getElementById('toggle-narrator-switch');
      const sfxSwitch = document.getElementById('toggle-sfx-switch');

      if (window.Narrator) {
        const settings = window.Narrator.getSettings();
        if (maleBtn) maleBtn.classList.toggle('active', settings.gender === 'male');
        if (femaleBtn) femaleBtn.classList.toggle('active', settings.gender === 'female');
        if (narratorSwitch) narratorSwitch.classList.toggle('active', !!settings.enabled);
      }

      if (sfxSwitch) {
        sfxSwitch.classList.toggle('active', !!this.audio.enabled);
      }
    }
  }

  // Initialize Game on DOM Load
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new WallDropGame();
  });
})();
