import React, { useEffect } from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { GameSettings } from '../types';
import { audio } from '../utils/audio';
import { getTranslation } from '../utils/i18n';

interface PauseModalProps {
  settings: GameSettings;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  settings,
  onResume,
  onRestart,
  onHome,
  onToggleMute,
}) => {
  const lang = settings?.language || 'pt';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, lang);

  useEffect(() => {
    audio.speakNarrator('pause', settings);
  }, []);

  return (
    <div id="pause-modal-overlay" className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-white select-none animate-fadeIn">
      <div id="pause-modal-card" className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center gap-5 shadow-2xl">
        <div className="flex flex-col items-center">
          <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
            {t('pause')}
          </span>
          <h2 id="pause-modal-title" className="text-2xl font-black tracking-tight text-white mt-1">
            {t('gamePaused')}
          </h2>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            id="pause-resume-button"
            onClick={() => {
              audio.playSfx('click', settings);
              audio.speakNarrator('resume', settings);
              onResume();
            }}
            className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t('resume')}</span>
          </button>

          <button
            id="pause-restart-button"
            onClick={() => {
              audio.playSfx('click', settings);
              onRestart();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('restart')}</span>
          </button>

          <button
            id="pause-home-button"
            onClick={() => {
              audio.playSfx('click', settings);
              audio.speakNarrator('returnMenu', settings);
              onHome();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>{t('exitToMenu')}</span>
          </button>
        </div>

        {/* Quick Audio Mute Toggle */}
        <button
          id="pause-mute-toggle"
          onClick={onToggleMute}
          className="p-3 bg-slate-950 border border-slate-800 rounded-full text-slate-400 hover:text-white transition-all active:scale-90"
        >
          {settings.sfxVolume > 0 || settings.musicVolume > 0 ? (
            <Volume2 className="w-5 h-5 text-cyan-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-rose-500" />
          )}
        </button>
      </div>
    </div>
  );
};
