import React, { useEffect, useState, useRef } from 'react';
import { GameSettings } from '../types';
import { audio } from '../utils/audio';

interface IntroAnimationProps {
  settings: GameSettings;
  onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ settings, onComplete }) => {
  // Cinematic 14-second intro sequence:
  // 0–3.5s (Phase 0): Dark screen + atmospheric audio + Step 1 phrase
  // 3.5–7.0s (Phase 1): World & neon grid reveal + Step 2 phrase
  // 7.0–10.5s (Phase 2): Hero character drops with energy glow + Step 3 phrase (player name)
  // 10.5–13.8s (Phase 3): Logo WALL DROP appears with impact & Step 4 phrase
  // 13.8s - 14.3s (Phase 4): Fade out to menu
  const [phase, setPhase] = useState<number>(0);
  const [logoGlitch, setLogoGlitch] = useState<boolean>(false);
  const completedRef = useRef<boolean>(false);

  const finishIntro = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    audio.stopNarrator();
    onComplete();
  };

  useEffect(() => {
    // Initialize audio context and start smooth atmosphere
    audio.initCtx();
    audio.playSfx('intro_beep', settings);

    // 0.5s: Step 1 phrase (Atmosphere)
    const t0 = setTimeout(() => {
      audio.speakIntroStep(1, settings);
    }, 500);

    // 3.5s: Phase 1 (Neon grid reveal) + Step 2 phrase
    const t1 = setTimeout(() => {
      setPhase(1);
      audio.playSfx('switch', settings);
      audio.speakIntroStep(2, settings);
    }, 3500);

    // 7.0s: Phase 2 (Character drop) + Step 3 phrase (player name)
    const t2 = setTimeout(() => {
      setPhase(2);
      audio.playSfx('intro_impact', settings);
      audio.speakIntroStep(3, settings);
    }, 7000);

    // 10.5s: Phase 3 (Logo WALL DROP impact & glitch) + Step 4 phrase
    const t3 = setTimeout(() => {
      setPhase(3);
      setLogoGlitch(true);
      audio.playSfx('intro_glitch', settings);
      audio.speakIntroStep(4, settings);
      
      setTimeout(() => setLogoGlitch(false), 400);
    }, 10500);

    // 13.8s: Fade out transition
    const t4 = setTimeout(() => {
      setPhase(4);
    }, 13800);

    // 14.3s: Complete transition and enter menu
    const t5 = setTimeout(() => {
      finishIntro();
    }, 14300);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  return (
    <div
      id="intro-animation-overlay"
      onClick={finishIntro}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950 overflow-hidden transition-opacity duration-500 select-none cursor-pointer ${
        phase === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Cyber Grid */}
      <div id="intro-cyber-grid" className="absolute inset-0 opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Side Neon Wall Lines */}
      <div
        id="intro-side-wall-left"
        className={`absolute top-0 bottom-0 left-3 w-1.5 bg-gradient-to-b from-cyan-500 via-fuchsia-500 to-cyan-500 transition-all duration-300 shadow-[0_0_15px_#06b6d4] ${
          phase >= 1 ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
        }`}
      />
      <div
        id="intro-side-wall-right"
        className={`absolute top-0 bottom-0 right-3 w-1.5 bg-gradient-to-b from-fuchsia-500 via-cyan-500 to-fuchsia-500 transition-all duration-300 shadow-[0_0_15px_#d946ef] ${
          phase >= 1 ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
        }`}
      />

      {/* Discrete Energy Particles */}
      {phase >= 1 && (
        <div id="intro-particles-container" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-cyan-400 blur-[1px] animate-ping" />
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-fuchsia-400 blur-[1px] animate-ping" />
          <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
        </div>
      )}

      {/* Main Animation Stage */}
      <div id="intro-stage" className="relative flex flex-col items-center justify-center">
        {/* Character Drop (Phase 2+) */}
        <div
          id="intro-character-card"
          className={`relative mb-6 transition-all duration-500 transform ${
            phase >= 2
              ? 'translate-y-0 opacity-100 scale-100'
              : '-translate-y-48 opacity-0 scale-50'
          }`}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-600 p-0.5 shadow-[0_0_30px_rgba(6,182,212,0.8)] animate-bounce">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden relative">
              <div className="w-10 h-10 rounded-full bg-cyan-400/20 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_15px_#06b6d4]">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          {/* Luminous speed trail */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-1.5 h-16 bg-gradient-to-t from-cyan-400 to-transparent blur-[1px]" />
        </div>

        {/* Obstacles Flash (Phase 3+) */}
        {phase >= 3 && (
          <div id="intro-obstacles-flash" className="absolute w-full flex justify-between px-12 pointer-events-none">
            <div className="w-12 h-4 bg-red-500/80 rounded-r-lg border border-red-400 shadow-[0_0_15px_#ef4444] animate-pulse" />
            <div className="w-12 h-4 bg-red-500/80 rounded-l-lg border border-red-400 shadow-[0_0_15px_#ef4444] animate-pulse" />
          </div>
        )}

        {/* Phase 3: Logo WALLDROP Entry & Glitch */}
        <div
          id="intro-logo-stage"
          className={`transition-all duration-500 transform text-center relative ${
            phase >= 3
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-125 opacity-0 translate-y-6'
          }`}
        >
          {/* Glitch Overlay Effect - Strictly active on Logo Entrance */}
          {logoGlitch && (
            <div id="intro-glitch-box" className="absolute -inset-4 bg-cyan-500/30 mix-blend-difference rounded-xl animate-pulse pointer-events-none z-10" />
          )}

          <h1
            id="intro-logo-title"
            className={`text-4xl sm:text-5xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] ${
              logoGlitch ? 'translate-x-1 skew-x-3 filter contrast-150' : ''
            }`}
          >
            WALL<span className="text-fuchsia-400">DROP</span>
          </h1>
          <p id="intro-logo-subtitle" className="text-[10px] font-extrabold tracking-[0.3em] text-cyan-300 uppercase mt-1">
            ARCADE DESCENT
          </p>
        </div>
      </div>

      {/* Subtle Skip Hint */}
      <div id="intro-skip-button" className="absolute bottom-6 text-[11px] font-semibold tracking-wider text-slate-500/70 animate-pulse">
        TOCAR PARA PULAR
      </div>
    </div>
  );
};
