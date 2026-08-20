import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, Coins, Play, Sparkles, Crown, Palette, CheckCircle2 } from 'lucide-react';
import { CharacterId, CustomCharacterConfig, GameSettings } from '../types';
import { INITIAL_CHARACTERS } from '../constants/gameData';
import { audio } from '../utils/audio';
import { getTranslation, getLocalizedCharacter } from '../utils/i18n';

interface CharacterSelectProps {
  unlockedChars: CharacterId[];
  selectedCharId: CharacterId;
  coins: number;
  settings: GameSettings;
  customChar?: CustomCharacterConfig;
  onToggleCustomChar?: (enabled: boolean) => void;
  onOpenWorkshop?: () => void;
  onSelectCharacter: (id: CharacterId) => void;
  onUnlockCharacter: (id: CharacterId, price: number) => boolean;
  onBack: () => void;
  onStartGame: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  unlockedChars = ['nox'],
  selectedCharId,
  coins,
  settings,
  customChar,
  onToggleCustomChar,
  onOpenWorkshop,
  onSelectCharacter,
  onUnlockCharacter,
  onBack,
  onStartGame,
}) => {
  const safeUnlockedChars = Array.isArray(unlockedChars) ? unlockedChars : ['nox'];
  const lang = settings?.language || 'pt';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, lang);

  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(true);

  const isCustomActive = !!customChar?.enabled;

  const rawCharacters = showOnlyUnlocked
    ? INITIAL_CHARACTERS.filter((c) => safeUnlockedChars.includes(c.id))
    : INITIAL_CHARACTERS;

  const availableCharacters = rawCharacters.map((c) => getLocalizedCharacter(c, lang));

  // Ensure current index is valid within availableCharacters
  const [currentIndex, setCurrentIndex] = useState(() => {
    const list = showOnlyUnlocked
      ? INITIAL_CHARACTERS.filter((c) => safeUnlockedChars.includes(c.id))
      : INITIAL_CHARACTERS;
    const idx = list.findIndex((c) => c.id === selectedCharId);
    return idx >= 0 ? idx : 0;
  });

  const safeIndex = currentIndex >= availableCharacters.length ? 0 : currentIndex;
  const currentChar = availableCharacters[safeIndex] || getLocalizedCharacter(INITIAL_CHARACTERS[0], lang);
  const isUnlocked = safeUnlockedChars.includes(currentChar.id);
  const isSelected = selectedCharId === currentChar.id;

  // Active visual styling (Differentiate Original vs Custom)
  const displayPrimaryColor = isCustomActive && customChar?.primaryColor ? customChar.primaryColor : currentChar.primaryColor;
  const displayGlowColor = isCustomActive && customChar?.glowColor ? customChar.glowColor : currentChar.glowColor;
  const displayAccentColor = isCustomActive && customChar?.accentColor ? customChar.accentColor : currentChar.accentColor;

  const handlePrev = () => {
    audio.playSfx('click', settings);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : availableCharacters.length - 1));
  };

  const handleNext = () => {
    audio.playSfx('click', settings);
    setCurrentIndex((prev) => (prev < availableCharacters.length - 1 ? prev + 1 : 0));
  };

  const handleAction = () => {
    if (isSelected) return;

    if (isUnlocked) {
      onSelectCharacter(currentChar.id);
      audio.playSfx('coin', settings);
      audio.speakNarrator(currentChar.price >= 1000 || currentChar.isSecret ? 'selectRare' : 'selectCharacter', settings);
    } else {
      if (coins >= currentChar.price) {
        const success = onUnlockCharacter(currentChar.id, currentChar.price);
        if (success) {
          onSelectCharacter(currentChar.id);
          audio.playSfx('coin', settings);
          audio.speakNarrator('unlock', settings);
        }
      } else {
        audio.playSfx('crash', settings);
        audio.speakNarrator('insufficientCoins', settings);
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-4 sm:p-6 bg-slate-950 text-white overflow-hidden select-none animate-fadeIn">
      {/* Background Cinematic Glow Elements */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: displayPrimaryColor }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0)_0%,rgba(2,6,23,0.95)_100%)] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-sm flex items-center justify-between z-10 pt-1">
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

        {/* Quick Workshop Button */}
        {onOpenWorkshop && (
          <button
            onClick={() => {
              audio.playSfx('click', settings);
              onOpenWorkshop();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-extrabold shadow-sm active:scale-95 transition-all"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Oficina VIP</span>
          </button>
        )}

        <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-md">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-amber-300">{coins}</span>
        </div>
      </div>

      {/* Character Type Mode Switch (Original vs Customizado VIP) */}
      <div className="w-full max-w-sm z-10 my-1">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-md">
          <button
            onClick={() => {
              audio.playSfx('click', settings);
              onToggleCustomChar?.(false);
            }}
            className={`py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              !isCustomActive
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⭐ Modo Original</span>
          </button>

          <button
            onClick={() => {
              audio.playSfx('click', settings);
              onToggleCustomChar?.(true);
            }}
            className={`py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              isCustomActive
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-950" />
            <span>👑 Customizado VIP</span>
          </button>
        </div>
      </div>

      {/* Main Carousel Area */}
      <div className="w-full max-w-sm flex flex-col items-center my-auto z-10">
        <div className="flex items-center justify-between w-full mb-3 px-2">
          <h2 className="text-sm font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <span>{t('yourCharacters')}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">
              {unlockedChars.length}/{INITIAL_CHARACTERS.length}
            </span>
          </h2>

          <button
            onClick={() => {
              audio.playSfx('click', settings);
              setShowOnlyUnlocked(!showOnlyUnlocked);
              setCurrentIndex(0);
            }}
            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 tracking-wider uppercase transition-colors"
          >
            {showOnlyUnlocked ? t('viewAll') : t('unlockedOnly')}
          </button>
        </div>

        {/* Cinematic Card Stage */}
        <div className="relative w-full flex items-center justify-center">
          {/* Left Arrow */}
          {availableCharacters.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-0 p-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-full text-slate-300 hover:text-white transition-all active:scale-90 z-20 shadow-xl shadow-black/50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Center Cinematic Character Card */}
          <div className="w-64 h-80 rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-slate-800/80 p-5 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden group transition-transform duration-300">
            {/* Ambient inner glow */}
            <div
              className="absolute inset-0 opacity-30 blur-2xl pointer-events-none transition-all duration-500"
              style={{ backgroundColor: displayPrimaryColor }}
            />

            {/* Glowing top aura border */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500"
              style={{ backgroundColor: displayGlowColor }}
            />

            {/* Title & Distinction Badge */}
            <div className="flex flex-col items-center z-10 mt-0.5">
              <span className="text-xl font-black tracking-wider text-white drop-shadow-md">
                {currentChar.name}
              </span>

              <div className="flex items-center gap-1.5 mt-1">
                {isCustomActive ? (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>EDIÇÃO VIP CUSTOMIZADA</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>EDIÇÃO ORIGINAL</span>
                  </span>
                )}
              </div>
            </div>

            {/* Render Cinematic Character Preview Circle */}
            <div className="relative w-28 h-28 flex items-center justify-center z-10 my-1 group-hover:scale-105 transition-transform duration-500">
              <div
                className="absolute inset-0 rounded-full blur-lg opacity-80 animate-pulse"
                style={{ backgroundColor: displayGlowColor }}
              />

              {/* Floating mini crown if in VIP custom mode */}
              {isCustomActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                  <Crown className="w-5 h-5 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                </div>
              )}

              <div
                className="w-24 h-24 rounded-full border-2 flex items-center justify-center shadow-2xl relative transition-all duration-300"
                style={{
                  background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${displayPrimaryColor} 55%, ${displayAccentColor} 100%)`,
                  borderColor: displayGlowColor,
                  boxShadow: `0 0 25px ${displayGlowColor}70`,
                }}
              >
                {/* Character inner eye */}
                <div
                  className="w-3.5 h-3.5 rounded-full translate-x-2 -translate-y-2 shadow-md border"
                  style={{
                    backgroundColor: isCustomActive && customChar?.eyeColor ? customChar.eyeColor : '#ffffff',
                    borderColor: 'rgba(255,255,255,0.6)',
                  }}
                />
              </div>
            </div>

            {/* Description / Custom Status */}
            <div className="z-10 text-center px-1">
              <p className="text-[11px] text-slate-400 line-clamp-2 font-medium leading-tight">
                {isCustomActive
                  ? 'Personagem rodando com paleta e rastro exclusivo da Oficina VIP.'
                  : currentChar.desc}
              </p>
            </div>
          </div>

          {/* Right Arrow */}
          {availableCharacters.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-0 p-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-full text-slate-300 hover:text-white transition-all active:scale-90 z-20 shadow-xl shadow-black/50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Carousel Indicators */}
        <div className="flex items-center gap-1.5 mt-4">
          {availableCharacters.map((c, idx) => (
            <div
              key={c.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === safeIndex
                  ? 'w-5 bg-cyan-400 shadow-sm shadow-cyan-400/50'
                  : 'w-1.5 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="w-full max-w-xs z-10 mb-1 flex flex-col gap-2">
        {isSelected ? (
          <button
            onClick={() => {
              audio.playSfx('click', settings);
              onStartGame();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-base tracking-wider shadow-xl shadow-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 border border-cyan-400/50 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
            <Play className="w-5 h-5 fill-current" />
            <span>{t('startGame')}</span>
          </button>
        ) : isUnlocked ? (
          <div className="flex flex-col gap-1.5 w-full">
            <button
              onClick={() => {
                handleAction();
                audio.playSfx('click', settings);
                onStartGame();
              }}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-cyan-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('selectAndPlay')}</span>
            </button>
            <button
              onClick={handleAction}
              className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs tracking-wider hover:bg-slate-800 transition-all active:scale-95"
            >
              {t('selectOnly')}
            </button>
          </div>
        ) : (
          <button
            onClick={handleAction}
            className={`w-full py-3 rounded-2xl font-black text-xs tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
              coins >= currentChar.price
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t('unlockFor').replace('{price}', String(currentChar.price))}</span>
          </button>
        )}
      </div>
    </div>
  );
};
