import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Share2, Download, X, Film, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { GameSettings, DeathReplayData } from '../types';
import { audio } from '../utils/audio';
import { replayRecorder } from '../services/replayRecorder';

interface ReplayModalProps {
  replayData: DeathReplayData | null;
  settings: GameSettings;
  onClose: () => void;
}

export const ReplayModal: React.FC<ReplayModalProps> = ({
  replayData,
  settings,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isProcessingShare, setIsProcessingShare] = useState<boolean>(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  const totalFrames = replayData?.frames ? replayData.frames.length : 0;

  // Replay playback loop
  useEffect(() => {
    if (!replayData || totalFrames === 0) {
      console.warn('[ReplayModal] Replay indisponível para reprodução:', {
        hasData: Boolean(replayData),
        totalFrames,
      });
      return;
    }

    let frame = 0;
    let running = true;
    const frameInterval = 1000 / 30; // 30 FPS

    const loop = (timestamp: number) => {
      if (!running) return;

      if (isPlaying) {
        if (timestamp - lastFrameTimeRef.current >= frameInterval) {
          lastFrameTimeRef.current = timestamp;

          if (canvasRef.current && replayData && replayData.frames && replayData.frames.length > 0) {
            try {
              replayRecorder.renderReplayFrameWithOverlay(canvasRef.current, frame, replayData);
              setCurrentFrame(frame);
            } catch (renderErr) {
              console.warn('[ReplayModal] Erro ao renderizar frame:', renderErr);
            }
          }

          frame++;
          if (frame >= totalFrames) {
            frame = 0; // Loop seamlessly
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [replayData, isPlaying, totalFrames]);

  const handleTogglePlay = () => {
    audio.playSfx('click', settings);
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    audio.playSfx('click', settings);
    setCurrentFrame(0);
    if (canvasRef.current && replayData && replayData.frames && replayData.frames.length > 0) {
      try {
        replayRecorder.renderReplayFrameWithOverlay(canvasRef.current, 0, replayData);
      } catch (err) {
        console.warn('[ReplayModal] Erro ao reiniciar frame do replay:', err);
      }
    }
    setIsPlaying(true);
  };

  const handleShare = async () => {
    if (!replayData || isProcessingShare) return;
    audio.playSfx('click', settings);
    setIsProcessingShare(true);
    setShareStatus('Preparando vídeo de alta qualidade...');

    try {
      const result = await replayRecorder.shareReplay(replayData, (status) => {
        setShareStatus(status);
      });

      if (result.success) {
        setToastMessage(result.message);
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        setToastMessage(result.message || 'Erro ao compartilhar');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (e) {
      console.warn('[ReplayModal] Exceção durante compartilhamento de replay:', e);
      setToastMessage('Falha ao exportar replay. Tente novamente.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsProcessingShare(false);
      setShareStatus(null);
    }
  };

  const handleDownload = async () => {
    if (!replayData || isProcessingShare) return;
    audio.playSfx('click', settings);
    setIsProcessingShare(true);
    setShareStatus('Exportando vídeo em 30 FPS...');

    try {
      const { blob, mimeType } = await replayRecorder.generateVideoBlob(replayData, (pct) => {
        setShareStatus(`Exportando... ${pct}%`);
      });

      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `walldrop-death-replay-${replayData.score}pts.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      setToastMessage('Vídeo do replay baixado com sucesso! 🎬');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.warn('[ReplayModal] Falha ao exportar vídeo para download:', err);
      setToastMessage('Não foi possível gerar o arquivo de vídeo.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsProcessingShare(false);
      setShareStatus(null);
    }
  };

  if (!replayData || totalFrames === 0) {
    return (
      <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6 text-white select-none">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
        <h3 className="text-base font-bold mb-1">Replay Indisponível</h3>
        <p className="text-xs text-slate-400 text-center mb-4">
          A partida foi rápida demais ou não foi possível capturar os quadros.
        </p>
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
        >
          Voltar ao Jogo
        </button>
      </div>
    );
  }

  const progressPercent = totalFrames > 0 ? (currentFrame / totalFrames) * 100 : 0;

  return (
    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col justify-between items-center p-4 text-white select-none overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="w-full max-w-sm flex items-center justify-between z-10 pt-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/20 border border-cyan-400/40 rounded-lg text-cyan-400">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-1.5">
              Replay da Morte
              <span className="px-1.5 py-0.2 bg-rose-500/20 border border-rose-500/40 text-[9px] text-rose-300 font-extrabold rounded">
                30 FPS
              </span>
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              🎮 {replayData.score} PTS • {replayData.characterName}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            audio.playSfx('click', settings);
            onClose();
          }}
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95 shadow-md"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Replay Stage */}
      <div className="relative w-full max-w-xs aspect-[9/16] max-h-[56vh] bg-slate-900 border-2 border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center my-auto">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />

        {/* Play/Pause Overlay indicator when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
            <div className="p-3 bg-black/70 border border-cyan-400/50 rounded-full text-cyan-300 shadow-xl backdrop-blur-sm">
              <Play className="w-6 h-6 fill-current" />
            </div>
          </div>
        )}

        {/* Timeline Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-950/80">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-rose-500 transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Player Controls Bar */}
      <div className="w-full max-w-sm flex flex-col gap-2.5 z-10">
        {/* Playback Controls */}
        <div className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl shadow-inner">
          <button
            onClick={handleRestart}
            className="p-2 text-slate-400 hover:text-white transition-all active:scale-90"
            title="Reiniciar Replay"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="p-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 rounded-full transition-all active:scale-95 shadow"
            title={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <span className="text-[10px] font-mono font-bold text-slate-400">
            {currentFrame + 1}/{totalFrames} frames
          </span>
        </div>

        {/* Share & Download Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-2">
          <button
            onClick={handleShare}
            disabled={isProcessingShare}
            className="flex items-center justify-center gap-2 py-3 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/50 active:scale-95 transition-all disabled:opacity-50"
          >
            {isProcessingShare ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={isProcessingShare}
            className="flex items-center justify-center gap-2 py-3 px-3 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Baixar Vídeo</span>
          </button>
        </div>

        {/* Loading / Status Bar */}
        {shareStatus && (
          <div className="w-full flex items-center justify-center gap-2 text-[10px] font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 rounded-lg py-1.5 px-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{shareStatus}</span>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-lg py-1.5 px-2 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
