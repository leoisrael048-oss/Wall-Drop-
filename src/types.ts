export type GameScreen = 
  | 'menu' 
  | 'playing' 
  | 'gameover' 
  | 'victory'
  | 'characters' 
  | 'shop' 
  | 'challenge' 
  | 'ranking' 
  | 'settings'
  | 'workshop'
  | 'narrator';

export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type CharacterId = 
  | 'neon_drop'
  | 'fire_drop'
  | 'ice_drop'
  | 'gold_drop'
  | 'void_drop'
  | 'toxic_drop'
  | 'cyber_drop'
  | 'galaxy_drop'
  | 'glitch_drop'
  | 'shadow_drop'
  | 'nox' 
  | 'blaze' 
  | 'frost' 
  | 'volt' 
  | 'glitch' 
  | 'shadow' 
  | 'cosmo' 
  | 'mystery'
  // 7 Novos Personagens Lendários Viciantes
  | 'quantum_drop'
  | 'solar_flare'
  | 'prism_diamond'
  | 'nebula_king'
  | 'cyber_phantom'
  | 'bio_hazard'
  | 'golden_god';

export interface Character {
  id: CharacterId;
  name: string;
  desc: string;
  price: number;
  unlocked: boolean;
  primaryColor: string;
  glowColor: string;
  trailColor: string;
  particleType: 'cyan_glow' | 'fire' | 'ice' | 'electric' | 'void_shadow' | 'stardust' | 'glitch_pixels' | 'mystery_aura' | 'toxic_plasma' | 'rainbow' | 'plasma_storm' | 'quantum' | 'prism' | 'gold_celestial';
  accentColor: string;
  isSecret?: boolean;
  rarity?: ItemRarity;
}

export type SkinId = 
  | 'skin_neon' 
  | 'skin_fire' 
  | 'skin_ice' 
  | 'skin_gold' 
  | 'skin_glitch' 
  | 'skin_shadow'
  // Skins por Emoji
  | 'skin_clown'
  | 'skin_gigachad'
  | 'skin_cat'
  | 'skin_alien'
  | 'skin_robot'
  | 'skin_fire_emoji'
  | 'skin_lion'
  | 'skin_king'
  | 'skin_lightning'
  | 'skin_unicorn'
  | 'skin_skull'
  | 'skin_rocket';

export interface GameSkin {
  id: SkinId;
  name: string;
  desc: string;
  price: number;
  unlocked: boolean;
  primaryColor: string;
  glowColor: string;
  accentColor: string;
  emoji?: string;
  rarity?: ItemRarity;
}

export type TrailId = 
  | 'cyan_trail'
  | 'magenta_trail'
  | 'fire_trail'
  | 'electric_trail'
  | 'pixel_trail'
  | 'rainbow_trail'
  | 'glitch_trail'
  | 'star_trail'
  | 'trail_energy' 
  | 'trail_fire' 
  | 'trail_ice' 
  | 'trail_stars' 
  | 'trail_glitch' 
  | 'trail_smoke'
  // 7 Novos Rastros Cósmicos
  | 'trail_supernova'
  | 'trail_plasmastorm'
  | 'trail_matrix'
  | 'trail_prism'
  | 'trail_firestorm'
  | 'trail_biohazard'
  | 'trail_infinitygold';

export interface GameTrail {
  id: TrailId;
  name: string;
  desc: string;
  price: number;
  unlocked: boolean;
  particleType: 'cyan_glow' | 'fire' | 'ice' | 'stardust' | 'glitch_pixels' | 'smoke' | 'electric' | 'rainbow';
  color: string;
  rarity?: ItemRarity;
}

export type DeathEffectId = 
  | 'neon_shatter'
  | 'pixel_explosion'
  | 'glitch_crash'
  | 'rain_splash'
  | 'lightning_burst'
  | 'star_burst'
  | 'death_explosion' 
  | 'death_glitch' 
  | 'death_pixels' 
  | 'death_smoke' 
  | 'death_vanish'
  // 7 Novos Efeitos de Morte Épicos
  | 'death_supernova'
  | 'death_plasmastorm'
  | 'death_matrix'
  | 'death_prism'
  | 'death_firestorm'
  | 'death_biohazard'
  | 'death_infinitygold';

export interface GameDeathEffect {
  id: DeathEffectId;
  name: string;
  desc: string;
  price: number;
  unlocked: boolean;
  type: 'explosion' | 'glitch' | 'pixels' | 'smoke' | 'vanish' | 'shatter' | 'splash' | 'lightning';
  rarity?: ItemRarity;
}

export type ThemeId = 'neon' | 'tempestade' | 'espaco' | 'gelo' | 'noturno';

export interface GameTheme {
  id: ThemeId;
  name: string;
  desc: string;
  price: number;
  unlocked: boolean;
  bgGradient: [string, string];
  wallColor: string;
  wallGlow: string;
  obstacleColor: string;
  accentColor: string;
}

export interface Obstacle {
  id: string;
  y: number;
  height: number;
  type: 
    | 'wall_block' 
    | 'narrow_gate' 
    | 'horizontal_bar' 
    | 'moving_block' 
    | 'sliding_doors' 
    | 'central_mover' 
    | 'rotating_bar' 
    | 'breathing_gap' 
    | 'zigzag_block' 
    | 'laser_gate' 
    | 'pulsing_pillars' 
    | 'split_doors'
    | 'orbital_crusher'
    | 'twin_crushers'
    | 'pendulum_blade'
    | 'laser_matrix'
    | 'vortex_pulse';
  shape?: 'blocks' | 'saws' | 'lasers' | 'hexagons' | 'spike_doors' | 'plasma_glitch' | 'energy_orbs' | 'cyber_razor';
  side: 'left' | 'right' | 'both' | 'center';
  gapX: number;
  gapWidth: number;
  passed: boolean;
  nearMissChecked: boolean;
  // Moving & Dynamic properties
  moveX?: number;
  moveSpeed?: number;
  moveDir?: number;
  minX?: number;
  maxX?: number;
  doorOpenRatio?: number; // 0 to 1 for sliding doors
  doorSpeed?: number;
  rotationAngle?: number;
  rotationSpeed?: number;
  oscillateOffset?: number;
  pulseFreq?: number;
  initialGapWidth?: number;
  orbitalRadius?: number;
  orbitalCount?: number;
  pendulumAngle?: number;
  pendulumLength?: number;
  destroyed?: boolean;
}

export interface CoinItem {
  id: string;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  pulseOffset: number;
  isRare?: boolean;
  value?: number;
}

export type PowerUpType = 'slow_mo';

export interface PowerUpItem {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  pulseOffset: number;
  duration: number; // Duration in seconds (e.g. 3.0)
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'spark' | 'star' | 'square' | 'ring' | 'dust' | 'smoke' | 'confetti' | 'shockwave' | 'fragment' | 'droplet' | 'foam';
  rotation?: number;
  rotSpeed?: number;
}

export interface CelebrationNotice {
  id: string;
  type: 'new_record' | 'rank_up' | 'top_percentile' | 'daily_beat' | 'combo_master';
  title: string;
  description: string;
  score: number;
  prevScore?: number;
  rank?: number;
  percentile?: number;
  timestamp: number;
  viewed?: boolean;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  scale: number;
}

export interface DailyMission {
  id: string;
  title: string;
  desc: string;
  type: 'coins' | 'score' | 'combo' | 'games';
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardCoins: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  desc: string;
  type: 'games' | 'score' | 'combo' | 'coins' | 'session_deaths';
  target: number;
  progress: number;
  completed: boolean;
  rewardText: string;
  rewardType: 'coins' | 'character' | 'skin';
  rewardValue: number | string;
  unlockedAt?: number;
  isSpecialViral?: boolean;
}

export interface DailyRewardState {
  streak: number; // 1 to 7
  lastClaimDate: string | null; // 'YYYY-MM-DD'
  canClaimToday: boolean;
  streakBroken?: boolean;
}

export interface HighScoreRecord {
  id?: string;
  rank: number;
  score: number;
  coins: number;
  date: string;
  characterId: CharacterId;
  playerName?: string;
}

export type Language = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'zh';

export interface PreviousRunData {
  score: number;
  coins: number;
  timestamp: number;
}

export interface GameSettings {
  musicVolume: number; // 0.0 to 1.0
  sfxVolume: number;   // 0.0 to 1.0
  narratorEnabled: boolean;
  narratorVolume: number; // 0.0 to 1.0
  narratorSpeed: number;  // 1.0, 1.25, 1.5
  narratorVoiceGender?: 'male' | 'female';
  narratorPersonality?: 'irritante' | 'engracado' | 'carinhoso' | 'timido' | 'aleatorio';
  vibrationEnabled: boolean;
  language: Language;
  playerName?: string;
  firstLaunchDone?: boolean;
  nightModeEnabled?: boolean;
}

export interface NightModeStatus {
  consecutive500: number;
  unlocked: boolean;
  active: boolean;
}

export interface GameStats {
  totalGames: number;
  totalCoinsCollected: number;
  highestCombo: number;
  bestScore: number;
}

export type CustomAccessory = 'none' | 'crown' | 'wings' | 'horns' | 'halo' | 'visor';
export type CustomAuraEffect = 'none' | 'cosmic_rings' | 'solar_flame' | 'quantum_storm' | 'crystal_frost' | 'diamond_prism';

export interface CustomCharacterConfig {
  enabled: boolean;
  primaryColor: string;
  glowColor: string;
  accentColor: string;
  trailColor: string;
  eyeColor: string;
  particleType: 'cyan_glow' | 'fire' | 'ice' | 'electric' | 'void_shadow' | 'stardust' | 'glitch_pixels' | 'mystery_aura' | 'toxic_plasma' | 'rainbow';
  accessory?: CustomAccessory;
  auraEffect?: CustomAuraEffect;
  unlockedColorPalettes: string[];
  unlockedParticleStyles: string[];
  unlockedAccessories?: string[];
  unlockedAuras?: string[];
}

export interface CustomThemeConfig {
  enabled: boolean;
  bgGradient: [string, string];
  wallColor: string;
  wallGlow: string;
  obstacleColor: string;
  accentColor: string;
  gridStyle: 'cyber_grid' | 'matrix_dots' | 'speed_stripes' | 'stardust_nebula';
  unlockedBackgrounds: string[];
}

export interface PlayerUpgrades {
  // Cosmetic visual upgrades (Oficina VIP - No gameplay bias)
  trailIntensity?: number;  // 0 to 5: Densidade & tamanho das partículas do rastro neon
  glowIntensity?: number;   // 0 to 5: Halo de iluminação e raio da aura cósmica
  trailLength?: number;     // 0 to 5: Duração e persistência da cauda de luz
  jellyPulse?: number;      // 0 to 5: Elasticidade orgânica de gel e reflexo dinâmico
  orbitalSparks?: number;   // 0 to 5: Faíscas de energia orbitando ao redor

  // Legacy/Power upgrades
  coinMagnet?: number;     // 0 to 5: +35px magnetic attraction radius per level
  shieldStart?: number;    // 0 to 3: Level 1 gives 1 emergency collision absorption shield
  nearMissBonus?: number;  // 0 to 5: +2 bonus points & coin chance on narrow wall dodge
  slowMoMastery?: number;  // 0 to 5: +30% longer slow-mo duration on 10x combo
  goldRush?: number;       // 0 to 5: +8% chance of spawning 3x Golden Rare Coins
}

export interface CustomAccessoryItem {
  id: string;
  accessoryType: CustomAccessory;
  name: string;
  desc: string;
  price: number;
  icon: string;
  rarity: ItemRarity;
}

export interface CustomAuraItem {
  id: string;
  auraType: CustomAuraEffect;
  name: string;
  desc: string;
  price: number;
  icon: string;
  rarity: ItemRarity;
}

export interface CustomPaletteItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  primaryColor: string;
  glowColor: string;
  accentColor: string;
  trailColor: string;
  particleType: CustomCharacterConfig['particleType'];
  rarity: ItemRarity;
}

export interface CustomBackgroundItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  bgGradient: [string, string];
  wallColor: string;
  wallGlow: string;
  obstacleColor: string;
  accentColor: string;
  gridStyle: CustomThemeConfig['gridStyle'];
  rarity: ItemRarity;
}

export interface UpgradeDefinition {
  id: keyof PlayerUpgrades;
  name: string;
  desc: string;
  icon: string;
  maxLevel: number;
  costPerLevel: number; // 2000 coins
  getEffectDesc: (level: number) => string;
}

export interface CloudLeaderboardRecord {
  id: string;
  playerName: string;
  score: number;
  coins: number;
  characterId: string;
  date: string;
  timestamp: number;
  rank?: number;
  isCurrentUser?: boolean;
  userId?: string;
}

export interface OfflineSyncItem {
  id: string;
  score: number;
  coins: number;
  characterId: string;
  playerName: string;
  timestamp: number;
  date: string;
}

export interface SocialComparisonData {
  percentile: number;
  isRealCloudData: boolean;
  icon: string;
  headline: string;
  desc: string;
  badge: string;
  totalPlayersSample?: number;
  rank?: number;
}

export interface ReplayFrame {
  imageData: ImageData;
  timestamp: number;
  score: number;
  combo: number;
  isDeathFrame?: boolean;
}

export interface DeathReplayData {
  frames: ImageData[];
  fps: number;
  durationMs: number;
  score: number;
  characterName: string;
  width: number;
  height: number;
  deathIndex: number;
}

