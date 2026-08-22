import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Volume2, VolumeX, Mic, MicOff, Smartphone, Globe, RefreshCw, User, Volume2 as VolumeIcon, Moon, Lock, Sparkles, Loader2 } from 'lucide-react';
import { GameSettings, Language } from '../types';
import { audio } from '../utils/audio';
import { narratorService } from '../services/narratorService';
import { NARRATOR_SPEED } from '../services/narratorConfig';
import { getTranslation, getLanguageFlag } from '../utils/i18n';
import { getNightModeStatus, setNightModeActive } from '../utils/storage';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetData: () => void;
  onBack: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onBack,
}) => {
  const lang = settings?.language || 'pt';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, lang);

  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState(settings?.playerName || '');
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  const availableLanguages: Language[] = ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'zh'];

  useEffect(() => {
    audio.speakNarrator('settingsOpen', settings);
  }, []);

  const toggleNarrator = () => {
    setProcessingKey('narrator');
    audio.playSfx('click', settings);
    onUpdateSettings({
      ...settings,
      narratorEnabled: !settings.narratorEnabled,
    });
    setTimeout(() => setProcessingKey(null), 150);
  };

  const toggleVibration = () => {
    setProcessingKey('vibration');
    audio.playSfx('click', settings);
    onUpdateSettings({
      ...settings,
      vibrationEnabled: !settings.vibrationEnabled,
    });
    setTimeout(() => setProcessingKey(null), 150);
  };

  const handleMusicChange = (val: number) => {
    onUpdateSettings({
      ...settings,
      musicVolume: val,
    });
  };

  const handleSfxChange = (val: number) => {
    onUpdateSettings({
      ...settings,
      sfxVolume: val,
    });
  };

  const handleNarratorVolChange = (val: number) => {
    onUpdateSettings({
      ...settings,
      narratorVolume: val,
    });
  };

  const setLanguage = (selectedLang: Language) => {
    setProcessingKey(`lang-${selectedLang}`);
    audio.playSfx('click', settings);
    const updatedSettings: GameSettings = {
      ...settings,
      language: selectedLang,
    };
    onUpdateSettings(updatedSettings);
    // Speak in the newly selected language!
    audio.speakNarrator('languageChange', updatedSettings);
    setTimeout(() => setProcessingKey(null), 200);
  };

  const handleNameBlur = () => {
    const trimmed = playerNameInput.trim();
    if (trimmed && trimmed !== settings.playerName) {
      onUpdateSettings({
        ...settings,
        playerName: trimmed,
      });
    }
  };

  const handleBackWithAnimation = () => {
    setProcessingKey('back');
    handleNameBlur();
    audio.playSfx('click', settings);
    audio.speakNarrator('returnMenu', settings);
    setTimeout(() => {
      onBack();
    }, 120);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-6 bg-slate-950 text-white overflow-hidden select-none">
      {/* Top Header */}
      <div className="w-full max-w-sm flex items-center justify-between z-10 pt-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 450, damping: 20 }}
          onClick={handleBackWithAnimation}
          className={`p-2.5 rounded-xl border transition-all shadow-md flex items-center gap-1 text-xs font-semibold cursor-pointer ${
            processingKey === 'back'
              ? 'bg-slate-800 border-cyan-400 text-white ring-1 ring-cyan-400'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          {processingKey === 'back' ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : (
            <ArrowLeft className="w-4 h-4" />
          )}
          <span>{processingKey === 'back' ? 'VOLTANDO...' : t('back')}</span>
        </motion.button>

        <h2 className="text-sm font-extrabold text-slate-300 tracking-wider uppercase">
          {t('settingsTitle')}
        </h2>
      </div>

      {/* Main Form */}
      <div className="w-full max-w-sm flex flex-col gap-3 my-auto z-10 my-4 max-h-[65vh] overflow-y-auto pr-1">
        {/* Player Name Input */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-md">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>{t('playerName')}</span>
          </label>
          <input
            type="text"
            maxLength={20}
            value={playerNameInput}
            onChange={(e) => setPlayerNameInput(e.target.value)}
            onBlur={handleNameBlur}
            placeholder={t('enterYourName')}
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 text-white font-bold text-xs rounded-xl py-2.5 px-3 outline-none"
          />
        </div>

        {/* Music Volume */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <div className="flex items-center gap-2">
              {settings.musicVolume > 0 ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span>{t('bgMusic')}</span>
            </div>
            <span className="text-cyan-400">{Math.round(settings.musicVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.musicVolume}
            onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
          />
        </div>

        {/* SFX Volume */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <div className="flex items-center gap-2">
              {settings.sfxVolume > 0 ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span>{t('sfxSound')}</span>
            </div>
            <span className="text-cyan-400">{Math.round(settings.sfxVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.sfxVolume}
            onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
          />
        </div>

        {/* Narrator Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              {settings.narratorEnabled ? (
                <Mic className="w-4 h-4 text-amber-400" />
              ) : (
                <MicOff className="w-4 h-4 text-slate-500" />
              )}
              <span>{t('fastNarrator')}</span>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleNarrator}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                settings.narratorEnabled
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {processingKey === 'narrator' && <Loader2 className="w-3 h-3 animate-spin inline" />}
              <span>{settings.narratorEnabled ? t('on') : t('off')}</span>
            </motion.button>
          </div>

          {settings.narratorEnabled && (
            <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>{t('narratorVol')}</span>
                  <span className="text-amber-400">{Math.round(settings.narratorVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.narratorVolume}
                  onChange={(e) => handleNarratorVolChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                />
              </div>

              {/* Speed Buttons & Test Voice */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-slate-400">{t('voiceSpeed')}</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { spd: 1.0, label: 'Normal (1.0x)' },
                    { spd: NARRATOR_SPEED, label: `Arcade (${NARRATOR_SPEED}x)` },
                  ].map(({ spd, label }) => {
                    const isSelected = Math.abs((settings.narratorSpeed ?? NARRATOR_SPEED) - spd) < 0.05;
                    const speedKey = `spd-${spd}`;
                    return (
                      <motion.button
                        key={spd}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => {
                          setProcessingKey(speedKey);
                          audio.playSfx('click', settings);
                          const updatedSettings = {
                            ...settings,
                            narratorSpeed: spd,
                          };
                          onUpdateSettings(updatedSettings);
                          narratorService.testVoice(playerNameInput || settings.playerName || 'Léo', settings.language || 'pt', updatedSettings);
                          setTimeout(() => setProcessingKey(null), 150);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm shadow-amber-500/20'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {processingKey === speedKey && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
                        <span>{label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Personality Buttons */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[11px] font-semibold text-slate-400">Tom do Narrador</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'aleatorio', label: '🔀 Aleatório' },
                      { id: 'irritante', label: '⚡ Irritante' },
                      { id: 'engracado', label: '😂 Engraçado' },
                      { id: 'carinhoso', label: '🥰 Carinhoso' },
                      { id: 'timido', label: '😳 Tímido' },
                    ].map(({ id, label }) => {
                      const isSelected = (settings.narratorPersonality || 'aleatorio') === id;
                      const persKey = `pers-${id}`;
                      return (
                        <motion.button
                          key={id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => {
                            setProcessingKey(persKey);
                            audio.playSfx('click', settings);
                            const updatedSettings = {
                              ...settings,
                              narratorPersonality: id as any,
                            };
                            onUpdateSettings(updatedSettings);
                            narratorService.speak(id as any, updatedSettings, 5);
                            setTimeout(() => setProcessingKey(null), 150);
                          }}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-extrabold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm shadow-amber-500/20'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {processingKey === persKey && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
                          <span>{label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* TESTAR VOZ Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                  onClick={() => {
                    setProcessingKey('test-voice');
                    audio.playSfx('click', settings);
                    narratorService.testVoice(playerNameInput || settings.playerName || 'Léo', settings.language || 'pt', settings);
                    setTimeout(() => setProcessingKey(null), 300);
                  }}
                  className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-black tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm uppercase mt-1 cursor-pointer"
                >
                  {processingKey === 'test-voice' ? (
                    <>
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      <span className="animate-pulse">PROCESSANDO VOZ...</span>
                    </>
                  ) : (
                    <>
                      <VolumeIcon className="w-4 h-4 text-amber-400" />
                      <span>TESTAR VOZ</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Night Mode Card (Desafio Secreto) */}
        {(() => {
          const nmStatus = getNightModeStatus();
          const isUnlocked = nmStatus.unlocked;
          const isActive = settings.nightModeEnabled ?? nmStatus.active;

          const toggleNightMode = () => {
            if (!isUnlocked) {
              audio.playSfx('click', settings);
              return;
            }
            setProcessingKey('night-mode');
            audio.playSfx('click', settings);
            const nextActive = !isActive;
            setNightModeActive(nextActive);
            onUpdateSettings({
              ...settings,
              nightModeEnabled: nextActive,
            });
            setTimeout(() => setProcessingKey(null), 150);
          };

          return (
            <div className={`rounded-2xl p-4 flex flex-col gap-2.5 shadow-md border transition-all ${
              isUnlocked
                ? isActive
                  ? 'bg-slate-900/95 border-indigo-500/50 shadow-indigo-500/10 shadow-lg'
                  : 'bg-slate-900/90 border-slate-800'
                : 'bg-slate-950/80 border-slate-800/80 opacity-90'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <div className={`p-1.5 rounded-lg ${isUnlocked ? (isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400') : 'bg-slate-800/60 text-slate-500'}`}>
                    <Moon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5">
                      {t('nightMode')}
                      {isUnlocked && (
                        <span className="text-[9px] font-extrabold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-md border border-indigo-500/30 uppercase">
                          Desbloqueado
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {isUnlocked
                        ? t('nightModeDesc')
                        : t('nightModeSecretDesc')}
                    </span>
                  </div>
                </div>

                {isUnlocked ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={toggleNightMode}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {processingKey === 'night-mode' && <Loader2 className="w-3 h-3 animate-spin inline" />}
                    <span>{isActive ? t('on') : t('off')}</span>
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60 text-[11px] font-bold text-amber-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{nmStatus.consecutive500}/3</span>
                  </div>
                )}
              </div>

              {!isUnlocked && (
                <div className="mt-1 pt-2 border-t border-slate-800/60 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span className="text-amber-400/90 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400 inline" />
                      Desafio Secreto: 3 partidas seguidas &gt; 500 pts
                    </span>
                    <span className="text-amber-400">{nmStatus.consecutive500}/3</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex gap-1 p-0.5 border border-slate-800">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 h-full rounded-full transition-all duration-300 ${
                          nmStatus.consecutive500 >= step
                            ? 'bg-gradient-to-r from-amber-500 to-indigo-500 shadow-sm shadow-amber-500/50'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Vibration Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleVibration}
          className="w-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between text-left shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            {processingKey === 'vibration' ? (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : (
              <Smartphone className="w-4 h-4 text-cyan-400" />
            )}
            <span>{t('vibration')}</span>
          </div>
          <span className="text-[11px] font-extrabold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            {settings?.vibrationEnabled ? t('on') : t('off')}
          </span>
        </motion.button>

        {/* 8-Language Grid Selection */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>{t('language')}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {availableLanguages.map((l) => {
              const isSelected = settings?.language === l;
              const isProcessingLang = processingKey === `lang-${l}`;
              return (
                <motion.button
                  key={l}
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.90 }}
                  onClick={() => setLanguage(l)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer ${
                    isProcessingLang
                      ? 'bg-purple-600/40 border-purple-300 text-white ring-1 ring-purple-400 scale-105'
                      : isSelected
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md shadow-purple-500/20 scale-105'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm">
                    {isProcessingLang ? '⏳' : getLanguageFlag(l)}
                  </span>
                  <span className="uppercase text-[9px]">
                    {isProcessingLang ? '...' : l}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Reset Progress Section */}
        <div className="mt-2">
          {showConfirmReset ? (
            <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex flex-col gap-3">
              <span className="text-xs font-bold text-rose-300 text-center">
                {t('resetConfirmMsg')}
              </span>
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    setProcessingKey('reset-cancel');
                    setShowConfirmReset(false);
                    setTimeout(() => setProcessingKey(null), 100);
                  }}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  {t('cancel')}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    setProcessingKey('reset-confirm');
                    onResetData();
                    setShowConfirmReset(false);
                    setTimeout(() => setProcessingKey(null), 200);
                  }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  {processingKey === 'reset-confirm' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{t('confirm')}</span>
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setProcessingKey('reset-open');
                setShowConfirmReset(true);
                setTimeout(() => setProcessingKey(null), 100);
              }}
              className="w-full py-3 bg-slate-900 border border-rose-900/40 hover:border-rose-700 text-rose-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              {processingKey === 'reset-open' ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{t('resetProgress')}</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
