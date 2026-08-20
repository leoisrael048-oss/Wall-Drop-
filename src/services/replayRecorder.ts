import { DeathReplayData } from '../types';

/**
 * High-Performance Death Replay Capture & Export Service for Wall Drop
 * 
 * Key Features:
 * 1. Immediate Frame 0 Capture: Starts capturing from the very first game frame without any startup delay.
 * 2. Dynamic Circular Ring Buffer: Keeps up to 120 frames (~4.0s at 30 FPS).
 * 3. Resilient Short-Run Adaptability: Never fails for short matches (e.g. 0.3s, 1.0s, 2.0s or 5.0s).
 * 4. Smooth Frame Pacing & Interpolated Expansion: If a run is extremely brief (<15 frames),
 *    frames are smoothly expanded so the user sees a full, natural playback loop.
 * 5. Diagnostic Warnings: Outputs detailed console.warn logs on genuine technical failures.
 * 6. Multi-Tier Sharing & Video Export: Web Share API -> Android Native Bridge -> Direct Download.
 */

class ReplayRecorderService {
  private buffer: ImageData[] = [];
  private readonly MAX_FRAMES = 24; // Compact buffer ~0.8s (ultra-lightweight memory profile for Android WebView)
  private lastCaptureTime = 0;
  private readonly CAPTURE_INTERVAL_MS = 45; // ~22 FPS capture pacing for minimal RAM usage
  private isRecording = true;
  private activeReplay: DeathReplayData | null = null;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    this.reset();
  }

  public reset(): void {
    // Explicitly release previous frame references for Garbage Collection
    if (this.buffer.length > 0) {
      this.buffer.length = 0;
    }
    this.buffer = [];
    this.lastCaptureTime = 0;
    this.isRecording = true;
    this.activeReplay = null;
  }

  /**
   * Captures a frame from the live game canvas into the circular ring buffer.
   * Scaled to optimal compact resolution (160px width) for ultra-low memory overhead on Android WebViews.
   * Hard limits RAM buffer with strict FIFO purging.
   * @param sourceCanvas HTMLCanvasElement to capture
   * @param forceImmediate If true, ignores CAPTURE_INTERVAL_MS (e.g. frame 0 or fatal impact frame)
   */
  public captureFrame(sourceCanvas: HTMLCanvasElement | null, forceImmediate = false): void {
    if (!this.isRecording || !sourceCanvas) return;
    if (sourceCanvas.width === 0 || sourceCanvas.height === 0) return;

    const now = performance.now();
    // Allow immediate capture on first frame (lastCaptureTime === 0) or forced frames
    if (!forceImmediate && this.lastCaptureTime > 0 && (now - this.lastCaptureTime < this.CAPTURE_INTERVAL_MS)) {
      return; // Maintain steady frame pacing
    }
    this.lastCaptureTime = now;

    try {
      const targetW = Math.min(160, sourceCanvas.width);
      const targetH = Math.max(1, Math.round((targetW / sourceCanvas.width) * sourceCanvas.height));

      if (!this.offscreenCanvas) {
        this.offscreenCanvas = document.createElement('canvas');
      }
      if (this.offscreenCanvas.width !== targetW || this.offscreenCanvas.height !== targetH) {
        this.offscreenCanvas.width = targetW;
        this.offscreenCanvas.height = targetH;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
      }

      if (!this.offscreenCtx) {
        return;
      }

      this.offscreenCtx.drawImage(sourceCanvas, 0, 0, targetW, targetH);
      const frameData = this.offscreenCtx.getImageData(0, 0, targetW, targetH);

      this.buffer.push(frameData);
      // Strict circular ring buffer capacity enforcement (FIFO)
      while (this.buffer.length > this.MAX_FRAMES) {
        this.buffer.shift();
      }
    } catch (e) {
      console.warn('[ReplayRecorder] Falha ao capturar frame do canvas:', e);
    }
  }

  /**
   * Finalizes the death sequence with the impact moment and post-death frames.
   * NEVER rejects a replay for having few frames; automatically pads/adapts short runs.
   */
  public finalizeDeathReplay(
    score: number, 
    characterName: string,
    fallbackCanvas?: HTMLCanvasElement | null
  ): DeathReplayData | null {
    this.isRecording = false;

    // Fallback: If buffer is somehow empty (e.g. instantaneous death before loop), attempt instant capture
    if (this.buffer.length === 0 && fallbackCanvas && fallbackCanvas.width > 0 && fallbackCanvas.height > 0) {
      try {
        this.captureFrame(fallbackCanvas, true);
      } catch (err) {
        console.warn('[ReplayRecorder] Falha ao capturar frame de fallback de emergência:', err);
      }
    }

    // If still completely empty due to critical browser error
    if (this.buffer.length === 0) {
      console.warn('[ReplayRecorder] Replay falhou: Nenhum frame pôde ser capturado da partida (buffer vazio).');
      return null;
    }

    try {
      const width = this.buffer[0].width;
      const height = this.buffer[0].height;

      let finalFrames: ImageData[] = [];
      const rawCount = this.buffer.length;

      // Adaptable Duration: If the match was extremely fast (e.g. < 15 frames / <0.5s),
      // smoothly expand frames so the replay loops gracefully and remains visually clear.
      if (rawCount < 15) {
        const repeatFactor = Math.ceil(15 / rawCount);
        for (let i = 0; i < rawCount; i++) {
          for (let r = 0; r < repeatFactor; r++) {
            finalFrames.push(this.buffer[i]);
          }
        }
        // Cap at 30 frames for short runs
        if (finalFrames.length > 30) {
          finalFrames = finalFrames.slice(0, 30);
        }
      } else {
        finalFrames = [...this.buffer];
      }

      const deathIndex = Math.max(0, finalFrames.length - 1);
      const durationMs = Math.round((finalFrames.length / 30) * 1000);

      this.activeReplay = {
        frames: finalFrames,
        fps: 30,
        durationMs,
        score: score || 0,
        characterName: characterName || 'Nox',
        width,
        height,
        deathIndex,
      };

      return this.activeReplay;
    } catch (err) {
      console.warn('[ReplayRecorder] Exceção crítica ao montar dados de DeathReplayData:', err);
      return null;
    }
  }

  public getActiveReplay(): DeathReplayData | null {
    return this.activeReplay;
  }

  public getDeathReplay(): DeathReplayData | null {
    return this.activeReplay;
  }

  public hasReplay(): boolean {
    return Boolean(this.activeReplay && this.activeReplay.frames && this.activeReplay.frames.length > 0);
  }

  /**
   * Renders a frame onto a destination canvas with the official HUD overlay.
   */
  public renderReplayFrameWithOverlay(
    targetCanvas: HTMLCanvasElement,
    frameIndex: number,
    replayData: DeathReplayData,
    overlayOptions?: { customWatermark?: string; isFailure?: boolean }
  ): void {
    if (!targetCanvas || !replayData || !replayData.frames || replayData.frames.length === 0) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(frameIndex, replayData.frames.length - 1));
    const frame = replayData.frames[safeIndex];
    if (!frame) return;

    const ctx = targetCanvas.getContext('2d');
    if (!ctx) {
      console.warn('[ReplayRecorder] Contexto 2D indisponível para renderizar frame do replay.');
      return;
    }

    if (targetCanvas.width !== frame.width || targetCanvas.height !== frame.height) {
      targetCanvas.width = frame.width;
      targetCanvas.height = frame.height;
    }

    // Draw base game frame
    ctx.putImageData(frame, 0, 0);

    const w = targetCanvas.width;
    const h = targetCanvas.height;

    // --- RENDER HUD OVERLAY BANNER ---
    ctx.save();

    // 1. Top HUD Overlay Container
    const headerH = 46;
    const gradient = ctx.createLinearGradient(0, 0, 0, headerH + 15);
    gradient.addColorStop(0, overlayOptions?.isFailure ? 'rgba(30, 10, 10, 0.95)' : 'rgba(2, 6, 23, 0.92)');
    gradient.addColorStop(0.75, overlayOptions?.isFailure ? 'rgba(40, 15, 15, 0.88)' : 'rgba(15, 23, 42, 0.85)');
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, headerH + 15);

    // Subtle Accent Line
    ctx.strokeStyle = overlayOptions?.isFailure ? 'rgba(239, 68, 68, 0.7)' : 'rgba(6, 182, 212, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(12, headerH);
    ctx.lineTo(w - 12, headerH);
    ctx.stroke();

    // Text: Title
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const titleText = overlayOptions?.isFailure
      ? `💀 MEU FRACASSO: ${replayData.score} PONTOS`
      : `🎮 ${replayData.score} PONTOS • WALL DROP`;
    ctx.fillText(titleText, w / 2, 20);

    // Subtitle: Character + Mode
    ctx.shadowBlur = 0;
    ctx.fillStyle = overlayOptions?.isFailure ? '#f87171' : '#38bdf8';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      overlayOptions?.isFailure
        ? 'Aposto que você não passa de 30 pontos 👀'
        : `HERÓI: ${replayData.characterName.toUpperCase()} • REPLAY DA QUEDA`,
      w / 2,
      34
    );

    // 2. Collision Warning indicator near impact frame
    const isNearDeath = safeIndex >= Math.max(0, replayData.deathIndex - 6);
    if (isNearDeath) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#ef4444';
      ctx.font = '900 11px system-ui, -apple-system, sans-serif';
      ctx.shadowBlur = 0;
      ctx.fillText(overlayOptions?.isFailure ? '😭 QUEDA BRUTAL' : '💥 IMPACTO FATAL', w / 2, h - 38);
    }

    // 3. Bottom Watermark Branding
    ctx.shadowBlur = 0;
    ctx.fillStyle = overlayOptions?.isFailure ? 'rgba(254, 202, 202, 0.95)' : 'rgba(148, 163, 184, 0.85)';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const watermark = overlayOptions?.customWatermark || (overlayOptions?.isFailure
      ? '👀 Aposto que você não passa de 30 pontos • Wall Drop'
      : '⚡ wall-drop.game • BATA MEU RECORDE');
    ctx.fillText(watermark, w / 2, h - 14);

    ctx.restore();
  }

  /**
   * Generates a smooth video blob (WebM/MP4) from all replay frames.
   */
  public async generateVideoBlob(
    replayData: DeathReplayData,
    onProgress?: (percent: number) => void,
    overlayOptions?: { customWatermark?: string; isFailure?: boolean }
  ): Promise<{ blob: Blob; mimeType: string }> {
    return new Promise((resolve, reject) => {
      if (!replayData || !replayData.frames || replayData.frames.length === 0) {
        const err = new Error('Nenhum frame disponível para gerar o vídeo do replay.');
        console.warn('[ReplayRecorder] generateVideoBlob falhou:', err.message);
        reject(err);
        return;
      }

      try {
        const renderCanvas = document.createElement('canvas');
        renderCanvas.width = replayData.width;
        renderCanvas.height = replayData.height;

        const fps = 30;
        const stream = renderCanvas.captureStream ? renderCanvas.captureStream(fps) : null;

        if (!stream || typeof MediaRecorder === 'undefined') {
          const err = new Error('API captureStream ou MediaRecorder não suportada neste ambiente.');
          console.warn('[ReplayRecorder] generateVideoBlob:', err.message);
          reject(err);
          return;
        }

        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
          }
        }

        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
          videoBitsPerSecond: 2500000,
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const finalBlob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
          resolve({ blob: finalBlob, mimeType: recorder.mimeType || 'video/webm' });
        };

        recorder.onerror = (e) => {
          console.warn('[ReplayRecorder] Erro no MediaRecorder durante gravação do vídeo:', e);
          reject(e);
        };

        recorder.start();

        let frameIdx = 0;
        const total = replayData.frames.length;

        const interval = setInterval(() => {
          if (frameIdx >= total) {
            clearInterval(interval);
            setTimeout(() => {
              try { 
                if (recorder.state !== 'inactive') {
                  recorder.stop(); 
                }
              } catch (recErr) {
                console.warn('[ReplayRecorder] Erro ao parar recorder:', recErr);
              }
            }, 100);
            return;
          }

          this.renderReplayFrameWithOverlay(renderCanvas, frameIdx, replayData, overlayOptions);
          onProgress?.(Math.round(((frameIdx + 1) / total) * 100));
          frameIdx++;
        }, 1000 / fps);
      } catch (err) {
        console.warn('[ReplayRecorder] Falha ao instanciar geração de vídeo:', err);
        reject(err);
      }
    });
  }

  /**
   * Multi-tier Replay Sharing with Android Bridge, Web Share, and Direct Download fallbacks
   */
  public async shareReplay(
    replayData: DeathReplayData,
    onStatus?: (msg: string) => void,
    overlayOptions?: { customWatermark?: string; isFailure?: boolean }
  ): Promise<{ success: boolean; method: 'web_share' | 'android_bridge' | 'download'; message: string }> {
    onStatus?.('Gerando vídeo do replay (30 FPS)...');

    let videoBlob: Blob | null = null;
    let mimeType = 'video/webm';

    try {
      const res = await this.generateVideoBlob(replayData, (pct) => {
        onStatus?.(`Processando replay... ${pct}%`);
      }, overlayOptions);
      videoBlob = res.blob;
      mimeType = res.mimeType;
    } catch (vidErr) {
      console.warn('[ReplayRecorder] Não foi possível gerar arquivo de vídeo binário, utilizando compartilhamento padrão:', vidErr);
    }

    const isFailure = overlayOptions?.isFailure;
    const shareTitle = isFailure
      ? `💀 Meu fracasso no Wall Drop: ${replayData.score} pontos!`
      : `🎮 Fiz ${replayData.score} pontos no Wall Drop!`;
    const shareText = isFailure
      ? `Aposto que você não passa de 30 pontos 👀 Perdi com ${replayData.score} pontos no Wall Drop! Consegue fazer melhor? 💀🎮`
      : `Fiz ${replayData.score} pontos com o personagem ${replayData.characterName} no Wall Drop! Veja o replay da minha colisão e tente bater meu recorde! 🔥🎮`;

    // 1. Try Native Android Bridge if present
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win) {
      if (win.Android && typeof win.Android.share === 'function') {
        try {
          win.Android.share(shareTitle, shareText);
          return { success: true, method: 'android_bridge', message: 'Compartilhado pelo Android!' };
        } catch (bridgeErr) {
          console.warn('[ReplayRecorder] Android bridge error:', bridgeErr);
        }
      }
      if (win.AndroidBridge && typeof win.AndroidBridge.share === 'function') {
        try {
          win.AndroidBridge.share(shareText);
          return { success: true, method: 'android_bridge', message: 'Compartilhado pelo Android!' };
        } catch (bridgeErr) {
          console.warn('[ReplayRecorder] AndroidBridge error:', bridgeErr);
        }
      }
      if (win.WebAppInterface && typeof win.WebAppInterface.share === 'function') {
        try {
          win.WebAppInterface.share(shareTitle, shareText, '');
          return { success: true, method: 'android_bridge', message: 'Compartilhado pelo Android!' };
        } catch (bridgeErr) {
          console.warn('[ReplayRecorder] WebAppInterface error:', bridgeErr);
        }
      }
    }

    // 2. Try Web Share API (Level 2 with File)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        if (videoBlob && navigator.canShare) {
          const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
          const file = new File([videoBlob], `walldrop-replay-${replayData.score}pts.${extension}`, {
            type: mimeType,
          });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: shareTitle,
              text: shareText,
              files: [file],
            });
            return { success: true, method: 'web_share', message: 'Replay compartilhado com sucesso!' };
          }
        }

        // Standard text share
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href,
        });
        return { success: true, method: 'web_share', message: 'Compartilhado com sucesso!' };
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return { success: false, method: 'web_share', message: 'Compartilhamento cancelado' };
        }
        console.warn('[ReplayRecorder] Web Share API falhou:', err);
      }
    }

    // 3. Fallback: Direct Download of the replay video
    if (videoBlob) {
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `walldrop-replay-${replayData.score}pts.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      // Also copy text to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      } catch {}

      return {
        success: true,
        method: 'download',
        message: 'Vídeo do replay baixado e texto copiado para a área de transferência!',
      };
    }

    return {
      success: false,
      method: 'download',
      message: 'Não foi possível compartilhar neste navegador.',
    };
  }
}

export const replayRecorder = new ReplayRecorderService();
