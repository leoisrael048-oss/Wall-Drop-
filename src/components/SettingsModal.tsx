import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, VolumeX, Mic, MicOff, Smartphone, Globe, RefreshCw, User, Volume2 as VolumeIcon } from 'lucide-react';
import { GameSettings, Language } from '../types';
import { audio } from '../utils/audio';
import { narratorService } from '../services/narratorService';
import { NARRATOR_SPEED } from '../services/narratorConfig';
import { getTranslation, getLanguageFlag } from '../utils/i18n';

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

  const availableLanguages: Language[] = ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'zh'];

  useEffect(() => {
    audio.speakNarrator('settingsOpen', settings);
  }, []);

  const toggleNarrator = () => {
    audio.playSfx('click', settings);
    onUpdateSettings({
      ...settings,
      narratorEnabled: !settings.narratorEnabled,
    });
  };

  const toggleVibration = () => {
    audio.playSfx('click', settings);
    onUpdateSettings({
      ...settings,
      vibrationEnabled: !settings.vibrationEnabled,
    });
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
    audio.playSfx('click', settings);
    const updatedSettings: GameSettings = {
      ...settings,
      language: selectedLang,
    };
    onUpdateSettings(updatedSettings);
    // Speak in the newly selected language!
    audio.speakNarrator('languageChange', updatedSettings);
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

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-6 bg-slate-950 text-white overflow-hidden select-none">
      {/* Top Header */}
      <div className="w-full max-w-sm flex items-center justify-between z-10 pt-2">
        <button
          onClick={() => {
            handleNameBlur();
            audio.playSfx('click', settings);
            audio.speakNarrator('returnMenu', settings);
            onBack();
          }}
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 shadow-md flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

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

            <button
              onClick={toggleNarrator}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                settings.narratorEnabled
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {settings.narratorEnabled ? t('on') : t('off')}
            </button>
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
                    return (
                      <button
                        key={spd}
                        onClick={() => {
                          audio.playSfx('click', settings);
                          const updatedSettings = {
                            ...settings,
                            narratorSpeed: spd,
                          };
                          onUpdateSettings(updatedSettings);
                          narratorService.testVoice(playerNameInput || settings.playerName || 'Léo', settings.language || 'pt', updatedSettings);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm shadow-amber-500/20'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {label}
                      </button>
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
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            audio.playSfx('click', settings);
                            const updatedSettings = {
                              ...settings,
                              narratorPersonality: id as any,
                            };
                            onUpdateSettings(updatedSettings);
                            narratorService.speak(id as any, updatedSettings, 5);
                          }}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-extrabold border transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm shadow-amber-500/20'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TESTAR VOZ Button */}
                <button
                  type="button"
                  onClick={() => {
                    audio.playSfx('click', settings);
                    narratorService.testVoice(playerNameInput || settings.playerName || 'Léo', settings.language || 'pt', settings);
                  }}
                  className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-black tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm uppercase mt-1"
                >
                  <VolumeIcon className="w-4 h-4 text-amber-400" />
                  <span>TESTAR VOZ</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vibration Button */}
        <button
          onClick={toggleVibration}
          className="w-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between text-left shadow-md transition-all active:scale-95"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>{t('vibration')}</span>
          </div>
          <span className="text-[11px] font-extrabold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            {settings?.vibrationEnabled ? t('on') : t('off')}
          </span>
        </button>

        {/* 8-Language Grid Selection */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>{t('language')}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {availableLanguages.map((l) => {
              const isSelected = settings?.language === l;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center gap-0.5 border transition-all ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md shadow-purple-500/20 scale-105'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm">{getLanguageFlag(l)}</span>
                  <span className="uppercase text-[9px]">{l}</span>
                </button>
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
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => {
                    onResetData();
                    setShowConfirmReset(false);
                  }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                >
                  {t('confirm')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-3 bg-slate-900 border border-rose-900/40 hover:border-rose-700 text-rose-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('resetProgress')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
