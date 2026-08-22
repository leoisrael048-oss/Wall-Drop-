import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Download, Copy, Check, Share2, MessageCircle, Send, Twitter, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { GameSettings } from '../types';
import { audio } from '../utils/audio';
import { getTranslation } from '../utils/i18n';

interface ShareCardModalProps {
  score: number;
  highScore: number;
  characterName: string;
  settings: GameSettings;
  onBack: () => void;
}

// Resilient clipboard helper for all environments (including sandboxed iframes & webviews)
async function copyToClipboardSafe(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback to legacy execCommand if clipboard API is blocked
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.warn('Clipboard copy failed:', err);
    return false;
  }
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  score,
  highScore,
  characterName,
  settings,
  onBack,
}) => {
  const lang = settings?.language || 'pt';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, lang);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cardImageSrc, setCardImageSrc] = useState<string | null>(null);

  const isNewRecord = score >= highScore && score > 0;

  // Format share message template
  const shareText = t('shareCardText')
    .replace('{score}', score.toString())
    .replace('{character}', characterName)
    .replace('{highScore}', highScore.toString());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Render HD 2X Cyberpunk Result Card (800x500)
  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 500;

    // Dark Cyberpunk Background
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 500);
    bgGrad.addColorStop(0, '#070913');
    bgGrad.addColorStop(0.5, '#0d1326');
    bgGrad.addColorStop(1, '#1b0d2b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 500);

    // Subtle Neon Grid Lines
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 40; x < 800; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 500);
      ctx.stroke();
    }
    for (let y = 40; y < 500; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    // Outer Neon Border
    ctx.strokeStyle = isNewRecord ? '#fbbf24' : '#00f2ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 768, 468);

    // Inner subtle glow border
    ctx.strokeStyle = isNewRecord ? 'rgba(251, 191, 36, 0.3)' : 'rgba(0, 242, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, 748, 448);

    // Header Title: WALL DROP
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ WALL DROP ⚡', 400, 85);

    // Character pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(280, 110, 240, 36);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(280, 110, 240, 36);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 18px system-ui, sans-serif';
    ctx.fillText(`🎮 ${characterName.toUpperCase()}`, 400, 134);

    // Main Score Number
    ctx.fillStyle = isNewRecord ? '#fbbf24' : '#00f2ff';
    ctx.font = '900 96px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${score}`, 400, 250);

    // Score Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 20px system-ui, sans-serif';
    ctx.fillText(isNewRecord ? `🏆 ${t('newRecordBanner') || 'NOVO RECORDE!'}` : t('finalScore').toUpperCase(), 400, 295);

    // High Score Box
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(220, 335, 360, 60);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(220, 335, 360, 60);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 22px system-ui, sans-serif';
    ctx.fillText(`👑 ${t('record')}: ${highScore}`, 400, 372);

    // Footer Watermark
    ctx.fillStyle = '#64748b';
    ctx.font = '600 16px system-ui, sans-serif';
    ctx.fillText('Desvie das paredes na velocidade da luz! 🚀', 400, 440);

    try {
      setCardImageSrc(canvas.toDataURL('image/png'));
    } catch (e) {
      console.warn('Canvas export warning:', e);
    }
  };

  useEffect(() => {
    drawCard();
    // In case fonts take a tick to load
    const timer = setTimeout(drawCard, 100);
    return () => clearTimeout(timer);
  }, [score, highScore, characterName]);

  const handleCopyText = async () => {
    audio.playSfx('click', settings);
    const fullText = `${shareText}\n\n🕹️ Jogue Wall Drop agora!`;
    const ok = await copyToClipboardSafe(fullText);
    if (ok) {
      setCopied(true);
      showToast(t('copiedSuccess') || 'Texto copiado!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      showToast('Selecione e copie o texto');
    }
  };

  const handleDownloadImage = () => {
    audio.playSfx('click', settings);
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `wall-drop-score-${score}.png`;
      link.href = dataUrl;
      link.click();
      showToast('Imagem salva com sucesso!');
    } catch {
      showToast('Pressione e segure o cartão para salvar');
    }
  };

  const handleNativeShare = async () => {
    audio.playSfx('click', settings);
    const gameUrl = window.location.origin || 'https://walldrop.game';
    const textToShare = `${shareText}\n\n🕹️ Jogue agora: ${gameUrl}`;

    // 1. Check for native Android bridge
    const win = window as any;
    if (win.AndroidBridge && typeof win.AndroidBridge.share === 'function') {
      try {
        win.AndroidBridge.share(textToShare);
        showToast('Abrindo compartilhamento...');
        return;
      } catch (err) {
        console.warn('AndroidBridge share failed:', err);
      }
    }

    // 2. Web Share API (Mobile Browsers & PWAs)
    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: '⚡ WALL DROP - Recorde Neon!',
          text: textToShare,
          url: gameUrl,
        };

        const canvas = canvasRef.current;
        if (canvas && navigator.canShare) {
          try {
            const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
            if (blob) {
              const file = new File([blob], `walldrop-score-${score}.png`, { type: 'image/png' });
              if (navigator.canShare({ files: [file] })) {
                shareData.files = [file];
              }
            }
          } catch {
            // Proceed without file if blob conversion fails
          }
        }

        await navigator.share(shareData);
        showToast('Compartilhado com sucesso!');
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Navigator share error:', err);
        }
      }
    }

    // 3. Fallback: Copy full text to clipboard
    handleCopyText();
  };

  const handleWhatsAppShare = () => {
    audio.playSfx('click', settings);
    const gameUrl = window.location.origin || 'https://walldrop.game';
    const textToShare = `${shareText}\n\n🕹️ Jogue agora: ${gameUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = url;
    }
  };

  const handleTwitterShare = () => {
    audio.playSfx('click', settings);
    const gameUrl = window.location.origin || 'https://walldrop.game';
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(gameUrl)}`;
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = url;
    }
  };

  const handleTelegramShare = () => {
    audio.playSfx('click', settings);
    const gameUrl = window.location.origin || 'https://walldrop.game';
    const url = `https://t.me/share/url?url=${encodeURIComponent(gameUrl)}&text=${encodeURIComponent(shareText)}`;
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = url;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] bg-cyan-500 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-cyan-300 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Centered Modal Card Container */}
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center my-auto">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              audio.playSfx('click', settings);
              onBack();
            }}
            className="p-2 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all shadow-md flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back')}</span>
          </motion.button>

          <h2 className="text-xs font-black text-slate-200 tracking-widest uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('shareTitle')}</span>
          </h2>
        </div>

        {/* Card Preview Visual Display */}
        <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/40 mb-3 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 flex flex-col items-center text-center">
          {/* Subtle Cyber Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f2ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f2ff08_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {/* Neon Border Glow */}
          <div className={`absolute inset-0 rounded-2xl border-2 pointer-events-none ${isNewRecord ? 'border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'border-cyan-400/50 shadow-[0_0_20px_rgba(0,242,255,0.2)]'}`} />

          {/* Header Title */}
          <div className="relative z-10 text-xs font-black tracking-widest text-white uppercase flex items-center gap-1.5 mb-1 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            <span>⚡ WALL DROP ⚡</span>
          </div>

          {/* Character Badge */}
          <div className="relative z-10 px-3 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-bold text-[11px] mb-2 flex items-center gap-1">
            <span>🎮 {characterName}</span>
          </div>

          {/* Main Score Display */}
          <div className="relative z-10 flex flex-col items-center my-1">
            <span className={`text-5xl font-black tracking-tight drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] ${isNewRecord ? 'text-amber-300' : 'text-cyan-300'}`}>
              {score}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5">
              {isNewRecord ? `🏆 ${t('newRecordBanner') || 'NOVO RECORDE!'}` : t('finalScore')}
            </span>
          </div>

          {/* Record Display Box */}
          <div className="relative z-10 mt-2 px-4 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/40 flex items-center gap-1.5 shadow-inner">
            <span className="text-xs font-black text-amber-400">👑 {t('record')}: {highScore}</span>
          </div>

          {/* Hidden Canvas for High-Res 800x500 PNG Generation */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </div>

        {/* Text Preview Box */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 text-center font-medium mb-3 shadow-inner">
          "{shareText}"
        </div>

        {/* 1-Tap Social Share Buttons */}
        <div className="w-full grid grid-cols-3 gap-2 mb-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleWhatsAppShare}
            className="py-2.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleTelegramShare}
            className="py-2.5 px-2 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Send className="w-4 h-4 text-sky-400" />
            <span>Telegram</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleTwitterShare}
            className="py-2.5 px-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Twitter className="w-4 h-4 text-blue-400" />
            <span>X (Twitter)</span>
          </motion.button>
        </div>

        {/* Primary Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNativeShare}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all uppercase tracking-wider"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('shareNow')}</span>
          </motion.button>

          <div className="grid grid-cols-2 gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleCopyText}
              className="py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? t('copied') : t('copyText')}</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleDownloadImage}
              className="py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{t('downloadImage')}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
