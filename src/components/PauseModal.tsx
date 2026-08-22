import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Loader2 } from 'lucide-react';
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
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  useEffect(() => {
    audio.speakNarrator('pause', settings);
  }, []);

  const handleResumeClick = () => {
    setProcessingKey('resume');
    audio.playSfx('click', settings);
    audio.speakNarrator('resume', settings);
    setTimeout(() => {
      onResume();
    }, 120);
  };

  const handleRestartClick = () => {
    setProcessingKey('restart');
    audio.playSfx('click', settings);
    setTimeout(() => {
      onRestart();
    }, 120);
  };

  const handleHomeClick = () => {
    setProcessingKey('home');
    audio.playSfx('click', settings);
    audio.speakNarrator('returnMenu', settings);
    setTimeout(() => {
      onHome();
    }, 120);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      id="pause-modal-overlay" 
      className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-white select-none"
    >
      <motion.div 
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 350 }}
        id="pause-modal-card" 
        className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center gap-5 shadow-2xl"
      >
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
          <motion.button
            type="button"
            id="pause-resume-button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={handleResumeClick}
            className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {processingKey === 'resume' ? (
              <Loader2 className="w-5 h-5 fill-current animate-spin" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
            <span>{processingKey === 'resume' ? 'CONTINUANDO...' : t('resume')}</span>
          </motion.button>

          <motion.button
            type="button"
            id="pause-restart-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={handleRestartClick}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {processingKey === 'restart' ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-200" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            <span>{processingKey === 'restart' ? 'REINICIANDO...' : t('restart')}</span>
          </motion.button>

          <motion.button
            type="button"
            id="pause-home-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={handleHomeClick}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {processingKey === 'home' ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-200" />
            ) : (
              <Home className="w-4 h-4" />
            )}
            <span>{processingKey === 'home' ? 'VOLTANDO...' : t('exitToMenu')}</span>
          </motion.button>
        </div>

        {/* Quick Audio Mute Toggle */}
        <motion.button
          type="button"
          id="pause-mute-toggle"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          onClick={onToggleMute}
          className="p-3 bg-slate-950 border border-slate-800 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          {settings.sfxVolume > 0 || settings.musicVolume > 0 ? (
            <Volume2 className="w-5 h-5 text-cyan-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-rose-500" />
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
