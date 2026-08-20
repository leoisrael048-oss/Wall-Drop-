import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Check, 
  Lock, 
  Coins, 
  User, 
  Palette, 
  Sparkles, 
  Skull, 
  ShieldAlert 
} from 'lucide-react';
import { 
  CharacterId, 
  SkinId, 
  TrailId, 
  DeathEffectId, 
  GameSettings 
} from '../types';
import { 
  INITIAL_CHARACTERS, 
  INITIAL_SKINS, 
  INITIAL_TRAILS, 
  INITIAL_DEATH_EFFECTS 
} from '../constants/gameData';
import { audio } from '../utils/audio';
import { adService } from '../services/adService';
import { 
  getTranslation, 
  getLocalizedCharacter, 
  getLocalizedSkin, 
  getLocalizedTrail, 
  getLocalizedDeathEffect 
} from '../utils/i18n';

interface ShopModalProps {
  coins: number;
  unlockedCharacters: CharacterId[];
  selectedCharacterId: CharacterId;
  unlockedSkins: SkinId[];
  selectedSkinId: SkinId;
  unlockedTrails: TrailId[];
  selectedTrailId: TrailId;
  unlockedDeathEffects: DeathEffectId[];
  selectedDeathEffectId: DeathEffectId;
  settings: GameSettings;
  onSelectCharacter: (id: CharacterId) => void;
  onUnlockCharacter: (id: CharacterId, price: number) => boolean;
  onSelectSkin: (id: SkinId) => void;
  onUnlockSkin: (id: SkinId, price: number) => boolean;
  onSelectTrail: (id: TrailId) => void;
  onUnlockTrail: (id: TrailId, price: number) => boolean;
  onSelectDeathEffect: (id: DeathEffectId) => void;
  onUnlockDeathEffect: (id: DeathEffectId, price: number) => boolean;
  onEarnCoinsAd?: (amount: number) => void;
  onBack: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  coins,
  unlockedCharacters,
  selectedCharacterId,
  unlockedSkins,
  selectedSkinId,
  unlockedTrails,
  selectedTrailId,
  unlockedDeathEffects,
  selectedDeathEffectId,
  settings,
  onSelectCharacter,
  onUnlockCharacter,
  onSelectSkin,
  onUnlockSkin,
  onSelectTrail,
  onUnlockTrail,
  onSelectDeathEffect,
  onUnlockDeathEffect,
  onEarnCoinsAd,
  onBack,
}) => {
  const safeUnlockedChars = Array.isArray(unlockedCharacters) ? unlockedCharacters : ['nox'];
  const safeUnlockedSkins = Array.isArray(unlockedSkins) ? unlockedSkins : ['skin_neon'];
  const safeUnlockedTrails = Array.isArray(unlockedTrails) ? unlockedTrails : ['trail_stardust'];
  const safeUnlockedEffects = Array.isArray(unlockedDeathEffects) ? unlockedDeathEffects : ['fx_shatter'];

  const lang = settings?.language || 'pt';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, lang);

  const [activeTab, setActiveTab] = useState<'characters' | 'skins' | 'trails' | 'effects'>('characters');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const renderRarityBadge = (rarity?: string) => {
    if (!rarity) return null;
    switch (rarity) {
      case 'LEGENDARY':
        return (
          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-black tracking-wider animate-pulse shrink-0">
            ★ LEGENDARY
          </span>
        );
      case 'EPIC':
        return (
          <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded font-black tracking-wider shrink-0">
            EPIC
          </span>
        );
      case 'RARE':
        return (
          <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded font-black tracking-wider shrink-0">
            RARE
          </span>
        );
      default:
        return (
          <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded font-extrabold shrink-0">
            COMMON
          </span>
        );
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const getFriendlyAdErrorMessage = (codeOrMsg: string): string => {
    switch (codeOrMsg) {
      case 'unavailable':
        return lang === 'pt' ? '⚠️ Nenhum anúncio disponível no momento. Tente novamente mais tarde.'
          : lang === 'es' ? '⚠️ No hay anuncios disponibles en este momento. Inténtalo más tarde.'
          : '⚠️ No ads available right now. Please try again later.';
      case 'not_finished':
        return lang === 'pt' ? '⚠️ Assista ao anúncio até o final para resgatar as moedas.'
          : lang === 'es' ? '⚠️ Mira el anuncio completo para canjear las monedas.'
          : '⚠️ Watch the entire ad to claim your coins.';
      case 'timeout':
        return lang === 'pt' ? '⚠️ Conexão lenta. O anúncio demorou para carregar.'
          : lang === 'es' ? '⚠️ Conexión lenta. El anuncio tardó demasiado.'
          : '⚠️ Slow connection. Ad took too long to load.';
      case 'loading':
        return lang === 'pt' ? '⚠️ Anúncio carregando... Por favor, aguarde.'
          : lang === 'es' ? '⚠️ Cargando anuncio... Por favor, espera.'
          : '⚠️ Ad is loading... Please wait.';
      case 'offline':
        return lang === 'pt' ? '📶 Modo Offline: Anúncios requerem internet.'
          : lang === 'es' ? '📶 Modo sin conexión: Los anuncios requieren internet.'
          : '📶 Offline Mode: Ads require internet connection.';
      default:
        return codeOrMsg.startsWith('⚠️') ? codeOrMsg : `⚠️ ${codeOrMsg}`;
    }
  };

  const handleWatchAdForCoins = () => {
    audio.playSfx('click', settings);
    showToast(getFriendlyAdErrorMessage('loading'));
    adService.showRewardedAd(
      () => {
        audio.playSfx('unlock', settings);
        audio.speakNarrator('evolution', settings);
        if (onEarnCoinsAd) {
          onEarnCoinsAd(50);
        }
        showToast(lang === 'en' ? '+50 COINS ADDED!' : lang === 'es' ? '¡+50 MONEDAS!' : '+50 MOEDAS ADICIONADAS!');
      },
      (err) => {
        showToast(getFriendlyAdErrorMessage(err));
      }
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-4 sm:p-6 bg-slate-950 text-white overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-2 gap-2">
        <button
          onClick={() => {
            audio.playSfx('click', settings);
            audio.speakNarrator('returnMenu', settings);
            onBack();
          }}
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 shadow-md flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('menu')}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Rewarded Ad Coins Button */}
          <button
            onClick={handleWatchAdForCoins}
            className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 px-3 py-1.5 rounded-full font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all border border-yellow-300/60 animate-pulse"
          >
            <span>+50 🎁</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/40 px-3.5 py-1.5 rounded-full shadow-lg">
            <Coins className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span className="text-sm font-black text-amber-300">{coins}</span>
          </div>
        </div>
      </div>

      {/* Insufficient Coins or Action Toast */}
      {toastMessage && (
        <div className="absolute top-16 z-30 px-4 py-2 bg-rose-500/90 border border-rose-300 text-white font-black text-xs rounded-2xl shadow-xl animate-bounce flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-yellow-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-md flex flex-col items-center my-auto z-10 my-3 flex-1 overflow-hidden">
        <h2 className="text-xl font-black text-slate-200 uppercase tracking-widest mb-3 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
          {t('shopTitle')}
        </h2>

        {/* 4 Category Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 w-full mb-3 shrink-0">
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => {
              audio.playSfx('click', settings);
              setActiveTab('characters');
            }}
            className={`py-2 rounded-xl text-[10px] sm:text-xs font-black transition-colors flex flex-col items-center justify-center gap-0.5 cursor-pointer transform-gpu ${
              activeTab === 'characters'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>{t('heroes')}</span>
            </div>
            <span className="text-[9px] opacity-80">{unlockedCharacters.length}/{INITIAL_CHARACTERS.length}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => {
              audio.playSfx('click', settings);
              setActiveTab('skins');
            }}
            className={`py-2 rounded-xl text-[10px] sm:text-xs font-black transition-colors flex flex-col items-center justify-center gap-0.5 cursor-pointer transform-gpu ${
              activeTab === 'skins'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 shrink-0" />
              <span>{t('skins')}</span>
            </div>
            <span className="text-[9px] opacity-80">{unlockedSkins.length}/{INITIAL_SKINS.length}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => {
              audio.playSfx('click', settings);
              setActiveTab('trails');
            }}
            className={`py-2 rounded-xl text-[10px] sm:text-xs font-black transition-colors flex flex-col items-center justify-center gap-0.5 cursor-pointer transform-gpu ${
              activeTab === 'trails'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{t('trails')}</span>
            </div>
            <span className="text-[9px] opacity-80">{unlockedTrails.length}/{INITIAL_TRAILS.length}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => {
              audio.playSfx('click', settings);
              setActiveTab('effects');
            }}
            className={`py-2 rounded-xl text-[10px] sm:text-xs font-black transition-colors flex flex-col items-center justify-center gap-0.5 cursor-pointer transform-gpu ${
              activeTab === 'effects'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1">
              <Skull className="w-3.5 h-3.5 shrink-0" />
              <span>{t('effects')}</span>
            </div>
            <span className="text-[9px] opacity-80">{unlockedDeathEffects.length}/{INITIAL_DEATH_EFFECTS.length}</span>
          </motion.button>
        </div>

        {/* Category List Scrollable */}
        <div className="w-full flex flex-col gap-3 overflow-y-auto pr-1 flex-1 max-h-[58vh] transform-gpu will-change-transform overscroll-contain pb-2">
          {/* CHARACTERS TAB */}
          {activeTab === 'characters' && (
            INITIAL_CHARACTERS.map((rawChar) => {
              const char = getLocalizedCharacter(rawChar, lang);
              const isUnlocked = safeUnlockedChars.includes(char.id);
              const isSelected = selectedCharacterId === char.id;

              return (
                <motion.div
                  key={char.id}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  onClick={() => {
                    if (isUnlocked && !isSelected) {
                      onSelectCharacter(char.id);
                      audio.playSfx('click', settings);
                      audio.speakNarrator('equipItem', settings);
                    }
                  }}
                  className={`bg-slate-900/90 border rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md transition-colors cursor-pointer transform-gpu will-change-transform ${
                    isSelected ? 'border-cyan-400 bg-cyan-950/20' : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Preview Orb */}
                  <div className="relative w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                    <div
                      className="w-7 h-7 rounded-full shadow-lg transition-transform animate-pulse"
                      style={{
                        backgroundColor: char.primaryColor,
                        boxShadow: `0 0 15px ${char.glowColor}`,
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm text-white truncate">{char.name}</span>
                      {renderRarityBadge(char.rarity)}
                      {char.isSecret && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-black">
                          {t('secret')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-tight mt-0.5">
                      {char.desc}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0">
                    {isSelected ? (
                      <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-extrabold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {t('equipped')}
                      </span>
                    ) : isUnlocked ? (
                      <motion.button
                        whileTap={{ scale: 0.90 }}
                        whileHover={{ scale: 1.06 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCharacter(char.id);
                          audio.playSfx('click', settings);
                          audio.speakNarrator('equipItem', settings);
                        }}
                        className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md transform-gpu"
                      >
                        {t('equip')}
                      </motion.button>
                    ) : char.isSecret ? (
                      <div className="px-3 py-1.5 bg-slate-800/80 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-extrabold flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>{t('locked')}</span>
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.90 }}
                        whileHover={{ scale: 1.06 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (coins >= char.price) {
                            if (onUnlockCharacter(char.id, char.price)) {
                              onSelectCharacter(char.id);
                              audio.playSfx('unlock', settings);
                              audio.speakNarrator('spendCoins', settings);
                              showToast(t('unlockedToast').replace('{item}', char.name));
                            }
                          } else {
                            audio.playSfx('crash', settings);
                            audio.speakNarrator('insufficientCoins', settings);
                            showToast(t('insufficientCoins'));
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md transform-gpu ${
                          coins >= char.price
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{char.price}</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}

          {/* SKINS TAB */}
          {activeTab === 'skins' && (
            INITIAL_SKINS.map((rawSkin) => {
              const skin = getLocalizedSkin(rawSkin, lang);
              const isUnlocked = safeUnlockedSkins.includes(skin.id);
              const isSelected = selectedSkinId === skin.id;

              return (
                <motion.div
                  key={skin.id}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  onClick={() => {
                    if (isUnlocked && !isSelected) {
                      onSelectSkin(skin.id);
                      audio.playSfx('click', settings);
                      audio.speakNarrator('equipItem', settings);
                    }
                  }}
                  className={`bg-slate-900/90 border rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md transition-colors cursor-pointer transform-gpu will-change-transform ${
                    isSelected ? 'border-purple-400 bg-purple-950/20' : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                    {skin.emoji ? (
                      <span className="text-2xl filter drop-shadow-md select-none transform transition-transform group-hover:scale-110">
                        {skin.emoji}
                      </span>
                    ) : (
                      <div
                        className="w-7 h-7 rounded-2xl shadow-lg border-2 border-white/40"
                        style={{
                          backgroundColor: skin.primaryColor,
                          boxShadow: `0 0 15px ${skin.glowColor}`,
                        }}
                      />
                    )}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {skin.emoji && <span className="text-sm">{skin.emoji}</span>}
                      <span className="font-extrabold text-sm text-white truncate">{skin.name}</span>
                      {renderRarityBadge(skin.rarity)}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-tight mt-0.5">
                      {skin.desc}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-extrabold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {t('equipped')}
                      </span>
                    ) : isUnlocked ? (
                      <motion.button
                        whileTap={{ scale: 0.90 }}
                        whileHover={{ scale: 1.06 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSkin(skin.id);
                          audio.playSfx('click', settings);
                          audio.speakNarrator('equipItem', settings);
                        }}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md transform-gpu"
                      >
                        {t('equip')}
                      </motion.button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.90 }}
                        whileHover={{ scale: 1.06 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (coins >= skin.price) {
                            if (onUnlockSkin(skin.id, skin.price)) {
                              onSelectSkin(skin.id);
                              audio.playSfx('unlock', settings);
                              audio.speakNarrator('spendCoins', settings);
                              showToast(t('unlockedToast').replace('{item}', skin.name));
                            }
                          } else {
                            audio.playSfx('crash', settings);
                            audio.speakNarrator('insufficientCoins', settings);
                            showToast(t('insufficientCoins'));
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md transform-gpu ${
                          coins >= skin.price
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{skin.price}</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}

          {/* TRAILS TAB */}
          {activeTab === 'trails' && (
            INITIAL_TRAILS.map((rawTrail) => {
              const trail = getLocalizedTrail(rawTrail, lang);
              const isUnlocked = safeUnlockedTrails.includes(trail.id);
              const isSelected = selectedTrailId === trail.id;

              return (
                <motion.div
                  key={trail.id}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  onClick={() => {
                    if (isUnlocked && !isSelected) {
                      onSelectTrail(trail.id);
                      audio.playSfx('click', settings);
                      audio.speakNarrator('equipItem', settings);
                    }
                  }}
                  className={`bg-slate-900/90 border rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md transition-colors cursor-pointer transform-gpu will-change-transform ${
                    isSelected ? 'border-amber-400 bg-amber-950/20' : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                    <Sparkles className="w-6 h-6 shrink-0" style={{ color: trail.color }} />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm text-white truncate">{trail.name}</span>
                      {renderRarityBadge(trail.rarity)}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-tight mt-0.5">
                      {trail.desc}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-extrabold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {t('equipped')}
                      </span>
                    ) : isUnlocked ? (
                      <motion.button
                        whileTap={{ scale: 0.90 }}
                        whileHover={{ scale: 1.06 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTrail(trail.id);
                          audio.playSfx('click', settings);
                          audio.speakNarrator('equipItem', settings);
                        }}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md transform-gpu"
                      >
                        {t('equip')}
                      </motion.button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.90 }}
                        whileHover={{ scale: 1.06 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (coins >= trail.price) {
                            if (onUnlockTrail(trail.id, trail.price)) {
                              onSelectTrail(trail.id);
                              audio.playSfx('unlock', settings);
                              audio.speakNarrator('spendCoins', settings);
                              showToast(t('unlockedToast').replace('{item}', trail.name));
                            }
                          } else {
                            audio.playSfx('crash', settings);
                            audio.speakNarrator('insufficientCoins', settings);
                            showToast(t('insufficientCoins'));
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md transform-gpu ${
                          coins >= trail.price
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{trail.price}</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}

          {/* DEATH EFFECTS TAB */}
          {activeTab === 'effects' && (
            INITIAL_DEATH_EFFECTS.map((rawFx) => {
              const fx = getLocalizedDeathEffect(rawFx, lang);
              const isUnlocked = safeUnlockedEffects.includes(fx.id);
              const isSelected = selectedDeathEffectId === fx.id;

              return (
                <motion.div
                  key={fx.id}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  onClick={() => {
                    if (isUnlocked && !isSelected) {
                      onSelectDeathEffect(fx.id);
                      audio.playSfx('click', settings);
                      audio.speakNarrator('equipItem', settings);
                    }
                  }}
                  className={`bg-slate-900/90 border rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md transition-colors cursor-pointer transform-gpu will-change-transform ${
                    isSelected ? 'border-rose-400 bg-rose-950/20' : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden shadow-inner text-rose-400">
                    <Skull className="w-6 h-6 shrink-0" />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm text-white truncate">{fx.name}</span>
                      {renderRarityBadge(fx.rarity)}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-tight mt-0.5">
                      {fx.desc}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-extrabold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {t('equipped')}
                      </span>
                    ) : isUnlocked ? (
                      <motion.button
                        whileTap={{ scale: 0.90 }}
                        whileHover={{ scale: 1.06 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDeathEffect(fx.id);
                          audio.playSfx('click', settings);
                          audio.speakNarrator('equipItem', settings);
                        }}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md transform-gpu"
                      >
                        {t('equip')}
                      </motion.button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.90 }}
                        whileHover={{ scale: 1.06 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (coins >= fx.price) {
                            if (onUnlockDeathEffect(fx.id, fx.price)) {
                              onSelectDeathEffect(fx.id);
                              audio.playSfx('unlock', settings);
                              audio.speakNarrator('spendCoins', settings);
                              showToast(t('unlockedToast').replace('{item}', fx.name));
                            }
                          } else {
                            audio.playSfx('crash', settings);
                            audio.speakNarrator('insufficientCoins', settings);
                            showToast(t('insufficientCoins'));
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md transform-gpu ${
                          coins >= fx.price
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{fx.price}</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

